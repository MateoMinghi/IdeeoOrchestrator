> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../../README.md).

# Verification evidence

For repeatable developer checks, use the [explicit test profiles](../SOURCE_REFERENCES.md#source-6888cd86cead).
Each run preserves its revision, selection and observations in ignored artifacts; these checks do not replace independent acceptance.

This index links recorded evidence; current issue state and independent acceptance live in Linear. The WhatsBank capability foundation is a local feature-branch increment, with source hashes in its manifest. Earlier reports retain their own revision and scope; they do not qualify changed code.

## Capability snapshot

### Native retained evidence and durable controls

The native evidence/control increment developed over `8285964` adds
native retained-public-evidence queries, task inspection, same-task correction
and cancellation. [Developer evidence](../SOURCE_REFERENCES.md#source-99d001c2f510)
records source hashes and 113 targeted scenarios passing after rechecks, including
current authority/client-profile restrictions, source and goal races, exact
correction text, atomic control/receipt rollback, duplicate replay, failed partials
and reload. The serial fast profile passed **2,850 tests**; its first concurrent
run hit the unchanged 180-second watchdog and remains recorded as interrupted.
Lint, all 199 source-file type checks, generated contracts and changed-file formatting
passed. Whole-repository formatting still flags the unchanged
`tests/test_shared_deployment_configuration.py`. A disposable-copy mutation of
exact-customer-text validation was detected by its negative test.

Real OpenAI `gpt-6.1-sol` at low reasoning effort made **20 physical calls** through
authenticated in-process engine HTTP and isolated PostgreSQL, using synthetic
principals and seeded retained observations (28,864 input / 2,280 output tokens).
The [initial journey](../SOURCE_REFERENCES.md#source-1effcf5b5293)
completed comparison, focused lookup, correction plus a side question, unrelated
conversation and pre-correction evidence lookup, then stopped on an incorrectly
encoded expected string. Its failed report is preserved. The separate
[cancellation case](../SOURCE_REFERENCES.md#source-735fbec8fe6b)
and [integrated journey](../SOURCE_REFERENCES.md#source-090bfd127b6b)
passed. The final [one-call failure case](../SOURCE_REFERENCES.md#source-c9135125ca8f)
uses the final runtime source and proves that a real model-selected correction
survives an injected malformed follow-up, replay and reload; this is not a natural
provider failure. Per-run ledgers/manifests distinguish those revisions from later
deterministic hardening and test-harness repairs.

These checks establish retained-data/control behavior, not native page acquisition,
new task execution, physical browser cleanup, real tenant/bank adoption or consumer
acceptance. Cancellation was observed as `cancel_requested`; the compatible worker
still owns cleanup confirmation. The subsequent
[independent review and remediation evidence](../SOURCE_REFERENCES.md#source-b995b94f3830)
records the exact reviewed source, primary Codex review and separate
`gpt-6.2-astra` adversarial review. Both report no remaining runtime blockers
after remediation. Findings covered startup configuration, retained-source
provenance and masking, control authorization races, evidence-to-control fencing,
cancellation/replay semantics, scoped task selection, response bounds and
authorization-cache failure isolation. New regression failures and rechecks are
preserved in that report. Different-human acceptance and production approval
remain pending; authorized local integration does not satisfy those gates.

Review remediation has **154 current targeted scenarios passing across the
recorded runs**, including startup composition, two-phase control races, ambiguous
selection and a twelve-task/twelve-turn authorization bound. The strengthened
history regression passes on repaired source and detects deliberately restored
shared mutable caches in a disposable copy.
The final fast profile passed **2,851 tests** with eight subtests and 1,337
out-of-profile cases deselected. Its prior 180-second interruption remains recorded;
the successful run used the same watchdog after the isolated PostgreSQL instance
was stopped. This timing observation does not establish the interruption's cause.

The review refresh made **nine additional real OpenAI calls** with synthetic data.
Its [integrated attempt](../SOURCE_REFERENCES.md#source-41ba3bc01b42)
completed comparison but unnecessarily inspected the sole task before correction;
the routing instruction was repaired. The
[failure-receipt case](../SOURCE_REFERENCES.md#source-3d2407caf898)
passed. The subsequent [four-call controls run](../SOURCE_REFERENCES.md#source-1b7a738a8297)
applied correction, answered the side question, replayed without inference and
requested cancellation of the same task. That run then failed an inappropriate
price-summary assertion on its stop-only request, before reaching reload. Its
failed status is preserved. The corrected evaluator and final restrictive
named-target prompt qualifier were independently reviewed but not paid-rerun;
this is case-level live evidence, not an all-green final live journey. Deterministic
receipt/replay/reload evidence remains separate.
Affected scope: LR-01/02/03/04/05/12; ISO 27001 A.5.15/A.5.18, A.5.19/A.5.20,
A.5.34, A.8.15, A.8.26, A.8.29, A.8.32; ISO 42001 A.6.2.4/A.6.2.8/A.7.2.

### Native-runtime first increment: history and cancellation

Commit `491ba70`, integrated into local `dev`, passed
[105 focused developer checks](../SOURCE_REFERENCES.md#source-99ec77a7bb30),
including PostgreSQL history/privacy, repeated cancellation and host-banking
regressions. The [live OpenAI report](../SOURCE_REFERENCES.md#source-ff3a025975e8)
records five passing cases and seven actual `gpt-6.1-sol` calls at low reasoning
effort through authenticated in-process engine HTTP and isolated PostgreSQL.
[Source hashes](../SOURCE_REFERENCES.md#source-86c2cdaf0939)
and the [call ledger](../SOURCE_REFERENCES.md#source-f8a039bfaca4)
identify the tested candidate and usage. Revision/recall/reload, authorized failed
partials, revocation and replay passed. Cancellation and validation failures were
injected after real responses; this does not measure natural provider failures
or remote inference cancellation. Tenant/bank data were synthetic, with no browser
acquisition or financial effects. Independent reviews and human acceptance remain
pending; the later native conversation loop is not implemented by these repairs.
Affected scope: LR-01/02/03/04/05; ISO 27001 access, supplier, privacy, logging and
verification controls; ISO 42001 A.6.2.4/A.6.2.8. No production approval is claimed.

### Native source-free conversation

The separate native conversation service developed over `491ba70` is the default
under [ADR-017](../../decisions/017-native-conversation-runtime.md).
The [developer evidence](../SOURCE_REFERENCES.md#source-4a8ac3fd174d) records
focused native, legacy lifecycle and gateway checks, including current authorization,
memory expiry, model routing/accounting, replay, SSE and repeated cancellation.
Independent reviews and human acceptance remain pending.

The [default-selection recheck](../SOURCE_REFERENCES.md#source-c7c219808ac0) records
the native-default startup/configuration checks and explicit legacy regression
fixtures. Existing banking/browser/background qualification harnesses select legacy
explicitly; the main runtime and administration development server inherit native.
The recheck passed 123 cases; two standalone-authority cases and one retained-report
browser case were skipped because their dedicated fixtures were not configured.
Lint, formatting and affected-module type checks passed. The earlier six-call live
journey remains separately attributed; changing the default did not rerun paid inference.

The [live journey](../SOURCE_REFERENCES.md#source-cc38bad1451a)
passed greeting, drafting, revision, a side question, exact recall and reload through
authenticated in-process engine HTTP with isolated PostgreSQL and a synthetic tenant.
Six actual OpenAI `gpt-6.1-sol` calls used the native reply schema; the final reply
correctly stated browsing/purchasing was unavailable. No execution tools were registered.
The [ledger](../SOURCE_REFERENCES.md#source-c1a9ca2530c3)
records 3,173 input and 267 output tokens. [Live source hashes](../SOURCE_REFERENCES.md#source-00ac2cc7a507)
identify that candidate. A subsequent cancellation-status compatibility correction
(`interrupted`, rather than `failed`) and formatting are covered separately by the
developer evidence; the paid journey was not repeated for that failure-path change.
No browser, tenant bank integration, UI acceptance or production approval is established.

### PayMe personality configuration and conversation diagnosis

The [configuration comparison](../SOURCE_REFERENCES.md#source-3efe9ef4c564)
records PayMe development profile **6 -> 7**, runtime acknowledgement and matching
draft/publication. Role, purpose and guidance now describe a warm personal
assistant; model, tools, integrations, authority and retention were preserved.
Version 6 remains the recovery source. Nine synthetic app-channel engine turns
before and nine after used the same deployed `gpt-6.1-sol` runtime; two additional
follow-up turns tested recall. All 20 returned completed conversation/dialogue
results with no background tasks, but this is **not a quality pass**.

Fixed greeting/capability rendering persisted. Three replies reached the
1,200-character schema limit and ended incompletely. The assistant could not
repeat its immediately preceding invitation: deployed model context omits ordinary
assistant answers. The deployed admin schema rejects advanced `style` and
`guidance_rules` fields supported by the engine, so only compatible fields were
published. The report preserves actual runtime fingerprints, examples and these
unresolved findings; local checkout was `92f0b32`. This was configuration-only
work with no runtime code deployment. Independent human acceptance, native/WhatsApp
and background-journey checks remain separate. Applicable obligations: LR-01/02/04/05/12,
ISO 27001 access/configuration/audit controls and ISO 42001 behavior-verification controls.

The subsequent [conversation repair evidence](../SOURCE_REFERENCES.md#source-61193a96dbab)
records the uncommitted `fix/payme-assistant-conversation` increment over `92f0b32`,
deployed to Railway development, and PayMe profile **7 -> 8**. The admin and engine
now have matching inspected source/schema; authority forward migrations 009/010
resolved the admin startup failure. Style and four guidance rules validate in
both runtimes. Profile 7 and prior VM source backups remain recovery references.

Thirteen final synthetic engine-API turns completed with dialogue-only outcomes
and no financial/background actions. An explanation grew from a clipped 1,200
characters to a complete 1,475; capability help changed from a 1,572-character
inventory to a relevant 443-character answer. Exact prior-draft repetition,
corrected plan continuity, requested brevity and rejection of chat-as-approval
were observed. The initial repair still selected capability templates; its
conflicting instruction and failed observation are preserved in the report.
The final [PostgreSQL/host checks](../SOURCE_REFERENCES.md#source-106f38d62ed3)
passed 43 tests; [prompt/identity/control checks](../SOURCE_REFERENCES.md#source-8fe4b17ec427)
passed 61. Earlier broader results and a corrected whitespace-only test fixture
are recorded separately. Removing the prose-eligibility guard in a disposable
copy caused three privacy tests to fail as intended. Ruff, affected-file Mypy,
schema regeneration/check and live admin health/authentication-origin checks passed.

These are developer observations. Independent primary/cross-model review, a
different human's acceptance, authenticated Studio browser-save verification,
native/WhatsApp and background-journey checks remain pending. No merge, push or
production promotion is included. Compliance scope: LR-01/02/03/04/05/12;
ISO 27001 5.15, 5.34, 8.3, 8.9, 8.15, 8.26, 8.29, 8.32;
ISO 42001 A.6.2.4, A.6.2.8, A.7.2. Existing provider, retention and protected
banking boundaries remain; this grants no real-data or legal approval.

The subsequent [full conversation transcripts](../SOURCE_REFERENCES.md#source-d99d4d047f85)
and [case-level review](../SOURCE_REFERENCES.md#source-8f4b74339a43) cover
**47 live turns in 11 conversations** on the unchanged deployed profile 8 and
recorded engine hashes. All returned HTTP 200, but **two turns failed** with
`provider_invalid_output`; HTTP success is not a quality pass. Warmth, corrected
constraints, English/Spanish switching, requested formatting, exact draft recall,
bounded-memory honesty, fresh-chat separation, idempotent replay and streamed
event replay worked in the observed cases. Median full-response time was 8.81 s;
the streaming check delivered its first event in 0.93 s and full reply in 6.46 s.

One Python-documentation research task completed after a same-task correction,
while a conversational side question remained usable. Broad result follow-up
and its first recovery attempt failed despite retained evidence; a narrow saved
code-example request succeeded without creating another task. The failed turns'
immediate source-bearing fallbacks were replaced by generic errors in reloaded
history (`capabilities/history.py`'s failed-turn branch). Task presentation also
retained irrelevant booking disclaimers and internal filter wording. The raw
responses, history differences and missing field-level failure diagnostics are
preserved; these findings remain unresolved. No runtime/configuration change was
made during the campaign. This synthetic developer evaluation is not independent
acceptance or native/WhatsApp, real-bank or cross-tenant qualification; the same
legal-register and ISO verification scope above applies.

### SDK catalogue, task status and daily AI cap

The pre-publication [fast-profile recheck](../SOURCE_REFERENCES.md#source-f6cb47578753)
passed 2,836 tests and eight subtests, including shared deployment configuration
isolation. The earlier 240-second run was interrupted under concurrent load;
its failing property case passed alone and in the full rerun. These are local
developer checks, not independent acceptance.

PayMe development disables the engine's daily AI cap with
`ENGINE_DAILY_INFERENCE_CALLS_PER_GRANT=0`, in both Railway configuration and the
single-owner VM. Usage remains counted and caller-scoped; existing counters are
not reset. Knowledge inference accepts the same setting. Provider throttling,
authentication controls and finite per-task execution budgets are separate.

SDK deployment `dbeb4d6d-cc57-4f29-9f87-27333b1a203b` renders catalogue entries,
including bill ranges, recharge denominations, currency/reference requirements and
pagination. It distinguishes daily budgets, provider throttling and task capacity;
terminal task failures override stale progress text. History reauthorizes and
shows public catalogues, and reports failed turns honestly. Plain-text catalogue
names are quoted as source data, not interpreted as instructions or markup.
Initial research setup no longer claims that customer changes were saved.

[Runtime fingerprints](../SOURCE_REFERENCES.md#source-4e576ce48333),
[SDK fingerprints](../SOURCE_REFERENCES.md#source-a6cacb20427e) and the
[final health/hash check](../SOURCE_REFERENCES.md#source-a89da911bd7a) identify the
uncommitted increment over `dd3721b`. [SDK tests](../SOURCE_REFERENCES.md#source-1ab3ef85c0a4)
passed 117 cases; type checking, lint and build passed. The
[PostgreSQL checks](../SOURCE_REFERENCES.md#source-c46be74a1004) passed 43 cases;
[final budget/history rechecks](../SOURCE_REFERENCES.md#source-0d23615d348e)
passed nine, including usage beyond 100 and cross-member isolation. The
[presentation/knowledge regressions](../SOURCE_REFERENCES.md#source-24ee79122939)
passed 112 cases. Ruff and affected-file Mypy checks passed.

[Live SDK observations](../SOURCE_REFERENCES.md#source-c11626cc5a1b) use a synthetic
PayMe account, real OpenAI calls and public MDN pages. Catalogue rendering and
history passed; greetings and natural-language progress worked while research
ran. Task `d73d33b9-421a-46ea-91fa-35d7d273d498` completed with a verified goal and
official HTTP 429 / Retry-After sources. Mobile-sized screenshots cover
[catalogue](../SOURCE_REFERENCES.md#source-ca8e6816782e),
[concurrent conversation](../SOURCE_REFERENCES.md#source-c6891a2e4db3)
and [completed research](../SOURCE_REFERENCES.md#source-f6d878825121).
The progress screenshot exposed the initial-setup wording issue; the final
deterministic regression and deployment correct it. No extra live research was
needed for that copy-only correction.

The initial engine restart rejected zero in the knowledge-handler validator and
temporarily stopped the development API. The validator was corrected, application
construction verified under the engine user, and the service restored before the
live checks. These remain developer checks; independent human acceptance,
native-device acceptance and production approval are pending. Affected obligations:
LR-01/02/04/05, ISO 27001 access/usage controls and ISO 42001 verification controls.
No real-customer banking execution, new vendor or legal approval is claimed.

### SDK new chats and retained conversation history

PayMe development's embedded SDK now exposes **Nuevo chat** and **Historial**.
The authenticated history API is caller-bound, paginated and subject to the
existing encrypted task retention; original messages retained by new V2 turns
are separate from model context. Legacy originals may be absent. Banking results
and historical financial approval controls are excluded from transcript replay;
background recovery is scoped to the opened conversation.

The increment is uncommitted work over `dd3721b` on
`feat/openmaus-browser-worker`; [runtime fingerprints](../SOURCE_REFERENCES.md#source-8b9e7dbc85c2)
identify all 392 deployed engine files, verified by the
[health/hash check](../SOURCE_REFERENCES.md#source-428a13f7e548).
SDK deployment `e0a79ff8-1b05-4448-8bd9-935ac284ca26` and edge deployment
`c7edee79-4ae6-47e8-906b-5f4fdbcdc640` succeeded in development.
[SDK source fingerprints](../SOURCE_REFERENCES.md#source-dbb65159825b)
identify the external SDK snapshot.

[Backend checks](../SOURCE_REFERENCES.md#source-6e5bb65d288c) passed 50
tests on an isolated PostgreSQL instance, including history isolation, pagination,
expiry/revocation, missing legacy text, model context and host-banking regressions.
The separate identity/history pass ran 12 tests. SDK tests passed 112; type checking,
linting, build, engine Ruff/Mypy and generated-contract freshness passed.
[Live browser observations](../SOURCE_REFERENCES.md#source-1da6ed930979) exercise
the deployed SDK and engine with the synthetic PayMe account and three real
configured OpenAI turns: distinct conversations, reopening/continuation, reload
and task isolation. Mobile-sized screenshots cover the
[history list](../SOURCE_REFERENCES.md#source-f8f18095968e) and
[reopened conversation](../SOURCE_REFERENCES.md#source-c88435f6beb1).
The initial harness could not read an SSE response after SDK cancellation;
[that observation](../SOURCE_REFERENCES.md#source-02966fbe85a4)
is retained. The successful run verifies completed turns through the history API.

These are developer checks, not independent human acceptance, native iOS/Android
evidence or production approval. Affected obligations are LR-01/02/04/05,
ISO 27001 access/retention controls and ISO 42001 verification controls; no new
vendor, real-customer disclosure, retention extension or production policy is
approved by this increment.

### SDK published-tool inheritance and development preparation

PayMe development v6 removes only the browser rollout's stale `payme-app`
two-tool override from v5, preserving all 17 Studio selections. Current runtime
and tenant token configuration enable the four bank reads, transfer/bill/top-up
preparation, public research, and task listing/cancellation/watches: 11 capabilities.
The SDK still intersects published selection with trusted backend support and
customer authority; the five unconnected tools plus skipped phone reservations
are not advertised as operational. Purchase quotes, approved artifacts, compatible
phone-transfer routing, onboarding host adoption and banking-request journal
integration remain missing in this SDK deployment.

[Deployment source fingerprints](../SOURCE_REFERENCES.md#source-936ad2451bf9)
identify the three-file update over the previously verified VM snapshot.
[Initial live observations](../SOURCE_REFERENCES.md#source-35dc5762bb21) and
[corrected-input rechecks](../SOURCE_REFERENCES.md#source-b2538e25a392)
use the synthetic PayMe SDK account and real OpenAI calls. Account details,
history and catalog reads work. Transfer, bill and top-up proposals reached
`approval_required` and were cancelled without execution. Browser delegation,
natural task progress and cancellation passed, with final `cancelled` state.
Monitoring is advertised but a complete timed watch was not run in this check.

The initial test transfer had an invalid CLABE checksum and the bill violated
catalog reference/amount constraints; both failed closed. Task wording initially
confused background tasks with banking-request history; the revised capture
instruction and live empty/populated-conversation checks passed. The
[fast suite](../SOURCE_REFERENCES.md#source-55d522e006d7) passed 2,821 checks
before that final instruction-only update; its affected capture/identity tests
then passed 52 checks (eight infrastructure cases were not run). Twelve deployment
overlay configuration tests, Ruff and targeted typing passed. Independent review,
human acceptance, actual native-device verification and real-bank execution remain
unperformed; this is development integration evidence, not production approval.

### Studio save authentication repair

The 2026-11-16 hosted-console observation showed successful authenticated reads
followed by `PUT /api/admin/tenants/payme/draft` returning 404 at 17:23 UTC.
The newer console preflight called `/admin/v1/auth/validate`, absent from the
running `ad434a2b` admin API. The proxy mislabeled every preflight failure as
`authentication_required`. This was not evidence of session expiry.

Development admin deployment `0007411a-bf3a-4230-b4c4-d76564d52df1` backports the
session/origin/CSRF endpoint onto that existing release; it is not a full current
admin-API upgrade. The current branch also places that endpoint with core auth.
Web deployment `2a6901e2-67e5-4478-944e-8e3ae7c2731f` reports missing endpoints and
upstream failures as unavailability while preserving 401/403/429 behavior.
[Source manifests](../SOURCE_REFERENCES.md#source-0b1020bb5cf9) identify
both uploaded candidates. The separate OpenMaus API/worker deployment is unchanged.

The first backport rollout failed because legacy startup tried to bootstrap a
test mandate and authority returned 403. The passing rollout explicitly sets
`DEPLOY_BOOTSTRAP_TEST_MANDATES=0` for the existing installation; dependency health
checks and request-time authorization remain enforced, and no mandate is renewed.
The first web upload failed before build because its archive omitted the configured
`apps/admin` root; the corrected archive preserves that directory. Earlier full
admin upgrades failed in authority startup and remain unqualified by this backport.

Eight [current-source checks](../SOURCE_REFERENCES.md#source-68918691d1fd)
and eight [exact-backport checks](../SOURCE_REFERENCES.md#source-0a059e62c718)
passed for session/CSRF/origin denial and startup provisioning controls. All 24
console Node tests, TypeScript and the clean production build passed. The local
dependency tree initially lacked Next dependencies; the isolated locked install
built successfully. [Live checks](../SOURCE_REFERENCES.md#source-f4a4e62f57dc)
confirm the endpoint now exists, anonymous writes remain denied, foreign origins
are rejected and admin health is 200. No operator session was minted or copied;
no draft or published agent configuration was changed by these checks. A successful
save was subsequently confirmed by the user in the existing authenticated browser;
Railway recorded `PUT /api/admin/tenants/payme/draft` returning 200 at
17:40:48 UTC. This is human confirmation of the reported save defect, not broader
publication, banking or production acceptance. No publication was performed by
the agent. Authentication impact: LR-01/LR-04/LR-05/LR-13; ISO/IEC 27001
5.15–5.18, 8.5, 8.26, 8.29 and 8.32. No new model disclosure or AI-provider route.

### Connected PayMe development browser

The 2026-11-16 connection supersedes the package-only deployment below. It uses
the PayMe synthetic OTP/customer/authority fixture, real OpenAI `gpt-6.1-sol`
with low reasoning, and live public websites through the deployed engine API.
The working tree is based on `dd3721b`, not a committed release. The
[v7 source snapshot](../SOURCE_REFERENCES.md#source-a415e27401be)
and [391-file deployed runtime manifest](../SOURCE_REFERENCES.md#source-fe26f2c99841)
identify the engine; the final [SDK manifest](../SOURCE_REFERENCES.md#source-b3c04c7370ed)
includes the subsequent cancellation-race fix.

The existing PayMe edge routes authenticated browser task reads/controls to the
engine ingress. The API and native Temporal worker share one private VM
(`c34821c3-95d8-46e7-8ce1-96dc659146f4`) in the database's US East region.
Published PayMe profile v4 adds `browser.shopping` for the synthetic `payme-app`
path while preserving the banking connector. Tenant-backend sandbox selection,
the tenant opt-in flag and server-issued `browser:delegate` scope remain required.
Native banking and WhatsApp paths are not browser-qualified by these checks.
See [deployment metadata](../SOURCE_REFERENCES.md#source-594136af278b)
and [setup/operations](../SOURCE_REFERENCES.md#source-8f929a906ccd).

| Check | Evidence | Result |
| --- | --- | --- |
| Deployed HTTP research | [API report](../SOURCE_REFERENCES.md#source-d65be9ea18f4) | Python `casefold` lookup completed in 85.93 seconds with verified public sources; three native actions and four native inference calls (not total planner/assessor calls). Idempotent replay retained the task; anonymous task access and edge execution were denied. |
| API cancellation | Same API report | New MDN task reached `cancelled` through the authenticated revision-bound command. No money-movement requests. |
| Actual deployed host/SDK | [UI report](../SOURCE_REFERENCES.md#source-2a3454abc61e), [screenshot](../SOURCE_REFERENCES.md#source-3acab21a764e) | Recovered the completed sourced result, real OpenAI chat remained usable, and a new browser task cancelled from the UI. No page errors. Playwright opened the closed shadow root only for test selectors; application/transport bytes were deployed. |
| VM runtime/cleanup | [Final check](../SOURCE_REFERENCES.md#source-eed82e2d14bf), [preflight](../SOURCE_REFERENCES.md#source-062abd94d5d1) | All 391 runtime hashes matched; health 200; supervised engine running; no browser processes or disposable homes after UI cancellation. Unprivileged Chromium ran without `--no-sandbox`; database SELECT round trips were about 1 ms. |
| Fast regression | [Run](../SOURCE_REFERENCES.md#source-ee1caba5455f), [JUnit](../SOURCE_REFERENCES.md#source-cf289b5e6100) | 2,807 passed, 1,238 deselected. The first 180-second wrapper deadline was interrupted after its assertions passed; the valid repeat used 300 seconds. |

Adjacent repository developer checks: PayMe API 539 tests, SDK 109 tests after
the cancellation fix, host/edge 161 tests, and deployment composition 11 tests.
Required type/build checks passed; SDK lint passed. Engine targeted worker,
completion, diagnostic, lifecycle and launcher checks also passed. These are
developer observations, not independent acceptance.

Preserved failures: [invalid reasoning](../SOURCE_REFERENCES.md#source-1c6cc27d4f56)
was fixed by selecting supported low reasoning. Ordinary-container attempts
[captured no sources](../SOURCE_REFERENCES.md#source-d98a775ce1e8);
the exact platform cause was not established. The preceding
[empty-evidence assessment failure](../SOURCE_REFERENCES.md#source-0c2a4c63aa16)
now ends honestly as unverified without another paid assessment. The first VM
staging exposed an executable-path permission issue, then
[cross-region latency](../SOURCE_REFERENCES.md#source-dbe146bf126c)
caused edge timeouts. That task was [drained](../SOURCE_REFERENCES.md#source-d48f0497d8e9)
before moving the sole worker East. The unused West VM was destroyed after final
verification; the original isolated qualification VM was preserved.
The first [UI cancellation observation](../SOURCE_REFERENCES.md#source-c4fb19b4198e)
failed during concurrent progress. The SDK now refreshes and bounds retries for
cancel-only revision conflicts; it never automatically replays authority renewal.
The final live UI repeat passed; the conflict branch itself has deterministic
regression coverage rather than a forced live conflict.

The original one-shot `setup` command is restored. Its attempted diagnostic
redeploy reused the provisioning command and crashed; it was not rerun again.
A separate read-only job obtained the [published capability flags](../SOURCE_REFERENCES.md#source-89f91a53dd20),
and its credential variable was cleared afterward. Runtime services are online;
the environment still retains that setup failure and existing admin warnings.

Independent human acceptance and production approval remain pending. This is a
single-owner development VM with manual configuration synchronization, not HA.
The answer presentation remains verbose and includes reservation language on
technical lookups; verification of sources does not qualify that wording as final
UX. General website reliability, restart recovery and distributed ownership remain
outside this evidence. No real customer, protected bank data or money movement was
used to qualify browser operation.

### OpenMaus public-research trial

Development candidate on `feat/openmaus-browser-worker`, based on local `dev`
at `dd3721b`. [ADR-015](../../decisions/015-openmaus-browser-trial.md) limits this
to a single Windows or Linux x64 worker owner, synthetic tenant/customer/authority and public
sources. Calls use real OpenAI `gpt-6.1-sol`; the native worker uses low reasoning.
Each recent paid report records the tested Python/JavaScript file hashes. The
base commit alone does not identify the changed implementation. The Linux follow-up
uses Railway's development sandbox; real-tenant browser configuration remains disabled.

- Doctoralia's two-doctor request passed source verification in
  [run 03](../SOURCE_REFERENCES.md#source-bfcdf76dd722),
  [run 04](../SOURCE_REFERENCES.md#source-b74cf1a29791) and
  [run 05](../SOURCE_REFERENCES.md#source-92d2b4bd85da):
  respectively 121.63/121.59/146.84 seconds, 17/14/18 OpenAI HTTP requests and
  12/9/13 native browser actions. These are successive integration revisions,
  including cleanup and trace fixes, not three identical-revision benchmark runs.
  The later two confirm disposable-state deletion. Extra adapter source reads
  are separate from native action counts. The earlier 808-second failure ran
  under a different environment; these observations do not prove a controlled
  speedup or production reliability.
- The untuned Python documentation task passed in
  [run 08](../SOURCE_REFERENCES.md#source-0763493eda34): 62.5 seconds,
  nine requests, three actions. Earlier attempts exposed omitted targeted
  excerpts; the adapter now reobserves those selectors before retaining text.
  The [final-revision repeat](../SOURCE_REFERENCES.md#source-f474c178aa01)
  also passed: 61.92 seconds, nine requests, three actions, with cleanup confirmed.
- [Live cancellation](../SOURCE_REFERENCES.md#source-0a3669f7164d)
  passed through the authenticated engine API after real inference and browser
  dispatch. The process stopped, no additional model request was issued, and
  its disposable home was removed. Cross-tenant reads were denied in paid runs;
  bank-effect counters remained zero.
- [Fast profile](../SOURCE_REFERENCES.md#source-2123bbca6999):
  2,783 passed, 1,233 deselected. The later inference-release metadata change
  passed the 68-test targeted selection. [PostgreSQL checks](../SOURCE_REFERENCES.md#source-e062b88f2cda):
  32 passed, including cancellation, corrections, action limits, revocation
  during inference and distinct observation identities after restart. These
  lifecycle tests use controlled worker I/O; live cancellation is separate.

Preserved failures matter: [Doctoralia 01](../SOURCE_REFERENCES.md#source-7d2de8f9240e)
selected an unpermitted tool, and [Doctoralia 02](../SOURCE_REFERENCES.md#source-27e78c1fafb8)
ended with partial evidence after adapter capture interrupted the native loop.
Advertised tools now match enforcement and failed capture records a gap without
rewriting the native action result. [MDN 01](../SOURCE_REFERENCES.md#source-3016a214b872)
exposed asynchronous Windows file-handle cleanup; [MDN 02](../SOURCE_REFERENCES.md#source-2ad6a3f2684f)
hit the credential detector and a duplicate observation ID during recovery.
Cleanup retries and process-generation observation IDs address those integration
bugs. Credential detection remains enforced and now stops without paid retries.
The [earlier final MDN run](../SOURCE_REFERENCES.md#source-ae013c6e5b85) failed
with `sensitive_browser_observation` after 42.31 seconds, seven requests and four
actions. It stopped cleanly and deleted its worker home. The follow-up traced the
false positive to hyphenated HTTP header identifiers in MDN's navigation. Public
source validation now distinguishes those names from credential assignments;
customer input retains the strict rule. The [corrected Windows MDN run](../SOURCE_REFERENCES.md#source-534acb32c1c5)
passed with 13 requests and seven actions. Actual credential headers, folded
values, secret keys and protected objects remain covered by rejection tests.
The initial development campaign made 154 OpenAI HTTP requests against its 200-request
cap, including failed requests and intermediate integration versions. Final
Ruff/formatting, mypy (191 source files), contract export, integration-guide
validation and `git diff --check` passed.

Linux follow-up (real OpenAI, synthetic authority/customer, public websites):

| Check | Evidence | Observed result |
| --- | --- | --- |
| MDN | [Report](../SOURCE_REFERENCES.md#source-6b61e03bc357) | Passed in 70.99 seconds; 12 requests, six actions; one rejected grounding assessment recovered within budget. |
| Python with native Temporal | [Report](../SOURCE_REFERENCES.md#source-04af7ab4bdbc) | Passed in 91.61 seconds; nine requests, three actions; real dispatcher/worker; history replay added zero calls. |
| Two Doctoralia providers | [Report](../SOURCE_REFERENCES.md#source-21cc41f223c7) | Passed in 96.09 seconds; 14 requests, nine actions. |
| Cancellation after dispatch | [Report](../SOURCE_REFERENCES.md#source-ac909fe60541) | Passed in 40.5 seconds; four requests, one action; no subsequent model call; worker stopped. |

All four Linux runs removed disposable homes and made zero bank-effect calls.
The [first Temporal attempt](../SOURCE_REFERENCES.md#source-941dd9be0eae)
failed during test-server setup after one planning request; the missing directory
was corrected before the passing repeat. Linux detached-process tests passed
owner-pipe loss, worker exit and supervisor termination (three cases). Current
developer checks: 2,796 fast tests, 34 PostgreSQL/runtime lifecycle tests, 102
source-safety/OpenAI/worker checks, Ruff/formatting, mypy (191 files), contract and
integration-guide consistency. The live harness uses authenticated engine APIs
through ASGI; this is distinct from a deployed HTTP browser capability.

Railway development service `ai-engine` successfully deployed
`76d5751f-f1a9-4b53-91f1-972619c3c996`, using the pinned OpenMaus Dockerfile.
The [source manifest](../SOURCE_REFERENCES.md#source-6c13dc2d9300)
identifies working-tree snapshot
`86bc854855aaa2d3d298e84a67a4a238f0e0a9545815eb6153d04eb71aff556e`;
image digest is `sha256:33db4a946a7e10645505acba948b56d6fca4fc6f77b99837af0ae81bb2241051`.
The existing launcher/migration overlay was preserved from its prior deployment
archive. [Deployed HTTP smoke evidence](../SOURCE_REFERENCES.md#source-62926d55ef29)
passes synthetic PayMe login, authenticated engine identity, real OpenAI
conversation, idempotent replay, and anonymous/channel-override denial, with zero
money-movement requests. The edge model-profile diagnostic still returns 404;
the service retains its configured OpenAI route. No new credentials or SSH keys
were registered. PayMe's existing banking-only capability profile is unchanged:
this installs the browser package but does not enable a hosted PayMe browser
workflow or provision its scheduler. Linux browser/Temporal evidence above comes
from the isolated Railway sandbox with explicit synthetic authority.

An [unprivileged container smoke](../SOURCE_REFERENCES.md#source-60f0bdbe25ef)
started the native relay and opened Example Domain with pinned Chromium, without
paid inference. It used the same Debian dependency base with the tested runtime
mounted read-only; it is not another full-image deployment. The duplicate sandbox
image build was stopped to preserve disk headroom. The [first smoke harness](../SOURCE_REFERENCES.md#source-d0d5ed971225)
omitted the passwd entry present in the deployment Dockerfile; correcting the
harness resolved that startup failure. [Cleanup](../SOURCE_REFERENCES.md#source-3257890a88af)
confirms no owned runtime processes, disposable browser homes or qualification
database remained running. The local PostgreSQL cluster was also stopped.

Default Browser Use bindings remain unchanged. Independent human acceptance,
production approval, distributed worker ownership and general public-site
reliability remain pending; passing these scoped checks does not establish them.

### Browser reliability stage two

Development candidate on `fix/browser-stage-two`, based on local
`dev` at `ac837f2`. Final runtime fingerprint:
`6cfaa0f3e5488bfec85cd4cdfda6e0af007a88aecc7d19c7303a34dcaab50a9d`
(190 sorted Python source paths, NUL, raw bytes, NUL). Per-run working-tree
manifests identify tested bytes; the base commit alone does not qualify them.

Doctoralia Mexico clinic capture now gives an explicitly selected practitioner's
appointment widget its own entity scope. It excludes clinic-wide tariffs, hidden,
protected, ambiguous and unselected blocks. Direct rendered-text extraction handles
the actual name label's nested price span. This is a provider-layout repair, not
general inference of arbitrary clinic/person relationships. Assessment matches
person, service, modality, location and currency; a starting price below a ceiling
leaves that ceiling unknown, and one above it contradicts the ceiling.

Navigation feedback now permits alternative candidates when existing names lack
hard requirements. Durable source-progress markers ignore timestamp-only revisits
and reset on new facts or corrected goals. Useful research can stop with assessed
partial findings after unchanged-source or repeated-coverage windows; strict goal
verification is unchanged. Twelve new distinct confirmed observations also trigger
source-bound assessment during active page changes, with a confirmed current action,
captured pages and a reserved final assessment slot. These checks do not prove search
exhaustion or guarantee efficient navigation.

- [Final fast profile](../SOURCE_REFERENCES.md#source-176bf2a7b61a):
  **2,778 passed**, 1,229 deselected, 150 seconds. Ruff, formatting, mypy (190 files),
  contract export, integration-guide validation and `git diff --check` passed.
- [Final public-research profile](../SOURCE_REFERENCES.md#source-f645819282a6):
  **1,125 passed**, 458 seconds, actual Chromium and PostgreSQL, no paid inference.
  The report preserves a Temporal SDK unawaited-coroutine warning at teardown;
  both the suite and database cleanup exited successfully. The preceding browser
  profile passed 1,119 tests before the active checkpoint was added.
- [Final real OpenAI checks](../SOURCE_REFERENCES.md#source-f960eeef3a28):
  **nine passed, nine calls**, 49 seconds. Eight seeded engine-assessment cases
  cover exact/starting prices, modality, visit type, location, clinic-wide tariffs
  and other-practitioner tariffs. The ninth captures the actual selected-doctor
  clinic widget and assesses it through the engine: Jorge Alfredo Acosta Orea's
  first general-medicine consultation at 600 MXN and Miguel Hidalgo address qualified.
  This is known-page capture plus real assessment, not autonomous discovery.
- [Final autonomous engine-API rehearsal](../SOURCE_REFERENCES.md#source-ec5f6bca3937):
  **failed the unchanged two-provider gate**, 57 real calls, 808 seconds. It used
  all 48 navigation steps and completed with `outcome_status: partial` and
  `goal_verified: false`. Progress assessments ran after navigation calls 12, 25,
  37 and 43; the browser investigated a third practitioner after feedback. Jorge
  Gerardo Martínez Laredo qualified at 800 MXN in Polanco/Miguel Hidalgo. The final
  alternative, Víctor Manuel Rangel Porcayo, had an address-specific first-visit
  price **from 800 MXN**; the ceiling and specialty remained unverified. The semantic
  developer reviewer found supported claims and honest unknowns, but only one
  qualifying provider. Three `unassociated_criteria_unknown` diagnostics remained.
  Search blocking and repeated switching were costly. Early loop termination and
  reduced latency were **not** demonstrated by this run.

Preserved failed observations drove the repairs:

- [Original capture failure](../SOURCE_REFERENCES.md#source-8304ae42a741)
  and [nested-name-label failure](../SOURCE_REFERENCES.md#source-91f0b487b9ce)
  each reproduced losing selected-practitioner scope (one failed, five passed).
- [Recovery regressions](../SOURCE_REFERENCES.md#source-66b0298723ba)
  caught changed facts under one action ID failing to reset a stall and missing
  current observations reusing a stale stop. Both were repaired.
- [Repeated-coverage regression](../SOURCE_REFERENCES.md#source-70e287e29071),
  [contradictory alternative feedback](../SOURCE_REFERENCES.md#source-e4436cb042cc)
  and [active-page-churn regression](../SOURCE_REFERENCES.md#source-f19a3692b9df)
  failed before repair. The final [checkpoint lifecycle checks](../SOURCE_REFERENCES.md#source-8a2247f968b0)
  passed 34 tests, including strict-policy exclusion and honest partial completion.
- Earlier autonomous attempts failed at
  [40 calls / 562 seconds](../SOURCE_REFERENCES.md#source-4d53e5777666)
  and [33 calls / 450 seconds](../SOURCE_REFERENCES.md#source-7f31baafe5b7).
  The latter exposed page churn delaying progress checks. An
  [intermediate 24-call rehearsal](../SOURCE_REFERENCES.md#source-730356ba0a85)
  was deliberately interrupted after discovering conflicting navigation feedback;
  its `KeyboardInterrupt` is not passing qualification. Earlier seeded checks
  passed eight and nine cases on their respective prior revisions.

Stage two is **not fully qualified** for autonomous multi-practitioner research.
Selected-widget attribution, price semantics and periodic assessment have live
evidence; dependable candidate selection, cross-source consolidation and latency
remain gaps. Campaign total: **180 paid call reservations**, including failed and
interrupted runs, within the 200-call ceiling. Independent agent review,
independent human acceptance and production approval remain pending.
The [final integrity check](../SOURCE_REFERENCES.md#source-fe5500c7b8cb)
matches the current source/test files to all three final VM reports. The sandbox
qualification lock is free, PostgreSQL is stopped, no browser processes remain,
and downloaded reports passed a credential scan.

Testing uses synthetic tenant/authority/customer fixtures, public sources and
Mateo's personal Railway sandbox. No login, contact, booking, payment, real-tenant
disclosure or production enablement is added. The initial local browser attempt
lacked the pinned Chromium executable; it is not behavioral red evidence.
Applicable compliance scope remains LR-01/02/03/04/05/12/13/17; ISO 27001
5.15–5.18, 5.19–5.23, 5.34, 8.3, 8.5, 8.10–8.12, 8.15, 8.20–8.24,
8.26, 8.28–8.29; ISO 42001 A.5, A.6.2, A.7–A.10.

### Browser reliability stage one

Development branch **`fix/browser-stage-one`**, based on local `dev` at
**`4a0489a8369e20fbfe96fbdc2340f7cc493f73d3`**. Runtime fingerprint:
`a9ef391b78003135a3bd1f79ebbac6efd957cc37a8752f03d56445e520e00ca6`
(190 sorted Python source paths, NUL, raw bytes, NUL). Latest manifests record
pre-commit checkout HEAD `54231f9`. Per-run manifests identify the tested working-tree
bytes; Git records subsequent commit/integration history. A base commit alone does
not qualify changed code.

Independent session review (`independent_review`) and cross-model adversarial review
(`gpt-6-astra`, `cross_model_review`) inspected the final runtime above and reported
no remaining actionable findings after remediation. They found and rechecked:

- **P1/P2 permanent-failure durability:** failed browser cleanup, a correction accepted
  during inference, and a crash between rejection and stop persistence could permit
  another model request. The rejected attempt now atomically stores the stop marker;
  restart derives it from older rejection records, and permanent failure takes precedence
  over a queued correction while cancellation/terminal states retain priority.
- **P1 date provenance:** an uncompiled original request or multiple pending corrections
  could inherit the newest timestamp. Bounded prefix/revision history now compiles each
  update with its own acceptance anchor before acquisition/assessment continues.
- **P2 correction instruction:** conditional-expression precedence omitted the temporal
  instruction from update compilation. Both branches now receive the shared instruction.
- **P2 execution anchors:** execution-method requirements now retain date anchors through
  renumbering and explicit replacement, alongside factual requirements.

[Pre-fix review regressions](../SOURCE_REFERENCES.md#source-8a6fa967338d)
record **five failures** on the earlier runtime. Added checks cover concurrent corrections,
atomic rejection persistence, legacy restart recovery and execution-anchor replacement.
These are independent agent code reviews, not human acceptance or production approval.
Final review validation on the fingerprint above:

- [Fast profile](../SOURCE_REFERENCES.md#source-a8ed66cac61e):
  **2,763 passed**, 1,214 infrastructure/live cases deselected, in 144 seconds.
  Ruff, formatting, mypy (190 source files), contract export and integration-guide
  validation passed. An earlier fast run is superseded by this fixed-source run.
- [Expanded seeded OpenAI checks](../SOURCE_REFERENCES.md#source-06ce4738bee1):
  **nine passed, fourteen real calls**, in 56 seconds. Both cases with corrections
  queued across midnight passed, whether initial compilation had already happened
  or not; the original date/slot/attribution checks also passed. Reports saved and
  runtime/test/script hashes match. These are synthetic source fixtures through the
  real engine compiler/assessor, not a new fresh-site campaign.

- [Full public-research regression](../SOURCE_REFERENCES.md#source-d53cfaf4c4bf):
  **1,104 passed**, zero failed/skipped, in 481 seconds, with no paid inference.
  This includes atomic rejection/legacy restart, cleanup failure, concurrent correction,
  temporal provenance and the existing browser/database/recovery boundaries. Runtime,
  test and script hashes match local files. Database shutdown succeeded; subsequent
  inspection found the qualification lock free, no owned test processes and no `.env`
  file. Downloaded evidence passed the credential scan.

The pre-review results below identify their own manifests and do not qualify the
repaired runtime.

Structured OpenAI `insufficient_quota` is now a permanent failure, distinct from
transient throttling. Quota/access failures stop the browser task without another
model request, preserve findings and expose a useful customer reason. Transient
429s retain the healthy browser and use the existing bounded retry path. Error
classification reads at most 8 KiB and never exposes provider error prose.

Public research now records acceptance time and an optional trusted IANA timezone,
passes the context to compilation/navigation/assessment, and preserves each
unchanged requirement's original anchor across corrections and ID renumbering.
Explicitly replaced requirements receive the new acceptance anchor. Chromium uses
the configured timezone; UTC display without a configured customer timezone does
not resolve relative dates. Legacy requirements with missing anchors remain
unresolved. Date interpretation and source attribution still depend on model
semantics: this is context plumbing plus targeted evidence, not a deterministic
calendar or a qualification for booking.

- [Provider availability](../SOURCE_REFERENCES.md#source-547753c76742):
  one real request returned **HTTP 200**. The earlier quota failure below is historical.
- [Quota regression red](../SOURCE_REFERENCES.md#source-19dc3ae3d309): two cases
  failed before repair; the complete adapter file subsequently passed **84 tests**.
- [Pre-review fast profile](../SOURCE_REFERENCES.md#source-e0e812dc2896):
  **2,760 passed**, 1,201 deselected, in 151 seconds. An earlier run hit the
  unchanged 180-second launcher deadline and exposed a missing timezone constructor
  parameter, subsequently repaired. A VM fast attempt failed collection because
  its source transfer omitted the deployment package; it is not a passing run.
- [Affected local checks](../SOURCE_REFERENCES.md#source-a98b60c47af8):
  **138 passed**, six infrastructure cases deselected. Suite selector checks:
  **33 passed**. Ruff, formatting, mypy (190 source files), contract export and
  integration-guide checks passed.

- [Fresh practitioner run](../SOURCE_REFERENCES.md#source-8c1e26fded89):
  **failed**, 53 real OpenAI calls, 711 seconds of pytest execution. The engine
  captured three public source pages but ended `ungrounded_public_assessment`,
  with six candidate-anchor rejections and two unassociated-criteria diagnostics.
  The retained-source follow-up disclosed the failure and returned useful facts:
  one doctor had a starting price, which did not establish the requested ceiling;
  another doctor's price/address appeared under a clinic entity. The two-attributed-
  providers gate failed. The model reviewer itself labelled that latter finding
  with the clinic name, reinforcing the unresolved identity mapping issue; this
  is developer review, not an independent human determination. Repeated tab
  switching also consumed calls. No acceptance gate was weakened.
- [Earlier seeded live checks](../SOURCE_REFERENCES.md#source-f960c374c9c6):
  **four passed, five real calls**, covering accepted relative dates across a price
  correction, rejection of unrelated clinic/online prices and a positive attributed
  in-person price. This preceded the final presentation-only correction and does
  not qualify fresh browsing. The final expanded checks below supersede them.
- The initial [practitioner attempt](../SOURCE_REFERENCES.md#source-194f61b1983c)
  failed before browser actions due to the missing constructor parameter noted
  above; its four paid calls and failure remain recorded.

- [Targeted VM checks](../SOURCE_REFERENCES.md#source-783bd0e9271e):
  **155 passed** before the final presentation correction. Coverage includes actual
  Chromium timezone, persisted anchors after coordinator replacement, quota/access
  termination and transient retry with the same healthy browser.

- [Pre-review VM public-research regression](../SOURCE_REFERENCES.md#source-f7062ff7cf59):
  **1,080 passed**, zero failed/skipped, in 486 seconds, with no model calls.
  All runtime file hashes match the local implementation. The database stopped,
  the qualification lock was free, no owned test processes or `.env` file remained,
  and downloaded evidence passed the credential scan.

- [Pre-review seeded OpenAI checks](../SOURCE_REFERENCES.md#source-83b858862960):
  **seven passed, eight real calls**, in 33 seconds, on the unchanged final runtime.
  Correctly dated slots passed; the following day and an unresolved customer
  timezone did not. An unrelated price correction retained the accepted date.
  Unrelated clinic and online-only prices failed the in-person requirement, while
  explicitly attributed in-person pricing passed. All seven case reports saved.
  These use seeded synthetic sources through the engine compiler/assessor, not
  fresh website acquisition or independent acceptance.
- The preceding [expanded live attempt](../SOURCE_REFERENCES.md#source-baacbe2defb1)
  had seven passing assertions but two report-writing errors: `/` in parameterized
  timezone names became a path separator. It is a failed qualification run. The
  reporter now sanitizes filenames; the final rerun above passed. Engine runtime
  bytes and acceptance assertions did not change.

- [Pre-review focused VM regression](../SOURCE_REFERENCES.md#source-fcd0f4f36ba4):
  **77 passed**, zero skipped/failed, in 42 seconds, with no paid calls. This runs
  the final date, recovery, completion/presentation and suite-profile tests,
  including the task-view quota/access reason assertion. Runtime, test and script
  hashes match the local files. The 1,080-test aggregate run above remains valid
  for the pre-review runtime; that focused run covers its final test updates.
  After the final live and focused runs, database shutdown succeeded, the test
  lock was free, no owned processes or `.env` file remained, and downloaded
  evidence passed the credential scan.

Stage-one paid ledgers contain 92 reservations; the separate successful availability
probe adds one request (93 total, below the 200-request campaign ceiling).
Reservations are not a count of billed completions.

These are developer checks in Mateo Minghi's personal Railway sandbox, using
synthetic tenant/customer/authority fixtures. The fresh provider case enters the
authenticated engine ASGI API and visits real public websites; seeded assessment
checks use real OpenAI but do not demonstrate fresh acquisition. No real-account
workflow, production deployment or independent acceptance is qualified. Independent
agent reviews are recorded above; a different human acceptance tester remains pending.
Compliance scope follows ADR-013: LR-01/02/03/04/05/12/13/17; target ISO/IEC 27001
5.15-5.18, 5.19-5.23, 5.34, 8.3, 8.5, 8.10-8.12, 8.15, 8.20-8.24, 8.26, 8.28,
8.29 and ISO/IEC 42001 A.5, A.6.2, A.7-A.10. No legal approval or certification
is implied. This evidence does not establish publication or production approval.

### Browser evidence capture and reliability follow-up

Candidate branch **`fix/browser-research-reliability`**, based on local `dev`
**`00d0366`**. The final runtime fingerprint is
`c49de40a950011a06a0223646d66dfa2827a9dad711cd8ed3eafdca75ad60520`
(189 sorted Python source paths, NUL, raw bytes, NUL). Per-run manifests identify
the working-tree bytes and test configuration; the base commit alone does not.

Source capture now includes open shadow roots, slots, rendered text without an
element box and admitted embedded documents with their own URL/entity scope.
Frame privacy is rechecked after capture; private/hidden/ambiguous/opaque or
detached frames are excluded. The document's main landmark takes precedence over
shadow widgets, and traversal truncation prevents a complete-link claim.
The default exclusions now cover the observed clinic `.opinions` review container;
this exact selector preserves unrelated public preview content. A zero-model
[site metadata probe](../SOURCE_REFERENCES.md#source-aba2a9b2f3e7)
identified the container, and a synthetic regression reproduced the disclosure
before repair. This does not establish exhaustive privacy coverage on other sites.
The [integration contract](../../contracts/SERVICE_INTEGRATIONS.md) records the bounds.
The frozen conversation runner can explicitly select the general `useful` profile;
reporting rejects mixed source fingerprints or profiles as a complete campaign.
Practical reports include elapsed time and model/token counts.

- [Final local fast profile](../SOURCE_REFERENCES.md#source-9caca995072a):
  **2,744 passed**. The first attempt had one Windows process-test permission
  failure; the isolated process check passed, followed by clean full-profile runs.
- [Final Chromium snapshot checks](../SOURCE_REFERENCES.md#source-710b1c396879):
  **145 passed**, covering nested shadows, slot/rendered text, private/hidden
  ancestry, frame attribution into the answer catalogue, privacy changes and
  detachment during capture, bounded traversal and unrelated widget landmarks.
  Red observations and intermediate extraction failures remain beside this report.
- [Report-integrity checks](../SOURCE_REFERENCES.md#source-a9da88dfe003):
  **42 passed**. Mixed profile/source records first reproduced a false completeness
  claim, then failed closed after repair. No research-success gate was weakened.
- [Initial VM regression](../SOURCE_REFERENCES.md#source-afbcde1fa9c0):
  **1,069 passed, 1 failed**. The failure was a pre-existing assertion on `dev`
  expecting a requirement label without its implemented `per_candidate` scope.
  The assertion now checks the scope explicitly; this failed run is preserved.
- [Final VM regression](../SOURCE_REFERENCES.md#source-54532c5ca387):
  **1,075 passed**, zero skipped/failed, in 459 seconds; no model calls. The
  recorded Python source/test hashes match the final local files. Database shutdown
  succeeded; a subsequent inspection found the qualification lock free, no owned
  processes and no `.env` file. Downloaded evidence passed the credential scan.
- [Fresh baseline](../SOURCE_REFERENCES.md#source-18feb3c1f91e):
  manufacturer comparison passed in **27 calls / 323 seconds**; practitioner
  discovery failed in **38 calls / 400 seconds**. Only one practitioner's in-person
  consultation was fully attributable. Clinic-scoped evidence and the second
  practitioner's unconfirmed modality remain substantive gaps.
- [Superseded practical run](../SOURCE_REFERENCES.md#source-5fff1c842fa6):
  two direct lookups passed in **9 and 11 calls**. Comparison passed in
  **54 calls / 656 seconds**, including recovery from a worker-preparation failure.
  The campaign was deliberately interrupted during site-search interaction for
  the main-landmark correction; it is not a complete campaign pass. These timings
  are uncontrolled observations, not a causal performance comparison.
- [Fresh original twenty-scenario attempt](../SOURCE_REFERENCES.md#source-7e1904b896d6):
  **incomplete**, on runtime
  `5bc82e72881a7f34bb889d0e6498ca3053d92283a928754daab3005679c26add`,
  before the final clinic-review exclusion. The per-run manifest also hashes the
  runner/configuration inputs. The `useful` profile used fresh simulated customers,
  unchanged scenarios, six turns and the original 50-call ceiling. Cases 1–10
  reached six valid turns; case 8 alone passed the verified-research gate. Cases
  1/5/9 cancelled, 2/4/6/7 completed partial research, 3 exhausted its test call
  budget, and 10 ended with a provider 429. Cases 11–20 failed at their first turn
  with provider 429s. Pytest therefore recorded **1 passed, 19 failed**, not nineteen
  demonstrated browser failures. Cancellation and honest partial results require
  case review; these outcomes are not interchangeable with completed research.
  The campaign reserved/settled **329 calls** in approximately **54 minutes**.
- A subsequent single minimal [provider availability check](../SOURCE_REFERENCES.md#source-721ea199f0cb)
  returned HTTP 429 with **`insufficient_quota`**. Further paid calls stopped.
  Campaign ledgers total **474 reservations** across the baseline, interrupted
  practical run and original attempt; the separate availability probe made one
  additional request. Reservations are not a count of billable completions.
  At that revision the adapter mapped every 429 to retryable `provider_rate_limited`,
  obscuring quota exhaustion. Final fresh practical qualification, completion of
  the original benchmark and a new live Temporal recovery run remain unexecuted.

VM runs use Mateo Minghi's personal sandbox, authenticated in-process engine ASGI,
synthetic tenant/customer/authority fixtures, real public websites and real OpenAI
`gpt-6.1-sol` calls. No real-account effects or production deployment are qualified.
Independent code/cross-model review, a different human acceptance tester and
production approval remain pending. Compliance scope follows ADR-013:
LR-01/02/03/04/05/12/13/17; target ISO/IEC 27001 5.15–5.18, 5.19–5.23, 5.34,
8.3, 8.5, 8.10–8.12, 8.15, 8.20–8.24, 8.26, 8.28, 8.29 and ISO/IEC 42001
A.5, A.6.2, A.7–A.10. This evidence supplies no legal approval or certification.

### Useful public browser: development repair

Implemented on **`fix/useful-public-browser`**, based on **`80e765bd`**. Verification
ran before commit, so each linked manifest identifies the exact working-tree
source bytes; Git records subsequent commit and integration history. These are
development observations, not production qualification. Later changes do not
inherit an earlier pass. The records below supersede the earlier repair sequence's
current status, while preserving its failures and acceptance requirements.
The reviewed runtime fingerprint is
`f35fe567577b24794ac6a664c69752173636e8538adea07fdfb9a514c1547af3`
(189 sorted Python source paths, each followed by NUL, raw bytes and NUL).

General `public_web` profiles now use public-internet destination protection
rather than a finite site/path/HTTP-operation allowlist. Chromium retains native
protocols, cookies, service workers and its user agent. Browser Use owns navigation
with larger bounded budgets, thinking, page search and direct URLs. Bounded native
text scratch notes and retained canonical source excerpts supply research memory,
including after worker replacement. The engine
keeps authority, protected-input checks, private-network exclusion, cancellation,
source attribution and explicit unknowns. Useful partial research can finish
without falsely setting `goal_verified`. Legacy profiles and the old demo launcher
retain their explicitly narrower behavior; see the
[configuration and evaluation commands](../SOURCE_REFERENCES.md#source-c238a39099e5).

The personal Mateo Minghi Railway sandbox runs authenticated `/v2/turns` through
in-process ASGI with synthetic tenant/authority fixtures, real public websites and
real OpenAI `gpt-6.1-sol` calls (low effort; earlier runs used 4,096 output tokens,
the final practical profile explicitly uses 8,192). Manual background
scheduling is distinguished from the separate Temporal restart test. No real
customer data, account login, booking, payment or production deployment is tested.

- [Seven-case campaign](../SOURCE_REFERENCES.md#source-213ac31ef974):
  **6 passed, 1 failed**, 127 paid calls. Two direct lookups, site-search interaction,
  same-task correction/focused follow-up, honest partial results and active
  cancellation passed. Cross-site comparison lost captured sources under storage
  pressure and hit the test harness's 50-call ceiling before finalization. Its
  failure remains recorded; it is not a completed seven-case qualification.
- [Initial direct pilot](../SOURCE_REFERENCES.md#source-098aacbed7fb)
  failed answer completeness/concision. The
  [superseded intermediate campaign](../SOURCE_REFERENCES.md#source-a56f1127ea15)
  was interrupted after reproduced source-reading and completion defects. Neither
  is a passing run.
- [Local fast checks](../SOURCE_REFERENCES.md#source-6984c3b501d7):
  **2,723 passed** before the final catalogue adjustment, including source-bound summaries,
  comparison scope and passive-progress recovery. Focused
  tests additionally exercise public/private DNS, active service-worker/tunnel
  cancellation, recognized commitment controls, source timestamps and long URLs.
- [Catalogue fast checks](../SOURCE_REFERENCES.md#source-834ea6d35686):
  **2,737 passed**, including the runtime retrieval change, before the final
  source-scoped uncertainty prompt adjustment. The follow-up
  harness/report-only adjustment was integrated during this run and is separately
  covered by focused checks; the manifest is its starting snapshot, not an atomic
  qualification of every final test file.
- [Independent cross-model review](../SOURCE_REFERENCES.md#source-52215d21e8d5)
  records reproduced findings and fixes. This is code review, not a different
  human's acceptance or production approval.
- [VM regression](../SOURCE_REFERENCES.md#source-c8c483ccd54c):
  **851 passed, 4 failed**. Three expectations depended on superseded recovery
  rendering; the new retained-panel API test omitted its required idempotency
  header. The [focused recheck](../SOURCE_REFERENCES.md#source-5d3bcea8d579)
  passed **45 tests**, including all four cases and final storage regressions.
  The first full run also recorded a Temporal/SQLAlchemy garbage-collection
  warning; retain that diagnostic separately from passing test outcomes.
- [Full VM regression after memory integration](../SOURCE_REFERENCES.md#source-0800213b972a):
  **990 passed**, including Chromium, pinned Browser Use scratch tools, network
  protection, database and task lifecycle checks. This run predates the final
  model-context/output-budget change; the final fast and independent focused
  checks above cover that later delta. No warning recurred in this full run.
- [Final focused VM regression](../SOURCE_REFERENCES.md#source-cf52834069dc):
  **314 passed** on the comparison-scope source, covering the later comparison,
  progress-assessment, presentation and provider changes through actual engine
  API/database checks, plus native Browser Use text tools on Chromium fixtures.
- [Final presentation and recovery VM regression](../SOURCE_REFERENCES.md#source-713e4e3c4287):
  **182 passed** before the final catalogue adjustment, including the natural-summary
  binding, populated versus empty protected controls, native text tools and
  recovery after an invalid optional progress assessment. These counts overlap
  earlier selections and are not a combined unique-test total.
- [Real Temporal replacement and replay](../SOURCE_REFERENCES.md#source-d7c1d825ab08):
  **passed**, 12 paid calls on the reviewed memory/delivery source, before the
  later text-search and comparison-scope changes. A paid browser response
  was interrupted before dispatch, the browser/worker was replaced, the task
  completed with an official sourced product answer, and workflow replay made
  **zero additional calls**. The recorded uncertain attempt was not silently
  treated as completed. Exact source-witness and automated semantic gates passed.
- [Source-diversity reconstruction](../SOURCE_REFERENCES.md#source-2d5e9d171e52)
  keeps Razer battery/connectivity passages alongside Logitech within the previous
  byte budget. It combines separately captured real source text with a retained
  result; it is explicitly not a replay of an unavailable historical snapshot.
- [Intermediate rerun](../SOURCE_REFERENCES.md#source-4cad57260d9b)
  repeated both direct lookups successfully, then was deliberately interrupted
  during comparison after discovering the system/task completion-instruction
  conflict. Its 55 paid calls and incomplete comparison remain recorded.
- [Comparison after retention fixes](../SOURCE_REFERENCES.md#source-20bcdd843bad)
  captured both manufacturers and completed its assessed goal, but failed final
  answer delivery with `provider_truncated`. This is a failed journey, not a
  passing comparison. The campaign was stopped after 59 calls. Subsequent changes
  restore research memory, remove repeated full quotations from model context
  (63,374 to 39,715 characters for this retained case), allow an explicit larger
  output budget and add content-free truncation diagnostics. Exact retained
  evidence remains unchanged; their live effect requires a later run.
- [Subsequent comparison and unknowns campaign](../SOURCE_REFERENCES.md#source-f29a44d292b7):
  74 paid calls before deliberate interruption. Honest partial results passed
  again (18 calls). The comparison delivered both manufacturers' facts without
  truncation, but failed quality review (52 calls): it incorrectly described a
  comparison-wide product requirement as incompatible with the other product.
  Practitioner discovery had started and is not a completed result. Repeated
  native text-tool denials also exposed the screenshot/text-search policy mismatch.
- [Comparison-scope reconstruction](../SOURCE_REFERENCES.md#source-3aca0196cb9e)
  changes only four retained requirement scopes; canonical pages, candidate
  evidence and judgments remain unchanged, while goal verification changes from
  false to true. This proves the Boolean scope defect; it does not independently
  validate the original model's exact-edition interpretation or qualify a live run.
- [Scope-corrected live campaign](../SOURCE_REFERENCES.md#source-811bf626e822):
  **2 failed**, 68 paid calls. The comparison verified both products and completed
  after 38 calls, but a four-excerpt answer ceiling omitted retained Razer battery
  facts. Practitioner discovery stopped after 30 calls when an optional progress
  assessment repeatedly selected an invalid candidate anchor; only one doctor's
  price/address was individually attributable. Later fixes expand answer selection
  to 12 source-bound excerpts, permit concise display summaries and resume research
  after optional-assessment repair exhaustion. Neither failed case is relabelled
  as a passing journey.
- [Final fresh-acquisition campaign](../SOURCE_REFERENCES.md#source-082a40483c04):
  57 reserved calls before deliberate interruption. The comparison completed and
  verified its acquisition goal after 41 calls, but failed answer completeness:
  the retained Razer battery passage was excluded from the answer model's bounded
  catalogue. Practitioner discovery was interrupted and has no completed result.
- [Exact catalogue replay](../SOURCE_REFERENCES.md#source-ceecdb26f1fd)
  reproduces that omission and checks the corrected retrieval: all three assessed
  witnesses now fit within 15,988 characters, including the battery passage.
  Canonical source dictionaries remain unchanged. Retrieval reserves a focused
  question match, then interleaves each candidate's assessed evidence before
  filling remaining space; a warranty follow-up regression checks the focused lane.
- [Final catalogue/API VM regression](../SOURCE_REFERENCES.md#source-94bd732da26e):
  **55 passed** on the catalogue runtime fingerprint (`9211924b`), including source selection,
  authenticated retained-source answers and the follow-up report's fail-closed
  provenance, call-budget and no-new-browsing gates.
- [Retained-answer setup check](../SOURCE_REFERENCES.md#source-389c272b8b38):
  **1 passed**, controlled inference and zero paid calls, using the exact final-14
  report. It proves authenticated text disclosure, unchanged canonical evidence,
  current accepted constraints and one task without new browsing. The preceding
  [follow-up setup failure](../SOURCE_REFERENCES.md#source-b4252486065c)
  made zero model calls: inherited screenshot permission conflicted with the
  text-only fixture. The first
  [keyless recheck](../SOURCE_REFERENCES.md#source-6742392e4756)
  then failed a multiline display assertion; canonical evidence was unchanged.
  These are retained test-harness failures, not passing model journeys.
- [Real retained-answer check](../SOURCE_REFERENCES.md#source-8e71bbc63f04):
  **failed semantic completeness**, 2 paid calls. The final API answer now delivers
  sourced, concise facts for both manufacturers, including Razer's 400/200-hour
  battery figures and Logitech's edition distinction. Every claim/source check
  passes, canonical evidence remains unchanged and no new browsing occurs. It
  still omits requested uncertainty about power/charging subdetails. This exposed
  a prompt restriction tying all uncertainty disclosure to unresolved formal
  requirements even when a broad criterion was already marked supported.
  The final prompt permits short qualifications about the cited excerpt after
  checking offered evidence, even for a broadly verified criterion. It forbids
  claims of absence across the website or all retained evidence. **93 independent
  focused checks** and **30 local summary/catalogue/generated-contract checks**
  pass on this delta; semantic accuracy remains a live-evaluation obligation.
- [Corrected real retained-answer check](../SOURCE_REFERENCES.md#source-2e78adeb28ae):
  **passed**, 2 paid calls on the final fingerprint. The authenticated API response
  includes both manufacturers' connection and battery facts, the Logitech edition
  distinction, complete citations and explicitly scoped missing subdetails. All
  unchanged semantic/source gates pass; canonical evidence is unchanged, one task
  remains and no new browsing occurs. This verifies final answer delivery over the
  hash-pinned final-14 acquisition, not a fresh full browser journey or human acceptance.
  The [unchanged-source repeat](../SOURCE_REFERENCES.md#source-dd540a76beeb)
  also **passed**, with 2 paid calls and the same semantic, source and no-browsing gates.
- [OpenTable transport probe](../SOURCE_REFERENCES.md#source-23d883ebae21)
  still fails with `ERR_HTTP2_PROTOCOL_ERROR` on this VM. Broader networking does
  not establish support for every website. Logitech, Razer and Volaris loaded in
  separate real Chromium observations; a page-load probe is not a complete journey.

The practical suite preserves the original twenty-conversation benchmark's
criteria and limits. Its semantic review is automated and supported by exact
source-witness checks; independent human acceptance and production qualification
remain pending. Applicable legal-register entries and target ISO controls are
recorded in [ADR-013](../../decisions/013-browser-use-preparation.md).
The campaign journals conservatively count **593 reserved calls** across passing,
failed and interrupted runs; 591 have settlement records. No further paid run is
active. [Final sandbox inspection](../SOURCE_REFERENCES.md#source-995117d1cc74)
confirmed a free qualification lock, stopped test database, no `browsercheck`
processes and no `.env` file. No deployment or publication occurred.

### Public research evidence acquisition fixes

Implemented in **`fdfb0a0`**, integrated into local `dev` from
`fix/browser-evidence-acquisition` (base **`cd270fa`**). The linked manifests
identify the source bytes tested before commit. This is increment 1 of the current
repair sequence; its wrapper fixes are integrated, but reliable evidence acquisition
and independent acceptance remain incomplete. Provider-access, browser-recovery,
conversation and full-campaign repairs were not implemented in this increment.

#### Current repair sequence and remaining work

These repair increments are distinct from the original implementation increments
1–5 in the [findings report](../SOURCE_REFERENCES.md#source-99390c089954).
The [repair handoff](../SOURCE_REFERENCES.md#source-d7dbea354cc2)
owns the next investigations and success criteria; the evidence below establishes
the current status, not a completed qualification.

| Repair increment | Implemented / observed | Still required |
| --- | --- | --- |
| 1 — Evidence acquisition | `fdfb0a0` fixes public panel/carousel capture, entity boundaries, navigation context, evidence retention and compaction's duplicate source-association logic. Final local/VM checks pass 2,525/829 tests. | Reliably gather sufficient attributable facts within existing budgets. Final provider replay verifies 1 of 2 required options; latest product replay cannot substantiate six-hour comfort. Do not replace these criteria with more pages, diagnostics or a larger budget. |
| 2 — Browser failure recovery | Earlier bounded pre-inference retry exists; no recovery changes in `fdfb0a0`. | Explain the intermittent observation failure and demonstrate bounded continuation preserving progress, counters and task identity without replaying dispatched actions. |
| 3 — Provider access | OpenTable remains inaccessible in retained VM observations; no access expansion in `fdfb0a0`. | Establish a working, permitted path or explicitly leave the journey unsupported. Qualify other required provider dependencies separately. |
| 4 — Complete engine flow | Answer delivery is implemented. An intermediate provider replay passed once, but the final replay failed; the latest product run also records a sixth-turn `internal_error`. | Pass request → correct constraints → browser research → source-backed verification → delivered conversation answer, including corrections/status questions. Recheck the five failed journeys on one final snapshot, then the original 20-case campaign; retain failures and repeat unstable routes. |
| 5 — Independent acceptance | Primary/cross-model reviews and a different human's acceptance testing remain pending. | Obtain independent evidence for the actual final revision after the journeys pass. Local integration does not mark the increment Done or approve production. |

#### Implemented changes and verification evidence

The follow-up boundary audit reproduces several engine-owned losses, distinct
from Browser Use navigation. The [settled real-site observation](../SOURCE_REFERENCES.md#source-40fa510608b3)
shows a product feature dialog outside `main`: Browser Use observes it, while the
old source extractor omits it. Its controller-label change also clears the old
whole-page panel cache. Current capture admits uniquely associated portal dialogs,
keeps named observed carousel views, and excludes disclosure controls/carousel
presentation from the primary-page freshness fingerprint. Price, selection,
document and entity changes still invalidate old views. Independent recommendation
records and unrelated dialogs retain their separate boundaries.

Repeated views now consume one URL slot instead of evicting other providers.
Byte-identical passages reobserved with the same URL, entity, primary scope and
goal revision retain their assessments across unrelated page-fingerprint changes.
Single-primary-entity passages carry explicit provenance; section-only URL changes
can share that entity's facts without borrowing another record's evidence.
The existing ID format, source verification, capture timestamps, budgets,
protected-content filtering and provider permissions remain enforced. Browser Use
continues to own navigation; the engine retains its exact-source/authority checks.

The [actual-site extractor proof](../SOURCE_REFERENCES.md#source-946ebb0fd6ff)
passes: Windows evidence survives specifications closure, opening/closing the
portal feature panel and three carousel changes. The final engine catalogue also
retains the subsequently observed comfort passage. This is an extraction/retention
proof, not an inference that the source establishes six-hour comfort or a complete
engine journey. The [local fast profile](../SOURCE_REFERENCES.md#source-49315a321728)
passes **2,522 tests**, 1,158 excluded, in 149.39 seconds. The [pre-fix fixture run](../SOURCE_REFERENCES.md#source-bfe0bd7f4887)
fails the dynamic-view regression; intermediate failures remain retained. The
[page-context](../SOURCE_REFERENCES.md#source-b1e3a966d8f8)
and [primary-scope](../SOURCE_REFERENCES.md#source-0f8edba82a62)
mutations fail their safety assertions. Ruff, changed-module mypy and generated
API/event/guide checks pass.

The [pre-listing-fix VM public-research profile](../SOURCE_REFERENCES.md#source-f79d8b86ffc5)
passes **824 tests** in 385.61 seconds, with child/operator exit 0 and successful
database cleanup. The preceding full run's four failures were exact-shape
expectations missing the additive `primary` flag; all four were updated while
retaining their entity/privacy assertions.

The [first follow-up live replay](../SOURCE_REFERENCES.md#source-9e5012c63996)
settles **45 calls**: case 3 satisfies both requested options and delivers verified
research through the engine, while case 12 fails candidate-anchor validation.
The [retained public listing](../SOURCE_REFERENCES.md#source-00edfe940b27)
shows why: links enclosing product headings were missed, incorrectly assigning
the listing's product passages to the category heading. The extractor now accepts
both heading/link nestings, retaining section-link exclusions and independent
record boundaries. The [regression fixture](../SOURCE_REFERENCES.md#source-1d903129d601)
fails before this fix (**1 failed, 244 passed**). The [corrected actual-site capture](../SOURCE_REFERENCES.md#source-87644f351a50)
separates product names/prices from the category and neighbouring products. A local
browser attempt lacked the Chromium executable; browser checks use the VM's locked
worker/cache instead.

The [pre-compaction-fix VM public-research profile](../SOURCE_REFERENCES.md#source-711094234edf)
passes **826 tests** in 382.56 seconds, with child/operator exit 0 and successful
database cleanup. One unraisable-exception warning in SQLAlchemy garbage collection
under a Temporal workflow interrupt remains recorded; no test failed. This run,
the linked fast profile and actual-site panel/listing probes use the same
pre-compaction-fix runtime source.

The [second follow-up replay](../SOURCE_REFERENCES.md#source-28fe9c51ccb6)
settles **61 calls** and fails both journey gates at the unchanged 24-action limit.
Case 12 retains nine panel/view fragments and Windows evidence for both products;
all required wireless-branch criteria except six-hour comfort are supported.
Its sixth conversation turn returns `internal_error`, retained as a later-increment
failure. Case 3 retains only one partial candidate; the earlier pass is not reliable
qualification. Inspection of its reduced price sources exposes another boundary:
storage's duplicate text-only association resolver discards entity metadata and can
drop otherwise valid cross-page criteria. Compaction now uses the verifier's same
source-association path. Removing that metadata fails both [scope mutation checks](../SOURCE_REFERENCES.md#source-e8a217b1be9e).
It also restores useful whole passages on already-retained pages when capacity
permits; the [pre-fix spare-capacity fixture](../SOURCE_REFERENCES.md#source-0776fd43141b)
fails without this restoration. Mandatory references, display page indices, identity
boundaries, timestamps and byte limits remain enforced. These fixes do not turn
unknown comfort, location-specific prices or failed conversation turns into success.

The [final-source local fast profile](../SOURCE_REFERENCES.md#source-ecf64d2431a7)
passes **2,525 tests**, 1,158 excluded, in 146.18 seconds. Changed-module mypy,
Ruff and generated-contract/guide checks pass. The earlier panel/listing proofs
still describe the unchanged extractor; their manifests predate the compaction fix.
The [final-source VM public-research profile](../SOURCE_REFERENCES.md#source-a527acd6c421)
passes **829 tests** in 454.48 seconds, with child/operator exit 0 and successful
database cleanup. The same Temporal/SQLAlchemy garbage-collection warning recurs;
no test fails. Independent review and human acceptance remain pending.

The [final-source provider replay](../SOURCE_REFERENCES.md#source-ddea408c6603)
settles **34 calls**, observes six valid turns and retains **one fully supported
option of two required**. It ends `agent_stopped_incomplete` after 24 actions and
22 navigation calls; its journey gate fails. One `unassociated_criteria_unknown`
event is retained, with zero diagnostic drops. The second candidate still lacks
attributable location/specialty and qualifying price support; navigation and
assessment remain insufficient for reliable completion. The product case was not
rerun after this compaction-only change; its latest live observation remains the
failed 61-call two-case replay above. These are developer checks, not completed
increment acceptance or full five-journey qualification.

The [source/call audit](../SOURCE_REFERENCES.md#source-ab06a06adf9a)
matches all **842 transferred source files** for the final regression and provider
replay. This follow-up uses **140 completed/settled calls**, with none unsettled,
separate from the earlier 298-attempt campaign below. Live checks use synthetic
tenant/authority and frozen synthetic turns through authenticated engine APIs,
real public websites and OpenAI `gpt-6.1-sol` at low effort; bank-effect calls are
zero. The [cleanup check](../SOURCE_REFERENCES.md#source-47245067f7de)
confirms the personal VM lock is free, the test database stopped, no test processes
remain and no VM `.env` exists. No other increment was implemented.

**Earlier increment-1 snapshots below are historical evidence, not qualification
of the follow-up source.**

The [retained-run analysis](../SOURCE_REFERENCES.md#source-62feb53798b8)
and [test-only action trace](../SOURCE_REFERENCES.md#source-0f14ba8b90a6)
exposed a concrete loss: opening a specifications panel captured compatibility,
but a subsequent closed-panel snapshot at the same URL could replace that proof.
Named public panels on an unambiguous single-entity page now retain exact source
passages with their own capture times. Reopening replaces the panel; refreshed
documents, navigation away/back, changed entities or captured main-page text
invalidate it. A goal correction cannot promote an older panel capture into fresh
evidence. Existing price replacement, protected-content exclusions, source
association, byte limits and completion criteria remain enforced.

Navigation hints now follow an unambiguous worker-reported active URL rather than
the last inspected tab. The worker also receives requirement IDs matching its
assessment feedback, candidate source links ahead of unrelated recent pages, and
both remaining action and navigation-call allowances. Research budgets and
destination permissions are unchanged; no runtime diagnostic expansion was added.

The [final local fast profile](../SOURCE_REFERENCES.md#source-74652833903c)
passes **2,519 checks**, 1,154 excluded, in 137.81 seconds. Focused checks cover
panel closure, replacement, refresh, navigation, page changes, compaction and
active-tab hints. The [final-source VM public-research profile](../SOURCE_REFERENCES.md#source-257c89270889)
passes **819 tests** in 406.48 seconds, with child/operator exit 0 and successful
database cleanup. Deliberately removing panel retention or refresh invalidation
fails the corresponding [retention](../SOURCE_REFERENCES.md#source-bac69a0d84ae)
and [freshness](../SOURCE_REFERENCES.md#source-e297b98ee5a0)
assertions. The [final-source real-site probe](../SOURCE_REFERENCES.md#source-8a3921d08a07)
opens the observed Logitech specifications control through the actual Browser Use
worker and confirms Windows evidence remains after closing it, without model calls.
Ruff, changed-module mypy and generated API/event/guide checks pass.

The [five-case replay](../SOURCE_REFERENCES.md#source-4edcca27a23b)
uses retained synthetic turns through authenticated engine APIs, synthetic tenant
and authority, real public websites and OpenAI `gpt-6.1-sol` at low effort on the
personal Railway VM. All **30/30 turns** are valid, with **176 settled calls**,
but **all five journey gates still fail**, with zero verified research deliveries.
Case 3 verifies one of two required options. Cases 4 and 7 retain unresolved published appointment
times; the retained denials include the booking-widget data request classified
as `private_or_effectful`. This increment does not change that access policy.
Case 12 now supports Windows compatibility for both products; six-hour
comfort remains unknown. Case 20 reaches its 50-call cap and includes an
`origin_not_qualified` failure. This run predates the final active-tab and additional
freshness guards; its source manifest must not be described as the final snapshot.
The [acquisition comparison](../SOURCE_REFERENCES.md#source-cbc6f9773100)
keeps criterion-level gains separate from complete journey success.

The [final-source replay of cases 3 and 12](../SOURCE_REFERENCES.md#source-91b3273af069)
records **12/12 valid turns**, **64 completed calls** (34 and 30), but **two failed
journey gates** and zero verified deliveries. Both tasks use 24 actions; case 3
uses 22 navigation calls and case 12 uses 18. Case 3 again verifies one of two
options, with one `unassociated_criteria_unknown` diagnostic. Case 12 retains
Windows evidence for Zone 300, but Zone Vibe 100's Windows criterion remains
unknown; six-hour comfort remains unknown for both. Its trace includes repeated
specifications/features-panel visits and a carousel change; the final Zone Vibe
snapshot has no retained panel. The isolated closure repair therefore does not
establish reliable evidence retention/reacquisition across those page changes.
The earlier two-product compatibility gain is not consistent final-source evidence.

The [audit](../SOURCE_REFERENCES.md#source-ab06a06adf9a) records **298
settled calls** across this increment's live runs (297 completed, one failed),
with no outstanding calls.
All 842 manifest files match the final regression and final replay; neither
source identity nor failed gates are inferred from the base commit alone. The
final replay has zero bank effects and no dropped diagnostics. The [cleanup
check](../SOURCE_REFERENCES.md#source-47245067f7de) confirms a free
qualification lock, stopped database, no test-user processes and no `.env`.

The affected scope remains LR-01/03/05/12/13/17, ISO/IEC 27001 5.34/8.15/8.29 and
ISO/IEC 42001 A.6/A.7. No real-tenant, vendor, destination or production approval
is added. Independent primary/cross-model review and different-human acceptance
remain pending. These developer repairs do not establish reliable end-to-end
research or close the remaining qualification work below.

### Public research requirement and recovery fixes

Implemented in **`8a9b362`**, integrated into local `dev` from
`feat/browser-failure-diagnostics` (base `920d00b`). Compiler, retained constraints,
assessment/result and answer-selection schemas now share
the existing compiler ceiling of **24 factual and 24 execution requirements**.
The former 13-item conversion failure has a passing regression; the common upper
bound is still enforced. Non-correction controls discard incidental goal spans
before validation, while correction provenance and task-target checks remain.
Cross-candidate evidence becomes an unknown criterion without losing independent
valid facts; strict retained-claim validation remains in place. Incomplete
completion attempts can continue within the durable budgets, and a worker step
that ends before inference can reobserve once only if no action was dispatched.

The [local fast profile](../SOURCE_REFERENCES.md#source-2e1d47d218c7) passes
**2,511 checks**, 1,150 excluded, in 101.90 seconds. Focused checks cover the former
conversion/display bounds, incidental control spans, source association and
pre-inference retry. The [VM public-research profile](../SOURCE_REFERENCES.md#source-115f18b86f27)
passes **807 tests**, no failures or skips, in 412.20 seconds, with child/operator
exit 0 and successful database cleanup. Runtime bytes match the subsequent live
snapshot; only indentation in the test-selection script changed afterward.
The [action-replay mutation](../SOURCE_REFERENCES.md#source-50b2ffe65ca0)
fails its assertion when the no-dispatch guard is removed in a disposable copy;
the earlier mutation collection error is not counted as detection. Ruff,
formatting, changed-module mypy and generated API/event/integration-guide checks
pass. Report manifests identify the tested source bytes, not just the base commit.

The [five-case real replay](../SOURCE_REFERENCES.md#source-2163f5aaac99)
exercises authenticated engine APIs with retained synthetic customer turns,
synthetic tenant/authority, real public websites and Chromium/Browser Use on the
personal Railway VM, using OpenAI `gpt-6.1-sol` at low effort. All **30/30 turns**
are valid, but **all five original journey gates fail**, with zero verified
research deliveries. The [audit](../SOURCE_REFERENCES.md#source-e36e2bd336c5) records
**172 settled attempts: 171 completed and one failed**, no outstanding calls,
zero bank effects and no dropped diagnostics. Cases stay within 50 calls each
and the campaign within 350; each call has a 4,096 output-token cap. All 842
live-snapshot files match the tested working tree. Child/operator exit 1 preserves
the failed journey outcomes; assertions and destination permissions are unchanged.

| Case | Fixed boundary and remaining observation |
| --- | --- |
| 3 | Cross-candidate criterion becomes unknown; research continues to 24 actions, then exhausts its budget without sufficient evidence. |
| 4 | Research uses all 24 actions; `agent_stopped_incomplete` remains the final label, rather than the removed two-stop cutoff. |
| 7 | No worker failure recurs; research still exhausts its budget. This does not prove the intermittent upstream cause is fixed. |
| 12 | Retains 14 requirements, exceeding the former 12-item ceiling; reaches 24 actions without conversion rejection, then exhausts its budget. |
| 20 | Six valid turns without `invalid_goal_scope`; one snapshot `owner_observe:Error` at `public_site.py` remains unexplained. Research reaches 24 actions and exhausts its budget; another task remains waiting for input. |

The [cleanup check](../SOURCE_REFERENCES.md#source-eab75d883e10) confirms a free
qualification lock, stopped database, no test-user processes and no `.env`.
The personal sandbox remains available. These are developer checks, not successful
end-to-end qualification or independent acceptance.

**OpenTable navigation remains unresolved in the personal VM.** The
[protocol comparison](../SOURCE_REFERENCES.md#source-008f9cb26c05)
reproduces `ERR_HTTP2_PROTOCOL_ERROR`; HTTP/1.1 instead times out without receiving
a document or retaining any page. No protocol downgrade or access-control bypass
was shipped. A separate [worker probe](../SOURCE_REFERENCES.md#source-6cb4a6a61835)
reaches the model-request boundary on three retained Doctoralia pages without
model calls. It does not reproduce or establish the root cause of the earlier
intermittent upstream failure; the bounded retry addresses recovery, not a proven
upstream defect. These observations do not qualify original public-site journeys.
The [local comparison](../SOURCE_REFERENCES.md#source-8e7828524017)
cannot test network reachability because the required local Chromium executable
is absent; it is not evidence of a second network failure.

The preceding diagnostics increment's LR-01/03/05/12/13/17 and ISO/IEC 27001
5.34/8.15/8.29 and ISO/IEC 42001 A.6/A.7 scope also applies to these changes.
Independent primary/cross-model review, different-human acceptance and production
approval remain pending. Local integration is separately requested by the user;
it does not establish those approvals or completion of the broader browser work.

#### Remaining end-to-end qualification

**Browser navigation works in some tested flows; reliable end-to-end public
research is not established.** The five-case replay of `8a9b362` above is a
historical baseline for the acquisition repair evidence, not a new full 20-case
campaign. The older full campaign remains a
historical baseline and does not qualify `8a9b362`.

| Remaining work | Evidence required to close the gap |
| --- | --- |
| Acquire sufficient relevant evidence within durable budgets | Trace missing criteria and useful versus repeated/denied actions in the retained failed runs. Repair the demonstrated navigation, extraction or assessment cause; preserve location, price, time, alternatives and provenance. A larger budget or an unknown criterion is not success. |
| Resolve intermittent observation failures | Reproduce the upstream pre-inference termination and snapshot failure, establish their causes, and verify bounded recovery preserves progress, counters and task identity without replaying dispatched actions. The current retry is a mitigation. |
| Qualify provider access | Demonstrate the required permitted lookup and useful facts, including OpenTable access and the still-unqualified Doctoralia/Volaris dependencies, or explicitly exclude unsupported journeys from the claimed capability. Do not weaken network/authority controls to obtain a pass. |
| Demonstrate verified answer delivery | Pass request → retained constraints → research → source-backed verification → delivered answer through authenticated engine APIs, including corrections, status/focused questions, mixed goals and cancellation. Delivery code exists; these five runs do not demonstrate successful verified research delivery. |
| Complete acceptance | After focused repairs pass, rerun unchanged original cases 1–20 on one identified source/configuration snapshot and repeat unstable routes. Record per-goal satisfaction as well as harness gates; obtain independent primary/cross-model review and a different human's acceptance. Production approval remains separate. |

The acquisition repairs above address demonstrated evidence loss and navigation
context defects; the remaining cases still need sufficient source-backed facts
without relaxing verification. The user-requested [findings and proposals](../SOURCE_REFERENCES.md#source-754b78de1e11)
maps that work to source entry points and operational evidence. That report grants
no provider permissions or approvals.

### Browser failure diagnostics (package 1)

Developer evidence uses `feat/browser-failure-diagnostics`, based on local `dev`
`920d00b`; report manifests identify the uncommitted source bytes. Operator-only
diagnostics classify requirement/assessment/display rejection and browser/worker
failures, correlate task/revision/generation, and omit rejected content and raw
exception messages. The harness records bounded journals and can replay retained
synthetic customer turns. The detached runner checks both child exit and JUnit;
journey assertions, validators and destination permissions remain unchanged.

The [seven-case replay](../SOURCE_REFERENCES.md#source-b4f3ad560f61)
uses original cases **3, 4, 7, 12, 13, 14 and 20**, authenticated engine APIs,
synthetic tenant/customer/authority, actual public websites and Chromium/Browser
Use on the personal Railway VM, with real OpenAI `gpt-6.1-sol` at low effort.
It records **7 failures**, **41/42 valid turns**, zero verified research deliveries,
zero bank effects, **143 completed calls**, no unsettled calls and no dropped
diagnostics. Each conversation stays below 50 calls and each call has a 4,096
output-token cap. Child and operator both exit 1. The replay predates the final
worker-reason/count diagnostic refinement; it is not final-source acceptance.

| Case | Newly observed failure or limit |
| --- | --- |
| 3 | Assessment rejects candidate/evidence association at `public_evidence.py`; reproduced by a controlled relationship fixture. |
| 4 | `agent_stopped_incomplete`; the historical assessment failure did not recur. |
| 7 | Observation failure followed by two worker `prepare` invalid-state failures. |
| 12 | Requirements conversion rejects an overlong list: compiler permits 24, retained model permits 12. A 13-item fixture reproduces the mismatch; package 1 does not repair or approve that limit. |
| 13 | Six valid turns and cancellation, but no verified research. The historical answer-selection rejection did not recur; a controlled stale-revision fixture covers its rejection/repair diagnostic boundary. |
| 14 | Both tasks fail during initial browser navigation, before usable pages, across three generations each. |
| 20 | Incomplete research and turn 6 `invalid_goal_scope`; the historical worker failure did not recur. |

The final-source [focused follow-up](../SOURCE_REFERENCES.md#source-57e8d96470fc)
repeats cases 7 and 14: **2 failures**, 12/12 valid turns, zero verified deliveries
or bank effects, **42 completed calls** and no unsettled calls/dropped diagnostics.
Case 7 identifies `agent_ended_before_inference`: the upstream step returns before
requesting inference; its underlying cause remains unresolved. Recovery proceeds,
an assessment association is rejected, and research ends incomplete. Case 14
records **`ERR_HTTP2_PROTOCOL_ERROR`** at initial navigation for both tasks across
three generations each. These classify runtime failures without retaining URLs
or exception messages; they do not establish a network/server root cause.
Both live runs together use **185 completed calls** within the 350-call bound;
the follow-up returns child/operator exit 1 and stops its owned database.
The [final VM check](../SOURCE_REFERENCES.md#source-1150f8e0a613) records a free
qualification lock, stopped database, no `browsercheck` processes and no `.env`;
the personal sandbox remains available.

The [historical inventory](../SOURCE_REFERENCES.md#source-9bcebc58d161)
preserves hashes and available context. Old rejected model selections and exact
transient offered context were not retained and cannot be reconstructed. Frozen
customer turns do not freeze websites or model outputs. See the
[correlated audit](../SOURCE_REFERENCES.md#source-9a9407d84752) for separate run
manifests, task diagnostics and call accounting; these observations do not
establish that unreproduced historical failures are fixed.

The final [local fast profile](../SOURCE_REFERENCES.md#source-a89db1ea97e0)
passes **2,504 checks**, 1,149 excluded, in 119.48 seconds. Ruff, formatting and
mypy on seven changed source modules pass. The final
[VM public-research profile](../SOURCE_REFERENCES.md#source-01ef2870f655)
passes **799 checks**, no failures or skips, in 483.29 seconds; child/operator
exit 0 and owned database cleanup succeeds. Disposable
[false-success](../SOURCE_REFERENCES.md#source-8629411927d3) and
[raw-error](../SOURCE_REFERENCES.md#source-e423be6057b9) mutations
produce assertion failures. Initial diagnostic/worker-reason failures and the
first VM run's three instrumentation regressions remain recorded; later checks
cover their corrections.

Scope touches LR-01/03/05/12/13/17 and target ISO/IEC 27001 controls 5.34, 8.15 and
8.29, plus ISO/IEC 42001 lifecycle/data controls A.6/A.7. No real-tenant data or
new destination permission is introduced. Independent primary/cross-model
review, a different human acceptance tester, legal prerequisites and production
approval remain pending; developer checks do not supply those approvals.

### Original journeys and sustained recovery (increment 5)

Developer evidence uses `feat/browser-journey-recovery`, based on local `dev`
`9309d0f`; report manifests identify the uncommitted working-tree bytes.
The original-journey harness now requires six valid customer turns and observable
final task views. Its report separates research verification, cancellation and
turn failures, checks complete dataset coverage, and does not claim independent
acceptance. Cancellation status is concise while explicit retained-evidence and
stop-plus-summary requests remain available. An unverified result no longer
implies that a recovery attempt occurred.

**Original public-site journeys remain unqualified.** The
[complete campaign](../SOURCE_REFERENCES.md#source-72c4c3f6c419)
records **19 failed, one passed**, no skips, in 3,899.87 seconds. All original
IDs 1–20 ran against frozen dataset
`307d59f17a794b1b394c63374c32013851cba71b64f77e3e79d26b3c0aadadab`.
The [outcome report](../SOURCE_REFERENCES.md#source-d7b2733e8915)
records **119/120 valid turns**, 66 source-page observations (64 with usable
passages), **zero verified research deliveries**, nine cancelled tasks and twelve
failed tasks. A further task in case 20 remains `waiting_input`: 22 created tasks
in total. Only case 18 passes its cancellation gate. No bank effects were recorded.
These are authenticated engine API runs with synthetic tenant/customer/authority,
actual public websites, Chromium/Browser Use and real OpenAI `gpt-6.1-sol` at low
reasoning effort; they are not production or real-customer evidence.

The retained [case evidence](../SOURCE_REFERENCES.md#source-fe17b7285209)
distinguishes these failures:

| Cases | Recorded failure |
| --- | --- |
| 2, 8, 17 | `public_research_budget_exhausted` |
| 3, 4, 7 | `ungrounded_public_assessment` |
| 9, 10 | `agent_stopped_incomplete` |
| 12 | `ungrounded_public_requirements` |
| 13, turn 4 | HTTP 200 with failed turn / `invalid_public_answer_selection` |
| 14 | Two tasks fail with `service_browser_unavailable` before browser actions |
| 20 | `browser_use_agent_unavailable`; another task awaits input |

Doctoralia's `/api/v3/booking/widget/data` remains denied as
`private_or_effectful`. Volaris session and API dependencies remain unqualified;
both flight cases have no usable source passages. These observations do not prove
that matching appointments or flights do not exist. Assessment, requirement and
answer-selection failures are engine/model validation failures, not established
source limitations. Case 3's conditional prices are retained in alternative
groups; the flattened keyword report alone cannot evaluate their semantics.
Focused-answer quality and satisfaction of every goal in mixed requests still
require case review. No hard constraint, original assertion or destination policy
was relaxed to turn these failures into passes.

The [earlier canary](../SOURCE_REFERENCES.md#source-621884fbaa9c)
repeats original cases 2, 12 and 18: two fail, cancellation passes, and all 18 turns
are valid. It uses 87 completed model calls. It exposed the corrected cancellation
verbosity and misleading recovery wording; its earlier source snapshot is not a
matched policy ablation. The full campaign uses **459 completed calls**, no
unsettled attempts, at most 38 per conversation, below the approved 50/1,000
conversation/campaign limits and 4,096 output-token cap per call.

The [real-model recovery evaluation](../SOURCE_REFERENCES.md#source-30f8c3a4401e)
passes with **14 completed OpenAI calls** (limit 32), actual Chromium/Browser Use
and Temporal against a controlled synthetic source. It interrupts a real browser
model response before dispatch, replaces the worker/browser after teardown,
completes the research against the source oracle, and records zero extra replay
calls and no forbidden effects. A separate controlled regression exercises three
authority-expiry/resume and coordinator-replacement cycles: the same task, goal,
deadline, attempts and action/inference counters survive; another customer cannot
resume it, and waiting for authorization performs no inference. This does not
establish VM-reboot recovery or public-site qualification.

The [local fast run](../SOURCE_REFERENCES.md#source-db5ef6c7ae36)
passes **2,476 checks**, 1,149 excluded, in 163.03 seconds on its recorded snapshot;
the earlier [180-second run](../SOURCE_REFERENCES.md#source-d44f08c811a2)
was interrupted. The final stop-plus-summary adjustment is subsequently covered
by VM regression. Initial
[wording](../SOURCE_REFERENCES.md#source-e147008da742) and
[stop-status](../SOURCE_REFERENCES.md#source-9d00724359e5) behavioral
regressions fail before the fixes. The
[turn-validity mutation](../SOURCE_REFERENCES.md#source-8f7b02a2292e)
shows the gate detects a failed turn hidden behind HTTP 200; source is not mutated.
Ruff, formatting, mypy on three changed source modules, API schema and generated
integration-guide checks pass.

Failed preliminary evidence is retained: the
[first VM profile](../SOURCE_REFERENCES.md#source-acd6f447be19)
has 761 passes, one stale-wording assertion failure and six Temporal skips caused
by the operator environment. The
[next profile](../SOURCE_REFERENCES.md#source-9f3cf2759d56)
has 767 passes, four failures, no skips; it exposed stop-plus-summary suppression
and cancellation race assertions, subsequently corrected. A
[focused attempt](../SOURCE_REFERENCES.md#source-c588996358b9)
fails collection because its selection does not satisfy the full profile.
The temporary operator runner also omitted exit-code propagation, incorrectly
labeling that failed attempt and the failed full campaign as passed in its pipeline
metadata. Actual per-run JSON/JUnit and the
[source/call audit](../SOURCE_REFERENCES.md#source-5d4c87c46169)
supersede those labels; the operator exit handling is corrected. The paid sequence
advanced before the final regression gate, and that ordering error is not passing
evidence.

The [final complete VM regression](../SOURCE_REFERENCES.md#source-27fb5d36efeb)
passes **771 checks**, no failures or skips, in 392.27 seconds. It uses actual
PostgreSQL, Chromium/Browser Use and Temporal with controlled synthetic inference.
Its 836-file source manifest matches the full campaign and local source with no
mismatches. The canary, full campaign and recovery evaluation together use
**560 completed real-model calls**. Downloaded reports pass the configured-key
scan. The [cleanup check](../SOURCE_REFERENCES.md#source-1fa6e2b81d43)
confirms the owned database is stopped, no live test/browser or operator processes
remain, and no source `.env` file is present. One defunct process is recorded;
the existing personal VM is preserved. The key was supplied over encrypted stdin
for process-memory use, not in source files, reports or browser workers.

Independent primary/cross-model reviews, a different human tester, conversation
acceptance and production approval remain pending. No real-tenant destination,
financial authority, memory store or retention policy is enabled. Compliance
scope: LR-01/03/04/05/12/13 and LR-17 reassessment; target ISO/IEC 27001 controls
5.15–5.18, 5.19–5.23, 5.34, 8.3, 8.5, 8.10–8.12, 8.15, 8.20–8.24, 8.26–8.29,
and ISO/IEC 42001 A.5, A.6.2, A.7–A.9. Recorded legal and disclosure prerequisites
remain in force.

### Public controls and accepted constraints (increment 4)

Developer verification uses `feat/browser-task-controls`, based on local `dev`
`3ea8b16` (the integrated increment 3). Report manifests identify working-tree
bytes. Optional public display choices are validated separately from executable
task/control intent. Invalid choices produce a safe presentation fallback while
target, scope, authority and financial validation remain mandatory. Engine-owned
token spans retrieve exact permitted customer text; malformed spans retain the
original targets during bounded repair. Accepted filters and pending changes
project from existing task state independently of candidate assessment, with
compiled-revision binding and current disclosure checks.

The [initial capture regressions](../SOURCE_REFERENCES.md#source-de7b197fec29)
record 11 failures before implementation. The
[local fast run](../SOURCE_REFERENCES.md#source-7df1e1c47ebc) passes
**2,464 checks**, 1,144 excluded. The subsequent span-repair and message-preservation
delta passes [72 focused checks](../SOURCE_REFERENCES.md#source-b39e250a0cab).
The [span-overlap mutation](../SOURCE_REFERENCES.md#source-f8e034bb9287)
causes its intended assertion failure in a disposable process; no source files
are mutated. Ruff, formatting, mypy on seven affected source modules, API schema
and generated integration-guide checks pass.

The [first VM regression snapshot](../SOURCE_REFERENCES.md#source-240a6e484902)
records 751 passes and three failures in 418.44 seconds. Pending-filter text displaced a
clarification question and expanded a cancellation receipt. Both presentations
were corrected. The [affected-path recheck](../SOURCE_REFERENCES.md#source-6e7956269fa9)
records 249 passes and one fixture failure in 122.09 seconds, with both presentation
regressions passing. The new compilation fixture initially lacked exact request
provenance and routed its responses to capture instead of the compiler model;
both fixture errors were corrected without weakening validation. The
[final control recheck](../SOURCE_REFERENCES.md#source-64b88784d487)
passes **36 checks**, no failures/skips, in 15.01 seconds. These runs retain distinct
source manifests; neither earlier failed run is relabeled as a full-profile pass.
They use the personal Railway VM with actual PostgreSQL, Chromium/Browser Use and,
in the broad profile, Temporal; source/authority/inference fixtures are synthetic.
The initial local fast run likewise exposed a
partial fixture missing the stored goal. Failed reports remain alongside rechecks.

The [actual OpenAI evaluation](../SOURCE_REFERENCES.md#source-469dba6a0b8b)
passes **5/5 cases** in 35.71 seconds, using **seven completed calls** to
`gpt-6.1-sol` at low reasoning effort. Correction-plus-question and
cancellation-plus-question cases run with and without deliberate optional-display
corruption after native capture; a separate case asks for saved filters. Both
correction cases use engine-hydrated token spans and a second real-model turn
recalling the prior filters plus the pending correction. Authenticated engine API
replay adds no calls or duplicate tasks. The
[call ledger](../SOURCE_REFERENCES.md#source-45724b2e99d1)
records all attempts and usage. There is no fresh website visit or full-journey
claim. The [834-file source audit](../SOURCE_REFERENCES.md#source-97b9de288be6)
matches the final VM export with local source, with no mismatches.
The temporary credential was passed over encrypted stdin into test-process memory;
the 36 exported report files contain no configured key. The live bootstrap and
all test-user processes exited, the isolated database was stopped, and no `.env`
was copied to the VM. The existing personal VM remains available.

This is developer evidence with synthetic tenant/customer identities, source data
and authority. Independent primary/cross-model reviews, a different human tester
and production approval remain pending. Increment 5's original journeys and
sustained-recovery campaign remain separate; no new real-tenant destination,
financial authority, memory store or retention policy is enabled.

Compliance scope: LR-01/03/04/05/12/13, with LR-17 release reassessment. Target
ISO/IEC 27001 controls 5.15–5.18, 5.23, 5.34, 8.3, 8.10–8.12, 8.15, 8.24,
8.26–8.29 and ISO/IEC 42001 A.5, A.6.2, A.7–A.9. Legal interpretations and
real-tenant model disclosure retain their recorded prerequisites.

### Retained public observation answers (increment 3)

Developer verification uses `feat/browser-source-answers` based on local `dev`
`0c3affa`; individual report manifests identify the tested working-tree source.
The private answer selection now offers bounded, question-ranked retained
passages independently of candidate assessment. Exact excerpts retain source
URL, observation time and established entity association; ambiguous associations
remain page context. Earlier-goal observations are explicitly historical and
cannot establish a current quote or completed goal. Task/revision/time binding,
fresh source validation and current disclosure checks protect selection and replay.
No new evidence store, real-tenant enablement or free-form source synthesis is added.

The [initial failing regressions](../SOURCE_REFERENCES.md#source-932509a634d5)
record 14 missing-behavior failures before implementation. The
[local fast profile](../SOURCE_REFERENCES.md#source-dcb77596774e)
passes **2,445 checks**, 1,135 excluded, in 165.69 seconds. The earlier
[fast run](../SOURCE_REFERENCES.md#source-189ebacea993) passes 2,442 checks
on its earlier snapshot. The final defensive selection/paid-opt-in delta has
[47 focused passes](../SOURCE_REFERENCES.md#source-83c837a0add0).
The [quote-membership mutation](../SOURCE_REFERENCES.md#source-3288d4625f81)
is detected in a disposable process; no source file was mutated. Ruff, formatting,
mypy on four affected source modules and generated-contract checks pass.

The personal Railway VM [public-research run](../SOURCE_REFERENCES.md#source-8f38164c935a)
passes **728 checks**, no failures/skips, in 440.57 seconds on the first exported
increment-3 snapshot. It uses actual Chromium/Browser Use, PostgreSQL, Temporal
and authenticated engine APIs with synthetic sources/authority and controlled
inference. It covers correction history, source changes during capture, revoked
disclosure and saved-answer replay, without new browser actions or task creation.
Subsequent catalogue bounds, duplicate-page removal and defensive selection
changes pass the [final focused VM run](../SOURCE_REFERENCES.md#source-a297900c0c68):
**221 checks**, no failures/skips, in 124.74 seconds. The two runs retain distinct
source manifests; the 728 passes do not qualify the later bytes. The
[final 831-file source audit](../SOURCE_REFERENCES.md#source-8ff43c577d4c)
matches the exported snapshot with local files, with no mismatches.

The [real OpenAI VM evaluation](../SOURCE_REFERENCES.md#source-87a7da54fb6f)
passes **12/12 cases** in 57.77 seconds, using **12 completed model calls** to
`gpt-6.1-sol` at low reasoning effort. The retained
[call ledger](../SOURCE_REFERENCES.md#source-5772d22a79ad)
records usage and the bounded attempts. Six synthetic observation cases run twice:
unassessed tariff, passage-tail detail, two-provider attribution, model-family
uncertainty, earlier-goal evidence and source prompt injection. They exercise
authenticated engine turns with synthetic authority and retained source data,
not a fresh website visit or full customer journey. The final snapshot is unchanged.
The temporary key was supplied only through encrypted stdin into process memory;
it was not persisted or sent to browser workers. Test-user processes are gone and
the isolated PostgreSQL instance was stopped; the existing VM remains available.

Increment 4's optional-answer/control decoupling is recorded above; increment 5's
original twenty-conversation campaign remains separate. Independent primary/cross-model
review, a different human acceptance tester and production approval are pending.

Compliance scope: LR-01/03/04/05/12/13, with LR-17 release reassessment. Target
ISO/IEC 27001 controls 5.15–5.18, 5.23, 5.34, 8.3, 8.10–8.12, 8.15, 8.24,
8.26–8.29 and ISO/IEC 42001 A.5, A.6.2, A.7–A.9. Existing privacy filtering and
real-tenant disclosure defaults remain; this is engineering evidence, not legal
approval, independent acceptance or certification.

### Interactive browser network policy (increment 2)

Developer verification used the `feat/browser-network-policy` working tree
based on local `dev` `2b65f66`; report manifests identify the tested source independently of subsequent commit identity. Interactive startup and requests no
longer fetch/enforce robots. Trusted exact public lookup contracts admit reviewed
GET/HEAD/POST XHR/fetch operations with finite request fields/values, while
retaining authority, private/effect denials outside those contracts, cancellation
and route-version binding. The new operation transport is credential-free,
DNS-pinned and redirect-denying. It does not qualify cookie-dependent APIs,
arbitrary POST bodies or any real tenant. No live lookup is enabled by default.

The [Windows fast profile](../SOURCE_REFERENCES.md#source-bac27747e83c)
passes **2,428 checks** (1,119 excluded by the profile) in 161.28 seconds. The
[first fast run](../SOURCE_REFERENCES.md#source-14dcc752786d) reached its
180-second limit and remains recorded as interrupted. A direct local browser
attempt failed for a missing default Chromium cache; two retries with the cache
selected stalled and were interrupted. They are not passing browser evidence.
The [initial failing regressions](../SOURCE_REFERENCES.md#source-24a0c1996d53)
and [negative-control mutation](../SOURCE_REFERENCES.md#source-d0b2c5e96429)
are retained: forcing operation matching to allow everything is detected.
Ruff, formatting, mypy on four affected source modules and generated-contract
checks pass.

On the same personal Railway VM, with synthetic tenant/customer authority and
controlled inference, the [public-research run](../SOURCE_REFERENCES.md#source-e42d5a4e132c)
passes **707 checks**, no failures/skips, in 434.18 seconds. It exercises actual
Chromium/Browser Use, authenticated engine/task APIs, PostgreSQL and Temporal.
The final strict-encoding and cross-origin test delta is covered by the
[95-pass browser baseline](../SOURCE_REFERENCES.md#source-ef41cb2574c6)
in 7.54 seconds, with no failures/skips. Both same-origin and cross-origin POST
lookups render the synthetic widget result; altered requests and cancellation
never reach the lookup source. Private/mixed DNS, redirects, credential stripping,
route tampering and foreign-tenant attempts have explicit negative checks.
Reports bind their individual source snapshots; the final
[828-file manifest](../SOURCE_REFERENCES.md#source-ca3816c2c158)
matches the local exported source. The database was stopped after verification.

A [single credential-free real HTTPS probe](../SOURCE_REFERENCES.md#source-2a688f76c8cb)
through the pinned transport returned HTTP 200 from the existing Doctoralia
origin, verifying public-address connection and original-host TLS. No response
body was retained. This is transport evidence, not a successful research journey.
There were **zero paid model calls**; no prompt/model change required them for
these deterministic checks. Original twenty-conversation qualification remains
increment 5. Evidence/answer and conversation-control repairs remain increments
3–4; at that snapshot, their characterization tests still reproduced the old defects.
Independent primary/cross-model review, a different human tester and production
approval remain pending.

Compliance scope: LR-01/03/04/05/12/13; LR-17 remains a release reassessment.
Target ISO/IEC 27001 controls 5.15–5.18, 5.23, 5.34, 8.3, 8.10–8.12, 8.15,
8.20–8.24 and 8.26–8.29; ISO/IEC 42001 A.5, A.6.2 and A.7–A.9. This records
engineering evidence, not site/legal permission, certification or production approval.

### Browser baseline and startup diagnostics (increment 1)

Qualification used the `feat/browser-baseline-diagnostics` working tree based on
`1f1bc92`; reports bind that tested source through file manifests, independently
of subsequent commit identity. This increment adds sanitized pre-protocol/transport diagnostics, a
zero-inference sandboxed Chromium/worker/CDP preflight and controlled reproductions
of unresolved findings. It does not repair robots policy, source answerability or
conversation controls. Passing characterization tests means the limitation was
reproduced, not that the customer journey passed.

Windows developer checks record [2,404 fast passes](../SOURCE_REFERENCES.md#source-4980ed96ede9),
[43 startup/browser passes](../SOURCE_REFERENCES.md#source-98bf38741fc6)
and [68 controlled baseline passes](../SOURCE_REFERENCES.md#source-81e5d966ca03).
The later [19-case diagnostic delta](../SOURCE_REFERENCES.md#source-973de350af54)
includes rejecting stale success from an exited worker while retaining its safe
error frame. The [deliberate missing-worker run](../SOURCE_REFERENCES.md#source-b1ffa33df107)
fails prerequisite admission before test selection. Ruff, formatting and mypy on
the three changed service modules pass. These runs have distinct source manifests.

The existing personal Railway sandbox was reused with synthetic data only,
Python 3.13.12, Playwright 1.64.0, Chromium 156.0.8078.4 and separately locked
Browser Use 0.13.14. Both Python environments were built and bytecode-compiled
on the VM; Chromium and the worker run as non-root UID 1001. The
[VM readiness probe](../SOURCE_REFERENCES.md#source-95373727e9c8)
passed first/repeat launches in 8.015/4.792 seconds with zero model calls.
These are fresh profiles/processes, not proof of cold OS caches. PostgreSQL is
loopback-only on 55532; Temporal tests own 7263. Qualification runs detach from
the client and retain their runner, engine/worker, database and browser on the VM.

The [first remote public-research run](../SOURCE_REFERENCES.md#source-16ad6fa470be)
records 679 passes and six Temporal startup failures caused by a missing download
directory. Its [console evidence](../SOURCE_REFERENCES.md#source-8aaf575f903a)
is preserved. Fresh Linux setup also exposed a PostgreSQL socket permission
failure; the existing launcher now keeps sockets in its owned cluster directory.
Preflight now creates the Temporal download directory before test admission.
The [final remote run](../SOURCE_REFERENCES.md#source-1e7d0f26de5b)
passes all **686 selected checks** in 379.98 seconds, including real Chromium,
authenticated engine/task tests with synthetic authority, Temporal replay/recovery,
the baseline reproductions and final startup diagnostics. Its
[JUnit report](../SOURCE_REFERENCES.md#source-1c1738c7c337)
has no skips or failures. All 826 exported source files match the final local
working tree. Later Railway CLI connection timeouts did not interrupt the detached
run; VM reboot/host suspension and fresh real-site qualification are separate checks.

The original scenario/campaign files are preserved with
[availability and hashes](../SOURCE_REFERENCES.md#source-7f9146a89965).
No new paid inference or real-site conversation campaign has been run for this
increment. Primary/cross-model review, a different human tester and production
approval remain outstanding.

Compliance scope: LR-01/03/04/05/12/13 for disclosure-safe diagnostics, cloud test
processing, authority regression coverage and source-access boundaries; LR-17
remains a release reassessment. Target ISO/IEC 27001 controls 5.15–5.18, 5.23,
5.34, 8.3, 8.10–8.12, 8.15, 8.20–8.24 and 8.26–8.29; ISO/IEC 42001 A.5,
A.6.2 and A.7–A.9. Synthetic verification grants no legal approval, real-tenant
enablement or certification.

### Parallel browser reliability evaluation

Final integrated runtime `c1a078f` passes the
[2,393-case fast profile](../SOURCE_REFERENCES.md#source-b189f55a01bc),
mypy on 185 source files, Ruff, generated-contract checks and integration-guide
checks. The [targeted run](../SOURCE_REFERENCES.md#source-675112577c9c)
records 114 passes and one assertion still expecting an unquoted filter label.
After correcting that expectation, all 18 composed-reply tests pass. The
[coverage reconciliation](../SOURCE_REFERENCES.md#source-7644cc188adc)
accounts for all 115 selected cases, including the five earlier public-profile
failures, with no skipped or missing cases. This is coverage across two
invocations, not a green single-invocation profile. Subsequent changes are test
wording and this index only. A
[daemon restart](../SOURCE_REFERENCES.md#source-107cc011ecd7)
interrupted the preceding final runs; those reports remain preserved.

The [reviewed reply repairs](../SOURCE_REFERENCES.md#source-76b3e28c89f6)
acknowledge an actually saved correction, retain alternative groups in replies,
name the candidate next to selected criterion status, disclose unmet preferences
even when required criteria pass, and quote untrusted filter/criterion labels.
They do not add answers from unassessed source excerpts or establish live-source
qualification. The implementation remains on the local feature branch; human
acceptance and production approval are not recorded.

The complete [twenty-conversation campaign](../SOURCE_REFERENCES.md#source-82e139816b90)
on `41d4b4d` exercised authenticated engine APIs with synthetic tenant/customer
authority, real OpenAI inference and public websites. All 120 customer turns were
observed: 102 completed and 18 failed. Two research tasks reached engine-verified
outcomes, but their follow-up errors prevent counting them as accepted customer
journeys. Six task cancellations were honored. The strict campaign has three
passing case assertions (two research tasks and one cancellation), not twenty
passing conversations. Its [ledger and summary](../SOURCE_REFERENCES.md#source-7f9eea2f7834)
contain 452 settled reservations, with one unknown usage record. The
[source comparison](../SOURCE_REFERENCES.md#source-29fb77bc83d6)
preserves raw hashes and verifies normalized content across the three worktrees.

Subsequent repairs distinguish preferred criteria from required alternatives,
preserve scoped source attribution and exact display excerpts, compose evidence
and recovery replies, accept a public-task correction with an accompanying
answer, and bound cold worker initialization and recovery. The
[nine real requirement compilations](../SOURCE_REFERENCES.md#source-0acd868cf73a)
and [authenticated display replay](../SOURCE_REFERENCES.md#source-446cf0dae670)
are narrower developer checks: the latter uses retained real-site observations,
not a fresh browser visit or appointment confirmation.

At `410008b`, the [fast profile](../SOURCE_REFERENCES.md#source-a244efe95ff4)
passes all 2,387 selected checks. The
[public-research profile](../SOURCE_REFERENCES.md#source-60532c9a11a8)
records 661 passes and five failures, including synthetic-origin fixtures and a
database test interrupted by laptop standby. The
[Windows power events](../SOURCE_REFERENCES.md#source-ab1d90a15ff9)
record lid-triggered standby from 01:29:36 to 01:48:34 UTC on November 13; this
also interrupted live rechecks and expired their authority. The unchanged
[action-fence recheck](../SOURCE_REFERENCES.md#source-ccb5a6ac1816)
passes. Interrupted runs remain failures and authority expiry is not bypassed.
The [startup diagnostic regression](../SOURCE_REFERENCES.md#source-164b2298a14a)
checks that operators receive the failed loading phase and exception class,
without exception messages, tracebacks or source content. Its isolated invocation
passes 19 cases and skips eight database cases; combined verification is separate.

The [04/06 live rechecks](../SOURCE_REFERENCES.md#source-d1a138e7756f)
on `410008b` use 47 settled calls across the original recheck and standby recovery.
Case 04 completes all six customer turns and delivers a named doctor's published
general-consultation price, but cannot verify the requested appointment times.
The fresh case 06 retry completes all six turns, while two research attempts fail
before retaining a page: `browser_robots_unavailable`, then
`service_browser_unavailable`. A subsequent zero-model startup on the same
revision successfully loads both robots policies, captures a page and initializes
Browser Use. The second failure's suppressed exception was not retained and
remains unclassified; it is not evidence of missing appointment data or a proven
worker defect. None of these runs qualifies a successful research journey.
The [03/08 rechecks](../SOURCE_REFERENCES.md#source-7bc7b118f3da)
use 29 calls. They expose remaining reply defects around a correction plus a
question, alternative-condition display and unverified preferences; case 08's
last turn also crosses the recorded standby interval. A published observation
that has not become an assessed candidate/criterion cannot currently be selected
as a focused source answer. In case 04 this prevents directly distinguishing an
observed urgent-consultation tariff from an unverified general-consultation
tariff. This source-selection limitation remains unresolved; improved renderer
checks do not establish that it was fixed.

The repeated [stock Browser Use baseline](../SOURCE_REFERENCES.md#source-ca4533577258)
uses unmodified upstream `Agent.run` from Browser Use 0.13.14, with the same
qualified source policy: basic Logitech model/USB research succeeds in three
trials; Windows compatibility fails in three, and Volaris fares fail in six.
This baseline uses upstream Chat Completions rather than the engine's Responses
transport and does not exercise engine authority or APIs. The
[engine recovery diagnostic](../SOURCE_REFERENCES.md#source-1dd3d24ac8b0)
confirms successful replacement-worker initialization and commands, while its
original Windows-research goal remains unverified.

Exact credential-free public JSON dependency reads now admit observed Volaris
configuration/station resources. They do not establish a functioning fare route:
other required hosts remain denied. Doctoralia appointment-calendar requests
remain robots-denied, and a Logitech article's Windows statement has not been
bound to the exact researched product variant. These are unresolved source and
qualification limits, separate from conversation and worker repairs. Real-tenant
enablement, different-human acceptance and production approval remain absent.
Affected legal-register entries are LR-01/03/04/05/12/13/17; applicable target
controls include ISO/IEC 27001 5.15, 5.19, 5.34, 8.15 and 8.26–8.29, and ISO/IEC
42001 A.6.2. These developer checks do not establish certification or legal approval.

### Browser stabilization: initial comparison and loading recovery

The frozen `d15412f` [conversation campaign](../SOURCE_REFERENCES.md#source-7e3f173064d7)
was [stopped after repeated failures](../SOURCE_REFERENCES.md#source-4f0c960983ae):
nine complete conversations and one partial conversation, eight failed research
tasks, one correct cancellation and zero verified research outcomes. Of 306
reserved calls, 305 have recorded usage; one simulator completion remains unknown.
This is not a completed twenty-case qualification. Repeated generic progress
omitted requested filter/recovery answers; one normal correction failed scope
validation and a directory excerpt was attributed to the wrong doctor.

The [resource-feedback regressions](../SOURCE_REFERENCES.md#source-1ba2ca04dd81)
show that later image denials displaced an earlier availability-policy denial
from browser planning context. The [111-case recheck](../SOURCE_REFERENCES.md#source-91c70404af28)
passes with actual Chromium: consequential document/required-resource diagnostics
precede optional noise without discarding structured progress or exceeding the
context bound. The [first invocation](../SOURCE_REFERENCES.md#source-a18e47fa2507)
retains a failed synthetic-origin fixture, corrected without changing destination
validation. This fixes feedback, not site access or appointment availability.
LR-01/03/05/13 and ISO/IEC 27001 controls 5.34, 8.15, 8.26–8.29 and ISO/IEC 42001
A.6.2 remain applicable; independent review and acceptance are still missing.

The [interrupted first conversation](../SOURCE_REFERENCES.md#source-61289537e80e)
preserves the repeated full-report replies despite explicit concise-summary
requests; it is not a completed campaign. The concise-view regressions retain
[failed follow-up](../SOURCE_REFERENCES.md#source-4353e0790dd3)
and [failed task-view](../SOURCE_REFERENCES.md#source-5b6af21bf020)
observations. Current
[252 affected checks](../SOURCE_REFERENCES.md#source-f6c772c2c6fd)
and the [2,317-case fast profile](../SOURCE_REFERENCES.md#source-968a19cbe8f6)
pass. Private display selections bind to the offered task, goal revision,
candidate, criterion and exact bounded source excerpt. Full typed evidence and
the public wire shape remain unchanged. Short unassessed observations, cancellation
ordering, denied disclosure and stale-selection handling remain checked.

The [nine-call real Logitech follow-up](../SOURCE_REFERENCES.md#source-8974ec2891ed)
passes normal authenticated runtime startup, product/source verification and a
focused USB-A/USB-C answer without further browser work or a new task. The earlier
[eight-call trial](../SOURCE_REFERENCES.md#source-c66fd55726ef)
remains failed: its oracle missed the requested-field description, and prefix
cutting omitted the connector detail. Engine-owned excerpt handles address the
latter; the oracle now checks the original requested text and actual connector
value. The [one-call capture probe](../SOURCE_REFERENCES.md#source-9cd9f89b5f8e)
uses labelled synthetic sources and proves only model selection, not a live-site
journey. Source hashes identify each trial. Earlier database setup errors occurred
with the local test cluster stopped; the existing cluster was restored without
resetting its data. Twenty-conversation qualification on this increment and
independent review/human acceptance remain pending.

On committed runtime `10c8954`, the
[five-call real correction](../SOURCE_REFERENCES.md#source-c7b6fecdbb35)
preserves task identity, replaces Polanco with Roma Norte and verifies the revised
source criteria. The [four-call real cancellation](../SOURCE_REFERENCES.md#source-e948643406f3)
stops after a confirmed browser action, closes the session and performs no later
inference. The passing product/follow-up trial's runtime hashes match this
committed runtime. These are three functional samples, not a general reliability
rate; the original twenty-scenario campaign remains the next qualification.

On `cc3eb8b`, the [full public-research run](../SOURCE_REFERENCES.md#source-5fdd767f8346)
hit its 900-second runner deadline after 530 passing cases. Its status remains
interrupted. The [sixteen remaining worker cases](../SOURCE_REFERENCES.md#source-d2cea8b4a43e)
passed separately on the unchanged clean revision. The
[coverage reconciliation](../SOURCE_REFERENCES.md#source-d8c3dc068284)
matches all 546 selected IDs to passing cases across those two invocations,
without skips or duplicate credit. This is complete case coverage, not a green
single-invocation profile or independent acceptance.

The [normal-runtime conversation canary](../SOURCE_REFERENCES.md#source-e4a419a4d2a9)
records two unmet research goals and one observed cancellation, not three goal
passes. Doctoralia reached eleven usable directory/profile pages but exhausted
its research budget without establishing the requested time/price; the Logitech
conversation was cancelled after partial findings. It also exposed a shared
renderer incorrectly labelling Logitech observations as Doctoralia patient work.
The [presentation regression](../SOURCE_REFERENCES.md#source-d4d810c00686)
reproduces that label; the corrected generic public-research wording passes the
[142-case recheck](../SOURCE_REFERENCES.md#source-134af0328435),
including actual Chromium and configured registration. An earlier invocation
without the installed browser-cache path failed five environment startup cases
and remains recorded. The [fast profile](../SOURCE_REFERENCES.md#source-77e3a8926360)
passes 2,296 selected checks on its identified source manifest; later changes
retain their narrower rechecks. These checks do not resolve missing live
appointment or product-specification evidence.
The Doctoralia trace records `robots_disallowed` for the live
`/api/v3/availability/.../daily-availability` requests. Reaching a public profile
therefore does not establish access to its live appointment data; this observed
source restriction is separate from prompt interpretation and remains enforced.

The [configured-description regression](../SOURCE_REFERENCES.md#source-7820414fd03c)
shows that public research omitted the actual tenant destinations from its
capability description. The [recheck](../SOURCE_REFERENCES.md#source-6674e4a1f980)
passes 37 checks with one database-dependent helper skipped: English/Spanish
descriptions identify only the caller's configured sites and reject a foreign
client. This changes capability disclosure, not destination authorization.

The [scope-repair regression](../SOURCE_REFERENCES.md#source-a565e91fe506)
reproduces an unrecovered paraphrased correction. The
[37-case recheck](../SOURCE_REFERENCES.md#source-3afc7a41ec19)
passes bounded recovery, unchanged targets, revoked disclosure and banking
exclusion checks alongside existing dialogue/control regressions. The
[real fault trial](../SOURCE_REFERENCES.md#source-451fdcc02cc6)
uses six actual OpenAI calls and real Doctoralia evidence. After deliberately
replacing one real correction response's goal span with an invalid paraphrase,
one further real capture recovers the same task, revision 2, and a verified
source-backed result. This is injected-fault evidence, not an estimate of the
model's natural error rate; banking effects remain zero. Independent acceptance
and the twenty-conversation candidate qualification remain pending.

The [classification regressions](../SOURCE_REFERENCES.md#source-f3dfff5b3372)
expose the missing typed distinction between facts and agent instructions.
The [affected recheck](../SOURCE_REFERENCES.md#source-7f51c9e563a4)
passes 110 source/update/outcome/recovery/runtime/profile checks. Source facts,
including negative provider facts, and requested browser methods survive;
classified policy/presentation entries do not become website criteria. Their
exact customer provenance remains validated and bank authority is unchanged.
The [real correction](../SOURCE_REFERENCES.md#source-c42e1e0b4176)
passes with five Sol/low calls on the final classifier source, preserving the
same task and revised location. Earlier classifier trials and the
[eight-call product repeat](../SOURCE_REFERENCES.md#source-4e09b48bf1a1)
retain their own hashes. V4 bindings require fresh tasks; no automatic legacy
criteria migration is performed. Model misclassification remains an eval concern,
not a capability inferred from the new schema alone.

The [configured Logitech published-price journey](../SOURCE_REFERENCES.md#source-c237b1ddfe58)
uses normal engine startup and `browser.shopping`, real public pages and seven
Sol/low calls. It verifies and delivers H390, USB connection and the displayed
price with source links, with zero banking effects. Its invocation binds the
dirty feature candidate's exact engine/harness hashes; it is not production or
different-human acceptance. The separate
[Windows-compatibility request](../SOURCE_REFERENCES.md#source-859c51659250)
failed after thirteen calls and remains failed. The
[zero-model specifications diagnosis](../SOURCE_REFERENCES.md#source-881984b87a77)
found no Windows text even after opening the public specifications control and
recorded application bundles denied by the site's robots policy; it does not
establish whether an unrestricted page would expose that information.

The [navigation-denial regression](../SOURCE_REFERENCES.md#source-4078503fea9a)
reproduced page loss on an unqualified navigation. Its
[actual upstream-worker recheck](../SOURCE_REFERENCES.md#source-e57ad201104a)
rejects the proposal with zero dispatched/executed actions and no destination
request, stops the remaining batch, preserves the current page and executes a
later permitted action. The [site-privacy checks](../SOURCE_REFERENCES.md#source-cd9ec6200cd6)
pass with actual Chromium while retaining built-in exclusions. Broader
qualification, current independent reviews and human acceptance remain pending.

The complete affected [configured-worker check](../SOURCE_REFERENCES.md#source-6c4f0738929a)
passes 58 cases, including the full actual upstream-worker module, loading/privacy
and normal registration. The [real Doctoralia correction](../SOURCE_REFERENCES.md#source-a01649ef2813)
changes Polanco to Roma Norte on the same task, retains general medicine, and
verifies the revised source requirements with five Sol/low calls. The
[real product cancellation](../SOURCE_REFERENCES.md#source-4aec50110973)
uses four calls, cancels after a confirmed browser action, disposes the browser
and performs no later inference. These three separate functional trials are
small developer samples; repeated and twenty-conversation qualification remain
pending. Lint, affected typing, generated contracts and the integration guide pass.

The [initial comparison](../SOURCE_REFERENCES.md#source-260943d75c1f)
at `e8cfe95` used real Doctoralia pages and native OpenAI Sol/low with fictional
customer input and synthetic authority. Normal authenticated engine startup
verified the directory request in 15 calls; the direct adapted upstream
`Agent.step()` worker reached a profile in four calls before failing preparation.
One trial per arm cannot establish relative reliability. The direct arm was
DOM-only while the existing engine harness permitted adaptive vision; this is
preliminary diagnostic evidence, not a controlled feature comparison or a test
of unmodified upstream `Agent.run()`.

The subsequent [matched DOM-only comparison](../SOURCE_REFERENCES.md#source-6215d811f0b3)
uses identical browser/model settings and frozen engine hashes at `0cad5c4`.
Normal engine research again verified the directory request in 15 calls. The
direct worker returned an explicitly incomplete answer after twelve navigation
calls. Its passing diagnostic collection is not a factual goal pass. Both failed
and incomplete attempts remain preserved; these samples do not establish rates.

The [generic dialogue regressions](../SOURCE_REFERENCES.md#source-2a46b7e679dc)
reproduce rejected `browser.shopping` source references, scoped goals and
corrections, plus lost original request text. The
[affected API/capture/recovery recheck](../SOURCE_REFERENCES.md#source-b7c909288f71)
passes 101 cases. Original customer text survives a failed execution, current
corrections bind to existing work, and bank goals cannot adopt the free-text
research path. A [deliberate overbroad-boundary fault](../SOURCE_REFERENCES.md#source-ddeb447392da)
was detected by that banking regression; live generic-site qualification is
separate from these controlled-inference checks.

The [loading regressions](../SOURCE_REFERENCES.md#source-c3028363407e)
reproduce an empty-document snapshot failure and whitespace-only evidence.
The [affected recheck](../SOURCE_REFERENCES.md#source-28818a03843b)
passes 112 cases, including actual Chromium rendering from empty to populated
content. Empty observations contain no source passages and never establish
no-match. Independent reviews, different-human acceptance and production
qualification remain pending. This development change affects LR-01/03/05/13,
target ISO 27001 controls 5.34, 8.15, 8.26-8.29 and ISO 42001 A.6.2.

### Twenty original conversations against real websites

The [real-site campaign report](../SOURCE_REFERENCES.md#source-059b62cc9ed9)
records all 20 original scenarios and 120 turns against engine `e6eb4d6`, with
real OpenAI `gpt-6.1-sol`/low and public websites, synthetic tenant/customer/authority
and zero banking effects. Fifteen scenarios obtained real pages; the four
flight/hotel/product conversations failed before browser execution, and OpenTable
robots retrieval timed out. API turns completed 99 times and failed 21 times;
no retained primary research task verified its full goal. Ten tasks were explicitly
cancelled, so these counts are not a scenario pass rate. Doctoralia evidence still
does not establish an in-person general-consultation price at the requested Polanco
address. Correction handling retained some policy/formatting instructions as factual
source requirements, and generic conversations returned `invalid_dialogue_target`.

Separately labelled execution diagnostics obtained Fiesta Inn and Logitech pages
without completing research. Volaris startup exposed empty-observation snapshot
validation and incomplete site/API qualification; no restrictions were bypassed.
The report preserves interrupted attempts and test-context corrections. Its shared
ledger contains 688 model reservations: 684 completed, two failed and two remained
unsettled after interruption. Temporary adapters extend only the local test profile.
The [provenance check](../SOURCE_REFERENCES.md#source-7f00e2b27b31)
confirms all 183 engine source files unchanged. Different-human acceptance and
production approval remain unperformed. The [run metadata](../SOURCE_REFERENCES.md#source-cbac895373a1)
records LR-01/03/04/05/11/12/13, ISO/IEC 27001 controls 5.14, 5.19–5.23, 5.31,
5.34, 8.3, 8.10–8.12, 8.15, 8.24, 8.26, 8.29 and ISO/IEC 42001 controls
A.5.2–A.5.4, A.6.2.2–A.6.2.4, A.6.2.7–A.6.2.8, A.7–A.9; real-user
legal/privacy/provider qualification remains pending.

### Browser loading phases and source-strict completion

The v3 privacy candidate passes the
[real-OpenAI synthetic profile/calendar journey](../SOURCE_REFERENCES.md#source-7574b4179bd4)
with 13 Sol/low calls, actual worker replacement, verified source criteria,
zero extra replay calls and no forbidden fixture effects. Before every provider
call, the harness rejects synthetic patient sentinels and protected-page images.
Two [actual Browser Use DOM/vision checks](../SOURCE_REFERENCES.md#source-95518cf9cc3f)
pass; the [red check](../SOURCE_REFERENCES.md#source-c2d1dfd8acfb)
demonstrates the earlier featured-testimonial/question leak. The initial vision
fixture lacked screenshot permission and failed before browser startup; its
correction grants permission only to that synthetic tenant fixture.
The [fast profile](../SOURCE_REFERENCES.md#source-26428f897285)
passes 2,274 tests. Its earlier [prompt recheck](../SOURCE_REFERENCES.md#source-455e237be520)
retains one failed wording assertion; explicit read-only wording was restored.
Primary and cross-model reviews cleared exact engine candidate `361f122` with no
unresolved code findings. Their independent deterministic v3 checks each passed
19 cases; these reviews do not replace human acceptance or privacy disposition.
Lint, formatting, typing, generated contracts and integration-guide checks pass.
The [v3 package check](../SOURCE_REFERENCES.md#source-3f3420df7366)
matches all 183 engine files to the wheel, with no extras or untracked/unsafe source
archive members. Earlier source archives included ignored output/coordination
artifacts; explicit exclusions now prevent that, without modifying the user's HTML.
The [first full-profile attempt](../SOURCE_REFERENCES.md#source-807a9329f507)
was interrupted by a daemon restart after 61 case records; it is not a pass.
The [complete rerun](../SOURCE_REFERENCES.md#source-ea6c23b628c1)
passed all 509 cases against `361f122`, with actual Chromium/upstream Browser Use,
PostgreSQL and Temporal boundaries. Its source digest matches the 2,274-case fast
campaign. All 183 engine source hashes still match the paid synthetic journey and
the built wheel. A final documentation-only commit records these results over
that frozen engine candidate; independent human acceptance remains unperformed.

Independent review found public third-party testimonial and health-question
content retained outside the initial review exclusion. Further real-site paid
trials and publication were stopped on discovery. The v3 policy excludes the
observed featured/main review and question/schema containers, withholds images
on protected pages and rejects v1/v2 cached task bindings. These exclusions are
layout-qualified, not a classifier for arbitrary web content. A
[content-free event record](../SOURCE_REFERENCES.md#source-2559fa8b5d93)
preserves evidence hashes; historical provider-disclosure scope and human
privacy/incident disposition remain open. No real-tenant activation is approved.

Before v3, the [final real-site directory journey](../SOURCE_REFERENCES.md#source-f5b338b374b1)
passed all source criteria with 26 calls, actual worker replacement and no extra
replay calls. The [cancellation check](../SOURCE_REFERENCES.md#source-41d501e55d60)
used three calls, disposed its browser and made no inference after cancellation.
Both used this engine's authenticated API, real public sources and synthetic
tenant/customer/authority, with zero banking effects. Their pre-v3 privacy scope
does not qualify the later capture policy.

The latest laptop candidate retains upstream Browser Use 0.13.14. A
[real-site Temporal journey](../SOURCE_REFERENCES.md#source-5ffccbf665d8)
completed through this engine's authenticated API with real Doctoralia sources,
synthetic tenant/customer/authority and 26 real Sol/low calls. It verified all six
requested provider/location/source criteria, replaced the worker, replayed with
zero additional calls and produced zero banking effects. Its source hashes bind
the phase-budget fix before the later provider-review exclusion.

The earlier 64-increment workflow ceiling incorrectly expired phased browser
work before its actual deadline. New public schedules permit at most 512 engine
increments while preserving inference, action, assessment and deadline limits.
The [actual Temporal checks](../SOURCE_REFERENCES.md#source-5159edf4dbf8)
passed six cases, including native/Graph completion beyond 64, legacy defaults,
native clamping and replay. Twelve [workflow checks](../SOURCE_REFERENCES.md#source-1daeb67ded80)
also passed, including deterministic Graph clamping. An actual
[pre-change history](../SOURCE_REFERENCES.md#source-a01fd42e406b)
replayed successfully. Mixed old/new workers are not qualified: update all queue
workers before enabling the matching dispatcher, as documented in setup.

A patient-review sentinel entered model input in the
[red regression](../SOURCE_REFERENCES.md#source-2a61eec90db6).
The initial provider-only policy excluded the qualified profile-review section from
both Browser Use capture and retained evidence; the
[actual-browser recheck](../SOURCE_REFERENCES.md#source-7bb7cc7a7a70)
passes. The [binding check](../SOURCE_REFERENCES.md#source-327c51dd586e)
rejects pre-policy task bindings before browser/model work; 85
[runtime/evidence/storage checks](../SOURCE_REFERENCES.md#source-0cbc198371f9)
passed separately. The final profile attempt initially encountered a Windows
shared-temp permission error before inference; its fresh-workspace successor is
recorded separately. Different-human acceptance and production approval remain
unperformed. The laptop is a development backend; VM/account isolation,
operational monitoring/rollout and real-tenant legal qualification remain pending.

The [final profile trial](../SOURCE_REFERENCES.md#source-3cb7f131261d)
failed after 23 real calls and 24 actions: replacement/replay passed, but the
requested address, price and same-location association remained unverified.
It retained partial observations and zero banking effects. Navigation guidance
was then clarified to prefer relevant observed links, stage listing/profile
investigation and verify location/service/price together without changing limits
or source criteria. The failed trial remains evidence against general reliability.
The [unchanged-bounds retry](../SOURCE_REFERENCES.md#source-7fa28cbb8daf)
also failed after 27 real calls: it reached public profiles but did not verify
the complete address/service/price association. Worker replacement and replay
with zero added calls passed again; no banking effect occurred. The guidance
change does not qualify the full real-profile journey or establish production
readiness.
Independent diagnosis found all seven pages and 28 passages still available to
assessment, with no demonstrated catalogue or attribution rejection. One profile
published prices for other services/home visits; another lacked an explicit
Polanco address association. These do not establish the requested office price.
Three assessments repeated one partially verified candidate. Candidate follow-through
and retry-feedback quality remain open; relaxing source checks would hide the gap.

Historical observations and remediation follow; their original source hashes
and configuration define their scope.

Engine revision `2420bae` separates each robots origin, Chromium launch,
navigation and initial source capture into bounded owner calls. Startup yields
retain ownership and spend no inference/action/recovery allowance. A pending
post-action question survives replacement startup without consuming recovery.
Public observation supplies bounded visible links as untrusted navigation hints;
upstream Browser Use still owns navigation. Service `done`
without a source quote permits only two continuations within retained budgets.

Historical checks before source-attribution remediation: the [fast profile](../SOURCE_REFERENCES.md#source-6f4f79fa89a8)
passed 2,244 cases; the
[public/browser/recovery profile](../SOURCE_REFERENCES.md#source-038520e69626)
passed 472. The [package check](../SOURCE_REFERENCES.md#source-3b54e3e84d5f)
matches all 183 engine source files and finds no runtime or `.env` files in the
source distribution. Typing, lint/format, generated contracts and integration
guide checks passed. Initial reviews missed a blocking identity regression:
goal-ranked links could omit a same-name provider and lend its calendar to another
candidate. Later probes also demonstrated the pre-existing truncated-link and
page-cap variants, plus premature name recertification after a fresh snapshot.
Remediation separates transient navigation hints from stable source links,
requires complete identity provenance, preserves whole named witness closures
and persists graph loss across replacement. Legacy downgrades retain exact
same-page facts and reject fabricated IDs/quotes; loss of any reference makes
the whole finding unknown. Primary/cross-model working-tree rechecks reject the
attacks; exact-revision and affected functional qualification follow separately.
Different-human acceptance remains unperformed. Earlier successful journeys below
retain their original source hashes and do not qualify this changed attribution.

Real OpenAI [Luna](../SOURCE_REFERENCES.md#source-39bfa8471335)
and [Sol/low](../SOURCE_REFERENCES.md#source-38839c0714bd)
synthetic-service journeys each passed with four calls and one approved fixture
effect. The [premature-completion trial](../SOURCE_REFERENCES.md#source-51b6f1fd7238)
also obtained a verified quote and one approved fixture effect after an injected
unsupported `done`; no real provider effect occurred. Its earlier 16-step harness
limit ended a still-preparing task and remains preserved in the sibling run.
Two deliberate guard faults were detected immediately. A third initially survived
by consuming an unnecessary recovery; strengthened assertions detect it in the
[pending-startup recheck](../SOURCE_REFERENCES.md#source-c3b15fb38e34),
with the [intact checks](../SOURCE_REFERENCES.md#source-65041ac48a7a)
passing separately.

The real-site [directory](../SOURCE_REFERENCES.md#source-2eb432ba2bc5)
and [profile/address/price](../SOURCE_REFERENCES.md#source-92cf1b7afe6c)
journeys passed through normal authenticated startup with Sol/low using 15 and
14 calls. Both use real Doctoralia pages and synthetic tenant/authority/customer
contexts, with zero banking effects. The
[real-site cancellation](../SOURCE_REFERENCES.md#source-c650a6f6d76e)
used three real calls, confirmed browser disposal and made no inference after
the committed stop. Its control harness waits for source capture across loading
phases rather than assuming two increments. The
[synthetic profile/calendar](../SOURCE_REFERENCES.md#source-3d890e5cba5a)
trial passed its independent source, delivered-answer and lifecycle oracles.
The [real-OpenAI Temporal trial](../SOURCE_REFERENCES.md#source-075cdd24d432)
also verified that source after worker replacement, retained an interrupted paid
attempt and replayed with zero extra calls. Its foreground intent is controlled;
navigation, assessment and presentation use real OpenAI. This loopback source
policy is not real-site robots/egress qualification.

Failures remain visible: earlier public trials did not satisfy the request;
the [source-strict real-site restart](../SOURCE_REFERENCES.md#source-af72727458ec)
replaced workers and replayed without extra calls but lacked Polanco evidence.
The [24-step navigation trial](../SOURCE_REFERENCES.md#source-2f00d08be2f5)
paused for authorization when its five-minute fixture session expired; its later
harness timeout is not a completed research journey. Qualification now records
interactive pauses and uses the unchanged verifier's bounded fixture lifetime.
The two earlier real-site Temporal runs replaced workers/replayed but failed functional
outcomes, including [upstream preparation failures](../SOURCE_REFERENCES.md#source-5f20b2150c4e).
The first profile run ended while still running under its old 60-step harness
limit. A passing successor does not establish general reliability. The laptop
backend remains development-only: broader real-site reliability, isolated
runtime/account qualification, operational rollout/alert evidence, independent
human acceptance and production/legal approval remain open. Applicable entries
include LR-01/03/05/13; target controls include ISO 27001 5.34, 8.15, 8.26–8.29
and ISO 42001 A.6.2. No real-user route or production activation is approved.

### Browser Use startup foundation through `94bf5a2`

The follow-up development increment adds bounded same-turn capture recovery,
typed output fields and recoverable robots-denied reads. The
[directory correction](../SOURCE_REFERENCES.md#source-289b9276df15)
applied Roma Norte after an injected rejection of a real OpenAI response and
verified a matching real public listing; the
[cancellation journey](../SOURCE_REFERENCES.md#source-b3c41df12fe8)
closed its browser with no later inference or banking effects. The harder
[profile correction](../SOURCE_REFERENCES.md#source-f4a62846b2cb)
still failed after provider errors and a browser timeout. These are separate
outcomes, not a general reliability qualification. A subsequent presentation fix
localizes typed labels and bounds source excerpts while retaining complete links
and full evidence. The
[broad fast recheck](../SOURCE_REFERENCES.md#source-eedfa954e925)
passed 2,216 cases before that presentation-only change. Prior failures remain in
the sibling artifacts. New typed matching outputs avoid stale embedded filters;
untyped legacy fields retain their literal meaning, including compound qualifiers.
Independent reviews rejected an unsafe automatic legacy migration and an
unrelated-draft cancellation path; both were removed. Exact-commit review and
final combined checks remain separately recorded in the conversation. Laptop
public testing continues; VM/real-account and production qualification are pending.

The startup phase split separates worker initialization, model input, action and
fresh-source observation under the existing owner timeout. Its
[control and interrupted-write regressions](../SOURCE_REFERENCES.md#source-a6feb9b2cf01)
passed 18 checks, including owner replacement and stale-generation denial.
The initial [real profile trial](../SOURCE_REFERENCES.md#source-22b1aff528b4)
completed 35 browser operations, the longest 22.031 seconds, but failed after
repeated native model truncations. A separate
[synthetic calendar trial](../SOURCE_REFERENCES.md#source-9b3dcd66290f)
failed its task-success oracle: the model stopped before following available
profile links. Its passing evidence/effect checks are not a successful journey.
Subsequent continuation and generation hardening retains these failures; this
increment does not establish general navigation or production reliability.

The [full startup profile](../SOURCE_REFERENCES.md#source-98d705cd8479)
completed with 439 passes and four older service-startup timeouts. Service
preparation now yields across the HTTP boundary, separates cold worker import
from browser connection and refreshes inference/dispatch leases. The
[focused recheck](../SOURCE_REFERENCES.md#source-f3bc5f96944f)
passed 19 accounting, control, owner-loss and actual Browser Use/HTTP cases.
[An earlier recheck](../SOURCE_REFERENCES.md#source-8e6bacc9f30d)
retains three failures; Windows sleep interrupted that run for about 87 minutes.
Successful focused checks do not replace the complete profile or paid journeys.
The final [fast selection](../SOURCE_REFERENCES.md#source-20a77074788b)
passed 2,232 cases in 168.18 seconds with an explicit 600-second campaign bound.
The [complete public profile](../SOURCE_REFERENCES.md#source-350efbbc368e)
passed 456 cases in 753.39 seconds with an explicit 1,800-second bound, including
actual Browser Use and controlled-inference Temporal recovery checks. The
[package check](../SOURCE_REFERENCES.md#source-69e38c522d1f)
found all 183 engine source files byte-identical to the wheel, with no extras.
Two [authenticated service checks](../SOURCE_REFERENCES.md#source-f82c375b74f5)
also passed, covering approved synthetic execution/replay and browser ownership.
That checkpoint's [synthetic-service OpenAI trial](../SOURCE_REFERENCES.md#source-38b9ebd32fcf)
failed after a model `done` response without a verified quote. The latest
[normal-runtime public trial](../SOURCE_REFERENCES.md#source-c92e48a7ac60)
failed during initial observation before producing source pages, after two
bounded recoveries. These failures motivated the loading/continuation increment
above; its evidence does not establish production reliability.

Commit `9d15b81` over `c70f479` registers tenant/client-bound
public Browser Use tasks from trusted configuration in the ordinary API and worker.
The former demonstration import is a compatibility shim over packaged engine code.
No special message prefix or launcher registration is needed on this path.
[The real-site observation](../SOURCE_REFERENCES.md#source-966ceaa047eb)
records an ordinary authenticated engine turn, actual OpenAI `gpt-6-luna` and
Chromium/Browser Use reading Doctoralia with a synthetic tenant, authority and
fictional customer. Six calls and three actions produced a source-backed name,
specialty and Polanco service location, with no banking effects. This is one
successful directory journey, not schedule, connected-account or reliability
qualification. Two earlier harness failures remain in the sibling JUnit reports:
incorrect StepResult serialization, then Windows Unicode report writing. The latter
left an empty report; its missing detailed evidence is not reconstructed as a pass.
Atomic UTF-8 reporting now has a regression check.

[Targeted checks](../SOURCE_REFERENCES.md#source-07656d82251e) passed 170
cases covering normal registration/persistence, tenant/client/real-data denial,
account-state rejection, policy, corrections, recovery and actual upstream browser
regressions. Ruff, full-src mypy (182 files), contract/guide checks and wheel/source
comparison passed; the [package check](../SOURCE_REFERENCES.md#source-d1ea4e50dd1a)
has no source mismatches. The broad fast run has its own
[profile record](../SOURCE_REFERENCES.md#source-d493d6ceeccd): 2,204 passed,
1,019 infrastructure/paid cases deselected, no skips; 185.78 seconds of pytest
execution using an explicit 600-second campaign deadline. This completes that
selection without claiming it meets the old default 180-second campaign deadline.
Independent primary and cross-model reviews of `9d15b81` found P2 shutdown cleanup
starvation after uncertain public teardown; cross-model review additionally found
that catalogue-wide service delegates incorrectly blocked disjoint public routes.
Remediation uses independent cleanup callbacks and actual tenant/provider overlap
checks with caller-scoped service/public dispatch and descriptions. Dedicated
fault/dispatch/identity/service regression evidence (50 passed) is in
[the remediation suite](../SOURCE_REFERENCES.md#source-802304ca3175).
Primary recheck of `a56d20a` passed 121 deterministic cases; independent cross-model
recheck passed 18 deterministic cases plus fault/dispatch checks. Both closed
their P2 findings with no new blocking runtime findings; see
[primary evidence](../SOURCE_REFERENCES.md#source-bbea3a2cb854) and
[cross-model evidence](../SOURCE_REFERENCES.md#source-30767e6fc343).
Simultaneous cleanup failures may expose only the last exception; every cleanup
callback is still attempted. These rechecks do not establish research quality or
Temporal/production qualification. Different-human
testing was explicitly waived by the user and remains unperformed; isolated
real-account backend and production approval remain pending.

The subsequent [profile journey](../SOURCE_REFERENCES.md#source-37d702a88d8c)
opened a real profile but did not verify its requested address/price; essential
Docplanner scripts/styles were blocked. A [directory repetition](../SOURCE_REFERENCES.md#source-1353f251e89c)
failed source assessment. These failed observations remain open browser-quality
work, not additional passes. The cleanup regression run also exposed two existing
background-capacity HTTP status failures; an isolated `c70f479` reproduction in
[baseline evidence](../SOURCE_REFERENCES.md#source-eda0799f40fb)
fails those same assertions. Failure presentation now preserves the original typed
error when optional personalization is absent/unavailable; the
[three focused regressions](../SOURCE_REFERENCES.md#source-1f93acffdc05)
pass. Earlier failed/interrupted broader runs remain retained; no complete
banking/background-regression pass is inferred from these focused fixes.

### Incremental browser requirements and no-result delivery

The [reliability report](../SOURCE_REFERENCES.md#source-2aaaf55328bb)
and [source-bound evidence](../SOURCE_REFERENCES.md#source-d51b3b097984)
record an uncommitted candidate on `fix/browser-task-reliability` over `a9fcba2`.
Corrections retain omitted accepted criteria and apply grounded additions/removals
atomically. Trusted current completed-empty search evidence survives unrelated
failed navigation. Unassessed delivery bounds excerpts and complete source links.
The final targeted suite passed 129 cases; lint, formatting, typing, contract drift
and packaging passed. Two deliberate requirement-control faults were detected.
The broad fast profile hit its fixed 180-second deadline and remains incomplete.

Native OpenAI `gpt-6-luna` trials use authenticated engine HTTP, PostgreSQL and
Chromium with synthetic tenant/authority/customer/source data. The first three
outcome cases delivered complete answers; final-source repetitions delivered one
of two. Both no-result trials completed correctly. Active correction retained
the revised constraints in both trials, but the repeat stopped before acquiring
schedule evidence. The dynamic-filter trial succeeded once. The six-turn
conversation returned six nonempty replies but encountered `internal_error` and
`provider_truncated`, lost a budget update before capture, and ended with an
unverified goal. A lexical price-criterion false negative is preserved alongside
the actual retained criterion. These small samples do not establish reliability;
separate review, different-human acceptance, real-site qualification and production
approval remain pending. No publication or deployment occurred.

### Browser implementation candidate and incomplete repeated evaluation

The [implementation report](../SOURCE_REFERENCES.md#source-272d95480f96)
and [machine-readable evidence](../SOURCE_REFERENCES.md#source-33de578f3686)
record the uncommitted candidate on `feat/conversation-browser-continuity`, based
on `e8f040f1`. Per-campaign manifests and the
[final source archive](../SOURCE_REFERENCES.md#source-b624e1212b65)
distinguish the tested revisions. Tests use this engine's authenticated HTTP API,
isolated PostgreSQL, Chromium and real OpenAI `gpt-6-luna`, with synthetic tenants,
authority, customer requests and source fixtures. The separate Doctoralia probe
uses public reads and does not establish real-site functional qualification.

The targeted comparison has four trials per arm. Adaptive DOM/vision verified
three goals and delivered three complete answers; DOM batching verified and
delivered two. The full vision/planning/thinking/search/direct-open arm verified
none of its three fully recorded trials and delivered one complete answer; its
fourth trial lost the result during cleanup. A known requirement-oracle false
negative remains documented beside the original score. These small samples
support only a provisional adaptive default in the opt-in demo.

The requested twenty-scenario, six-turn, two-repeat campaign stopped on provider
errors after 136 of 240 turns: 21 scenario runs completed, one had a cleanup
failure and two stopped partway through. This is incomplete coverage, not a
comparable replacement score for the earlier real-directory conversations.
Blank failed-turn replies, unknown interrupted-call completion and unsuccessful
research remain visible. Subsequent local fixes add a nonempty authorized failure
answer and retryable cleanup with preserved diagnostics; the failed paid campaign
does not validate those later fixes. Local regression and source/type/contract/
packaging evidence are linked in the report, with failed attempts retained.

Different-human acceptance, a completed repeated live evaluation, real-site
functional qualification and current-root abrupt-owner-death cleanup evidence
remain pending. New origins and real-tenant disclosure remain disabled. Affected
scope: LR-01–05, LR-12/13; ISO/IEC 27001 access, supplier, logging and development
verification controls; ISO/IEC 42001 A.5, A.6.2 and A.7–A.10. This is developer
evidence, not legal approval, certification or production approval.

### Browser outcome, evidence and feature experiments

The [outcome report](../SOURCE_REFERENCES.md#source-6b4cb8fd6932) records
34 developer scenarios through authenticated engine HTTP, real PostgreSQL and
Chromium, and native OpenAI `gpt-6-luna` calls. The tenant, authority, directory
and patient requests are synthetic. The branch remains
`feat/conversation-browser-continuity` over `e8f040f1`; frozen source archives and
per-case hashes distinguish each uncommitted candidate. No source changed during
any measured case. These scenarios do not qualify live Doctoralia or other sites.

The source-frozen Matrix-01 comparison has eight search cases per arm, with
cancellation measured separately. The corrected, independently rerun fixture
oracle found complete source facts in 6/8 DOM/single-action cases and 7/8
vision/planning/thinking/search/direct-open/batch-five cases. Complete delivered
answers were 4/8 in both arms; runtime completion was 3/8 versus 6/8 and runtime
goal verification 3/8 versus 5/8. Original scores remain alongside rescored
results: timestamp, alternative-provider, bilingual recap and criterion rules
were corrected, not silently overwritten. The lexical answer oracle is not a
general language-quality or independent-human acceptance measure.

Both active correction cases retained the task/browser context and found facts
for revision 2. Both cancellation controls reached `cancelled` with zero actions
after cancellation, but the customer did not receive a separate terminal
confirmation. Increasing the dynamic-filter navigation allowance from six to
twelve calls let DOM batching complete in eight calls in two runs. Planning-only
and thinking-only each also completed in eight calls; page-search-only completed
without using its page-search tools. Vision/full-feature cases sometimes collected
all facts yet failed assessment. These small, unbalanced follow-ups do not select
a winning default or establish value on vision-essential pages.

Retained failures identify exact-quote abbreviation, a legitimate
directory-to-profile-to-schedule chain rejected by one-hop association, an
advertised external-search action denied by destination policy, blank follow-ups,
and facts delivered while task verification remained failed. Repeated assessment
without actionable error feedback, public `profile` path false positives,
third-party dependency health, cross-process dispatch fencing and real-site
qualification remain open. The candidate adds source-bound goal assessment,
independent feature switches, broader qualified public discovery, continuation
and recovery handling, and assessed-evidence delivery; it is not accepted.

The [call audit](../SOURCE_REFERENCES.md#source-c5dcad1e57bd)
reconciles 381 reserved requests: 375 successful provider responses observed
(including two locally injected post-response failures), one recorded provider
failure and five interrupted waits with unknown completion/billing. Reported
usage is 2,151,884 tokens, excluding any unavailable usage. No fixture effect
attempt occurred; bank-call counters are zero in 33 cases and missing in the
first failed canary. Cancellation-accounting checks cover the subsequent harness
repair without changing the original ledger or claiming another paid run.

The [verification record](../SOURCE_REFERENCES.md#source-28985c75c20c)
links the final 2,079-pass fast and 253-pass public-research profiles, source/type/
format/generated-artifact checks, package inspection and three detected deliberate
control faults (action budget, image disclosure and sensitive arguments). These overlapping
developer checks do not replace different-human acceptance. A final representative
PayMe conversation rerun, real-site/dependency qualification and production
approval remain pending. New origins and real-tenant disclosure remain disabled;
no publication or deployment occurred. Applicable legal/control scope remains
LR-01/02/03/04/05/12/13, ISO/IEC 27001 controls 5.15–5.23, 5.34, 8.3, 8.5,
8.10–8.12, 8.15, 8.20–8.24, 8.26, 8.28–8.29, and ISO/IEC 42001 controls
A.5, A.6.2, A.7–A.10; LR-15 applies before cardholder processing.

### Browser discovery and upstream feature experiments

The [experiment report](../SOURCE_REFERENCES.md#source-7542de1d7844)
records 157 actual native OpenAI calls (154 completed, three truncated) on
`feat/conversation-browser-continuity` over `e8f040f1`. Every case retains its exact
source/test hashes; changed candidates and unsuccessful attempts are separate.
These are synthetic tenant/authority developer measurements, not independent
acceptance, production qualification or a representative browser benchmark.

Two fictional directory tasks, each repeated twice, verified the requested
provider/profile facts and published slot in 0/4 restricted-policy runs, 3/4
flexible-discovery runs and 2/4 upstream-profile runs. Complete follow-up answers
with name, price and slot were 0/4, 2/4 and 2/4 respectively. The upstream arm
enabled planning, thinking, vision, page search/find, direct URL opening and up
to five actions per step; it made 17 image-bearing browser calls and three
multi-action proposals. The deterministic Chromium check also executed two
actions in one step. Merely finding `plan_update` in a schema does not establish
planning use; the pinned upstream schema includes that field for both profiles.

A subsequent completion-instruction experiment found all required facts in one
of two additional Polanco runs, but that task exhausted its budget before a
successful terminal status. The other still stopped before checking a published
time. All three real Doctoralia probes remained incomplete. Their network traces
show blocked `platform.docplanner.com` dependencies; the final probe entered the
location and clicked search without changing the directory. Causation is not yet
isolated. New dependency origins remain disabled pending source/legal qualification.

The initial live control probe reproduced duplicate goal revisions and rejection
of cancellation plus recap. After targeted fixes, the confirmation held an
identical correction at revision 2 with an `unchanged` receipt despite different
model-selected spans, answered progress plus recap, and accepted cancellation
plus recap before cleanup reached `cancelled`. No forbidden fixture effect or
bank effect occurred. See the [verification record](../SOURCE_REFERENCES.md#source-a269f1e0132d)
for developer checks, retained failures and review scope. General outcome
verification, mixed-goal correction scoping, cross-process dispatch fencing and
different-human acceptance remain open. No publication or deployment occurred.

### Follow-up PayMe conversation and Browser Use evaluation

The [follow-up report](../SOURCE_REFERENCES.md#source-e1bc043595a3)
records the same twenty six-turn scenario definitions with real OpenAI calls on
the local fictional-input PayMe fixture. The working tree over `e8f040f1` is
identified by its [frozen manifest](../SOURCE_REFERENCES.md#source-f03b58892ccb).
It processed 102/120 turns successfully, versus 113/120 in the prior confirmation.
Recovery/reference failures, wrong-capability routing, incomplete current-question
answers and operational concurrency failures remain. This candidate is not accepted.

Upstream Browser Use 0.13.14 was retained. Twelve research tasks ended: seven failed
and five cancelled. One customer reply delivered selected source passages; no
verified matching shortlist was delivered. A second observed neighborhood URL did
not match the requested area. Unavailable integration cases do not establish native
vendor execution quality. The [verification record](../SOURCE_REFERENCES.md#source-e622d135ade6)
attributes 1,963 fast checks, 116 public-research cases before a user-requested
pause plus five resumed cases, three detected control mutations and remaining
review/acceptance gaps. Limits were restored to 100 without resetting usage;
original PayMe configuration content/draft and PayMe2 isolation were checked.
Operational reconciliation is retained separately from the 120 measured turns.

### Multi-turn PayMe conversation and Browser Use candidate

The [local confirmation report](../SOURCE_REFERENCES.md#source-d0cf727ab66b)
records twenty six-turn conversations with actual OpenAI calls on PayMe's local
fictional-input fixture. These are ignored local artifacts, with the tested
working tree over `e8f040f1` identified by its [frozen source manifest](../SOURCE_REFERENCES.md#source-5edb734d1abb).
The final run processed 113/120 turns successfully, versus 93/120 originally
and 117/120 in the earlier candidate. Seven final errors comprise four revision
conflicts, one invalid task question and two truncated model responses. Source
and task continuity improved in specific correction/cancellation cases, but
repeated questions, irrelevant capabilities and status-only answers remain.

Upstream Browser Use remains pinned at 0.13.14. All thirteen research tasks
retained the same general-directory URL; these transcripts did not deliver useful
matching shortlists. Only the existing real public Doctoralia destination was
enabled. Other scenarios exercised unavailable-capability handling, not actual
native vendor execution. Appointment verification, contacts and bookings remain
outside this experiment's scope.

The final fixed-deadline fast profile passed 1,952 cases; the public research
profile passed 93, including real Chromium and Native Temporal restart/replay.
The [verification record](../SOURCE_REFERENCES.md#source-4efa5933e817)
attributes additional control regressions, mutations and retained failures.
Both temporary limits were restored to 100 without resetting usage; PayMe's
original configuration content and draft were restored and PayMe2 was unchanged.
No code publication, merge or deployment occurred. Separate-session primary and
cross-model reviews, different-human acceptance and production qualification
remain pending; this candidate is not accepted as complete.

### PayMe public Doctoralia experiment

The [public-browser experiment](../SOURCE_REFERENCES.md#source-0a813b3f41c8)
records the opt-in local fixture handler, real Doctoralia pages and actual OpenAI
inference, with final runtime `b26b652`. PayMe's configuration version 3 enables
the test; PayMe2 is unchanged. The saved PayMe conversation contains two partial
directory observations and a final failed turn. Seven completed `gpt-6-luna`
responses were recorded, including four Browser Use calls. The final trial
returned `request_timeout` after 94.33 seconds. **The Polanco appointment search
and tomorrow-morning availability were not verified.** No patient submission,
contact, login or booking was authorized or performed.

At that runtime, the fast gate passed 1,937 cases in 142.75 seconds, the public
harness checks passed 36 cases including real Chromium, and three upstream/browser
regressions passed. An associated-label privacy gap was reproduced in both model
and saved-source paths before correction; both regressions now pass. Four earlier
critical-control mutations were detected. Primary and independent cross-model
static reviews cleared the corrected runtime for this bounded experiment.
Saved-chat visibility, foreign-tenant denial, unchanged PayMe2 configuration,
terminal replay without inference and browser cleanup were checked through actual
local boundaries. Generated contracts/guide, lint and strict types passed.

Earlier blocked trials, stale generated-schema failure and browser-cache setup
failure remain attributed in the report. Long browser discovery still needs
durable background execution and retained partial observations rather than a
foreground console deadline. Real-user/legal/runtime qualification, successful
appointment discovery and independent human acceptance remain pending. This
experiment does not qualify general Doctoralia execution or production use.

### Current upstream Browser Use Agent

The [full-agent verification report](../SOURCE_REFERENCES.md#source-077f2accb301)
and [native OpenAI engine observations](../SOURCE_REFERENCES.md#source-5a3d295664f6)
identify reviewed runtime `574112b`. The pinned library owns navigation through
upstream Agent, BrowserSession and Tools; the old DOM-only adapter is removed.
The final engine-HTTP journey passed with four actual `gpt-6-luna` calls, one
approved synthetic effect, replay without another call/effect and cross-member
denial. No real account/provider/funding route was enabled.

The fixed 180-second fast gate passed 1,902 cases at `9d17014`; the later optional
worker argument guard passed its actual-browser and native-model checks.
The report attributes 118 earlier affected regressions, subsequent privacy,
clarification/automatic-handback and final argument cases to their actual
revisions rather than summing overlapping counts. Five critical control faults
were detected across the recorded mutations. Both independent static AI reviews
cleared `574112b`; type/lint/generated-artifact, dependency audit and packaging
checks passed. The 106-package environment has zero known advisory records.

Failed schema attempts, a corrected WebSocket callback deadlock, a model-question
pause and an interrupted fast run remain recorded. A concurrent cold-start
argument run timed out; its unchanged serial recheck passed all four cases.
The cause is unproven and concurrent-start capacity qualification remains open.
Different-human acceptance, real-site/account and VM/egress qualification,
counsel prerequisites and production approval remain pending. These development
checks are not product acceptance or production authorization.

### Historical DOM-only adapter (superseded)

The following retains the earlier implementation's observations; it does not
qualify the current upstream Agent worker.

The [Browser Use verification manifest](../SOURCE_REFERENCES.md#source-98d7e59d6fe1)
and [case-level native OpenAI observations](../SOURCE_REFERENCES.md#source-5eddd45c3bc9)
record runtime `71df562`, integrated into local `dev` at `5fc766e`, plus exact
test/lock/source fingerprints. The opt-in offline serializer supplies temporary
control references; engine authority, egress, budgets, takeover, protected
submission and reconciliation remain in force. Non-synthetic Browser Use routes
are rejected before backend/account resolution. This is not upstream full-agent,
VM, real-provider/account/funding or native consumer qualification.

Twenty-five actual-helper/Chromium and contract cases passed; the later bounded
diagnostic-read regression passed with the native adapter suite (85 checks,
overlapping counts). The final development engine-HTTP journey used four actual
`gpt-6-luna` calls with the patched helper, one synthetic provider effect and zero
real effects; recovery, protected takeover, source quote, replay without another
call/effect and cross-member denial passed. Two other live attempts stopped on
`provider_truncated`, with no effect; their root cause remains unproven. A prior
successful journey retains its earlier source attribution. No inference budget,
assertion or timeout was relaxed.

The first fast profile passed 1,905 cases. Later fixed-deadline profiles were
interrupted; the stable `dev` attempt passed 1,901 of 1,907 selected cases before
its 180-second bound, and the six unreached cases passed separately. This is not
a passing final full-profile gate. The broader selected browser/database run had
90 passes and two failures: a new test's invalid Playwright method was corrected
and rechecked; an existing configured-driver lost-response checkout reported
unconfirmed teardown, then passed in isolation. Its failure remains retained,
without weakening lifecycle ownership or claiming a clean broad rerun.

Independent primary/cross-model reviews reproduced private checkout-binding,
shadow-root, associated-label and changed-link defects; fixes passed their
actual Chromium/helper rechecks with no remaining actionable findings. Six
deliberate control faults were detected by the mutation runner; an independent
actual-helper probe detected the separately strengthened direct-root guard fault.
An earlier surviving test case, ambiguous mutation anchor and timed-out campaign
remain incomplete evidence. Helper dependency audit initially found 71 advisory
records across four upstream-pinned packages; the patched 106-package environment
reported zero known vulnerabilities. All 170 source modules passed type checks;
affected lint/format, generated contracts and guide checks passed. Artifact
checks verify all 178 package files and exclude local runtime content from the
source distribution. Human acceptance, a passing final fixed-deadline profile,
real driver artifact/isolation qualification and production/legal approval remain
separate; nothing was published or deployed.

### Other retained capability evidence

The [native background adoption report](../SOURCE_REFERENCES.md#source-6dfe54563117)
records the opt-in native activity path, distinct workflow queues/types and
bidirectional drain/rollback checks. It identifies the exact revisions for the
1,885-case fast run, six controlled process checks and 87 final affected/domain
checks, plus detected drain, payload-leak and missing-revision faults. Existing
legacy/native balance recovery, native mission/watch recovery and 128-step
continue-as-new replay use synthetic sources. No new paid calls were made.
LangGraph remains the default and stays available for old histories and other
engine flows; Deep Agents remains deferred. Both automated source reviews have
no remaining findings; independent human acceptance, CI and production approval
remain pending. The main checkout and local `dev` were not changed.

The [browser lifecycle foundation report](../SOURCE_REFERENCES.md#source-48b20e4d43ce)
records local branch `feat/browser-session-foundations`, base `cfd3184` plus exact
working-tree source hashes. Final developer checks passed 139 browser/vault cases,
99 top-level Go authority cases with the race detector, and four process/Temporal
recovery cases. The final native OpenAI journey passed with five calls, one
synthetic provider effect and no real effect; earlier failed and successful runs
remain recorded. Counts across suites overlap.

This increment adds browser generations, bounded preparation recovery, confirmed
teardown ownership, an execution-environment port, browser artifact evidence and
an encrypted authority-owned synthetic connection lifecycle. The local backend
rejects real routes before reading account state. It provisions no VM and grants
no real-site/account/funding qualification. Separate primary and cross-model agent
reviews found four lifecycle defects; their fixes passed both reviewers' static
rechecks with no open actionable findings. A different human tester and production
acceptance remain pending. The live model check exercises change/cancel control
availability; deterministic and process checks separately exercise those actions.

The [WhatsApp UX manifest](../SOURCE_REFERENCES.md#source-e8df1e376fbc)
also records the interactive enrollment profile at engine feature `db8ad04`
and PayMe API `3f22dbc`, with exact source hashes. PayMe owns the captured signed
webhook, encrypted Flow, OTP/PIN and native account creation; verified turns use
the actual engine and OpenAI. Forty administration PostgreSQL cases, five
console frame-policy cases and six live HTTP shell checks passed. API **520/520**
belongs to the pre-contract snapshot `3a240fb`; final API changes passed **7/7**
focused cases plus typecheck/build. Independent primary/cross-model reports
retain their own scopes and earlier failed observations.

One additional synthetic Core preproduction account was created exactly once.
The initial technical flow passed, then review found a displayed-versus-recorded
test-contract version mismatch. The final version binding and adjacent-route
isolation were checked by reconnecting that account with fresh OTP/PIN, obtaining
an actual AI reply and opening a protected balance gate. Four real model calls
completed across these checkpoints. The parent frame policy was separately fixed
and checked through the actual Next.js HTTP response. Root assertion mistakes
and remediation observations remain recorded; no clean final new-enrollment
rerun or live desktop acceptance is claimed. Desktop control stopped after the
user's Escape. The isolated stack remains running for the user's manual test,
with one enrollment slot reserved. No money movement or real Meta delivery was
performed; independent human acceptance and production/legal approval remain
pending. Affected register entries and ISO control references are in the manifest.

The [WhatsApp UX manifest](../SOURCE_REFERENCES.md#source-e8df1e376fbc)
records the phone-contact correction at `07c559c`, including destination-specific
directory authorization, opaque phone references, current-destination validation
and replacement of private contact metadata on explicit phone correction. PayMe
API `817648f` passed **515/515** tests in 42 files. Engine checks passed **77/77**
PostgreSQL cases plus two configured-profile cases; separate overlapping offline
and independent probes retain their own counts. Four
real OpenAI engine-API cases passed with five calls and synthetic bank/channel
ports. The API-to-actual-Python-serialization roundtrip separately verifies the
masked destination contract. Current native Core directory qualification covers
account contacts only; saved-phone success uses a controlled directory. Missing
phone destinations ask for the number, and ambiguous ones retain offered-ID
selection. No actual Meta delivery or native financial settlement is claimed.

The original parity report records runtime source at `c9cdd60` and actual qualification
startups, alongside earlier revision-scoped evidence. PayMe API runtime
`e7816b2` passed **492/492** tests in 41 files; subsequent API changes affect
its README and synthetic qualification harness only. Primary and GPT-6 Astra
reviews closed the recorded findings, including post-dispatch delivery uncertainty.

The subsequent three-agent verification reran **492/492 API tests**, **79/79
PostgreSQL engine cases**, eighteen deterministic boundary probes and two extra
HTTP probes. The offline engine run passed 262 cases with two PG-dependent skips,
covered separately. Three obsolete resend-sequence assertions initially failed;
the test-only correction requires a source-status check before resend. All initial
observations remain recorded. All 24 requirements have distributed evidence; this
is not a clean full end-to-end campaign. That review found a UX defect: named phone
transfers can resolve a contact without a phone, then fail native API validation
instead of asking for the explicit number. The subsequent correction above covers
that contract mismatch. Ordinary named transfers and explicit
phone-number transfers have separate supported contracts.

One actual Core preproduction synthetic account was created and reused. Earlier
Armony text/media and native protected journeys remain historical evidence.
The CFE addendum verifies exact MXN 214.00 barcode proposals, overdue warning,
amount-conflict clarification and PDF handling. The first successful image
preparation hit an evaluator product-ID assertion; read-only recovery verified
the same request and replay without another preparation or paid call. The other
three cases passed a resumed campaign. No clean single four-case run is claimed.
The CFE format remains synthetic-qualified, not an official or real-tenant format.

The live deposit conversation passed both clarification turns with zero bank
preparations and then prepared one owner-account cash-in. Its last assertion
failed because the old fake omitted CTA body text. A separate read-only encrypted
journal proof verified the accepted 20.00 MXN body, exact retained terms and absent
recipient; the original database remained unchanged. This is not a clean rerun,
actual Meta delivery or proof of the cash-in RPC amount. The harness now captures
accepted CTA body text for future tests.

Counts and overlapping checkpoints are separate. The user explicitly requested
independent agent verification for this increment ("skip that, verify with agents");
human testing is not a gate for this development verification and is not claimed.
Full acceptance/held-out matrices, actual Meta delivery, native financial settlement,
cash-out's pre-dispatch fee/reservation contract and production/legal approval
remain unqualified. Source preparation, deposit instructions and search selection do
not establish financial execution, credit, cash redemption or booking. Those
earlier qualification services were stopped; the interactive profile above is
separate and remains running for manual testing.

The [provider verification report](../SOURCE_REFERENCES.md#source-3fc166f635c0),
under `stateless_profile_failover`, records the local working tree over `7418663`:
bounded registered-profile recovery for v2 conversations, customer knowledge and
administration assistance. Controlled failures cover native HTTP timeout/network/
429/5xx handling, unchanged request/schema, denied routes and processing approvals,
budget charging, revocation, cancellation, JSON/SSE and replay. Each actual attempt
retains its own observation; connectivity diagnostics remain primary-only.
The report distinguishes overlapping checkpoints, failed observations and final
affected checks. Deterministic checkpoints use synthetic tenant/bank data and
controlled provider responses. A subsequent bounded live check at `e528403`
passed a normal authenticated JSON turn using real OpenAI `gpt-6-luna` and an
SSE turn recovering an injected primary outage with real Gemini
`gemini-3.8-flash`. Both replays made no inference. There were two actual model
calls, one injected failure and zero financial effects; authority and bank data
remained synthetic. This is compatibility/recovery evidence, not broad quality
or latency qualification. No live tenant configuration changed.
No real fallback chain is enabled. V1/Jev, environment-only and background/browser
paths retain single attempts. Independent primary/cross-model review, human
acceptance and production/vendor approval remain pending.

The [knowledge subject fix](../SOURCE_REFERENCES.md#source-f7a505999db6)
rechecks the Payme/Payme2 answer-substitution bug. Both original failures now
abstain, while own-organization answers retain exact citations and configured
languages. Eight native OpenAI engine scenarios and their replays passed;
two final-source original-case rechecks also passed. Six live history/JSON/SSE
checks withhold earlier unchecked answers without inference. The focused suite
passed 391 checks; a separate PostgreSQL suite passed 105, with two changed-source
legacy-transcript checks and four detected control mutations recorded separately.
Subject extraction remains model behavior, with local checks on named-subject
identity and question spans; this is scoped developer evidence, not a universal
semantic guarantee, independent acceptance or production approval.

The [Payme/Payme2 preproduction report](../SOURCE_REFERENCES.md#source-7a6c8be42c8d)
records two published local configurations over `c9b21db`, actual Core-v2 reads
on separate qualified test-customer mappings and native OpenAI engine calls.
Identity/style, fixed English knowledge answers, exact source citations, replay,
native protected handoffs, catalog permissions and access isolation were checked.
The final controlled suite passed 318 checks; desktop/mobile console checks and
two deliberate guard mutations passed. Its two original adversarial knowledge
failures are preserved; the subject-fix report above records their correction.
No cross-tenant data
disclosure or financial execution was observed. The app remains running locally;
local mapping leases expire one hour after launcher startup. The report preserves
earlier failures and scoped rechecks. New-profile independent review, human
acceptance and production/legal/vendor approval remain pending.

The [tenant personalization report](../SOURCE_REFERENCES.md#source-7e6ce7f6a63b)
records the local working tree over `c9b21db`: trusted per-purpose model selection,
native OpenAI structured output, finite style/guidance, public documents and links,
content-free usage accounting and manual quality review. Twelve final synthetic
HTTP cases passed using twelve real `gpt-6-luna` calls with a 2,048-token cap;
the earlier 1,024-token truncation remains recorded. The broad offline checkpoint
passed 1,354 checks with eighteen explicit skips; later changed-source checks,
PostgreSQL/RLS results, both built-console workflows and detected control mutations
have separate evidence. These counts are not a single final full-suite result.
Primary and cross-model reviews closed their findings. The reproducible wheel
matches all 164 packaged files. A full frontend format check flags eight unchanged
files; all affected-file checks pass. No real bank effect, publication, deployment
or Linear write occurred. Independent human acceptance and production/legal/vendor
qualification remain pending; native policy mirrors were not synchronized.

Verified interpretation reuse now includes read-only Google business discovery. `service_goal_development.discovery_interpretation_reuse` in the [existing report](../SOURCE_REFERENCES.md#source-8fef44a220d7) records 97 affected checks passed with four paid-model skips, plus 14 separate planning checks. A synthetic review approval after two consistent captures allowed the next exact request to skip capture while a fresh executor read returned a changed Places ID; location interpretation and source access still ran. Changed goals, extra fields, secrets, continuations and missing provider bindings are ineligible. Route/instruction changes and revisions arriving after lookup decline old hits. Three deliberately broken controls were detected. The wheel matches 148 package files and reproduces the release digest; 140-source-module type checks, affected lint/format, schemas and guide passed. The initial unsupported-capability red test and mutation-reporter JUnit-format error remain recorded.

The `interpretation-reuse-v2` key format invalidates existing candidate/approval fingerprints, including banking entries; replacement entries need fresh observations and review. This is synthetic development evidence, with no production reuse approvals, live provider calls or paid inference. Provider results/locations are not cached. Broader cache classes, managed publication/qualification, live service effects and independent acceptance remain incomplete; native binaries remain externally owned. No Linear access, publication or deployment occurred.

Consumer API reads now use the authenticated executor for Uber estimates, OpenTable availability, Places IDs and Maps MCP. `service_goal_development.consumer_api_executor` in the [existing report](../SOURCE_REFERENCES.md#source-8fef44a220d7) identifies the working tree over `ad434a2`: 133 affected checks passed, four paid-model cases were skipped, and four separately enabled actual-Go authority checks passed. A separate OS executor completed Uber's two reads with the provider credential absent from the worker; that process test uses explicit synthetic authority. The actual-Go checks use the ASGI executor transport. Duplicate RPCs cannot repeat reads before the worker persists a result; budget and concurrency denials precede provider I/O, and no Chromium path is used. Three deliberately broken controls were detected. The wheel matches 148 package files and reproduces the release digest; 140-source-module type checks, affected lint/format, schemas and guide passed. Initial result-label and Windows fixture-loop failures remain recorded.

This moves provider-key lookup and HTTP out of the worker for those four products. Executor-local environment credentials remain development bootstrap; the authority-owned vault, independent production credential/egress isolation, actual vendor access/qualification and independent acceptance remain incomplete. All provider/bank data in these checks are synthetic; no paid inference or real provider/bank effect was exercised. Redis multi-owner activation remains deferred, and native binaries remain externally owned. No Linear access, publication or deployment occurred.

File-backed [instruction qualification](../../contracts/SERVICE_INTEGRATIONS.md#instruction-releases-and-qualification-records) now refreshes at local gates without restarting API/worker or browser-owner registries. The `service_goal_development.qualification_catalogue_refresh` section of the [existing report](../SOURCE_REFERENCES.md#source-8fef44a220d7) identifies the working-tree fingerprints over `ad434a2`: 129 affected checks passed with four explicitly skipped paid-model cases, and 36 focused checks passed against extracted wheel code using the installed dependency inventory. Factory and authority/dispatch-wait cases reject revocation, missing/invalid/oversized files, duplicate keys and changed runtime bindings without a stale fallback. Three deliberately broken controls were detected in disposable packages. All 147 packaged files match source; the extracted package reproduces the release digest. Type checks, affected lint/format, schemas, guide and documentation links passed. Initial test-connection, PostgreSQL-start and package-probe setup failures are retained in the report.

This is local synthetic development evidence. It does not establish cross-host publication, rollback protection, cancellation of requests already started, live-provider/funding support or independent acceptance. No paid inference, real provider request or bank effect was exercised. Redis runtime, managed qualification and native adoption remain incomplete. No current issue state was queried for this increment.

Native DOM checkout now has an actual-Go authority profile under `service_goal_development.native_browser_checkout_go` in the [existing report](../SOURCE_REFERENCES.md#source-8fef44a220d7). Five cases passed: protected owner approval and one executor-only dispatch, changed-source denial before POST, engine-workload dispatch denial, 32 fixed no-dispatch inspections of one reservation, and deliberate future-source denial. Four existing Go API-read cases and the Rider/Go case also passed. The native owner uses the authenticated HTTP layer through ASGI with real Chromium; Go runs separately, but this is not a separate OS browser-owner/Temporal qualification. Happy-path fulfillment retained one `executing`, reserved, bank-unaccepted funding operation and made one provider-fixture effect; no bank effect, actual vendor request or paid inference occurred. Independent-source verifier sensitivity was checked by replacing source reconstruction with an engine-quote echo in a disposable test copy: the resulting forbidden POST was detected, while the provider fixture still rejected the stale cart without charging.

The first valid native journey failed before effects, and safe HTTP diagnostics subsequently captured `bank_invalid_output` at dispatch. A disposable, guard-preserving Go trace reproduced two future financial observations (0.8729 and 1.1739 ms ahead) during a fixed 32-inspection campaign. Identity/account/terms/expiry matched. The corrected native fixture publishes a bounded source snapshot before requests, retains its original freshness and rejects changed evidence. Production Python/Go guards were unchanged; the deliberate future-source case still fails closed. This diagnoses a reproduced failure class, not every historical Rider/Go refusal or the earlier Chromium timeout. The initial failures, diagnostic-only passing run and diagnostic-directory launch error remain evidence. Real source-clock/funding/provider qualification and independent acceptance remain incomplete.

The [native browser checkout contract](../../contracts/SERVICE_INTEGRATIONS.md#native-browser-checkout) now has controlled engine/executor evidence under `service_goal_development.native_browser_checkout` in the [existing report](../SOURCE_REFERENCES.md#source-8fef44a220d7). A reviewed source lock/payment/amount/currency bind the exact native JSON payload to protected approval; the separate owner permits one POST, stores the minimal native reference and later reads the exact source status page. Lost-ID submissions stay uncertain without resubmission. The broad service run passed 333 cases before acknowledgement was separated from confirmation; 73 affected boundary checks then passed. Six additional source-identity/zero-price/in-flight-expiry cases have passing records. There are 339 distinct passing cases across these overlapping profiles, not one final all-green broad run. Eighteen Go/process/Temporal profiles were skipped and fifteen live-model cases deselected. All bank/provider data are synthetic; no paid inference or real provider/payment effect was tested.

A later 23-case run passed 22 and hit a pre-dispatch Chromium locator-visibility timeout in one payload case; it lasted over five hours and made no provider POST in that failed case. Its cause remains unestablished. One bounded unchanged-guard recheck passed all six payload cases; that does not establish the timeout's cause or production reliability. Removing the payload-binding guard in a disposable package produced six forbidden native POST attempts, all detected; the synthetic server independently rejected their altered terms. The current wheel matches 147 package files and reproduces the source release manifest after extraction/import; 139-source-module type checks, affected lint/format, schemas, guide and documentation links passed. Earlier scaffolding failures are retained. No actual consumer site, source-lock semantics, real funding/vault/egress, independent review or native SDK/app adoption is qualified. Cancellation/refund execution, managed production qualification and Redis runtime remain incomplete.

Live-route [skill qualification](../../contracts/SERVICE_INTEGRATIONS.md#instruction-releases-and-qualification-records) now additionally binds the Python package/environment digest, checked independently by engine and executor. `service_goal_development.runtime_qualification` in the [existing report](../SOURCE_REFERENCES.md#source-8fef44a220d7) records 316 controlled service cases passed, eighteen optional-profile skips and fifteen live-model cases deselected on the working tree over `ad434a2`. The 43 focused gate checks are a subset, not additional distinct passes. Removing the runtime-binding guard in a disposable package was detected. The wheel's 146 package files match source; importing its extracted package yields the same release digest, and a changed executor file in a new Python process changes that digest. Type checks cover 138 source modules; affected lint/format, schemas, guide and documentation links passed. All sources/authority outcomes remain synthetic; no paid inference or real provider effects were exercised.

This digest is local Python content/version evidence, pinned per process, not signed deployment/OS/browser attestation. No real provider qualification was issued. Managed canaries/publication/revocation, actual provider/funding access and independent primary/cross-model/human acceptance remain incomplete. Current Linear reads leave IDE-18, IDE-21 and IDE-184 in Backlog. The prior native Rider/Go submission refusal below remains unexplained; these qualification checks do not resolve it. Older checkpoints below retain their original source hashes and scope.

The registered [Rider execution contract](../../contracts/SERVICE_INTEGRATIONS.md#uber-rider-task-execution) now has engine-to-executor HTTP evidence in the [existing report](../SOURCE_REFERENCES.md#source-8fef44a220d7), under `service_goal_development.registered_rider`. It covers source product/payment choices, private fare binding, protected approval, one native-shaped request, `submitted` versus acceptance/completion, exact-ID recovery, provider reauthentication and private-artifact expiry. Typed Rider execution makes no inference and permits no local-browser fallback. The broad controlled regression passed 400 cases; late dispatch-expiry/model-policy corrections received 70 affected checks, 68 final wire checks and thirteen final customer-control cases with overlaps excluded from distinct counts. Six optional Go boundary cases have passing records, including the separate-process financial recovery profile and the native Rider/Go approval/dispatch flow. Nine Go service groups with four nested subcases and `go vet` passed. All bank/provider sources are synthetic; no paid inference or real provider/bank effect was tested.

Four deliberate faults were detected: missing private-fare validation before dispatch, cross-grant connection reuse, excess artifact retention and discarded dispatch expiry. The expired-permit and unnecessary model-disclosure gates failed before correction. A synthetic funding inspector initially compared wrong customer location labels; the intact Go guard rejected it, and the fixture was corrected. A later native Rider/Go submission refusal remains unexplained: the unchanged-guard diagnostic recheck and three bounded reliability probes passed, each with one provider-fixture POST and matching, unexpired receipts. Those passes do not establish its cause or production reliability. Original failures remain evidence. Fifteen optional-profile skips in the broad run were partly covered separately (six cases); nine remain unexecuted, and fifteen live-model cases were deselected. Actual Uber accounts/access, authority-owned vault/funding/charge-limit adoption, cancellation/refunds, independent review and native client acceptance remain incomplete.

The prior [tracking report](../SOURCE_REFERENCES.md#source-8fef44a220d7), under `service_goal_development.post_confirmation_tracking`, records opt-in bounded source tracking, monitoring-only stop, source-identity/order checks and meaningful-state outbox delivery. The broad controlled regression passed 387 cases, including fifteen tracking cases and two Temporal restart/history replays. Four Go-authority API reads and the separate worker/browser/Go recovery process passed after fixing inconsistent route digests. The process retained one active synthetic allowance reservation, one provider-fixture effect and zero bank effects; it does not establish payment acceptance or settlement. Three deliberate mutations detected false provider cancellation, foreign trip identity and repeated-poll notifications. Fourteen optional-profile tests were skipped in the broad run; five of those ran separately, leaving nine optional profiles unexecuted. Fifteen live-model cases were deselected; no paid inference was needed for this deterministic increment.

The authority correctly rejected all five boundary cases before canonical digest unification; those failures remain recorded. A test closure also compared an updated approval route against the fixture's original route and was corrected without weakening the wire guard. The earlier confirmation, outbox and outage failures are retained. Current package evidence covers 32 service Python modules, eight instruction-only skills and the shared resource/cache modules. Real provider tracking/checkout/payment/cancellation/refund routes, production qualification and native client acceptance remain incomplete; the [consumer contract](../../contracts/SERVICE_SDK.md) distinguishes current monitoring controls from proposed effect commands. Historical evidence below retains its own hashes and scope.

The preceding instruction/reuse increment adds content-pinned instruction releases, exact-route/model/permission qualification gates, opt-in independently promoted read-plan reuse, a standalone documented Uber Rider client and the proposed [SDK/app contract](../../contracts/SERVICE_SDK.md). The `service_goal_development` section of the [existing report](../SOURCE_REFERENCES.md#source-8fef44a220d7) records working-tree hashes over `ad434a2`: 344 controlled regression passes, four actual-Go API reads and five real-Gemini engine cases (353 distinct passing cases). The read-reuse case was also rechecked after its asynchronous evidence-writer change. Four API journeys used six model calls; two reuse runs used two calls each. Reuse skipped subsequent capture inference while fetching fresh synthetic bank data or creating a fresh protected host request; replacement-token consumption remained denied. These review records are fixtures, not independent production acceptance. Fourteen optional-profile tests were skipped and fifteen live cases were deselected in the broad run; the Go/live subsets ran separately.

Two deliberate mutations detected lost request-meaning binding and bypassed live-route qualification. Required 202/204 transport handling and disabled cache lookup failed before correction; initial test scaffolding/session-binding failures remain recorded. Current lint/formatting, 133-source-file type checks, generated contracts/guide and package checks passed; the wheel matches 30 service Python modules, eight instruction-only skills and the interpretation-reuse module. The Rider client is not registered as a task execution route. Provider checkout/payment, cancellation/refund/tracking execution, authority-owned credentials/egress, automatic qualification publication/canaries, Redis coordination and native client implementation remain incomplete. No real provider or bank effect, independent review/acceptance or production approval is claimed. Earlier checkpoints below retain their own hashes and scope.

The [service development report](../SOURCE_REFERENCES.md#source-8fef44a220d7) records consumer DOM preparation/discovery and explicit [consumer API products](../../contracts/SERVICE_INTEGRATIONS.md#consumer-api-products) on `docs/concierge-ux-skills`, with working-tree hashes over `ad434a2`. The API increment implements Uber price/ETA estimates, OpenTable Consumer availability, Places IDs-only search and Maps MCP through the engine's authority/task boundary. Four final real-Gemini journeys used six calls; four actual-Go read checks created zero financial operations or bank effects. Vendor responses/data are local contract fixtures; keys, actual access, partner base paths and entitlements still require provider qualification. No booking/order API effect or live provider profile is enabled. The report preserves earlier API candidate runs separately.

The earlier DOM checkpoint covers Uber Eats, Rappi, OpenTable, Doctoralia, Google Maps/businesses, DiDi rides and DiDi Food: 232 distinct passing cases, including seven real-Gemini journeys using 22 calls, seven actual-Go preparation reads and the shared financial process recheck. Those runs retain their own source hashes; they are historical evidence for changed common runtime code. The adapters distinguish unknown booking prices from free service, preserve source queries and exclude results/credentials from model input. Account bindings and reviewed network/GraphQL document rules remain enforced. Three prior DOM control mutations and two new API control mutations were detected. A decoded JSON credential-echo defect was demonstrated before correction and passes afterward. The built wheel matches all 36 service files and eight instruction-only skills; no executable skill bundles were introduced. Real profiles/access, checkout, cancellation/refund, tracking, funding/card adoption, native rendering and independent primary/cross-model/human acceptance remain incomplete.

The combined service/planning regression has 266 distinct passing controlled cases after an eight-case fixture recheck. The first run had 258 passes and eight Windows shared-temp permission setup errors, with no assertion failures; all affected cases passed using a fresh workspace `--basetemp` (16 recheck passes, eight overlapping earlier successes). Optional process/Go profiles had 14 explicit skips and 15 live cases were deselected; four new Go reads and four real-Gemini API journeys run separately. The final API increment therefore has 274 distinct passing cases across these profiles. Lint/formatting, 130-source-file type checks, generated contracts/guide and documentation checks passed. No real vendor endpoint, account, payment or booking was tested; partner access and independent acceptance remain pending.

Failed observations remain in the report: interrupted Windows browser startup, a real-Gemini DiDi handoff corrected by explicit trusted synthetic/live scope, and an initial protected Go approval rejected as `bank_invalid_output`. The unchanged-guard Go process recheck passed, but the initial rejection's cause remains unestablished. Earlier Maps (167-case) and graph cleanup (184-case) checkpoints, standalone-client/Uber-handoff evidence and [handler-level live runs](../SOURCE_REFERENCES.md#source-a4e946aefde5) retain their own hashes and scope; historical counts do not qualify changed code. Zero workflow-instance caching and safe eviction remain in force; production-load qualification is pending. Live Linear still has IDE-184/21 in Backlog. No issue/publication writes, commits, production approval or story completion occurred; native policy mirrors remain stale.

[ADR-011](../../decisions/011-tenant-api-and-channel-ownership.md) moves enrollment execution/forms/session exchange and Meta ingress/Flows to tenant APIs. The [tenant API boundary report](../SOURCE_REFERENCES.md#source-1bc68f4a77c1) qualifies source `18c8070`: intent-only onboarding, trusted per-caller tenant links, preserved app-host/authority paths and separate per-tenant WhatsApp simulator histories. The final isolated regression passed 1,112 tests with 28 explicit optional-profile skips; both built-console browser regressions passed. Twenty synthetic PayMe/Northstar cases passed through engine HTTP, tenant APIs and independent Go authority using 24 real Gemini calls. No accounts, messages or financial effects were created; protected links were not opened. The report preserves earlier capture/provider/setup failures, three detected control mutations, primary/cross-model findings and rechecks. Fresh independent execution and cross-model adversarial verification found encoded credential echoes and malformed-URL normalization defects; both were fixed and independently rechecked at `a86a600`. The report records 43 focused remediation passes, six additional independent probes, and the refreshed 762-pass offline regression, with explicit skips and original failed observations retained. Native tenant/SDK/Meta adoption, independent human acceptance and production/legal approval remain separate. Affected native Linear document mirrors remain stale.

[ADR-010](../../decisions/010-app-host-banking-and-model-context.md) now has an explicitly authorized engine-side [host-banking implementation](../../contracts/HOST_BANKING.md): optional trusted client routing, opaque chat/SSE results, authenticated one-time consume, private V2 pending projection and optional tenant-directory contacts. The [developer report](../SOURCE_REFERENCES.md#source-d81ab3acdfeb) records real HTTP/ES256/PostgreSQL checks, detected control mutations, failed observations and rechecks. Native screens/biometrics/core execution and lifecycle/device adoption remain separately owned. The [native Gemini report](../SOURCE_REFERENCES.md#source-2e0ae16b8b89) records eight passing synthetic conversations through this engine's API using nine real `gemini-3.8-flash` calls, no retries or bank effects. It verifies intent handoff, private follow-up, contact ambiguity, replay, single-use consume and denied access. This fixed development run is not held-out or repeated-run quality evidence. Historical direct-read/link reports do not qualify the new native route. Independent review/human acceptance and production approval remain pending.

The [expanded adversarial campaign](../SOURCE_REFERENCES.md#source-853e02ce7b11) preserves the initial 66-scenario real-Gemini run (64 passed, two conversational failures), controlled secret-input regressions, their fixes and 132 passing fixed-source conversations (66 scenarios repeated twice, 168 real Gemini calls). The complete additional campaign used 201 conversations and 258 calls, including the preserved initial failures and three targeted rechecks. It adds scoped `pending_cleared` receipts, deterministic offered-contact selection, 600 seeded privacy/recipient simulations and six detected control mutations. The report's current execution status and case-level observations govern its result; earlier failures remain evidence and are not replaced by successful rechecks. This development campaign does not supply independent review or native-bank acceptance.

The [console UI and tenant-avatar report](../SOURCE_REFERENCES.md#source-61ebbc38fb80)
records the dark messaging layout, validated versioned avatars, 75 domain/API
passes, 12 frontend tests and the expanded production-browser regression.
Separate GPT-6.1 Sol primary and GPT-6 Astra adversarial reviews closed image
resource/integrity/EXIF findings, runtime processing overhead, historical identity
and mobile focus issues on `10eb951`. The report retains source hashes, failed
observations and remediation. These local synthetic checks and automated reviews
support dev integration; independent human acceptance and production qualification
remain separate.

**Historical enrollment execution, retired by ADR-011:** the [account enrollment report](../SOURCE_REFERENCES.md#source-cecaf938da4c)
records the former shared creation lifecycle through web, SDK HTTP and signed,
encrypted WhatsApp Flows. The frozen developer regression at `707c218` passed
1,023 cases with 92 optional-profile skips, including all 80 focused enrollment,
contract, resource and catalog cases. Eight control mutations were detected.
Separate primary and cross-model source reviews closed the stale bank outcome,
initialization, session budget, browser session and WhatsApp recovery/correction/
optional-field/revision findings. The report preserves failed observations,
rechecks, source/artifact hashes and skip reasons. Ruff, formatting, types,
generated contracts, migration consistency and packaged web assets passed.
These checks use local PostgreSQL, Chromium and controlled synthetic bank/Meta
transports. Source reviews do not replace independent human acceptance. Real
issuer/bank/Meta provisioning, native SDK adoption and production approval remain
separate.

The [OpenMausBot adoption verification](../SOURCE_REFERENCES.md#source-13d81ccdbd54)
records bounded read-only mission DAGs, child questions/joins, retained budgets,
current disclosure checks, repeated-work guards and bounded context/protocol
validation. The broad run had 952 passes, two fixture-scope failures and 92
optional-profile skips; after correcting those assertions, all 29 affected tests
passed (954 unique passing cases across that run and recheck). Five current-source
control mutations were detected. [Real Gemini mission checks](../SOURCE_REFERENCES.md#source-70f617f06298)
passed with two independent children and account clarification. The
[live Temporal flow](../SOURCE_REFERENCES.md#source-cec9b2658a7f) passed
worker-crash recovery, three history replays, correction, watches and cancellation
using eleven model calls and synthetic data. Failed live observations remain
linked from the report. Separate source reviews cleared their findings;
independent human acceptance, conditional execution/RSI choices and production
approval remain separate.

The [tenant read-route report](../SOURCE_REFERENCES.md#source-0fd9cca2930f)
records catalog read selection and public-browser route controls, including
published configuration, tenant isolation, replay, revocation, source collision
and browser cancellation checks. Two real-model Spanish conversations selected
the expected controlled catalog implementations. This does not qualify general
API-versus-browser routing for arbitrary goals or alternate routes for effects.

The [Core web-test extras report](../SOURCE_REFERENCES.md#source-cac2450e3fd6)
records the expanded integration: approved public materials, explicitly synthetic
flight/hotel/cart quotes and caller-scoped recent request history. The final
targeted native run passed all six additional conversations through the real
model, separate Go authority and Core preproduction. The earlier combined native
run passed all eleven banking cases but exposed flight/hotel output truncation;
the reports retain that failure and subsequent quote-selection/history fixes.
The built-console check passed four real-model read turns plus intercepted
synthetic purchase cards on desktop/mobile. Five Python control mutations were
detected; both independent source reviews cleared the final recorded fingerprint.
The combined Python run recorded 903 passes, one failure and eleven skips,
including fourteen passing real-model cases. Its sole failure was a missing-key
test inheriting the authorized live credential; explicitly isolating that fixture
preserved the assertion, and all 35 provider tests passed on recheck. The complete
suite was not repeated after this test-only change.
No bank link was opened or authorized, and the synthetic sender balance remained
unchanged. These quotes do not book travel or place orders. Media/receipt input,
voice and tenant-authored journeys remain unimplemented; human acceptance and
production gates remain open. The feature remains local while Concierge Git
authentication is unavailable.

The [Core handoff verification report](../SOURCE_REFERENCES.md#source-237ca92d7843)
records the reviewed runtime fingerprint before subsequent parity work: 860 Python
checks passed, 24 explicitly skipped, with 50 focused quote/replay checks and a
passing built-console regression. Eleven real-model/native Core preproduction
conversations and twelve real-model/controlled-bank cases passed. Native failures
and four detected control mutations are retained. The fee-aware console showed
the bank's exact proposed commission/total; the synthetic sender's balance remained
unchanged. No PIN was submitted or bank link approved. These are development
observations, with human critical-control review, independent acceptance and
production readiness still open. Later source changes require new qualification.

The Spanish console and chat-scroll increment, based on `10a8c4f`, reproduced a
send-triggered document jump from 262 px to 0 before the fix. The final real-browser
regression passed desktop Enter submission, mobile button submission, hidden reply
completion, preserved reader position during streaming and navigation, Spanish
sections/dialogs, and unchanged submitted enum values. Forty-four administration
API/streaming checks and eight JavaScript checks passed, as did the production build,
TypeScript, Ruff, formatting and diff checks. Two independent source reviews closed
the hidden-completion and missing-role-label findings; the long-reply regression
also verifies overflow after completion. Earlier browser attempts exposed label
locator and global-to-tenant navigation mistakes in the test, corrected before the
passing run. These checks use isolated local databases and controlled engine
responses, with no paid inference or real bank effects. Hosted deployment, remote
CI and production acceptance are not claimed.

The [console performance and streaming report](../SOURCE_REFERENCES.md#source-b1b3b2771076)
records persistent navigation, incremental verified results, terminal failure and
reload-safe recovery, current-access disclosure checks, and actual engine cancellation.
The hosted baseline passed nine Spanish prompts. The initial local streaming run
passed eight of nine and retains its failed mixed identity/balance case. Windows
Time was stopped and an NTP probe measured the host 1.49 seconds behind. After
administrator-approved synchronization, the [fresh streaming run](../SOURCE_REFERENCES.md#source-0657b7dfd117)
passed all nine with the original 10 ms authority clock tolerance. Authority
validation code and hosted settings were unchanged. The hosted artifact has not been updated by this work; the
user approved dev-only integration with follow-up human critical-control review
required before staging/production.

The [personal Railway preproduction verification](../SOURCE_REFERENCES.md#source-e2e8de49a1e3)
records the hosted web/backend artifacts, app-owned HTTPS password/TOTP login,
actual native WhatsBank v2 test-customer balance flow, replay/reload, exact source
comparison, and four detected bridge/authentication control faults. The temporary
test IdP and unused engine placeholder are stopped. This is personal development
evidence; real customer trust, financial effects, independent review and production
acceptance remain separate.

This table summarizes recorded development evidence, not a fresh qualification of the entire current `dev` tree. Follow each manifest's tested revision or source fingerprints before reusing a result. Check live Linear for current independent acceptance and story state. A demo or capability claim must identify the tenant, authority context, source of bank data and actual engine endpoint; a provider-only chat does not verify this engine.

| Capability | Recorded evidence and environment | Acceptance boundary |
| --- | --- | --- |
| IDE-176 private device handoff and TLS launcher, based on `dev` at `dad6c53`; source fingerprints and implementer review findings in report | [Verification manifest](../SOURCE_REFERENCES.md#source-69685d48de2d), [real TLS handoffs](../SOURCE_REFERENCES.md#source-37d220644993), [20 TLS conformance cases](../SOURCE_REFERENCES.md#source-8eb2ab70a594), [five detected control faults](../SOURCE_REFERENCES.md#source-e0c962dd57cf), [retained initial fault-harness failures](../SOURCE_REFERENCES.md#source-970092f68f4a) | 88 affected checks passed with no skips, including both synthetic identities through actual API/JWT/current-authority/PostgreSQL/SSE/replay. Normal CA/SAN validation, exact Host guard, preflight binding and expiry checks; inherited client credentials rejected before requests and interrupted checks retain a non-passing report. No public issuer/runtime files or operational health on the device surface. Controlled interpretation and synthetic money only. No Ideeo host/domain exists yet; remote deployment, native SDK/device adoption, independent review and IDE-182 acceptance remain open. |
| IDE-167/176 integration consumer and sandbox, based on local `dev` at `342ed89`; exact source fingerprints in report | [Verification manifest](../SOURCE_REFERENCES.md#source-4bddd45046e3), [20 HTTP checks](../SOURCE_REFERENCES.md#source-ef518abeec58), [retained initial probe failure](../SOURCE_REFERENCES.md#source-e554558b0cdc), [TCP bank-outage check](../SOURCE_REFERENCES.md#source-cab81d3bf69f), [control faults](../SOURCE_REFERENCES.md#source-7ed56adb328d) | Incremental UTF-8/SSE reference consumer, session-change suppression, task/event correlation, exact money, typed failures, finite replay and immediate response cleanup. Explicit controlled local sandbox uses real v1 API/JWT/current-authority/PostgreSQL/encrypted storage, with no external inference or real banking. Malformed input, unauthorized account and cross-customer conversation probes supplement existing success/replay checks. Native SDK adoption, remotely reachable approved environment, current independent code/critical-control reviews and IDE-170/182 human acceptance remain pending. |
| Tenant-aware PayMe assistant and local conversation UI | [Assistant manifest](../SOURCE_REFERENCES.md#source-b8b93213882f) identifies tested source hashes; [live UI and engine cases](../SOURCE_REFERENCES.md#source-5bd55c4243a3) use synthetic banking and the engine endpoint. | These reports do not establish independent review, human acceptance, native app/SDK use, real tenant identity or bank access. |
| Balance conversation through a tenant bank adapter | [WhatsBank connector manifest](../SOURCE_REFERENCES.md#source-a4d8af0724fc) and [live engine flow](../SOURCE_REFERENCES.md#source-eeb8d2e2f3ae) cover authorized, controlled preproduction customer reads. | These reports do not establish real customer session/grant adoption, production balance semantics, native consumer use or independent acceptance. No production bank effect was qualified. |
| Agent-account authority, protected proposals and scoped reads | [Authority HTTP manifest](../SOURCE_REFERENCES.md#source-0dab8b70102c) and [owner-control manifest](../SOURCE_REFERENCES.md#source-10e33b965780) identify tested Go/Python revisions with synthetic bank effects. | These reports do not establish real tenant mappings, full lifecycle/migration or human acceptance; a proposal is not a completed bank effect. |
| Durable balance work, product comparison and monitoring | [Background manifest](../SOURCE_REFERENCES.md#source-d3ee20bd036b), [comparison manifest](../SOURCE_REFERENCES.md#source-c82b0373733d) and [delivery manifest](../SOURCE_REFERENCES.md#source-1fe0379381bc) cover development workers, recovery and scoped delivery. | These reports cover synthetic banking and bounded public research; they do not establish live retailer results, tenant/channel adoption, independent acceptance or production qualification. |
| Tenant administration console | [Admin manifest](../SOURCE_REFERENCES.md#source-dbab1a43f868) records tested source hashes, browser routes and synthetic tenant flows. | This report does not establish organization IdP, real bank/channel provisioning, independent review or human acceptance. |
| App/SDK and legacy integration | [Consumer conformance evidence](../SOURCE_REFERENCES.md#source-00754349b975) checks the engine contract with a reference consumer. | This checker does not establish actual app/SDK and legacy builds, trusted session mapping or human verification for IDE-165/166/167; see [acceptance gaps](#failures-retained-and-acceptance-still-open). |

## Recorded checks

| Scope and revision | Evidence | Boundary |
| --- | --- | --- |
| Tenant administration console; exact source hashes in manifest, based on local `dev` at `f6cfb3a` | [Verification manifest](../SOURCE_REFERENCES.md#source-dbab1a43f868), [current live observations](../SOURCE_REFERENCES.md#source-62cd14f1e3ef), [current control faults](../SOURCE_REFERENCES.md#source-8ba5f7a430c2) | 28 administration tests, production Next.js build, static/schema/package checks, 10 browser routes with mobile layout and seven live synthetic scenarios passed. Full engine regression initially had two missing-browser failures, both corrected by installing the pinned browser and passing the affected cases; ten optional qualifications remained skipped. Four critical-control faults detected. Synthetic banking only; organization IdP, real bank/channel provisioning, independent review and human acceptance remain pending. |
| Tenant assistant self knowledge and PayMe local UI; exact modified-source hashes in manifest | [Verification manifest](../SOURCE_REFERENCES.md#source-b8b93213882f), [live UI/engine observations](../SOURCE_REFERENCES.md#source-5bd55c4243a3), [control faults](../SOURCE_REFERENCES.md#source-ac1f1c19bbfc) | 661 Python tests and 10 UI proxy tests passed; 10 explicitly enabled integration qualifications were skipped with reasons. Seventeen live synthetic-data cases passed, including tenant/name, current tools, limits, Spanish/English, injection, provenance, mixed balance, pending transfer, replay and denied accounts. Six deliberate control faults detected; static/type/schema checks and exact built-wheel import passed. Initial schema incompatibility and environment/reporter failures are retained. Final running PayMe identity/balance smoke is included. Synthetic banking, no financial effects; independent/cross-model review, human acceptance, native consumer adoption and production remain unapproved. |
| Dedicated WhatsBank preproduction read connector; source fingerprints in manifest | [Verification manifest](../SOURCE_REFERENCES.md#source-a4d8af0724fc), [API exploration](../SOURCE_REFERENCES.md#source-510d20956ea7), [protected fixture qualification](../SOURCE_REFERENCES.md#source-5e3515ec2c49), [live engine flow](../SOURCE_REFERENCES.md#source-eeb8d2e2f3ae), [initial control faults](../SOURCE_REFERENCES.md#source-c0191fc0ecd1), [secret-control recheck](../SOURCE_REFERENCES.md#source-eff97d5a15ef) | 136 targeted and 47 separate contract/auth/conformance checks passed without skips, plus one explicitly enabled actual preproduction engine test. Two user-authorized synthetic bank customers were created. Native balance/cents/currency matched the bank-owned protected **Saldo disponible** view; CLABE/history, incorrect PIN, consumed links, nonexistent account and bad HMAC were exercised. The live engine flow uses controlled customer identity/authority/inference and actual bank data, checking mapping, replay and revoked disclosure. Six control faults were detected; an initial secret-echo survivor exposed a weak fixture corrected before recheck. Static/type/schema/migration checks, build and packaged-source import passed. Initial live setup/status-assertion failures are retained in the manifest and [failed live report](../SOURCE_REFERENCES.md#source-da41ee26a7c4). Real customer session/grant adoption, production field/hold/freshness policy, independent reviews/human acceptance and client adoption remain open. No paid inference or funds moved. |
| Conversation delivery, owner inventory/allowance and recurring price monitoring; reviewed runtime `e0459da` | [Verification manifest](../SOURCE_REFERENCES.md#source-1fe0379381bc), [control faults](../SOURCE_REFERENCES.md#source-4009385c9eac), [successful live flow](../SOURCE_REFERENCES.md#source-2995a0bcf40a), [failed reviewed-source refresh](../SOURCE_REFERENCES.md#source-c8d97b035f23) | 566 broader Python regressions and 22 final affected checks passed (overlapping counts); configured Go/bank-process, Temporal recovery, race/vet, migration and artifact evidence retain their exact scope in the manifest. Two independent reviewers closed lease timing, watch replay/retention, batch disclosure, consumer rendering and port findings at `e0459da`. Earlier direct Pimoroni/Gemini research/watch flows passed; the refreshed attempt failed after source unavailability and invalid fallback output. Generic discovery and dependable live-source availability remain unqualified. Synthetic banking only; human Verification, actual tenant/channel adoption, remote CI and production acceptance remain open. |
| Durable public product-comparison development increment | [Verification manifest](../SOURCE_REFERENCES.md#source-c82b0373733d), [six control faults](../SOURCE_REFERENCES.md#source-bc08fd0d8aa9), [public source observation](../SOURCE_REFERENCES.md#source-cf3245f14693) | 543 selected Python regressions, four configured Python/Go process checks and one real Temporal/Chromium worker-loss/replay check passed. Go race tests/vet, schemas, types, packaging and six deliberate faults passed. Goals, current mandate/destination checks, retained budgets, evidence/goal verification, correction/cancellation and reconnect are covered with controlled inference and synthetic products. The public retailer read yielded a redirect, not qualified product results. No paid inference or real banking effects. Independent review, human Verification, live model/retailer acceptance and production qualification remain pending; no story-Done or promotion claim. |
| Durable read-only background balance flow | [Verification manifest](../SOURCE_REFERENCES.md#source-d3ee20bd036b), [Temporal qualification](../SOURCE_REFERENCES.md#source-cbd49a5e3f33), [real-LLM flow](../SOURCE_REFERENCES.md#source-d6acb4239ed5) | 520 selected Python tests passed; 13 real Temporal/LangGraph checks and three OpenRouter/Gemini calls verified worker loss, replay, input waits, timers, bounded retries, cancellation, continued conversation, reconnect and revoked disclosure. Five deliberate faults were detected. Existing banking handlers/authority are unchanged. Two unchanged standalone Go process tests were excluded; independent primary/cross-model review, human Verification and critical-control acceptance remain pending. Development qualification only; no production promotion or story-Done claim. |
| Combined concierge `e09f624` and mandate history `b39394e` | [Combined verification](../SOURCE_REFERENCES.md#source-60d0d04327cf) | Cleanly composed on the shared migration checkpoint; 508 Python tests including both standalone Go-process tests passed, plus 71 Go groups and 55 subcases under race detection. All 113 recorded source fingerprints match the two feature reports. No blocking finding in the reviewed changes; this session implemented the concierge change, so its review is not independent acceptance of that change. Cross-model review, independent human Verification and critical-control acceptance remain pending. Subsequently integrated into local `dev` at the user's request; no push, deployment or story completion. |
| V2 concierge presentation ownership | [Verification manifest](../SOURCE_REFERENCES.md#source-7e74034e62e4) | Executors return typed evidence without public prose; the concierge renders normal messages and preserves authority-owned approval payloads. 506 Python tests passed with zero failures/skips in the selected suite; two fixed-profile standalone Go-process tests were explicitly excluded. Five deliberate faults detected; static/type/schema/package checks passed. Public contracts, current disclosure, original replay text and partial-result evidence are preserved. No new paid inference or real banking effects. Background execution, full conversational reasoning and independent acceptance remain pending. |
| Individual owner restrictions and exact resume | [Verification manifest](../SOURCE_REFERENCES.md#source-10e33b965780), [real-LLM observations](../SOURCE_REFERENCES.md#source-f7d71fbb22df) | Immediate individual pause/revocation, independent restriction revisions, exact signed resume, append-only scoped audit, preserved uncertain effects/callbacks and lifecycle state reporting. 453 Python tests, 58 Go groups plus 49 subcases under race detection, and 40 distinct detected faults across the recorded runs. Twenty-one live scenarios passed with ten paid calls and zero bank effects; owner controls add no inference. Failed fault builds are retained and excluded. Stop old authority binaries before migration 006; broader owner/native A0 scope, full migration and independent acceptance remain incomplete. |
| Customer action scopes without balance prerequisites | [Verification manifest](../SOURCE_REFERENCES.md#source-04abef58356a), [real-LLM observations](../SOURCE_REFERENCES.md#source-e5eda18dd459) | Exact scope preservation, history-only reads/conversation, current grant/pause/replay denial and account suppression when no capabilities remain. 453 Python tests passed with no skips, including the configured Go process boundary; five permission faults were detected. Seventeen live scenarios passed with ten paid calls and zero bank effects. Unchanged Go source/binary retains its prior race-test attribution. Full migration and independent acceptance remain incomplete. |
| Scheduled authority content erasure | [Verification manifest](../SOURCE_REFERENCES.md#source-50ffa0f93f08) | Separate encrypted minimal recovery, expiry before physical cleanup, scheduled erasure without customer traffic, late signed reversal after erasure, constrained maintenance privileges and scoped legacy backfill. 441 Python tests and 50 Go groups plus 49 subcases passed under race detection; combined control faults and operator commands are recorded in the manifest. No new paid inference; earlier live evidence retains its parent-revision attribution. Final evidence retirement, broader migration and independent acceptance remain incomplete. |
| Signed bank callbacks and notification relay | [Verification manifest](../SOURCE_REFERENCES.md#source-caeb7c725f76), [current real-LLM observations](../SOURCE_REFERENCES.md#source-2580b43621a0) | Atomic encrypted inbox/outcome/outbox, late evidence after pause, ordered/idempotent recovery, current scoped notification leases/acknowledgements and decoded credential-echo rejection. 440 Python tests, 42 Go groups plus 49 subcases under race detection, and 27 detected control faults. Thirteen live scenarios passed with nine paid calls and zero bank effects. Retained failures include a reproduced cross-runtime clock mismatch; the explicit development read-clock profile passed 300 reads. Physical authority erasure, actual channel delivery, broader migration and independent acceptance remain incomplete. |
| Standalone authority HTTP service and configured brain integration | [Verification manifest](../SOURCE_REFERENCES.md#source-0dab8b70102c), [real-LLM observations](../SOURCE_REFERENCES.md#source-0541861c476d) | Independent customer/workload/role verification, current bank inspection, protected owner approval, final core acceptance, scoped reads and uncertain-outcome reconciliation through Go/HTTP/PostgreSQL. 428 Python tests, 25 Go groups plus 49 subcases under race detection, and 12 detected control faults. Twelve live scenarios passed with nine paid calls and zero bank effects. Real bank mappings, durable callbacks/outbox, full migration and independent acceptance remain incomplete. |
| Separate authority kernel | [Verification manifest](../SOURCE_REFERENCES.md#source-515a63d6ba5f) | Go/CEL policy, independently verified development proofs, encrypted mandates, client connection, pause/resume and atomic PostgreSQL allowance reservations. Race and deliberate-fault checks cover the kernel; HTTP/bank integration, lifecycle completion and independent acceptance remain incomplete. |
| V2 conversations and capability broker interfaces | [Verification manifest](../SOURCE_REFERENCES.md#source-3d297ff03eba), [current real-LLM HTTP observations](../SOURCE_REFERENCES.md#source-b7b6c6d3979f) | Encrypted scoped conversation/replay, current disclosure, typed source reads/protected proposals, configured tenant broker contract and lifecycle controls. Synthetic authority/bank ports only; actual bank mappings, independent authority service, broader migration and independent acceptance remain incomplete. |
| WhatsBank capability foundation | [Verification manifest](../SOURCE_REFERENCES.md#source-c428f2683479): 369 tests, zero skips, five detected critical-control mutations, static/schema/migration/package checks; [12 real-LLM capture cases](../SOURCE_REFERENCES.md#source-e4d29781b2b0) passed | Typed financial proposals, encrypted operation persistence, approval/evidence binding, concurrency, uncertain-outcome reconciliation and authorized source-read ports. Synthetic bank effects only. Earlier capture failures are retained. The full migration and independent acceptance remain incomplete. |
| Data-boundary candidate `e8ee851` | [Verification manifest](../SOURCE_REFERENCES.md#source-74ee1a333329): 329 tests, zero skipped, 91% rounded branch-aware coverage, static/schema/migration/package checks, 30 detected control mutations | Purpose-bound model disclosure, encrypted task/preference content, current authority, protected executor-only resolver, legacy backfill/rewrap, expiry and constrained scheduled cleanup. Separate primary and cross-model rechecks found no residual actionable findings. Controlled development only; no paid inference or banking effects. |
| Tenant/backend candidate `a30a48d` | [Verification manifest](../SOURCE_REFERENCES.md#source-3308d8bb65b9): 299 tests, zero skipped, 92% rounded branch-aware coverage, static/schema/migration/package checks, 20 detected control mutations | Two local HTTP backends with overlapping member/account IDs, separate credentials, mixed adapter types, current authority/revocation, replay/SSE and malformed/unavailable backend checks. Controlled interpreter; no paid inference in this run. |
| Planner adapters `85ffec3` | [Deterministic/package evidence](../SOURCE_REFERENCES.md#source-3fc166f635c0), [live observations](../SOURCE_REFERENCES.md#source-1fbe33f0dd1c) | 13 OpenRouter planner requests: one smoke, eight HTTP cases, two clarification turns and two conformance turns; zero retries, reported USD 0.00789075. Synthetic bank only; not held-out acceptance or statistical quality. |
| Consumer contract checker | [Current 20-case controlled HTTP run](../SOURCE_REFERENCES.md#source-ef518abeec58), [original checker evidence](../SOURCE_REFERENCES.md#source-00754349b975), [prior live-planner observations](../SOURCE_REFERENCES.md#source-1fbe33f0dd1c) | Twenty JSON/SSE/session/account/replay/isolation/input checks. Current controlled interpretation does not requalify prior model behavior or establish actual app/SDK adoption. See [the runner guide](../../development/CONFORMANCE.md). |
| Jev experiment at `f4126f2` | [Case-level runs, failure and correction](../SOURCE_REFERENCES.md#source-534ba24a4273), [archived probe](../SOURCE_REFERENCES.md#source-48e53244bf2a), [later credential test](../SOURCE_REFERENCES.md#source-e7f8a4d889e1) | Routing compatibility/developer observations. Jev is optional and disabled by default; confidence calibration remains open. Jev results do not qualify general planning. |
| WhatsBank preproduction example | [Sanitized diagnostic](../SOURCE_REFERENCES.md#source-8d2f0bcacb62) | Authorized login plus v2 `ping` and `Balance` reads; ping reported preproduction. Zero production/effect calls. No implemented customer/grant/account mapping or available-to-spend semantics inferred. |

Immutable mandate history at `73826193960407710bd57e3389e5c085fea14689`: [verification report](../SOURCE_REFERENCES.md#source-fd7eb4bb9a46). The independent Go authority retains exact encrypted mandate versions and verified approval receipts, provides scoped owner pagination, preserves eligible legacy snapshots with explicit gaps, and fences old writers in PostgreSQL. Fresh installation and existing-data upgrade passed; 71 Go root groups plus 55 subcases passed under race detection with no skips, as did both affected Python â†’ Go process tests on the separate 55494/8195/8196 profile. Seventeen deliberate control faults were detected; an initial noncompiling mutant, the upgrade trigger failure and environment/format observations are retained separately. No paid calls or real bank effects. Fixture rows and temporary databases were removed, the owned cluster stopped and ports released. Current independent review, human Verification and production evidence-retirement decisions remain pending; no story Done or production approval follows.

Full case outcomes, commands, source/artifact fingerprints, costs/unknown usage and retained failures belong in the linked reports. Historical classifier/refactor reports retain their original revision attribution and paths/hashes; removed prose is available in Git at those revisions. Do not copy reports into new per-change handoffs or label an old provider/review run as qualification of changed code.

## Coverage and expected behavior

| Boundary | Executable evidence |
| --- | --- |
| Verified identity/current grant, tenant/member separation and account scope | Auth/API tests, PostgreSQL RLS cases, refined verification and resource-disclosure regressions. Denied access performs no forbidden inference/read/disclosure. |
| Explicit/preferred/ambiguous account selection, zero/decimals/freshness | Coordinator/workflow/API/refined tests and independent financial oracles; new requests read the source, while idempotent replay preserves its original observation. |
| Tenant backend/credential/context selection and source provenance | `tests/test_tenant_backend_contract.py`, `tests/test_tenant_backends_postgres.py`; bank/fixture failures never substitute money or another tenant. |
| Model proposals, provider failures and budgets | Adapter/coordinator tests enforce allowed capabilities/accounts, parsing, bounded attempts/deadlines, atomic grant/day charging and safe failure. Registered-profile stateless failover has separate transient-error, eligibility, accounting and recovery checks above; native adapter invocations remain single attempts. |
| Model privacy and protected data lifecycle | Data-boundary/resolver/lifecycle tests enforce final current-policy disclosure, normalized account aliases, caller/purpose/field binding, encryption context, legacy inference backfill, preference deletion, expired continuation and replay-safe cleanup. |
| Task correlation, concurrency, idempotency and streaming | PostgreSQL/API/coordinator/resource-disclosure and conformance cases; duplicate submission/replay does not repeat effects/inference. |
| Verifier sensitivity | Evaluation-oracle tests reject wrong money/account/currency, unauthorized reads hidden behind denial prose and false zero-success. `scripts/mutation_check.py` challenges controls in disposable copies, including disclosure, continuation, caller binding and lifecycle. Each manifest identifies the controls actually run for its candidate. |

Expected behavior comes from contracts, product rules and the live parent/Verification criteria, not implementation-derived expected values. Synthetic evidence does not prove real bank identity trust, native consumer behavior or production readiness.

## Substantive historical review findings

| Reviewed work | Finding and correction | Review disposition |
| --- | --- | --- |
| Task delivery/monitoring, initially `c5745b4` | P1/P2: batch preparation exhausted leases, retained an earlier authorized result across later revocation, and the consumer delayed rendering across later reads. P2: watch creation ignored conversation expiry and replay depended on expired source/deadline. P3: reference consumer used the authority port. Late fenced leases, single-view claims with bounded draining, immediate per-view callbacks, caller-bound replay and conversation deadline margins correct these defects. | Primary and independent cross-model (`gpt-6-astra`) sessions rechecked through `e0459da` and reported no remaining blocking findings. Reproduced failures and rechecks are preserved in [the manifest](../SOURCE_REFERENCES.md#source-1fe0379381bc); automated review does not close independent human acceptance. |
| Data boundaries, initially `1caaea5` | P1: revocation during budget reservation could still allow inference. P2: case variants bypassed account-label masking. P2: legacy inference could remain plaintext after backfill. `e8ee851` reauthorizes the exact route after awaited work, normalizes masking with collision handling, and protects unversioned inference through forward migration/backfill. | Primary recheck passed 64 selected tests on an independent PostgreSQL cluster and repeated the label/collision reproduction. Independent cross-model (`gpt-6-astra`) recheck passed 23 tests and repeated planner/router revocation with zero outbound calls. Both closed their findings; [the manifest](../SOURCE_REFERENCES.md#source-74ee1a333329) preserves exact revisions and boundaries. |
| Original engine, initially `192ed06` | P1: stored balances remained visible after a grant narrowed; P2: fresh clarification choices could outlive authority changes during inference. `f048427` reauthorizes fresh publication and saved task/event/JSON/SSE disclosure, including every choice and removed ownership. | Separate primary/cross-model rechecks confirmed the engine corrections. [Reviewed manifest](../SOURCE_REFERENCES.md#source-6bbb6e36f163) and [control mutations](../SOURCE_REFERENCES.md#source-1432403b804e) retain evidence. |
| Original diagnostic, `256aea2` | P2: a transport/non-JSON failure could escape before writing a failed report, leaving stale success evidence. The harness now preserves failed observations, stops without retry, replaces its report and records fixture-restoration failures honestly. | Final targeted primary (`gpt-6.1-sol`, 8 checks) and cross-model (`gpt-6-astra`, 7 checks) reviews confirmed the correction; runtime stayed at the engine fix. [Hardened conversation evidence](../SOURCE_REFERENCES.md#source-3a21d9156e25) and [earlier observation](../SOURCE_REFERENCES.md#source-963c9c1208cd) remain distinct. |
| Coordinator refactor, initially `f4126f2` | Canonical account IDs became text hints, native usage extensions were lost, and JWT configuration errors could leave stale eval evidence. Exact IDs now survive routing, usage extensions are retained, and JWT failures stop safely and replace reports. | Both targeted reviewers confirmed fixes at `8739367`; probe/archive corrections were checked through `d3a0ec4`. Primary passed 75 checks, cross-model 54. [Structured review](../SOURCE_REFERENCES.md#source-27fecfade378) and [package smoke](../SOURCE_REFERENCES.md#source-d468bc248547) retain detailed attribution. |

These reviews apply to their recorded revisions and scopes. Current data-boundary rechecks do not retroactively approve other historical candidates or close human critical-control review and IDE-170 independent acceptance. Developer checks and control mutations do not replace those gates.

## Failures retained and acceptance still open

The temporary, restricted Gemini Computer Use demonstration was checked with synthetic PostgreSQL and Chromium fixtures and mocked provider responses. A live Gemini request also selected a product link in an isolated synthetic shop through the durable browser task; planning and final verification used controlled responses. [Its verification record](../SOURCE_REFERENCES.md#source-face35a47299) records failures, fixes and scope; it does not establish general interactive browsing or production readiness.

The earlier direct Gemini eight-case run failed; a separate diagnostic returned billing HTTP 402. See [failed cases](../SOURCE_REFERENCES.md#source-26f88b19eefa) and [access diagnostic](../SOURCE_REFERENCES.md#source-f3ea1cf399f1). Later successful OpenRouter qualification is a separate explicit profile, not a relabelled Gemini pass.

The provider manifest retains the original long-run database/deadline anomaly (root cause unproven), the Windows shared-temp ACL failures, and the later passing full run using a fresh worktree-local temp directory. The tenant manifest retains the preimplementation wrong-fixture red case and a new test's Windows Proactor fixture setup error, corrected by declaring that test async. No assertions, expected behavior or timeouts were relaxed.

The data-boundary manifest retains the review regressions before correction, JSON-null backfill and lifecycle row-lock privilege failures, an initial interrupted cleanup run with unproven wait cause, and a missing test-temp parent setup failure. Forward fixes and a fresh isolated temp directory preceded the final passing run. An interrupted earlier mutation run is not counted as a pass. The final package matches the tested source; remote freshness remains unverified because Git authentication rejected the fetch. Native documentation mirrors remain marked stale; no external writes occurred.

- IDE-167 permits controlled test data, but native consumer contract agreement/adoption and independent IDE-170 acceptance remain unproven. Use the existing child; do not create another one.
- Sprint 2 canceled legacy IDE-165/168 on 26 October. IDE-176 supplies the new-engine integration; its independent child is IDE-182, initially unassigned in Backlog. IDE-166/169 still require actual app/SDK builds, trusted session mapping and correlated source/UI evidence; the local controlled sandbox does not establish those results. See [integration context](../../product/INTEGRATION_CONTEXT.md).
- Each tenant needs its own verified identity/account/grant/available-to-spend mapping and sandbox acceptance behind [the minimum ports](../../contracts/TENANT_BACKENDS.md). A playground read does not provide that mapping.
- Human-approved held-out cases, Spanish rubric/gates and budgets, required current reviews, actual remote CI/protections and production operating/data-policy approval remain separate work. Production promotion stays human-controlled.

Scope authorization for the controlled implementation was supplied on 19 October under ADR-001/002/003, later extended explicitly to provider adapters and multi-tenant backend connectivity. These scoped requests did not accept every proposed ADR or approve production. Current behavior/configuration is documented in the contracts and [setup guide](../SOURCE_REFERENCES.md#source-8f929a906ccd); no standalone implementation plan is needed.
