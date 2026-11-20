import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { appendFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import { createProductClient } from '../../src/ideeo/client.ts';
import type { ConversationHistory, TurnView } from '../../shared/ideeo/conversations.ts';
import { launchIdeeoBookingFixture } from '../../scripts/testing/ideeo-booking-fixture.ts';
import { launchIdeeoFixture, type ProductLifecycleEvent } from '../../scripts/testing/ideeo-fixture.ts';
import { launchModelFixture } from '../../scripts/testing/model-fixture.ts';
import { launchPostgresFixture } from '../../scripts/testing/postgres-fixture.ts';
import { fixtureFetch } from '../../scripts/testing/fixture-http.ts';
import { errorEvidence, stopWithEvidence } from '../../scripts/testing/fixture-evidence.ts';

function committed({conversation_id,turn_id,event_id,sequence,status,message,answer}:TurnView) {
  return {conversation_id,turn_id,event_id,sequence,status,message,answer};
}

test('completed browser booking survives five product replacements without repeating work',async t=>{
  const report='output/ideeo-booking-restart-'+randomUUID()+'.jsonl';
  t.diagnostic(report);
  const record=(value:object)=>appendFile(report,JSON.stringify(value)+'\n');
  const lifecycle:ProductLifecycleEvent[]=[];
  let pg:Awaited<ReturnType<typeof launchPostgresFixture>>|undefined;
  let workspace:Awaited<ReturnType<typeof launchIdeeoBookingFixture>>|undefined;
  let model:Awaited<ReturnType<typeof launchModelFixture>>|undefined;
  let product:Awaited<ReturnType<typeof launchIdeeoFixture>>|undefined;
  t.after(async()=>{
    try {
      await stopWithEvidence(report,[{name:'product',stop:product?.stop},{name:'browser workspace',stop:workspace?.stop},
        {name:'model',stop:model?.stop},{name:'PostgreSQL',stop:pg?.stop}]);
    } finally { await record({phase:'after shutdown',process:product?.processStatus(),lifecycle}); }
  });
  let phase='PostgreSQL startup';
  try {
    pg=await launchPostgresFixture();
    await pg.admin`insert into ideeo.inference_budget(tenant_id,day,model_attempts,tool_attempts)
      values('alpha',(clock_timestamp() at time zone 'UTC')::date,52,54)`;
    phase='browser workspace startup';
    workspace=await launchIdeeoBookingFixture(join(pg.root,'workspace'));
    phase='model startup';
    model=await launchModelFixture();
    phase='product startup';
    const key=()=>randomBytes(32).toString('base64');
    product=await launchIdeeoFixture({guardHostImports:true,startupTimeoutMs:10000,onLifecycle:event=>lifecycle.push(event),
      capabilities:[workspace.route],inference:{mode:'synthetic',url:model.url,model:'ideeo-fixture',credentialEnv:'MODEL',textMode:'free-form'},
      storage:{mode:'synthetic',databaseEnv:'DB',keyringEnv:'KEYS',fingerprintKeyEnv:'FINGERPRINT',activeKeyId:'first',contentTtlSeconds:600,replayTtlSeconds:1200},
      secrets:{DB:pg.runtimeUrl,KEYS:JSON.stringify({alpha:{first:key()},beta:{first:key()}}),FINGERPRINT:key(),
        MODEL:model.credential,WORKSPACE:workspace.credential,IDEEO_FREE_FORM_EVALUATION:'synthetic-content-only'}});
    const tenant=product.tenants[0];
    const scopes=['conversation:read','conversation:write','inference:invoke','inference:disclose','tool:browser:interact','inference:disclose:images'];
    tenant.set({scopes});
    const proof=()=>tenant.token('sdk',{scope:scopes.join(' ')});
    const client=createProductClient(proof),signal=new AbortController().signal;
    const originalFetch=globalThis.fetch;
    t.mock.method(globalThis,'fetch',(input:Parameters<typeof fetch>[0],init:RequestInit={})=>
      typeof input==='string'&&input.startsWith('/v2/') ? fixtureFetch(product!.url+input,{
        method:init.method,headers:Object.fromEntries(new Headers(init.headers)),body:init.body as string|undefined,signal:init.signal??undefined
      }) : originalFetch(input,init));

    phase='book workshop';
    const {conversation_id:id}=await client.create(randomUUID(),signal);
    const prompt='Book the Sunday workshop for ten adults at Willow Studio at workshop.invalid for thirty dollars and report the confirmation.';
    const idem=randomUUID();
    model.setTool(messages=>{
      const last=messages.at(-1)!;
      if(last.role==='user') return {name:'agent_browser_open',args:{url:'https://workshop.invalid'}};
      if(last.content.includes('Reserve Sunday workshop')) return {name:'agent_browser_click',args:{selector:'button[type=submit]'}};
      if(!last.content.includes('WILLOW-')) return {name:'agent_browser_snapshot',args:{}};
    });
    model.setAnswer(messages=>{
      const confirmation=messages.at(-1)?.content.match(/WILLOW-[A-Z]{8}/)?.[0];
      assert.ok(confirmation);
      return 'Reservation confirmed '+confirmation+'.';
    });
    const booking=await client.append(id,prompt,idem,signal);
    assert.match(booking.event_id,/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/);
    assert.equal(booking.answer.text,'Reservation confirmed '+workspace.confirmation+'.');
    assert.equal(workspace.bookings(),1);
    phase='plan workshop';
    model.setTool();
    model.setAnswer(()=>'Prepare ten workshop supply kits.');
    const plan=await client.append(id,'Plan the workshop supplies.',randomUUID(),signal);
    assert.notEqual(plan.turn_id,booking.turn_id);
    assert.equal(plan.answer.text,'Prepare ten workshop supply kits.');
    assert.deepEqual([booking.sequence,plan.sequence],[1,2]);
    const expected=[committed(booking),committed(plan)];
    await record({phase,expected,bookings:workspace.bookings(),browser_actions:workspace.events.map(e=>e.name)});
    const counters=async()=>{
      const [row]=await pg!.admin`select count(*) filter(where kind='tool')::int as tools,
        count(*) filter(where kind='model')::int as models from ideeo.inference_attempts`;
      return {model_calls:model!.observations().calls,model_reservations:row.models,tool_reservations:row.tools,
        browser_actions:workspace!.events.length,bookings:workspace!.bookings()};
    };
    const baseline=await counters();
    assert.ok(baseline.tool_reservations>=2);
    for(let cycle=1;cycle<=5;cycle++){
      phase='restart '+cycle;
      await product.restart();
      phase='first history '+cycle;
      const url=product.url;
      const token=await proof();
      const started=Date.now();
      let httpStatus:number|undefined;
      try {
        const response=await fixtureFetch(url+'/v2/conversations/'+id+'/turns',{headers:{authorization:'Bearer '+token}});
        httpStatus=response.status;
        assert.equal(httpStatus,200);
        const history=await response.json() as ConversationHistory;
        assert.equal(history.conversation_id,id);
        const turns=history.turns.map(committed);
        assert.deepEqual(turns,expected);
        await record({phase,url,httpStatus,elapsed_ms:Date.now()-started,outcome:'verified',turns});
      } catch(error) {
        await record({phase,url,httpStatus,elapsed_ms:Date.now()-started,outcome:'failed',error:errorEvidence(error)});
        throw error;
      }
      phase='status and replay '+cycle;
      const beforeStatus=await counters();
      assert.deepEqual(beforeStatus,baseline);
      const status=await client.turnStatus(id,idem,signal);
      assert.equal(status.status,'committed');
      assert.equal(status.turn_id,booking.turn_id);
      const before=await counters();
      assert.deepEqual(before,beforeStatus);
      const replay=await client.append(id,prompt,idem,signal);
      const after=await counters();
      await record({phase,status:status.status,event_id:replay.event_id,before,after});
      assert.deepEqual(committed(replay),expected[0]);
      assert.deepEqual(after,before);
    }
    phase='fresh append';
    model.setAnswer(()=>'Set out the supply kits.');
    const fresh=await client.append(id,'What should we do next?',randomUUID(),signal);
    assert.equal(fresh.sequence,3);
    assert.equal(fresh.answer.text,'Set out the supply kits.');
    assert.deepEqual((await client.history(id,signal)).map(committed),[...expected,committed(fresh)]);
    assert.deepEqual(await counters(),{...baseline,model_calls:baseline.model_calls+1,model_reservations:baseline.model_reservations+1});
    await record({phase,turn:committed(fresh),outcome:'verified'});
  } catch(error) {
    await record({phase,outcome:'failed',error:errorEvidence(error)});
    throw error;
  } finally {
    await record({phase:'before shutdown',process:product?.processStatus(),lifecycle,bookings:workspace?.bookings(),
      browser_actions:workspace?.events.map(({name,status})=>({name,status})),model_calls:model?.observations().calls});
  }
});
