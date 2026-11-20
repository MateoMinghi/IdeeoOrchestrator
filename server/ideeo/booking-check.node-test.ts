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
  const workspace=await launchIdeeoBookingFixture(join(pg.root,'workspace'),{calendar:true});
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
  const scopes=['conversation:read','conversation:write','inference:invoke','inference:disclose','tool:browser:interact','tool:booking:verify','tool:calendar:write','tool:calendar:read'];
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

  let lastAppendKey='';
  const ui=await preview({configFile:false,envFile:false,logLevel:'error',build:{outDir:bundle},
    plugins:[{name:'generated-tenant-token',configurePreviewServer(server){
      server.middlewares.use(async(req,res,next)=>{
        if(!req.url?.startsWith('/v2/')){next();return;}
        try{
          const key=req.headers['idempotency-key'];
          if(req.method==='POST' && req.url.endsWith('/turns')) lastAppendKey=String(key);
          const parts:Buffer[]=[];for await(const chunk of req) parts.push(chunk);
          const response=await fixtureFetch(product.url+req.url,{method:req.method,
            headers:{authorization:req.headers.authorization??'','content-type':'application/json',...(key?{'idempotency-key':String(key)}:{})},
            body:parts.length?Buffer.concat(parts).toString('utf8'):undefined,timeoutMs:70000});
          res.writeHead(response.status,{'content-type':'application/json','cache-control':'no-store'});res.end(await response.text());
        }catch{res.destroy();}
      });
      server.middlewares.use('/api/nico/token',(_req,res)=>{void proof().then(token=>{
        res.writeHead(200,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify({token}));
      }).catch(()=>res.destroy());});
    }}],preview:{host:'127.0.0.1',port:0}});
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
  await t.test('React adds the confirmed workshop to a private calendar and recovers a lost write reply',async()=>{
    await pg.admin`drop trigger reject_answer on ideeo.turns`;
    const send=async(text:string)=>{
      await page.until("document.querySelector('textarea') && !document.querySelector('textarea').disabled");
      await page.evaluate(`(()=>{const input=document.querySelector('textarea');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(input,${JSON.stringify(text)});input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
      const button="document.querySelector('button[aria-label=\"Send message\"]')";
      await page.until(button+' && !'+button+'.disabled');
      await page.evaluate(button+'.click()');
    };
    const prompt='Put the Willow Studio workshop on my calendar for Sunday, November 22, 2026, from 3 to 4 pm, Mexico City time. Leave the invitations to me.';
    const append=(key:string,issuer=tenant)=>api('/'+id+'/turns',{message:{text:prompt,disclosure:'model'}},key,issuer);
    const baseline=await counters();
    await send('Add the workshop to my calendar for Sunday.');
    await page.until("document.querySelector('[role=log]').textContent.includes('Which Sunday')");
    tenant.set({scopes:scopes.filter(s=>s!=='tool:calendar:write')});
    assert.equal((await append(randomUUID())).status,403);
    tenant.set({scopes});
    assert.equal((await append(randomUUID(),other)).status,403);
    assert.deepEqual(workspace.calendar.counters(),{writes:0,reads:0,events:0});
    workspace.calendar.dropNextResponse();
    await send(prompt);
    await page.until("document.querySelector('[role=status]').textContent.includes('check the event')");
    const original=lastAppendKey;
    assert.match(original,/^[a-f0-9-]{36}$/);
    const event=workspace.calendar.inspect(id);assert.ok(event);
    assert.match(event.event_id,/^CAL-[A-Z]{12}$/);
    assert.deepEqual(event,{event_id:event.event_id,title:'Willow Studio workshop',date:'2026-11-22',timeZone:'America/Mexico_City',
      start:'2026-11-22T21:00:00Z',end:'2026-11-22T22:00:00Z',confirmation,attendees:[]});
    const expired=await pg.admin`update ideeo.inference_operations o set deadline_at=clock_timestamp()-interval '1 second'
      where o.conversation_id=${id} and exists(select 1 from ideeo.inference_attempts a where (a.scope,a.id)=(o.scope,o.execution_id))
      returning deadline_at,request_key`;
    assert.equal(expired.length,1);
    await product.restart();
    tenant.set({grant:'revoked'});
    assert.equal((await append(original)).status,403);
    tenant.set({grant:'active',scopes:scopes.filter(s=>s!=='tool:calendar:read')});
    assert.equal((await append(original)).status,403);
    tenant.set({scopes});
    assert.equal((await append(original,other)).status,403);
    const [budget]=await pg.admin`select day,tool_attempts from ideeo.inference_budget where tenant_id='alpha' and day=(clock_timestamp() at time zone 'UTC')::date`;
    await pg.admin`update ideeo.inference_budget set tool_attempts=64 where tenant_id='alpha' and day=${budget.day}`;
    const denied=await append(original);
    assert.equal(denied.status,409);
    assert.equal((await denied.json() as {error:{code:string}}).error.code,'inference_budget_exhausted');
    await pg.admin`update ideeo.inference_budget set tool_attempts=${budget.tool_attempts} where tenant_id='alpha' and day=${budget.day}`;
    assert.deepEqual(workspace.calendar.counters(),{writes:1,reads:0,events:1});
    await send(prompt);
    await page.until("document.querySelector('[role=log]').textContent.includes("+JSON.stringify(event.event_id)+")");
    assert.equal(lastAppendKey,original);
    const [op]=await pg.admin`select deadline_at from ideeo.inference_operations where request_key=${expired[0].request_key}`;
    assert.equal(op.deadline_at.getTime(),expired[0].deadline_at.getTime());
    const committed=(await history(id)).turns.at(-1)!;
    assert.equal(committed.answer.kind,'workspace_calendar');assert.ok(committed.answer.text.includes(confirmation));
    assert.equal((await (await append(original)).json() as {turn_id:string}).turn_id,committed.turn_id);
    assert.deepEqual(workspace.calendar.inspect(id),event);
    assert.deepEqual(workspace.calendar.counters(),{writes:1,reads:1,events:1});
    assert.deepEqual(await counters(),{...baseline,tools:baseline.tools+2});
    tenant.set({scopes:scopes.filter(s=>s!=='tool:calendar:read')});
    assert.equal((await api('/'+id+'/turns')).status,403);
    tenant.set({scopes});
    await appendFile(report,JSON.stringify({phase:'calendar replay after lost reply',calendar:workspace.calendar.counters(),before:baseline,after:await counters()})+'\n');
    const created=await api('',{},randomUUID());assert.equal(created.status,200);
    const next=(await created.json() as ConversationView).conversation_id;
    model.setTool(messages=>{
      const last=messages.at(-1)!;
      if(last.role==='user') return {name:'agent_browser_open',args:{url:'https://workshop.invalid'}};
      if(last.content.includes('Reserve Sunday workshop')) return {name:'agent_browser_click',args:{selector:'button[type=submit]'}};
      if(!last.content.includes('WILLOW-')) return {name:'agent_browser_snapshot',args:{}};
    });
    model.setAnswer(messages=>'Reservation confirmed '+messages.at(-1)?.content.match(/WILLOW-[A-Z]{8}/)?.[0]+'.');
    assert.equal((await api('/'+next+'/turns',{message:{text:'Book the Willow Studio workshop.',disclosure:'model'}},randomUUID())).status,200);
    await workspace.closeConversation(next);
    const calendarTurn=(text:string)=>api('/'+next+'/turns',{message:{text,disclosure:'model'}},randomUUID());
    const mismatch=await calendarTurn(prompt.replace('November 22','November 29'));assert.equal(mismatch.status,200);
    assert.match((await mismatch.json() as {answer:{text:string}}).answer.text,/No calendar event was added/);
    assert.equal(workspace.calendar.inspect(next),undefined);
    const success=await calendarTurn(prompt);assert.equal(success.status,200);
    const otherEvent=workspace.calendar.inspect(next);assert.ok(otherEvent);
    assert.notEqual(otherEvent.event_id,event.event_id);assert.equal(otherEvent.confirmation,workspace.confirmation);
    assert.ok((await success.json() as {answer:{text:string}}).answer.text.includes(otherEvent.event_id));
    assert.deepEqual(workspace.calendar.counters(),{writes:2,reads:1,events:2});
  });
});
