import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { launchIdeeoFixture } from '../../../scripts/testing/ideeo-fixture.ts';
import { launchPostgresFixture } from '../../../scripts/testing/postgres-fixture.ts';
import { fixtureFetch } from '../../../scripts/testing/fixture-http.ts';
import type { ConversationHistory, TurnView } from '../../../shared/ideeo/conversations.ts';
import { parseStorageConfiguration, storageDatabaseUrl, type StorageConfiguration } from './config.ts';
import { createContentProtection, type CallerScope } from './crypto.ts';
import { openStorageDatabase, verifyRuntimeRole } from './database.ts';

const key = () => randomBytes(32).toString('base64');
function latch() {
  let resolve!: () => void;
  const promise = new Promise<void>(done => { resolve = done; });
  return { promise, resolve };
}
const permissions = ['conversation:read', 'conversation:write'];
const storage: StorageConfiguration = { mode: 'synthetic', databaseEnv: 'STORAGE_DATABASE', keyringEnv: 'STORAGE_KEYS',
  fingerprintKeyEnv: 'STORAGE_FINGERPRINT', activeKeyId: 'first', contentTtlSeconds: 600, replayTtlSeconds: 1200 };
const scope: CallerScope = { tenant_id: 'alpha', membership_id: 'member-1', client_id: 'app',
  agent_account_id: 'assistant-1', grant_id: 'grant-1', channel: 'sdk', channel_binding_id: '' };
type Body = ConversationHistory & TurnView & { error: { code: string } };

test('storage configuration refuses real destinations and incomplete evidence', () => {
  assert.deepEqual(parseStorageConfiguration(storage), storage);
  for (const patch of [{ mode: 'production' }, { contentTtlSeconds: 0 }, { replayTtlSeconds: 600 }, { extra: true }]) {
    assert.throws(() => parseStorageConfiguration({ ...storage, ...patch }));
  }
  const url = 'postgres://ideeo_runtime:synthetic@127.0.0.1:5432/ideeo_fixture_0123456789abcdef01234567';
  assert.equal(storageDatabaseUrl(url, 'ideeo_runtime'), url);
  for (const bad of [url.replace('127.0.0.1', 'bank.example'), url.replace('ideeo_runtime', 'fixture_admin'), url + '?sslmode=disable', url.replace('ideeo_fixture_', 'customer_')]) {
    assert.throws(() => storageDatabaseUrl(bad, 'ideeo_runtime'));
  }
  assert.throws(() => createContentProtection(storage, ['alpha'], {}));
  assert.throws(() => createContentProtection(storage, ['alpha', 'beta'], { STORAGE_KEYS: JSON.stringify({ alpha: { first: key() } }), STORAGE_FINGERPRINT: key() }));
});

test('ciphertext authenticates every caller and resource binding', () => {
  const protection = createContentProtection(storage, ['alpha'], { STORAGE_KEYS: JSON.stringify({ alpha: { first: key() } }), STORAGE_FINGERPRINT: key() });
  const binding = { scope, conversationId: randomUUID(), turnId: randomUUID(), sequence: 1, expiresAt: new Date().toISOString() };
  const encrypted = protection.encrypt(binding, 'user', 'synthetic.hello');
  assert.equal(protection.decrypt(binding, 'user', encrypted), 'synthetic.hello');
  for (const field of Object.keys(scope)) {
    assert.throws(() => protection.decrypt({ ...binding, scope: { ...scope, [field]: 'another' } }, 'user', encrypted), field);
  }
  for (const patch of [{ conversationId: randomUUID() }, { turnId: randomUUID() }, { sequence: 2 }, { expiresAt: 'other' }]) {
    assert.throws(() => protection.decrypt({ ...binding, ...patch }, 'user', encrypted));
  }
  assert.throws(() => protection.decrypt(binding, 'answer', encrypted));
  assert.throws(() => protection.decrypt(binding, 'user', { ...encrypted, kid: 'missing' }));
  assert.throws(() => protection.decrypt(binding, 'user', { ...encrypted, data: 'AAAA' }));
});

test('actual product process with disposable PostgreSQL', { timeout: 180000 }, async t => {
  const pg = await launchPostgresFixture();
  t.after(() => pg.stop());
  t.diagnostic(pg.version);
  const keys = { alpha: { first: key() }, beta: { first: key() } };
  const fixture = await launchIdeeoFixture({ storage: { ...storage }, secrets: {
    STORAGE_DATABASE: pg.runtimeUrl, STORAGE_KEYS: JSON.stringify(keys), STORAGE_FINGERPRINT: key(),
  } });
  t.after(() => fixture.stop());
  const [alpha, beta] = fixture.tenants;
  for (const tenant of fixture.tenants) tenant.set({ scopes: permissions });
  const token = (tenant = alpha, channel: 'sdk' | 'whatsapp' = 'sdk', overrides: Record<string, unknown> = {}) => tenant.token(channel, { scope: permissions.join(' '), ...overrides });
  let sdk = await token();
  const whatsapp = await token(alpha, 'whatsapp'), second = await token(beta);
  const request = async (path: string, proof = sdk, body?: object, idempotency: string = randomUUID()) => {
    const response = await fixtureFetch(fixture.url + path, { method: body === undefined ? 'GET' : 'POST',
      headers: { authorization: `Bearer ${proof}`, ...(body ? { 'content-type': 'application/json', 'idempotency-key': idempotency } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}) });
    assert.equal(response.headers.get('cache-control'), 'no-store');
    return { status: response.status, body: await response.json() as Body };
  };
  const create = async (proof = sdk, idempotency = randomUUID()) => {
    const result = await request('/v2/conversations', proof, {}, idempotency);
    assert.equal(result.status, 200, JSON.stringify(result.body));
    return result.body;
  };
  const append = (id: string, idempotency = randomUUID(), proof = sdk, message = 'synthetic.hello') => request(`/v2/conversations/${id}/turns`, proof, { message }, idempotency);
  const history = (id: string, proof = sdk, query = '') => request(`/v2/conversations/${id}/turns${query}`, proof);
  const counts = async (id: string) => {
    const [row] = await pg.admin`select (select count(*)::int from ideeo.turns where conversation_id=${id}) as turns,
      (select count(*)::int from ideeo.outbox where conversation_id=${id}) as events,
      (select next_sequence from ideeo.conversations where id=${id}) as next`;
    return { turns: row.turns, events: row.events, next: row.next };
  };
  const gate = (offset: number) => {
    const at = alpha.observations().calls + offset;
    const reached = latch(), released = latch();
    alpha.onCheck(async call => { if (call === at) { reached.resolve(); await released.promise; } });
    return { wait: (pending: Promise<{ status: number; body: Body } | null>) => Promise.race([reached.promise,
      pending.then(result => { throw new Error(`Admission gate not reached: status ${result?.status}, code ${result?.body.error?.code}`); }),
      delay(5000, undefined, { ref: false }).then(() => { throw new Error('Admission gate not reached'); })]),
      release: () => { alpha.onCheck(); released.resolve(); } };
  };
  const runtime = openStorageDatabase(pg.runtimeUrl, 'ideeo_runtime');
  const maintenance = openStorageDatabase(pg.maintenanceUrl, 'ideeo_maintenance');
  t.after(async () => { await runtime.end(); await maintenance.end(); });
  const inScope = (caller: CallerScope, work: (tx: import('postgres').TransactionSql) => Promise<unknown>) => runtime.begin(async tx => {
    await tx`select set_config('ideeo.caller', ${JSON.stringify(caller)}, true)`;
    return work(tx);
  });
  let conversation: Body;
  let first: Body;

  await t.test('SDK, WhatsApp and independent second tenant persist completed turns', async () => {
    conversation = await create();
    const initialCalls = alpha.observations().calls;
    const result = await append(conversation.conversation_id);
    assert.equal(result.status, 200);
    first = result.body;
    assert.equal(first.sequence, 1);
    assert.equal(first.answer.kind, 'synthetic_storage');
    assert.equal(alpha.observations().calls - initialCalls, 3);
    assert.deepEqual(await counts(conversation.conversation_id), { turns: 1, events: 1, next: 2 });
    for (const proof of [whatsapp, second]) {
      const own = await create(proof, 'same-key-is-per-caller');
      assert.equal((await append(own.conversation_id, 'same-turn-key-is-per-caller', proof)).status, 200);
      assert.equal((await history(own.conversation_id, proof)).body.turns.length, 1);
      assert.equal((await history(conversation.conversation_id, proof)).status, 404);
      assert.equal((await append(conversation.conversation_id, randomUUID(), proof)).status, 404);
      assert.equal((await history(own.conversation_id, sdk)).status, 404);
    }
    assert.equal(alpha.observations().forbiddenHeaders, false);
  });

  await t.test('restricted roles and forced RLS isolate every scope component', async () => {
    await verifyRuntimeRole(runtime);
    assert.equal((await runtime`select * from ideeo.conversations`).length, 0);
    await inScope(scope, async tx => { assert.ok((await tx`select id from ideeo.conversations`).length > 0); });
    for (const field of Object.keys(scope)) {
      await inScope({ ...scope, [field]: 'other' }, async tx => {
        assert.equal((await tx`select id from ideeo.conversations where id=${conversation.conversation_id}`).length, 0, field);
        assert.equal((await tx`select id from ideeo.turns where id=${first.turn_id}`).length, 0, field);
        assert.equal((await tx`select id from ideeo.outbox where id=${first.event_id}`).length, 0, field);
      });
    }
    assert.equal((await runtime`select * from ideeo.turns`).length, 0);
    for (const query of ['TRUNCATE ideeo.turns', 'SET ROLE ideeo_owner', 'SELECT * FROM ideeo.purge_expired()',
      'DELETE FROM ideeo.turns', 'UPDATE ideeo.turns SET user_content=NULL', 'CREATE TABLE ideeo.escape(id int)']) {
      await assert.rejects(runtime.unsafe(query), { code: '42501' });
    }
    await assert.rejects(maintenance`select * from ideeo.turns`, { code: '42501' });
    await assert.rejects(inScope({ ...scope, membership_id: 'other' }, tx => tx`insert into ideeo.conversations select * from ideeo.conversations where false
      union all select ${tx.json(scope)},${randomUUID()},${'a'.repeat(64)},now(),now()+interval '1 hour',now()+interval '2 hours',1`), { code: '42501' });
    await assert.rejects(inScope({ ...scope, membership_id: 'other' }, tx => tx`insert into ideeo.turns
      (scope,id,conversation_id,idempotency_key,fingerprint,sequence,status,created_at,expires_at)
      values (${tx.json({ ...scope, membership_id: 'other' })},${randomUUID()},${conversation.conversation_id},${'a'.repeat(64)},${'b'.repeat(64)},1,'completed',now(),now()+interval '1 hour')`), { code: '23503' });
  });

  await t.test('idempotency survives retry and rejects changed input or conversation', async () => {
    const idempotency = randomUUID();
    const created = await create(sdk, idempotency);
    assert.equal((await create(sdk, idempotency)).conversation_id, created.conversation_id);
    const result = await append(created.conversation_id, idempotency);
    const repeated = await append(created.conversation_id, idempotency);
    assert.equal(result.status, 200);
    for (const field of ['turn_id', 'event_id', 'sequence', 'created_at'] as const) assert.equal(repeated.body[field], result.body[field]);
    assert.equal((await append(created.conversation_id, idempotency, sdk, 'synthetic.follow-up')).status, 409);
    assert.equal((await append(conversation.conversation_id, idempotency)).status, 409);
    assert.deepEqual(await counts(created.conversation_id), { turns: 1, events: 1, next: 2 });
  });

  await t.test('concurrent duplicate and distinct writes retain one ordered committed record', async () => {
    const own = await create(), idempotency = randomUUID();
    const results = await Promise.all(Array.from({ length: 8 }, () => append(own.conversation_id, idempotency)));
    assert.ok(results.every(r => [200, 409].includes(r.status)));
    assert.ok(results.some(r => r.status === 200));
    assert.deepEqual(await counts(own.conversation_id), { turns: 1, events: 1, next: 2 });
    const ids = Array.from({ length: 5 }, () => randomUUID());
    await Promise.all(ids.map(async id => {
      for (let attempt = 0; attempt < 20; attempt++) {
        const result = await append(own.conversation_id, id);
        if (result.status === 200) return;
        assert.equal(result.status, 409);
        await delay(25);
      }
      assert.fail('Concurrent retry did not complete');
    }));
    assert.deepEqual(await counts(own.conversation_id), { turns: 6, events: 6, next: 7 });
    assert.deepEqual((await history(own.conversation_id)).body.turns.map(turn => turn.sequence), [1, 2, 3, 4, 5, 6]);
    const page = await history(own.conversation_id, sdk, '?limit=1');
    assert.equal(page.body.turns.length, 1);
    assert.equal(page.body.next_after, 1);
    assert.deepEqual((await history(own.conversation_id, sdk, '?after=1&limit=50')).body.turns.map(turn => turn.sequence), [2, 3, 4, 5, 6]);
  });

  await t.test('revocation, scope removal and channel rebinding apply after prior success', async () => {
    for (const patch of [{ membership: 'revoked' }, { agent: 'paused' }, { grant: 'revoked' }, { grantExpiresAt: 1 }] as const) {
      alpha.set(patch);
      assert.equal((await history(conversation.conversation_id)).status, 403);
      assert.equal((await append(conversation.conversation_id)).status, 403);
      alpha.set({ membership: 'active', agent: 'active', grant: 'active', grantExpiresAt: Math.floor(Date.now() / 1000) + 600 });
    }
    alpha.set({ scopes: ['history:read'] });
    assert.equal((await history(conversation.conversation_id)).status, 403);
    alpha.set({ scopes: ['conversation:read'] });
    assert.equal((await history(conversation.conversation_id)).status, 200);
    assert.equal((await append(conversation.conversation_id)).status, 403);
    alpha.set({ scopes: permissions });
    assert.equal((await history(conversation.conversation_id, await token(alpha, 'sdk', { scope: 'history:read' }))).status, 403);
    const own = await create(whatsapp);
    alpha.set({ bindingId: 'generation-2' });
    assert.equal((await history(own.conversation_id, whatsapp)).status, 403);
    const rebound = await token(alpha, 'whatsapp', { channel_binding_id: 'generation-2' });
    assert.equal((await history(own.conversation_id, rebound)).status, 404);
    assert.equal((await create(rebound)).conversation_id.length, 36);
    alpha.set({ bindingId: 'generation-1' });
    sdk = await token(alpha, 'sdk', { jti: randomUUID() });
    assert.equal((await history(conversation.conversation_id)).status, 200);
  });

  await t.test('revocation before commit rolls back all records', async () => {
    const own = await create(), hold = gate(2);
    const pending = append(own.conversation_id);
    try {
      await hold.wait(pending);
      assert.deepEqual(await counts(own.conversation_id), { turns: 0, events: 0, next: 1 });
      alpha.set({ grant: 'revoked' });
    } finally { hold.release(); }
    assert.equal((await pending).status, 403);
    alpha.set({ grant: 'active' });
    assert.deepEqual(await counts(own.conversation_id), { turns: 0, events: 0, next: 1 });
  });

  await t.test('revocation after commit suppresses disclosure and replay', async () => {
    const own = await create(), hold = gate(3), idempotency = randomUUID();
    const pending = append(own.conversation_id, idempotency);
    try {
      await hold.wait(pending);
      assert.deepEqual(await counts(own.conversation_id), { turns: 1, events: 1, next: 2 });
      alpha.set({ grant: 'revoked' });
    } finally { hold.release(); }
    const denied = await pending;
    assert.equal(denied.status, 403);
    assert.equal(denied.body.answer, undefined);
    assert.equal((await append(own.conversation_id, idempotency)).status, 403);
    alpha.set({ grant: 'active' });
    assert.equal((await append(own.conversation_id, idempotency)).body.sequence, 1);
  });

  await t.test('revocation between history load and disclosure suppresses stored content', async () => {
    const hold = gate(2), pending = history(conversation.conversation_id);
    try { await hold.wait(pending); alpha.set({ membership: 'revoked' }); } finally { hold.release(); }
    const denied = await pending;
    assert.equal(denied.status, 403);
    assert.equal(denied.body.turns, undefined);
    alpha.set({ membership: 'active' });
  });

  await t.test('a failure at COMMIT never publishes a completed answer', async () => {
    const own = await create(), idempotency = randomUUID();
    await pg.admin.unsafe(`CREATE FUNCTION ideeo.fixture_fail_commit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic commit rejection'; END $$;
      CREATE CONSTRAINT TRIGGER fixture_fail_commit AFTER INSERT ON ideeo.outbox DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION ideeo.fixture_fail_commit()`);
    try {
      const failed = await append(own.conversation_id, idempotency);
      assert.equal(failed.status, 503);
      assert.equal(failed.body.error.code, 'storage_unavailable');
      assert.equal(failed.body.answer, undefined);
      assert.deepEqual(await counts(own.conversation_id), { turns: 0, events: 0, next: 1 });
    } finally {
      await pg.admin.unsafe('DROP TRIGGER fixture_fail_commit ON ideeo.outbox; DROP FUNCTION ideeo.fixture_fail_commit()');
    }
    assert.equal((await append(own.conversation_id, idempotency)).body.sequence, 1);
  });

  await t.test('process death before commit rolls back and allows a single retry', async () => {
    const own = await create(), idempotency = randomUUID(), hold = gate(2);
    const pending = append(own.conversation_id, idempotency).catch(() => null);
    try { await hold.wait(pending); await fixture.kill(); } finally { hold.release(); }
    assert.equal(await pending, null);
    await fixture.restart();
    assert.deepEqual(await counts(own.conversation_id), { turns: 0, events: 0, next: 1 });
    assert.equal((await append(own.conversation_id, idempotency)).body.sequence, 1);
  });

  await t.test('process death after commit recovers the same receipt and history', async () => {
    const own = await create(), idempotency = randomUUID(), hold = gate(3);
    const pending = append(own.conversation_id, idempotency).catch(() => null);
    let committed: { id: string; event_id: string } | undefined;
    try {
      await hold.wait(pending);
      [committed] = await pg.admin<{ id: string; event_id: string }[]>`select t.id,o.id as event_id from ideeo.turns t join ideeo.outbox o on o.turn_id=t.id where t.conversation_id=${own.conversation_id}`;
      assert.ok(committed);
      await fixture.kill();
    } finally { hold.release(); }
    assert.equal(await pending, null);
    await fixture.restart();
    const retry = await append(own.conversation_id, idempotency);
    assert.equal(retry.body.turn_id, committed.id);
    assert.equal(retry.body.event_id, committed.event_id);
    assert.equal((await history(own.conversation_id)).body.turns[0].turn_id, committed.id);
    assert.deepEqual(await counts(own.conversation_id), { turns: 1, events: 1, next: 2 });
  });

  await t.test('ciphertext and opaque replay markers exclude inputs, answers and proofs', async () => {
    const rows = await pg.admin`select * from ideeo.turns`;
    const serialized = JSON.stringify(rows);
    for (const forbidden of ['synthetic.hello', 'Synthetic greeting recorded.', sdk, whatsapp, alpha.credential, fixture.environment.STORAGE_FINGERPRINT!]) {
      assert.equal(serialized.includes(forbidden), false);
    }
    assert.ok(rows.every(row => row.user_content.v === 1 && row.answer_content.v === 1));
    const events = await pg.admin`select * from ideeo.outbox`;
    assert.ok(events.every(event => !Object.hasOwn(event, 'answer') && !Object.hasOwn(event, 'content')));
    const [original] = await pg.admin`select user_content,answer_content from ideeo.turns where id=${first.turn_id}`;
    await pg.admin`update ideeo.turns set user_content=answer_content where id=${first.turn_id}`;
    try {
      const corrupt = await history(conversation.conversation_id);
      assert.equal(corrupt.status, 503);
      assert.equal(corrupt.body.turns, undefined);
    } finally { await pg.admin`update ideeo.turns set user_content=${pg.admin.json(original.user_content)} where id=${first.turn_id}`; }
  });

  await t.test('retained keys decrypt prior turns while new writes use the active rotation', async () => {
    const rotated = { alpha: { ...keys.alpha, second: key() }, beta: { ...keys.beta, second: key() } };
    fixture.environment.STORAGE_KEYS = JSON.stringify(rotated);
    fixture.config.storage = { ...fixture.config.storage!, activeKeyId: 'second' };
    await fixture.restart();
    assert.equal((await history(conversation.conversation_id)).status, 200);
    const result = await append(conversation.conversation_id);
    assert.equal(result.status, 200);
    const [row] = await pg.admin`select user_content->>'kid' as kid from ideeo.turns where id=${result.body.turn_id}`;
    assert.equal(row.kid, 'second');
    fixture.environment.STORAGE_KEYS = JSON.stringify({ alpha: { second: rotated.alpha.second }, beta: { second: rotated.beta.second } });
    await fixture.restart();
    assert.equal((await history(conversation.conversation_id)).status, 503);
    fixture.environment.STORAGE_KEYS = JSON.stringify(rotated);
    await fixture.restart();
    assert.equal((await history(conversation.conversation_id)).status, 200);
  });

  await t.test('startup rejects privileged runtime and disabled forced RLS', async () => {
    await pg.admin`alter role ideeo_runtime bypassrls`;
    try { await assert.rejects(fixture.restart(), /Fixture exited/); } finally { await pg.admin`alter role ideeo_runtime nobypassrls`; }
    await pg.admin`alter table ideeo.turns no force row level security`;
    try { await assert.rejects(fixture.restart(), /Fixture exited/); } finally { await pg.admin`alter table ideeo.turns force row level security`; }
    await fixture.restart();
  });

  await t.test('deliberately weakening RLS is detected by the independent isolation assertion', async () => {
    const isolation = () => inScope(scope, async tx => {
      const rows = await tx`select scope from ideeo.conversations`;
      assert.ok(rows.every(row => JSON.stringify(Object.fromEntries(Object.entries(row.scope).sort())) === JSON.stringify(Object.fromEntries(Object.entries(scope).sort()))));
    });
    await isolation();
    await pg.admin.unsafe('ALTER POLICY caller_scope ON ideeo.conversations USING (true)');
    try { await assert.rejects(isolation(), assert.AssertionError); } finally {
      await pg.admin.unsafe("ALTER POLICY caller_scope ON ideeo.conversations USING (scope = nullif(current_setting('ideeo.caller', true), '')::jsonb)");
    }
    await isolation();
  });

  await t.test('authority outage and database lock failure are bounded safe responses', async () => {
    alpha.set({ fault: 'timeout' });
    const start = Date.now();
    try { assert.equal((await history(conversation.conversation_id)).status, 503); } finally { alpha.set({ fault: 'none' }); }
    assert.ok(Date.now() - start < 6000);
    const locked = latch(), released = latch();
    const transaction = pg.admin.begin(async tx => { await tx`lock table ideeo.turns in access exclusive mode`; locked.resolve(); await released.promise; });
    await locked.promise;
    try {
      const began = Date.now(), failed = await history(conversation.conversation_id);
      assert.equal(failed.status, 503);
      assert.equal(failed.body.error.code, 'storage_unavailable');
      assert.ok(Date.now() - began < 5000);
    } finally { released.resolve(); await transaction; }
  });

  await t.test('invalid requests never persist arbitrary protected text', async () => {
    const secret = 'synthetic-private-canary-' + randomUUID();
    const failed = await append(conversation.conversation_id, randomUUID(), sdk, secret);
    assert.equal(failed.status, 422);
    assert.equal(JSON.stringify(failed.body).includes(secret), false);
    for (const query of ['?limit=51', '?after=-1', '?after=0&after=1', '?token=' + secret]) {
      assert.equal((await history(conversation.conversation_id, sdk, query)).status, 422);
    }
    assert.equal((await request('/v2/conversations', sdk, { token: secret })).status, 422);
    assert.equal((await request('/v2/conversations', sdk, {}, 'bad key')).status, 422);
    assert.equal((await history(conversation.conversation_id, 'invalid')).status, 401);
    const atRest = JSON.stringify(await pg.admin`select * from ideeo.turns`);
    assert.equal(atRest.includes(secret), false);
    assert.equal(fixture.diagnostics().includes(secret), false);
  });

  await t.test('content expiry, physical purge and replay-marker expiry are separate', async () => {
    fixture.config.storage = { ...fixture.config.storage!, contentTtlSeconds: 2, replayTtlSeconds: 4 };
    await fixture.restart();
    const idempotency = randomUUID(), own = await create(sdk, idempotency);
    assert.equal((await append(own.conversation_id, idempotency)).status, 200);
    await delay(2100);
    assert.equal((await history(own.conversation_id)).status, 410);
    assert.equal((await append(own.conversation_id, idempotency)).status, 410);
    assert.equal((await request('/v2/conversations', sdk, {}, idempotency)).status, 410);
    const [purged] = await maintenance`select * from ideeo.purge_expired()`;
    assert.equal(Number(purged.cleared), 1);
    const [retained] = await pg.admin`select user_content,answer_content from ideeo.turns where conversation_id=${own.conversation_id}`;
    assert.equal(retained.user_content, null);
    assert.equal(retained.answer_content, null);
    assert.deepEqual(await counts(own.conversation_id), { turns: 1, events: 1, next: 2 });
    await delay(2100);
    const [removed] = await maintenance`select * from ideeo.purge_expired()`;
    assert.equal(Number(removed.removed), 1);
    assert.deepEqual(await counts(own.conversation_id), { turns: 0, events: 0, next: null });
    assert.equal((await history(own.conversation_id)).status, 404);
    assert.notEqual((await create(sdk, idempotency)).conversation_id, own.conversation_id);
  });

  await t.test('fixture logs and product home contain no credentials or transcripts', async () => {
    const logs = fixture.diagnostics() + pg.diagnostics();
    for (const forbidden of [sdk, whatsapp, second, alpha.credential, beta.credential, pg.runtimeUrl,
      fixture.environment.STORAGE_FINGERPRINT!, keys.alpha.first, keys.beta.first, 'synthetic.hello', 'Synthetic greeting recorded.']) assert.equal(logs.includes(forbidden), false);
    assert.deepEqual(await readdir(join(fixture.root, 'home')), []);
  });

  await t.test('an actual PostgreSQL outage returns bounded unavailable without cached history', async () => {
    await runtime.end();
    await maintenance.end();
    await pg.stop();
    const start = Date.now(), unavailable = await history(conversation.conversation_id);
    assert.equal(unavailable.status, 503);
    assert.equal(unavailable.body.error.code, 'storage_unavailable');
    assert.equal(unavailable.body.turns, undefined);
    assert.ok(Date.now() - start < 5000);
  });
});
