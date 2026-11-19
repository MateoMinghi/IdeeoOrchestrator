import assert from 'node:assert/strict';
import test from 'node:test';
import { randomBytes, randomUUID } from 'node:crypto';
import { launchPostgresFixture } from '../../scripts/testing/postgres-fixture.ts';
import { openStorageDatabase } from './storage/database.ts';

test('workspace reservations retain bounded profiles, deadlines and tenant debits', async t => {
  const pg = await launchPostgresFixture();
  let db = openStorageDatabase(pg.runtimeUrl, 'ideeo_runtime');
  t.after(async () => { try { await db.end(); } finally { await pg.stop(); } });
  const scope = {tenant_id:'alpha',membership_id:'member-1',client_id:'app',agent_account_id:'assistant-1',grant_id:'grant-1',channel:'sdk',channel_binding_id:''};
  const id = randomUUID(), fingerprint = randomBytes(32).toString('hex');
  await pg.admin`insert into ideeo.conversations(scope,id,creation_key,created_at,expires_at,replay_expires_at)
    values(${pg.admin.json(scope)},${id},${fingerprint},clock_timestamp(),clock_timestamp()+interval '10 minutes',clock_timestamp()+interval '20 minutes')`;
  const key = () => randomBytes(32).toString('hex');
  const reserve = (requestKey:string, kind:'model'|'tool', workspace = true) => db.begin(async tx => {
    await tx`select set_config('ideeo.caller',${JSON.stringify(scope)},true)`;
    const [result] = workspace
      ? await tx`select * from ideeo.reserve_workspace_inference(${tx.json(scope)},${requestKey},${id},${fingerprint},${kind})`
      : await tx`select * from ideeo.reserve_inference(${tx.json(scope)},${requestKey},${id},${fingerprint},${kind})`;
    return result;
  });
  await t.test('eight model attempts and seven tools survive connection restart without refunds', async () => {
    const requestKey = key(); let deadline:Date|undefined;
    for (const kind of ['model','tool'] as const) {
      for (let count=0; count<(kind==='model'?8:7); count++) {
        const result = await reserve(requestKey,kind); assert.equal(result.code,'reserved');
        if (!deadline) deadline=result.deadline;
        assert.equal(result.deadline.getTime(),deadline!.getTime());
      }
      assert.equal((await reserve(requestKey,kind)).code,'inference_budget_exhausted');
    }
    await db.end(); db=openStorageDatabase(pg.runtimeUrl,'ideeo_runtime');
    assert.equal((await reserve(requestKey,'model')).code,'inference_budget_exhausted');
    assert.equal((await reserve(requestKey,'tool')).code,'inference_budget_exhausted');
    assert.equal((await reserve(requestKey,'model',false)).code,'inference_profile_mismatch');
  });
  await t.test('constrained reservations cannot be upgraded on retry', async () => {
    const requestKey=key();
    for(let count=0;count<3;count++)assert.equal((await reserve(requestKey,'model',false)).code,'reserved');
    assert.equal((await reserve(requestKey,'model',false)).code,'inference_budget_exhausted');
    assert.equal((await reserve(requestKey,'model')).code,'inference_profile_mismatch');
  });
  await t.test('expired workspace deadlines are retained on retry', async () => {
    const requestKey=key(); const first=await reserve(requestKey,'model');
    const [remaining]=await pg.admin`select extract(epoch from (deadline_at-clock_timestamp()))::float as seconds from ideeo.inference_operations where request_key=${requestKey}`;
    assert.ok(remaining.seconds>55 && remaining.seconds<=60,JSON.stringify({database_seconds:remaining.seconds,node_ms:first.deadline.getTime()-Date.now()}));
    await pg.admin`update ideeo.inference_operations set deadline_at=clock_timestamp()-interval '1 second' where request_key=${requestKey}`;
    assert.equal((await reserve(requestKey,'tool')).code,'inference_expired');
  });
  await t.test('workspace calls share the original tenant daily ceiling across keys', async () => {
    await pg.admin`update ideeo.inference_budget set model_attempts=63 where tenant_id='alpha'`;
    const results=await Promise.all([reserve(key(),'model'),reserve(key(),'model')]);
    assert.deepEqual(results.map(row=>row.code).sort(),['inference_budget_exhausted','reserved']);
    assert.equal((await reserve(key(),'model')).code,'inference_budget_exhausted');
    const [budget]=await pg.admin`select model_attempts from ideeo.inference_budget where tenant_id='alpha'`;
    assert.equal(budget.model_attempts,64);
  });
});
