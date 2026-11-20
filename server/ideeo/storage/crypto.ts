import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'node:crypto';
import type { TenantPrincipal } from '../identity.ts';
import type { StorageConfiguration } from './config.ts';

export type CallerScope = Readonly<{
  tenant_id: string; membership_id: string; client_id: string; agent_account_id: string; grant_id: string;
  channel: 'sdk' | 'whatsapp'; channel_binding_id: string;
}>;
export function callerScope(p: TenantPrincipal): CallerScope {
  if (p.channel === 'whatsapp' && !p.channelBindingId || p.channel === 'sdk' && p.channelBindingId) throw new Error('Invalid storage caller');
  return Object.freeze({ tenant_id: p.tenantId, membership_id: p.membershipId, client_id: p.clientId,
    agent_account_id: p.agentAccountId, grant_id: p.grantId, channel: p.channel, channel_binding_id: p.channelBindingId ?? '' });
}
export type ContentBinding = Readonly<{ scope: CallerScope; conversationId: string; turnId: string; sequence: number; expiresAt: string }>;
type Envelope = { v: 1; kid: string; iv: string; tag: string; data: string };
function secret(value: unknown): Buffer {
  if (typeof value !== 'string' || !/^[A-Za-z0-9+/]{43}=$/.test(value)) throw new Error('Invalid storage key');
  const result = Buffer.from(value, 'base64');
  if (result.length !== 32 || result.toString('base64') !== value) throw new Error('Invalid storage key');
  return result;
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid storage keyring');
  return value as Record<string, unknown>;
}
export function createContentProtection(config: StorageConfiguration, tenants: readonly string[], secrets: Readonly<Record<string, string | undefined>>) {
  const raw = secrets[config.keyringEnv];
  if (!raw || raw.length > 65536) throw new Error('Missing storage keyring');
  const parsed = object(JSON.parse(raw));
  if (Object.keys(parsed).length !== tenants.length || tenants.some(t => !Object.hasOwn(parsed, t))) throw new Error('Storage keys must match configured tenants');
  const keys = new Map(tenants.map(tenant => {
    const entries = Object.entries(object(parsed[tenant]));
    if (!entries.length || entries.length > 10 || !entries.some(([kid]) => kid === config.activeKeyId)) throw new Error('Missing active storage key');
    return [tenant, new Map(entries.map(([kid, key]) => {
      if (!/^[a-zA-Z0-9_-]{1,40}$/.test(kid)) throw new Error('Invalid encryption key ID');
      return [kid, secret(key)];
    }))] as const;
  }));
  const fingerprintKey = secret(secrets[config.fingerprintKeyEnv]);
  const aad = (binding: ContentBinding, field: string, kid: string) => Buffer.from(JSON.stringify([
    'ideeo-transcript', 1, kid, binding.scope, binding.conversationId, binding.turnId, binding.sequence, binding.expiresAt, field,
  ]));
  return Object.freeze({
    fingerprint(scope: CallerScope, purpose: string, value: unknown) {
      return createHmac('sha256', fingerprintKey).update(JSON.stringify(['ideeo', 1, scope, purpose, value])).digest('hex');
    },
    encrypt(binding: ContentBinding, field: 'user' | 'answer' | 'booking-receipt', value: unknown): Envelope {
      const kid = config.activeKeyId, key = keys.get(binding.scope.tenant_id)?.get(kid);
      if (!key) throw new Error('Unavailable storage key');
      const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', key, iv);
      cipher.setAAD(aad(binding, field, kid));
      const data = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
      return { v: 1, kid, iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: data.toString('base64') };
    },
    decrypt(binding: ContentBinding, field: 'user' | 'answer' | 'booking-receipt', rawEnvelope: unknown): unknown {
      const e = object(rawEnvelope);
      if (e.v !== 1 || Object.keys(e).sort().join(',') !== 'data,iv,kid,tag,v' || typeof e.kid !== 'string'
        || typeof e.iv !== 'string' || typeof e.tag !== 'string' || typeof e.data !== 'string' || e.data.length > 16384) throw new Error('Invalid ciphertext');
      const key = keys.get(binding.scope.tenant_id)?.get(e.kid);
      if (!key) throw new Error('Unavailable storage key');
      const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(e.iv, 'base64'));
      decipher.setAAD(aad(binding, field, e.kid));
      decipher.setAuthTag(Buffer.from(e.tag, 'base64'));
      return JSON.parse(Buffer.concat([decipher.update(Buffer.from(e.data, 'base64')), decipher.final()]).toString('utf8'));
    },
  });
}
