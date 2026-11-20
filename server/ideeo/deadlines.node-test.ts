import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { channel } from 'node:diagnostics_channel';
import { createServer, request, type IncomingMessage } from 'node:http';
import https from 'node:https';
import { syncBuiltinESMExports } from 'node:module';
import test, { mock } from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { fixtureFetch } from '../../scripts/testing/fixture-http.ts';
import { createTenantFixture, listen, stopServer } from '../../scripts/testing/ideeo-fixture.ts';
import { launchModelFixture } from '../../scripts/testing/model-fixture.ts';
import { launchPostgresFixture } from '../../scripts/testing/postgres-fixture.ts';
import { createIdeeoHost } from '../host/ideeo.ts';

test('authenticated evaluation deadlines with a loopback provider and disposable PostgreSQL', async t => {
  const pg = await launchPostgresFixture();
  const cleanup: Array<() => Promise<void>> = [() => pg.stop()];
  t.after(async () => {
    const failures: unknown[] = [];
    for (const stop of cleanup.reverse()) try { await stop(); } catch (error) { failures.push(error); }
    if (failures.length) throw new AggregateError(failures,'Deadline fixture cleanup failed');
  });
  const tenant = await createTenantFixture('alpha');
  cleanup.push(() => stopServer(tenant.server));
  const model = await launchModelFixture();
  cleanup.push(() => model.stop());
  const provider = 'https://generativelanguage.googleapis.com/v1beta/openai';
  const intercept = mock.method(https, 'request', ((url: URL|string, options: https.RequestOptions, callback: (res: IncomingMessage) => void) => {
    assert.equal(String(url), provider + '/chat/completions');
    return request(model.url + '/chat/completions', {...options, agent:false}, callback);
  }) as typeof https.request);
  syncBuiltinESMExports();
  t.after(() => { intercept.mock.restore(); syncBuiltinESMExports(); });
  const scopes = ['conversation:read','conversation:write','inference:invoke','inference:disclose','tool:files:read'];
  tenant.set({scopes});
  const token = await tenant.token('sdk', {scope:scopes.join(' ')});
  const scope = {tenant_id:'alpha',membership_id:'member-1',client_id:'app',agent_account_id:'assistant-1',grant_id:'grant-1',channel:'sdk',channel_binding_id:''};
  let workspaceCalls=0;
  const workspace = createServer((_req,res) => { workspaceCalls++; res.writeHead(403); res.end(); });
  const endpoint = await listen(workspace);
  cleanup.push(() => stopServer(workspace));
  const key = () => randomBytes(32).toString('base64');
  const host = await createIdeeoHost({
    environment:'development', listen:{host:'127.0.0.1',port:0}, tenants:[tenant.config],
    storage:{mode:'synthetic',databaseEnv:'DB',fingerprintKeyEnv:'FINGERPRINT',keyringEnv:'KEYS',activeKeyId:'first',contentTtlSeconds:600,replayTtlSeconds:1200},
    inference:{mode:'gemini-evaluation',model:'gemini-2.5-flash-lite',url:provider,credentialEnv:'MODEL',textMode:'free-form'},
    capabilities:[{scope,url:endpoint+'/v1/ideeo/tools/call',credentialEnv:'WORKSPACE',tools:[{name:'read_note',family:'files',
      description:'Read an invented note.',permission:'tool:files:read',inputSchema:{type:'object',properties:{},required:[],additionalProperties:false}}]}],
  }, {DB:pg.runtimeUrl,KEYS:JSON.stringify({alpha:{first:key()}}),FINGERPRINT:key(),MODEL:model.credential,WORKSPACE:key(),
    [tenant.config.authority.credentialEnv]:tenant.credential,IDEEO_GEMINI_EVALUATION:'synthetic-content-only',IDEEO_FREE_FORM_EVALUATION:'synthetic-content-only'});
  const origin = await listen(host.server);
  cleanup.push(() => stopServer(host.server));
  const api = (path:string, body?:unknown, idem=randomUUID()) => fixtureFetch(origin+path, {
    method:body?'POST':'GET',timeoutMs:20000,headers:{authorization:'Bearer '+token,'idempotency-key':idem,'content-type':'application/json'},
    body:body?JSON.stringify(body):undefined,
  });
  const create = async () => {
    const res = await api('/v2/conversations', {});
    assert.equal(res.status,200);
    return (await res.json() as {conversation_id:string}).conversation_id;
  };
  const input = {message:{text:'Draft a short invented invitation.',disclosure:'model'}};
  model.setAnswer(() => 'Join the invented garden workshop.');
  const timings = channel('ideeo.model.timing');
  const samples = new Map<string,number>();
  const record = (message:unknown) => {
    const sample = message as {phase:string;elapsed_ms:number};
    assert.deepEqual(Object.keys(sample).sort(),['elapsed_ms','phase']);
    samples.set(sample.phase,sample.elapsed_ms);
  };
  timings.subscribe(record);
  t.after(() => { timings.unsubscribe(record); });
  await t.test('a near-limit body can settle and commit after ten seconds', async () => {
    const id = await create(), path = '/v2/conversations/'+id+'/turns', idem=randomUUID();
    model.onCheck(() => delay(7500));
    tenant.onCheck(async () => {
      if (samples.has('provider_body')) { tenant.onCheck(); await delay(2350); }
    });
    await pg.admin.unsafe("create function ideeo.delay_finish() returns trigger language plpgsql as $$ begin perform pg_sleep(0.3); return new; end $$; create trigger delay_finish before update on ideeo.inference_attempts for each row execute function ideeo.delay_finish()");
    const start=performance.now();
    try {
      const res=await api(path,input,idem), turn=await res.json() as {answer:{text:string};event_id:string};
      assert.equal(res.status,200,JSON.stringify(turn));
      assert.equal(turn.answer.text,'Join the invented garden workshop.');
      const elapsed=Math.round(performance.now()-start);
      t.diagnostic(JSON.stringify({turn_ms:elapsed,...Object.fromEntries(samples)}));
      assert.ok(elapsed>=10000);
      assert.ok(samples.get('provider_body')!>=7450 && samples.get('provider_body')!<8000);
      assert.ok(samples.get('reauthorization')!>=2300);
      assert.ok(samples.get('settlement')!>=290);
      const [op]=await pg.admin`select o.profile, a.status from ideeo.inference_operations o join ideeo.inference_attempts a using(scope,request_key) where o.conversation_id=${id}`;
      assert.equal(op.profile,'workspace');assert.equal(op.status,'finished');
      const replay=await api(path,input,idem);
      assert.equal((await replay.json() as {event_id:string}).event_id,turn.event_id);
      assert.equal(model.observed.length,1);
    } finally {
      model.onCheck();tenant.onCheck();
      await pg.admin.unsafe('drop trigger delay_finish on ideeo.inference_attempts; drop function ideeo.delay_finish()');
    }
  });
  for (const fault of ['revoked after receipt','expired after settlement'] as const) {
    await t.test(fault, async () => {
      samples.clear();
      const id=await create(), path='/v2/conversations/'+id+'/turns';
      tenant.onCheck(async () => {
        if (fault==='revoked after receipt' && samples.has('provider_body')) {
          tenant.set({scopes:scopes.filter(s=>s!=='inference:disclose')});tenant.onCheck();
        }
        if (fault==='expired after settlement' && samples.has('settlement')) {
          await pg.admin`update ideeo.inference_operations set deadline_at=clock_timestamp() where conversation_id=${id}`;
          tenant.onCheck();
        }
      });
      try {
        const res=await api(path,input);
        assert.equal(res.status,fault==='revoked after receipt'?403:409);
        if (fault==='expired after settlement') assert.equal((await res.json() as {error:{code:string}}).error.code,'inference_expired');
      } finally { tenant.onCheck();tenant.set({scopes}); }
      const history=await api(path);
      assert.deepEqual((await history.json() as {turns:unknown[]}).turns,[]);
      const [outbox]=await pg.admin`select count(*)::int as n from ideeo.outbox where conversation_id=${id}`;
      assert.equal(outbox.n,0);
      const rows=await pg.admin`select a.status from ideeo.inference_attempts a join ideeo.inference_operations o using(scope,request_key) where o.conversation_id=${id}`;
      assert.deepEqual(Array.from(rows,r=>r.status),[fault==='revoked after receipt'?'reserved':'finished']);
    });
  }
  assert.equal(workspaceCalls,0);
});
