# Isolated Ideeo admission verification

This profile verifies the product-only startup and admission boundary. It does not start the upstream OpenMaus application or qualify conversation behavior. Other runtime changes continue to use the [standard isolated launcher](README.md).

With the locked dependencies installed:

```sh
pnpm test:ideeo-admission
```

The command runs the token-verifier suite and `server/ideeo/admission.node-test.ts`. The latter calls `scripts/testing/ideeo-fixture.ts`, generates disposable P-256 keys and workload credentials, starts two tenant authority services on distinct ephemeral loopback ports, and launches `server/ideeo-main.ts` in a separate Node process. The child has an allowlisted environment, temporary home/configuration and explicit synthetic endpoints. It has no user tokens, app state, bank connection, model configuration or ambient proxy variables.

Tests receive the exact fixture URL from the owned child's startup message. Nothing discovers or uses an existing app port. The fixture shuts down its child and tenant servers and removes only its checked temporary directory. No keys/tokens are printed or committed.

Required observations:

- Both tenants use overlapping resource/client IDs but separate keys, credentials and services. They receive the correct SDK/WhatsApp presentation. Cross-tenant and different-caller identities fail.
- Cookie-only and unauthenticated loopback requests fail. Channel/tenant hints cannot steer identity or backend selection, and are not forwarded downstream.
- Each request checks current membership, agent, grant and applicable WhatsApp binding. Revocation/expiry/rebinding after a prior success denies the next request; token expiry during a slow check denies the response.
- Outage, timeout, redirect, oversized/malformed reply, secret echo, context mismatch, stale/future observation and response replay fail closed. No retry, fallback tenant or raw response disclosure occurs.
- Missing configuration/secrets prevent startup. Real destinations are disabled. Legacy routes, arbitrary tools and unimplemented conversation routes remain closed; the child's home remains empty.

For mutation checks, copy the candidate files and pinned dependencies into a separate temporary checkout. Disable one guard there, run the same suite, confirm the relevant expected denial fails, then restore the copy. Never weaken controls in the user's running application or original source tree.

Record exact source, dependency/tool versions, test outcomes and scope in the [candidate verification record](../ideeo/development/VERIFICATION.md). The fixture implements a proposed [tenant admission extension](../ideeo/contracts/ADMISSION.md); it does not establish that the existing PayMe API exposes that endpoint or that live/native consumers have adopted it.
