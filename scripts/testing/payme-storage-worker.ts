import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { launchPostgresFixture } from './postgres-fixture.ts';
import { launchIdeeoFixture } from './ideeo-fixture.ts';
import { fixtureFetch } from './fixture-http.ts';

const apiRoot = process.argv[2];
if (!apiRoot) throw new Error('Explicit isolated API source required');
const { admissionFixture } = await import(pathToFileURL(resolve(apiRoot, 'src/testing/admission.ts')).href);
const { createNicoJwt } = await import(pathToFileURL(resolve(apiRoot, 'src/core/nico-jwt.ts')).href);
const { sessions, waChannelBindings } = await import(pathToFileURL(resolve(apiRoot, 'src/db/schema.ts')).href);
const api = await admissionFixture();
let pg: Awaited<ReturnType<typeof launchPostgresFixture>> | undefined;
let product: Awaited<ReturnType<typeof launchIdeeoFixture>> | undefined;
const results: { name: string; status: number; sourceCalls: number }[] = [];
try {
  pg = await launchPostgresFixture();
  const permissions = 'conversation:read conversation:write';
  api.d.env.NICO_SCOPES = permissions;
  api.d.nicoJwt = createNicoJwt({ privateKeyPem: api.d.env.NICO_JWT_PRIVATE_KEY, kid: api.d.env.NICO_JWT_KID,
    issuer: api.d.env.NICO_JWT_ISSUER, ttlSeconds: api.d.env.NICO_JWT_TTL_SECONDS, scopes: permissions });
  api.state.grant.scopes = permissions.split(' ');
  const apiUrl = await api.listen();
  const key = () => randomBytes(32).toString('base64');
  const secrets = { STORAGE_DATABASE: pg.runtimeUrl, STORAGE_FINGERPRINT: key(),
    STORAGE_KEYS: JSON.stringify(Object.fromEntries(['alpha', 'beta', 'payme'].map(id => [id, { first: key() }]))) };
  product = await launchIdeeoFixture({ storage: { mode: 'synthetic', databaseEnv: 'STORAGE_DATABASE', keyringEnv: 'STORAGE_KEYS',
    fingerprintKeyEnv: 'STORAGE_FINGERPRINT', activeKeyId: 'first', contentTtlSeconds: 600, replayTtlSeconds: 1200 }, secrets,
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
    'protected-backend-error', 'unread-protected-value'];
  async function check(name: string, path: string, proof: string, expected: number, sourceCalls: number, body?: object, idempotency = randomUUID()) {
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
    return JSON.parse(raw) as { conversation_id: string; turn_id: string; event_id: string; turns: { turn_id: string }[] };
  }
  const sdkConversation = await check('cookie-exchanged SDK creates conversation', '/v2/conversations', sdk, 200, 3, {});
  const sdkPath = `/v2/conversations/${sdkConversation.conversation_id}/turns`, idempotency = randomUUID();
  const turn = await check('SDK commits synthetic turn', sdkPath, sdk, 200, 3, { message: 'synthetic.hello' }, idempotency);
  const waConversation = await check('WhatsApp creates separate conversation', '/v2/conversations', whatsapp, 200, 3, {});
  const waPath = `/v2/conversations/${waConversation.conversation_id}/turns`;
  await check('WhatsApp commits synthetic turn', waPath, whatsapp, 200, 3, { message: 'synthetic.hello' });
  await check('channel cannot read SDK history', sdkPath, whatsapp, 404, 1);
  await check('signed foreign tenant denied', sdkPath, await api.signedToken({ tenant_id: 'other' }), 401, 0);
  await check('signed different caller denied', sdkPath, await api.signedToken({ sub: 'other' }), 403, 0);
  await product.restart();
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
  api.state.beforeReply = async () => { if (api.state.calls === before + 3) await api.db.update(sessions).set({ revokedAt: new Date() }); };
  await check('logout before disclosure hides committed answer', sdkPath, sdk, 403, 3, { message: 'synthetic.follow-up' });
  delete api.state.beforeReply;
  await api.db.update(sessions).set({ revokedAt: null });
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
  console.log(JSON.stringify({ classification: 'actual API/product, synthetic identities and source; developer evidence only', postgres: pg.version, checks: results.length, results }));
} finally {
  await product?.stop();
  await pg?.stop();
  await api.close();
}
