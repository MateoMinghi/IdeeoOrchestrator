import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { fixtureFetch as fetch } from '../../scripts/testing/fixture-http.ts';
import { launchIdeeoFixture } from '../../scripts/testing/ideeo-fixture.ts';
import { parseIdeeoConfiguration } from './config.ts';
import { createAdmission } from './admission.ts';
import { AdmissionError } from './authority-client.ts';

test('product-only admission with two independently authenticated tenant services', async t => {
  const fixture = await launchIdeeoFixture();
  t.after(() => fixture.stop());
  const [alpha, beta] = fixture.tenants;
  const get = async (token?: string, path = '/v2/session', extra: Record<string, string> = {}) => {
    const res = await fetch(fixture.url + path, { headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), ...extra } });
    const body = await res.json();
    assert.ok(body && typeof body === 'object' && !Array.isArray(body));
    return { status: res.status, headers: res.headers, body: body as Record<string, unknown> };
  };
  const denied = async (token: string, status = 403) => {
    const result = await get(token);
    assert.equal(result.status, status);
    assert.deepEqual(result.body.error, { code: status === 403 ? 'access_denied' : status === 401 ? 'invalid_session' : 'authority_unavailable' });
    assert.equal(result.headers.get('cache-control'), 'no-store');
    assert.ok(!JSON.stringify(result.body).includes(token));
  };

  await t.test('SDK and WhatsApp enter only their configured tenant and presentation', async () => {
    for (const tenant of fixture.tenants) for (const channel of ['sdk', 'whatsapp'] as const) {
      const result = await get(await tenant.token(channel));
      assert.equal(result.status, 200);
      assert.equal(result.body.tenant_id, tenant.id);
      assert.equal(result.body.channel, channel);
      assert.equal(result.body.banking_presentation, channel === 'sdk' ? 'host' : 'protected_link');
      assert.equal(Object.hasOwn(result.body, 'grant'), false);
    }
    assert.equal(alpha.observations().calls, 2);
    assert.equal(beta.observations().calls, 2);
  });

  await t.test('missing proof, cookie-only access and body/channel hints do not establish identity', async () => {
    alpha.reset(); beta.reset();
    const result = await get(undefined, '/v2/session', { cookie: 'payme_session=synthetic', 'x-client-id': 'app' });
    assert.equal(result.status, 401);
    assert.match(result.headers.get('www-authenticate')!, /^Bearer /);
    assert.equal(alpha.observations().calls + beta.observations().calls, 0);
    const valid = await get(await alpha.token(), '/v2/session', { 'x-tenant-id': 'beta', 'x-client-id': 'whatsapp', cookie: 'private=synthetic' });
    assert.equal(valid.status, 200);
    assert.equal(valid.body.tenant_id, 'alpha');
    assert.equal(valid.body.channel, 'sdk');
    assert.equal(beta.observations().calls, 0);
    assert.equal(alpha.observations().forbiddenHeaders, false);
    assert.equal((await get(await alpha.token(), '/v2/session?channel=whatsapp')).status, 404);
  });

  await t.test('signed cross-tenant and different-caller claims cannot adopt overlapping resources', async () => {
    alpha.reset(); beta.reset();
    await denied(await alpha.token('sdk', { tenant_id: 'beta' }), 401);
    assert.equal(alpha.observations().calls + beta.observations().calls, 0);
    for (const claims of [{ sub: 'member-2' }, { grant_id: 'grant-2' }, { agent_account_id: 'assistant-2' }]) {
      await denied(await alpha.token('sdk', claims));
    }
    await denied(await alpha.token('sdk', { client_id: 'unregistered' }), 401);
  });

  for (const [name, patch] of Object.entries({
    membershipInactive: { membership: 'inactive' }, agentPaused: { agent: 'paused' },
    grantRevoked: { grant: 'revoked' }, grantExpired: { grantExpiresAt: 1 },
    scopeRemoved: { scopes: [] }, scopeNotGranted: { scopes: ['transfer:prepare'] },
  })) await t.test(name, async () => {
    alpha.reset();
    const token = await alpha.token();
    assert.equal((await get(token)).status, 200);
    alpha.set(patch as Parameters<typeof alpha.set>[0]);
    await denied(token);
    assert.equal(alpha.observations().calls, 2);
  });

  for (const [name, patch] of Object.entries({
    channelRevoked: { binding: 'revoked' }, channelExpired: { bindingExpiresAt: 1 },
    channelReplaced: { bindingId: 'generation-2' }, authenticationChanged: { bindingAuthTime: 1 },
  })) await t.test(name, async () => {
    alpha.reset();
    const token = await alpha.token('whatsapp');
    assert.equal((await get(token)).status, 200);
    alpha.set(patch as Parameters<typeof alpha.set>[0]);
    await denied(token);
  });

  for (const fault of ['outage', 'redirect', 'timeout', 'malformed', 'mismatch', 'oversized', 'echo', 'future', 'stale'] as const) {
    await t.test(`authority ${fault} fails unavailable without retries or cross-tenant fallback`, async () => {
      alpha.reset(); beta.reset(); alpha.set({ fault });
      const before = Date.now();
      await denied(await alpha.token(), 503);
      assert.ok(Date.now() - before < 5000);
      assert.equal(alpha.observations().calls, 1);
      assert.equal(beta.observations().calls, 0);
    });
  }

  await t.test('a replayed approval cannot satisfy a new admission request', async () => {
    alpha.reset();
    const token = await alpha.token();
    assert.equal((await get(token)).status, 200);
    alpha.set({ fault: 'replay' });
    await denied(token, 503);
  });

  await t.test('workload authentication and configured tenant removal have no fallback', async () => {
    alpha.reset(); beta.reset();
    const config = parseIdeeoConfiguration(fixture.config);
    const wrongSecret = await createAdmission(config, { ...fixture.environment, IDEEO_ALPHA_CREDENTIAL: 'incorrect-fixture-secret' });
    await assert.rejects(wrongSecret.admit(`Bearer ${await alpha.token()}`, new AbortController().signal),
      error => error instanceof AdmissionError && error.status === 403);
    const betaOnly = await createAdmission({ ...config, tenants: config.tenants.filter(tenant => tenant.tenantId === 'beta') }, fixture.environment);
    alpha.reset();
    await assert.rejects(betaOnly.admit(`Bearer ${await alpha.token()}`, new AbortController().signal));
    assert.equal(alpha.observations().calls + beta.observations().calls, 0);
  });

  await t.test('proof expiring during an authority call cannot be disclosed as admitted', async () => {
    alpha.reset(); alpha.set({ delayMs: 2100 });
    await denied(await alpha.token('sdk', { exp: Math.floor(Date.now() / 1000) + 2 }), 401);
  });

  await t.test('legacy routes, tool registration and conversation execution remain closed', async () => {
    const token = await beta.token();
    for (const path of ['/api/bots', '/api/config', '/api/mcp', '/v2/turns', '/v2/assistant', '/v1/turns', '/enterprise', '/v2/session/']) {
      assert.equal((await get(token, path)).status, 404);
    }
    const result = await fetch(fixture.url + '/v2/session', { method: 'POST', headers: { authorization: `Bearer ${token}` }, body: '{}' });
    assert.equal(result.status, 405);
    assert.equal(result.headers.get('allow'), 'GET');
    assert.equal((await get(undefined, '/health/live')).status, 200);
    assert.deepEqual(await readdir(join(fixture.root, 'home')), []);
    assert.equal(fixture.diagnostics(), '');
  });

  await t.test('missing configuration and missing secrets prevent startup; real destinations are disabled', async () => {
    assert.throws(() => parseIdeeoConfiguration({ ...fixture.config, tenants: [] }));
    const wrong = structuredClone(fixture.config);
    wrong.tenants[0].authority.url = 'https://real-bank.invalid/v2/engine/admission';
    assert.throws(() => parseIdeeoConfiguration(wrong));
    const unknown = { ...fixture.config, fallbackTenant: 'alpha' };
    assert.throws(() => parseIdeeoConfiguration(unknown));
    for (const missingConfig of [false, true]) {
      const configPath = join(fixture.root, 'startup-test.json');
      await writeFile(configPath, await fixture.configBytes());
      const child = spawn(process.execPath, ['--experimental-strip-types', fileURLToPath(new URL('../ideeo-main.ts', import.meta.url)),
        ...(missingConfig ? [] : ['--config', configPath])], {
        env: { SystemRoot: process.env.SystemRoot, USERPROFILE: join(fixture.root, 'home') },
        cwd: fixture.root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
      });
      let output = '';
      child.stdout.on('data', chunk => { output += chunk.toString(); });
      child.stderr.on('data', chunk => { output += chunk.toString(); });
      const code = await new Promise<number | null>((resolve, reject) => {
        const timer = setTimeout(() => { child.kill(); reject(new Error('Startup rejection timed out')); }, 5000);
        child.on('error', error => { clearTimeout(timer); reject(error); });
        child.on('close', result => { clearTimeout(timer); resolve(result); });
      });
      assert.equal(code, 1);
      assert.equal(output.includes('listening'), false);
      assert.equal(output.includes(alpha.credential), false);
    }
  });
});
