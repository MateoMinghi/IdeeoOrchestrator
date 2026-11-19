import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { launchPostgresFixture } from './postgres-fixture.ts';
import { launchIdeeoFixture } from './ideeo-fixture.ts';
import { fixtureFetch } from './fixture-http.ts';
import { launchModelFixture } from './model-fixture.ts';
import { readEvaluationKey } from './openai-key.ts';
import { evaluateFreeForm, assertFreeFormRecall, type LiveFreeFormObservation } from './live-free-form.ts';

const apiRoot = process.argv[2];
const evaluation=process.argv.includes('--openai-evaluation');
const freeForm=process.argv.includes('--free-form'), ui=process.argv.includes('--ui');
if(ui && evaluation) throw new Error('Live evaluation does not use the scripted UI harness');
const loop=process.argv.includes('--loop') || evaluation || freeForm;
const evaluationKey=evaluation ? await readEvaluationKey(process.argv[process.argv.indexOf('--openai-evaluation')+1]) : undefined;
if (!apiRoot) throw new Error('Explicit isolated API source required');
const { admissionFixture } = await import(pathToFileURL(resolve(apiRoot, 'src/testing/admission.ts')).href);
const { createNicoJwt } = await import(pathToFileURL(resolve(apiRoot, 'src/core/nico-jwt.ts')).href);
const { sessions, waChannelBindings } = await import(pathToFileURL(resolve(apiRoot, 'src/db/schema.ts')).href);
const api = await admissionFixture();
let pg: Awaited<ReturnType<typeof launchPostgresFixture>> | undefined;
let product: Awaited<ReturnType<typeof launchIdeeoFixture>> | undefined;
let model: Awaited<ReturnType<typeof launchModelFixture>> | undefined;
const results: { name: string; status: number; sourceCalls: number }[] = [];
const semantics: LiveFreeFormObservation[]=[];
try {
  pg = await launchPostgresFixture();
  if(loop && !evaluation) model=await launchModelFixture();
  if(evaluation) await pg.admin`insert into ideeo.inference_budget(tenant_id,day,model_attempts,tool_attempts)
    values('payme',(clock_timestamp() at time zone 'UTC')::date,52,62)`;
  const permissions = 'conversation:read conversation:write'+(loop?' inference:invoke tool:fixture:read':'')+(freeForm?' inference:disclose':'');
  api.d.env.NICO_SCOPES = permissions;
  api.d.nicoJwt = createNicoJwt({ privateKeyPem: api.d.env.NICO_JWT_PRIVATE_KEY, kid: api.d.env.NICO_JWT_KID,
    issuer: api.d.env.NICO_JWT_ISSUER, ttlSeconds: api.d.env.NICO_JWT_TTL_SECONDS, scopes: permissions });
  api.state.grant.scopes = permissions.split(' ');
  const apiUrl = await api.listen();
  const key = () => randomBytes(32).toString('base64');
  const secrets = { STORAGE_DATABASE: pg.runtimeUrl, STORAGE_FINGERPRINT: key(),
    STORAGE_KEYS: JSON.stringify(Object.fromEntries(['alpha', 'beta', 'payme'].map(id => [id, { first: key() }]))),...(model?{FIXTURE_MODEL:model.credential}:{}),
    ...(evaluationKey?{OPENAI_EVALUATION_KEY:evaluationKey,IDEEO_OPENAI_EVALUATION:'synthetic-content-only'}:{}),...(freeForm?{IDEEO_FREE_FORM_EVALUATION:'synthetic-content-only'}:{}) };
  product = await launchIdeeoFixture({ storage: { mode: 'synthetic', databaseEnv: 'STORAGE_DATABASE', keyringEnv: 'STORAGE_KEYS',
    fingerprintKeyEnv: 'STORAGE_FINGERPRINT', activeKeyId: 'first', contentTtlSeconds: 600, replayTtlSeconds: 1200 }, secrets,
    ...(model?{inference:{mode:'synthetic' as const,url:model.url,model:'ideeo-fixture' as const,credentialEnv:'FIXTURE_MODEL',...(freeForm?{textMode:'free-form' as const}:{})}}:{}),
    ...(evaluation?{inference:{mode:'openai-evaluation' as const,url:'https://api.openai.com/v1' as const,model:'gpt-6-luna' as const,credentialEnv:'OPENAI_EVALUATION_KEY',...(freeForm?{textMode:'free-form' as const}:{})}}:{}),
    additionalTenants: [{ credential: api.workload, config: {
      issuer: api.d.env.NICO_JWT_ISSUER, tenantId: 'payme', audience: 'ai-engine',
      publicKeys: { [api.d.nicoJwt.kid]: api.d.nicoJwt.publicKeyPem },
      clients: [{ clientId: 'payme-app', channel: 'sdk' }, { clientId: 'payme-whatsapp', channel: 'whatsapp' }], delegationAudiences: ['payme-broker'],
      authority: { url: `${apiUrl}/v2/engine/admission`, credentialEnv: 'IDEEO_PAYME_CREDENTIAL', delegationAudience: 'payme-broker', timeoutMs: 3000, provenance: 'synthetic' },
    } }] });
  const exchange = await fixtureFetch(`${apiUrl}/api/nico/token`, { method: 'POST', headers: {
    origin: api.d.env.PUBLIC_ORIGIN, 'content-type': 'application/json', cookie: `payme_session=${api.sessionCredential}`,
  }, body: '{}' });
  assert.equal(exchange.status, 200);
  const { token: sdk } = await exchange.json() as { token: string };
  const whatsapp: string = await api.token('whatsapp');
  const protectedValues = [sdk, whatsapp, api.workload, api.bankCredential, api.sessionCredential, secrets.STORAGE_FINGERPRINT,
    'protected-backend-error', 'unread-protected-value',...(evaluationKey?[evaluationKey]:[])];
  async function check(name: string, path: string, proof: string, expected: number, sourceCalls: number, body?: object, idempotency: string = randomUUID()) {
    if(freeForm && body && 'message' in body && typeof body.message==='string') {
      const {fixturePrompts}=await import('../../server/ideeo/inference-policy.ts');
      body={message:{text:fixturePrompts[body.message as keyof typeof fixturePrompts],disclosure:'model'}};
      if(sourceCalls>=5) sourceCalls+=sourceCalls===9?4:2;
    }
    const before = api.state.calls, start = Date.now();
    const response = await fixtureFetch(product!.url + path, { method: body ? 'POST' : 'GET', headers: { authorization: `Bearer ${proof}`,
      ...(body ? { 'content-type': 'application/json', 'idempotency-key': idempotency } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    assert.equal(response.status, expected, name);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(api.state.calls - before, sourceCalls, name);
    assert.ok(Date.now() - start < 10000);
    const raw = await response.text();
    for (const secret of protectedValues) assert.ok(!raw.includes(secret) && !product!.diagnostics().includes(secret) && !JSON.stringify(api.logs).includes(secret), 'protected values absent');
    results.push({ name, status: response.status, sourceCalls });
    return JSON.parse(raw) as { conversation_id: string; turn_id: string; event_id: string; answer?:{kind:string;text:string}; turns: { turn_id: string }[] };
  }
  const sdkConversation = await check('cookie-exchanged SDK creates conversation', '/v2/conversations', sdk, 200, 3, {});
  const sdkPath = `/v2/conversations/${sdkConversation.conversation_id}/turns`, idempotency = randomUUID();
  const turn = await check('SDK commits synthetic turn', sdkPath, sdk, 200, loop?5:3, { message: 'synthetic.hello' }, idempotency);
  const waConversation = await check('WhatsApp creates separate conversation', '/v2/conversations', whatsapp, 200, 3, {});
  const waPath = `/v2/conversations/${waConversation.conversation_id}/turns`;
  await check('WhatsApp commits synthetic turn', waPath, whatsapp, 200, loop?5:3, { message: 'synthetic.hello' });
  if(loop) {
    const color=await check('current typed-tool authority and second inference round',sdkPath,sdk,200,9,{message:'synthetic.follow-up'});
    if(evaluation && freeForm) assert.ok(/blue/i.test(color.answer?.text??''),'Live answer uses the authorized color tool result');
  }
  if(ui) {
    const {verifyIdeeoUi}=await import('./ideeo-ui.ts');
    const beta=product.tenants[1];beta.set({scopes:permissions.split(' ')});
    const other=await beta.token('sdk',{scope:permissions});
    model!.setAnswer(()=> 'Join us in the invented moon garden.');
    await verifyIdeeoUi({apiUrl,productUrl:product.url,apiOrigin:api.d.env.PUBLIC_ORIGIN,cookie:api.sessionCredential,otherToken:other,answer:text=>model!.setAnswer(()=>text),
      revoke:async()=>{await api.db.update(sessions).set({revokedAt:new Date()});},
      restore:async()=>{await api.db.update(sessions).set({revokedAt:null});},
      attempts:async()=>Number((await pg!.admin`select count(*)::int as n from ideeo.inference_attempts where kind='model'`)[0].n)});
    model!.setAnswer();
  }
  if(evaluation && freeForm) {
    const before=Number((await pg.admin`select count(*)::int as n from ideeo.inference_attempts`)[0].n);
    await check('synthetic credential text denied before dispatch',sdkPath,sdk,422,1,{message:{text:'password: invented-secret',disclosure:'model'}});
    api.state.grant.scopes=permissions.split(' ').filter(scope=>scope!=='inference:disclose');
    try{await check('missing current disclosure permission denies live dispatch',sdkPath,sdk,403,2,{message:{text:'Write an invented story.',disclosure:'model'}});}
    finally{api.state.grant.scopes=permissions.split(' ');}
    assert.equal(Number((await pg.admin`select count(*)::int as n from ideeo.inference_attempts`)[0].n),before);
    semantics.push(...await evaluateFreeForm({
      turn:(name,message,key)=>check(name,sdkPath,sdk,200,7,{message},key),
      replay:(message,key)=>check('free-form committed replay',sdkPath,sdk,200,3,{message},key),
    }));
  }
  if(evaluation && !freeForm) {
    for(const [message,expected] of [['synthetic.draft','You are invited to our synthetic picnic on Saturday.'],
      ['synthetic.revise','Join our synthetic picnic on Saturday.'],['synthetic.recall','The last invitation was: Join our synthetic picnic on Saturday.']]) {
      const result=await check(message,sdkPath,sdk,200,5,{message});
      assert.equal(result.answer?.kind,'openmaus_openai_evaluation');assert.ok(result.answer?.text===expected,'Constrained live answer matched');
    }
  }
  await check('channel cannot read SDK history', sdkPath, whatsapp, 404, 1);
  await check('signed foreign tenant denied', sdkPath, await api.signedToken({ tenant_id: 'other' }), 401, 0);
  await check('signed different caller denied', sdkPath, await api.signedToken({ sub: 'other' }), 403, 0);
  await product.restart();
  if(evaluation && freeForm) semantics.push(assertFreeFormRecall(await check('free-form recall after process reload',sdkPath,sdk,200,7,
    {message:{text:'From our invitation before the security question, what is the final picnic place and day? Answer in English briefly. Do not use tools.',disclosure:'model'}})));
  if(evaluation && !freeForm) {
    const recalled=await check('live recall after process reload',sdkPath,sdk,200,5,{message:'synthetic.recall'});
    assert.ok(recalled.answer?.text==='The last invitation was: Join our synthetic picnic on Saturday.','Reloaded live context matched');
  }
  assert.equal((await check('reload uses current API admission', sdkPath, sdk, 200, 2)).turns[0].turn_id, turn.turn_id);
  assert.equal((await check('committed replay uses current API admission', sdkPath, sdk, 200, 3, { message: 'synthetic.hello' }, idempotency)).event_id, turn.event_id);
  api.state.grant.status = 'revoked';
  await check('grant revocation hides existing history', sdkPath, sdk, 403, 1);
  await check('grant revocation denies committed replay', sdkPath, sdk, 403, 1, { message: 'synthetic.hello' }, idempotency);
  api.state.grant.status = 'active';
  api.state.agent_account.status = 'paused';
  await check('paused agent denied', sdkPath, sdk, 403, 1);
  api.state.agent_account.status = 'active';
  const expiry = api.state.grant.expires_at;
  api.state.grant.expires_at = 1;
  await check('expired grant denied', sdkPath, sdk, 403, 1);
  api.state.grant.expires_at = expiry;
  api.state.grant.scopes = ['history:read'];
  await check('bank history scope does not authorize transcript', sdkPath, sdk, 403, 1);
  api.state.grant.scopes = permissions.split(' ');
  api.d.env.NICO_SCOPES = 'history:read';
  await check('tenant configuration cannot be enlarged by source', sdkPath, sdk, 403, 1);
  api.d.env.NICO_SCOPES = permissions;
  await api.db.update(sessions).set({ revokedAt: new Date() });
  await check('logout revokes stored history', sdkPath, sdk, 403, 0);
  await api.db.update(sessions).set({ revokedAt: null });
  await api.db.update(waChannelBindings).set({ generation: 'generation-2' });
  await check('rebinding revokes old channel transcript access', waPath, whatsapp, 403, 0);
  const rebound: string = await api.signedToken({ client_id: 'payme-whatsapp', channel_binding_id: 'generation-2' });
  protectedValues.push(rebound);
  await check('new channel generation cannot inherit old transcript', waPath, rebound, 404, 1);
  await api.db.update(waChannelBindings).set({ generation: 'generation-1' });
  const workload = api.d.env.ENGINE_BROKER_CREDENTIAL;
  api.d.env.ENGINE_BROKER_CREDENTIAL = 'incorrect-workload';
  await check('wrong workload denied', sdkPath, sdk, 403, 0);
  api.d.env.ENGINE_BROKER_CREDENTIAL = workload;
  for (const fault of ['outage', 'timeout', 'unsupported', 'echo']) {
    api.state.fault = fault;
    await check(`source ${fault} fails safely`, sdkPath, sdk, 503, 1);
  }
  api.state.fault = 'none';
  const before = api.state.calls;
  api.state.beforeReply = async () => { if (api.state.calls === before + (freeForm?7:loop?5:3)) await api.db.update(sessions).set({ revokedAt: new Date() }); };
  await check('logout before disclosure hides committed answer', sdkPath, sdk, 403, loop?5:3, { message: loop?'synthetic.hello':'synthetic.follow-up' });
  delete api.state.beforeReply;
  await api.db.update(sessions).set({ revokedAt: null });
  if(evaluation && freeForm) {
    const before=Number((await pg.admin`select count(*)::int as n from ideeo.inference_attempts`)[0].n);
    await pg.admin`update ideeo.inference_budget set model_attempts=64 where tenant_id='payme'`;
    await product.restart();
    const fresh=await check('exhausted tenant can create only an empty conversation','/v2/conversations',sdk,200,3,{});
    await check('exhausted budget denies live call after restart',`/v2/conversations/${fresh.conversation_id}/turns`,sdk,409,3,{message:{text:'Write an invented story.',disclosure:'model'}});
    assert.equal(Number((await pg.admin`select count(*)::int as n from ideeo.inference_attempts`)[0].n),before);
    const stored=JSON.stringify(await pg.admin`select user_content,answer_content from ideeo.turns`);
    for(const text of ['Velvet Orchard','Wednesday',...protectedValues])assert.ok(!stored.includes(text),'Durable ciphertext excludes tested plaintext and credentials');
  }
  api.d.env.CORE_API_MODE = 'tenant';
  await check('unsupported hosted evidence remains unavailable', sdkPath, sdk, 503, 0);
  api.d.env.CORE_API_MODE = 'sandbox';
  await api.native();
  await check('native financial capability grants no transcript permission', waPath, await api.token('whatsapp', true), 403, 0);
  await api.stopApi();
  await check('API outage denies history', sdkPath, sdk, 503, 0);
  assert.deepEqual(api.d.core.calls, []);
  assert.deepEqual(api.d.engine.turns, []);
  assert.deepEqual(api.d.engine.mediaObserved, []);
  assert.deepEqual(api.d.engine.executed, []);
  assert.equal(api.state.forbiddenHeaders, false);
  for (const secret of protectedValues) assert.ok(!pg.diagnostics().includes(secret));
  if(model){
    const input=JSON.stringify(model.observed.map(r=>r.messages));
    for(const secret of [...protectedValues,model.credential,'synthetic-private-reasoning'])assert.ok(!input.includes(secret));
    assert.ok(model.observations().calls>0);
  }
  console.log(JSON.stringify({ classification: evaluation ? freeForm ? 'actual OpenAI/API/product; bounded free-form synthetic-content evaluation, not independent acceptance' : 'actual OpenAI/API/product; constrained synthetic-content evaluation, not production acceptance' : 'actual API/product, synthetic identities and source; developer evidence only', loop, postgres: pg.version, checks: results.length, results, semantics }));
} finally {
  if(evaluation && pg) {
    try {
    const [usage]=await pg.admin`select count(*)::int as attempts,count(*) filter(where input_tokens is null)::int as unknown_usage,
      coalesce(sum(input_tokens),0)::int as input_tokens,coalesce(sum(output_tokens),0)::int as output_tokens
      from ideeo.inference_attempts where kind='model'`;
    console.log(JSON.stringify({evaluation:'gpt-6-luna',...usage,
      estimated_standard_usd:(Number(usage.input_tokens)*0.1+Number(usage.output_tokens)*0.5)/1000000,
      estimate_excludes_unknown_usage:true,provider_bill_verified:false}));
    } catch { console.log(JSON.stringify({evaluation:'gpt-6-luna',usage:'unavailable',provider_bill_verified:false})); }
  }
  await product?.stop();
  await model?.stop();
  await pg?.stop();
  await api.close();
}
