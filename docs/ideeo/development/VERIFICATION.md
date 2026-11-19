# IdeeoOrchestrator verification

This record belongs to the OpenMaus-based candidate. The [source candidate verification index](../reference/development/VERIFICATION.md) is historical/reference evidence and does not qualify this implementation.

## Current scope

The initial documentation import and HTML rendering checks qualify documentation only. Subsequent sections record the token verifier and isolated product admission service. Those services have synthetic developer verification; conversation, database, financial authority, real bank, worker and browser-task integration remain unqualified.

Run application verification through the root [isolated fixture guide](../../verification/README.md). Extend that harness with disposable product PostgreSQL, authority, Temporal and browser resources when implementing the product. Never verify mutations against the user's live application or data.

## Required evidence for implementation

Record the exact source/build/configuration, fixture identity, contracts and model/tool/browser versions; commands and selected cases; expected and observed behavior; retained failures; reviewer findings and remediations; independent human acceptance and open external prerequisites. Distinguish synthetic contract checks, live public-source reads, actual tenant/native integration and production approval.

The [adaptation plan](../../../output/ideeo-openmaus-product-adaptation-plan-2026-11-18.md) defines fourteen complete journeys and proposed verification files. [Consumer conformance](CONFORMANCE.md) applies at the public interface. No existing recipe or imported test count is a passing result for these journeys.

## Documentation checks — 18 November 2026

- Verified original SHA-256 values for all 102 imported files against the recorded committed revision or explicitly identified working-tree source. The 27 imported JSON/image artifacts remain byte-identical to those sources. The manifest records destination hashes separately for adapted content.
- Checked 2,391 local file/fragment links across 82 Markdown/HTML documents, including the adaptation plan: no missing targets. External URLs and source-reference locators were not validated as available evidence.
- Parsed all 28 JSON files, including the manifest. All sixteen schema files passed Draft 2020-12 structural checks; the source schemas do not declare a dialect. This is not consumer conformance testing.
- Rendered the rewritten architecture with headless Chrome in an isolated Playwright browser at 1440 × 1000 and 390 × 844, plus desktop dark mode. Inspected screenshots of the opening page, component diagram and mobile layout. No document overflow, duplicate IDs, unresolved internal navigation, page errors or HTTP requests occurred.
- `git diff --check` passed for tracked entry-document changes. No application runtime tests were run because application code was unchanged.

These checks establish documentation integrity and rendering only. Independent human acceptance and product integration qualification remain pending.

## Tenant-token verifier — 19 November 2026

The verifier and its Node tests are in `server/ideeo/identity.ts` and `identity.node-test.ts`. The [tenant session contract](../contracts/TENANT_SESSION_INTEGRATION.md) records the inspected cookie exchange and signed SDK/WhatsApp identities. Its initial module qualification below preceded the product-route wiring recorded in the next section. The verifier itself makes no current-authority decision.

Twenty-five checks passed, including synthetic cryptographic proof, two tenant namespaces, channel binding, malformed/expired credentials, tampering, audience restrictions, key rotation and an ephemeral loopback HTTP fixture. No existing application, bank, issuer or model was contacted. A focused strict typecheck of both files also passed.

The checkout had no installed dependency tree. Verification used disposable copies of these two source files and the already-installed `jose` 6.2.10 artifact matching this repository's pin, under a temporary directory. Node was 24.15.0; the focused compiler was TypeScript 7.0.2 with explicit Node types. The compiler's initial fixture lacked its native platform package, then lacked the explicit Node types option; both fixture setup issues were corrected before the passing check. The package-manager launcher attempted a fetch and failed; no dependency installation or full repository build was completed. No product-route test or independent acceptance was run. The normal repository command after dependency installation is `pnpm test:ideeo-auth`.

## Isolated product admission — 19 November 2026

Published implementation: `27865fcabadf5e5518263463d40d48c508f5d4fc` on `dev`; the matching `origin/dev` commit was verified after push. This identifies the tested implementation, not an independent acceptance or release approval. The later roadmap/status refresh changes documentation only and does not add new runtime evidence.

The [product fixture](../../verification/ideeo.md) launched the actual `server/ideeo-main.ts` entry in a separate process with temporary home/configuration, ephemeral loopback listener, generated keys and two independent tenant services. Its closed `/v2/session` route checked tenant/customer proof and a freshly correlated current-state response. The fixture exercised SDK and WhatsApp routing, overlapping tenant identifiers, wrong customer/grant/agent/client, inactive membership, paused agent, revoked/expired/narrowed grant, revoked/expired/replaced channel, authentication-time mismatch and proof expiry during the authority call.

**Results:** 53 passing Node test results across the verifier and admission suites. Authority outage, bounded timeout, redirect, malformed/oversized/secret-echo response, mismatched caller, stale/future observation and replay all denied admission without retries or another-tenant fallback. Wrong workload credentials and removed tenant configuration failed closed. Missing configuration/secrets prevented process startup; legacy/tool/conversation routes stayed closed and the temporary home stayed empty. No real API, bank, model or user application was contacted.

Two deliberate mutations were made only in a disposable source copy. Removing active-state enforcement caused membership, agent, grant and channel revocation tests to fail. Removing response-context binding caused the cross-tenant response case to fail. Both guards were restored and the complete 53-result run passed afterward.

A focused strict TypeScript check of all candidate modules, shared wire types and fixture/tests passed with the server's ES2023/Node settings. The fixture initially lacked the transitive `undici-types` dependency; supplying it exposed unknown JSON-result types in the tests, which were corrected with runtime shape assertions. Targeted Oxlint passed with no warnings. Tools: Node 24.15.0, `jose` 6.2.10, TypeScript 7.0.2, Oxlint 1.80.0. The isolated test checkout used exact copies of the candidate files and the installed pinned `jose` artifact; it was not a full repository dependency installation or build.

**Gap at that published revision:** `ideeo-admission-1` existed only in the synthetic fixture. The actual API implementation and synthetic integration recorded below supersede that implementation gap, while source/backend qualification and real-destination restrictions remain. Financial authority, conversation/history persistence, consumer/device acceptance, independent review and production approval remain outstanding. Admission is not a durable or financial permit.

## Actual PayMe API synthetic integration — 19 November 2026

Source state was inspected before changes: product `dev` at `27865fcabadf5e5518263463d40d48c508f5d4fc` with six uncommitted documentation-refresh files; PayMe API `dev` clean at `0d111de98b996d68b4af30115de620c2254973ef`. Existing documentation work was preserved. At verification time, API implementation was uncommitted in registered worktree `C:/Users/mateo/Desktop/IdeeoOrchestrator/.worktrees/payme-api-admission`, branch `ideeo-admission-integration`; the original API checkout remained unchanged. Product implementation/testing changes were uncommitted on its existing branch. No subagents, deployments, merges, pushes or publication were used during implementation/verification. Exact working-source hashes are recorded separately from historical source imports in `SOURCE_MANIFEST.json`.

The actual `createApp` API runs over HTTP with PGlite 0.5.14 and the repository's actual migrations. The fixture creates only synthetic users, opaque sessions, bank links, owner grants and channel bindings; signing keys/workload credentials are generated. A separate ephemeral loopback source supplies explicit synthetic `ideeo-bank-admission-1` status, not generic context. The actual product entry runs as an owned child with temporary home/configuration and allowlisted environment. No `.env`, running user application, real customer data, native bank, Meta or model is used. Native encrypted identity fields contain unreadable sentinel values, establishing that admission does not decrypt them. Cleanup closes owned resources and removes only the checked temporary directory.

The SDK success case uses the actual cookie-backed `/api/nico/token` exchange before `/v2/session`. WhatsApp uses the actual tenant signer, SQL binding and source check. The native WhatsApp case uses current tenant-owned A0 identity/assistant/grant/account/channel records and no bank calls. Hosted Armoni and native SDK are explicitly unavailable; they are not represented as successful bank integrations.

Executed commands from the product root unless noted:

```powershell
node --experimental-strip-types scripts/testing/payme-admission.ts --api-root .worktrees/payme-api-admission
node --experimental-strip-types --test server/ideeo/identity.node-test.ts server/ideeo/admission.node-test.ts
node .worktrees/payme-api-admission/node_modules/typescript/bin/tsc --noEmit --target ES2023 --module NodeNext --moduleResolution NodeNext --allowImportingTsExtensions --strict --noUnusedLocals --noUnusedParameters --skipLibCheck --types node server/ideeo-main.ts server/ideeo/identity.node-test.ts server/ideeo/admission.node-test.ts scripts/testing/payme-admission.ts scripts/testing/fixture-http.ts
node C:/Users/mateo/Desktop/OpenMausBot/node_modules/oxlint/bin/oxlint --deny-warnings server/ideeo shared/ideeo scripts/testing/ideeo-fixture.ts scripts/testing/payme-admission.ts scripts/testing/fixture-http.ts
```

From the API worktree:

```powershell
node node_modules/typescript/bin/tsc --noEmit
node node_modules/typescript/bin/tsc -p tsconfig.build.json
node node_modules/tsx/dist/cli.mjs scripts/export-openapi.ts
node node_modules/vitest/vitest.mjs run --maxWorkers 2 --pool threads --reporter verbose
```

The direct executables perform the package's typecheck/OpenAPI/test scripts with explicit test concurrency. Product commands after normal dependency installation are `pnpm test:ideeo-admission` and `pnpm test:ideeo-payme --api-root <isolated-api-checkout>`. This restricted checkout uses local installed dependency artifacts via directory junctions: product `jose` 6.2.10 matches its pin; API `jose` 6.2.15, TypeScript 5.9.3, Vitest 5.0.5, PGlite 0.5.14, Node 24.15.0 and Oxlint 1.80.0. No clean locked dependency installation or full product build is claimed. The full API suite's sibling `payme-emulator` source is linked read-only from its independent checkout.

**Process integration: 30 checks passed.** Both channels admitted; signed foreign tenant/different caller/expired proof denied; revocation after success, paused agent, inactive membership, expired grant, WhatsApp rebinding, SDK logout and changed caller binding denied. Wrong workload proof denied. Source outage/unsupported endpoint/timeout/redirect/generic-context shape/oversized/secret-extra-field/unbound/stale/future/replayed reply returned safe unavailable. Revocation during the source await denied. Native owner-grant revocation after success denied; actual API outage returned unavailable. Source calls were exactly one for each applicable sandbox request and zero for local denial, unsupported hosted/native paths and native local authority. Replies/logs were checked for generated credentials, customer tokens, opaque session credential and protected sentinels. Generic bank calls, model turns/media observation and financial execution remained empty.

**Independent tenant regression: 53 Node results passed.** Both original independent tenant services and overlapping identifiers remain covered. This run also retains configuration/real-destination restrictions and legacy-route closure. Focused strict product typecheck and targeted lint passed.

**API checks: 589 tests passed across all 47 files** in 303.91 seconds, including the 50 new admission cases, existing broker/hosted-bank/native/WhatsApp behavior, copy and module-boundary checks. API typecheck, production TypeScript build, OpenAPI generation and `git diff --check` passed. The 50 admission cases include strict signed delegation, SDK expiry/idle/logout, current native authority/account/scope/realm and a bounded database outage without a source call. The earlier focused version passed 42 checks; eight additional delegation/database cases are included in the final full-suite count.

**Mutation evidence:** a disposable copy of the API source/migrations was used with the same fixture. Replacing `status.grant.status !== "active"` with `false` made `enforces current grant revocation after success` fail (200 instead of 403). Removing the adapter's response-context equality check made `fails safely on source mismatch with one bounded call` fail (200 instead of 503). Each selected test was run with `node node_modules/vitest/vitest.mjs run src/modules/broker/admission.test.ts --maxWorkers 1 --pool threads -t <test-name>`. Both mutations were detected; copied files were restored in `finally`, and original worktree files were never weakened. The same two selected tests passed again in the original API worktree (48 other admission cases intentionally excluded by that selection). These are developer sensitivity checks, not independent review.

Retained setup failures: initial API typecheck found an OpenAPI validation-hook return-type error, corrected before passing. A dependency-directory junction initially made Vite's cache unwritable; package-level junctions leave caches in the disposable worktree. The first product regression had 52/53 passing because native `fetch` rejected an OS-assigned fixture port as browser-blocked; the tests now use Node HTTP and all 53 pass. The first full API fork-worker run lacked the expected sibling emulator source and stalled; it was interrupted through its owned execution session. The read-only sibling source was supplied and the complete suite rerun with thread workers. These failures are not erased by the later passing scoped runs.

Documentation checks validated 255 local links/Markdown fragments across the eight updated guides/contracts/plan, parsed the provenance manifest, refreshed 111 destination hashes without replacing original source hashes, and recorded 14 product source hashes plus 11 changed API file hashes. Product whitespace was checked with `git -c core.whitespace=cr-at-eol diff --check` because several inherited files are committed as CRLF; API `git diff --check` passed normally.

**Classification and open gates:** actual tenant/API/product code with synthetic identities/resources and synthetic sandbox status evidence; developer verification only. The new source extension is not implemented or qualified in an existing bank by this work. Native status denotes tenant-owned A0 authority, not bank-account status or a bank mandate. Hosted Armoni/native SDK remain unavailable. Product real destinations stay disabled. Independent review, different-human acceptance, SDK/native-device/Meta consumer adoption, source contracts, full locked product build and production security/operational/legal/recovery qualification remain pending. No conversation storage or UI work was started.

## Local commit delivery — 19 November 2026

The user subsequently requested commits to `dev`. PayMe API commit `4efeaf56d3e7f47248d76938f979b0d5a7d7b6cf` was created from the verified worktree and fast-forwarded into the clean original API checkout's local `dev`. The paired product changes and preserved documentation refresh are delivered by the local `dev` commit containing this record. Only delivery/provenance text changed after the recorded tests; application/test source is unchanged. No remote push or deployment was performed. Synthetic evidence and all pending acceptance gates retain the scope above.
