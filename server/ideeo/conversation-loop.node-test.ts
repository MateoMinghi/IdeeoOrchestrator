import assert from 'node:assert/strict';
import { randomBytes,randomUUID } from 'node:crypto';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import { launchIdeeoFixture } from '../../scripts/testing/ideeo-fixture.ts';
import { launchPostgresFixture } from '../../scripts/testing/postgres-fixture.ts';
import { launchModelFixture } from '../../scripts/testing/model-fixture.ts';
import { fixtureFetch } from '../../scripts/testing/fixture-http.ts';
import type { ConversationHistory,TurnView } from '../../shared/ideeo/conversations.ts';
import { parseInferenceConfiguration } from './inference-policy.ts';
import { openStorageDatabase } from './storage/database.ts';
import { controlledModelTransport, fixtureSystem, fixtureTool } from './model-transport.ts';
import type { InferenceContext } from './inference.ts';
import { assertAuthorityFreshness } from './authority-client.ts';
import { createConversationGenerator } from './conversation-loop.ts';

test('model route configuration rejects relabelled live and incomplete profiles',()=>{
  const config={mode:'synthetic',url:'http://127.0.0.1:12345/v1',credentialEnv:'FIXTURE_MODEL',model:'ideeo-fixture'};
  assert.deepEqual(parseInferenceConfiguration(config),config);
  for(const change of [{mode:'live'},{url:'https://api.openai.com/v1'},{url:config.url+'?key=secret'},{model:'gpt-5'},{extra:true}])assert.throws(()=>parseInferenceConfiguration({...config,...change}));
});

test('OpenAI evaluation requires exact destination, model and explicit activation',()=>{
  const config=parseInferenceConfiguration({mode:'openai-evaluation',url:'https://api.openai.com/v1',credentialEnv:'EVALUATION_KEY',model:'gpt-6-luna'});
  for(const patch of [{url:'http://127.0.0.1:12345/v1'},{url:'https://api.openai.com/v1/'},{model:'gpt-6.2-astra'},{mode:'synthetic'}])assert.throws(()=>parseInferenceConfiguration({...config,...patch}));
  assert.throws(()=>createConversationGenerator(config,{EVALUATION_KEY:'synthetic-unusable-key'}),/explicit activation/);
});

test('authority freshness permits one epoch tick and rejects older, future or reversed time',()=>{
  for(const checked of [99,100,101,102])assertAuthorityFreshness(checked,100,101);
  for(const checked of [98,103])assert.throws(()=>assertAuthorityFreshness(checked,100,101),{code:'authority_unavailable'});
  assert.throws(()=>assertAuthorityFreshness(100,101,100),{code:'authority_unavailable'});
});

test('helper, fallback and unqualified context cannot dispatch',async()=>{
  const config={mode:'synthetic' as const,url:'http://127.0.0.1:12345/v1',credentialEnv:'FIXTURE_MODEL',model:'ideeo-fixture' as const};
  const unexpected=async():Promise<never>=>{assert.fail('Unqualified request reached dispatch boundary');};
  const context:InferenceContext={message:'synthetic.hello',history:[],signal:new AbortController().signal,
    checkpoint:unexpected,authorize:unexpected,reserve:unexpected,finish:unexpected};
  const send=controlledModelTransport(config,'synthetic-credential',context);
  const body={model:config.model,stream:true,max_tokens:256,messages:[{role:'system',content:fixtureSystem}],tools:[fixtureTool]};
  for(const [url,request] of [
    [config.url+'/models',{method:'GET'}],
    [config.url+'/responses',{method:'POST',body:JSON.stringify(body)}],
    [config.url+'/chat/completions',{method:'POST',body:JSON.stringify({...body,stream:false})}],
    [config.url+'/chat/completions',{method:'POST',body:JSON.stringify({...body,messages:[{role:'user',content:'unqualified synthetic input'}]})}],
    [config.url+'/chat/completions',{method:'POST',body:JSON.stringify({...body,messages:[{role:'system',content:fixtureSystem,reasoning:'private'}]})}],
  ] as const) await assert.rejects(send(url,request),{code:'model_unavailable'});
});

test('model transport preserves authority and storage failures',async t=>{
  const model=await launchModelFixture();
  t.after(()=>model.stop());
  const config={mode:'synthetic' as const,url:model.url,credentialEnv:'MODEL',model:'ideeo-fixture' as const};
  const body={model:config.model,stream:true,max_tokens:256,messages:[{role:'system',content:fixtureSystem}],tools:[fixtureTool]};
  for(const boundary of ['checkpoint','authorize','reserve','finish','reauthorize'] as const)await t.test(boundary,async()=>{
    const failure=new Error('Synthetic non-provider boundary failure');
    let checks=0;
    const context:InferenceContext={message:'synthetic.hello',history:[],signal:new AbortController().signal,
      checkpoint:async()=>{},authorize:async()=>{},reserve:async()=>({id:'attempt',deadline:new Date(Date.now()+15000)}),finish:async()=>{}};
    if(boundary==='reauthorize')context.authorize=async()=>{if(++checks===2)throw failure;};
    else context[boundary]=async()=>{throw failure;};
    const send=controlledModelTransport(config,model.credential,context);
    await assert.rejects(send(config.url+'/chat/completions',{method:'POST',body:JSON.stringify(body)}),error=>error===failure);
  });
});

test('controlled OpenMaus loop through actual product and PostgreSQL',{timeout:180000},async t=>{
  const retained=randomUUID();
  const pg=await launchPostgresFixture({beforeUpgrade:async sql=>{
    const scope={tenant_id:'migration',membership_id:'member',client_id:'app',agent_account_id:'agent',grant_id:'grant',channel:'sdk',channel_binding_id:''};
    await sql`insert into ideeo.conversations(scope,id,creation_key,created_at,expires_at,replay_expires_at)
      values(${sql.json(scope)},${retained},${'a'.repeat(64)},clock_timestamp(),clock_timestamp()+interval '10 minutes',clock_timestamp()+interval '20 minutes')`;
  }}), model=await launchModelFixture();
  let product:Awaited<ReturnType<typeof launchIdeeoFixture>>|undefined;
  t.after(async()=>{await product?.stop();await model.stop();await pg.stop();});
  await t.test('schema one record survives the explicit forward migration',async()=>{
    const [schema]=await pg.admin`select version from ideeo.schema_version`;
    assert.equal(schema.version,5);
    const [record]=await pg.admin`select id,next_sequence from ideeo.conversations where id=${retained}`;
    assert.equal(record.id,retained);assert.equal(record.next_sequence,1);
  });
  const key=()=>randomBytes(32).toString('base64');
  product=await launchIdeeoFixture({guardHostImports:true,storage:{mode:'synthetic',databaseEnv:'STORAGE_DATABASE',keyringEnv:'STORAGE_KEYS',fingerprintKeyEnv:'STORAGE_FINGERPRINT',activeKeyId:'first',contentTtlSeconds:600,replayTtlSeconds:1200},
    inference:{mode:'synthetic',url:model.url,model:'ideeo-fixture',credentialEnv:'FIXTURE_MODEL'},
    secrets:{STORAGE_DATABASE:pg.runtimeUrl,STORAGE_KEYS:JSON.stringify({alpha:{first:key()},beta:{first:key()}}),STORAGE_FINGERPRINT:key(),FIXTURE_MODEL:model.credential}});
  const [alpha,beta]=product.tenants;
  const scopes=['conversation:read','conversation:write','inference:invoke','tool:fixture:read'];
  alpha.set({scopes});beta.set({scopes});
  const sdk=await alpha.token('sdk',{scope:scopes.join(' ')}),whatsapp=await alpha.token('whatsapp',{scope:scopes.join(' ')}),other=await beta.token('sdk',{scope:scopes.join(' ')});
  type Body=ConversationHistory&TurnView&{error:{code:string}};
  const request=async(path:string,body?:object,token=sdk,idempotency:string=randomUUID())=>{
    const response=await fixtureFetch(product!.url+path,{method:body?'POST':'GET',headers:{authorization:`Bearer ${token}`,...(body?{'content-type':'application/json','idempotency-key':idempotency}:{})},...(body?{body:JSON.stringify(body)}:{})});
    return {status:response.status,body:await response.json() as Body};
  };
  const create=async(token=sdk)=>{const r=await request('/v2/conversations',{},token);assert.equal(r.status,200,JSON.stringify(r.body));return r.body.conversation_id;};
  const turn=(id:string,message='synthetic.hello',idem:string=randomUUID(),token=sdk)=>request(`/v2/conversations/${id}/turns`,{message},token,idem);
  const history=(id:string,token=sdk)=>request(`/v2/conversations/${id}/turns`,undefined,token);
  const count=async(id:string)=>{
    const [r]=await pg.admin`select (select count(*)::int from ideeo.turns where conversation_id=${id}) as turns,
      (select count(*)::int from ideeo.inference_attempts a join ideeo.inference_operations o on o.scope=a.scope and o.request_key=a.request_key where o.conversation_id=${id} and kind='model') as models,
      (select count(*)::int from ideeo.inference_attempts a join ideeo.inference_operations o on o.scope=a.scope and o.request_key=a.request_key where o.conversation_id=${id} and kind='tool') as tools`;
    return {turns:r.turns,models:r.models,tools:r.tools};
  };
  const conversation=await create();
  await t.test('greeting, draft, revision, recall and reload use the shared loop',async()=>{
    for(const message of ['synthetic.hello','synthetic.draft','synthetic.revise','synthetic.recall']){
      const r=await turn(conversation,message);assert.equal(r.status,200,JSON.stringify(r.body));assert.equal(r.body.answer.kind,'openmaus_fixture');
    }
    assert.equal((await history(conversation)).body.turns.at(-1)?.answer.text,'The last invitation was: Join our synthetic picnic on Saturday.');
    const calls=model.observations().calls;await product!.restart();
    assert.equal((await history(conversation)).body.turns.length,4);assert.equal(model.observations().calls,calls);
    assert.deepEqual(await count(conversation),{turns:4,models:4,tools:0});
  });
  await t.test('SDK, WhatsApp and second tenant stay isolated',async()=>{
    for(const proof of [whatsapp,other]){
      const id=await create(proof);assert.equal((await turn(id,'synthetic.hello',randomUUID(),proof)).status,200);
      assert.equal((await history(conversation,proof)).status,404);assert.equal((await history(id)).status,404);
    }
  });
  await t.test('one independently authorized typed tool feeds the next model round',async()=>{
    const id=await create(),r=await turn(id,'synthetic.follow-up');assert.equal(r.status,200,JSON.stringify(r.body));
    assert.equal(r.body.answer.text,'The synthetic color is blue.');assert.deepEqual(await count(id),{turns:1,models:2,tools:1});
  });
  await t.test('idempotent and concurrent retries do not regenerate a committed answer',async()=>{
    const id=await create(),idem=randomUUID();
    const results=await Promise.all(Array.from({length:4},()=>turn(id,'synthetic.hello',idem)));
    assert.ok(results.every(r=>[200,409].includes(r.status)));assert.ok(results.some(r=>r.status===200));
    const first=results.find(r=>r.status===200)!;
    assert.equal((await turn(id,'synthetic.hello',idem)).body.turn_id,first.body.turn_id);
    assert.equal((await turn(id,'synthetic.draft',idem)).status,409);assert.deepEqual(await count(id),{turns:1,models:1,tools:0});
  });
  await t.test('transient retry charges both physical attempts',async()=>{
    const id=await create();model.setFault('transient');
    try{assert.equal((await turn(id)).status,200);assert.deepEqual(await count(id),{turns:1,models:2,tools:0});}finally{model.setFault('none');}
  });
  await t.test('exhausted attempts survive restart and changed input cannot reuse failed work',async()=>{
    const id=await create(),idem=randomUUID();model.setFault('outage');
    try{
      assert.equal((await turn(id,'synthetic.hello',idem)).status,503);assert.deepEqual(await count(id),{turns:0,models:3,tools:0});
      await product!.restart();assert.equal((await turn(id,'synthetic.hello',idem)).status,409);
      assert.equal((await turn(id,'synthetic.draft',idem)).status,409);assert.equal(model.observations().calls,3);
    }finally{model.setFault('none');}
  });
  await t.test('revocation after dispatch prevents persistence and later disclosure',async()=>{
    const id=await create();model.onCheck(async()=>{alpha.set({grant:'revoked'});});
    try{assert.equal((await turn(id)).status,403);assert.deepEqual(await count(id),{turns:0,models:1,tools:0});
      assert.equal((await history(conversation)).status,403);
    }finally{model.onCheck();alpha.set({grant:'active'});}
  });
  await t.test('model and tool permissions cannot be inferred from conversation admission',async()=>{
    const id=await create();alpha.set({scopes:scopes.filter(s=>s!=='inference:invoke')});
    try{assert.equal((await turn(id)).status,403);assert.deepEqual(await count(id),{turns:0,models:0,tools:0});}finally{alpha.set({scopes});}
    alpha.set({scopes:scopes.filter(s=>s!=='tool:fixture:read')});
    try{assert.equal((await turn(id,'synthetic.follow-up')).status,403);assert.deepEqual(await count(id),{turns:0,models:1,tools:0});}finally{alpha.set({scopes});}
  });
  for(const fault of ['redirect','oversized','unknown-tool','repeat-tool','secret','length','empty','timeout'])await t.test(`fails closed on model ${fault}`,async()=>{
    const id=await create();model.setFault(fault);const start=Date.now();
    try{
      const result=await turn(id);assert.equal(result.status,503,JSON.stringify(result.body));assert.equal(result.body.answer,undefined);
      assert.equal((await count(id)).turns,0);assert.ok(Date.now()-start<7000);assert.equal(model.observations().redirects,0);
    }finally{model.setFault('none');}
  });
  await t.test('unknown token usage and all costs remain unknown',async()=>{
    const id=await create();model.setFault('unknown-usage');
    try{assert.equal((await turn(id)).status,200);}finally{model.setFault('none');}
    const rows=await pg.admin`select a.* from ideeo.inference_attempts a join ideeo.inference_operations o on o.scope=a.scope and o.request_key=a.request_key where o.conversation_id=${id}`;
    assert.equal(rows[0].input_tokens,null);assert.equal(rows[0].output_tokens,null);assert.equal(rows[0].cost_usd,null);
  });
  await t.test('commit failure withholds answer but retains consumed inference',async()=>{
    const id=await create(),idem=randomUUID();
    await pg.admin.unsafe("CREATE FUNCTION ideeo.fixture_fail_loop_commit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic commit rejection'; END $$; CREATE CONSTRAINT TRIGGER fixture_fail_loop_commit AFTER INSERT ON ideeo.outbox DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION ideeo.fixture_fail_loop_commit()");
    try{assert.equal((await turn(id,'synthetic.hello',idem)).status,503);assert.deepEqual(await count(id),{turns:0,models:1,tools:0});}
    finally{await pg.admin.unsafe('DROP TRIGGER fixture_fail_loop_commit ON ideeo.outbox; DROP FUNCTION ideeo.fixture_fail_loop_commit()');}
    assert.equal((await turn(id,'synthetic.hello',idem)).status,200);assert.deepEqual(await count(id),{turns:1,models:2,tools:0});
  });
  await t.test('process death after dispatch preserves uncertainty and consumed budget',async()=>{
    const id=await create(),idem=randomUUID();
    let reached!:()=>void,release!:()=>void;
    const dispatched=new Promise<void>(resolve=>{reached=resolve;}),released=new Promise<void>(resolve=>{release=resolve;});
    model.onCheck(async()=>{reached();await released;});
    const pending=turn(id,'synthetic.hello',idem).catch(()=>null);
    try{
      await Promise.race([dispatched,pending.then(()=>{throw new Error('Dispatch gate missed');})]);
      assert.deepEqual(await count(id),{turns:0,models:1,tools:0});await product!.kill();
    }finally{model.onCheck();release();}
    assert.equal(await pending,null);await product!.restart();
    assert.equal((await turn(id,'synthetic.hello',idem)).status,200);assert.deepEqual(await count(id),{turns:1,models:2,tools:0});
    const [uncertain]=await pg.admin`select count(*)::int as n from ideeo.inference_attempts a join ideeo.inference_operations o on o.scope=a.scope and o.request_key=a.request_key where o.conversation_id=${id} and a.status='reserved'`;
    assert.equal(uncertain.n,1);
  });
  await t.test('an operation deadline is retained across retry',async()=>{
    const id=await create(),idem=randomUUID();model.setFault('empty');
    try{assert.equal((await turn(id,'synthetic.hello',idem)).status,503);}finally{model.setFault('none');}
    await pg.admin`update ideeo.inference_operations set deadline_at=clock_timestamp()-interval '1 second' where conversation_id=${id}`;
    const result=await turn(id,'synthetic.hello',idem);assert.equal(result.status,409);assert.equal(result.body.error.code,'inference_expired');
    assert.deepEqual(await count(id),{turns:0,models:1,tools:0});
  });
  await t.test('ledger ownership, immutable debits and a weakened budget guard are checked',async()=>{
    const runtime=openStorageDatabase(pg.runtimeUrl,'ideeo_runtime');
    try{
      assert.equal((await runtime`select * from ideeo.inference_attempts`).length,0);
      for(const query of ['DELETE FROM ideeo.inference_budget','UPDATE ideeo.inference_budget SET model_attempts=0','TRUNCATE ideeo.inference_attempts'])await assert.rejects(runtime.unsafe(query),{code:'42501'});
      const [owner]=await pg.admin`select scope from ideeo.conversations where id=${conversation}`;
      await assert.rejects(runtime`select * from ideeo.reserve_inference(${runtime.json(owner.scope)},${'a'.repeat(64)},${conversation},${'b'.repeat(64)},'model')`,{code:'P0001'});
      const [row]=await pg.admin`select pg_get_functiondef('ideeo.reserve_inference(jsonb,text,uuid,text,text)'::regprocedure) as definition`;
      const altered=String(row.definition).replace("THEN 3 ELSE 2 END","THEN 4 ELSE 2 END");
      assert.notEqual(altered,row.definition);
      const verify=async()=>{const id=await create(),idem=randomUUID();model.setFault('outage');
        try{await turn(id,'synthetic.hello',idem);await turn(id,'synthetic.hello',idem);assert.equal((await count(id)).models,3);}finally{model.setFault('none');}};
      await verify();await pg.admin.unsafe(altered);
      try{await assert.rejects(verify(),assert.AssertionError);}finally{await pg.admin.unsafe(row.definition);}
      await verify();
    }finally{await runtime.end();}
  });
  await t.test('tenant budget cannot be reset by creating a new conversation or channel',async()=>{
    await pg.admin`update ideeo.inference_budget set model_attempts=64 where tenant_id='alpha'`;
    for(const proof of [sdk,whatsapp]){const id=await create(proof);const r=await turn(id,'synthetic.hello',randomUUID(),proof);assert.equal(r.status,409);assert.equal(r.body.error.code,'inference_budget_exhausted');}
    const id=await create(other);assert.equal((await turn(id,'synthetic.hello',randomUUID(),other)).status,200);
  });
  await t.test('credentials, ownership and private reasoning never enter model context or native logs',async()=>{
    const prompts=JSON.stringify(model.observed.map(r=>r.messages)),logs=product!.diagnostics()+pg.diagnostics();
    for(const secret of [sdk,whatsapp,other,alpha.credential,beta.credential,model.credential,conversation,'synthetic-private-reasoning','synthetic-private-provider-error','synthetic-private-output-canary']){
      assert.ok(!prompts.includes(secret));assert.ok(!logs.includes(secret));
    }
    assert.deepEqual(await readdir(join(product!.root,'home')),[]);
    const data=JSON.stringify(await pg.admin`select * from ideeo.inference_attempts`);
    assert.ok(!data.includes('synthetic.hello'));assert.ok(!data.includes('You are invited'));
  });
});
