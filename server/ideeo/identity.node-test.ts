import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { exportSPKI, generateKeyPair, SignJWT } from 'jose';
import { createTenantVerifier, InvalidTenantSession, type TenantTrustProfile } from './identity.ts';

const keys = await generateKeyPair('ES256');
const otherKeys = await generateKeyPair('ES256');
const publicKey = await exportSPKI(keys.publicKey);
const otherPublicKey = await exportSPKI(otherKeys.publicKey);
const profile: TenantTrustProfile = {
  issuer: 'https://tenant.invalid', tenantId: 'payme', audience: 'ai-engine',
  publicKeys: { current: publicKey },
  clients: [{ clientId: 'payme-app', channel: 'sdk' }, { clientId: 'payme-whatsapp', channel: 'whatsapp' }],
  delegationAudiences: ['payme-broker'],
};
const otherProfile: TenantTrustProfile = {
  ...profile, issuer: 'https://other.invalid', tenantId: 'other', publicKeys: { current: otherPublicKey },
};
const verifier = await createTenantVerifier([profile, otherProfile]);

async function issue(overrides: Record<string, unknown> = {}, header: Record<string, unknown> = {}, signingKey = keys.privateKey) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    iss: profile.issuer, aud: ['ai-engine', 'payme-broker'], sub: 'member-1',
    tenant_id: 'payme', client_id: 'payme-app', agent_account_id: 'assistant-1', grant_id: 'grant-1',
    kind: 'customer', scope: 'history:read', iat: now, nbf: now, exp: now + 300,
    auth_time: now - 60, jti: 'synthetic-token', ...overrides,
  }).setProtectedHeader({ alg: 'ES256', typ: 'at+jwt', kid: 'current', ...header }).sign(signingKey);
}

function invalid(error: unknown) {
  assert.ok(error instanceof InvalidTenantSession);
  assert.equal(error.code, 'invalid_session');
  assert.equal(error.status, 401);
  assert.equal(error.message, 'invalid_session');
  assert.equal(error.cause, undefined);
  return true;
}

test('SDK proof maps to the configured client; serialized identity contains no proof or invented scopes', async () => {
  const token = await issue({ channel: 'whatsapp', bank_backend: 'native_core_preproduction' });
  const session = await verifier.verifyAuthorization(`Bearer ${token}`);
  assert.equal(session.principal.channel, 'sdk');
  assert.deepEqual(session.principal.scopes, ['history:read']);
  assert.equal(session.principal.membershipId, 'member-1');
  assert.ok(Object.isFrozen(session.principal));
  assert.ok(Object.isFrozen(session.principal.scopes));
  assert.ok(!JSON.stringify(session).includes(token));
  assert.ok(!JSON.stringify(session).includes('native_core_preproduction'));
  assert.equal(session.delegationFor('payme-broker'), token);
  assert.throws(() => session.delegationFor('ai-engine'), invalid);
  assert.throws(() => session.delegationFor('https://attacker.invalid'), invalid);
});

test('WhatsApp proof requires a signed channel generation and retains its distinct calling client', async () => {
  const token = await issue({ client_id: 'payme-whatsapp', channel_binding_id: 'generation-7' });
  const session = await verifier.verifyAuthorization(`Bearer ${token}`);
  assert.equal(session.principal.channel, 'whatsapp');
  assert.equal(session.principal.clientId, 'payme-whatsapp');
  assert.equal(session.principal.channelBindingId, 'generation-7');
  const missing = await issue({ client_id: 'payme-whatsapp' });
  await assert.rejects(verifier.verifyAuthorization(`Bearer ${missing}`), invalid);
});

test('overlapping customer/client IDs stay bound to distinct issuers and tenants', async () => {
  const token = await issue({ iss: otherProfile.issuer, tenant_id: 'other' }, {}, otherKeys.privateKey);
  const session = await verifier.verifyAuthorization(`Bearer ${token}`);
  assert.equal(session.principal.tenantId, 'other');
  const crossed = await issue({ iss: otherProfile.issuer }, {}, otherKeys.privateKey);
  await assert.rejects(verifier.verifyAuthorization(`Bearer ${crossed}`), invalid);
  const wrongKey = await issue({}, {}, otherKeys.privateKey);
  await assert.rejects(verifier.verifyAuthorization(`Bearer ${wrongKey}`), invalid);
});

test('rejects invalid, stale or insufficiently bound proof without exposing validation details', async t => {
  const now = Math.floor(Date.now() / 1000);
  const cases: Record<string, Record<string, unknown>> = {
    expired: { exp: now - 1, iat: now - 100, nbf: now - 100, auth_time: now - 100 },
    future: { nbf: now + 20 },
    futureIssue: { iat: now + 20 },
    invalidAuthTime: { auth_time: now + 20 },
    excessiveLifetime: { exp: now + 901 },
    reversedLifetime: { exp: now - 1 },
    fractionalTime: { auth_time: now - 0.5 },
    wrongAudience: { aud: ['payme-broker'] },
    unknownIssuer: { iss: 'https://untrusted.invalid' },
    unknownClient: { client_id: 'external-agent' },
    wrongKind: { kind: 'service' },
    missingGrant: { grant_id: undefined },
    controlCharacter: { sub: 'member\n1' },
    emptyScope: { scope: '' },
    absentScope: { scope: undefined },
    malformedScope: { scope: ['history:read'] },
    missingAuthentication: { auth_time: undefined },
  };
  for (const [name, claims] of Object.entries(cases)) {
    await t.test(name, async () => {
      const token = await issue(claims);
      await assert.rejects(verifier.verifyAuthorization(`Bearer ${token}`), invalid);
    });
  }
});

test('rejects malformed credentials, tampering and token-supplied key locations', async () => {
  for (const header of [undefined, null, '', 'Basic x', 'Bearer x.y.z', `Bearer ${'x'.repeat(8200)}`]) {
    await assert.rejects(verifier.verifyAuthorization(header), invalid);
  }
  for (const header of [{ typ: 'JWT' }, { kid: 'missing' }, { jku: 'https://untrusted.invalid/keys' }]) {
    const token = await issue({}, header);
    await assert.rejects(verifier.verifyAuthorization(`Bearer ${token}`), invalid);
  }
  const token = await issue();
  const segments = token.split('.');
  segments[1] = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(segments[1], 'base64url').toString()), client_id: 'payme-whatsapp' })).toString('base64url');
  await assert.rejects(verifier.verifyAuthorization(`Bearer ${segments.join('.')}`), invalid);
  const engineOnly = await issue({ aud: ['ai-engine'] });
  const session = await verifier.verifyAuthorization(`Bearer ${engineOnly}`);
  assert.throws(() => session.delegationFor('payme-broker'), invalid);
});

test('configuration rejects ambiguous clients/issuers and supports explicit key rotation', async () => {
  await assert.rejects(createTenantVerifier([profile, profile]));
  await assert.rejects(createTenantVerifier([{ ...profile, clients: [...profile.clients, { clientId: 'payme-app', channel: 'whatsapp' }] }]));
  await assert.rejects(createTenantVerifier([{ ...profile, publicKeys: {} }]));
  const rotated = await createTenantVerifier([{ ...profile, publicKeys: { next: otherPublicKey } }]);
  await assert.rejects(rotated.verifyAuthorization(`Bearer ${await issue()}`), invalid);
  const token = await issue({}, { kid: 'next' }, otherKeys.privateKey);
  assert.equal((await rotated.verifyAuthorization(`Bearer ${token}`)).principal.tenantId, 'payme');
});

test('previously authenticated proof cannot be forwarded after its expiry', async t => {
  const session = await verifier.verifyAuthorization(`Bearer ${await issue()}`);
  t.mock.timers.enable({ apis: ['Date'], now: (session.principal.expiresAt + 1) * 1000 });
  assert.throws(() => session.delegationFor('payme-broker'), invalid);
});

test('isolated HTTP fixture accepts tenant-issued Bearer proof; cookie and channel hints cannot authenticate', async t => {
  const server = createServer(async (request, response) => {
    try {
      const session = await verifier.verifyAuthorization(request.headers.authorization);
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify(session.principal));
    } catch {
      response.writeHead(401);
      response.end('invalid_session');
    }
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const url = `http://127.0.0.1:${address.port}/identity?channel=whatsapp`;
  const unauthenticated = await fetch(url, { headers: { cookie: 'payme_session=synthetic', 'x-client-id': 'payme-app' } });
  assert.equal(unauthenticated.status, 401);
  const sdk = await fetch(url, { headers: { authorization: `Bearer ${await issue()}`, 'x-client-id': 'payme-whatsapp' } });
  assert.equal(sdk.status, 200);
  const body = await sdk.json();
  assert.ok(body && typeof body === 'object' && 'channel' in body);
  assert.equal(body.channel, 'sdk');
});
