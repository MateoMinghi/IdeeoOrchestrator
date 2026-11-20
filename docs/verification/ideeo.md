# Isolated Ideeo product verification

Run `node --experimental-strip-types --test --test-concurrency=1 server/ideeo/deadlines.node-test.ts` to exercise the eight-second evaluation transport through the authenticated API against disposable PostgreSQL and a scripted loopback provider. The test covers slow receipt, delayed reauthorization and settlement, revocation, and expiry at publication. Run `server/ideeo/capabilities.node-test.ts` with the same flags to verify timeout and replay after an actual fixture file write. Both commands use generated credentials and incur zero provider charges.

For the model failure investigation, run `node --experimental-strip-types --test --test-concurrency=1 server/ideeo/free-form.node-test.ts server/ideeo/gemini.node-test.ts server/ideeo/conversation-loop.node-test.ts server/ideeo/restart.node-test.ts`. These use disposable model/product/database fixtures and no live key. They assert provider error classification, preserved authority/storage errors, retained failed-attempt accounting and service recovery after repeated timeouts/restarts. Live browser diagnostics remain a separately authorized campaign; the wire trace records only bounded shape, elapsed time and allowlisted error categories, never headers or content. See [the dated findings](../ideeo/development/VERIFICATION.md#conversation-failure-investigation--19-november-2026).

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

## Free-form and React product entry

These commands use local scripted inference, never an OpenAI key:

```powershell
node --experimental-strip-types --test server/ideeo/free-form.node-test.ts src/ideeo/client.node-test.ts
node scripts/testing/free-form-mutation.mjs
node --experimental-strip-types scripts/testing/payme-storage.ts --api-root .worktrees/payme-api-admission --free-form --ui
pnpm typecheck:ideeo-ui
pnpm build:ideeo-ui
```

The registered worktree must be at the intended inspected API revision with dependencies installed. The original PayMe checkout is not modified. `--free-form` selects `textMode:free-form`, adds `inference:disclose` to the synthetic signed/current grant intersection and passes the synthetic-only activation flag. The existing durable SQL limits remain. The separate authorized live campaign below uses free-form semantic criteria rather than the earlier exact-answer vocabulary.

The Node suite checks bounded invented text and UTF-8, explicit disclosure, no input-side effects on denial, projection recall after restart, encryption, output withholding, unknown/repeated tools, revocation during inference, second-tenant isolation, bounded context and the exact remaining daily-budget boundary. The mutation runner copies source and required protocol files into a checked temporary directory, removes only the two transport disclosure checks there, requires the original denial assertion to fail, then restores and reruns. It never mutates the original product source or a live database.

`--ui` builds the product entry into a fresh temporary directory before launching the API and database fixtures. Vite preview serves that bundle to headless Chrome in a disposable browser profile. On Windows it uses the installed Chrome path; `OMB_CDP_CHROME` can select another installed executable when invoking the helper directly. The fixture owns its synthetic HttpOnly cookie and maps only its local token-exchange/product routes. Assertions cover committed rendering, reload without inference, lost-response same-key replay, typed tool execution, no token/transcript web storage, current revocation, different-tenant denial, inert HTML and stale-response suppression. Four synthetic screenshots are written to `output/ideeo-free-form-ui/` for visual inspection. They are developer evidence, not native SDK/device or human acceptance.

Preserve the original loop, admission and storage regressions. The local UI build writes only `dist/ideeo`; no command deploys it. Record dependency substitutions, setup failures, warnings, source hashes and acceptance limits in the [candidate verification record](../ideeo/development/VERIFICATION.md#free-form-controls-and-react-product-entry--19-november-2026).

### Authorized free-form live campaign

Only with explicit live-call authorization:

```powershell
node --experimental-strip-types scripts/testing/payme-storage.ts --api-root .worktrees/payme-api-admission --free-form --openai-evaluation --key-file C:/Users/mateo/Desktop/Ideeo-IA-general/.env
```

This selects only `OPENAI_API_KEY`, never loads sibling application/environment configuration, and uses fresh synthetic tenant/API/PostgreSQL resources. The existing ledger pre-debit leaves twelve model attempts and two tools, including across restart. The fixed model is `gpt-6-luna`, with 256 output tokens, eight-second physical timeout, 15-second operation deadline, `store:false`, disabled reasoning and no automatic live retries. Adding `--ui` selects the separate live browser campaign below.

The runner checks drafting/revision/Spanish continuity/refusal/reloaded recall without providing an answer allowlist, then retains current authorization, replay, ciphertext and quota-denial checks. It prints only safe check summaries, approved synthetic answer text and aggregate measured usage/estimated cost. No key, raw provider reply, private reasoning or real identity is printed. The budget-exhaustion case sets the disposable quota to its ceiling; it does not spend the remaining allowance. Treat this as a small developer campaign, not independent acceptance or broad privacy qualification.

### Hardening and live browser campaign

Use a clean disposable checkout with `pnpm install --frozen-lockfile`; do not rely on sibling dependency junctions. The `Ideeo isolated verification` workflow records the offline CI commands, including full UI/server typechecks and `tsconfig.ideeo-server.json` for product fixture code. Local PostgreSQL must be selected using `IDEEO_TEST_PG_BIN` if it is not at the fixture default. Never point fixtures at an existing application database.

With the existing explicit live-key authorization:

```powershell
node --experimental-strip-types scripts/testing/payme-storage.ts --api-root .worktrees/payme-api-admission --free-form --ui --openai-evaluation --key-file C:/Users/mateo/Desktop/Ideeo-IA-general/.env
```

The browser campaign uses the same twelve-model/two-tool maximum, omits the duplicate API-only color call, and runs three multilingual disclosure challenges instead of the original five-case API semantic campaign. It writes four screenshots to `output/ideeo-live-ui/` and prints approved synthetic answers and aggregate usage. Scripted mode still checks injected HTML inertness; live mode does not claim that controlled fault. Run heavy clean-install/browser work separately when investigating startup problems, preserve failures, and inspect the four layouts. See [acceptance gates](../ideeo/development/CONVERSATION_ACCEPTANCE.md).

### Authorized Gemini realistic task campaign

```powershell
node --experimental-strip-types --test server/ideeo/gemini.node-test.ts
node --experimental-strip-types scripts/testing/conversation-tasks.ts --gemini --key-file C:/Users/mateo/Desktop/Ideeo-IA-general/.env
```

The first command uses only a local HTTP stand-in, intercepting the HTTPS primitive inside the isolated test process; production configuration still permits only the exact Google endpoint. The live command requires explicit authorization, reads only `GEMINI_API_KEY`, and launches actual product/PostgreSQL processes with a generated signed tenant authority fixture. It is not a PayMe/browser campaign. Its eight scenarios cover workshop arithmetic and constraints, a Spanish invitation, checklist, honesty about external execution, the harmless tool and recall after restart. It checks committed replay, encryption and stored history separately from semantic review.

Each campaign is pre-debited to at most twelve model calls/two tools. Unknown usage remains unknown. Reports now have unique timestamps under `output/ideeo-realistic-tasks-gemini-*.json` (OpenAI mode also uses timestamped names), so failed attempts are retained. Non-successful turns are recorded, later independent scenarios continue, and any failed task leaves a failing process exit code. This does not enable automatic provider retry or turn an incomplete run into a passing one. The final observed Gemini run remained incomplete because the tool answer was empty; see the exact dated evidence before making capability claims.

## Local workspace capabilities

Run the completed-booking restart comparison and related database/browser suites sequentially from the repository root on the Windows Chrome fixture host.

```powershell
node --experimental-strip-types --test --test-concurrency=1 server/ideeo/booking-restart.node-test.ts server/ideeo/restart.node-test.ts server/ideeo/capabilities.node-test.ts server/ideeo/deadlines.node-test.ts server/ideeo/workspace-budget.node-test.ts
```

The booking test prints its unique JSONL path under `output/`. Each first history read targets the reported loopback URL before the React client performs session admission for status or replay. Inspect the ledger and browser counters, child lifecycle, and individual shutdown records. The separate live booking diagnostic writes its shutdown outcomes beside its pre-cleanup report in a `.shutdown.jsonl` file.

To check recovery from a failed replacement on its own, run the following from the repository root. This case holds a disposable replacement immediately before listening and uses the default ten-second readiness window. The fixture retires the old URL and waits for the failed child to exit before returning the startup error. A subsequent explicit restart can publish a new URL and serve the original tenant.

```powershell
node --experimental-strip-types --test --test-concurrency=1 --test-name-pattern="timed-out replacement" server/ideeo/restart.node-test.ts
```

For failed-turn recovery, run the following suites sequentially. The restart fixture injects a model timeout, restarts the product on the same database, checks the failed key and sends a self-contained planning revision. The capability fixture exercises an actual workspace effect followed by a failed answer commit. The browser recipe in the free-form section also checks a lost first response and an edited draft after a rejected model answer.

```powershell
node --experimental-strip-types --test --test-concurrency=1 server/ideeo/restart.node-test.ts server/ideeo/free-form.node-test.ts server/ideeo/capabilities.node-test.ts
```

The realistic workshop runner uses the original follow-up when its required turns committed. After a model failure with an uncommitted status and no workspace claim, an independently specified planning revision supplies the missing user facts. Other dependent tasks are recorded as unrun. An uncertain action or unavailable recovery check blocks further dispatch. A committed answer found after a lost response is read from history. Any unrecovered failure keeps the campaign incomplete.

Production is intended to use isolated customer VMs. Development can run the same authenticated product-to-executor contract locally with disposable PostgreSQL, workspace files, a fresh browser profile and a fake booking site. No VM service, Docker daemon or model API key is needed for these scripted tests.

```powershell
node --experimental-strip-types --test server/ideeo/capabilities.node-test.ts server/ideeo/openmaus-tools.node-test.ts
node --experimental-strip-types scripts/testing/capability-mutation.mjs
```

The browser recipe currently requires Windows and Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`; PostgreSQL follows the existing fixture discovery/configuration. It uses the inherited Chrome/CDP engine, not the agent-browser CLI. Tests fail if the browser cannot launch; this is not a silent skip. Temporary homes, receipts and browser processes are owned by the fixture and cleaned up. Run sequentially with other database/browser campaigns to avoid the previously observed fixture contention.

The actual product, signed authority fixture, executor, database, native file tools and browser are exercised. The model is scripted: actual file/booking effects and authorization are evidence, but the generated final sentence is not a natural-language semantic test. The mutation command works only on a temporary source copy, removes tenant matching and durable execution claims separately, requires failures, restores the copy and checks that original source is unchanged.

See [capability contract and limitations](../ideeo/contracts/WORKSPACE_CAPABILITIES.md). Full OpenMaus capability parity, production VM isolation, live-model task semantics and independent acceptance remain open.

For the actual Gemini/browser conversation (only with explicit authorization for the key file):

```powershell
node --experimental-strip-types scripts/testing/conversation-tasks.ts --gemini --browser --key-file C:/Users/mateo/Desktop/Ideeo-IA-general/.env
```

This mode provides the actual browser tools to Gemini with automatic selection. It uses the same workshop conversation, a fake local booking site, an executor credential generated per fixture, and a tenant budget pre-debit allowing at most 24 model calls and 20 tool reservations. Each report has timestamped JSON and HTML, observed browser actions and a strict booking criterion. A failed criterion leaves a nonzero exit status. No real email/booking service is connected. The six recorded campaigns did not complete booking; the last demonstrated real model-selected browser open/snapshot but then an empty provider completion. See the [full live evidence](../ideeo/development/VERIFICATION.md#live-browser-conversation--19-november-2026).

### Interrupted booking in React

Run `node --experimental-strip-types --test --test-concurrency=1 server/ideeo/booking-check.node-test.ts` from the repository root with the UI build dependencies, Chrome and disposable PostgreSQL installed. The test builds the React entry in a temporary directory, books through the authenticated shared loop, rejects the answer insert, restarts the product and selects **Check booking** in headless Chrome. The calendar subtest sends an explicit workshop request through React, drops the calendar's response after it writes the event, expires the original deadline, restarts the product, and checks recovery under current authority and budget. Its JSONL evidence under `output/ideeo-booking-check-*.jsonl` records the injected failures, site and ledger counters, cached replay and fixture shutdown.
