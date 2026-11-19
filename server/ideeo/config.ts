import type { TenantTrustProfile } from './identity.ts';
import { parseStorageConfiguration, type StorageConfiguration } from './storage/config.ts';
import { parseInferenceConfiguration, type InferenceConfiguration } from './inference-policy.ts';

export type TenantConfiguration = TenantTrustProfile & Readonly<{
  authority: Readonly<{
    url: string;
    credentialEnv: string;
    delegationAudience: string;
    timeoutMs: number;
    provenance: 'synthetic';
  }>;
}>;

export type IdeeoConfiguration = Readonly<{
  environment: 'development';
  listen: Readonly<{ host: '127.0.0.1'; port: number }>;
  tenants: readonly TenantConfiguration[];
  storage?: StorageConfiguration;
  inference?: InferenceConfiguration;
}>;

function record(value: unknown, fields?: readonly string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid Ideeo configuration');
  const result = value as Record<string, unknown>;
  if (fields && (Object.keys(result).length !== fields.length || fields.some(key => !Object.hasOwn(result, key)))) {
    throw new Error('Invalid Ideeo configuration fields');
  }
  return result;
}

function text(value: unknown): string {
  if (typeof value !== 'string' || !value.length || value.length > 8192 || /[\r\n\0]/.test(value)) {
    throw new Error('Invalid Ideeo configuration value');
  }
  return value;
}

function integer(value: unknown, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max) {
    throw new Error('Invalid Ideeo configuration number');
  }
  return value;
}

function list(value: unknown): unknown[] {
  if (!Array.isArray(value) || !value.length || value.length > 100) throw new Error('Invalid Ideeo configuration list');
  return value;
}

export function parseIdeeoConfiguration(value: unknown): IdeeoConfiguration {
  const candidate = record(value);
  const root = record(value, ['environment', 'listen', 'tenants', ...(Object.hasOwn(candidate, 'storage') ? ['storage'] : []), ...(Object.hasOwn(candidate, 'inference') ? ['inference'] : [])]);
  if (root.inference && !root.storage) throw new Error('Inference requires durable storage');
  const listen = record(root.listen, ['host', 'port']);
  if (root.environment !== 'development' || listen.host !== '127.0.0.1') {
    throw new Error('Only isolated development listeners are qualified');
  }
  const tenants = list(root.tenants).map(raw => {
    const tenant = record(raw, ['issuer', 'tenantId', 'audience', 'publicKeys', 'clients', 'delegationAudiences', 'authority']);
    const authority = record(tenant.authority, ['url', 'credentialEnv', 'delegationAudience', 'timeoutMs', 'provenance']);
    const url = new URL(text(authority.url));
    // Real tenant admission is disabled until its status contract is implemented and qualified.
    if (authority.provenance !== 'synthetic' || url.protocol !== 'http:' || url.hostname !== '127.0.0.1'
      || !url.port || url.username || url.password || url.search || url.hash || url.pathname !== '/v2/engine/admission') {
      throw new Error('Only explicit synthetic authority endpoints are qualified');
    }
    const credentialEnv = text(authority.credentialEnv);
    if (!/^[A-Z][A-Z0-9_]{0,99}$/.test(credentialEnv)) throw new Error('Invalid authority credential reference');
    const delegationAudience = text(authority.delegationAudience);
    const delegationAudiences = list(tenant.delegationAudiences).map(text);
    if (!delegationAudiences.includes(delegationAudience)) throw new Error('Missing authority audience');
    const publicKeys = Object.fromEntries(Object.entries(record(tenant.publicKeys)).map(([kid, pem]) => {
      if (typeof pem !== 'string' || pem.length > 8192 || !pem.startsWith('-----BEGIN PUBLIC KEY-----')) {
        throw new Error('Public verification keys required');
      }
      return [text(kid), pem];
    }));
    const clients = list(tenant.clients).map(rawClient => {
      const client = record(rawClient, ['clientId', 'channel']);
      if (client.channel !== 'sdk' && client.channel !== 'whatsapp') throw new Error('Unknown tenant channel');
      return Object.freeze({ clientId: text(client.clientId), channel: client.channel });
    });
    return Object.freeze({
      issuer: text(tenant.issuer), tenantId: text(tenant.tenantId), audience: text(tenant.audience),
      publicKeys: Object.freeze(publicKeys), clients: Object.freeze(clients),
      delegationAudiences: Object.freeze(delegationAudiences),
      authority: Object.freeze({ url: url.href, credentialEnv, delegationAudience,
        timeoutMs: integer(authority.timeoutMs, 50, 5000), provenance: 'synthetic' as const }),
    });
  });
  if (new Set(tenants.map(t => t.tenantId)).size !== tenants.length
    || new Set(tenants.map(t => t.issuer)).size !== tenants.length) {
    throw new Error('Ambiguous tenant configuration');
  }
  return Object.freeze({ environment: 'development',
    listen: Object.freeze({ host: '127.0.0.1', port: integer(listen.port, 0, 65535) }),
    tenants: Object.freeze(tenants), ...(Object.hasOwn(root, 'storage') ? { storage: parseStorageConfiguration(root.storage) } : {}),
    ...(Object.hasOwn(root, 'inference') ? { inference: parseInferenceConfiguration(root.inference) } : {}) });
}
