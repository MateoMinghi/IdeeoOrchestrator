import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { openMausCapabilityHandlers } from './openmaus-tools.ts';
import { permittedCapabilityText } from './text-policy.ts';
import type { ChatToolSession } from '../drivers/chat-tool-session.ts';

test('synthetic capability observations cannot disguise real destinations or credentials',()=>{
  for(const text of ['https://workshop.invalid/','attendee@workshop.invalid','An invented workshop.'])assert.equal(permittedCapabilityText(text,1000),true);
  for(const text of ['https://workshop.invalid.evil.example/','attendee@workshop.invalid.evil.example','https://user:pass@workshop.invalid/','https://workshop.invalid/?key=held','password: held','https://workshop.invalid/#held'])assert.equal(permittedCapabilityText(text,1000),false,text);
  assert.equal(permittedCapabilityText('https://held-credential.invalid/',1000,['held-credential']),false);
});
test('native OpenMaus session adapter preserves schema, approvals, revocation and output restrictions',async()=>{
  const tool={name:'native_task',family:'apps' as const,description:'Perform an invented task.',permission:'tool:apps:execute',inputSchema:{type:'object',properties:{},additionalProperties:false}};
  let effects=0,allowed=false,asks=0,images=false;
  const session:ChatToolSession={definitions:[{type:'function',function:{name:'upstream_task',description:tool.description,parameters:tool.inputSchema}}],
    skipped:[],trimmed:[],merged:[],budget:{limit:1,listed:1,servers:[]},refit:async()=>{},join:async()=>undefined,close:async()=>{},
    validate:(_name,args)=>{assert.deepEqual(args,{});},view:()=>({title:'Task',input:{},ask:true}),execute:async()=>{effects++;return {ok:true,text:'Completed.',...(images?{images:[{type:'image_url' as const,image_url:{url:'data:image/png;base64,not-qualified'}}]}:{})};}};
  const handlers=openMausCapabilityHandlers({session,bindings:[{tool,nativeName:'upstream_task'}],authorize:async(_name,_args,approval)=>{if(approval)asks++;if(!allowed)throw Error('Denied');}});
  const context={conversationId:randomUUID(),attemptId:randomUUID(),signal:new AbortController().signal};
  await assert.rejects(handlers.get('native_task')!({},context));assert.equal(effects,0);
  allowed=true;assert.equal(await handlers.get('native_task')!({},context),'Completed.');assert.equal(effects,1);assert.equal(asks,2);
  images=true;await assert.rejects(handlers.get('native_task')!({},context),/Invalid workspace image/);images=false;
  session.definitions[0].function.parameters={type:'string'};
  await assert.rejects(handlers.get('native_task')!({},context),/contract changed/);assert.equal(effects,2);
  assert.throws(()=>openMausCapabilityHandlers({session,bindings:[{tool,nativeName:'missing'}],authorize:async()=>{}}),/contract mismatch/);
});
