import assert from 'node:assert/strict';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { launchPostgresFixture } from './postgres-fixture.ts';
import { launchIdeeoFixture } from './ideeo-fixture.ts';
import { launchIdeeoBookingFixture } from './ideeo-booking-fixture.ts';
import { fixtureFetch } from './fixture-http.ts';
import { readEvaluationKey } from './openai-key.ts';

const [flag,keyFile,...extra]=process.argv.slice(2),restartOnly=flag==='--restart-only'&&!keyFile;
if(!restartOnly&&(flag!=='--key-file'||!keyFile||extra.length))throw new Error('Explicit authorized key file required');
const credential=restartOnly?randomBytes(32).toString('hex'):await readEvaluationKey(keyFile!);
let pg:Awaited<ReturnType<typeof launchPostgresFixture>>|undefined;
let product:Awaited<ReturnType<typeof launchIdeeoFixture>>|undefined;
let workspace:Awaited<ReturnType<typeof launchIdeeoBookingFixture>>|undefined;
const observations:unknown[]=[];
let phase='startup',failure:unknown,booked=false;
try {
  phase='PostgreSQL startup';
  pg=await launchPostgresFixture();
  await pg.admin`insert into ideeo.inference_budget(tenant_id,day,model_attempts,tool_attempts) values('alpha',(clock_timestamp() at time zone 'UTC')::date,52,54)`;
  phase='browser workspace startup';workspace=await launchIdeeoBookingFixture(join(pg.root,'workspace'));
  const key=()=>randomBytes(32).toString('base64');
  phase='product startup';product=await launchIdeeoFixture({guardHostImports:true,traceModelShape:true,traceModelDetails:true,startupTimeoutMs:restartOnly?30000:10000,capabilities:[workspace.route],
    storage:{mode:'synthetic',databaseEnv:'DB',keyringEnv:'KEYS',fingerprintKeyEnv:'FINGERPRINT',activeKeyId:'first',contentTtlSeconds:600,replayTtlSeconds:1200},
    inference:{mode:'openai-evaluation',url:'https://api.openai.com/v1',model:'gpt-6-luna',credentialEnv:'MODEL',textMode:'free-form'},
    secrets:{DB:pg.runtimeUrl,KEYS:JSON.stringify({alpha:{first:key()},beta:{first:key()}}),FINGERPRINT:key(),MODEL:credential,WORKSPACE:workspace.credential,
      IDEEO_OPENAI_EVALUATION:'synthetic-content-only',IDEEO_FREE_FORM_EVALUATION:'synthetic-content-only'}});
  const tenant=product.tenants[0],scopes=['conversation:read','conversation:write','inference:invoke','inference:disclose','tool:browser:interact','inference:disclose:images'];
  tenant.set({scopes});const token=await tenant.token('sdk',{scope:scopes.join(' ')});
  const request=async(path:string,body?:object,idem=randomUUID())=>{
    const started=Date.now();
    const response=await fixtureFetch(product!.url+path,{method:body?'POST':'GET',timeoutMs:70000,
      headers:{authorization:`Bearer ${token}`,...(body?{'content-type':'application/json','idempotency-key':idem}:{})},...(body?{body:JSON.stringify(body)}:{})});
    const value=await response.json() as Record<string,unknown>;
    const observation={phase,status:response.status,elapsed_ms:Date.now()-started,...(body?{input:body}:{}),response:value};
    assert.ok(!JSON.stringify(observation).includes(credential)&&!JSON.stringify(observation).includes(token));
    observations.push(observation);console.log(JSON.stringify(observation));
    return {status:response.status,value};
  };
  phase='create booking conversation';
  const created=await request('/v2/conversations',{});assert.equal(created.status,200);
  const path=`/v2/conversations/${created.value.conversation_id}/turns`;
  if(!restartOnly){
  phase='self-contained booking';
  const body={message:{text:'Book the invented Willow Studio at workshop.invalid for ten adults this Sunday from three to four in the afternoon. I authorize the reservation only if the room hire is thirty dollars. Inspect the website, complete the reservation if it matches, and tell me its confirmation. Do not send invitations.',disclosure:'model'}};
  const idem=randomUUID(),booking=await request(path,body,idem);
  booked=booking.status===200&&workspace.bookings()===1&&JSON.stringify(booking.value).includes(workspace.confirmation);
  if(booked){
    phase='replay committed booking';const calls=workspace.events.length;
    await request(path,body,idem);assert.equal(workspace.events.length,calls);assert.equal(workspace.bookings(),1);
    phase='verify booking';await request(path,{message:{text:'Read the studio website again and report my reservation confirmation. Do not make another reservation.',disclosure:'model'}});
  }
  phase='create independent planning conversation';
  const plan=await request('/v2/conversations',{});assert.equal(plan.status,200);
  phase='self-contained arithmetic';
  await request(`/v2/conversations/${plan.value.conversation_id}/turns`,{message:{text:'For an invented workshop, ten adults need supplies costing six dollars each. Room hire is thirty dollars and the total budget is ninety dollars. Calculate the total and remaining budget. No research or booking is needed.',disclosure:'model'}});
  }
  for(let i=1;i<=5;i++){
    phase=`restart ${i}`;await product.restart();
    phase=`history after restart ${i}`;assert.equal((await request(path)).status,200);
  }
}catch(error){
  await new Promise(resolve=>setTimeout(resolve,100));
  const code=error&&typeof error==='object'&&'code' in error?String(error.code):'unknown';
  failure={phase,code:['ECONNRESET','ECONNREFUSED','ABORT_ERR','ERR_ASSERTION'].includes(code)?code:'other',process:product?.processStatus(),
    frames:error instanceof Error?error.stack?.split('\n').filter(line=>/^\s+at /.test(line)):undefined};
  console.log(JSON.stringify({failure}));process.exitCode=1;
}finally{
  try {
    const usage=pg?(await pg.admin`select count(*)::int as calls,count(*) filter(where input_tokens is null)::int as unknown_usage,coalesce(sum(input_tokens),0)::int as input_tokens,coalesce(sum(output_tokens),0)::int as output_tokens from ideeo.inference_attempts where kind='model'`)[0]:undefined;
    const files=['server/ideeo/model-transport.ts','server/ideeo/conversation-loop.ts','server/ideeo/storage/conversations.ts','server/ideeo/capabilities.ts','scripts/testing/model-wire-shape.mjs','scripts/testing/booking-diagnosis.ts'];
    const hashes=await Promise.all(files.map(async path=>({path,sha256:createHash('sha256').update(await readFile(path)).digest('hex')})));
    const report={model:'gpt-6-luna',synthetic:true,restart_only:restartOnly,booked,failure,usage,observations,actions:workspace?.events,bookings:workspace?.bookings(),confirmation:workspace?.confirmation,lifecycle:product?.lifecycle(),
      wire:product?.diagnostics().split('\n').flatMap(line=>{try{const row=JSON.parse(line);return row.evaluation_wire_shape?[row.evaluation_wire_shape]:[];}catch{return [];}}),
      database_idle_timeouts:(pg?.diagnostics().match(/terminating connection due to idle-in-transaction timeout/g)??[]).length,process:product?.processStatus(),hashes,production_acceptance:false};
    const text=JSON.stringify(report,null,2);assert.ok(!text.includes(credential));
    const path=`output/ideeo-booking-diagnosis-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
    await writeFile(path,text+'\n');
    const escape=(value:unknown)=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
    await writeFile(path.replace('.json','.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Ideeo booking diagnosis</title><style>body{font:17px/1.6 system-ui;max-width:900px;margin:40px auto;padding:0 20px;background:#f5f5f2;color:#172b29}article{background:white;padding:24px;margin:20px 0;border-radius:12px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}details pre{font-size:13px}</style><h1>Ideeo booking diagnosis</h1><p>Actual OpenAI model and native browser; invented data and local booking site.</p><p>Booking ${booked?'confirmed':'not confirmed'}. ${failure?'Campaign also encountered a separate failure.':''} Developer evidence; not production acceptance.</p>${observations.map(value=>{const row=value as {phase:string;status:number;elapsed_ms:number;input?:{message?:{text:string}};response:{answer?:{text:string}}};return `<article><h2>${escape(row.phase)}</h2><p>HTTP ${row.status} · ${row.elapsed_ms} ms</p>${row.input?.message?`<strong>You</strong><pre>${escape(row.input.message.text)}</pre>`:''}${row.response.answer?`<strong>Ideeo</strong><pre>${escape(row.response.answer.text)}</pre>`:`<details><summary>API response</summary><pre>${escape(JSON.stringify(row.response,null,2))}</pre></details>`}</article>`;}).join('')}<article><h2>Evidence</h2><pre>${escape(JSON.stringify({booked,failure,usage,actions:report.actions,lifecycle:report.lifecycle},null,2))}</pre></article></html>`);
    console.log(JSON.stringify({report:path,booked,usage}));
    if(!booked&&!restartOnly)process.exitCode=1;
  }finally{try{await product?.stop();}finally{try{await workspace?.stop();}finally{await pg?.stop();}}}
}
