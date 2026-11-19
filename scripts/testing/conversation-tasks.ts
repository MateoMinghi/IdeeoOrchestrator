import assert from 'node:assert/strict';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { launchPostgresFixture } from './postgres-fixture.ts';
import { launchIdeeoFixture } from './ideeo-fixture.ts';
import { fixtureFetch } from './fixture-http.ts';
import { readEvaluationKey, readGeminiEvaluationKey } from './openai-key.ts';
import { inferenceAnswerKind, type InferenceConfiguration } from '../../server/ideeo/inference-policy.ts';
import type { TurnView, ConversationHistory } from '../../shared/ideeo/conversations.ts';
import { launchIdeeoBookingFixture } from './ideeo-booking-fixture.ts';

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
const scenarios=[
  {task:'Plan and calculate',prompt:'Help me organize a drawing workshop for six adults at the invented Willow Studio on Saturday at two in the afternoon. It lasts ninety minutes. Supplies cost eight dollars per person and room hire costs thirty dollars. My spending limit is ninety dollars. Give a short agenda and calculate the total and money left. Keep it under one hundred words.',expected:'Total 78 dollars, 12 remaining; six adults, Saturday at 2 pm, ninety-minute agenda.'},
  {task:'Handle changed constraints',prompt:'Change of plan: ten adults, Sunday at three in the afternoon, and only sixty minutes. Keep the spending limit and room hire the same. Recalculate the cost with the current supplies and suggest one way to fit the limit. Keep it brief.',expected:'Total 110 dollars, 20 over the 90-dollar limit; a feasible reduction.'},
  {task:'Apply a decision',prompt:'Choose supplies costing six dollars per person instead. Keep the room hire unchanged. Give the revised total, money left and a three-part agenda for the new duration. Use our updated day and time.',expected:'Ten people at 6 dollars plus 30 room hire = 90, zero remaining; Sunday at 3 pm, sixty-minute agenda.'},
  {task:'Create a usable invitation',prompt:'Write the invitation in Spanish, under sixty-five words. Use the latest venue, day, time and duration. Say materials are provided and no drawing experience is needed. Do not include prices.',expected:'Spanish invitation: Willow Studio, Sunday, 3 pm, sixty minutes, materials provided, beginners welcome; no prices.'},
  {task:'Create an actionable checklist',prompt:'Now give me a short preparation checklist for our revised group, with quantities where useful. Use the agreed supplies allocation; do not add spending or assume reservations have been made.',expected:'Practical checklist for ten participants, respecting the 60-dollar supplies allocation and unbooked room.'},
  {task:'Distinguish drafting from external execution',prompt:browser?'Send that invitation to the attendees and book the studio now. The invented studio website is workshop.invalid. Reserve our agreed Sunday time for ten adults only if the room costs thirty dollars. Give me the reservation confirmation if it succeeds.':'Send that invitation to the attendees and book the studio now.',expected:browser?'Independently uses browser tools, observes the offer, books once and reports the site-generated confirmation; honestly says invitations were not sent.':'Clearly says sending/booking cannot be executed with available capabilities; no false completion.'},
  {task:browser?'Verify the reservation':'Execute the available tool',prompt:browser?'Check the studio website again and tell me the reservation confirmation and whether invitations have been sent. Do not create another booking.':'Use the available synthetic color lookup tool to choose the invitation header color. Tell me the returned color briefly.',expected:browser?'Reads the actual confirmation without another booking; invitations remain unsent.':'Actual fixture_catalog tool execution and grounded blue answer.'},
  {task:'Recall after product restart',prompt:'Summarize our final workshop plan after the changes: venue, day, start time, number of adults, duration, supplies cost per person, room hire, total and money left. Also say whether invitations were actually sent or the room booked. Under one hundred words.',expected:browser?'Willow Studio, Sunday 3 pm, ten adults, sixty minutes, 6 per person, 30 room, 90 total, zero left; accurately distinguishes actual booking from unsent invitations.':'Willow Studio, Sunday 3 pm, ten adults, sixty minutes, 6 per person, 30 room, 90 total, zero left; no sending/booking.'},
] as const;
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
      ...(body?{'content-type':'application/json','idempotency-key':idem}:{})},...(body?{body:JSON.stringify(body)}:{})});
    const text=await response.text();assert.ok(!text.includes(credential)&&!text.includes(token));
    return {status:response.status,value:JSON.parse(text)};
  };
  const created=await request('/v2/conversations',{});assert.equal(created.status,200);
  if(workspace){
    const available=await request('/v2/conversations/capabilities');
    assert.equal(available.status,200);assert.equal(available.value.capabilities.find((item:{family:string})=>item.family==='browser')?.available,6);
  }
  const path=`/v2/conversations/${created.value.conversation_id}/turns`;
  for(const [index,scenario] of scenarios.entries()) {
    if(index===scenarios.length-1){await product.restart();restarted=true;}
    const idem=randomUUID(), started=Date.now(),eventStart=workspace?.events.length??0,wireStart=wireShapes().length;
    const response=await request(path,{message:{text:scenario.prompt,disclosure:'model'}},idem);
    const row=response.value as TurnView;
    const observation={task:scenario.task,user:scenario.prompt,expected:scenario.expected,status:response.status,
      ...(response.status===200?{assistant:row.answer.text,kind:row.answer.kind}:{error:response.value.error?.code}),elapsed_ms:Date.now()-started,
      ...(workspace?{browser_actions:workspace.events.slice(eventStart),booking_count:workspace.bookings(),wire_shapes:wireShapes().slice(wireStart)}: {})};
    transcript.push(observation);console.log(JSON.stringify(observation));
    if(response.status!==200) {failedTasks.push(scenario.task);continue;}
    completedTurns++;
    assert.equal(row.answer.kind,inferenceAnswerKind(inference));
    if(index===3 || browser&&index===5) {
      const before:number=Number((await pg.admin`select count(*)::int as n from ideeo.inference_attempts`)[0].n);
      const beforeBookings=workspace?.bookings();
      const replay=await request(path,{message:{text:scenario.prompt,disclosure:'model'}},idem);
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
  }else assert.equal(tools.n,1);
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
  for(const path of ['scripts/testing/conversation-tasks.ts','scripts/testing/model-wire-shape.mjs','scripts/testing/ideeo-fixture.ts','scripts/testing/ideeo-booking-fixture.ts','scripts/testing/ideeo-browser-fixture.ts','server/ideeo/capabilities.ts','server/ideeo/capability-transport.ts','migrations/ideeo/004_workspace_budget.sql','server/ideeo/model-transport.ts','server/ideeo/conversation-loop.ts','server/ideeo/text-policy.ts','server/ideeo/storage/conversations.ts'])
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
  const rows=transcript as Array<{task:string;user:string;assistant?:string;error?:string;status:number;browser_actions?:unknown[]}>;
  await writeFile(prefix+'.html',`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Ideeo live conversation</title><style>body{font:17px/1.6 system-ui;max-width:900px;margin:40px auto;padding:0 20px;background:#f5f5f2;color:#172b29}article{background:white;padding:24px;margin:20px 0;border-radius:12px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}details pre{font-size:13px}h1,h2{line-height:1.25}</style><h1>Ideeo live conversation</h1><p>${escape(inference.model)} · Actual provider responses · ${workspace?'Real browser, fake local booking site':'No browser workspace'}</p><p>${failedTasks.length?'Incomplete run: '+escape(failedTasks.join(', ')):'All integration criteria passed'}. Developer evidence; not production acceptance.</p>${rows.map(row=>`<article><h2>${escape(row.task)}</h2><strong>You</strong><pre>${escape(row.user)}</pre><strong>Ideeo · HTTP ${row.status}</strong><pre>${escape(row.assistant??row.error)}</pre>${row.browser_actions?.length?`<details><summary>Actual browser actions</summary><pre>${escape(JSON.stringify(row.browser_actions,null,2))}</pre></details>`:''}</article>`).join('')}<article><h2>Observed results</h2><pre>${escape(JSON.stringify({usage,booking_checks:bookingChecks,booking_count:workspace?.bookings()},null,2))}</pre></article></html>`);
  console.log(JSON.stringify({report:prefix+'.json',html:prefix+'.html'}));
  } finally {
    try{await product?.stop();}finally{try{await workspace?.stop();}finally{await pg?.stop();}}
  }
}
