import { createTenantVerifier, InvalidTenantSession } from './identity.ts';
import { AdmissionError, createAuthorityClient } from './authority-client.ts';
import type { IdeeoConfiguration } from './config.ts';

export async function createAdmission(config: IdeeoConfiguration, secrets: Readonly<Record<string, string | undefined>>) {
  const verifier = await createTenantVerifier(config.tenants);
  const authorities = new Map(config.tenants.map(tenant => [tenant.tenantId,
    createAuthorityClient(tenant.authority, secrets[tenant.authority.credentialEnv] ?? '')]));
  return Object.freeze({
    async admit(authorization: string | undefined, signal: AbortSignal) {
      const session = await verifier.verifyAuthorization(authorization);
      const authority = authorities.get(session.principal.tenantId);
      if (!authority) throw new AdmissionError(403);
      const scopes = await authority.check(session, signal);
      if (session.principal.expiresAt <= Math.floor(Date.now() / 1000)) throw new InvalidTenantSession();
      return Object.freeze({ principal: session.principal, scopes });
    },
  });
}
