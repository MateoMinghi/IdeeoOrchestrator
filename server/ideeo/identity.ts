import { decodeJwt, decodeProtectedHeader, importSPKI, jwtVerify } from 'jose';

export type TenantClient = Readonly<{
  clientId: string;
  channel: 'sdk' | 'whatsapp';
}>;

export type TenantTrustProfile = Readonly<{
  issuer: string;
  tenantId: string;
  audience: string;
  publicKeys: Readonly<Record<string, string>>;
  clients: readonly TenantClient[];
  delegationAudiences: readonly string[];
}>;

export type TenantPrincipal = Readonly<{
  issuer: string;
  tenantId: string;
  membershipId: string;
  clientId: string;
  agentAccountId: string;
  grantId: string;
  channel: TenantClient['channel'];
  channelBindingId?: string;
  tokenId?: string;
  authenticatedAt: number;
  expiresAt: number;
  scopes: readonly string[];
}>;

export class InvalidTenantSession extends Error {
  readonly status = 401;
  readonly code = 'invalid_session';

  constructor() {
    super('invalid_session');
    this.name = 'InvalidTenantSession';
  }
}

function identity(value: unknown): string {
  if (typeof value !== 'string' || value.length < 1 || value.length > 100
    || /[\p{Cc}\p{Cs}]/u.test(value)) throw new InvalidTenantSession();
  return value;
}

function timestamp(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new InvalidTenantSession();
  }
  return value;
}

/** Authenticates tenant-issued proof; current grants, resource access and channel revocation require separate authority checks. */
export async function createTenantVerifier(profiles: readonly TenantTrustProfile[]) {
  type PublicKey = Awaited<ReturnType<typeof importSPKI>>;
  const trusted = new Map<string, {
    tenantId: string;
    audience: string;
    keys: Map<string, PublicKey>;
    clients: Map<string, TenantClient['channel']>;
    delegationAudiences: Set<string>;
  }>();

  for (const profile of profiles) {
    if (!profile.issuer || !profile.audience || trusted.has(profile.issuer)) {
      throw new Error('Invalid or duplicate tenant trust profile');
    }
    const tenantId = identity(profile.tenantId);
    const clients = new Map<string, TenantClient['channel']>();
    for (const client of profile.clients) {
      const clientId = identity(client.clientId);
      if (clients.has(clientId) || !['sdk', 'whatsapp'].includes(client.channel)) {
        throw new Error('Invalid or duplicate tenant client');
      }
      clients.set(clientId, client.channel);
    }
    const keys = new Map<string, PublicKey>();
    for (const [kid, pem] of Object.entries(profile.publicKeys)) {
      identity(kid);
      keys.set(kid, await importSPKI(pem, 'ES256'));
    }
    if (!keys.size || !clients.size || profile.delegationAudiences.some(a => !a)) {
      throw new Error('Incomplete tenant trust profile');
    }
    trusted.set(profile.issuer, {
      tenantId, audience: profile.audience, keys, clients,
      delegationAudiences: new Set(profile.delegationAudiences),
    });
  }

  return Object.freeze({
    async verifyAuthorization(authorization: string | null | undefined) {
      try {
        if (typeof authorization !== 'string' || authorization.length > 8199) {
          throw new InvalidTenantSession();
        }
        const match = /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/i.exec(authorization);
        if (!match) throw new InvalidTenantSession();
        const token = match[1];
        const header = decodeProtectedHeader(token);
        const unverified = decodeJwt(token);
        const profile = typeof unverified.iss === 'string' ? trusted.get(unverified.iss) : undefined;
        const key = typeof header.kid === 'string' ? profile?.keys.get(header.kid) : undefined;
        // Unverified claims select only preconfigured trust; token URLs never trigger key discovery.
        if (!profile || !key || header.alg !== 'ES256' || header.typ !== 'at+jwt'
          || header.jku !== undefined || header.jwk !== undefined || header.x5u !== undefined) {
          throw new InvalidTenantSession();
        }
        const now = Math.floor(Date.now() / 1000);
        const { payload } = await jwtVerify(token, key, {
          algorithms: ['ES256'], issuer: unverified.iss, audience: profile.audience,
          typ: 'at+jwt', clockTolerance: 0, currentDate: new Date(now * 1000),
          requiredClaims: ['iss', 'aud', 'sub', 'tenant_id', 'client_id', 'agent_account_id',
            'grant_id', 'kind', 'scope', 'iat', 'nbf', 'exp', 'auth_time'],
        });
        const issuedAt = timestamp(payload.iat);
        const authenticatedAt = timestamp(payload.auth_time);
        const expiresAt = timestamp(payload.exp);
        const notBefore = timestamp(payload.nbf);
        if (issuedAt > now || authenticatedAt > issuedAt || expiresAt <= issuedAt
          || expiresAt - issuedAt > 900 || notBefore >= expiresAt
          || payload.kind !== 'customer' || payload.tenant_id !== profile.tenantId) {
          throw new InvalidTenantSession();
        }
        const clientId = identity(payload.client_id);
        const channel = profile.clients.get(clientId);
        if (!channel || typeof payload.scope !== 'string' || !payload.scope.trim()
          || /[^\x21-\x7e ]/.test(payload.scope)) throw new InvalidTenantSession();
        const channelBindingId = payload.channel_binding_id === undefined
          ? undefined : identity(payload.channel_binding_id);
        if (channel === 'whatsapp' && !channelBindingId) throw new InvalidTenantSession();
        const principal: TenantPrincipal = Object.freeze({
          issuer: payload.iss!, tenantId: profile.tenantId,
          membershipId: identity(payload.sub), clientId,
          agentAccountId: identity(payload.agent_account_id), grantId: identity(payload.grant_id),
          channel, ...(channelBindingId ? { channelBindingId } : {}),
          ...(payload.jti === undefined ? {} : { tokenId: identity(payload.jti) }),
          authenticatedAt, expiresAt,
          scopes: Object.freeze([...new Set(payload.scope.split(' ').filter(Boolean))]),
        });
        const audiences = new Set(typeof payload.aud === 'string' ? [payload.aud] : payload.aud);
        return Object.freeze({
          principal,
          // The raw proof stays out of enumerable state and is released only for a configured, signed audience.
          delegationFor(audience: string): string {
            if (!profile.delegationAudiences.has(audience) || !audiences.has(audience)
              || Math.floor(Date.now() / 1000) >= expiresAt) throw new InvalidTenantSession();
            return token;
          },
        });
      } catch {
        throw new InvalidTenantSession();
      }
    },
  });
}
