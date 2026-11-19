> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Shared engine interface v1

This is the executable reference contract for the Sprint 1 text/balance slice. An app, SDK, trusted channel gateway, or legacy engine implementer can use it without depending on the new brain's libraries. Consumer adoption and end-to-end compatibility must still be verified in each integrating repository; publishing this contract does not establish that agreement or deployment.

Machine-readable artifacts: [OpenAPI](openapi.json) and [task event JSON Schema](task-event.schema.json). Authentication: [tenant credential profile](AUTH_PROFILE.md). Bank boundary: [bank adapter contract](BANK_ADAPTER.md). Local setup: [development guide](../reference/SOURCE_REFERENCES.md#source-8f929a906ccd). Design: [ADRs](../decisions/README.md) and [architecture Rev4](../product/architecture/arquitectura-motor-agentes-rev4.html).

The 20 October coordinator refactor preserves this public contract. Internally, a conversational coordinator owns presentation and delegates a typed balance assignment; an extensible planner and optional Jev router select work without granting authority. See [agent coordination](AGENT_COORDINATION.md) and [the isolated refactor profile](../reference/SOURCE_REFERENCES.md#source-8f929a906ccd). New/uncertain work reaches planning, while unavailable or mixed capabilities return the existing `unsupported` result before partial execution.

## Tenant SDK and channel callers

[ADR-011](../decisions/011-tenant-api-and-channel-ownership.md) distinguishes two entry paths: tenant apps/SDKs call the authenticated engine API directly; tenant channel backends receive WhatsApp and forward verified turns using the same conversation API. Meta webhook/Flow payloads, enrollment forms/session exchange and account-creation execution are not engine endpoints. Current public conversation behavior is documented in [CAPABILITIES](CAPABILITIES.md), [AUTH_PROFILE](AUTH_PROFILE.md) and the [integration guide](../reference/development/INTEGRATION_GUIDE.html).

The verified principal supplies tenant, membership, calling client, agent account and grant. Bind channel/host routing to registered authenticated client IDs; user text/body fields cannot select another tenant or route. Each request carries its Bearer proof outside model context and a stable idempotency key; replay/streams remain caller-bound and reauthorized. Apps/SDKs consume typed host requests; provisioned WhatsApp callers consume tenant-controlled protected links. The [onboarding result](ONBOARDING.md) asks the tenant to continue its own flow and confers no account/session/grant.

## Scope and ownership

**Later app/SDK target:** [ADR-010](../decisions/010-app-host-banking-and-model-context.md) requires intent delivery to the host, which authenticates, accesses its bank and displays balance/history once outside chat/model context. The v1 direct-read result and stored replay documented here remain executable development behavior; they are not that host flow. The new [V2 host-banking contract](HOST_BANKING.md) adds the `host_banking` result and authenticated one-time consume endpoint. Its configured native clients are denied V1 turn/task APIs; other V1 clients keep this contract. Native screens and bank authentication still need adoption and device evidence. Hiding a retained chat balance is insufficient.

The shared engine is multi-tenant; PayMe is one tenant. The app presents the conversation, sends authenticated turns, displays progress/clarifications/results, and renders errors. The engine interprets text, resolves authorized resources, invokes its bank adapter, and produces typed output. The bank authenticates its customer and owns banking records. An SDK app key, phone string, client-provided principal, or model text is not authentication.

The development demo uses synthetic bank records/authority with `provenance: "synthetic"` and an explicit test-data notice. [Tenant backend configuration](TENANT_BACKENDS.md) additionally supports a configured authority/bank HTTP connector with `provenance: "bank"`; each bank's adapter must map its own identity, account and available-to-spend semantics. The public provenance enum now includes both values; consumers with older synthetic-only validators must update. A connector or preproduction example does not establish production readiness or real bank login. No transfers, CLABE flow, WhatsApp, voice, attachments, durable/background jobs or complete agent-account lifecycle are claimed here.

The external-agent banking/allowance API is a separate future authority contract. An external agent cannot use this user balance endpoint to obtain a parent account's money information. Unsupported principal kinds are rejected.

## Transport and compatibility

- Base development URL: `http://127.0.0.1:8187`. A real integration must use approved HTTPS and a configured trusted gateway.
- Versioned resource paths begin with `/v1`; response/event payloads include `api_version: "1"`.
- JSON is UTF-8. Send `Content-Type: application/json` for request bodies.
- Send `Authorization: Bearer <engine-access-token>` in an HTTP header on every protected request and stream subscription. Do not put a token in a URL or message. Never embed an issuer signing key or provider API key in an app/SDK.
- `POST /v1/turns` supports `Accept: application/json` (default, including `*/*`) or exactly `text/event-stream`. Other Accept values return 406 in this profile.
- These endpoints are server/native-client APIs. Browser EventSource cannot set an Authorization header; use an authenticated fetch streaming client or an approved same-origin backend. No credential-in-query workaround or permissive CORS profile is supplied.
- Public payloads never contain provider SDK objects, graph/runtime state, raw tools, or private reasoning. The app must not depend on a provider/model name.
- Additive result/event variants require a documented consumer compatibility plan. Unknown fields/events must not trigger banking actions. Security-sensitive request fields are strict: unknown input fields return 422.

Backend selection is server-controlled. Integrators should configure one engine-facing contract; switching the implementation must preserve observable authentication, events, results, and errors. A legacy compatibility adapter may translate existing trusted sessions and legacy responses, but cannot infer missing proof from field names such as `tokenSAML` or represent synthetic data as real bank results.

## Endpoint overview

| Method and path | Purpose | Response |
| --- | --- | --- |
| `GET /health/live` | Process liveness; no authentication | 200, development mode; does not prove bank/provider/database readiness |
| `POST /v1/turns` | Process one bounded text turn | 200 task JSON, or 200 SSE stream after validation/reservation |
| `GET /v1/tasks/{task_id}` | Read the current stored task view | 200 task JSON |
| `GET /v1/tasks/{task_id}/events` | Replay stored events after a cursor | 200 finite SSE snapshot; no background execution is started |
| `GET /v1/accounts` | List authorized account choices | 200 array of account choices, without balances |
| `PUT /v1/preferences/balance-account` | Persist an authorized preferred balance account | 200 `{ "account_id": "..." }`; requires `preferences:write` |

All protected endpoints validate the credential and current membership/agent-account/grant binding. An authenticated principal cannot read another principal's task by knowing an ID. Read and event paths also bind the calling client, agent account, and grant; renewal can preserve access only if that binding remains valid.

## Submit a turn

```http
POST /v1/turns
Authorization: Bearer <engine-access-token>
Content-Type: application/json
Accept: application/json
Idempotency-Key: unique-logical-submission-key

{"message":"¿Cuánto dinero tengo disponible?"}
```

| Input field | Type | Behavior |
| --- | --- | --- |
| `message` | Required string, 1–2,000 characters | Nonblank text; common explicit PIN/password/API-key patterns are rejected before inference. This is not a complete DLP filter: never send credentials in chat. |
| `conversation_id` | Optional UUID | Omit for a new server-issued conversation. When supplied, it must already belong to the verified owner/client/account/grant binding. Unknown or inaccessible IDs return 404; a client cannot create another owner's conversation. |
| `account_id` | Optional bounded account reference | Explicit account selection from authorized choices. Checked before paid inference. An unauthorized reference returns 403; it cannot change membership. |

No tenant, membership, actor, grant, scope, or serialized principal is accepted in this body. The credential and current authority records supply those values. No raw text is persisted as task history in this slice; a payload fingerprint supports idempotency, and structured results/events are stored. Follow-up interpretation receives whether the previous completed turn requested account clarification, not an unrestricted transcript memory.

The response arrives after bounded processing in JSON mode. It is not a 202 background acceptance. In SSE mode the accepted/progress events arrive during that same request. A 200 transport status does not mean the task succeeded: inspect `status` and `error`/`result`.

### Idempotency

`Idempotency-Key` is required, 1–100 characters from letters, digits, `.`, `_`, `:`, and `-`. Generate one key per logical submission and reuse it only when retrying the same request body under the same verified caller context.

- Scope is tenant + membership + client + agent account + grant + key. The canonical validated input, including conversation/account selection, is fingerprinted.
- Identical terminal replay returns the stored task/result without another model or bank call. This is replay of that task's historical result, not a new current-balance read; retain its observation time in the UI. Submit a new key to obtain a fresh balance.
- Reuse with different content returns 409 `idempotency_conflict`.
- A concurrent duplicate while the original is processing returns 409 `request_in_progress`, with `Retry-After: 1`. Retry the identical request or read the known task.
- After the access/replay window, task records return 410 `task_expired`. This denies API access; it does not physically purge stored rows. They do not trigger inference again under the old key. New work needs a new key.
- The current credential and grant are revalidated before replay; a stored result is not a permanent authorization bypass.
- Current permission and ownership must cover every account disclosed by a stored balance or clarification. If an active grant loses one of those resources, task/event reads and JSON/SSE replays return 403 `access_denied` with no historical banking data and no new inference/read. The engine does not silently filter a stored result. Obtain current account choices and make a new authorized submission where appropriate.

## Task view and result variants

Representative successful response (all identifiers and values are synthetic):

```json
{
  "api_version": "1",
  "task_id": "11111111-1111-4111-8111-111111111111",
  "conversation_id": "22222222-2222-4222-8222-222222222222",
  "status": "completed",
  "message": "Saldo disponible de Cuenta diaria: 1,250.10 MXN. Datos sintéticos de prueba.",
  "result": {
    "kind": "balance",
    "account": {"account_id": "everyday-a", "label": "Cuenta diaria", "currency": "MXN"},
    "available_to_spend": {"amount": "1250.10", "currency": "MXN"},
    "observed_at": "2026-10-19T18:00:00Z",
    "provenance": "synthetic"
  },
  "error": null,
  "created_at": "2026-10-19T18:00:00Z"
}
```

Statuses are `processing`, `completed`, `failed`, and `interrupted`. A completed task has a typed result and display message. A failed/interrupted task has a safe error and no banking result. A processing snapshot can be read while the original request is active. There is no polling endpoint that secretly starts or restarts work.

Result variants:

| `result.kind` | Fields and consumer action |
| --- | --- |
| `balance` | Display the identified account, exact decimal string, currency, observation time and provenance. Do not parse an amount from `message`, convert it to binary floating point for calculations, or call it a total across accounts. |
| `clarification` | Display `message`; when `choices` is nonempty, present its account IDs/labels/currencies as selectable options. `reason` is `account_required`, `preference_unavailable`, or `ambiguous_request`. |
| `unsupported` | Display the supported-scope message. No bank balance was read. |

### Account clarification and preference

An explicit authorized account wins. Otherwise a valid saved preference wins. If multiple choices remain, or a saved preference becomes inaccessible, the engine asks rather than silently choosing another account. With a single authorized account and no saved preference, it can use that account.

To answer an account clarification, submit a new logical turn with its conversation ID and the selected account ID:

```json
{"conversation_id":"22222222-2222-4222-8222-222222222222","message":"Ahorros","account_id":"savings-a"}
```

Use a new idempotency key. Explicit selection applies to this turn; it does not silently update the saved preference or funding order.

To save a preferred balance account, send `PUT /v1/preferences/balance-account` with `{ "account_id": "savings-a" }`. Both the credential scope and current grant must allow `preferences:write`, and the account must be authorized. This setting selects the balance display account. Spending configuration/funding priorities are separate future protected contracts and are not changed by this endpoint.

## Progress events and reconnect

Send `Accept: text/event-stream` on the same submission endpoint. SSE uses standard `id`, `event`, and `data` fields; `data` is one JSON `TaskEvent` matching the event schema. The response includes `X-Task-ID` and disables proxy buffering where supported.

```text
id: 1
event: accepted
data: {"api_version":"1","event_id":1,"task_id":"11111111-1111-4111-8111-111111111111","type":"accepted","phase":"received","task":null}

id: 2
event: progress
data: {"api_version":"1","event_id":2,"task_id":"11111111-1111-4111-8111-111111111111","type":"progress","phase":"interpreting","task":null}

```

Possible phases are `received`, `interpreting`, `resolving_account`, and `reading_bank`. A terminal `completed`, `failed`, or `interrupted` event includes the full task view in `task`. A clarification/unsupported result is a completed interpretation, not a transport error.

Event IDs are increasing integers within a task, not globally ordered. Delivery can repeat. Deduplicate by `(task_id, event_id)`. Do not treat a progress event as proof that a bank operation completed. Do not render private reasoning; progress contains only application states.

After a connection problem, authenticate again and read `GET /v1/tasks/{task_id}`. To retrieve missed stored events, use `GET /v1/tasks/{task_id}/events` with `Last-Event-ID: 2`. This endpoint sends a finite snapshot of events with larger IDs and then closes; poll the task for further updates. Do not repeatedly auto-reconnect an EventSource to this finite replay endpoint. A terminal submission replay in SSE mode replays its stored events and closes without executing again.

### Interruption semantics

Sprint 1 execution is request-bound. Cancellation is recorded as interrupted when the running handler can persist it. Process death can leave a processing record; after its recorded deadline, the next read/replay reconciles it to `interrupted` with `request_interrupted`. There is no autonomous replay, durable continuation, or automatic new bank call. A new attempt is an explicit new submission with a new key.

Once durable tasks are introduced, the contract will define their explicit cancellation and resumption semantics; a network disconnect must not imply cancellation of such a task. No durable-task guarantee should be inferred from the current `accepted` event.

## Errors and bounded resources

Before stream headers/processing acceptance, failures use an HTTP error response:

```json
{"error":{"code":"invalid_session","retryable":false},"request_id":"33333333-3333-4333-8333-333333333333"}
```

Unknown routes/methods or upstream proxy failures can use framework/transport error formats; treat an unexpected body as a failure, never as a bank result.

After acceptance, failures are stored in `TaskView.error` and emitted in a terminal failed/interrupted event. JSON submission still returns that terminal task with HTTP 200. Dependency exception bodies and secrets are never public errors. Every response carries a server-generated `X-Request-ID`; protected responses use `Cache-Control: no-store`.

| Code | HTTP status before acceptance | Required client handling |
| --- | --- | --- |
| `invalid_session` | 401, with `WWW-Authenticate` | Obtain valid tenant proof; do not infer login from chat text. |
| `access_denied` | 403 | Show denial; do not retry with another identity/account automatically. |
| `not_found` | 404 | Resource is absent or outside this caller binding; do not disclose another owner's existence. |
| `invalid_request`, `sensitive_input` | 422 | Correct the request; use a protected bank flow for credentials. |
| `payload_too_large` | 413 | Reduce input. |
| `unsupported_media_type` | 406 | Use one supported response media type. |
| `idempotency_conflict` | 409 | Resolve conflicting key use; never silently replay different content. |
| `request_in_progress` | 409 | Wait/read status or retry the identical request. |
| `task_expired` | 410 | Historical result is unavailable under this key. |
| `service_unavailable` | 503 | Service boundary unavailable; inspect retry guidance. |
| `protected_data_unavailable` | 503 or task error | Encrypted state or an optional protected-data service is unavailable; do not request secrets in chat or silently substitute data. |
| `model_disclosure_denied` | Task error | The tenant has not enabled this model/user-text disclosure; no inference or balance read occurs. |
| `tenant_configuration_changed`, `tenant_configuration_unavailable` | 503 | Operator must restore/reload valid tenant configuration; no cross-tenant fallback. |
| `bank_unavailable` | Task error | No current balance is supplied; do not show remembered money as current. |
| `bank_timeout` | Task error, retryable | The bank read exceeded its deadline; no balance result is supplied. A new attempt needs a new idempotency key. |
| `bank_invalid_output` | Task error, not retryable | The adapter returned malformed or inconsistent account/money/timestamp data. No balance is disclosed; report the task reference for investigation. |
| `provider_timeout`, `provider_rate_limited`, `provider_unavailable` | Task error | Bounded inference failed; no silent provider switch. |
| `provider_access_denied` | Task error | Operator must fix the provider configuration; never ask the user to paste a provider key. |
| `provider_invalid_output`, `provider_refused`, `provider_truncated` | Task error | Interpretation failed; no bank result can be inferred. |
| `inference_budget_exhausted` | Task error | Development grant budget exhausted; do not bypass it by changing keys or requests. |
| `request_timeout`, `request_interrupted`, `internal_error` | Task error | Show incomplete work and the request/task reference; never claim successful banking execution. |

`retryable` describes the condition, not permission for a new paid call or effect. Retrying a terminal task under the same idempotency key returns that terminal outcome. A new logical attempt needs a new key and must remain within budgets.

Development defaults: 16 KiB actual request-body limit, 2,000 message characters, 40-second request processing deadline, 25-second provider deadline, at most one routing attempt plus one planning attempt per turn (one planning attempt with routing disabled), 512 output tokens, 100 inference calls per UTC day per verified tenant/membership/grant, and a 24-hour task access/replay window. Scheduled cleanup erases expired content separately from the additional bounded replay-marker window. Configuration can restrict these values; these are bounded synthetic-development settings, not production SLOs or bank policy. Concurrent budget updates and reservations are database-atomic. Production rate limits, streaming concurrency/slow-client protection, production erasure propagation and aggregate spending controls require their deployment profile before public exposure.

## Data lifecycle and preference deletion

For v2 source-free conversation, trusted startup configuration defaults to the native runtime described in [ADR-017](../decisions/017-native-conversation-runtime.md). The existing `/v2/turns`, task/event replay and conversation-history interfaces remain in use. `task_control` adds caller-scoped `task_revisions` and `task_labels` maps; inspection and ambiguous-target selection supply the IDs and revisions needed for explicit controls. Native returns `assistant.conversation` dialogue outcomes and, with trusted public-research profiles, existing `task_control` outcomes for retained evidence and task inspection/correction/cancellation. Explicit `task_target` list, progress, correct and cancel requests use no inference and support JSON/SSE; mutations require a matching task/conversation and expected revision. Natural-language tools remain bounded and caller-scoped. Native does not create research tasks or execute fresh browser, banking, media or background work. Explicit requests for unmigrated capabilities fail with `native_capability_unavailable` (422), or the existing unavailable-service error before admission. Runtime selection is not a client field. Records are version-bound; using a conversation/task from another runtime returns `conversation_runtime_mismatch` (409). Start a new conversation after a configuration switch. Same-key terminal replay and reload make no new inference calls and still require current authority, profile and retained source context.

`DELETE /v1/preferences/balance-account` requires the verified current grant and `preferences:write`, returns 204, and removes only this membership's preference. PUT corrects/replaces that explicit preference, with source/time and tenant-defined development expiry. Deletion does not change bank account ownership or delete the bank account. New turns use ordinary account selection/clarification after deletion; previously completed results remain subject to their task lifecycle and current disclosure authorization.

Task result/event payloads and explicit preferences are encrypted. The planner/router sees request-local account aliases, with account labels only if the tenant disclosure policy enables them. Missing HTTP tenant disclosure permission produces a terminal `model_disclosure_denied` task error without inference or a balance read. Removing/invalidating connector configuration fails closed; no tenant fallback occurs.

Task content expiry returns 410 and excludes old clarification context. Scheduled cleanup physically clears content/native state/inference while retaining minimal replay markers for a separate bounded window, then deletes those markers. Once the marker expires, key reuse is a new request; this balance-only interface does not promise permanent deduplication or effect-execution safety. [The lifecycle contract](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md) owns retention purposes and adoption gates; development defaults are not production policy.

## Integrator acceptance checklist

Use [the reusable conformance runner and consumer handoff](../development/CONFORMANCE.md) to check this existing interface against independently known synthetic fixtures. Its HTTP results complement actual app/SDK and legacy acceptance; they do not establish those consumers' conformance by themselves.

1. Agree the trusted tenant/session profile and mapping; authenticate every request and replay path.
2. Validate the generated request/result/event schemas and preserve exact money/currency/freshness/provenance.
3. Exercise JSON and streaming success, clarification with follow-up, unsupported request, invalid session, denial, and bank/provider unavailability.
4. Verify idempotent retry/conflict, event deduplication/replay, interruption, and another owner's inaccessible resources.
5. Ensure a UI never turns transport 200, progress, or a synthetic balance into a claim of successful real banking.
6. Verify both engine implementations against the same contract before switching server routing. Do not claim legacy/app conformance until their actual code and flows have been checked.
