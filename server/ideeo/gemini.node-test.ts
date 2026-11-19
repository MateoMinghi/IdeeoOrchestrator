import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import https from 'node:https';
import { request, type IncomingMessage } from 'node:http';
import { syncBuiltinESMExports } from 'node:module';
import { launchModelFixture } from '../../scripts/testing/model-fixture.ts';
import { parseInferenceConfiguration, fixturePrompts, inferenceAnswerKind } from './inference-policy.ts';
import { createConversationGenerator } from './conversation-loop.ts';
import type { InferenceContext, InferenceKind } from './inference.ts';
import { ConversationError } from './storage/conversations.ts';
import { TEXT_POLICY } from './text-policy.ts';

const config={mode:'gemini-evaluation' as const,url:'https://generativelanguage.googleapis.com/v1beta/openai' as const,
  model:'gemini-2.5-flash-lite' as const,credentialEnv:'GEMINI',textMode:'free-form' as const};
test('Gemini requires the exact provider, model, free-form profile and separate activation',()=>{
  assert.deepEqual(parseInferenceConfiguration(config),config);
  for(const patch of [{url:'https://api.openai.com/v1'},{url:config.url+'/'},{url:config.url+'?key=secret'},
    {url:'http://127.0.0.1:12345/v1'},{model:'gemini-pro'},{textMode:undefined},{mode:'synthetic'},{fallback:'openai'}])
    assert.throws(()=>parseInferenceConfiguration({...config,...patch}));
  assert.throws(()=>createConversationGenerator(config,{GEMINI:'synthetic-credential',IDEEO_OPENAI_EVALUATION:'synthetic-content-only',IDEEO_FREE_FORM_EVALUATION:'synthetic-content-only'}),/Gemini evaluation requires explicit activation/);
  assert.throws(()=>createConversationGenerator(config,{GEMINI:'synthetic-credential',IDEEO_GEMINI_EVALUATION:'synthetic-content-only'}),/Free-form evaluation requires explicit activation/);
  assert.equal(inferenceAnswerKind(config),'free_form_gemini_evaluation');
});

test('Gemini adapter through shared loop with an isolated HTTP stand-in',async t=>{
  const model=await launchModelFixture();
  const intercepted=mock.method(https,'request',((url:string|URL,options:https.RequestOptions,callback:(response:IncomingMessage)=>void)=>{
    assert.equal(String(url),config.url+'/chat/completions');
    return request(model.url+'/chat/completions',{...options,agent:false},callback);
  }) as typeof https.request);
  syncBuiltinESMExports();
  t.after(async()=>{intercepted.mock.restore();syncBuiltinESMExports();await model.stop();});
  const generate=createConversationGenerator(config,{GEMINI:model.credential,IDEEO_GEMINI_EVALUATION:'synthetic-content-only',IDEEO_FREE_FORM_EVALUATION:'synthetic-content-only'});
  let authorized:InferenceKind[]=[], attempts:string[]=[], finished:{input:number;output:number}|undefined;
  const context=():InferenceContext=>({message:{text:'Write an invented garden invitation.',disclosure:'model'},history:[],signal:new AbortController().signal,
    checkpoint:async()=>{},authorize:async kind=>{authorized.push(kind);},
    reserve:async kind=>{attempts.push(kind);if(attempts.filter(a=>a===kind).length>(kind==='model'?3:2))throw new ConversationError(409,'inference_budget_exhausted');return {id:String(attempts.length),deadline:new Date(Date.now()+15000)};},
    finish:async(_id,usage)=>{finished=usage;}});
  await t.test('uses bounded Gemini payload, provider provenance and measured usage',async()=>{
    model.setAnswer(()=> 'Join our invented garden workshop.');
    assert.deepEqual(await generate(context()),{kind:'free_form_gemini_evaluation',text:'Join our invented garden workshop.'});
    const body=model.observed.at(-1)!.body;
    assert.equal(body.model,config.model);assert.equal(body.max_tokens,256);assert.equal(body.reasoning_effort,'none');assert.equal(body.stream,false);assert.equal(body.tool_choice,'auto');
    for(const field of ['store','max_completion_tokens','parallel_tool_calls','extra_body'])assert.ok(!Object.hasOwn(body,field));
    assert.deepEqual(authorized,['disclosure','model','model','disclosure']);assert.deepEqual(attempts,['model']);
    assert.deepEqual(finished,{input:15,output:10});
  });
  await t.test('only matching Gemini projections enter subsequent requests',async()=>{
    const current=context();
    const turn={turn_id:'invented-turn',conversation_id:'invented-conversation',event_id:'invented-event',sequence:1,status:'completed' as const,
      message:{text:'Earlier invented text.',disclosure:'model' as const},created_at:new Date().toISOString(),expires_at:new Date(Date.now()+60000).toISOString()};
    current.history=[{...turn,answer:{kind:'free_form_openai_evaluation',text:'Foreign provider canary.'},projection:{policy:TEXT_POLICY,user:turn.message.text,assistant:'Foreign provider canary.'}},
      {...turn,sequence:2,answer:{kind:'free_form_gemini_evaluation',text:'Approved Gemini context.'},projection:{policy:TEXT_POLICY,user:turn.message.text,assistant:'Approved Gemini context.'}}];
    attempts=[];await generate(current);
    const messages=JSON.stringify(model.observed.at(-1)!.messages);assert.ok(messages.includes('Approved Gemini context.'));assert.ok(!messages.includes('Foreign provider canary.'));
  });
  await t.test('typed tool iteration retains authorization and consumes each physical round',async()=>{
    attempts=[];authorized=[];model.setAnswer();model.setFault('omitted-tool-content');
    const current=context();current.message={text:fixturePrompts['synthetic.follow-up'],disclosure:'model'};
    assert.equal((await generate(current)).text,'The synthetic color is blue.');
    assert.deepEqual(attempts,['model','tool','model']);assert.equal(authorized.filter(k=>k==='tool').length,2);
    assert.ok(!JSON.stringify(model.observed.at(-1)!.messages).includes('synthetic-private-reasoning'));
    model.setFault('none');
  });
  await t.test('missing disclosure prevents provider dispatch',async()=>{
    const before=model.observations().calls,current=context();
    current.authorize=async kind=>{if(kind==='disclosure')throw new ConversationError(403,'denied');};
    await assert.rejects(generate(current),{status:403});assert.equal(model.observations().calls,before);
  });
  await t.test('revocation during provider work withholds the response',async()=>{
    attempts=[];let revoked=false;model.onCheck(async()=>{revoked=true;});
    const current=context();current.authorize=async kind=>{if(kind==='disclosure'&&revoked)throw new ConversationError(403,'denied');};
    try{await assert.rejects(generate(current),{status:403});assert.deepEqual(attempts,['model']);}finally{model.onCheck();}
  });
  for(const fault of ['credential','wrong-role','unknown-tool','repeat-tool','oversized','redirect','outage','missing-content'])await t.test(`rejects ${fault} with retained attempt accounting`,async()=>{
    attempts=[];model.setFault(fault);
    try{await assert.rejects(generate(context()));assert.ok(attempts.includes('model'));if(fault==='outage')assert.equal(model.observations().calls,1);}
    finally{model.setFault('none');}
  });
});
