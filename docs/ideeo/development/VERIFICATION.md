# IdeeoOrchestrator verification

This record belongs to the OpenMaus-based candidate. The [source candidate verification index](../reference/development/VERIFICATION.md) is historical/reference evidence and does not qualify this implementation.

## Current scope

The initial documentation change imports requirements and source references, rewrites the architecture and connects repository entry instructions. No server, model, database, authority, bank, worker or browser-task runtime behavior was changed or qualified. HTML rendering is document QA, not application acceptance.

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
