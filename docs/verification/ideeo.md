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

Record exact source, dependency/tool versions, test outcomes and scope in the [candidate verification record](../ideeo/development/VERIFICATION.md). This independent two-tenant fixture alone does not establish actual API adoption. The cross-repository check below uses the implemented [tenant admission extension](../ideeo/contracts/ADMISSION.md).

## Actual PayMe API with disposable resources

```powershell
pnpm test:ideeo-payme --api-root C:/path/to/isolated/payme-api
```

The explicit API checkout must contain `scripts/ideeo-admission-integration.ts` and its installed dependencies. The current registered worktree is `.worktrees/payme-api-admission`, at API commit `4efeaf56d3e7f47248d76938f979b0d5a7d7b6cf`, also on the original API checkout's local `dev`. This runner never discovers a running application or uses `.env`. It starts the actual API `createApp` with memory-only PGlite and migrations, synthetic tenant records, generated keys/credentials and an ephemeral status-only backend, then launches this checkout's actual `server/ideeo-main.ts` with a temporary home/config and allowlisted environment. It closes owned processes/listeners and removes only its checked temporary directory.

The SDK journey exchanges a synthetic opaque session cookie at the real `/api/nico/token` route before calling the product. WhatsApp uses the actual tenant signer and current channel records. Checks cover success, signed cross-tenant/caller denial, expired proof, post-success revocation/rebinding, paused/expired source states, wrong workload proof, source/API outages, one bounded source call, malformed/oversized/unbound/stale/replayed responses and safe errors/logs. Native tenant-owned WhatsApp authority is checked against actual SQL; hosted Armoni/native SDK unsupported evidence must be unavailable. Assertions establish no generic bank calls, model turns, media inference or financial execution.

The source status fixture is explicitly synthetic and implements the new `ideeo-bank-admission-1` extension. It does not prove a bank implements that protocol. Keep product real-destination restrictions and distinguish actual API code with synthetic resources from independent consumer or production acceptance. Run the original two-tenant suite separately; PayMe integration cannot replace tenant-isolation coverage.
