import { randomUUID } from 'node:crypto';
import { Agent, request } from 'node:http';
import type { TenantConfiguration } from './config.ts';
import type { createTenantVerifier } from './identity.ts';
import type { AuthorityAdmissionRequest } from '../../shared/ideeo/admission.ts';

export type VerifiedTenantSession = Awaited<ReturnType<Awaited<ReturnType<typeof createTenantVerifier>>['verifyAuthorization']>>;

export class AdmissionError extends Error {
  readonly status: 403 | 503;
  readonly code: 'access_denied' | 'authority_unavailable';
  constructor(status: 403 | 503) {
    const code = status === 403 ? 'access_denied' : 'authority_unavailable';
    super(code);
    this.status = status;
    this.code = code;
  }
}

function object(value: unknown, fields: readonly string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new AdmissionError(503);
  const result = value as Record<string, unknown>;
  if (Object.keys(result).length !== fields.length || fields.some(k => !Object.hasOwn(result, k))) throw new AdmissionError(503);
  return result;
}

function epoch(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) throw new AdmissionError(503);
  return value;
}

function requireActive(value: unknown) {
  if (!['active', 'inactive', 'paused', 'revoked', 'expired'].includes(String(value))) throw new AdmissionError(503);
  if (value !== 'active') throw new AdmissionError(403);
}

function post(url: string, headers: Record<string, string>, body: string, timeoutMs: number, signal: AbortSignal): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const agent = new Agent({ keepAlive: false });
    let settled = false;
    const finish = (error?: AdmissionError, value?: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      agent.destroy();
      if (error) reject(error); else resolve(value);
    };
    const req = request(url, { method: 'POST', agent, signal, maxHeaderSize: 8192,
      headers: { ...headers, 'content-type': 'application/json', accept: 'application/json',
        'content-length': String(Buffer.byteLength(body)) } }, res => {
      if (res.statusCode === 401 || res.statusCode === 403) {
        res.destroy(); finish(new AdmissionError(403)); return;
      }
      if (res.statusCode !== 200 || res.headers['content-type']?.split(';')[0].trim() !== 'application/json') {
        res.destroy(); finish(new AdmissionError(503)); return;
      }
      const chunks: Buffer[] = [];
      let size = 0;
      res.on('data', (chunk: Buffer) => {
        size += chunk.length;
        if (size > 16384) { res.destroy(); finish(new AdmissionError(503)); }
        else chunks.push(chunk);
      });
      res.on('error', () => finish(new AdmissionError(503)));
      res.on('end', () => {
        try { finish(undefined, JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
        catch { finish(new AdmissionError(503)); }
      });
    });
    const timer = setTimeout(() => { req.destroy(); finish(new AdmissionError(503)); }, timeoutMs);
    req.on('error', () => finish(new AdmissionError(503)));
    req.end(body);
  });
}

export function createAuthorityClient(config: TenantConfiguration['authority'], credential: string) {
  if (!credential || credential.length > 8192 || /[^\x21-\x7e]/.test(credential)) throw new Error('Invalid authority workload credential');
  return Object.freeze({
    async check(session: VerifiedTenantSession, signal: AbortSignal): Promise<readonly string[]> {
      const p = session.principal;
      const context = { tenant_id: p.tenantId, membership_id: p.membershipId, client_id: p.clientId,
        agent_account_id: p.agentAccountId, grant_id: p.grantId };
      const authentication = { channel: p.channel, auth_time: p.authenticatedAt, channel_binding_id: p.channelBindingId ?? null };
      const requestId = randomUUID();
      const startedAt = Math.floor(Date.now() / 1000);
      const body: AuthorityAdmissionRequest = { api_version: 'ideeo-admission-1', request_id: requestId, context, authentication };
      const raw = await post(config.url, {
        authorization: `Bearer ${credential}`,
        'x-authority-delegation': session.delegationFor(config.delegationAudience),
      }, JSON.stringify(body), config.timeoutMs, signal);
      const reply = object(raw, ['api_version', 'request_id', 'context', 'checked_at', 'membership', 'agent_account', 'grant', 'channel_binding']);
      const bound = object(reply.context, Object.keys(context));
      if (reply.api_version !== 'ideeo-admission-1' || reply.request_id !== requestId
        || Object.entries(context).some(([k, v]) => bound[k] !== v)) throw new AdmissionError(503);
      const now = Math.floor(Date.now() / 1000);
      const checkedAt = epoch(reply.checked_at);
      if (checkedAt < startedAt || checkedAt > now) throw new AdmissionError(503);
      requireActive(object(reply.membership, ['status']).status);
      requireActive(object(reply.agent_account, ['status']).status);
      const grant = object(reply.grant, ['status', 'expires_at', 'scopes']);
      requireActive(grant.status);
      if (epoch(grant.expires_at) <= now) throw new AdmissionError(403);
      if (!Array.isArray(grant.scopes) || grant.scopes.length > 100
        || grant.scopes.some(s => typeof s !== 'string' || !/^[\x21-\x7e]{1,100}$/.test(s))) throw new AdmissionError(503);
      const scopes = p.scopes.filter(s => (grant.scopes as string[]).includes(s));
      if (!scopes.length) throw new AdmissionError(403);
      if (p.channel === 'whatsapp') {
        const binding = object(reply.channel_binding, ['id', 'status', 'auth_time', 'expires_at']);
        requireActive(binding.status);
        if (binding.id !== p.channelBindingId || epoch(binding.auth_time) !== p.authenticatedAt
          || epoch(binding.expires_at) <= now) throw new AdmissionError(403);
      } else if (reply.channel_binding !== null) throw new AdmissionError(503);
      return Object.freeze(scopes);
    },
  });
}
