import assert from 'node:assert/strict';
import test from 'node:test';
import { randomBytes, randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { appendFile, mkdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { preview } from 'vite';
import { launchIdeeoBookingFixture } from '../../scripts/testing/ideeo-booking-fixture.ts';
import { launchIdeeoFixture } from '../../scripts/testing/ideeo-fixture.ts';
import { launchModelFixture } from '../../scripts/testing/model-fixture.ts';
import { launchPostgresFixture } from '../../scripts/testing/postgres-fixture.ts';
import { fixtureFetch } from '../../scripts/testing/fixture-http.ts';
import { stopWithEvidence } from '../../scripts/testing/fixture-evidence.ts';
import type { BookingCheck, ConversationHistory, ConversationView, TurnStatus } from '../../shared/ideeo/conversations.ts';

test('Check booking recovers the exact reservation after a failed answer commit',async t=>{
  const report='output/ideeo-booking-check-'+randomUUID()+'.jsonl';
  t.diagnostic(report);
  const fixtures:{name:string;stop:()=>Promise<void>}[]=[];
  t.after(()=>stopWithEvidence(report,fixtures.reverse()));
  const pg=await launchPostgresFixture();
  fixtures.push({name:'PostgreSQL',stop:pg.stop});
  const bundle=join(pg.root,'ui');
  const vite=fileURLToPath(new URL('bin/vite.js',import.meta.resolve('vite/package.json')));
  await promisify(execFile)(process.execPath,[vite,'build','--config','vite.ideeo.config.ts','--outDir',bundle],{windowsHide:true});
  const workspace=await launchIdeeoBookingFixture(join(pg.root,'workspace'));
  fixtures.push({name:'browser workspace',stop:workspace.stop});
  const model=await launchModelFixture();
  fixtures.push({name:'model',stop:model.stop});
  const key=()=>randomBytes(32).toString('base64');
  const product=await launchIdeeoFixture({guardHostImports:true,startupTimeoutMs:10000,capabilities:[workspace.route],
    inference:{mode:'synthetic',url:model.url,model:'ideeo-fixture',credentialEnv:'MODEL',textMode:'free-form'},
    storage:{mode:'synthetic',databaseEnv:'DB',keyringEnv:'KEYS',fingerprintKeyEnv:'FINGERPRINT',activeKeyId:'first',contentTtlSeconds:600,replayTtlSeconds:1200},
    secrets:{DB:pg.runtimeUrl,KEYS:JSON.stringify({alpha:{first:key()},beta:{first:key()}}),FINGERPRINT:key(),MODEL:model.credential,
      WORKSPACE:workspace.credential,IDEEO_FREE_FORM_EVALUATION:'synthetic-content-only'}});
  fixtures.push({name:'product',stop:product.stop});
  const [tenant,other]=product.tenants;
  const scopes=['conversation:read','conversation:write','inference:invoke','inference:disclose','tool:browser:interact','tool:booking:verify'];
  tenant.set({scopes});other.set({scopes});
  const proof=(issuer=tenant)=>issuer.token('sdk',{scope:scopes.join(' ')});
  const api=async(path:string,body?:object,idem?:string,issuer=tenant)=>fixtureFetch(product.url+'/v2/conversations'+path,{
    method:body?'POST':'GET',headers:{authorization:'Bearer '+await proof(issuer),'content-type':'application/json',...(idem?{'idempotency-key':idem}:{})},
    body:body?JSON.stringify(body):undefined,timeoutMs:70000});
  await pg.admin`create sequence ideeo.failed_commits`;
  await pg.admin`grant usage on sequence ideeo.failed_commits to ideeo_runtime`;
  await pg.admin`create function public.reject_answer() returns trigger language plpgsql as $$ begin perform nextval('ideeo.failed_commits'); raise exception 'fixture commit failure'; end $$`;
  await pg.admin`create trigger reject_answer before insert on ideeo.turns for each row execute function public.reject_answer()`;
  const failedAppend=async(book:boolean)=>{
    const created=await api('',{},randomUUID());assert.equal(created.status,200);
    const {conversation_id:id}=await created.json() as ConversationView;
    const idem=randomUUID();
    let clicked=false;
    model.setTool(messages=>{
      const last=messages.at(-1)!;
      if(last.role==='user') return {name:'agent_browser_open',args:{url:'https://workshop.invalid'}};
      if(!clicked && last.content.includes('Willow Studio')) {
        clicked=true;return {name:'agent_browser_click',args:{selector:book?'button[type=submit]':'h1'}};
      }
      if(!clicked || book && !last.content.includes('WILLOW-')) return {name:'agent_browser_snapshot',args:{}};
    });
    model.setAnswer(messages=>book?'Reservation confirmed '+(messages.at(-1)?.content.match(/WILLOW-[A-Z]{8}/)?.[0]??'unknown')+'.':'Workshop inspected.');
    const response=await api('/'+id+'/turns',{message:{text:book?'Book the Willow Studio workshop.':'Inspect the workshop heading.',disclosure:'model'}},idem);
    const errorBody=await response.json() as {error?:{code:string}};
    await appendFile(report,JSON.stringify({phase:book?'booking append':'inspection append',http:response.status,error:errorBody.error?.code,
      events:workspace.events.map(e=>({name:e.name,status:e.status,hasForm:e.text?.includes('Reserve Sunday workshop'),hasConfirmation:e.text?.includes('WILLOW-')})),
      modelCalls:model.observations().calls,bookings:workspace.bookings()})+'\n');
    assert.equal(response.status,503);
    const [rejected]=await pg.admin`select last_value,is_called from ideeo.failed_commits`;
    assert.equal(rejected.is_called,true);assert.equal(Number(rejected.last_value),book?1:2);
    const status=await (await api('/'+id+'/turns/status',undefined,idem)).json() as TurnStatus;
    assert.equal(status.status,'reconciliation_required');
    await workspace.closeConversation(id);
    return {id,idem};
  };
  const {id,idem}=await failedAppend(true);
  assert.equal(workspace.bookings(),1);
  const confirmation=workspace.confirmation;
  const unmatched=await failedAppend(false);
  assert.equal(workspace.bookings(),1);
  await product.restart();
  const history=async(conversation:string)=>(await api('/'+conversation+'/turns')).json() as Promise<ConversationHistory>;
  const snapshot=await history(id);
  assert.deepEqual(snapshot.turns,[]);
  const [pending]=snapshot.booking_checks as BookingCheck[];
  assert.equal(pending.status,'pending');
  const check=(conversation:string,attempt:string,issuer=tenant)=>api('/'+conversation+'/turns/booking-check',{attempt_id:attempt},undefined,issuer);
  const checked=async(conversation:string,attempt:string)=>{
    const response=await check(conversation,attempt);assert.equal(response.status,200);
    return (await response.json() as {booking_check:BookingCheck}).booking_check;
  };
  const counters=async()=>{
    const [row]=await pg.admin`select count(*) filter(where kind='tool')::int as tools, count(*) filter(where kind='model')::int as models from ideeo.inference_attempts`;
    return {tools:Number(row.tools),models:Number(row.models),calls:model.observations().calls,actions:workspace.events.length,bookings:workspace.bookings(),reads:workspace.verificationReads()};
  };
  const before=await counters();
  tenant.set({scopes:scopes.filter(s=>s!=='tool:booking:verify')});
  assert.equal((await check(id,pending.attempt_id)).status,403);
  assert.equal((await history(id)).booking_checks,undefined);
  tenant.set({scopes,grant:'revoked'});
  assert.equal((await check(id,pending.attempt_id)).status,403);
  tenant.set({grant:'active'});
  assert.equal((await check(id,pending.attempt_id,other)).status,403);
  assert.equal((await check(unmatched.id,pending.attempt_id)).status,404);
  assert.deepEqual(await counters(),before);

  const ui=await preview({configFile:false,envFile:false,logLevel:'error',build:{outDir:bundle},
    plugins:[{name:'generated-tenant-token',configurePreviewServer(server){
      server.middlewares.use('/api/nico/token',(_req,res)=>{void proof().then(token=>{
        res.writeHead(200,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify({token}));
      }).catch(()=>res.destroy());});
    }}],preview:{host:'127.0.0.1',port:0,proxy:{'/v2':product.url}}});
  fixtures.push({name:'React preview',stop:()=>ui.close()});
  const address=ui.httpServer.address();assert.ok(address && typeof address!=='string');
  process.env.OMB_CDP_CHROME??=process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':'/usr/bin/google-chrome';
  const {openHeadlessChrome}=await import('../../scripts/testing/headless-chrome.ts');
  const profile=join(pg.root,'ui-chrome');await mkdir(profile);
  const page=await openHeadlessChrome(profile);
  fixtures.push({name:'React browser',stop:async()=>{page.close();}});
  await page.send('Page.navigate',{url:'http://127.0.0.1:'+address.port+'/ideeo.html#'+id});
  const button="Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Check booking')";
  await page.until(button);await page.evaluate(button+'.click()');
  const displayed="document.querySelector('[role=log]')?.textContent.includes("+JSON.stringify(confirmation)+")";
  await page.until(displayed);
  const after={...before,tools:before.tools+1,reads:1};
  assert.deepEqual(await counters(),after);
  await page.send('Page.reload');await page.until(displayed);
  const verified={attempt_id:pending.attempt_id,status:'verified',confirmation};
  assert.deepEqual(await checked(id,pending.attempt_id),verified);
  assert.deepEqual((await history(id)).booking_checks,[verified]);
  assert.deepEqual((await history(id)).turns,[]);
  assert.equal((await (await api('/'+id+'/turns/status',undefined,idem)).json() as TurnStatus).status,'reconciliation_required');
  assert.deepEqual(await counters(),after);
  await appendFile(report,JSON.stringify({phase:'verified receipt and cached replay',before,after})+'\n');
  const [saved]=await pg.admin`select receipt from ideeo.booking_checks where attempt_id=${pending.attempt_id}`;
  assert.equal(saved.receipt.v,1);assert.ok(!JSON.stringify(saved.receipt).includes(confirmation));
  const [missing]=(await history(unmatched.id)).booking_checks as BookingCheck[];
  const unknown={attempt_id:missing.attempt_id,status:'unable_to_verify'};
  assert.deepEqual(await checked(unmatched.id,missing.attempt_id),unknown);
  assert.deepEqual(await checked(unmatched.id,missing.attempt_id),unknown);
  assert.deepEqual(await counters(),{...after,tools:after.tools+1,reads:2});
  await appendFile(report,JSON.stringify({phase:'unmatched reference and cached replay',counters:await counters()})+'\n');
});
