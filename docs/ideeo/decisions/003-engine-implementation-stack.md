> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# ADR-003: Engine implementation stack and staged runtime adoption

| Field | Value |
| --- | --- |
| Status | Proposed |
| Date | 19 October 2026 |
| Last revised | 8 November 2026 |
| Requested by | Mateo |
| Acceptance | Full-record acceptance remains pending. The later user request authorizes the scoped Sprint 1 implementation described in [the implementation evidence](../reference/development/VERIFICATION.md), including Gemini as its initial provider; this does not approve future services or production. |
| Related | [Architecture Rev4](../product/architecture/arquitectura-motor-agentes-rev4.html), [project context](../product/PROJECT_CONTEXT.md), [integration evidence](../product/INTEGRATION_CONTEXT.md), [ADR-001](001-tenant-authentication-and-delegation.md), [ADR-002](002-ai-provider-adapters-and-routing.md), [ADR-004](004-voice-channel-and-speech-providers.md) |

## Context

The 8 November user request authorizes preparing a focused native-Temporal
background adoption candidate after the isolated comparison, with no integration,
publication or production activation. Replace only the background scheduler's
single-node LangGraph wrapper with a native activity when explicitly selected.
Retain the original workflow types for draining accepted histories, the legacy
balance graph and its dependencies. The default remains `langgraph` pending
integration approval. This scoped implementation does not accept the full ADR.
See the [execution contract](../contracts/BACKGROUND_TASKS.md#execution-and-protection)
and [verification index](../reference/development/VERIFICATION.md).

The 22 October user request authorizes the bounded Temporal–LangGraph qualification and one durable read-only banking flow described in [the background-task contract](../contracts/BACKGROUND_TASKS.md). The official plugin is used with activity-only I/O, opaque control state and no competing persistent LangGraph checkpointer. [Verification](../reference/development/VERIFICATION.md) distinguishes the executed experiment/application evidence from production adoption and full-record acceptance, which remain pending.

The 3 November user request authorizes development implementation and real-model checks of the [service integration boundary](../contracts/SERVICE_INTEGRATIONS.md), prioritizing Uber rides. The shared Python HTTP browser owner uses this record's existing typed service, delegation and encrypted-resource boundaries; Temporal remains the durable workflow owner. A separate physical-attempt marker prevents duplicate browser submission after owner loss and does not replace authority reservations. Synthetic qualification does not accept real providers, a new vendor, multi-replica deployment or this full ADR.

This repository builds the full shared, multi-tenant AI engine: the brain, separate authority, agent accounts, durable tasks, and engine-side integrations. PayMe is its first tenant. Mobile applications and SDK binaries live in separate repositories; the bank core remains the external system of record for money. Staging implementation does not reduce this product scope.

The overall design is preserved in `docs/product/architecture/arquitectura-motor-agentes-rev4.html`. Its sections 4.12 and 13 propose Python/FastAPI/Pydantic/LangGraph for the brain, Go/CEL for authority, Temporal for durability, PostgreSQL, model routing, and observability. Read that reference with the later scope clarifications in [PROJECT_CONTEXT.md](../product/PROJECT_CONTEXT.md); labels such as "Decidida" in the historical architecture are not this repository's ADR acceptance record.

The live [Sprint 1 plan](https://linear.app/ideeo-ai/document/sprint-1-planning-review-and-retrospective-869086e50afd) selects [IDE-167](https://linear.app/ideeo-ai/issue/IDE-167) for this engine: text -> recognize a balance request -> bank adapter -> Spanish response, using the app's shared interface. The slice includes ambiguity, unsupported requests, bank unavailability, invalid context, meaningful tests/evals, and clearly identified controlled data. [IDE-170](https://linear.app/ideeo-ai/issue/IDE-170) owns its independent verification. The legacy and app integrations are separate work; this ADR does not change their commitments or close the broader engine stories.

At proposal time the checkout contained documentation only, with no demonstrated application profile, dependency combination, CI gate, provider qualification, or operational deployment. The subsequent controlled implementation and actual evidence are tracked through the linked Sprint 1 plan and development records. ADR-001 and ADR-002 remain Proposed. This record makes the implementation recommendations concrete and identifies which selections require supporting contracts or compatibility evidence.

## Decision

Adopt the following baseline, subject to acceptance of this record and the applicable supporting decisions. Implement the first bounded flow while preserving the service, identity, and adapter boundaries needed by the full engine.

### Decision summary and adoption order

| Area | Baseline | Adoption boundary |
| --- | --- | --- |
| Brain and API | Python 3.13, FastAPI, Pydantic v2, Uvicorn | First executable engine slice |
| Workflow | A bounded LangGraph graph | First balance flow; explicit interpretation, account selection, authorization, and rendering |
| Persistence | PostgreSQL, SQLAlchemy 2, Psycopg 3, Alembic | First persistent integration; tenant/owner isolation from the first migration |
| Provider integration | Native provider SDKs behind engine-owned task ports | One qualified route initially; additional providers and fallback require their own evidence |
| Consumer interface | Versioned HTTP/JSON and SSE, with OpenAPI and event schemas | Agree the contract with app and legacy consumers before integrating |
| Authentication | Tenant-owned login and a verified engine principal under ADR-001 | Synthetic issuer for controlled development; approved tenant trust before real access |
| Authority | Separate Go service, CEL policies, independently owned persistence | Authorization port from the first slice; qualify the real service before real protected access |
| Durable runtime | Temporal; qualified legacy LangGraph integration and opt-in native background activity | Before promising restart recovery, background continuation, long waits, or approvals |
| Development | uv lockfile, Ruff, strict mypy, pytest and versioned eval cases | Establish executable commands and CI during bootstrap |
| Additional infrastructure | deepagents, LiteLLM, Redis, vector search, GPU inference, browser and voice runtimes | Introduce with the capability and operational evidence that need them; the voice channel and speech providers are proposed in [ADR-004](004-voice-channel-and-speech-providers.md) |

This record refines Rev4's adoption order: native SDKs precede a routing gateway, and a request-bound graph precedes durable execution. The full target retains separate authority and Temporal. Exact model routes, dependency patches, public schemas, and operational budgets live in versioned supporting profiles; they are not fixed by this summary.

### 1. Brain language, API, and contracts

| Area | Selected baseline |
| --- | --- |
| Brain runtime | CPython 3.13, with a maintained patch release pinned during bootstrap |
| HTTP API | FastAPI and Uvicorn, with asynchronous integration calls |
| Boundary validation | Pydantic v2; pydantic-settings for typed configuration |
| Outbound bank/service HTTP | HTTPX asynchronous clients with explicit timeouts and bounded connection pools |
| Internal ports | Small typed Python `Protocol` interfaces and domain objects |
| Python persistence | SQLAlchemy 2, Psycopg 3, and Alembic |
| Dependency management | uv, `pyproject.toml`, a committed `uv.lock`, and a pinned interpreter |

Python follows Rev4's brain direction and supports the intended model, voice, and agent integrations. FastAPI provides a typed HTTP boundary and OpenAPI generation. Pydantic validates external inputs and structured model outputs; validation does not establish authorization or semantic correctness. Use explicit constraints and reject unexpected fields at security-sensitive boundaries rather than relying on permissive coercion. [FastAPI](https://fastapi.tiangolo.com/), [Pydantic strict validation](https://docs.pydantic.dev/latest/concepts/strict_mode/)

Python 3.13 is a conservative initial compatibility baseline, not a claim that every selected dependency has been tested on it. Resolve and check the actual versions on the supported development platforms and Linux CI before implementation depends on them. Record compatible versions in the lockfile; interpreter and dependency upgrades follow normal review and verification. [Python support schedule](https://devguide.python.org/versions/), [uv locking](https://docs.astral.sh/uv/concepts/projects/sync/)

Keep conversation handling, task logic, bank clients, and provider adapters as modules within the brain initially. Avoid creating a deployed service for every module. Domain interfaces must not expose FastAPI requests, database sessions, LangGraph state objects, or provider SDK classes to unrelated layers.

### 2. Authority is a separate service boundary

Retain Go as the target language for the authority service, with CEL through `cel-go` for versioned policy expressions and PostgreSQL for its owned records. Keep its model-free dependency boundary and independent deployment/credentials. CEL evaluates defined policy inputs; it does not replace ownership, grant lifecycle, approval, atomic limit enforcement, or bank-core checks. Exact Go versions, transport libraries, database access, and the policy schema belong in the authority implementation plan. [CEL implementation](https://github.com/google/cel-go)

Every bank operation passes through an explicit authorization port from the first slice. The brain proposes an operation; authority validates it using trusted identity and current records. The provider adapter cannot execute bank tools. External agents can use the authority API without invoking our brain, under the distinct client/grant profile in ADR-001.

A controlled, synthetic Sprint 1 environment may use a restricted test implementation of the authorization port with test memberships, agent accounts, and grants. It must deny invalid or unauthorized context and exercise ownership checks. This does not establish that the separate authority service, real bank authentication, or production enforcement exists. A real integration plan must identify and verify the actual authority service boundary before using real customer data or credentials; a test implementation cannot silently become that boundary.

### 3. Bounded reasoning and durable execution have distinct owners

| Component | Responsibility |
| --- | --- |
| LangGraph | Explicit reasoning/processing nodes and transitions within a task |
| Temporal | Durable execution history, recovery, retries, timers, and waiting/resumption |
| Domain PostgreSQL records | Application-owned task/conversation records, preferences, user-visible events, and audit evidence |
| Authority | Current permission and approval decisions before protected operations |

Use a small LangGraph `StateGraph` for the first flow: interpret -> resolve or clarify account -> authorize -> read bank adapter -> render. Treat ambiguous and unsupported interpretations as explicit outcomes. The model receives only the context needed for interpretation; trusted identity and permissions remain outside model-controlled state. The model does not decide graph budgets, credential sources, or authorization rules.

The initial request may execute this bounded graph without Temporal. Persist its observable outcome and define truthful timeout/interruption handling, including reconciliation of records left incomplete by process failure. This stage does not promise automatic restart recovery, durable background acceptance, or resumption after a disconnected request. Do not introduce an in-process background queue or a database lease loop as a substitute for the planned durable runtime.

Introduce Temporal before accepting work that promises durable continuation, long waits, approvals, or background execution. Revalidate current authority on resumption and before operations as required by ADR-001. External I/O runs in activities with explicit retry/timeout policies; workflow code remains deterministic. Activity retries do not make downstream effects exactly once: operation idempotency and uncertain-outcome reconciliation remain separate domain obligations.

The original bounded background runtime uses the qualified official
Temporal-LangGraph integration without an external LangGraph checkpointer. The
scoped native candidate removes that wrapper from background steps while keeping
Temporal as the only durable scheduler. It uses distinct queues/workflow types,
explicit drain-only workers and the same domain handler. Native mode avoids the
legacy plugin's workflow-cache shutdown workaround; retain that workaround on
legacy workers. Recovery, cancellation, retries, replay and migration routing
must be qualified per executor. The comparison did not establish a dependable
latency or general agent-quality advantage. See the
[setup procedure](../reference/SOURCE_REFERENCES.md#source-f2331501cda6).
[Temporal-LangGraph integration](https://docs.temporal.io/develop/python/integrations/langgraph)

Temporal execution history and application domain records have different purposes. Define idempotent persistence and reconciliation between them; runtime replay must not duplicate domain events or downstream operations. Follow Rev4's protected payload/reference boundaries: secrets do not enter ordinary workflow history, and sensitive persisted payloads need approved encryption, retention, and access controls.

Keep Deep Agents deferred as the default harness. A future focused comparison may qualify it for capabilities that need its planning or delegation; the bounded synthetic comparison does not justify adopting its general harness. Its filesystem, memory, execution, and subagent capabilities require explicit backend isolation, authority mediation, and lifecycle contracts. Adding it does not grant the engine or its subagents more authority. [Deep Agents](https://docs.langchain.com/oss/python/deepagents/overview)

### 4. Shared app and channel interface

Use versioned HTTP/JSON commands and Server-Sent Events (SSE) for server-to-client progress. A shared contract defines stable conversation/turn/task/request identifiers, typed inputs, progress and clarification events, structured results, failures, ordering, and idempotency. Keep public events independent of provider, LangGraph, and Temporal event formats. [SSE standard](https://html.spec.whatwg.org/multipage/server-sent-events.html)

Agree the exact endpoints, schemas, session bootstrap, stream authentication, deadlines, reconnect/retention rules, and any status/polling fallback with the app/SDK and legacy-engine integrators before claiming shared integration compatibility. Publish OpenAPI and event-schema artifacts with compatibility checks. The legacy engine and robust engine implement the same observable contract; backend engine selection remains server-controlled as described in Sprint 1.

Authorize every conversation/task read and event subscription. Never place access tokens in stream URLs. Reconnection uses stable event IDs and consumer deduplication; delivery can repeat. Bind submission idempotency to verified tenant, owner/caller context, and payload identity, and reject conflicting reuse. A replay cannot reveal another principal's result. An eventual durable task's cancellation is an explicit authorized action; losing its progress connection is not implicit cancellation.

Progress exposes useful application states, not private reasoning transcripts. Results include structured domain data alongside display text, so clients do not parse banking values from prose. External-agent authority endpoints remain a separate contract with their own permissions and disclosure rules; sharing identity semantics does not require routing every caller through chat.

### 5. Authentication profile for the first integration

Follow ADR-001's tenant-owned authentication and trusted principal boundary. Prefer a short-lived, asymmetrically signed, engine-audience JWT access credential issued by an approved tenant backend or trusted exchange after verified bank-session validation. Configure issuer, audience, token kind, allowed algorithm, keys, and tenant binding explicitly; do not discover trust from unverified token URLs or client-provided tenant metadata. This is the preferred initial profile, not a requirement that all tenants replace their identity system or use the same token encoding.

Use PyJWT with cryptographic support for Python JWT validation. It is not a complete OAuth authorization server. Use established OAuth/OIDC implementations for the applicable redirect/exchange flows, with authorization code and PKCE where required; select that integration library once the tenant profile is known. Tenant proof, grant/mandate status, refresh/revocation, replay protection, and client-bound external-agent credentials still require their supporting contracts. [JWT validation](https://pyjwt.readthedocs.io/en/stable/usage.html), [JWT security guidance](https://datatracker.ietf.org/doc/html/rfc8725), [OAuth security guidance](https://datatracker.ietf.org/doc/html/rfc9700)

For development, issue synthetic principals through a local test issuer and the same validation path, with separate keys and a trust configuration excluded from real deployments. Do not implement an authentication-disabled fallback. A client body, typed phone number, SDK app key, or model output cannot create banking identity. A valid access credential does not substitute for current ownership/delegation checks.

### 6. Bank adapter and the first balance workflow

Inspect the legacy bank adapter described in [INTEGRATION_CONTEXT.md](../product/INTEGRATION_CONTEXT.md) before defining a conflicting interface. Establish a narrow port for accessible accounts, authorized selection, and available-to-spend balance reads, with typed failures. Separate bank-field translation from the engine's confirmed account-selection behavior:

1. Use an explicit selection only if authorized for the authenticated membership and operation.
2. Otherwise use a valid saved preference.
3. Clarify when the choice is ambiguous or a saved preference is inaccessible; do not silently switch accounts.

Use decimal arithmetic internally and decimal strings with an explicit currency in JSON. The contract includes an account reference suitable for authorized display, the balance meaning, and observation/freshness information. Confirm the bank field that means available to spend; do not infer it from a generic `balance` label, aggregate currencies, or use remembered money values as current data.

Use a clearly identified controlled-data adapter for the first slice. Share contract scenarios with the real adapter when it becomes available; a fake passing those scenarios does not prove bank API compatibility. Surface unavailable, denied, invalid-context, and unsupported/ambiguous outcomes explicitly.

For the first balance response, render account, amount, and currency deterministically from the authorized adapter result. Model interpretation can produce a typed intent and account reference needing server-side resolution; it cannot assert ownership or supply the balance. This avoids requiring a second inference call or disclosing balance data to a provider solely for formatting. Preserve ADR-001's distinct allowance view for external agents; this user balance flow does not authorize parent-balance disclosure to them.

### 7. Provider integration and model qualification

Implement ADR-002's task-specific ports with official provider SDKs behind the engine-owned contracts. The initial recommendation was the official OpenAI Python SDK and Responses API. The subsequent user implementation request selects the official Google Gen AI SDK and Gemini for the first Sprint 1 adapter and real-call verification; preserve the same task-facing boundary and qualify the actual profile. Validate structured results locally and retain required native continuation artifacts within the approved adapter/storage boundary. LangGraph may invoke our ports; public/domain interfaces do not become provider SDK types. [OpenAI function calling](https://developers.openai.com/api/docs/guides/function-calling)

Introduce LiteLLM when centralized routing, credential management, or spend controls justify an additional component and its integration is qualified. Keep tenant data policy, domain capability checks, safe handoff, and authority enforcement in engine-owned contracts. Use one integration path per profile; avoid serializing the same request through multiple model-interface translators without a concrete requirement. This refines Rev4 section 4.12's proposed initial LiteLLM placement; it does not remove multi-provider routing from the full engine.

Initial evaluation candidates from the 19 October research are GPT-6 Luna for the bounded balance interpretation, GPT-6.1 Sol as a more capable reasoning baseline, and Claude Sonnet 5.5 for a second provider/family. These names are dated candidates, not accepted routes, a permanent global default, or evidence of Spanish banking quality. Gemini and self-hosted profiles can be added through the same qualification process. Record the actual model/revision available, adapter, API, prompt/schema versions, capabilities, data restrictions, budgets, and evidence in separately versioned profiles. [Luna](https://developers.openai.com/api/docs/models/gpt-6-luna), [Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol), [Claude models](https://platform.claude.com/docs/en/models/overview)

Start with one qualified route, explicit deadlines, bounded attempts, and visible failures. Add fallback only after another route and its handoff are qualified under ADR-002. The first slice can use synthetic data while real-data provider/region/retention permission remains unresolved. Vendor documentation establishes available interfaces and candidate capabilities, not our task's acceptance results. Dual-family review for richer agent behavior remains later work; model review never replaces deterministic authority checks.

### 8. Storage and observability

The 21 October request authorizes the controlled runtime data boundaries in [ADR-005](005-data-ownership-and-lifecycle.md): encrypted task/preference payloads, resource-bound envelopes, versioned key resolution, explicit model disclosure and scheduled bounded cleanup. [The lifecycle contract](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md) owns categories, authority, retention and erasure propagation. Local development key files do not implement the proposed production KMS boundary. Cleanup uses a no-login constrained function owner, rather than granting the runtime cross-tenant table access or `BYPASSRLS`. Forward migrations and payload backfill/rewrap commands preserve applied history and replay identity.

Use PostgreSQL in development and CI. Select the production PostgreSQL/Aurora major version with the infrastructure owner and align the relevant environments before real integration. The brain and authority own separate databases and credentials when their services are deployed; they do not share writable application tables or acquire the bank's ledger responsibilities.

Carry verified tenant/owner scope into domain records and access paths from the first migration. Use RLS alongside application authorization, a runtime role without ownership or `BYPASSRLS`, and separate migration privileges. Set verified context within each transaction so pooled connections cannot retain another request's identity. Review both read and write policies, including background work. With SQLAlchemy async code, use a session per request/task rather than sharing mutable sessions across concurrent operations. [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html), [SQLAlchemy asyncio](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)

Begin with structured logs, correlation IDs, OpenTelemetry traces, and latency/failure/retry/usage metrics across the affected boundaries. Redact before export; bank credentials, PINs, and privileged principal data do not enter model payloads or ordinary telemetry. Prompt/transcript capture needs an explicit data policy. Add Langfuse, Sentry, and search backends as their operating workflows require them, with the same redaction and access controls. [OpenTelemetry processing](https://opentelemetry.io/docs/collector/transforming-telemetry/)

Defer Redis, vector indexes, GPU inference infrastructure, and additional brokers until a specified capability needs them. This is adoption order, not deletion of the architecture's memory, self-hosted inference, or scale requirements.

### 9. Development and delivery profile

Use Ruff for formatting/linting, mypy with strict checking for owned Python code, and pytest with the applicable async/HTTP fixtures. Start model evaluations with versioned cases and a small task-specific runner whose reports identify the effective model/prompt/schema/configuration. Additional test libraries can be selected in the implementation plan when they serve concrete scenarios. [Ruff](https://docs.astral.sh/ruff/), [mypy](https://mypy.readthedocs.io/en/stable/), [pytest](https://docs.pytest.org/en/stable/)

Use Docker Compose for local dependencies and GitHub Actions if GitHub is the selected host. Enforce locked dependency resolution in CI. Separate fast deterministic checks and controlled integration scenarios from paid provider runs; establish the authorized environment, data, and cost budget before live evaluations. Framework installation or a model-judge score cannot establish a permission invariant.

Use the existing [methodology](../policies/METHODOLOGY.md#10-branching-and-integration) convention: feature branches into `dev` for local integration and `main` for human-controlled production promotion. Existing `staging` does not replace that mapping. Configure actual protections; local integration does not deploy or authorize a push. Establish per-worktree ports/databases and atomic resource claims. Actual commands, CI/eval gates, and recovery procedures live in the setup guide; the Go/Hitos reference profile remains illustrative.

Keep common delivery, testing ownership, and independent review requirements canonical in [METHODOLOGY.md](../policies/METHODOLOGY.md), [AI_DEVELOPMENT.md](../policies/AI_DEVELOPMENT.md), [PRODUCTION_READINESS.md](../policies/PRODUCTION_READINESS.md), and [TESTING_OWNERSHIP.md](../policies/TESTING_OWNERSHIP.md). This stack ADR does not waive them or extend the earlier documentation-only merge exception to software.

## Alternatives considered

| Alternative | Tradeoff and disposition |
| --- | --- |
| TypeScript for the new brain | Aligns with the legacy channel adapter, but Rev4 and the planned agent/voice integrations favor Python. Reuse legacy integration knowledge through contracts; do not make its language the new brain's dependency. |
| Go for the entire engine | One language across services, but gives up the selected Python brain ecosystem. Keep Go for authority and validate the cross-service contracts. |
| A general deepagents harness from the first balance query | Supplies planning, memory, execution, and delegation early, but adds interfaces and permissions the bounded slice does not need. Introduce it with the relevant capabilities. |
| LangGraph persistence alone for the full runtime | Can support persisted graph execution, but the target includes long waits, independent workers, durable timers, and workflow evolution. Retain Temporal as the durable runtime and qualify the integration. |
| Independent Temporal and LangGraph durable checkpoints | Creates competing recovery ownership and reconciliation work. Use one durable execution authority rather than adopting both implicitly. |
| LiteLLM as the initial mandatory provider interface | Centralizes useful routing and budgets, but adds a dependency and translation layer before they are needed. Start with native SDK adapters; qualify a gateway when justified. |
| WebSockets for the initial text/progress interface | Useful for bidirectional realtime interaction, but HTTP commands and SSE match this flow. Revisit transport for voice/realtime requirements without leaking runtime/provider formats into the domain contract. [ADR-004](004-voice-channel-and-speech-providers.md) proposes a separate voice-session contract for that purpose. |
| In-memory storage or SQLite as integration evidence | Convenient for isolated tests, but cannot establish PostgreSQL transactions, RLS, or actual persistence behavior. Use PostgreSQL for the affected integration gates. |
| Full EKS/GPU/browser/observability platform before the first slice | Front-loads operational work. Deliver the bounded flow while separately qualifying the required services before each capability depends on them. |

## Consequences

The first engine slice uses a concrete, reproducible Python/API/storage baseline and preserves the proposed boundaries for multi-provider reasoning, authority, and durable work. The app contract can remain stable across legacy and robust implementations. Deterministic account selection, access checks, and balance rendering constrain what model interpretation can affect.

We take on a Python/Go service boundary, native adapter maintenance, explicit domain/runtime reconciliation, and compatibility qualification for the orchestration integration. Staged adoption requires honest capability reporting: a request-bound demo is not durable execution, a synthetic issuer is not bank authentication, and a controlled bank adapter is not live banking evidence.

Acceptance of this record would select the stated baseline, not accept every unresolved architecture detail, approve provider data processing, or prove operational readiness. Supporting specifications and plans remain necessary at the affected implementation boundary.

## Required supporting contracts and open details

Before the affected work starts, establish:

1. Acceptance of this ADR and the applicable ADR-001/ADR-002 designs, with conflicts resolved against reviewed revisions.
2. The shared app/legacy/engine API and event contract, reviewed with the integrating developers, including session proof, error semantics, idempotency, and interruption/reconnect behavior.
3. The first tenant's credential/assurance profile, verified principal mapping, grant/account checks, and separation of test and real trust configuration. Real tenant details remain externally dependent.
4. The bank balance/account/failure mapping, freshness contract, account preferences and persistence, and controlled fixtures. Real bank credentials stay outside documentation.
5. The reproducible dependency set, commands, branch/protection mapping, claim mechanism, resource isolation, CI/eval gates, and approved IDE-167 implementation plan.
6. Initial inference profiles, permitted data/regions/retention, qualification cases, approved evaluation thresholds/budgets, and actual provider access. Model candidates do not satisfy these requirements.
7. A bounded Temporal-LangGraph compatibility investigation and an accepted execution/persistence plan before durable/background capabilities. Confirm the self-hosted EKS operational owner and constraints before deployment; the local runtime does not settle that choice.
8. Authority service wire/policy contracts and its operational boundary before real protected access. Full grant/account lifecycle and long-running renewal details remain subsequent implementation work.

Items outside IDE-167 remain visible follow-up work rather than implicit additions to its Sprint commitment. A blocked real integration can coexist with a clearly bounded controlled-data slice, within the approved story criteria.

## Verification obligations for implementation

These are required evidence categories for the affected future implementation, not executed checks or a replacement for the canonical policies.

| Boundary | Evidence needed |
| --- | --- |
| Bootstrap | A fresh checkout installs the locked profile and discovers/runs the documented checks on supported development platforms and Linux CI. |
| Shared interface | App, legacy, and robust implementations agree on request/event/result/error behavior; reconnects/repeated submissions do not disclose another principal's data. |
| Identity/authority | Forged, expired, wrong-issuer/audience, cross-tenant/user, and missing/revoked delegation scenarios deny access before protected reads; test trust is excluded from real configuration. |
| Bank and account selection | Authorized explicit/preferred selection, ambiguous/inaccessible choices, decimal/currency fidelity, fresh results, unavailable bank, and distinct external-agent allowance disclosure. |
| Model interpretation | Representative Spanish requests, corrections, ambiguity, unsupported actions, invalid output, and hostile identity claims produce approved typed outcomes without invented bank data. |
| Persistence | Migrations and transaction/RLS behavior under runtime privileges; pooled and concurrent sessions cannot inherit another request's tenant/owner context. |
| Durable execution, when introduced | Worker crash/restart, replay/version changes, interrupt/resume, bounded retry, current-authority checks, idempotent event writes, and completed/uncertain-effect reconciliation. |
| Telemetry and provider boundaries | Useful correlation/usage/failure evidence with no credentials or prohibited personal data in model inputs, events, workflow payloads, or exported telemetry. |

No application, bank integration, provider call, test suite, eval, CI configuration, or deployment is established by writing this ADR. Record the actual implementation evidence and remaining limitations in the corresponding work and verification records.
