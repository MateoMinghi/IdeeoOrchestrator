import assert from 'node:assert/strict';
import test from 'node:test';
import { createProductClient, payMeToken } from './client.ts';
import { CONVERSATION_VERSION } from '../../shared/ideeo/conversations.ts';

test('product client uses fresh proof, bounded scope, committed pagination and safe errors',async t=>{
  const original=globalThis.fetch;t.after(()=>{globalThis.fetch=original;});
  const id='00000000-0000-4000-8000-000000000001', signal=new AbortController().signal;
  const calls:{path:string;init:RequestInit}[]=[];let tokens=0;
  let reply:(path:string,init:RequestInit)=>Response=()=>Response.json({});
  globalThis.fetch=async(input,init={})=>{const path=String(input);calls.push({path,init});return reply(path,init);};
  const client=createProductClient(async()=>`synthetic-token-${++tokens}`);
  const turn=(sequence:number)=>({conversation_id:id,turn_id:id,status:'completed',sequence,message:{text:'Invented text',disclosure:'model'},answer:{kind:'free_form_fixture',text:'Invented answer'}});
  reply=path=>Response.json(path==='/v2/session'?{api_version:'2',status:'admitted'}:{api_version:CONVERSATION_VERSION,conversation_id:id,turns:[turn(path.includes('after=0')?1:2)],next_after:path.includes('after=0')?1:null});
  assert.equal((await client.history(id,signal)).length,2);assert.equal(tokens,1);
  for(const call of calls){assert.equal(call.init.credentials,'omit');assert.equal(call.init.redirect,'error');assert.equal(call.init.cache,'no-store');assert.equal((call.init.headers as Record<string,string>).authorization,'Bearer synthetic-token-1');}
  calls.length=0;
  reply=path=>Response.json(path==='/v2/session'?{api_version:'2',status:'admitted'}:{api_version:CONVERSATION_VERSION,conversation_id:id,status:'completed',turn_id:id});
  await client.append(id,'Invented text','same-request',signal);await client.append(id,'Invented text','same-request',signal);
  assert.equal(tokens,3);assert.deepEqual(calls.filter(c=>c.init.method==='POST').map(c=>(c.init.headers as Record<string,string>)['idempotency-key']),['same-request','same-request']);
  assert.ok(calls.every(c=>!c.path.includes('synthetic-token')));
  reply=()=>Response.json({error:{code:'admission_denied'},secret:'private error'},{status:403});calls.length=0;
  await assert.rejects(client.history(id,signal),{message:'admission_denied',status:403});assert.equal(calls.length,1);
  reply=path=>Response.json(path==='/v2/session'?{api_version:'2',status:'admitted'}:{api_version:CONVERSATION_VERSION,conversation_id:id,turns:[turn(2)],next_after:null});
  await assert.rejects(client.history(id,signal),{code:'unavailable'});
  reply=()=>Response.json({padding:'x'.repeat(262144)});await assert.rejects(client.check(signal),{code:'unavailable'});
  reply=()=>Response.json({token:'cookie-exchanged-synthetic-token'});calls.length=0;
  assert.equal(await payMeToken(signal),'cookie-exchanged-synthetic-token');
  assert.equal(calls[0].path,'/api/nico/token');assert.equal(calls[0].init.credentials,'same-origin');assert.equal(calls[0].init.redirect,'error');
});

test('aborted identity refresh cannot dispatch a product request',async()=>{
  const controller=new AbortController();let finish!:(token:string)=>void;
  const client=createProductClient(()=>new Promise(resolve=>{finish=resolve;}));
  const pending=client.check(controller.signal);controller.abort();finish('late-synthetic-proof');
  await assert.rejects(pending,{name:'AbortError'});
});
