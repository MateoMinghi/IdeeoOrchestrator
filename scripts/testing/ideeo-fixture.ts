import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtemp, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { exportSPKI, generateKeyPair, jwtVerify, SignJWT } from 'jose';
import type { StorageConfiguration } from '../../server/ideeo/storage/config.ts';
import type { TenantConfiguration } from '../../server/ideeo/config.ts';
import type { InferenceConfiguration } from '../../server/ideeo/inference-policy.ts';

type Status = 'active' | 'inactive' | 'paused' | 'revoked' | 'expired';
export type TenantFixtureState = {
  membership: Status;
  agent: Status;
  grant: Status;
  grantExpiresAt: number;
  scopes: string[];
  binding: Status;
  bindingId: string;
  bindingExpiresAt: number;
  bindingAuthTime: number;
  delayMs: number;
  fault: 'none' | 'outage' | 'redirect' | 'timeout' | 'malformed' | 'mismatch' | 'replay' | 'oversized' | 'echo' | 'future' | 'stale';
};

async function listen(server: Server) {
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Fixture listener failed');
  return `http://127.0.0.1:${address.port}`;
}

async function stopServer(server: Server) {
  await new Promise<void>(resolve => { server.close(() => resolve()); server.closeAllConnections(); });
}

async function createTenantFixture(id: string) {
  const key = await generateKeyPair('ES256');
  const pem = await exportSPKI(key.publicKey);
  const credential = randomBytes(32).toString('base64url');
  const issuer = `https://${id}.invalid`;
  const audience = `${id}-broker`;
  const authTime = Math.floor(Date.now() / 1000) - 60;
  const freshState = (): TenantFixtureState => ({ membership: 'active', agent: 'active', grant: 'active',
    grantExpiresAt: Math.floor(Date.now() / 1000) + 600, scopes: ['history:read'],
    binding: 'active', bindingId: 'generation-1', bindingExpiresAt: Math.floor(Date.now() / 1000) + 600,
    bindingAuthTime: authTime, delayMs: 0, fault: 'none' });
  let state = freshState();
  let calls = 0;
  let forbiddenHeaders = false;
  let previousReply: unknown;
  let beforeReply: ((call: number) => Promise<void>) | undefined;
  const server = createServer(async (req, res) => {
    calls++;
    const callNumber = calls;
    forbiddenHeaders ||= !!(req.headers.cookie || req.headers['x-tenant-id'] || req.headers['x-client-id']);
    const send = (code: number, body: unknown) => {
      if (!res.destroyed) { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); }
    };
    try {
      if (req.method !== 'POST' || req.url !== '/v2/engine/admission' || req.headers.authorization !== `Bearer ${credential}`) {
        send(403, {}); return;
      }
      const proof = req.headers['x-authority-delegation'];
      if (typeof proof !== 'string') { send(403, {}); return; }
      const { payload } = await jwtVerify(proof, key.publicKey, { issuer, audience, algorithms: ['ES256'], typ: 'at+jwt' });
      const chunks: Buffer[] = [];
      let size = 0;
      for await (const chunk of req) { size += chunk.length; if (size > 8192) throw new Error('Oversized fixture request'); chunks.push(chunk); }
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      const expected = { tenant_id: id, membership_id: 'member-1', client_id: payload.client_id,
        agent_account_id: 'assistant-1', grant_id: 'grant-1' };
      if (payload.tenant_id !== id || payload.sub !== 'member-1' || payload.agent_account_id !== 'assistant-1'
        || payload.grant_id !== 'grant-1' || !['app', 'whatsapp'].includes(String(payload.client_id))
        || body.api_version !== 'ideeo-admission-1' || typeof body.request_id !== 'string'
        || Object.entries(expected).some(([k, v]) => body.context?.[k] !== v)
        || body.authentication?.auth_time !== payload.auth_time
        || body.authentication?.channel !== (payload.client_id === 'app' ? 'sdk' : 'whatsapp')
        || body.authentication?.channel_binding_id !== (payload.channel_binding_id ?? null)) {
        send(403, {}); return;
      }
      if (state.fault === 'outage') { send(503, {}); return; }
      if (state.fault === 'redirect') { res.writeHead(307, { location: `${url}/redirect-target` }); res.end(); return; }
      if (state.fault === 'timeout') return;
      if (state.delayMs) await new Promise(resolve => setTimeout(resolve, state.delayMs));
      await beforeReply?.(callNumber);
      const now = Math.floor(Date.now() / 1000);
      const reply = { api_version: 'ideeo-admission-1', request_id: body.request_id,
        context: state.fault === 'mismatch' ? { ...expected, tenant_id: 'wrong-tenant' } : expected,
        checked_at: now + (state.fault === 'future' ? 60 : state.fault === 'stale' ? -60 : 0),
        membership: { status: state.membership }, agent_account: { status: state.agent },
        grant: { status: state.grant, expires_at: state.grantExpiresAt, scopes: state.scopes },
        channel_binding: payload.client_id === 'whatsapp' ? { id: state.bindingId, status: state.binding,
          auth_time: state.bindingAuthTime, expires_at: state.bindingExpiresAt } : null };
      if (state.fault === 'malformed') { send(200, { context: expected }); return; }
      if (state.fault === 'oversized') { send(200, { data: 'x'.repeat(20000) }); return; }
      if (state.fault === 'echo') { send(200, { ...reply, secret: proof }); return; }
      if (state.fault === 'replay') { send(200, previousReply); return; }
      previousReply = reply;
      send(200, reply);
    } catch { send(403, {}); }
  });
  const url = await listen(server);
  return {
    id, url, credential, server,
    config: { issuer, tenantId: id, audience: 'ai-engine', publicKeys: { current: pem },
      clients: [{ clientId: 'app', channel: 'sdk' }, { clientId: 'whatsapp', channel: 'whatsapp' }],
      delegationAudiences: [audience], authority: { url: `${url}/v2/engine/admission`,
        credentialEnv: `IDEEO_${id.toUpperCase()}_CREDENTIAL`, delegationAudience: audience, timeoutMs: 3000, provenance: 'synthetic' } },
    set(patch: Partial<TenantFixtureState>) { Object.assign(state, patch); },
    onCheck(hook?: (call: number) => Promise<void>) { beforeReply = hook; },
    reset() { state = freshState(); calls = 0; forbiddenHeaders = false; previousReply = undefined; beforeReply = undefined; },
    observations() { return { calls, forbiddenHeaders }; },
    async token(channel: 'sdk' | 'whatsapp' = 'sdk', overrides: Record<string, unknown> = {}) {
      const now = Math.floor(Date.now() / 1000);
      return new SignJWT({ iss: issuer, aud: ['ai-engine', audience], sub: 'member-1', tenant_id: id,
        client_id: channel === 'sdk' ? 'app' : 'whatsapp', agent_account_id: 'assistant-1', grant_id: 'grant-1',
        kind: 'customer', scope: 'history:read', iat: now, nbf: now, exp: now + 300, auth_time: authTime,
        ...(channel === 'whatsapp' ? { channel_binding_id: 'generation-1' } : {}), ...overrides,
      }).setProtectedHeader({ alg: 'ES256', typ: 'at+jwt', kid: 'current' }).sign(key.privateKey);
    },
  };
}

export async function launchIdeeoFixture(options: { storage?: StorageConfiguration; inference?: InferenceConfiguration; secrets?: Record<string, string>;
  guardHostImports?: boolean;
  additionalTenants?: readonly { config: TenantConfiguration; credential: string }[] } = {}) {
  const root = await mkdtemp(join(tmpdir(), 'ideeo-admission-'));
  const tenants: Awaited<ReturnType<typeof createTenantFixture>>[] = [];
  let child: ReturnType<typeof spawn> | undefined;
  const kill = async () => {
    if (child && child.exitCode === null && child.signalCode === null) {
      const ownedChild = child;
      const exited = new Promise<void>(resolve => ownedChild.once('exit', () => resolve()));
      ownedChild.kill();
      await exited;
    }
  };
  const stop = async () => {
    await kill();
    await Promise.all(tenants.map(tenant => stopServer(tenant.server)));
    const resolved = await realpath(root);
    if (dirname(resolved) !== await realpath(tmpdir()) || !basename(resolved).startsWith('ideeo-admission-')) {
      throw new Error('Unexpected fixture cleanup target');
    }
    await rm(resolved, { recursive: true, force: true });
  };
  try {
    for (const id of ['alpha', 'beta']) tenants.push(await createTenantFixture(id));
    const configuredTenants = [...tenants, ...options.additionalTenants ?? []];
    const config = { environment: 'development', listen: { host: '127.0.0.1', port: 0 },
      tenants: configuredTenants.map(t => ({ ...t.config, authority: { ...t.config.authority } })), ...(options.storage ? { storage: options.storage } : {}),
      ...(options.inference ? { inference:options.inference } : {}) };
    const configPath = join(root, 'config.json');
    const guardPath=join(root,'guard.mjs');
    if(options.guardHostImports) await writeFile(guardPath,`import {registerHooks} from 'node:module';
registerHooks({resolve(specifier,context,next){const result=next(specifier,context);if(/\\/server\\/(config\\.ts|drivers\\/(native|chat-mcp-tools|openai-chat)\\.ts)$/.test(result.url))throw Error('Host composition forbidden in product fixture');return result;}});`);
    await writeFile(configPath, JSON.stringify(config));
    const home = join(root, 'home');
    await mkdir(home);
    const environment: NodeJS.ProcessEnv = { SystemRoot: process.env.SystemRoot, WINDIR: process.env.WINDIR,
      TEMP: root, TMP: root, HOME: home, USERPROFILE: home, APPDATA: home, LOCALAPPDATA: home, ...options.secrets };
    for (const tenant of configuredTenants) environment[tenant.config.authority.credentialEnv] = tenant.credential;
    let logs = '';
    const start = async () => {
      await writeFile(configPath, JSON.stringify(config));
      child = spawn(process.execPath, ['--experimental-strip-types',...(options.guardHostImports?['--import',pathToFileURL(guardPath).href]:[]), fileURLToPath(new URL('../../server/ideeo-main.ts', import.meta.url)), '--config', configPath],
      { cwd: root, env: environment, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    const ownedChild = child;
    child.stderr!.on('data', chunk => { logs = (logs + chunk.toString()).slice(-4096); });
    return new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Fixture startup timed out')), 10000);
      ownedChild.once('error', () => { clearTimeout(timer); reject(new Error('Fixture startup failed')); });
      ownedChild.once('exit', code => {
        clearTimeout(timer);
        const category = logs.includes('Host composition forbidden') ? 'host-import' : logs.match(/\bERR_[A-Z_]+\b/)?.[0] ?? 'startup';
        reject(new Error(`Fixture exited before readiness (${code}, ${category})`));
      });
      let output = '';
      ownedChild.stdout!.on('data', chunk => {
        output += chunk.toString();
        if (!output.includes('\n')) return;
        try {
          const event = JSON.parse(output.split('\n')[0]);
          if (event.event !== 'listening' || !/^http:\/\/127\.0\.0\.1:\d+$/.test(event.url)) throw new Error('Invalid fixture address');
          clearTimeout(timer); resolve(event.url);
        } catch { clearTimeout(timer); reject(new Error('Invalid fixture readiness')); }
      });
    });
    };
    let url = await start();
    return { get url() { return url; }, root, tenants, config, environment, stop, kill,
      async restart() { await kill(); url = await start(); },
      diagnostics: () => logs,
      async configBytes() { return readFile(configPath); },
    };
  } catch (error) { await stop(); throw error; }
}
