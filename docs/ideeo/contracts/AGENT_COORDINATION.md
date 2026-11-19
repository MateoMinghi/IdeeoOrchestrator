> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Coordinator and executor boundaries

This is the executable internal design for the refactored v1 balance increment and the v2 presentation boundary. The [architecture](../product/architecture/arquitectura-motor-agentes-rev4.html#autonomia-ejecucion) describes the complete target. The [public HTTP/SSE interface](SHARED_INTERFACE.md) retains its version 1 contract; the additive [v2 capability interface](CAPABILITIES.md) preserves existing banking payloads and adds typed research/task-control results. None of these internal models may be submitted as authority by a client.

## Processing path

This implemented direct-read pipeline is not the [ADR-010 app/SDK host-banking target](../decisions/010-app-host-banking-and-model-context.md). That target emits a scoped intent for host-side banking and never delivers balance/history as chat/model results. Preserve separate customer-visible history and sanitized inference context; current V2 pending fields still need adoption work. No new wire event or native consumer is implemented by this clarification.

```text
Validated request and current authority
  -> optional Jev route
  -> general planner when routing is disabled, uncertain, new or mixed
  -> coordinator checks the complete plan against registered capabilities
  -> typed assignment to the balance executor
  -> current-resource checks and validated bank evidence
  -> coordinator renders Spanish text
  -> current authority/disclosure checks, persisted outcome and API delivery
```

`TaskPlan` contains one to four requested capabilities, or a request for clarification. Capability names are extensible; they are not arbitrary tool names with execution privileges. The general Gemini planner can represent browser, phone, transfer and other goals. The registry currently contains only `bank.balance`. A v1 turn represents one result, so a plan with several tasks or any unavailable capability returns the existing `unsupported` result before executing any part. This is an honest capability boundary, not evidence that general browser execution has been implemented.

`Assignment` carries the server-reserved task ID, selected capability and account-selection inputs. The verified `Principal` travels separately through trusted application code. `BalanceAgent` has no inference client and returns `ExecutionUpdate` observations with typed evidence or clarification. It contains no user-facing message field. In v1, `Concierge.present` is the only owner of normal conversational result text; API/security failures retain their existing error envelopes. Account resolution and bank-result validation remain deterministic.

## V2 concierge presentation

The optional [tenant assistant profile](ASSISTANT_PROFILES.md) supplies public
identity and role. Typed capture can select conversational topics alongside
banking tasks; the concierge renders their facts from current profile and tool
access. This supports self knowledge, help and greetings without provider-authored
completion claims. General unrelated chat remains separate work. Profile/access
changes invalidate stale self-description replays. Research workers receive only
their own role and restricted tool projection.

`CapabilityHandler.run` returns an internal `ExecutionOutcome`: capability, scoped account reference and typed result. Results carry financial facts, provenance, evidence, operation status or structured questions. There is no public message field. Banking handlers do not import a presenter or compose normal user dialogue.

`AssistantService` owns the v2 coordination path and calls `ConciergePresentation.present` for executor observations, clarification and unsupported outcomes. This concierge component validates the internal result and builds the existing public `AssistantOutcome`, including deterministic Spanish text. V1 balance formatting is reused within the concierge presentation boundary. No extra inference or model disclosure is needed to render financial facts. An executor returning an outcome with a public message is rejected rather than published.

The authority-owned `ApprovalPresentation` remains structured protected data. The presenter carries its reference, kind, payload and expiry unchanged; normal dialogue cannot create an approval or replace the protected flow. API/security failures retain their error envelopes.

Public JSON/SSE schemas, typed financial values and observation timestamps remain compatible. The coordinator still checks current access before persistence/publication; replay and streaming retain their current authorization checks. Each observed result and its rendered message are saved before the next executor runs. A later failure preserves earlier evidence without claiming rollback. Replays return the saved observation and original text without rerunning an executor, renderer or model.

Ordinary v2 turns retain the request-bound capture/dispatch pipeline and short conversation lease. The opt-in [background flows](BACKGROUND_TASKS.md) acknowledge balance, product-research or read-only mission tasks without holding that lease. Temporal and its official LangGraph plugin own bounded scheduling/recovery. Mission DAGs contain up to four typed child nodes with explicit task ancestry distinct from conversation links, narrowed consultation authority, aggregate budgets, task-bound questions and parent-owned joined delivery. Public-research observations and questions return to the same concierge presenter. Open-ended general conversation, durable write operations and recursive cross-agent delegation remain separate work.

## Optional Jev routing

Jev answers two server-defined Choice questions: route (`balance`, `plan`, `clarify`) and account (`default`, `unresolved`, or a server-generated candidate key). The adapter maps candidate keys back to the authorized account references. A resolved reference stays an exact assignment `account_id`; it is not reinterpreted as a display label. Explicit request selection retains precedence, and the executor still reauthorizes the selected reference. Both probability distributions must cover exactly the supplied options, be finite and normalized, and agree with the selected option. Missing confidence or unknown choices fail safely.

A balance-only decision can skip the planning call only when route and account confidence meet the explicit development threshold and account selection is resolved. All other valid decisions reach the general planner, including `clarify`; the classifier does not define the whole product's capability list. In this v1 router/planner path, provider errors fail the task without automatic retry or provider switching. Registered-profile v2 stateless inference has a separate [bounded failover policy](PROVIDER_PROFILE.md#automatic-failover-for-stateless-tenant-profiles). The coordinator reloads authorized choices before a second model call. Regardless of route, the executor and publication/replay paths recheck current permission.

The adapter uses `POST https://openrouter.ai/api/alpha/decisions`, model `typesafe/jev-1.14`, one bounded HTTP attempt, no redirects, and a 64 KiB decoded-response bound. Its key belongs in the process environment. It sends only the bounded message, authorized account choices and pending-balance flag. No balances, credentials, signing keys or serialized principal are sent. The [authorized synthetic run](../reference/development/VERIFICATION.md) confirms access and records case-level behavior. Its experimental threshold is not calibrated or approved for production.

Sources consulted 20 October 2026: [OpenRouter Jev interface](https://openrouter.ai/docs/guides/community/jev), [OpenRouter decision semantics](https://openrouter.ai/blog/tutorials/how-to-use-jev/), and [TypeSafe primitives](https://docs.typesafe.ai/introduction/quickstart).

## Budgets, state and evidence

The existing PostgreSQL reservation, RLS and caller/grant binding remain in force. Every attempted inference consumes one atomic grant/day call immediately before invocation. A confident route uses one; a route followed by planning uses two; routing disabled uses one planning call. Replay makes no new attempt. The whole turn still has the request deadline, in addition to each provider deadline.

Returned inference evidence retains the last provider/profile, ordered returned attempts, routing confidence, plan capability names and task/capability delegation. The persistence boundary validates an allowlisted schema. Native usage extensions stay alongside normalized counts inside encrypted task state, rather than arbitrary ordinary telemetry. The coordinator projects current account choices into request-local aliases before router/planner calls and resolves a selected alias back to its exact ID before delegation. Explicit user selection still takes precedence, and current ownership/authority is rechecked. Failed attempts retain consumed budget and a safe task error; this is not complete distributed attempt tracing. Raw request transcripts and credentials are not persisted. See [data ownership and lifecycle](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md).

V1 and ordinary v2 execution remain request-bound. The separate background-task contract supplies durable scheduling, input/authorization waits, correction, cancellation and recovery for balance, public browser research and bounded read-only missions. Question IDs and child/goal revisions bind answers; transactional parent fences reject stale child generations. Evidence-bound price watches retain checks and durable timers, while delivery resolves questions/results under current authority through the concierge. Unattended credential renewal, authenticated/transactional browsing and recursive general-purpose delegation remain separate full-engine work.

The legacy `Interpreter` injection remains available through `InterpretationPlanner` for existing controlled clients/tests. Normal factory startup uses `GeminiPlanner`. Do not qualify the new planner with historical classifier reports; its prompt and schema revisions are `goal-plan-v1` and `task-plan-v1`. Jev uses `jev-balance-route-v1` and `jev-route-v1`.
