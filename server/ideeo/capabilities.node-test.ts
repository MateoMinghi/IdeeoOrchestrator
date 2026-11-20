import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer, type Server } from 'node:http';
import { randomBytes, randomUUID } from 'node:crypto';
import { readFile, writeFile, mkdir, open, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCapabilityConfiguration, type CapabilityConfiguration } from './capability-config.ts';
import { createCapabilityExecutor } from './capability-executor.ts';
import { launchPostgresFixture } from '../../scripts/testing/postgres-fixture.ts';
import { launchIdeeoFixture } from '../../scripts/testing/ideeo-fixture.ts';
import { fixtureFetch } from '../../scripts/testing/fixture-http.ts';
import { launchIdeeoBrowserFixture } from '../../scripts/testing/ideeo-browser-fixture.ts';
import { workspaceFileTools } from './workspace-files.ts';
import { createCapabilities } from './capabilities.ts';

const scope={tenant_id:'alpha',membership_id:'member-1',client_id:'app',agent_account_id:'assistant-1',grant_id:'grant-1',channel:'sdk' as const,channel_binding_id:''};
const tool={name:'write_note',family:'files' as const,description:'Save an invented workshop note in the isolated workspace.',permission:'tool:files:write',
  inputSchema:{type:'object',properties:{text:{type:'string',minLength:1,maxLength:100}},required:['text'],additionalProperties:false}};
async function listen(server:Server){await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));const address=server.address();assert.ok(address&&typeof address!=='string');return `http://127.0.0.1:${address.port}`;}
async function close(server:Server){await new Promise<void>(resolve=>{server.close(()=>resolve());server.closeAllConnections();});}
test('capability configuration pins complete scope, schema, destination and permission',()=>{
  const route={scope,url:'http://127.0.0.1:32123/v1/ideeo/tools/call',credentialEnv:'WORKSPACE',tools:[tool]};
  assert.equal(parseCapabilityConfiguration([route],['alpha'])[0].tools[0].name,'write_note');
  for(const changed of [{...route,url:'https://example.invalid/v1/ideeo/tools/call'},{...route,scope:{...scope,tenant_id:'beta'}},{...route,scope:{...scope,channel_binding_id:'wrong'}},
    {...route,tools:[tool,tool]},{...route,tools:[{...tool,permission:'*'}]},{...route,tools:[{...tool,name:'call_tool'}]},{...route,tools:[{...tool,inputSchema:{$ref:'https://example.invalid/schema'}}]}])assert.throws(()=>parseCapabilityConfiguration([changed],['alpha']));
});

test('large catalogs retain OpenMaus discovery with scoped permission and accounting',async()=>{
  const tools=Array.from({length:41},(_,index)=>({...tool,name:`write_note_${index}`}));
  const registry=createCapabilities([{scope,url:'http://127.0.0.1:32123/v1/ideeo/tools/call',credentialEnv:'WORKSPACE',tools}],{WORKSPACE:'fixture-workspace-credential'});
  let reservations=0,finished=0;
  const mounted=registry.session({message:{text:'Find a workshop tool.',disclosure:'model'},history:[],signal:new AbortController().signal,execution:{scope,conversationId:randomUUID()},
    toolPermissions:['tool:files:write'],claimTools:async()=>{},checkpoint:async()=>{},authorize:async()=>{},
    reserve:async()=>{reservations++;return {id:randomUUID(),deadline:new Date(Date.now()+15000)};},finish:async()=>{finished++;}});
  try{
    assert.deepEqual(mounted.session.definitions.map(def=>def.function.name),['search_tools','describe_tool','call_tool']);
    const result=await mounted.session.execute('search_tools',{query:'save workshop note',limit:1},new AbortController().signal);
    assert.equal(result.ok,true);assert.match(result.text,/write_note_/);assert.equal(reservations,1);assert.equal(finished,1);
  }finally{await mounted.session.close();}
});
test('authenticated conversation executes scoped workspace tools through the OpenMaus loop',async t=>{
  const cleanup:Array<()=>Promise<void>>=[];
  t.after(async()=>{const errors:unknown[]=[];for(const stop of cleanup.reverse())try{await stop();}catch(error){errors.push(error);}if(errors.length)throw new AggregateError(errors,'Capability fixture cleanup failed');});
  const pg=await launchPostgresFixture();cleanup.push(()=>pg.stop());
  const workspace=join(pg.root,'workspace');await mkdir(workspace);const receipts=join(workspace,'receipts');await mkdir(receipts);
  let bookings=0;
  const site=createServer((req,res)=>{
    if(req.url==='/book'&&req.method==='POST'){bookings++;res.writeHead(200,{'content-type':'text/plain'});res.end('Booking recorded in fixture');return;}
    res.writeHead(200,{'content-type':'text/html'});res.end('<title>Invented workshop</title><h1>Willow Studio</h1><p id="status">Sunday workshop available</p><button id="book" onclick="fetch(\'/book\',{method:\'POST\'}).then(r=>r.text()).then(t=>document.querySelector(\'#status\').textContent=t)">Book workshop</button>');
  });
  const siteUrl=await listen(site);cleanup.push(()=>close(site));
  const browser=await launchIdeeoBrowserFixture(workspace,siteUrl);cleanup.push(()=>browser.close());
  const filesRoot=join(workspace,'files');await mkdir(filesRoot);const files=await workspaceFileTools(filesRoot);
  const credential=randomBytes(32).toString('hex'), modelKey=randomBytes(32).toString('hex');
  let effects=0,afterEffect:(()=>void)|undefined,toolName='write_note',toolArgs:Record<string,unknown>={text:'Workshop Sunday at three.'},prelude:string|null=null,batch=1,batchInvalid=false,textOnly=false;
  const registered=[tool,...browser.tools,...files.tools];
  const handlers=new Map([...browser.handlers,...files.handlers]);
  handlers.set('write_note',async(args)=>{effects++;await writeFile(join(workspace,'note.txt'),String(args.text));afterEffect?.();return 'The workshop note was saved.';});
  const executor=createCapabilityExecutor({scope,credential,tools:registered,claim:async id=>{try{const file=await open(join(receipts,id),'wx');await file.close();return true;}catch{return false;}},handlers});
  const endpoint=await listen(executor);cleanup.push(()=>close(executor));
  const observed:Record<string,unknown>[]=[];
  const model=createServer(async(req,res)=>{
    try{
      assert.equal(req.headers.authorization,`Bearer ${modelKey}`);
      const chunks:Buffer[]=[];for await(const chunk of req)chunks.push(chunk);
      const body=JSON.parse(Buffer.concat(chunks).toString('utf8'));observed.push(body);
      const last=body.messages.at(-1),didSearch=last.role==='tool'&&String(last.content).includes('matches');
      const call=!textOnly&&!Array.isArray(last.content)&&(last.role!=='tool'||didSearch);
      const name=toolName;
      const args=toolArgs;
      res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({choices:[{message:{role:'assistant',content:call?prelude:'The workshop note was saved.',
        ...(call?{tool_calls:Array.from({length:batch},(_,index)=>({id:`fixture-call-${didSearch?2:index+1}`,type:'function',function:{name,arguments:JSON.stringify(batchInvalid&&index===batch-1?{...args,unapproved:true}:args)}}))}:{})},finish_reason:call?'tool_calls':'stop'}],usage:{prompt_tokens:20,completion_tokens:10}}));
    }catch{res.writeHead(500);res.end();}
  });
  const modelUrl=await listen(model);cleanup.push(()=>close(model));
  const key=()=>randomBytes(32).toString('base64');
  const route:CapabilityConfiguration={scope,url:endpoint+'/v1/ideeo/tools/call',credentialEnv:'WORKSPACE',tools:registered};
  const product=await launchIdeeoFixture({guardHostImports:true,capabilities:[route],inference:{mode:'synthetic',url:modelUrl+'/v1',model:'ideeo-fixture',credentialEnv:'MODEL',textMode:'free-form'},
    storage:{mode:'synthetic',databaseEnv:'DB',keyringEnv:'KEYS',fingerprintKeyEnv:'FINGERPRINT',activeKeyId:'first',contentTtlSeconds:600,replayTtlSeconds:1200},
    secrets:{DB:pg.runtimeUrl,KEYS:JSON.stringify({alpha:{first:key()},beta:{first:key()}}),FINGERPRINT:key(),MODEL:modelKey,WORKSPACE:credential,IDEEO_FREE_FORM_EVALUATION:'synthetic-content-only'}});
  cleanup.push(()=>product.stop());
  const scopes=['conversation:read','conversation:write','inference:invoke','inference:disclose','inference:disclose:images','tool:files:write','tool:files:read','tool:browser:interact'];
  product.tenants.forEach(tenant=>tenant.set({scopes}));
  const token=await product.tenants[0].token('sdk',{scope:scopes.join(' ')}),other=await product.tenants[1].token('sdk',{scope:scopes.join(' ')});
  const request=async(path:string,body?:unknown,key:string=randomUUID(),proof=token)=>{const response=await fixtureFetch(product.url+path,{method:body?'POST':'GET',headers:{authorization:`Bearer ${proof}`,...(body?{'content-type':'application/json','idempotency-key':key}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:response.status,retryAfter:response.headers.get('retry-after'),body:await response.json() as Record<string,any>};};
  const create=async(proof=token)=>{const r=await request('/v2/conversations',{},randomUUID(),proof);assert.equal(r.status,200);return `/v2/conversations/${r.body.conversation_id}/turns`;};
  const input={message:{text:'Save an invented workshop note.',disclosure:'model'}};
  await t.test('availability follows full owner and current grant',async()=>{
    const own=await request('/v2/conversations/capabilities');assert.equal(own.status,200);assert.equal(own.body.capabilities.find((c:{family:string})=>c.family==='files').available,5);
    const foreign=await request('/v2/conversations/capabilities',undefined,randomUUID(),other);assert.ok(foreign.body.capabilities.every((c:{available:number})=>c.available===0));
    product.tenants[0].set({scopes:scopes.filter(s=>s!=='tool:files:write')});
    try{assert.equal((await request('/v2/conversations/capabilities')).body.capabilities.find((c:{family:string})=>c.family==='files').available,2);}finally{product.tenants[0].set({scopes});}
  });
  await t.test('real file effect and committed replay survive product restart',async()=>{
    const path=await create(),idem=randomUUID(),before=effects;
    const result=await request(path,input,idem);assert.equal(result.status,200,JSON.stringify(result.body));
    assert.equal(await readFile(join(workspace,'note.txt'),'utf8'),'Workshop Sunday at three.');assert.equal(effects,before+1);
    await product.restart();assert.equal((await request(path,input,idem)).body.event_id,result.body.event_id);assert.equal(effects,before+1);
  });
  await t.test('a caller without workspace tools can still have an ordinary conversation',async()=>{
    const before=effects;textOnly=true;
    try{assert.equal((await request(await create(other),input,randomUUID(),other)).status,200);assert.equal(effects,before);}
    finally{textOnly=false;}
  });
  await t.test('small catalogs expose direct tools with the same tenant and permission guards',async()=>{
    prelude='I will save the invented note.';const before=effects;
    try{
      assert.equal((await request(await create(),input)).status,200);assert.equal(effects,before+1);
      assert.ok(JSON.stringify(observed.at(-1)).includes('write_note'));
      assert.equal((await request(await create(other),input,randomUUID(),other)).status,503);
      product.tenants[0].set({scopes:scopes.filter(s=>s!=='tool:files:write')});
      assert.equal((await request(await create(),input)).status,503);assert.equal(effects,before+1);
    }finally{prelude=null;product.tenants[0].set({scopes});}
  });
  await t.test('native OpenMaus file tools write and read only the caller workspace',async()=>{
    try{
      const path=await create();toolName='write_file';toolArgs={path:'draft.txt',content:'An invented invitation.'};
      assert.equal((await request(path,input)).status,200);assert.equal(await readFile(join(filesRoot,'draft.txt'),'utf8'),'An invented invitation.');
      toolName='read_file';toolArgs={path:'draft.txt'};assert.equal((await request(path,input)).status,200);assert.ok(JSON.stringify(observed.at(-1)).includes('An invented invitation.'));
      toolArgs={path:'../receipts'};assert.equal((await request(path,input)).status,503);
      toolArgs={path:join(workspace,'note.txt')};assert.equal((await request(path,input)).status,503);
    }finally{toolName='write_note';toolArgs={text:'Workshop Sunday at three.'};}
  });
  await t.test('bounded tool batches validate every call before any effect and replay without execution',async()=>{
    batch=3;const before=effects;
    try{
      batchInvalid=true;assert.equal((await request(await create(),input)).status,503);assert.equal(effects,before);
      batchInvalid=false;const path=await create(),idem=randomUUID();
      const result=await request(path,input,idem);assert.equal(result.status,200);assert.equal(effects,before+3);
      assert.equal((await request(path,input,idem)).body.event_id,result.body.event_id);assert.equal(effects,before+3);
    }finally{batch=1;batchInvalid=false;}
  });
  await t.test('actual OpenMaus browser opens the local site and makes one fixture booking',async()=>{
    const path=await create(),before=bookings;
    try{
      toolName='agent_browser_open';toolArgs={url:'workshop.invalid'};
      const opened=await request(path,{message:{text:'Open the invented workshop website.',disclosure:'model'}});assert.equal(opened.status,200,JSON.stringify(opened.body));
      toolName='agent_browser_click';toolArgs={selector:'#book'};
      const idem=randomUUID(),input={message:{text:'Book the workshop on this local test site.',disclosure:'model'}};
      const booked=await request(path,input,idem);assert.equal(booked.status,200,JSON.stringify(booked.body));assert.equal(bookings,before+1);
      assert.equal((await request(path,input,idem)).body.event_id,booked.body.event_id);assert.equal(bookings,before+1);
      toolName='agent_browser_read';toolArgs={};
      assert.equal((await request(path,{message:{text:'Read the booking confirmation.',disclosure:'model'}})).status,200);
      assert.ok(JSON.stringify(observed.at(-1)).includes('Booking recorded in fixture'));
    }finally{toolName='write_note';toolArgs={text:'Workshop Sunday at three.'};}
  });
  await t.test('different tenant, unknown tools and schema violations cause no effect',async()=>{
    const before=effects;
    assert.equal((await request(await create(other),input,randomUUID(),other)).status,503);
    toolName='host_shell';try{assert.equal((await request(await create(),input)).status,503);}finally{toolName='write_note';}
    toolArgs={text:'Valid',path:'outside'};try{assert.equal((await request(await create(),input)).status,503);}finally{toolArgs={text:'Workshop Sunday at three.'};}
    assert.equal(effects,before);
  });
  await t.test('actual browser images require separate current model disclosure authority',async()=>{
    const path=await create();
    try{
      toolName='agent_browser_open';toolArgs={url:'https://workshop.invalid/'};assert.equal((await request(path,input)).status,200);
      toolName='agent_browser_screenshot';toolArgs={};
      assert.equal((await request(path,{message:{text:'Inspect the invented workshop screenshot.',disclosure:'model'}})).status,200);
      assert.ok(JSON.stringify(observed.at(-1)).includes('data:image/png;base64,'));
      product.tenants[0].set({scopes:scopes.filter(s=>s!=='inference:disclose:images')});
      const before=observed.length;
      assert.equal((await request(path,{message:{text:'Inspect another invented screenshot.',disclosure:'model'}})).status,503);
      assert.equal(observed.length,before+1);assert.ok(!JSON.stringify(observed.at(-1)).includes('data:image/png;base64,'));
    }finally{product.tenants[0].set({scopes});toolName='write_note';toolArgs={text:'Workshop Sunday at three.'};}
  });
  await t.test('revocation after an effect withholds its answer',async()=>{
    const path=await create();afterEffect=()=>product.tenants[0].set({scopes:scopes.filter(s=>s!=='tool:files:write')});
    try{assert.equal((await request(path,input)).status,503);assert.equal((await request(path)).body.turns.length,0);}finally{afterEffect=undefined;product.tenants[0].set({scopes});}
  });
  await t.test('commit failure cannot repeat an external effect on retry',async()=>{
    const path=await create(),idem=randomUUID(),before=effects;
    await pg.admin.unsafe("CREATE FUNCTION ideeo.reject_capability_commit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fixture commit rejection'; END $$; CREATE TRIGGER reject_capability_commit BEFORE INSERT ON ideeo.turns FOR EACH ROW EXECUTE FUNCTION ideeo.reject_capability_commit()");
    try{assert.equal((await request(path,input,idem)).status,503);}finally{await pg.admin.unsafe('DROP TRIGGER reject_capability_commit ON ideeo.turns; DROP FUNCTION ideeo.reject_capability_commit()');}
    assert.equal(effects,before+1);
    const id=path.split('/')[3];
    const [attempts]=await pg.admin`select count(*)::int as n from ideeo.inference_attempts a join ideeo.inference_operations o on o.scope=a.scope and o.request_key=a.request_key where o.conversation_id=${id} and a.kind='model'`;
    assert.equal(attempts.n,2);
    await product.restart();
    const modelCalls=observed.length;
    const status=await fixtureFetch(product.url+path+'/status',{headers:{authorization:`Bearer ${token}`,'idempotency-key':idem}});
    assert.equal(status.status,200);
    assert.equal((await status.json() as {status:string}).status,'reconciliation_required');
    textOnly=true;
    try{
      const replay=await request(path,input,idem);
      assert.equal(replay.status,409);assert.equal(replay.body.error.code,'capability_reconciliation_required');
      assert.equal(replay.retryAfter,null);
      assert.equal((await request(path,{message:{text:'Different invented note.',disclosure:'model'}},idem)).body.error.code,'idempotency_conflict');
      assert.equal((await request(path)).body.turns.length,0);
      assert.equal(observed.length,modelCalls);assert.equal(effects,before+1);
    }finally{textOnly=false;}
  });
  await t.test('tool context and storage exclude workspace credentials',async()=>{
    const serialized=JSON.stringify(observed);for(const value of [credential,token,other,modelKey])assert.ok(!serialized.includes(value));
    const rows=JSON.stringify(await pg.admin`select user_content,answer_content from ideeo.turns`);assert.ok(!rows.includes('Workshop Sunday'));assert.ok(!product.diagnostics().includes(credential));
    assert.ok((await readdir(receipts)).length>=3);
  });
});
