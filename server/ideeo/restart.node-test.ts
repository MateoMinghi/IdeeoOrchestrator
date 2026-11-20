import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import test from 'node:test';
import { launchIdeeoFixture } from '../../scripts/testing/ideeo-fixture.ts';
import { launchPostgresFixture } from '../../scripts/testing/postgres-fixture.ts';
import { launchModelFixture } from '../../scripts/testing/model-fixture.ts';
import { fixtureFetch } from '../../scripts/testing/fixture-http.ts';
import { workshopPrompt, workshopScenarios } from '../../scripts/testing/workshop-scenarios.ts';
import type { ConversationHistory, TurnView } from '../../shared/ideeo/conversations.ts';

test('failed model turns survive repeated product restart without losing service',{timeout:180000},async t=>{
  const pg=await launchPostgresFixture(),model=await launchModelFixture();
  let product:Awaited<ReturnType<typeof launchIdeeoFixture>>|undefined;
  t.after(async()=>{await product?.stop();await model.stop();await pg.stop();});
  const key=()=>randomBytes(32).toString('base64');
  product=await launchIdeeoFixture({guardHostImports:true,
    storage:{mode:'synthetic',databaseEnv:'DB',keyringEnv:'KEYS',fingerprintKeyEnv:'FINGERPRINT',activeKeyId:'first',contentTtlSeconds:600,replayTtlSeconds:1200},
    inference:{mode:'synthetic',url:model.url,model:'ideeo-fixture',credentialEnv:'MODEL',textMode:'free-form'},
    secrets:{DB:pg.runtimeUrl,KEYS:JSON.stringify({alpha:{first:key()},beta:{first:key()}}),FINGERPRINT:key(),MODEL:model.credential,IDEEO_FREE_FORM_EVALUATION:'synthetic-content-only'}});
  const scopes=['conversation:read','conversation:write','inference:invoke','inference:disclose'];
  const tenant=product.tenants[0];tenant.set({scopes});
  const token=await tenant.token('sdk',{scope:scopes.join(' ')});
  const request=async(path:string,body?:object,key:string=randomUUID())=>{
    try {
      const response=await fixtureFetch(product!.url+path,{method:body?'POST':'GET',headers:{authorization:`Bearer ${token}`,
        'idempotency-key':key,...(body?{'content-type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
      return {status:response.status,body:await response.json() as ConversationHistory & TurnView & {error:{code:string}}};
    } catch(error) {
      assert.fail(JSON.stringify({request_error:error instanceof Error?error.name:'unknown',process:product!.processStatus()}));
    }
  };
  const created=await request('/v2/conversations',{});
  assert.equal(created.status,200);
  const path=`/v2/conversations/${created.body.conversation_id}/turns`;
  model.setAnswer(()=> 'An invented workshop invitation.');
  for(let round=0;round<5;round++)await t.test(`restart ${round+1}`,async()=>{
    model.setFault('timeout');
    const idem=randomUUID();
    const [plan,change,decision,invitation,,booking]=workshopScenarios(true);
    const failed=await request(path,{message:{text:plan.prompt,disclosure:'model'}},idem);
    assert.equal(failed.status,503);assert.equal(failed.body.error.code,'model_timeout');
    model.setFault('none');
    await product!.restart();
    const before=model.observed.length;
    const status=await request(path+'/status',undefined,idem);
    assert.equal(status.status,200);assert.equal(status.body.status,'uncommitted');
    assert.equal(model.observed.length,before);
    const committed=new Set<string>();
    const next=workshopPrompt(change,committed);
    assert.deepEqual(next.restated_after,['plan']);
    assert.deepEqual(workshopPrompt(booking,committed).blocked_by,['invitation','decision']);
    assert.deepEqual(workshopPrompt(invitation,committed).blocked_by,['decision']);
    committed.add(change.id);
    assert.equal(workshopPrompt(decision,committed).prompt,decision.prompt);
    const resumed=await request(path,{message:{text:next.prompt,disclosure:'model'}});
    assert.equal(resumed.status,200);
    const messages=model.observed.at(-1)!.messages as {role:string;content:string}[];
    assert.equal(messages.at(-1)?.content,next.prompt);
    assert.ok(!messages.some(message=>message.content===plan.prompt));
    const history=await request(path);
    assert.equal(history.status,200);assert.equal(history.body.turns.length,round+1);
  });
});
