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

The [product fixture](../../verification/ideeo.md) launched the actual `server/ideeo-main.ts` entry in a separate process with temporary home/configuration, ephemeral loopback listener, generated keys and two independent tenant services. Its closed `/v2/session` route checked tenant/customer proof and a freshly correlated current-state response. The fixture exercised SDK and WhatsApp routing, overlapping tenant identifiers, wrong customer/grant/agent/client, inactive membership, paused agent, revoked/expired/narrowed grant, revoked/expired/replaced channel, authentication-time mismatch and proof expiry during the authority call.

**Results:** 53 passing Node test results across the verifier and admission suites. Authority outage, bounded timeout, redirect, malformed/oversized/secret-echo response, mismatched caller, stale/future observation and replay all denied admission without retries or another-tenant fallback. Wrong workload credentials and removed tenant configuration failed closed. Missing configuration/secrets prevented process startup; legacy/tool/conversation routes stayed closed and the temporary home stayed empty. No real API, bank, model or user application was contacted.

Two deliberate mutations were made only in a disposable source copy. Removing active-state enforcement caused membership, agent, grant and channel revocation tests to fail. Removing response-context binding caused the cross-tenant response case to fail. Both guards were restored and the complete 53-result run passed afterward.

A focused strict TypeScript check of all candidate modules, shared wire types and fixture/tests passed with the server's ES2023/Node settings. The fixture initially lacked the transitive `undici-types` dependency; supplying it exposed unknown JSON-result types in the tests, which were corrected with runtime shape assertions. Targeted Oxlint passed with no warnings. Tools: Node 24.15.0, `jose` 6.2.10, TypeScript 7.0.2, Oxlint 1.80.0. The isolated test checkout used exact copies of the candidate files and the installed pinned `jose` artifact; it was not a full repository dependency installation or build.

**External gap:** the proposed `ideeo-admission-1` status endpoint is implemented only by the synthetic fixture. The inspected PayMe broker does not expose it. Real destinations are disabled in this startup profile pending tenant implementation and qualification. Financial authority, conversation/history persistence, consumer/device acceptance, independent review and production approval remain outstanding. Admission is not a durable or financial permit.
