> **Imported context ? Ideeo-IA-general ? working-tree reference, 2026-11-18.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../../README.md).

# Ideeo and OpenMausBot: architecture review and runtime comparison implementation handoff

Date: 17 November 2026.

Status: detailed proposal and implementation handoff, explicitly requested by the user. The comparison and replacement described here have **not** been implemented or benchmarked by this review. This file is not an accepted ADR, an authorization to deploy, a production qualification, or a grant of paid-call budget. A subsequent implementation request can authorize the bounded work below without needing to rediscover its design. Human acceptance and production promotion remain separate.

## 1. Decision and purpose

Keep Ideeo's product services, independent authority, trusted tenant routing, externally consumed contracts, and useful behavioral tests. Stop extending its present conversation/browser orchestration through another open-ended series of local repairs. Test whether an OpenMaus-derived conversational and browser execution runtime can replace that orchestration with fewer interacting components.

Do not equate keeping this Git repository with preserving its current Python planner. Do not equate adopting OpenMaus's agent loop with adopting OpenMaus's complete desktop/workspace application. The strongest candidate is a different runtime inside the existing engine product, consuming the existing authority and tenant services.

Build and compare:

- **A: existing Ideeo orchestration with the OpenMaus browser worker.** Preserve its actual interpretation, requirements, evidence, presentation and task pipeline. Freeze the exact version; do not quietly improve A during a measured comparison.
- **B: a thinner OpenMaus-derived conversation runtime plus OpenMaus-derived research worker, behind Ideeo's authenticated API, current authority, data policy and durable resource/task ownership.** B bypasses the legacy conversation planner and browser orchestration on its explicitly admitted experimental path. It does not bypass security, banking or delivery invariants.

B must replace behavior, not add another planner in front of A. It should use the native model/tool iteration directly, with explicit transport and tool hooks. It must not launch OpenMaus's complete application just to obtain an agent loop.

The experiment must answer two separate questions:

1. Does B complete representative authenticated user journeys more reliably and efficiently under the same substantive controls?
2. Does B reduce custom orchestration, duplicate state and integration coupling enough to justify replacing A?

A faster standalone browser demo cannot answer either question on its own. Conversely, existing code volume and thousands of green tests do not justify preserving a poor orchestration design.

## 2. Evidence snapshot and scope

### 2.1 Revisions

| Item | Inspected state |
| --- | --- |
| Ideeo active branch | `feat/engine-owned-openmaus-browser` |
| Ideeo HEAD and local `dev` | `68749d1` |
| Missing local integration commits, `HEAD..dev` | 0 |
| Git history window | 27 October through 17 November 2026; history review used Mexico City boundaries |
| OpenMausBot local branch | `main` |
| OpenMausBot revision | `263d9b79b1164510718994d65dd678f266a61b3e` |
| Pending Ideeo work | Uncommitted engine-owned OpenMaus vendoring, explicit hooks, packaging and tests |
| Remote freshness | Concierge could not be reached during the initial review; conclusions concern local `dev` |

The initial review used three parallel code/history reviews and inspected local Codex session history. It inventoried 59 prior top-level session records in the date window, screened their requests/results, and read the relevant architecture and browser discussions in depth. This was not an exhaustive security audit of every source line or every session tool output.

All code metrics below refer to the inspected snapshot. All runtime results are **retained historical evidence**, not new executions performed for this document. Developer checks, independent human acceptance and production approval must remain distinct.

### 2.2 How to interpret paths

Ideeo paths in this document are relative to the repository root. Markdown links use `../` because this artifact is in `output/`. Paths prefixed **OpenMausBot:** are relative to that separate repository. Do not make a sibling workstation path a build dependency. Proposed paths are explicitly marked **NEW**; they do not exist merely because they appear here.

The uncommitted snapshot under `tools/openmaus/upstream/` corresponds to the pinned OpenMaus revision plus local modifications. Do not treat it as an untouched upstream tree. Preserve and fingerprint it before any future implementation; do not discard, stash or commit somebody else's work automatically.

### 2.3 Governing documents

Read and preserve the actual acceptance status of these sources:

- [Project context](../../product/PROJECT_CONTEXT.md), [integration context](../../product/INTEGRATION_CONTEXT.md), [UX](../../product/UX.md).
- [ADR index](../../decisions/README.md), especially ADR-008, ADR-010 through ADR-016. ADR-016 is present in the pending working tree, not committed `dev` at the inspected revision.
- [Shared interface](../../contracts/SHARED_INTERFACE.md), [capabilities](../../contracts/CAPABILITIES.md), [tenant backends](../../contracts/TENANT_BACKENDS.md), [authority](../../contracts/AUTHORITY.md), [host banking](../../contracts/HOST_BANKING.md).
- [Agent coordination](../../contracts/AGENT_COORDINATION.md), [background tasks](../../contracts/BACKGROUND_TASKS.md), [service integrations](../../contracts/SERVICE_INTEGRATIONS.md), [provider profile](../../contracts/PROVIDER_PROFILE.md).
- [Data lifecycle](../../product/DATA_OWNERSHIP_AND_LIFECYCLE.md), [methodology](../../policies/METHODOLOGY.md), [AI development](../../policies/AI_DEVELOPMENT.md), [testing ownership](../../policies/TESTING_OWNERSHIP.md), [readiness](../../policies/PRODUCTION_READINESS.md).
- [Setup](../SOURCE_REFERENCES.md#source-8f929a906ccd), [verification](../development/VERIFICATION.md), [software verification workflow](../../workflows/SKILL_TEST_SOFTWARE.md).

This proposal changes internal orchestration and potentially the coordinator/presentation implementation. It does not silently supersede those contracts. Record the selected direction in a new ADR or explicit successor to the applicable ADR when implementation is authorized; allocate its number from the then-current index, rather than assuming the next number now.

## 3. Findings from the original analysis

### 3.1 Patch accumulation is supported by evidence

The window contains 209 reachable commits, including 207 non-merge commits. Of those non-merge subjects, 76 begin with `fix`, 40 with `test`, 31 with `feat`, and 31 with `docs`. Many subjects use other wording, so these are not a complete semantic classification. Seventy-seven commit subjects mention browser. November 6 and November 12 contain 42 and 41 commits respectively.

| Hotspot at committed `dev` | Physical lines | Commits touching it in the window |
| --- | ---: | ---: |
| `src/ai_engine/capabilities/assistant.py` | 3,939 | 41 |
| `src/ai_engine/capabilities/presentation.py` | 1,742 | 35 |
| `src/ai_engine/capabilities/planning.py` | 2,018 | 31 |
| `src/ai_engine/browser/public_site.py` | 2,508 | 28 |
| `src/ai_engine/browser/public_tasks.py` | 2,406 | 16 |

The Python core contains 54,944 physical lines in 192 files. These are descriptive physical counts, including comments/blanks, not complexity scores. Cumulative non-merge additions/deletions in the window were 46,910/5,400 under `src/ai_engine`, 72,237/2,619 under `tests`, and 80,231/242 under `evals/reports`. Total repository growth therefore substantially includes tests and reports, not only product logic.

The more significant findings are structural:

- `AssistantService._run`, beginning around line 2441, spans about 1,405 lines. It combines interpretation, current state, task controls, banking routing, dispatch, recovery and presentation.
- `CapabilityPlanner.capture`, beginning around line 879, spans about 1,140 lines. Around line 1198 it strips/revalidates optional display selections and reconstructs plans after invalid span/output cases. Private pending-value restoration later in the method is a real privacy requirement but is entangled with this planning machinery.
- `AssistantService` contains multiple public-task fallback and repair paths. These are useful mitigations but enlarge the interaction surface of subsequent changes.
- `PublicResearchTasks.advance` handles requirements revisions, source snapshots, assessment, finalization, cleanup, budgets and backend selection in one large flow.
- `browser/openmaus.py` reaches through `tasks.background.assistant`, repository/store budget accounting and `resource.payload["public_research"]`. The adapter needs more task-engine knowledge than a stable runtime boundary should require.
- `BackgroundService.__init__` takes the whole assistant, borrows its dependencies, adds mission/public-research runtimes, and mutates assistant handlers. Directory separation does not provide clean dependency ownership.
- Several browser generations coexist. Some have legitimately different purposes, especially read-only research versus effect-capable services; they must not all be deleted as duplicates. Nevertheless, indefinite coexistence without retirement conditions multiplies maintenance.

See [assistant](../SOURCE_REFERENCES.md#source-4a066f417fc2), [planner](../SOURCE_REFERENCES.md#source-5b77e961975b), [public tasks](../SOURCE_REFERENCES.md#source-20824b858463), and [background service](../SOURCE_REFERENCES.md#source-015fa588c6b1).

### 3.2 Three causes of churn

**Necessary product controls:** tenant-specific backend selection, independent authority, protected approvals, revocation, uncertainty/reconciliation, current-disclosure checks, encryption, retention, replay and durable delivery. These remain regardless of runtime language or browser library.

**Changing product ownership:** `9533e75` added enrollment across channels on November 1, touching 44 files with 5,951 additions. `aa8bc50` moved execution to tenant APIs on November 2, touching 44 files with 537 additions and 4,602 deletions after the ADR-011 boundary was confirmed. A different repository cannot prevent implementing unsettled ownership twice.

**Avoidable orchestration coupling:** repeated changes to interpretation, corrections, captured evidence, task addressing, completion and presentation. This is the primary replacement target. Do not defend it merely because the security controls around it are necessary.

### 3.3 Browser development chronology

| Date / commit | Observed direction |
| --- | --- |
| October 30, `4d8ac3e` | Bounded Gemini computer-use demonstration |
| October 31, `69f8636` | OpenMaus-inspired mission coordination without importing the complete application |
| November 8–9, `71df562`, `f9674fc` | Isolated Browser Use preparation and upstream Agent navigation |
| November 10, `9d15b81` | Registration in normal engine runtime |
| November 11–13 | Repeated startup, source attribution, correction, evidence and reply repairs |
| November 13–14, `0c3affa`, `00d0366` | Network changes and broader native public-browser behavior |
| November 16, `feae0d8` | OpenMaus worker integration |
| November 17, `68749d1` | Conversation continuity and presentation repairs |

Useful session landmarks: October 27 “Assess OpenMausBot architecture”; October 31 “Compare OpenMausBot designs”; November 12 “Analyze browser-use session issues”; November 14 “Diagnose browser-use failures”; November 15/16 reliability and stage reviews; November 16 “Test browser task reliability” in OpenMausBot and “Revisa propuesta de navegador”; November 17 “Verify outsourced browser use”. Session messages are explanations and claims to cross-check against source/reports, not acceptance evidence by themselves.

Earlier advice to preserve the existing execution loop because the architecture already described one should be revised. A described loop is not evidence that its implementation is the best foundation. Repeating “keep ours and borrow selectively” without specifying what will be removed risks recreating the current outcome.

### 3.4 Product outcomes lag behind test volume

- The November 12 interrupted campaign recorded nine completed conversations plus one partial, eight failed research tasks, one correct cancellation and no verified research outcomes. Failures included generic progress in place of answers, rejected corrections and cross-doctor attribution. The report recorded 306 reserved model calls; reserved is not necessarily identical to completed/billed calls.
- A later seven-case useful-browser campaign improved to six passes and one failure. Comparison evidence was lost under storage pressure and the harness exhausted its ceiling. This establishes progress, not complete qualification.
- Another later campaign had ten conversations reach six valid turns, with only one meeting the strict verified-research gate. Subsequent cases hit provider quota exhaustion; those must not all be attributed to browser architecture.
- The latest retained 47-turn PayMe development review, across 11 conversations, recorded two `provider_invalid_output` errors. Broad follow-up/retry failed despite retained evidence while an exact saved-example request succeeded. A useful immediate fallback did not survive reloaded history.

The last run used synthetic PayMe, Railway development, `payme-app`, profile 8, real `gpt-6.1-sol`, and a fingerprinted deployed increment over `92f0b32`. It is not a fresh full verification of all files at `68749d1`, a cross-tenant qualification, independent human acceptance or production approval.

The exact rejected provider field/root cause in that last run was not established. Treat the failed provider-to-public-answer boundary as observed, and more specific causal explanations as hypotheses.

Evidence entry points: [verification index](../development/VERIFICATION.md), local `.runtime/browser-stabilization-20261112/configured-conversations-03/interruption.json`, and `.runtime/payme-thorough-20261117/review.json`. Ignored `.runtime` artifacts may not accompany a clone. Preserve those failures in a durable, sanitized report before relying on them for a shared implementation decision.

### 3.5 Valuable existing domain foundations

Preserve behavior, not necessarily every wrapper:

- `capabilities/operations.py`: repository/authority/bank ports, exact proposal binding, permits, expiry and reconciliation of uncertain effects. Its `OperationService.execute` must not be replaced with an unconstrained model tool.
- `adapters/tenants.py`: trusted tenant resolution, missing/changed-binding rejection and no backend-failure fallback to another tenant or fixtures.
- `resources.py`: caller-scoped resources, durable reservation/replay, parent binding and concurrency checks.
- `authority/`: independent Go authentication, mandates, reservations, approvals, execution, callbacks and browser-session controls.
- `capabilities/host_banking.py`: protected host preparation and one-time consume.
- Existing disclosure, envelope encryption, lifecycle cleanup, outbox/delivery and meaningful negative tests.

These services can survive even if the conversational runtime is substantially replaced. Their existence supports retaining the product foundation; it does not require retaining the current planner.

### 3.6 OpenMaus advantages and debt

OpenMaus has real reusable infrastructure: native model/tool iteration, normalized events, streaming, scoped tools, steering, approvals, browser generations/recovery, takeover, routines and delegation. It also has substantive ACL, CSRF, scoped session, SQLite transaction and egress protections. It must not be portrayed as an insecure toy.

However, the inspected tree has 8,378 tracked files and 3,161 test-name files. A scoped count of selected non-test TypeScript/JavaScript sources was 538,323 physical lines across 3,349 files; exclusions and language differences make this unsuitable for a direct size ratio to Ideeo. `server/index.ts` is 15,442 lines, `server/store.ts` 2,289 and `src/state/store.tsx` 3,289. Its `server/host/README.md` and `scripts/testing/file-size-ratchet.test.ts` document active decomposition of large modules.

Its tenancy model is workspace/team/OS-user/service isolation, not the full bank tenant + customer membership + calling client + agent account + mandate model. `docs/verification/fleet.md` describes per-workspace directories/services and fences, and records remaining qualification limitations. `server/request-auth.ts` explicitly records a service-loopback trust risk. This is evidence of a different threat model, not a claim of a demonstrated exploit in the user's deployment.

Core source is Apache-2.0. `enterprise/LICENSE` is separate; production enterprise features and third-party hosting of that code have additional requirements. `enterprise/README.md` says portions of the hosted identity/control infrastructure are independently deployed and not shipped here. Do not count those as available reusable components. See [upstream core license](https://github.com/milind-soni/OpenMausBot/blob/263d9b79b1164510718994d65dd678f266a61b3e/LICENSE) and [enterprise license](https://github.com/milind-soni/OpenMausBot/blob/263d9b79b1164510718994d65dd678f266a61b3e/enterprise/LICENSE). This reports license text, not a legal opinion.

### 3.7 Retained OpenMaus results

The separate repository's `BROWSER_EVALUATION_AND_PROPOSAL.md` and `.omb-scratch/browser-eval/doctoralia-decision-summary.json` report:

- Ten of eleven general workflows reached a settled result, with cancellation checks passing; this is not the same as every assertion passing. A dynamic-search connection/evidence assertion failed, and a browser connection failure passed on repeat.
- Doctoralia with minimal instructions: 0/3 strict completions, with honest partials.
- Doctoralia with explicit completion instructions: 3/3 strict completions in 55–64 seconds.
- The previous Ideeo attempt took 808 seconds and remained incomplete.
- Installed Chrome failed while the pinned Chromium worked. Recorded browser steps lacked screenshots; these text results do not qualify screenshot evidence. The review also found synthetic form values retained despite an expectation otherwise.

This was not a controlled head-to-head comparison. Wrappers, policies, budgets and environments differed. It supports evaluating the OpenMaus loop, not claiming a speedup ratio or selecting the entire repository.

### 3.8 Pending integration is broad vendoring

Committed A uses a version-specific preload seam: `globalThis.fetch` interception, `ChatMcpClient.prototype.call` replacement and literal prompt substitutions. ADR-015 explicitly acknowledges internal-interface coupling.

Pending A improves this with `server/engine-runtime.ts` and explicit model/MCP hooks. But its manifest contains 7,192 files: 3,226 under `server`, 2,139 under UI `src`, 533 under `electron`, 340 under `scripts`, plus other application components. `worker.mjs` still imports `verificationServerArgs`/`runControlOmb`; the helper launches `server/index.ts`. Docker copies the broad workspace.

The pending `engine-binding.mjs` rereads URL/title/body and up to five selected excerpts after browser calls. It can collect 48,000 characters while Python retains at most 24,000 assessment characters. Goal revision restarts the worker; native final text does not directly establish completion. Those controls address real concerns, but create additional failure/latency paths and potentially different evidence views.

The November 17 session explicitly says the pending implementation had not been tested with real OpenAI and a live browser journey. Its 258 passing controlled checks are not live end-to-end evidence. Do not relabel it a proved minimal library extraction.

## 4. Scope of the proposed comparison

### 4.1 Included experimental behaviors

Use explicitly synthetic tenants and authority contexts. Exercise actual authenticated engine APIs, real PostgreSQL, actual Go authority for the combined system tier, actual Temporal for restart tests, and controlled browser fixtures first. Paid/public-site trials are a later separately budgeted tier.

Include ordinary conversation; public research; task listing/status/evidence questions; corrections; cancellation; reconnect/replay; provider failures; source-backed answers; and app-host balance/history intent handoff without displaying bank values to the model/chat.

Initially retain existing protected banking handlers and exact deterministic customer controls. Do not require B to replace every banking conversation, WhatsApp path, service provider, model provider, voice capability, mission graph or memory subsystem to answer the experiment. Unsupported experimental paths must be clearly identified, and must not be hidden inside an aggregate score.

### 4.2 Explicit exclusions

No real-customer model disclosure, live login/account sessions, ordering, booking, contact submission, money movement, card data, arbitrary shell/JavaScript execution, uploads, screenshots-to-model, desktop control, custom MCP mounting, provider discovery or implicit provider fallback. Public-site access remains within the existing qualified synthetic scope. A list of denied button words is not proof arbitrary website interaction is effect-free; use safe fixtures for effect-denial assertions and disclose the limits of public trials.

Do not move bank cores, ledgers, enrollment execution, WhatsApp webhooks or native SDK/app code into this repository. Another bank's AI delegating reasoning and an external agent calling banking APIs remain separate paths. B's experiment does not reroute the latter through a model.

### 4.3 Baseline identities

Define these immutable run labels:

- `A0`: committed `68749d1`, existing OpenMaus worker path.
- `A1`: pending internalized worker snapshot, if chosen and independently fingerprinted. Do not call it A0 or assume its evidence carries over.
- `B1`: native conversation loop, retaining A's public-research backend and task implementation to isolate conversation effects.
- `B2`: native conversation loop plus thin research runtime, at its exact implementation revision/artifact hash.

Choose one A as the primary comparator before running. Recommended sequence: reproduce A0 with the pinned upstream/runtime; smoke A1 separately if it is intended to become the operational baseline; compare B1 against the selected A, then compare B2 against both. A failure to reproduce A is recorded, not silently repaired and assigned the same label.

Use one source/configuration/model/browser/environment manifest per run. Dirty snapshots require a deterministic path/hash manifest and diff identity, not only `git rev-parse HEAD`.

## 5. Target architecture and ownership

```text
Tenant SDK / verified tenant-channel backend
  -> existing authenticated Ideeo HTTP/SSE API
  -> shared turn envelope: caller binding, request reservation, lease, disclosure
  -> trusted per-conversation runtime selection
       A -> existing AssistantService planner/dispatch/presentation
       B -> native conversation driver -> restricted engine tool gateway
                                  |-> task status/evidence/questions
                                  |-> start/correct/cancel research
                                  |-> existing protected host handoff
  -> engine-owned public outcome validation and persistence
  -> existing task/history/replay/delivery interfaces

Research task, both variants:
  authoritative resource + budgets + revisions in Ideeo/PostgreSQL
  scheduling and wake/recovery in Temporal
  disposable browser/agent process with fenced owner generation
  independent authority and trusted model/data route before execution/disclosure

B research worker:
  native OpenMaus model/tool loop -> policy gateway -> pinned browser
  one observation identity -> model context + persisted evidence + outcome checks
```

### 5.1 One owner per responsibility

| Responsibility | Owner |
| --- | --- |
| Customer identity, tenant/client/grant binding | Existing verified engine principal and independent authority |
| Runtime selection and model/provider configuration | Trusted engine configuration, pinned to conversation/task |
| Conversation turn admission, idempotency, lease, public history | Ideeo turn envelope and resource repository |
| Research task state, goal revision, budgets, command receipts | Ideeo resource/task service |
| Wakeups/timers/restart scheduling | Existing native Temporal integration |
| In-memory model/tool iteration | OpenMaus-derived driver in B |
| Browser process/tab state | Disposable browser host owned by the fenced worker |
| Customer-facing wording | B's engine-integrated concierge, validated before publication; research worker cannot publish directly |
| Financial approval and execution | Existing protected host/authority/operation services |
| Completion/evidence acceptance | Engine checks against persisted source observations and requirements |

The conversation driver and research worker have different roles. A long research loop must not hold the conversation lease or block a customer from asking status, changing constraints, or stopping. Reusing the same native driver implementation for these two roles is appropriate; creating competing durable schedulers is not.

### 5.2 Avoid a second application inside the engine

B must not instantiate OpenMaus `Store`, `Registry`, HTTP routes, chat UI, bots, routine scheduler or workspace identity layer. Its `hasSession()` reports in-memory runtime state, not persistent conversation ownership. PostgreSQL remains the authoritative source of retained state. No Node SQLite task/conversation database is introduced.

Retain compatible interfaces for A during the experiment. In-flight A tasks keep A until drained or explicitly cancelled. No live task is reinterpreted as B because a global flag changed.

## 6. Exact OpenMaus extraction seam

### 6.1 Entry point and interfaces

OpenMausBot: `server/drivers/openai-chat.ts` exports `createOpenAIChatRuntime<Config>(options: RuntimeOptions<Config>): ProviderInstance` around line 204. Its model/tool loop begins around line 621. This is the candidate entry point. It does not require the full application server.

Use `ProviderInstance.adapter` and the contracts in OpenMausBot: `server/contracts.ts`:

- `sendTurn(input)` starts a turn; return is not a completion signal.
- `onEvent(listener)` must be subscribed before `sendTurn` to avoid missing early events.
- `steer(threadId, text)` returns `steered`, `refused` or `indeterminate`.
- `interruptTurn(threadId, turnId?)` aborts and waits for the native turn.
- `respondToRequest(...)` handles native questions/approvals but does not grant banking authority.
- `stopAll()` and `ProviderInstance.dispose()` participate in shutdown.

`SendTurnInput` provides text, transcript, system/stable/volatile instructions, model, tool scope, approval mode and tool integrations. It is not an authority envelope. Server-trusted principal and resource binding remain outside model-visible arguments.

`sendTurn()` creates its own native turn ID. Persist a mapping between the accepted engine turn, native turn ID, native tool-call ID, engine execution slot and owner/goal revision. `interruptTurn(threadId, turnId?)` compares the native ID; passing the engine turn ID would not identify the intended native execution. Native session continuity is in-memory execution continuity, not durable conversation history.

`onEvent()` is synchronous: native emitters do not await a Promise returned by a listener. Use a bounded ordered event queue, fail closed on overflow, and enforce persistence/backpressure at the awaited `modelFetch` and `tools.execute` hooks. Completion waits for durable processing of the terminal candidate. Test stalled persistence prevents every subsequent model/tool dispatch; an asynchronous event callback alone does not establish this property.

Avoid using `OpenAICompatDriver.create()` as the permanent minimal entry: its provider discovery, ambient environment/key selection, Ollama probing and OpenRouter logic are unnecessary for a fixed engine-approved route. Tests may compare it for compatibility; the experimental runtime must have explicit configured behavior.

### 6.2 Dependency work required

The direct constructor is a credible seam, not a proved drop-in library. Its import closure currently reaches product concerns:

| Existing OpenMaus path | Coupling to remove or inject in the derived runtime |
| --- | --- |
| `server/drivers/openai-chat.ts` | Direct `mountChatTools`, `refitChatTools`, notices and transport dependencies |
| `server/drivers/chat-mcp-tools.ts` | Product config, AppObserver, app mounts, gates, cloud-home, custom MCP and connector discovery |
| `server/drivers/native.ts` | Native log directory derived through product config |
| `server/config.ts` | Broad defaults/features and environment/home reads at module initialization |
| `server/turn-continuation.ts` | Filesystem handoff persistence containing task/tool-derived content |
| Tool-budget reporting | Module-global state keyed by bot ID |
| `chatMcpEnvironment()` | Ambient environment then denylist stripping; insufficient as the engine worker environment policy |

Add an explicit exported `RuntimeHost` dependency to the derived `RuntimeOptions`, with transport, tool mounting, log/handoff sinks and observation/accounting callbacks. In the engine build every required host hook must be supplied; missing hooks fail before provider/network/browser activity. A compatibility build of the original application may retain its existing defaults, but those defaults cannot enter B's bundle transitively.

Preserve the native iteration, parsing and protocol recovery logic rather than recreating it in Python. Do not quietly inherit retries, compaction calls, probes or correction rounds without budgeting and recording them.

### 6.3 Browser substrate

Preserve the **agent-browser** path used in the retained successful evaluation. Do not switch to the newer CDP `ChromeEngine` while testing the orchestration hypothesis.

Relevant OpenMaus files/symbols:

- `server/browser-runtime.ts`: `BrowserRuntime.agentRpc(...)`, `close()`, `closeAll()`.
- `server/browser-engine.ts`: `agentBrowserIntegration(...)`, `closeBrowserSession(...)`.
- `server/browser/egress/gate.ts` and `policy.ts`: egress proxy and destination restrictions.
- `server/host/browser.ts`: useful composition reference, but `createBrowserHost()` pulls application config, store and audience/workspace concerns and should not become the minimal entry.

`agentBrowserIntegration` requires explicit binary, session identity, encryption key, persistence choice and egress port. Do not remove the egress gate to make a smoke test pass. Preserve DNS/address/redirect handling and metadata/private-address restrictions at actual network dispatch, not just model-request URL validation.

`agentRpc` has a synchronous `beforeDispatch` hook, but is not a ready-made universal asynchronous authority gate. Its launch, recovery and internal observation paths contain awaits and additional RPCs. Add and test an unconditional local generation/abort check immediately before each actual `entry.client.rpc` or relay dispatch, after asynchronous authority/admission work. Route internal source reads through the same accounting and policy boundary rather than granting them an implicit bypass. Revocation prevents later dispatch; it cannot retroactively undo an already-started external operation.

Test invalidation during browser launch, lane/queue waits and `steps.before()`, not only immediately before entering `agentRpc`. Inventory trusted internal URL reads, fixed observation JavaScript, viewport adjustments and recovery RPCs. They need the same deadline/fence/accounting rules even though the model cannot select them directly.

### 6.4 Proposed Node files

All files in this table are **NEW** unless stated otherwise. Keep them in a separately packageable directory rather than changing the sibling OpenMaus checkout.

| Ideeo path | Responsibility |
| --- | --- |
| `tools/openmaus/runtime/main.ts` | Validated boot, JSONL input/output, start/steer/answer/cancel/close, no app server |
| `tools/openmaus/runtime/protocol.ts` | Versioned strict wire schemas, correlation, revision/generation, bounds |
| `tools/openmaus/runtime/provider.ts` | Fixed model configuration and direct `createOpenAIChatRuntime` composition |
| `tools/openmaus/runtime/host.ts` | Native event listener, one process-local session owner, acknowledgement/backpressure |
| `tools/openmaus/runtime/tool-session.ts` | Restricted `ChatToolSession` implementation; no generic integration mounting |
| `tools/openmaus/runtime/browser-host.ts` | Agent-browser lifecycle, egress, explicit environment and process cleanup |
| `tools/openmaus/runtime/evidence.ts` | Observations/receipts from actual tool results; no blind second capture loop |
| `tools/openmaus/runtime/event-map.ts` | Native events to internal protocol; no raw event forwarding to customer |
| `tools/openmaus/runtime/package.json` | Minimal pinned dependency/build/test entry points |
| `tools/openmaus/runtime/tsconfig.json` | Selected runtime sources only |
| `tools/openmaus/runtime/build.mjs` | Bundle and emit exact import/dependency manifest |

Create a small source subset under **NEW** `tools/openmaus/runtime/vendor/` or another explicitly documented package root. Preserve original relative paths inside it. Do not duplicate the entire pending `upstream/` tree into this directory. Determine the exact closure by a build metafile, then remove broad dependencies through explicit injection. The dependency list cannot honestly be finalized before this extraction experiment.

During comparison, keep existing `tools/openmaus/worker.mjs`, `engine-binding.mjs` and `browser/openmaus.py` as A's implementation. Give B its own entry and Python adapter. Replacing A's worker during the experiment would destroy the baseline. Retire the full-app worker only after a separate winner/adoption decision.

## 7. Experimental stages and exact Ideeo integration

### 7.1 Isolate changes before combining them

Use three comparisons rather than changing every layer at once:

1. **A versus B1:** same research worker, authority, source policy, requirements/assessment implementation and durable scheduler; only conversation interpretation/tool orchestration changes. B1 calls existing `PublicResearchTasks.submit`, `BackgroundService` controls/views and source-selection functions. It proves whether the conversational bottleneck improves.
2. **B1 versus B2:** same native conversation driver; replace full-app browser hosting and overlapping research orchestration with the thin native runtime. Preserve the substantive requirements and evidence rubric. This tests the extraction/lifecycle hypothesis.
3. **A versus B2:** measure the integrated user outcome and total implementation cost. Attribute improvements using the earlier component comparisons.

B1 is a deliberately incomplete replacement experiment. Do not call it a thin end-to-end research system while it still runs the old requirements/assessment pipeline. B2 must not call `PublicResearchTasks.advance` merely behind a differently named adapter and claim that pipeline was removed.

### 7.2 Existing ingress and dispatch map

| Existing code | Responsibility / treatment |
| --- | --- |
| `api.py:create_app`, `bounded_request` | Keep body limits, safe errors, request identity and no-store behavior |
| `api.py:verified_principal`, `auth.py:TokenVerifier` | Keep trust verification and client-specific direct-banking restrictions |
| `capabilities/assistant_http.py:assistant_routes` / nested `submit` | Keep `POST /v2/turns`, JSON/SSE, prepare/replay, explicit task/watch/background branches |
| `AssistantService.prepare` | Keep authority context, secret-input check, account scope, request fingerprint, encrypted reservation and conversation lock |
| `AssistantService.run` | Insert trusted runtime dispatch after deterministic controls and before scoped `_run` |
| `AssistantService.deterministic_control` | Keep exact protected customer controls independent of model availability |
| `AssistantService.read`, `authorize_view`, `public_view`, `record`, `fail` | Keep current-authority disclosure, persisted event/outcome and safe error paths |
| `capabilities/history.py:transcript` | Keep scoped history and exclusions; test safe partial answer persistence explicitly |
| `capabilities/runtime.py:create_capability_runtime` | Wire the runtime port and policy dependencies |
| `background/worker.py:dispatch`, `background_worker_options` | Keep scheduling/outbox dispatch and original workflow compatibility |
| `background/service.py:authorized`, `control`, `command`, `step`, `view`, `record` | Retain common task binding/delivery; add explicit B2 authorization, disclosure and handler dispatch by stored runtime/schema |

Use `AssistantService.run` as the migration seam. Today it has a default-model and a published-profile branch, each constructing a scoped service and eventually calling `scoped._run`. Both should call a shared `ConversationRuntime` port after model/session setup. The legacy adapter simply invokes `_run`; B invokes the native worker bridge. B must not call `capture_plan` to select its tools, and must not be implemented as another large branch inside `_run`.

Exact `handoff_control`, `account_selection` and `contact_selection` paths retain deterministic execution. Initially, unsupported natural-language pending-bank/media cases fail experimental admission before inference. A request selected for B does not silently fall through to A after a parser error, provider error, task submission or tool attempt.

### 7.3 Proposed Python files

All files below are **NEW**. Use these names consistently in implementation/tests unless a reviewed refinement changes this manifest.

| Path | Proposed exported responsibility |
| --- | --- |
| `src/ai_engine/conversation/__init__.py` | Package marker |
| `src/ai_engine/conversation/runtime.py` | `ConversationRuntime`, legacy adapter, trusted selection/admission and immutable runtime binding |
| `src/ai_engine/conversation/models.py` | Strict configuration, turn context, tool proposals, receipts and runtime-journal models |
| `src/ai_engine/conversation/context.py` | Minimized context builder from existing authorized projections |
| `src/ai_engine/conversation/model_session.py` | Shared route/profile/context/deadline/budget/accounting guard, extracted from existing paths |
| `src/ai_engine/conversation/protocol.py` | Python models for the same versioned supervisor protocol as TypeScript |
| `src/ai_engine/conversation/openmaus.py` | Native process lifecycle, request/event bridge, cancellation and bounded I/O; no Python LLM planning loop |
| `src/ai_engine/conversation/tools.py` | Closed engine tool registry; call existing services through narrow ports |
| `src/ai_engine/conversation/journal.py` | Persisted tool admission/receipt/dedup/recovery semantics |
| `src/ai_engine/conversation/presentation.py` | Validate candidate dialogue/evidence selection and produce existing public outcomes |
| `src/ai_engine/browser/native_research.py` | B2 task handler: submit/read/command/advance, one authoritative lifecycle |
| `src/ai_engine/browser/native_evidence.py` | B2 observation admission and goal/evidence completion checks using shared pure validators |

Do not add a Python `tool_loop.py` that recreates the OpenMaus loop while labeling the result native OpenMaus reuse. The chosen B implementation uses the TypeScript runtime. A Python-inspired alternative would be a separately identified experiment.

Existing files to modify with bounded changes:

- `capabilities/assistant.py`: dispatch port, dependency extraction, runtime binding, lease-safe finalization.
- `capabilities/runtime.py`: composition; no model/client-supplied route selection.
- `settings.py`: explicit experimental configuration file reference and disabled default.
- `background/service.py`: B2 handler branch for stored runtime binding before legacy public-research dispatch in `authorized`, `control`, `step`, `command` and `view`; strict native payload validation/bounds before `record` persists it.
- `background/worker.py`: trusted B2 scheduling projection in `dispatch` and native supervisor shutdown in `run` finalization.
- `browser/public_config.py`: explicit trusted binding between research profile and B2 executor; retain existing backend meanings for A/B1.
- `api.py`: compose dependencies and native supervisor shutdown in lifespan teardown, including partial-start failure; retain existing ingress.
- `resources.py` only if a narrow reusable atomic journal helper is required; do not turn its generic payload validator into domain business logic.
- `schema.py` / a new forward migration only if existing encrypted resource/CAS primitives cannot provide the required atomicity. Never edit applied migrations.
- `scripts/test_suite.py` and relevant test configuration: explicit experimental tests/flags and paid-call isolation, after test files exist.

The ordinary v1 flow, external-agent banking API and unsupported channels remain on their existing implementations. The initial experiment routes entire explicitly selected conversations, not arbitrary messages opportunistically classified between A and B.

### 7.4 Trusted configuration and immutable selection

Propose **NEW** `ENGINE_CONVERSATION_RUNTIME_FILE` pointing to operator-controlled configuration, with strict schema in `conversation/models.py`. The name is proposed, not an existing setting. Initial fields:

```json
{
  "schema_version": 1,
  "bindings": [
    {
      "tenant_id": "synthetic-comparison-a",
      "client_ids": ["comparison-sdk"],
      "runtime": "openmaus_native_v1",
      "research_executor": "legacy_openmaus",
      "development_only": true,
      "enabled": false,
      "artifact_sha256": "REPLACE_WITH_VERIFIED_BUILD_DIGEST",
      "policy_revision": "comparison-policy-v1"
    }
  ]
}
```

This illustrative file is not deployable: its digest is a placeholder and enablement is false. Tenant names are synthetic examples, not additions to an existing real tenant registry. Proposed `research_executor` values distinguish B1 (`legacy_openmaus`) from B2 (`native_openmaus_v1`). Do not overload `browser_backend` to mean conversational runtime.

Verify tenant/client against authenticated identity, synthetic allowlist and current authority provenance. Resolve models, credentials, destinations and capability policy from their existing trusted registries; this file does not grant them. Unknown/duplicate bindings, malformed files or unavailable selected artifacts fail closed. No user field or prompt can select a runtime.

Persist runtime ID, protocol/schema version, artifact digest, policy/profile digest and research executor on the conversation and each accepted turn/task. A revoked binding stops new applicable inference/dispatch; it does not reroute an existing task. Current policy may tighten or revoke execution even when runtime identity stays pinned. Replays use saved validated outcomes and current disclosure checks, not a newly selected implementation.

**Required storage correction:** current `acquire_conversation` replaces the conversation payload with holder/deadline, and `release_conversation` replaces it with an empty object. Adding metadata only at initial reservation would lose it on the first turn. Change both compare-and-swap updates to preserve a strictly typed immutable metadata block while changing only lease fields, or introduce a separately scoped immutable binding record with equivalent lifetime. Prefer the former for this bounded experiment. Test acquisition, release, interruption reconciliation and replay all preserve the binding and cannot change it through an untrusted payload.

## 8. Context and model-policy contract

### 8.1 Do not overstate the existing sanitizer

`data_policy.py:ModelProjection.message` substitutes configured account IDs and disallowed labels. It is **not** a universal CLABE, phone, amount or arbitrary personal-data redactor.

The existing flow sends the permitted projected current customer message after safety/policy checks. Pending banking state is separately minimized to capability, missing fields and captured field **names**, then exact private values are restored locally after inference. Historical model context uses conditionally retained `dialogue_input`, not raw `customer_message`. These distinctions must survive extraction.

Reuse or extract:

- `AssistantService.dialogue_context` for authorized source-free prose and separately authorized observations.
- `AssistantService.background_context` plus `capabilities/public_answer.py:observation_model_context` for evidence/task projection.
- `ModelProjection` for current account aliases and exact server-side resolution.
- Existing pending-field-name projection in `CapabilityPlanner.capture`, without importing the entire planner to obtain it.
- `require_safe_model_input` over the complete final model envelope, not only the latest text.

Never serialize `Resource.payload`, full `AssistantView`, raw `PendingGoal`, `HostBankingInput`, approval terms or the customer-visible transcript into the native runtime prompt. An agent's earlier wording is not source evidence or authority. Opaque provider continuation must be separately classified and retained only if its privacy/recovery semantics are established; do not persist private reasoning as conversation memory.

For the first B1 milestone, use fresh synthetic public-only conversations. Reject unsupported pending bank/handoff/media state before inference. A synthetic flag is not a sanitizer. If a later scope promises removing current-message financial values, add and qualify an explicit local protected-input projection; do not claim `ModelProjection` already fulfills that promise.

### 8.2 Shared model session

Extract the shared guard from `AssistantService.run`, `capture_plan`, `check_model_route`, `ProfileModel` and `ObservedModel`. One subtle dependency matters: existing profile `before_attempt` compares against `inference_context_snapshot`, currently set by `capture_plan`. B bypasses that method and must explicitly establish/revalidate the snapshot before any call.

For **each actual outbound inference**, including native retries, final composition, compaction or other hidden calls:

1. Read the current conversation/task binding and deadline; check owner/cancellation fence.
2. Revalidate tenant/client/grant authority, synthetic eligibility, published assistant profile and approved model profile/data policy.
3. Build the permitted context and verify its binding/digest against the current snapshot.
4. Atomically reserve/debit the existing daily allowance and applicable per-task/campaign budget. Preserve configured zero-as-no-daily-cap behavior while keeping finite experimental task/campaign limits.
5. Recheck cancellation, revision and policy after awaited budget/context operations.
6. Send only through the engine-owned provider transport, with approved endpoint/model, `store: false`, bounded request/response/time, no redirects or ambient credentials.
7. Settle usage and safe diagnostics even on failure. Unknown usage/cost remains unknown; do not refund a possibly dispatched request or turn unknown into zero.
8. Recheck authority before releasing a returned response to the worker if it contains protected/controlled context. Discard stale output as applicable; it cannot authorize later tools.

Initially use the same explicit native OpenAI model/profile in both arms. Do not claim provider interchangeability for B or inherit OpenMaus provider auto-discovery. Existing stateless failover is a separate behavior; either preserve and qualify its permitted semantics or disable it equally for the comparison profile. Never automatically replay a stateful tool loop on another provider after uncertain tool execution.

Use a small transport port rather than reaching through `tasks.background.assistant.model`. The raw tool-capable provider envelope differs from the current structured planner's schema. The port must validate the exact approved function schemas, forbid hosted tools/images, and record actual attempts. Tests must prove native runtime calls cannot escape it.

## 9. Internal protocol and engine tool contracts

All names and schemas in this section are **proposed internal interfaces**, not new public HTTP APIs. Existing SDK request/response shapes remain unchanged.

### 9.1 Process transport

Use supervised stdio JSONL between Python and Node. Stdout contains protocol frames only; stderr contains bounded redacted diagnostics. No public HTTP server, `/api/bots`, fixture-control route, or ambient owner session is needed. If an internal browser MCP transport requires a socket, bind it to the isolated process context and enforce authentication/capability binding; loopback alone is not authorization.

Every frame contains:

```text
protocol_version = 1
kind = discriminated message type
correlation_id = engine-generated request/response ID
session_id = opaque server-generated scoped session identity
turn_id = accepted engine turn reference when applicable
native_turn_id = mapped native execution identity when assigned
task_id = accepted engine background task reference when applicable
owner_generation = engine-issued process ownership generation
goal_revision = accepted durable goal revision when applicable
sequence = monotonic stream sequence within this process generation
payload = strictly validated message-specific object
```

These fields are checked against supervisor state; Node echoing them does not establish authority. Full customer bearer credentials, signing keys and financial authority proofs stay in the engine. Do not expose tenant/member/client/grant IDs in the model prompt just because the supervisor needs their binding.

Control frames: `boot`, `start_turn`, `steer`, `answer_question`, `cancel`, `close`, `ack`. Worker frames: `ready`, `model_request`, `tool_request`, `observation`, `question`, `candidate_answer`, `turn_ended`, `closed`, `failed`. Corresponding responses carry the same correlation ID and either a validated result or a safe error code. Generated text deltas remain private until disclosure/presentation rules permit them; do not stream unvalidated factual claims as customer outcomes.

Native `item.completed` events with `assistant_text` can occur in intermediate tool rounds. `event-map.ts` must accumulate text by native turn and round and emit `candidate_answer` only once the corresponding terminal state is known and no required tool result remains outstanding. Intermediate plans/commentary are not completed answers. `turn_ended` still waits for the engine's evidence, persistence and disclosure checks before becoming a public completion.

Start with protocol byte ceilings no greater than the existing OpenMaus relay's 4 MiB request and 1 MiB provider-response bounds; set smaller message-specific bounds where existing schemas impose them. The encrypted resource payload limit is currently 262,144 bytes. These existing ceilings are upper bounds, not a recommendation to persist multi-megabyte frames. Record chosen experimental limits in the manifest and compare both arms fairly.

Reject unknown kinds, extra security-relevant fields, non-finite numbers, invalid UTF-8/JSON, oversized frames, stale generation/revision and unexpected correlations. Bound outstanding requests and stop reading/scheduling when persistence/backpressure is unavailable. EOF means parent loss: stop dispatch, abort the native loop and clean owned descendants.

### 9.2 Closed conversation tool registry

Expose only tools for the role. Conversation role does not receive raw browser tools; it schedules durable research and remains responsive. Research role receives only approved browser tools and bounded evidence/completion functions. Neither receives shell, filesystem browsing, arbitrary MCP, tenant administration or bank credentials.

| Proposed conversation tool | Arguments supplied by model | Trusted engine behavior |
| --- | --- | --- |
| `start_public_research` | Offered source-turn handle and exact token span; supported capability label | Resolve exact original text server-side, validate conversation/source scope, create one durable task |
| `read_task` | Offered opaque task handle | Authorize and return minimized status/accepted constraints/available observation handles |
| `control_task` | Offered task handle, action, offered revision/question handle, source span for correction | Bind exact task and accepted goal/question; execute control, return committed receipt |
| `answer_from_observations` | Offered observation handles and requested answer intent; optional bounded candidate wording | Verify current evidence, quotations, attribution and disclosure before producing public answer |
| `reply` | Source-free conversational wording | Validate no unsupported tool/effect/source claims; persist normal dialogue |
| `clarify` | Bounded question and offered choices if applicable | Persist question without implying execution |
| `open_host_banking` (later milestone only) | Allowed intent and server-issued account alias, no financial values | Existing `HostBanking.prepare`; return minimized status, deliver opaque host action outside model context |

Model arguments must not include principal, tenant/backend endpoint, credential alias, permission flag, approved boolean, monetary allowance, current source truth or arbitrary destination configuration. URLs requested by a customer are source inputs subject to trusted site policy, never a means of choosing bank/provider backends.

Use strict schema validation and engine-generated handles. A known handle is not permission: resolve it under current tenant/member/client/grant and conversation. Limit the tools advertised and executable to the same set; do not let a hidden native fallback mount additional tools.

For B1, disable native `ask_user` and use only the engine `clarify` surface. Set `ChatToolSession.view().ask` explicitly so engine-managed domain tools do not acquire a second native approval gate. If a later version needs native `request.opened`/`respondToRequest`, map it to the same durable engine question instead of exposing both. Native session grants, including an "always" grant, must never bypass current gateway authorization.

### 9.3 B1 service adapters

`start_public_research` builds an existing `CapturedTask` locally and calls `PublicResearchTasks.submit(principal, task, key)`. Preserve its key convention: it extracts the assistant-turn UUID from `key.split(".")[0]`. Use an engine-generated call slot suffix, not a provider-supplied tool-call ID. Existing submission binds source turn, conversation, trusted route, accepted timestamp/timezone, retention and active-task capacity.

`read_task` uses `BackgroundService.view` and checks parent conversation. `control_task` adapts to `AssistantService.control_dialogue_task` or the existing `BackgroundService.control`/`command` APIs with a server-created target. Preserve expected resource revision, accepted goal revision, question ID and source-update digest. Rebase progress-only revision races only where the existing semantics allow it; never silently rebase a changed goal or different question.

`answer_from_observations` reuses `capabilities/public_answer.py`, including `answer_observations`, `observation_catalogue`, the model projection and existing selection/validation functions. Model-selected source handles do not become invented URLs, prices or provider identity. Reauthorize at disclosure time.

For a side question, answer from current state/evidence without starting another task. For a mixed correction plus question, commit the correction first, then describe the observed accepted state. Optional bad wording must not undo a valid independently committed control.

### 9.4 Tool idempotency journal

Keep the journal inside the existing encrypted turn/resource lifecycle, with strict bounded schema. Minimum fields: engine call slot, native call ID for diagnostics, tool name, canonical arguments digest, accepted source/goal revision, state, linked resource/control receipt, timestamps and safe error code. Do not retain arbitrary model/tool payloads just for debugging.

States: `prepared`, `dispatched`, `settled`, `uncertain`, `denied`. Persist admission before a mutation; persist the resulting receipt before telling the runtime it succeeded. Use optimistic resource revision/transactional checks, with a lease to prevent two owners issuing the same slot.

- Identical replay of a settled slot returns the stored minimized receipt after current authorization, with no model/source action.
- Same slot with different normalized arguments is rejected.
- A crash after task commit but before receipt is recovered by the same service idempotency key and resource lookup. It must not create a second task.
- A native model may emit a new call ID for the same apparent intent. Do not deduplicate different intentional user requests globally by similar text. Bind deduplication to the accepted turn, durable execution slot and known retry/continuation semantics.
- An uncertain non-idempotent external effect is reconciled at its source and not blindly repeated. B's first scope excludes those effects, but its error semantics must not assert they are safe.

## 10. B2 research lifecycle and evidence

### 10.1 Durable state

Use existing `background_task` resource kind with a versioned `native_research` payload, not a new Node database. Validate it with strict typed models. Store the runtime binding, origin turn, exact goal, goal revision, source spans/constraint decisions, accepted time/timezone, profile/policy digest, budget ledger references, current owner/lease, observation references, command receipts, question, candidate outcome and cleanup state.

Dispatch B2 by this stored binding in `BackgroundService.authorized`, `control`, `step`, `command` and `view` before legacy payload-based routing. The authorization branch is mandatory: the existing generic fallback can reach `bank.balance` authorization when an unknown task payload has none of the recognized discriminators. B2 must perform its own exact public-research authorization/disclosure checks and never fall through to that banking path. The `control` branch must preserve accepted goal/question/source-update metadata; generic fallback can otherwise reject answers or drop those bindings. Preserve `locator`, caller scopes, `record`/outbox delivery and the existing external `BackgroundView` semantics. Do not simply insert a `public_research` dictionary and allow the old `advance` state machine to drive B2 accidentally.

Implement the full native `BackgroundView` projection: capability, goal and goal revision, origin turn, current question/authorization requirement, last control receipt, accepted constraints and permitted nonterminal/failed partial outcomes. Existing `AssistantService.background_context` can otherwise misclassify an unrecognized payload as `assistant.mission` and omit its evidence. `BackgroundService.record` currently applies public bounds only to `public_research`; the native handler must validate and compact its own typed journal/evidence before every write. Generic resource JSON/byte limits do not supply that validation. If retained evidence no longer proves a claimed completed outcome, reject or downgrade that claim rather than silently preserving completion.

Reuse existing statuses: `queued`, `running`, `waiting_input`, `waiting_authorization`, `waiting_timer`, `cancel_requested`, `completed`, `cancelled`, `expired`, `failed`. Keep more detailed cleanup and execution-attempt state private. Existing public contracts may need a bounded additive internal result projection, but must not invent a new client lifecycle silently.

Temporal remains the scheduler. `NativeBackgroundTaskWorkflowV1` passes opaque `StepRequest` values to `NativeActivities.advance`; do not put prompts, pages, bearer proofs or browser state in workflow history. `background_worker_options` separates historic graph/native workers and task queues; preserve old histories. If B2 needs incompatible workflow semantics, create a new versioned workflow/type/queue and retain old workers until drained. Never alter a historical workflow in place without replay qualification.

`background/worker.py:dispatch` currently selects the special research activity timeout and `MAX_TASK_INCREMENTS` only for a `public_research` payload. A naive B2 payload gets the generic 45-second/64-increment settings. Add a typed scheduling projection selected from the stored trusted runtime/version and approved task budget. Test it explicitly; do not inherit those defaults accidentally or expand timeouts to hide an unbounded agent loop.

Use bounded incremental activity advancement. A persistent native process can wait between rounds for an engine reply, but must not depend on a single activity running beyond its established timeout. Persist the request/attempt before acknowledging a round; pause the process at the protocol boundary until the next authorized increment. Do not detach a free-running agent beyond Temporal/resource supervision. Count native model rounds, tool actions and workflow increments separately.

The first B2 experiment permits exactly one eligible research worker/host, with no autoscaling or overlapping rollout, and an explicit registered process-owner generation. A process parked on worker X is not available to an activity scheduled on worker Y. Another host must not reconstruct/resume the task until containment teardown of the old owner is confirmed. Reject invalid deployment topology during preflight; the single-owner limitation must be visible in the report.

`background/native.py` clamps start-to-close activity timeouts to 45–180 seconds. Each admitted model/tool exchange must have a deadline shorter than the remaining activity window minus a measured persistence/acknowledgement margin. Otherwise implement an explicitly supervised submit/poll exchange with durable attempt ownership. A heartbeat does not extend start-to-close. The native model transport starts its idle timer before awaiting the relay, so pauses between activities also consume timeout. Test delayed scheduling, relay stalls, activity timeout and owner loss; do not assume a parked native turn can wait indefinitely. No expensive dispatch starts when insufficient activity budget remains to settle its result safely.

### 10.2 Corrections and questions

Validate correction source spans against the original accepted customer text. Preserve unrelated constraints and existing spent budget. Persist a new goal revision and invalidate old permissions/results for dispatch. Prior observations remain available as explicitly dated earlier-goal context, not proof the revised goal is met.

After commit, attempt native `steer` between rounds. `steered` means accepted into volatile `asides`, not yet consumed by a model request; `refused` permits queuing once; `indeterminate` does not permit automatic replay. Persist correlated `steer_accepted` and `steer_applied` states. Applied evidence identifies the subsequent admitted model request containing the update and its goal revision. A crash after acceptance recovers from the durable updated goal without claiming the prior loop saw it. A correction changing permissible actions invalidates the execution fence immediately, independently of when the model sees the text. Restart only when continuity cannot safely preserve the new policy/revision. No reset of task budget, deadline or evidence provenance on restart.

Question answers bind task, goal revision and question ID. A stale answer is rejected. A clarification question is not a new independent research task. A completed task is not silently reopened; an explicitly requested new investigation creates a linked task under existing product rules.

### 10.3 Cancellation and ownership

Commit `cancel_requested` and invalidate future action admission before acknowledging that stopping was requested. Abort native inference/tool waits and request browser cleanup. Mark `cancelled` only after the owner confirms applicable cleanup; keep cleanup pending/failed honest.

`interruptTurn()` completing is insufficient proof that browser descendants have exited. Retain `services/browser_worker_lifecycle.py:BrowserWorkerContainment`, Windows Job Object and Linux owner-pipe/subreaper behavior as applicable. Include PID/generation identity so cleanup never kills an unrelated reused PID. Delete disposable browser homes only after owned descendants exit and according to the retention contract.

Lease expiry alone does not prove a partitioned old owner stopped. For the first single-owner experiment, require confirmed containment teardown before a replacement may act. If cleanup cannot be proved, block replacement rather than claim distributed fencing. A later multi-owner design needs enforceable dispatch fencing, not only a database generation field. An in-flight authorized read can return after cancellation; retain or discard it under policy, but do not let it trigger another action or publish stale completion.

Register cleanup in both `api.py` lifespan and `background/worker.py:run` finalization, including failed boot/model setup and cancellation during creation. Resource reads are denied after content expiry/erasure; cleanup cannot depend on decrypting expired customer task payloads. Bound execution lifetime below content expiry and retain only minimal noncustomer containment identity separately until teardown is confirmed. Expiry immediately denies inference/action/disclosure but does not prove a process exited.

### 10.4 One observation, multiple consumers

At the trusted browser tool boundary, create an immutable observation identity bound to task, owner generation, goal revision and a monotonic sequence. Capture actual source URL, document/entity association, timestamp, tool, result status, exact retained text/excerpts and content hash. Distinguish top-level page, iframe/fragment and provider entity; do not assign a clinic's price to every doctor shown on that page.

Use that same source record for model-visible tool content, retained evidence and completion validation, allowing explicit bounded projections with references to the same original. Record omitted/truncated content. A page hash without retained relevant text does not let a verifier establish the claimed fact.

Do not blindly reread URL/title/body/selectors after every tool. If the native result lacks source identity or factual text, request an explicit additional observation and charge/log it. A click acknowledgement proves a click outcome, not the facts on the resulting page. This avoids replacing redundant capture with ungrounded confidence.

Deduplicate storage without destroying provenance: identical content at a new time, goal or entity association has a new observation identity. Store bounded source excerpts in purpose-bound encrypted resources, with retention/access linked to the task/conversation. Use existing `artifact`/resource facilities if appropriate; do not invent a new resource kind or silently exceed `MAX_PAYLOAD_BYTES`. If a new store/schema is unavoidable, add a forward migration and explicit expiry/erasure behavior.

### 10.5 Completion and presentation

Native `turn.completed`, idle, or “I found it” is only a candidate outcome. B2 emits a candidate answer with referenced observations, candidate/entity identities, requirement support and unresolved gaps. The engine checks:

1. Task/goal/runtime revision is still current; no cancellation, expiry or revocation forbids publication.
2. Every selected observation exists under the caller and permitted retained scope.
3. URLs, quotes, entity associations, amounts/currencies and timestamps bind to the actual observation.
4. Exact required count and material constraints are satisfied, or the result is explicitly partial/blocked/unknown.
5. No forbidden effect is claimed from a read, and no old observation becomes a fresh availability guarantee.
6. Public wording and citations preserve qualification and fit the requested language/tenant style.

Reuse pure models/validators in `public_search_models.py`, `public_evidence.py`, `public_requirements.py`, `public_time.py` and `capabilities/public_answer.py` where they fit. Extract pure validation from orchestration rather than calling the old `advance` pipeline. Deterministic checks do not prove all semantic entailment. Where the accepted completion rubric needs semantic assessment, keep a bounded independently identified assessment step over the same retained observations, account for its calls, and use the same substantive rubric for A/B. Do not gain apparent speed by removing required verification only from B.

The research worker's candidate wording is internal. B's concierge may select/reuse it after validation; it need not reconstruct an unrelated answer from a lossy second snapshot. Separate source-free dialogue from factual source-backed outcomes. The final approved text and source references are persisted atomically before public events; consumers must not run another model rewrite.

Current `AssistantService.authorize_view` does not admit arbitrary direct `PublicBrowserResult` outcomes: it requires `service.doctoralia` and a registered handler exposing `authorize_public_browser_result`. For generic B research, add an explicit trusted per-capability result-authorizer registry with the same current source/task/disclosure binding, and test it. Do not remove the restriction globally or return a `PublicBrowserResult` under `browser.shopping` expecting it already works. B1 should use existing registered result/presentation paths; B2 must qualify its additive mapping before publication.

### 10.6 Conversation continuity and history

After each short conversation turn, release the lease in a shielded finalizer. Long research continues as a durable background task. HTTP disconnect does not mean the customer requested task cancellation.

On the next turn, build context from authorized engine state and safe retained prose. Do not treat native `hasSession()` as durable memory; API-backed native turns need supplied transcript/context after restart. Do not place model reasoning or hidden protocol messages in customer-visible history.

The broad follow-up/history failures must receive explicit regressions. A useful validated partial answer must have a durable representable outcome. Do not render a helpful fallback transiently and then store only a generic failed turn. Existing `history.py:transcript` handles failed views differently from safe outcomes; either produce a valid partial outcome under the existing contract or make a narrowly specified shared history change with separate baseline attribution. Never bypass current authorization to preserve an old answer.

## 11. Host banking and broader product compatibility

After public-only B1/B2 behavior is established, add a bounded no-value `open_host_banking` tool for balance/history intents. Reuse `capabilities/host_banking.py:HostBanking.prepare/consume`, `host_models.py`, the current authority and verified client route. The tool returns model-safe intent status; the actual protected presentation travels through existing structured outcomes/SDK host delivery. Balance/history values never return as a model tool result or chat response.

No-value does not mean no authority/account selection: `HostBanking.prepare` requires a valid native-host client/session, an actual currently authorized `AccountChoice` and `authority.check`. Resolve the offered alias locally against current context. Ambiguity uses the existing protected selection flow; a model cannot invent an account or choose another tenant's source.

Test one-time consume under concurrency, wrong caller/session denial, expiry, replay and no direct-bank fallback. Preserve exact deterministic host controls even when model disclosure is denied or the provider is unavailable.

Detailed transfer/contact/amount capture, bank-link lifecycle, media and other banking capabilities remain existing service paths until separately adapted. B cannot be declared a replacement for the complete engine while those required capabilities are absent. Maintain a compatibility matrix with implemented, retained legacy, explicitly unsupported, independently accepted and production-qualified columns. Do not count retained A paths as newly implemented B capabilities.

The comparison can establish a winner for the bounded runtime slice before complete migration. Adoption of B as default requires the broader compatibility work, not just better public research scores.

## 12. Implementation sequence and exit criteria

Each increment should be reviewable on its own. Do not merge, publish, deploy, run paid campaigns or assign a human tester merely because those actions are described here. Follow the authorization attached to the eventual implementation request and the repository's existing gates.

### Increment 0: preserve and reproduce the baseline

1. Run the required worktree/branch/HEAD/dev checks as separate commands; inspect current status and remote configuration.
2. Inspect `.runtime/claims/`, acquire exclusive file/resource ownership, and preserve the existing pending vendoring work. Read-only agents need no new worktrees. Reuse the checkout for sequential edits; concurrent editing requires authorized ownership/worktree isolation.
3. Capture source manifests for A0 and, if relevant, A1: exact upstream source, local patch/diff, lockfiles, browser artifacts, config and model profile. No secrets in manifests.
4. Reproduce the existing offline baseline and selected controlled journeys with the setup profiles. Record skips/unavailable tools as gaps. Do not repair baseline failures silently.
5. Extract sanitized reproducible fixtures for the broad follow-up/history failures from retained evidence. Preserve the original failure/report identity and clearly label synthetic reproductions.

Exit: reproducible A identity, known failures, explicit fixture expectations and resource map. If A cannot run in the chosen environment, resolve environmental blockers or report a limited comparison; do not award B a win against a broken setup.

### Increment 1: introduce shared boundaries with legacy behavior only

1. Add `conversation/runtime.py` with a legacy adapter invoking `_run`.
2. Route both model-profile branches of `AssistantService.run` through that port after deterministic controls.
3. Extract context/model-session responsibilities without changing behavior. Verify profile snapshot establishment, each inference debit, policy rechecks and lease release.
4. Add typed persistent conversation runtime metadata and preserve it during acquire/release/CAS recovery.
5. Add disabled trusted runtime configuration and strict startup validation.

Exit: all relevant existing behavior tests pass with only the legacy runtime enabled; A's user-visible semantics are unchanged. Any deliberate common bug fix is a separately identified baseline revision.

### Increment 2: prove the direct native runtime seam offline

1. Pin/select upstream source and implement `RuntimeHost` injection plus the Node package/protocol described above.
2. Start the direct runtime with a local simulated OpenAI HTTP response and controlled tools. This is an offline transport/loop test, not real model compatibility evidence.
3. Supply a minimal restricted `ChatToolSession`; reject every tool outside the role allowlist.
4. Prove the build starts without OpenMaus `server/index.ts`, application config, home state, SQLite store, UI or sibling checkout.
5. Verify startup, two tool rounds, cancellation while waiting, EOF cleanup, malformed frames, missing hooks and dependency manifest.

Exit: native-loop smoke and clean import-boundary tests pass; no claims yet about live model/browser quality. If the seam cannot be extracted without broad product initialization, record the exact dependency blockers and reassess before broad vendoring.

### Increment 3: B1 source-free conversation

1. Wire `conversation/openmaus.py` to the shared turn/model session.
2. Enable only isolated synthetic conversations via trusted configuration.
3. Implement `reply`/`clarify`, persisted outcomes and minimized next-turn context.
4. Reject unsupported pending bank/media/selection contexts before inference, while leaving exact protected controls independently functional.
5. Test draft -> revision -> side question -> exact recall, including restart and HTTP replay.

Exit: same authenticated `/v2/turns`, no new SDK endpoint, no raw transcript leakage, and no legacy planner calls on admitted B1 turns. Instrument the test to prove `capture_plan` was not invoked, but assert user outcomes rather than only that implementation detail.

### Increment 4: B1 public research tools and controls

1. Implement the durable tool journal and exact source-span resolution.
2. Add `start_public_research` through the existing `PublicResearchTasks.submit` path; return an acknowledgement/task handle and release the conversational lease.
3. Add scoped task/evidence reads, revision-bound correction/cancel/question answers and validated evidence-based replies.
4. Preserve the same A browser backend, source policy and task implementation.
5. Verify crash after task commit/before receipt, duplicate native call, ambiguous task reference and changed-goal race.

Exit: B1 can complete the selected journeys without A's conversation planner. Produce a first A/B1 offline comparison before changing browser orchestration. A poor B1 result is useful evidence; do not mask it by immediately changing unrelated layers.

### Increment 5: B2 thin browser process and research handler

1. Add `browser-host.ts` using the pinned evaluated agent-browser substrate and egress gate.
2. Add typed `native_research` state, explicit authorization/disclosure and dispatcher branches.
3. Reuse existing Temporal scheduling and make the native worker pause safely at bounded supervised protocol increments.
4. Emit evidence once at the trusted tool boundary; build retained observations and source validation from that record.
5. Replace the old requirements/navigation/assessment choreography on B2 with native tool iteration plus explicit completion validation. Preserve the same substantive constraints; any bounded semantic assessor remains measured and identified.
6. Support correction steering with fencing, cancellation/cleanup and restart reconstruction from permitted committed context.

Exit: B2 no longer starts the full OpenMaus app or invokes legacy `PublicResearchTasks.advance` for its tasks; cancellation/restart/evidence tests pass through the engine. B1 remains available as an attribution arm, not an uncontrolled runtime fallback.

### Increment 6: combined authority/tenant/host verification

1. Build the combined Go-authority fixture path described in section 13, rather than counting separate component runs as integration.
2. Exercise both tenants, cross-caller handles, authority changes during execution and before disclosure.
3. Add no-value host banking intent and one-time consume if it is part of the approved comparison scope.
4. Verify delivery/history/replay, expiry/erasure, accounting and cancellation with actual PostgreSQL and Temporal.
5. Use deliberate fault tests to show the critical guards detect missing authorization, stale generations and duplicate dispatch.

Exit: zero critical invariant failures, no required skipped cases, explicit missing broader capability list. This is still developer verification, not human acceptance.

### Increment 7: budgeted paired public-source evaluation

1. Freeze scenario/rubric/config/source identity and agree repetitions, cost ceilings and decision margins before observing results.
2. Run selected untouched tasks with identical model/effort/output limits, substantive site/tool permissions, accepted time context and evidence requirements.
3. Alternate arm order on the same host/region; identify first launch versus warmed caches.
4. Record all attempts, including partials, quota failures, cancellations, source changes and failed repeats.
5. Stop broad expansion when a repeated unresolved defect makes more paid runs uninformative. Preserve the campaign; start a new attributed campaign after a fix.

Exit: paired case-level report with uncertainty and root-cause attribution. A handful of passes is a canary result, not a reliability estimate.

### Increment 8: decision, compatibility migration and retirement

Choose retain A, adopt B1, adopt B2, or continue a specifically bounded unresolved experiment. Document the reason using outcomes and maintenance impact, not code size alone.

If B wins, finish the required compatibility matrix, obtain applicable reviews/independent human acceptance, then plan rollout separately. Stop new A tasks only when a qualified replacement exists; keep old workers/types until drained. Identify actual profile/consumer use before deleting old paths. Preserve migrations, substantive tests and failed evidence. Do not delete effect-capable service browser code merely because public research no longer uses it.

Retire obsolete full-app hooks, duplicate evidence capture, unused runtime configuration and tests that only lock in removed implementation details. Keep regression scenarios as behavior specifications, adapted to the new interface. Do not retain two equivalent production paths indefinitely without an explicit support reason.

## 13. Test harness: existing assets and new work

### 13.1 There is no turnkey fair A/B runner today

The current OpenMaus live test is useful but not a complete platform comparison. It hardcodes the OpenMaus backend and uses synthetic in-process authority/bank through `test_dialogue_postgres.setup`. It can use real Temporal, but it does not thereby exercise actual Go authority. Existing Go/process tests cover other paths.

Its current profile uses 32 steps, 96 actions, Sol/low and 8,192 output tokens with a 200-call parent ledger. Useful-browser and original-conversation harnesses use different budgets. Historical times cannot be compared as if these were identical profiles. Also, the current OpenMaus harness contains a historical `base_revision` label of `dd3721b`; the new harness must derive actual identity rather than perpetuate that label.

### 13.2 Existing files and reusable functions

| Existing file | What to reuse | Limitation |
| --- | --- | --- |
| `scripts/test_suite.py` | Profiles, locks/preflight, fresh reports, incomplete/skip detection | Different profiles exercise different systems |
| `tests/conftest.py:harness` | Real PostgreSQL, signed synthetic principals, overlapping tenant IDs, scoped role | ASGI/in-process API, not deployed/network E2E |
| `tests/test_assistant_postgres.py:configure` | Controlled bank/authority/model and conversation state | `DevelopmentCapabilityAuthority`, not Go |
| `tests/test_dialogue_postgres.py:setup` | Assistant profile and continuity fixtures | Same authority limitation |
| `scripts/authority_fixture.py:GoAuthorityFixture` | Separate Go process, HTTP synthetic bank, signed proofs, counters/cleanup | Synthetic financial data and enforced reserved profiles |
| `tests/test_go_authority_e2e.py` | Configured brain -> Go -> bank -> DB, revocation/replay | Does not itself qualify browser integration |
| `tests/test_openmaus_live.py` | Authenticated API, native browser/model, cancellation and source reports | Hardcoded backend/development authority |
| `tests/test_useful_browser_live.py` | Direct/cross-origin/dynamic/correction/unknown/cancel/provider journeys | Different limits from OpenMaus test |
| `tests/test_public_research_conversations_live.py` | Original multi-turn campaign, manifests and replayed customer turns | Dataset is local; web state changes |
| `scripts/browser_outcomes_fixture.py` | Fictional provider/calendar pages and independent expected outcomes | Lexical checks are not general semantic verification |
| `scripts/public_conversation_report.py` | Mixed-source/duplicate/incomplete campaign detection | Does not establish customer satisfaction/human acceptance |

Useful fixture functions: `outcomes_site`, `score_source_outcome`, `score_delivery`, `score_lifecycle_consistency`, `score_compiled_requirements`, `score_execution_observations`, `score_progress_recap`, `score_delivered_answer`, `summarize_browser_telemetry`, `replay_saved_outcome_report` and `replay_saved_assessment_proposal`.

`tests/test_browser_conversations_live.py` contains `ConversationCallLedger`, `ConversationCallLimit`, `MeteredModel`, `_load_scenarios`, `_source_manifest`, `_advance_tasks` and `requirement_capture_score`. Extract reusable support into a dedicated test-support module when building the neutral harness; do not turn private test helpers into accidental production dependencies.

### 13.3 New harness files and interface

Proposed **NEW** files:

| Path | Responsibility |
| --- | --- |
| `scripts/runtime_comparison.py` | Neutral runner: collect/preflight/offline/live, immutable manifests, shared campaign accounting |
| `scripts/runtime_comparison_report.py` | Case-level and paired comparison; no pass from incomplete/unsafe runs |
| `tests/runtime_comparison_support.py` | Shared engine/Go/Temporal/browser fixture wiring, no production imports from test code |
| `evals/cases/runtime-comparison-v1.json` | Reviewed synthetic cases and explicit forbidden outcomes; no credentials/real customers |
| `tests/test_conversation_runtime_routing.py` | Trusted selection, immutable binding, no silent runtime fallback |
| `tests/test_conversation_context.py` | Data projection, pending/private exclusions, scoped evidence |
| `tests/test_conversation_tools_postgres.py` | Idempotent tool journal, task/control receipts, races |
| `tests/test_conversation_runtime_recovery.py` | Native process failure, lease cleanup, replay |
| `tests/test_conversation_runtime_comparison.py` | Deterministic A/B1/B2 outcomes on synthetic sources |
| `tests/test_conversation_runtime_go.py` | Actual Go + selected runtime + synthetic bank + authenticated API |
| `tests/test_conversation_runtime_comparison_live.py` | Explicitly opt-in paid/public-site comparisons |
| `tests/test_native_research.py` | B2 state, evidence, expiry, ownership and accounting |
| `tests/test_native_research_temporal.py` | B2 actual Temporal worker loss/recovery and controls |

Proposed runner interface, to implement rather than assume available:

```text
python scripts/runtime_comparison.py
  --phase collect|preflight|offline|live
  --arm A0|A1|B1|B2
  --manifest <reviewed nonsecret JSON config>
  --report-directory <new exclusive directory>
```

No paid work in collect/preflight/offline. Live requires explicit opt-in plus an authorized finite campaign budget in the manifest and shared atomic journal; missing budget is an error. The runner must not source arbitrary environment files, provision production resources, deploy, publish profiles or change real tenant configuration. Test tenant/runtime selection is done through trusted fixture composition, not a client request flag.

Use fresh isolated state for each arm/repeat while keeping equivalent logical tenants, principals, source fixtures and policies. Run the two-tenant isolation cases inside each arm, not one tenant per arm. Do not reuse a destructive fixture across concurrent runs. Browser caches/profile state must be explicitly fresh or explicitly warmed and comparable.

At least one combined case must traverse real HTTP process boundaries: signed caller -> engine -> Go authority -> synthetic tenant/bank -> durable task -> Temporal -> native worker/browser -> persisted outcome -> authenticated read/history. ASGI tests remain valuable lower-layer evidence but are not sufficient for that claim.

### 13.4 Scenario matrix

| ID | Journey / fault | Required result |
| --- | --- | --- |
| C01 | Draft, revise, side question, exact recall | Correct bounded continuity; no tools/effects; safe recall survives reload |
| C02 | Broad research follow-up then retry | Useful retained facts; no new task merely to answer; fallback/partial survives history |
| C03 | Two active tasks, ambiguous “cancel it” | Clarify target; no accidental cancellation |
| R01 | Python `casefold` vs `lower`, including `ß` | Official source and correct example |
| R02 | MDN HTTP 429 / Retry-After | Both requested facts, source attribution, no secret-word false positive |
| R03 | Two Doctoralia practitioners meeting price/address criteria | Two distinct qualifying entities; correct person/service/location attribution; honest missing facts |
| R04 | Official product lookup | Correct requested variant and facts |
| R05 | Cross-origin comparison | Facts from both required origins retained and delivered |
| R06 | Dynamic search fixture | Actual required interaction, not a supplied final URL shortcut |
| R07 | Impossible guarantee / unavailable fact | Useful supported facts plus explicit unknown, no invented completion |
| T01 | Correction plus side question mid-task | Same task, new accepted goal revision, retained other constraints/debits, useful side answer |
| T02 | Correction races completion | Apply under valid revision or report it was not applied; no silent restart |
| T03 | Cancellation during inference/action/authority wait | Committed stop blocks later dispatch; honest cleanup status |
| T04 | Worker crash before/after receipt | Retained task/debits/evidence, no duplicated submission/action |
| T05 | Duplicate HTTP request and native tool replay | Existing outcome/receipt after authorization, zero extra inference/effect |
| T06 | Activity retry and duplicate coordinator | One admitted execution owner; no duplicate budget reservation/dispatch |
| S01 | Two tenants with same member/account IDs | Trusted distinct backends; cross-tenant reads/control/replay denied |
| S02 | Same tenant, different client/grant/conversation | Foreign handles denied without revealing resource existence |
| S03 | Revocation during inference and before result disclosure | No later unauthorized call/action/result release |
| S04 | Profile/data-policy change between rounds | Stop safely, no stale context/provider continuation |
| S05 | Source prompt injection | Cannot add tools, disclose secrets, change tenant/backend or approve action |
| S06 | Unknown tool/schema / invented source handle | Deny before I/O, no authoritative success claim |
| S07 | Secret/current message and protected historical fields | Existing input protection; no raw private history/pending values in model |
| S08 | Source expiry, erasure, revoked evidence | Not resurrected via cached paraphrase/provider transcript |
| B01 | No-value balance/history host handoff | One-time protected host delivery; no financial facts in model/chat |
| B02 | Host expiry/denial/concurrent consume | No fallback or duplicate consume; exact controls independent of model |
| F01 | Budget exhausted, quota exhausted, transient 429/5xx | Bounded documented behavior; preserve partials/debits; no reset/runaway retry |
| F02 | Oversized protocol/source/retained payload | Bounded rejection/explicit truncation; evidence claims not silently orphaned |
| F03 | EOF, parent crash, browser daemon detach | Owned process cleanup or explicit blocked replacement; no orphan dispatch |
| F04 | Browser/source outage after partial success | Useful retained partial answer with correct provenance/uncertainty |

Classify each case by tier: deterministic fixture, real process integration, paid synthetic-source model, public-source live, independent human acceptance. Keep those result totals separate. B01/B02 are a later compatibility gate, not a claim that initial public-only B already supports them.

### 13.5 Existing regression anchors

Preserve and extend the relevant behavior from:

- `tests/test_tenant_backends_postgres.py`: `test_two_tenant_backends_with_same_account_ids_are_routed_independently`, `test_replay_rechecks_authority_and_revocation_blocks_saved_disclosure`.
- `tests/test_host_banking_postgres.py`: `test_host_read_has_no_bank_facts_and_consumes_once_under_concurrency`, `test_denial_or_expiry_never_consumes_or_falls_back`.
- `tests/test_openmaus_lifecycle.py`: `test_revocation_during_inference_does_not_release_model_response`, `test_correction_discards_previous_process_without_resetting_budget`, `test_action_budget_stops_before_second_native_dispatch`, `test_restarted_worker_cannot_reuse_an_observation_identity`.
- `tests/test_public_research_temporal.py`: `test_worker_replacement_preserves_debits_and_replay_does_not_execute`.
- `tests/test_native_temporal_recovery.py`: `test_separate_worker_recovery_conversation_and_revocation`.
- `tests/test_public_research_recovery.py`: `test_competing_coordinator_cannot_duplicate_inference`.
- `tests/test_public_research_tasks.py`: `test_cancellation_during_reasoning_prevents_a_late_action`.
- `tests/test_conversation_history.py`: `test_history_is_private_and_rejects_foreign_cursors`, `test_history_does_not_replay_protected_results_or_old_approvals`, `test_expired_history_is_not_resurrected`.

Add Node tests under **NEW** `tools/openmaus/runtime/tests/`: `runtime-startup.test.ts`, `runtime-tools.test.ts`, `runtime-steering.test.ts`, `runtime-cancel.test.ts`, `runtime-evidence.test.ts`, `runtime-recovery.test.ts`, `runtime-package.test.ts`. Assert that imports, ambient config, hidden network calls and native session approvals cannot bypass engine controls. Test protocol conformance with shared fixtures consumed by Python and TypeScript.

## 14. Environment and command catalogue

**These commands were inspected, not executed for this document.** They are separate profiles with separate prerequisites, not a single script to run blindly. Use [ENGINE_SETUP](../SOURCE_REFERENCES.md#source-8f929a906ccd) and the current runner source at implementation time. No credentials are included here.

### 14.1 Toolchains and resources

Inspected setup pins Python 3.13.12, uv 0.10.9 and PostgreSQL 18; OpenMaus packaging uses Node 24.22.0 and pnpm 10.33.0. The admin environment may have its own Node patch version. Follow lockfiles/package pins rather than upgrading to reconcile them incidentally.

| Existing profile | Dedicated resources / important prerequisite |
| --- | --- |
| `fast` | No database/browser/Go/Temporal/provider |
| `browser-startup`, `browser-baseline` | Pinned Chromium and separate locked Browser Use worker, no paid inference |
| `system` | Engine DB, authority DB on 55514; ports 7246/8246/8247/8248 |
| `authority` | Authority DB 55492; Go/bank ports 8193/8194; engine DB |
| `service-authority` | Authority DB 55514; Go/bank 8247/8248; engine DB/browser |
| `native-recovery` | Engine DB 55531, Temporal 7261, HTTP 8291 |
| `public-research` | Engine DB 55532, Temporal 7263, Browser Use interpreter/cache |
| `recovery` | Engine DB 55506, Temporal 7240/7246, HTTP 8246 |

These are existing profile expectations, not reservations. Check claims and live ownership before use. New combined comparison resource selection must agree with the fixtures' accepted profiles; do not invent arbitrary ports that their safety guards reject.

`scripts/local_postgres.py` stores its cluster in the executing checkout's `.runtime/postgres`. It supports `init/start/stop/status`, `--port` and `--bin-dir`, but no arbitrary data-directory flag. Changing the port does not create another cluster. Do not initialize over existing data, stop another session's cluster, or assume worktrees isolate databases automatically.

### 14.2 Existing offline setup examples

From the engine root, after claiming the intended resources:

```powershell
uv sync --locked
uv run python scripts/local_postgres.py status
```

For a genuinely new exclusively owned checkout/cluster only:

```powershell
uv run python scripts/local_postgres.py init
uv run python scripts/local_postgres.py start --port 55532
$env:ENGINE_BOOTSTRAP_DSN = 'host=127.0.0.1 port=55532 dbname=postgres user=engine_owner'
$env:ENGINE_MIGRATION_DATABASE_URL = 'postgresql+psycopg://engine_owner@127.0.0.1:55532/engine_sprint1'
$env:ENGINE_TEST_OWNER_URL = 'postgresql+psycopg://engine_owner@127.0.0.1:55532/engine_sprint1'
$env:ENGINE_TEST_RUNTIME_URL = 'postgresql+psycopg://engine_app@127.0.0.1:55532/engine_sprint1'
uv run python scripts/bootstrap.py provision
uv run alembic upgrade head
uv run alembic check
```

These loopback URLs are the documented local fixture pattern, not production configuration. Use the actual owned profile. Keep owner and runtime roles distinct. Pytest fixtures create unique identities; do not indiscriminately seed/reset existing data.

For the separately owned `system` authority cluster/profile, after that cluster is actually running:

```powershell
$env:AUTHORITY_BOOTSTRAP_DSN = 'host=127.0.0.1 port=55514 dbname=postgres user=engine_owner'
$env:AUTHORITY_MIGRATION_DSN = 'host=127.0.0.1 port=55514 dbname=authority_dev user=authority_owner'
$env:AUTHORITY_TEST_OWNER_URL = 'postgresql://authority_owner@127.0.0.1:55514/authority_dev'
$env:AUTHORITY_TEST_RUNTIME_URL = 'postgresql://authority_app@127.0.0.1:55514/authority_dev'
uv run python scripts/authority_database.py provision
uv run python scripts/authority_database.py migrate
```

Use `authority/.go-version`, prepare the Go module cache and configure `AUTHORITY_FIXTURE_GOMODCACHE` as documented. Apply the complete current forward authority migration chain, including browser-session migrations; do not modify checksums or reset databases. The above block does not itself provision/start a second PostgreSQL cluster.

### 14.3 Existing verification commands

Run only profiles whose prerequisites/resources are established:

```powershell
uv run python scripts/test_suite.py fast
uv run python scripts/test_suite.py system --collect-only
uv run python scripts/test_suite.py system --preflight-only
uv run python scripts/test_suite.py system
uv run python scripts/test_suite.py authority
uv run python scripts/test_suite.py native-recovery
uv run python scripts/test_suite.py public-research
```

Collection/preflight are not execution passes. Existing reports include `run.json`, `selection.json`, `cases.jsonl` and `junit.xml`. Empty/skipped/interrupted required suites do not count as passed.

Relevant focused groups, with their required DB/process flags configured from setup:

```powershell
uv run pytest tests/test_assistant_http.py tests/test_data_boundaries.py tests/test_host_banking_context.py tests/test_model_profiles.py tests/test_provider_failover.py tests/test_inference_observability.py -q
uv run pytest tests/test_assistant_postgres.py tests/test_host_banking_postgres.py tests/test_background_postgres.py tests/test_conversation_history.py -q
uv run pytest tests/test_public_research_context.py tests/test_public_research_updates.py tests/test_public_control_state.py tests/test_public_answer_selection.py tests/test_public_source_safety.py tests/test_public_runtime_accounting.py tests/test_public_runtime_shutdown.py -q
uv run pytest tests/test_openmaus_worker.py tests/test_openmaus_lifecycle.py tests/test_openmaus_linux.py -q
```

Linux-only tests remain platform-specific. Use unique owned Windows pytest temporary directories where required. Do not disable Chromium's sandbox or run the Linux browser as root to obtain a green check. Record restricted-runner environment failures separately from product behavior.

The pending vendoring work, **not committed A0**, adds these existing-in-working-tree commands:

```powershell
uv run python scripts/openmaus_vendor.py
node --experimental-strip-types --test tools/openmaus/engine-*.test.mjs
```

The verifier's manifest-write mode is a mutation, not verification. Do not regenerate hashes merely to make an unexplained mismatch pass.

In the OpenMaus source environment, with its locked dependencies and isolated fixtures, useful inspected tests are:

```powershell
pnpm exec vitest run server/drivers/openai-chat-tools.test.ts server/drivers/chat-mcp-tools.test.ts server/drivers/openai-responses.test.ts server/drivers/openai-chat-stream-retry.test.ts server/browser-runtime.test.ts server/browser/egress/policy.test.ts
```

`openai-chat-tools.test.ts` includes actual HTTP/stdio MCP fixtures. Port their relevant behavioral coverage with attribution into the extracted runtime tests. The new minimal package must define its own runnable test/build commands; do not assume the original root workspace's scripts work after extraction.

### 14.4 Existing live commands, only after separate budget authorization

The old campaign authorization is not a standing grant for future paid runs. Load the existing approved secret source without printing, copying or committing values.

```powershell
$env:ENGINE_RUN_OPENMAUS_LIVE = '1'
$env:ENGINE_OPENMAUS_CASES = 'providers,python,mdn'
$env:ENGINE_OPENMAUS_REPORT = '.runtime/CHOOSE-FRESH-CAMPAIGN/CHOOSE-FRESH-RUN'
uv run pytest tests/test_openmaus_live.py -q -s --tb=short
```

Replace report placeholders with fresh exclusive paths. This existing harness uses a parent `calls.jsonl` with a 200-call ceiling and must run serially. `ENGINE_OPENMAUS_TEMPORAL=1` selects actual native Temporal on reserved 7263. `ENGINE_OPENMAUS_CONTROL=cancel` plus cases `python` selects cancellation; omit that flag for ordinary research. This is A's existing trial, not the proposed neutral runner.

```powershell
$env:ENGINE_RUN_USEFUL_BROWSER_LIVE = '1'
$env:ENGINE_USEFUL_BROWSER_IDS = 'direct,cross_origin,dynamic,correction,unknown,cancel,providers'
$env:ENGINE_USEFUL_BROWSER_REPORT_DIRECTORY = '.runtime/CHOOSE-FRESH-USEFUL-CAMPAIGN'
$env:ENGINE_BROWSER_CONVERSATIONS_CALL_LIMIT = 'REPLACE_WITH_AUTHORIZED_INTEGER'
uv run pytest tests/test_useful_browser_live.py -q -s --tb=short
```

The non-integer placeholder intentionally prevents accidental paid execution without configuring a budget. Existing repeat settings accept 1 or 2; use the supported harness/profile selection, not guessed options.

```powershell
$env:ENGINE_RUN_PUBLIC_CONVERSATIONS_LIVE = '1'
$env:ENGINE_PUBLIC_CONVERSATION_REPORT_DIRECTORY = '.runtime/CHOOSE-FRESH-ORIGINAL-CAMPAIGN'
$env:ENGINE_PUBLIC_CONVERSATION_IDS = '2,12,18'
$env:ENGINE_PUBLIC_CONVERSATION_PROFILE = 'useful'
$env:ENGINE_BROWSER_CONVERSATIONS_CALL_LIMIT = 'REPLACE_WITH_AUTHORIZED_INTEGER'
uv run pytest tests/test_public_research_conversations_live.py -q -s --tb=short
uv run python scripts/public_conversation_report.py .runtime/CHOOSE-FRESH-ORIGINAL-CAMPAIGN
```

The original dataset defaults to ignored `.runtime/payme-conversations-final-20261110/scenarios.json`, SHA-256 `307d59f17a794b1b394c63374c32013851cba71b64f77e3e79d26b3c0aadadab`. A fresh clone may lack it. An override requires `ENGINE_BROWSER_CONVERSATION_SCENARIOS` and `ENGINE_BROWSER_CONVERSATION_EXPECTED_SCENARIO_SHA256`. Do not silently regenerate a different dataset under the old identity. `ENGINE_PUBLIC_CONVERSATION_REPLAY_DIRECTORY` can reuse recorded synthetic customer turns; it does not freeze websites.

Clear paid opt-ins after the owned run and ensure the test runner classifies any new live flags explicitly. A malformed optional selector must not expand into an unbounded paid suite.

## 15. Required comparison report and decision rules

### 15.1 Reports must explain what actually ran

The proposed `scripts/runtime_comparison_report.py` must validate a complete campaign before summarizing it. Reject mixed code/configuration identities, duplicate case/repeat identifiers, missing mandatory cases, conflicting runtime selections and truncated ledgers. Preserve failures. Do not silently exclude a slow or unsuccessful attempt as a warm-up after observing its result.

Write raw machine-readable observations into the fresh ignored campaign directory. Publish a sanitized substantive report under the existing evaluation-report convention and link it from `docs/development/VERIFICATION.md` when it becomes evidence. Do not commit raw prompts, browser profiles, cookies, credentials, customer content or Codex session exports. Report tools should read only the owned campaign and the approved scenario manifest, not crawl arbitrary home/session directories.

The proposed report schema must include these groups; names below are a specification, not an existing API:

| Group | Required fields and interpretation |
| --- | --- |
| Source identity | Actual Ideeo commit, branch, dirty status, source-manifest digest, patch digest, OpenMaus commit, selected upstream file hashes, lockfile hashes, compiled-runtime digest and browser binary/version |
| Configuration | Arm, exact runtime/version, model/provider/effort/output cap, prompt/schema/tool revisions, policy/configuration digests, allowed capabilities, scheduler, fixture versions and resource profile |
| Environment | OS, host/region, process isolation mode, explicit first/warm launch, timeouts and owned resources; no secret values or credentials |
| Input identity | Scenario/rubric/source-fixture/replayed-customer-turn hashes, synthetic tenant/channel/client profile, authority and bank fixture type, fixed evaluation clock where applicable |
| Execution | Case/repeat, timestamps, complete/incomplete, transport status separately from public turn/task outcome, task and goal revision, offered/accepted control identities, evidence/source references and retained failure reason |
| Controls | Reauthorization outcomes, cross-tenant/caller denial, forbidden effects/disclosures, post-cancellation calls/actions, replay-induced extra dispatch, cleanup residue and durable budgets before/after |
| Utility | Requested facts delivered, factual correctness, attribution, honest gaps, correction handling, conversational continuity and usefulness as independently assessable dimensions |
| Latency | Time to first useful reply, completed conversational reply, research completion and cancellation settlement; initialization and source/browser time separately where measurable |
| Consumption | Model requests reserved/dispatched/settled/unknown; input/output/cache tokens where reported; browser/native actions; engine increments; retries/recoveries; actual reported monetary cost separately from unknown cost |
| Evidence status | Developer checks, independent review, different-human acceptance, missing checks and explicit production approval status |

Use null/unknown for unobserved token usage or billing, never zero. A timed-out provider request can consume money without a response. A failed browser task can still produce useful partial evidence; score that separately from full completion. HTTP 200 does not imply a successful task. Native `done` does not imply verified research. Verified research does not by itself imply a useful conversational answer.

Retain per-case pairs. Summaries should show counts and denominators, median and range when useful, and every failure category. With only a handful of runs, avoid presenting a percentile or success percentage as a production reliability estimate. Do not calculate a speedup from historical runs with different controls. Record website changes and separate deterministic fixture results from uncontrolled public-source results.

### 15.2 Measure maintenance improvement, not only latency

Produce a before/after dependency map for the admitted path. The map must distinguish live execution from legacy compatibility code remaining on disk. Measure at least:

1. Model-call stages required for a representative journey, including requirement extraction, native loop, assessment and presentation. Count hidden retries and any semantic verifier.
2. Task state owners and durable records that must change together. Count each required cross-process protocol and each duplicated transcript/evidence store.
3. Number of browser/source reads for one useful observation, and whether a second read can disagree with the first.
4. Application modules initialized for the native runtime, build dependency closure, package/image size and boot behavior. A smaller source directory with the same broad initialization is not successful extraction.
5. Files and modules changed to implement the same correction, evidence-retention or new read-only source behavior. Use the actual experiment changes; do not estimate an imaginary rewrite as already cheaper.
6. Runtime-specific branches left in `assistant.py`, `background/service.py`, `background/worker.py` and settings/startup. Check whether new abstractions genuinely remove coupling or merely relocate it.
7. Duplicated controls and their ownership. Keep independently required enforcement at trust boundaries; remove duplicate planning/interpretation only when its behavior is covered elsewhere.
8. Compatibility/support burden after adoption: supported runtime versions, retained old tasks, upstream patch count, update procedure and tests needed to qualify an upstream update.

Total lines alone are a poor decision metric. B may introduce a small explicit protocol and more negative tests while deleting a large, fragile interpretation pipeline. Conversely, B may look concise while hiding dependence on the entire OpenMaus application. The report must make that distinction visible.

### 15.3 Gates established before comparative runs

Critical authority, tenant isolation, privacy, forbidden-effect and replay invariants have zero allowed failures. Do not average them into a utility score. Required deterministic cases must all be collected and pass; skipped, missing, interrupted and empty runs do not pass.

Agree the selected public canaries, repeat count, total spending ceiling, acceptable latency/cost and practical decision margin before examining comparative outcomes. Three identical-revision repeats per selected canary would be a reasonable initial screen, but this is a proposal, not an existing repository standard or reliability claim. More repetitions should resolve a stated uncertainty, not consume budget automatically.

The current broad research-follow-up and reloaded-history failures need explicit regression coverage and resolution. More successful page visits cannot compensate for failing to deliver retained results to the customer. A bounded replacement must improve the complete authenticated journey.

A different human must perform functional acceptance under repository policy. An implementation agent, reviewing agent or model judge may supply useful evidence but cannot satisfy that gate. Do not assign a person without authorization. The comparison winner is not production-approved merely because development tests pass.

### 15.4 Decision table

| Observed result | Decision |
| --- | --- |
| B1 improves continuity and delivery, B2 adds little or increases fragility | Adopt the qualified conversational replacement first; retain the current research implementation with an explicit future decision point |
| B2 improves complete journeys and measurably removes duplicate orchestration while all controls hold | Adopt B2 for its qualified slice, then migrate remaining required capabilities before default replacement |
| B is faster but weakens authority, evidence, retention, cancellation or tenant isolation | Reject that candidate; repair the missing boundary before another comparison |
| B merely wraps the current planner/research pipeline or still needs full application initialization | The intended architectural hypothesis has not been demonstrated; report exact dependencies and stop claiming a thin replacement |
| A wins the paired journeys and B offers no material maintenance improvement | Keep A for this slice and make targeted, evidence-driven simplification; retain the failed B result as useful evidence |
| Both fail the same outcome or source case | Investigate the shared policy, source, evidence contract or rubric; changing repositories may not address the failure |
| Results are close or environment/provider failures dominate | Run only the next bounded experiment needed to distinguish the candidates; do not select a winner from noise |

If a narrow extraction proves impractical, a deliberately maintained headless fork with a larger dependency footprint is a possible revised design, not a successful minimal extraction. Record the actual footprint and operating cost and reconsider it explicitly. Do not silently turn the experimental worker into the full desktop server.

A wholesale OpenMaus base becomes a stronger option if the product itself changes toward a personal/workspace assistant and the Ideeo authority/domain system is deliberately maintained as an external service. It is not the preferred answer for the presently stated shared multi-tenant banking/delegation engine. Moving the root directory or rewriting in TypeScript would not remove those product responsibilities.

## 16. Packaging, upstream ownership and documentation changes

### 16.1 Build a reproducible runtime artifact

Extend the pending `scripts/openmaus_vendor.py` only after preserving its existing owner's changes and reviewing its manifest rules. It should support a selected runtime dependency closure if that is the chosen ownership model. Alternatively, introduce a separately named extraction helper with a clear relationship to the broad A1 manifest; do not change A1's meaning during the measured comparison.

Use the exact pinned upstream commit, include required license/notice files, and record engine modifications as reviewable patches or explicit engine-owned files. A clean environment must build without `C:\Users\...`, a sibling checkout, untracked upstream files, a developer's OpenMaus home or an ambient global Node package. Generate a build dependency manifest and fail if forbidden entry points/application state are imported.

The narrow package needs its own locked dependencies and executable build/test scripts. Keep the repository's pinned Node/pnpm versions unless a separately justified compatibility change is necessary. The produced artifact must expose the versioned parent-child protocol, fail startup when required hooks are absent, and report its own build digest. Do not download executable browser/runtime components at customer-task time.

Treat the selected agent-browser executable and Chromium as explicit release inputs. Pin their provenance and hashes using the existing provisioning conventions, preserve the browser sandbox and egress controls, and test actual process containment on each supported OS. A passing mocked protocol test does not qualify the executable supply chain or Linux sandbox.

Current packaging entry points include `deployment/openmaus/Dockerfile`, `deployment/openmaus/vm_bootstrap.sh`, `tools/openmaus/worker.mjs`, pending `tools/openmaus/engine-binding.mjs`, and pending `scripts/openmaus_vendor.py`. Verify their actual consumers before editing. Initially keep A's packaging intact and add an explicitly selected B build target/artifact. After selection, remove obsolete full-app boot and configuration dependencies from the winning path rather than retaining invisible runtime fallbacks.

Test startup in a clean image containing only the selected bundle and declared browser/helper artifacts. A bundler import manifest does not detect every runtime-relative path or spawned helper. OpenMaus `server/proxy-paths.ts` explicitly handles proxy entry paths after bundling; browser launchers/process utilities need the same inspection. Missing helpers must fail preflight rather than be fetched or discovered from a developer's checkout.

Export only an allowlisted environment into the child. Never forward the parent's complete environment and then attempt to remove known secrets. The native loop receives no provider credential, database DSN, authority bearer, tenant bank secret or unrestricted filesystem tool. Model transport and domain actions cross the typed engine boundary. Ordinary public-source fetching still needs the same policy enforcement as browser traffic; it is not an egress escape hatch.

### 16.2 Keep canonical documents synchronized when behavior changes

This handoff is a requested decision artifact. During implementation, update existing canonical sources rather than maintaining a competing rulebook here:

| Existing document | Required update when applicable |
| --- | --- |
| `docs/decisions/README.md` and new allocated ADR | Selected runtime ownership, alternatives, measured decision, acceptance scope and explicit supersession relationship |
| `docs/contracts/BACKGROUND_TASKS.md` | Native task discriminator, compatible views/control semantics, revision binding, scheduling/recovery and drain behavior |
| `docs/contracts/SERVICE_INTEGRATIONS.md` | Actual qualified browser capability, observation/evidence contract, site restrictions and remaining unsupported effects |
| `docs/contracts/PROVIDER_PROFILE.md` | Native provider projection, tool/prompt revisions, per-call admission/accounting and data minimization |
| `docs/product/UX.md` | Only genuine user-visible control/history/recovery changes; keep internal runtime names out of customer flows |
| `docs/product/DATA_OWNERSHIP_AND_LIFECYCLE.md` | Every new retained transcript/evidence/journal field, purpose, scope, expiry, erasure and cleanup metadata |
| `docs/development/ENGINE_SETUP.md` | Real install/build/preflight/test commands, resource profiles and configuration validation |
| `docs/development/VERIFICATION.md` | Links to substantive fresh reports with exact source, tenant/environment, data source and qualification limits |
| `README.md` | Concise architecture/setup navigation only if changed; do not turn it into a campaign diary |

Preserve public API schemas unless the implementation has a real contract change. Internal runtime selection should not require the tenant SDK to know which planner is running. If an externally visible schema must change, update its canonical contract/export and compatibility tests deliberately.

### 16.3 What to retire, and when

The following are retirement candidates, not deletion instructions for the initial spike:

- Legacy conversation planning branches in `capabilities/assistant.py` and `capabilities/planning.py` only after every required caller is migrated or deliberately retained.
- Research-specific choreography in `browser/public_tasks.py` and `browser/public_site.py` only after B2 replaces the relevant capability and historic tasks are drained.
- Full-app OpenMaus worker boot, preload hooks, duplicate evidence rereads and broad UI/Electron vendoring only after the selected runtime artifact covers all remaining consumers.
- Old configuration switches and tests that assert removed internals; preserve their valuable negative and user-outcome scenarios against the new interface.

Do not delete `capabilities/operations.py`, independent `authority/`, tenant adapters, host handoffs, durable resources, database migrations or effect-capable browser services because they share terminology with the replaced path. Run a consumer search and inspect actual trusted profiles before deletion. Deleted code is a result of proven ownership replacement, not a target to optimize before behavior is preserved.

## 17. Rollback, coexistence and retained state

Runtime identity is pinned at conversation/task creation. A configuration change affects new eligible conversations; it does not reinterpret an existing A task as B or vice versa. Task reads/controls dispatch from validated stored identity. Do not trust a model-supplied or HTTP-supplied arm selector.

If B fails startup, fail that admitted B turn safely and record the cause. Do not silently retry through A after B may have submitted a task or consumed budget. A separately documented operator action may disable new B admissions while existing B resources remain readable/controllable through their own implementation.

Keep the old handler/version deployable until its tasks settle, expire or are explicitly canceled with confirmed containment cleanup. Do not stop the only worker capable of safely controlling those resources. In-process Node memory is reconstructible execution state, never the durable owner. A rollback must preserve journals, already spent budgets, accepted controls, source provenance and unknown outcomes.

For uncertain dispatch, reconcile from the durable receipt/resource identity. Never infer that no action happened merely because the process disappeared. Automatic retry is allowed only when the relevant handler's idempotency/reconciliation contract proves it safe. The first experiment is read-only, but duplicate model calls and browser actions still affect privacy, budgets and external traffic.

Use additive schemas and compatible readers for coexistence. If changing Temporal workflow logic incompatibly, use its supported versioning/new workflow identity and preserve existing histories; do not replay old histories through a newly interpreted payload with different scheduling commands. Document which build can read each resource version before rollout.

Before enabling B by default, demonstrate: disable new admissions; finish/cancel an existing B task; restart an old-version task; re-read permitted results; deny revoked/expired results; and resume A only for new eligible conversations/requests. Preserve existing caller-bound idempotency keys, fingerprints and tombstones across runtime changes. A replay of a B request must return its currently authorized saved result or an explicit unavailable/expired state, never create an A execution. Runtime selection must not create a new idempotency namespace that admits the same external request twice. This is a development rollback exercise, not permission for a production deployment.

## 18. Compliance and licensing impact of the proposed change

This section maps engineering work to the repository's current registers. It does not interpret current law, resolve pending legal questions or certify compliance. The source entries remain pending where their registers say so.

The proposed runtime touches model disclosure, third-party sites, authenticated controls, logs and retained evidence. Relevant [legal-register](../../compliance/LEGAL_REGISTER.md) entries are LR-01 (personal data), LR-02 (financial secrecy), LR-03 (suppliers/cloud/cross-border processing), LR-04 (channels/authentication), LR-05 (security/incidents), LR-12 (consent/records), LR-13 (site access/terms), and LR-17 (AI regulatory review). Later external-agent mandate or money-movement expansion would also require its specific banking/mandate entries; it is outside this read-only experiment.

Keep real-tenant model disclosure, new vendors, cardholder data and new browser destinations disabled until their recorded legal and contractual prerequisites are satisfied. Synthetic fixtures exercise technical behavior; they do not establish those approvals. Carry the existing qualified scope forward instead of treating runtime replacement as a fresh permission grant.

Use the repository's [ISO 27001 applicability statement](../../compliance/STATEMENT_OF_APPLICABILITY.md) and [ISO 42001 applicability statement](../../compliance/AI_STATEMENT_OF_APPLICABILITY.md) as the control mapping:

- ISO/IEC 27001: 5.15–5.18 for access/identity/authentication rights; 5.19–5.23 for supplier/cloud responsibilities; 5.31 and 5.34 for legal/privacy requirements; 8.10 for deletion; 8.15–8.16 for logging/monitoring; 8.26–8.29 for application requirements, architecture, coding and testing.
- ISO/IEC 42001: A.5.2–A.5.4 for impact assessment; A.6.2.2–A.6.2.4 for requirements/design/verification; A.6.2.7–A.6.2.8 for technical documentation and records; applicable A.7–A.9 data/information/use controls and A.10.3 supplier responsibilities.

Update the actual risk/impact/supplier records when an implementation changes their facts. Evidence should demonstrate a control rather than label it complete because this document mentions it. Preserve existing gaps and counsel-dependent decisions.

For copied OpenMaus code, retain core Apache-2.0 notices and identify modifications. Inventory all extracted third-party packages and browser/runtime artifacts with their licenses. Keep `enterprise/` out of the initial extraction; using it later requires separate review of its license and missing hosted infrastructure. There is no need to adopt enterprise code to prove the proposed core runtime seam.

## 19. Implementing-agent checklist and current verification status

### Before editing runtime code

1. Re-read current instructions/contracts and identify worktree, branch, HEAD, local `dev` and missing integration commits using the separate required commands.
2. Inspect current modifications and claims. Preserve pending A1 work and obtain exclusive file/resource ownership for the increment actually being implemented.
3. Confirm the current source still has the symbols described here. Paths and line observations are tied to the snapshot; follow code changes rather than forcing stale patches.
4. Freeze the baseline and accepted scenario/control rubric. Identify which requirements are implemented by A, B1 or B2 and which remain absent.
5. Implement sequentially through the exits in section 12. Do not jump from a direct native-loop smoke to a whole-engine replacement claim.

### Before calling an increment verified

1. Run its meaningful unit/contract tests and the applicable real PostgreSQL/authority/Temporal/browser profile. Record exact source identity and skipped/unexecuted checks.
2. Inspect the public reply, history, retained evidence, accounting and cleanup; a successful tool call or HTTP status is insufficient.
3. Exercise the negative cases for the new trust boundary, especially current authority, model-input minimization, stale controls, replay and process loss.
4. Keep reports attributable and sanitized. Update the verification index when publishing substantive evidence, not for every routine local command.
5. Obtain required independent review and different-human functional acceptance before claiming the repository's full acceptance gate. Production promotion remains human-controlled.

### What this document's preparation verified

This review inspected the two local repositories, the specified local `dev` history window, relevant Codex session records and retained evaluation artifacts. Three delegated reviews examined engine architecture, OpenMaus extraction, and history/test-harness evidence; a second pass reviewed concrete implementation seams and corrected the draft. Source paths and Markdown links were checked during preparation.

No conversation/runtime replacement, browser extraction, new comparison harness or migration has been implemented by this documentation task. No new paid evaluation, live website test, application test suite, deployment, merge or publication was performed for it. Historical results in section 3 are not new verification results. The proposed test/build commands are instructions for a subsequent authorized implementation, not a claim that they passed here.

The recommendation remains: preserve the Ideeo product and authority foundation; replace the problematic conversational/research orchestration if the bounded B1/B2 comparison proves it. AI makes code generation cheap enough to attempt that replacement, but equivalent controls, complete user journeys, recovery and maintainable ownership still have to be demonstrated.

