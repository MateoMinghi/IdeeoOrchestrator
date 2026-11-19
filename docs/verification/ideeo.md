# Isolated Ideeo product verification

This profile verifies product-only startup, admission and the optional synthetic conversation store. It does not start the upstream OpenMaus application or qualify model conversation behavior. Other runtime changes continue to use the [standard isolated launcher](README.md).

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

## Encrypted conversation storage

With Node 24, the pinned `postgres` dependency and local PostgreSQL binaries installed:

```powershell
pnpm test:ideeo-storage
pnpm test:ideeo-storage-mutation
pnpm test:ideeo-payme-storage --api-root C:/path/to/isolated/payme-api
```

`scripts/testing/postgres-fixture.ts` invokes `initdb` for a fresh temporary cluster, generates all passwords, selects an ephemeral loopback port, verifies the owned postmaster PID before connecting, creates a randomly named disposable database, applies the actual migration twice and provisions restricted runtime/maintenance logins. It never discovers or connects to an existing database service. Default binary locations are `C:/Program Files/PostgreSQL/18/bin` on Windows and `/usr/lib/postgresql/18/bin` on Linux; `IDEEO_TEST_PG_BIN` can select an installed binary directory. PostgreSQL 18.0 on Windows was exercised. A restricted Windows token may prevent `initdb` from creating its own restricted token; run the same owned fixture in an approved execution context, not against an existing user database.

The Node suite starts the actual product entry with generated encryption keys, explicit synthetic storage config and two independent tenant services. It covers SDK/WhatsApp writes, complete-scope RLS, restricted roles, encrypted field substitution, idempotency and concurrent writes, committed outbox identifiers, stable pagination, current revocation and channel rebinding, real commit failure, process death before and after commit, reload, key rotation/missing keys, retention/purge and actual database outage. No OpenAI/model configuration is supplied. Inputs are the two fixed synthetic tokens in the [storage contract](../ideeo/contracts/CONVERSATION_STORAGE.md).

Fault injection is confined to the newly owned cluster. A deferred constraint trigger rejects COMMIT; a table lock forces bounded database failure; a weakened RLS policy must make the isolation assertion fail before restoration. `storage-mutation.mjs` copies the actual ciphertext-binding test and implementation to a checked temporary directory, verifies the original, removes turn-ID binding only in the copy, requires the expected assertion failure, then verifies the restored copy and unchanged original. It prints no keys or transcript. The process fixture can restart or terminate only its own child.

`payme-storage.ts` launches the explicit API checkout through its installed TS loader. Its worker uses the actual API `admissionFixture`/signer/migrations and product entry, adding disposable real PostgreSQL for product records. It explicitly configures synthetic conversation scopes; SDK uses the actual cookie exchange. It checks WhatsApp, reload/replay, current scope intersection, logout, revocation, rebinding, cross-caller denial, wrong workload, source/API outages and native/hosted limits. API application source is unchanged. The PGlite tenant database and PostgreSQL product database are distinct resources.

Cleanup closes owned clients/children/listeners and removes only resolved temporary paths with the expected prefix. Logs and the product home are checked for credential/transcript leakage. Run the original admission and PayMe suites as regressions; storage checks do not replace them. Record source hashes, commands, versions, failures and acceptance limits in the [candidate verification record](../ideeo/development/VERIFICATION.md). Do not infer real backend adoption, production retention or SDK/Meta UI compatibility from these developer fixtures.

## Controlled conversation loop

Use the [loop contract](../ideeo/contracts/CONVERSATION_LOOP.md) and current schema-2 migrations. From the product root, with installed dependencies:

```powershell
node --experimental-strip-types --test server/ideeo/conversation-loop.node-test.ts
node --experimental-strip-types scripts/testing/payme-storage.ts --api-root C:/path/to/isolated/payme-api --loop
node scripts/testing/loop-upstream.mjs
```

Equivalent scripts are `test:ideeo-loop`, `test:ideeo-payme-loop` and `test:ideeo-loop-upstream`. The first launches disposable PostgreSQL, two independent authority fixtures, a generated-key HTTP model script and the actual product entry with a temporary home. A module-loader guard rejects ambient host composition imports. No real model, API key, bank or user application is used. The model script is protocol evidence, not semantic acceptance. Its private-reasoning/error/output canaries must not reach product replies, model context, logs or durable plaintext.

Verify greeting, draft, revision, recall, process reload, one authorized typed-tool round, cross-caller/channel denial, revocation after success/dispatch, missing model/tool scopes, replay and concurrency. Each physical request must have a committed attempt; inject timeouts, redirects, oversized/private/invalid output, unknown/repeated tools, commit failure and process death. Check consumed attempts/deadlines survive retry/restart; different input cannot inherit an operation; a new conversation/channel cannot reset the tenant quota; a second tenant remains independent. Deliberately raise the SQL attempt ceiling and require the original bound assertion to fail, then restore it. Migration starts with a retained schema-1 record and must preserve it under schema 2.

The PayMe runner uses actual cookie exchange, signer, migrations and admission route, with synthetic source/identities and separate product PostgreSQL. It checks exact source-call bounds, both channels, current scope narrowing, revocation/logout/rebinding, final-disclosure revocation, wrong workload and source/API outages. No API runtime change is required for the explicit extra scopes.

The upstream runner uses a disposable home and selected original OpenMaus suites with scripted providers/MCP; it preserves the shared loop's streaming/protocol/retry/approval behavior. Those upstream capabilities are not automatically enabled by the product adapter. Run the independent admission, storage, actual API and mutation regressions as well. Record exact versions, commands, failures and scope in the [verification record](../ideeo/development/VERIFICATION.md).

## Authorized OpenAI evaluation

This command spends OpenAI tokens. Run it only with explicit live-call authorization and an explicit key-file path; it is not part of automatic tests:

```powershell
node --experimental-strip-types scripts/testing/payme-storage.ts --api-root C:/path/to/isolated/payme-api --openai-evaluation --key-file C:/path/to/authorized/.env
```

The runner selects only `OPENAI_API_KEY` from that file, starts actual tenant API/product code with synthetic identity/source resources and a fresh product PostgreSQL cluster, and activates the distinct `openai-evaluation` profile. It never loads the sibling application or its other environment settings. It reaches only OpenAI's fixed HTTPS Chat Completions endpoint with `gpt-6-luna`, reasoning disabled, no automatic model retries, a 256-token output ceiling and eight-second physical timeout. Pre-debited disposable SQL quotas leave 12 model attempts and two tools across process restart. No fixture proxies the real model under a synthetic label.

The 32 checks extend the actual API/scripted loop with constrained live draft, revision, recall and recall after restart. Responses must stay within the five approved synthetic strings; this is not an unrestricted semantic benchmark. The runner prints only check names/status/counts and aggregate token usage/estimated standard cost, never the key or raw provider errors. Unknown usage remains explicitly unknown and the invoice is not verified. The fixture closes owned processes/listeners/databases afterward. Preserve the independent scripted/two-tenant regressions and record new live evidence separately from historical zero-call runs.
