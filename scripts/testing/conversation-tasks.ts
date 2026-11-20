import assert from 'node:assert/strict';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { launchPostgresFixture } from './postgres-fixture.ts';
import { launchIdeeoFixture } from './ideeo-fixture.ts';
import { fixtureFetch } from './fixture-http.ts';
import { readEvaluationKey, readGeminiEvaluationKey } from './openai-key.ts';
import { inferenceAnswerKind, type InferenceConfiguration } from '../../server/ideeo/inference-policy.ts';
import type { TurnView, ConversationHistory, TurnStatus } from '../../shared/ideeo/conversations.ts';
import { launchIdeeoBookingFixture } from './ideeo-booking-fixture.ts';

import { workshopPrompt, workshopScenarios } from './workshop-scenarios.ts';

const args=process.argv.slice(2),gemini=args.includes('--gemini');
if(gemini)args.splice(args.indexOf('--gemini'),1);
const browser=args.includes('--browser');
if(browser)args.splice(args.indexOf('--browser'),1);
const [flag,keyFile,...extra]=args;
if(flag!=='--key-file' || !keyFile || extra.length)throw new Error('Explicit authorized --key-file required');
const credential=await (gemini?readGeminiEvaluationKey:readEvaluationKey)(keyFile);
const inference:InferenceConfiguration=gemini
  ?{mode:'gemini-evaluation',url:'https://generativelanguage.googleapis.com/v1beta/openai',model:'gemini-2.5-flash-lite',credentialEnv:'MODEL',textMode:'free-form'}
  :{mode:'openai-evaluation',url:'https://api.openai.com/v1',model:'gpt-6-luna',credentialEnv:'MODEL',textMode:'free-form'};
const scenarios=workshopScenarios(browser);
let pg:Awaited<ReturnType<typeof launchPostgresFixture>>|undefined;
let product:Awaited<ReturnType<typeof launchIdeeoFixture>>|undefined;
let workspace:Awaited<ReturnType<typeof launchIdeeoBookingFixture>>|undefined;
const transcript:object[]=[];
const failedTasks:string[]=[];
let completedTurns=0;
let replayChecks=0,restarted=false;
let bookingChecks:Record<string,boolean>|undefined;
const wireShapes=()=>product?.diagnostics().split('\n').flatMap(line=>{try{const row=JSON.parse(line);return row.evaluation_wire_shape?[row.evaluation_wire_shape]:[];}catch{return [];}})??[];
const maxModelCalls=browser?24:12,maxToolCalls=browser?20:2;
try {
  pg=await launchPostgresFixture();
  await pg.admin`insert into ideeo.inference_budget(tenant_id,day,model_attempts,tool_attempts) values('alpha',(clock_timestamp() at time zone 'UTC')::date,${64-maxModelCalls},${64-maxToolCalls})`;
  if(browser)workspace=await launchIdeeoBookingFixture(join(pg.root,'workspace'));
  const key=()=>randomBytes(32).toString('base64');
  product=await launchIdeeoFixture({guardHostImports:true,traceModelShape:browser,
    ...(workspace?{capabilities:[workspace.route]}:{}),
    storage:{mode:'synthetic',databaseEnv:'DB',keyringEnv:'KEYS',fingerprintKeyEnv:'FINGERPRINT',activeKeyId:'first',contentTtlSeconds:600,replayTtlSeconds:1200},
    inference,
    secrets:{DB:pg.runtimeUrl,KEYS:JSON.stringify({alpha:{first:key()},beta:{first:key()}}),FINGERPRINT:key(),MODEL:credential,...(workspace?{WORKSPACE:workspace.credential}:{}),
      [gemini?'IDEEO_GEMINI_EVALUATION':'IDEEO_OPENAI_EVALUATION']:'synthetic-content-only',IDEEO_FREE_FORM_EVALUATION:'synthetic-content-only'}});
  const tenant=product.tenants[0], scopes=['conversation:read','conversation:write','inference:invoke','inference:disclose',...(workspace?['tool:browser:interact','inference:disclose:images']:['tool:fixture:read'])];
  tenant.set({scopes});
  const token=await tenant.token('sdk',{scope:scopes.join(' ')});
  const request=async(path:string,body?:object,idem:string=randomUUID())=>{
    const response=await fixtureFetch(product!.url+path,{timeoutMs:browser?70000:10000,method:body?'POST':'GET',headers:{authorization:`Bearer ${token}`,
      ...(body?{'content-type':'application/json'}:{}),...((body || path.endsWith('/status'))?{'idempotency-key':idem}:{})},...(body?{body:JSON.stringify(body)}:{})});
    const text=await response.text();assert.ok(!text.includes(credential)&&!text.includes(token));
    return {status:response.status,value:JSON.parse(text)};
  };
  const created=await request('/v2/conversations',{});assert.equal(created.status,200);
  const observeRequest = async (...args: Parameters<typeof request>) => {
    try { return await request(...args); }
    catch (error) {
      if (error instanceof assert.AssertionError) throw error;
      return {status:null,value:{error:{code:'response_unavailable'}}};
    }
  };
  if(workspace){
    const available=await request('/v2/conversations/capabilities');
    assert.equal(available.status,200);assert.equal(available.value.capabilities.find((item:{family:string})=>item.family==='browser')?.available,6);
  }
  const path=`/v2/conversations/${created.value.conversation_id}/turns`;
  const committed = new Set<string>();
  let unresolved: string | undefined;
  for(const [index,scenario] of scenarios.entries()) {
    const next = workshopPrompt(scenario, committed);
    if (unresolved || !next.prompt) {
      transcript.push({task:scenario.task, outcome:'not_run', blocked_by:unresolved ? [unresolved] : next.blocked_by});
      continue;
    }
    if(index===scenarios.length-1){await product.restart();restarted=true;}
    const idem=randomUUID(), started=Date.now(),eventStart=workspace?.events.length??0,wireStart=wireShapes().length;
    const input = {message:{text:next.prompt,disclosure:'model'}};
    const response = await observeRequest(path,input,idem);
    let row: TurnView | undefined = response.status===200 ? response.value : undefined;
    let recovery: string | undefined;
    if (!row) {
      const lookup = await observeRequest(path+'/status',undefined,idem);
      const receipt: TurnStatus | undefined = lookup.status===200 ? lookup.value : undefined;
      recovery = receipt?.status ?? 'unknown';
      if (receipt?.status==='committed') {
        const history = await observeRequest(path);
        if (history.status===200) row = (history.value as ConversationHistory).turns.find(turn=>turn.turn_id===receipt.turn_id);
      }
      if (!row) {
        failedTasks.push(scenario.task);
        if (recovery!=='uncommitted' || !['model_timeout','model_unavailable'].includes(response.value.error?.code)) unresolved=scenario.id;
      }
    }
    const observation={task:scenario.task,user:next.prompt,expected:scenario.expected,status:response.status,
      ...(response.status!==200?{error:response.value.error?.code,recovery}:{}),
      ...(next.restated_after?{restated_after:next.restated_after}:{}),
      ...(row?{assistant:row.answer.text,kind:row.answer.kind}:{}),elapsed_ms:Date.now()-started,
      ...(workspace?{browser_actions:workspace.events.slice(eventStart),booking_count:workspace.bookings(),wire_shapes:wireShapes().slice(wireStart)}: {})};
    transcript.push(observation);console.log(JSON.stringify(observation));
    if(!row)continue;
    completedTurns++;
    committed.add(scenario.id);
    assert.equal(row.answer.kind,inferenceAnswerKind(inference));
    if(index===3 || browser&&index===5) {
      const before:number=Number((await pg.admin`select count(*)::int as n from ideeo.inference_attempts`)[0].n);
      const beforeBookings=workspace?.bookings();
      const replay=await request(path,input,idem);
      assert.equal(replay.value.event_id,row.event_id);
      assert.equal(Number((await pg.admin`select count(*)::int as n from ideeo.inference_attempts`)[0].n),before);
      assert.equal(workspace?.bookings(),beforeBookings);
      replayChecks++;
    }
  }
  const history=await request(path);assert.equal(history.status,200);
  assert.equal((history.value as ConversationHistory).turns.length,completedTurns);
  const [tools]=await pg.admin`select count(*)::int as n from ideeo.inference_attempts where kind='tool'`;
  if(workspace) {
    const answers=transcript as Array<{assistant?:string;browser_actions?:Array<{name:string;status:string}>}>;
    bookingChecks={booked_once:workspace.bookings()===1,model_opened_site:workspace.events.some(e=>e.name==='agent_browser_open'&&e.status==='succeeded'),
      model_clicked:workspace.events.some(e=>e.name==='agent_browser_click'&&e.status==='succeeded'),
      grounded_booking_answer:answers[5]?.assistant?.includes(workspace.confirmation)??false,
      verified_with_browser:Boolean(answers[6]?.browser_actions?.some(e=>e.status==='succeeded'))&&(answers[6]?.assistant?.includes(workspace.confirmation)??false)};
    if(Object.values(bookingChecks).some(passed=>!passed))failedTasks.push('Browser booking criteria');
    console.log(JSON.stringify({booking_checks:bookingChecks}));
  }else if(committed.has('verify') && !failedTasks.length) assert.equal(tools.n,1);
  const stored=JSON.stringify(await pg.admin`select user_content,answer_content from ideeo.turns`);
  for(const value of ['Willow Studio',credential,token])assert.ok(!stored.includes(value)&&!product.diagnostics().includes(value));
  console.log(JSON.stringify({integration:failedTasks.length?'incomplete':'passed',failed_tasks:failedTasks,committed_turns:completedTurns,tool_reservations:tools.n,restart:restarted,replay_checks:replayChecks,semantic_review:'inspect actual answers against recorded expectations'}));
  if(failedTasks.length)process.exitCode=1;
} catch(error) {
  failedTasks.push('Campaign aborted before all integration checks completed');
  throw error;
} finally {
  try {
  let usage:unknown;
  let committedTurns:number|undefined;
  if(pg) {
    const [measured]=await pg.admin`select count(*)::int as model_calls,count(*) filter(where input_tokens is null)::int as unknown_usage,
      coalesce(sum(input_tokens),0)::int as input_tokens,coalesce(sum(output_tokens),0)::int as output_tokens from ideeo.inference_attempts where kind='model'`;
    usage={...measured};console.log(JSON.stringify({usage}));
    committedTurns=Number((await pg.admin`select count(*)::int as n from ideeo.turns`)[0].n);
  }
  const hashes=[];
  for(const path of ['scripts/testing/conversation-tasks.ts','scripts/testing/workshop-scenarios.ts','scripts/testing/model-wire-shape.mjs','scripts/testing/ideeo-fixture.ts','scripts/testing/ideeo-booking-fixture.ts','scripts/testing/ideeo-browser-fixture.ts','server/ideeo/capabilities.ts','server/ideeo/capability-transport.ts','migrations/ideeo/004_workspace_budget.sql','server/ideeo/model-transport.ts','server/ideeo/conversation-loop.ts','server/ideeo/text-policy.ts','server/ideeo/storage/conversations.ts'])
    hashes.push({path,sha256:createHash('sha256').update(await readFile(path)).digest('hex')});
  const report={model:inference.model,synthetic_content:true,transport:'actual product API and live provider; isolated signed tenant authority fixture',
    recorded_at:new Date().toISOString(),max_model_calls:maxModelCalls,max_tool_calls:maxToolCalls,transcript,usage,committed_turns:committedTurns,failed_tasks:failedTasks,hashes,restarted,replay_checks:replayChecks,
    ...(workspace?{browser:'actual OpenMaus Chrome/CDP against an owned local fake site',browser_actions:workspace.events,booking_count:workspace.bookings(),confirmation:workspace.confirmation,booking_checks:bookingChecks,
      wire_shapes:wireShapes(),database_idle_timeouts:(pg?.diagnostics().match(/terminating connection due to idle-in-transaction timeout/g)??[]).length}:{}),production_acceptance:false};
  assert.ok(!JSON.stringify(report).includes(credential));
  if(workspace)assert.ok(!JSON.stringify(report).includes(workspace.credential));
  const prefix=`output/ideeo-realistic-tasks-${gemini?'gemini-':''}${browser?'browser-':''}${new Date().toISOString().replace(/[:.]/g,'-')}`;
  await writeFile(prefix+'.json',JSON.stringify(report,null,2)+'\n');
  const escape=(value:unknown)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
  const rows=transcript as Array<{task:string;user:string;assistant?:string;error?:string;status:number|null;outcome?:string;blocked_by?:string[];recovery?:string;browser_actions?:unknown[]}>;
  await writeFile(prefix+'.html',`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Ideeo live conversation</title><style>body{font:17px/1.6 system-ui;max-width:900px;margin:40px auto;padding:0 20px;background:#f5f5f2;color:#172b29}article{background:white;padding:24px;margin:20px 0;border-radius:12px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}details pre{font-size:13px}h1,h2{line-height:1.25}</style><h1>Ideeo live conversation</h1><p>${escape(inference.model)} · Actual provider responses · ${workspace?'Real browser, fake local booking site':'No browser workspace'}</p><p>${failedTasks.length?'Incomplete run: '+escape(failedTasks.join(', ')):'All integration criteria passed'}. Developer evidence; not production acceptance.</p>${rows.map(row=>`<article><h2>${escape(row.task)}</h2>${row.outcome==='not_run' ? `<p>Not run. Missing prerequisite or unresolved action: ${escape(row.blocked_by?.join(', '))}</p></article>` : `<strong>You</strong><pre>${escape(row.user)}</pre><strong>Ideeo · ${row.status ? 'HTTP '+row.status : 'No HTTP response'}</strong><pre>${escape(row.assistant??row.error)}</pre>${row.recovery?`<p>Recovery check: ${escape(row.recovery)}</p>`:''}${row.browser_actions?.length?`<details><summary>Actual browser actions</summary><pre>${escape(JSON.stringify(row.browser_actions,null,2))}</pre></details>`:''}</article>`}`).join('')}<article><h2>Observed results</h2><pre>${escape(JSON.stringify({usage,booking_checks:bookingChecks,booking_count:workspace?.bookings()},null,2))}</pre></article></html>`);
  console.log(JSON.stringify({report:prefix+'.json',html:prefix+'.html'}));
  } finally {
    try{await product?.stop();}finally{try{await workspace?.stop();}finally{await pg?.stop();}}
  }
}
