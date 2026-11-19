> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Banking capability and protected operation contracts

The shared engine carries forward WhatsBank's channel and banking capabilities through typed executors, independent authority and tenant-specific bank adapters. PayMe is one tenant. Customer authentication, KYC and financial records remain tenant/bank-owned. This contract extends the [shared interface](SHARED_INTERFACE.md), [tenant backend ports](TENANT_BACKENDS.md) and [data lifecycle](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md).

## Typed capture and domain validation

**2 November product boundary:** [ADR-010](../decisions/010-app-host-banking-and-model-context.md) requires interactive app/SDK core-banking intents to reach host-owned protected screens and core integration. Balance/history are shown once there and excluded from chat/model results. Original customer messages may remain visible, while later inference uses sanitized references and protected contact resolution. V2 pending model context now contains field names only; values are restored server-side after inference. The opt-in [host-banking contract](HOST_BANKING.md) adds `host_banking` results, session-bound one-time input delivery and optional tenant-directory contacts. Direct bank reads, the Core link adapter and opaque `host_intent` approval presentation remain separate contracts. Native screens/authentication and device adoption are not supplied here. Do not generalize host handoff into removal of WhatsApp, superagent, delegated-bank-AI or external-agent authority interfaces.

### Customer conversation history

Authenticated `GET /v2/conversations` lists retained conversations; `GET
/v2/conversations/{conversation_id}` returns their retained customer messages and
authorized assistant text. Both accept `limit` (1–50, default 20) and an opaque
resource UUID `cursor`, return `next_cursor`, and use `Cache-Control: no-store`.
Pages select newest creation timestamps with UUID tie breaking; transcript pages
are returned in chronological order. Cursors are bound to the same caller and,
for messages, conversation. Tenant, member, client, agent and grant scope, current
authority, expiry and encrypted-content availability apply to every read.

New V2 turns retain the accepted original message only in encrypted task content,
for customer-visible history under the existing bounded task policy. This field
is not input to the model context builder. Older turns may have only a permitted
projection or no original text; the API does not reconstruct missing originals.
History never replays protected banking results or financial approval controls.
The service/recharge catalogue is not a customer financial result: its names,
amounts and denominations can be shown after current catalogue authorization.
Failed turns retain their failure notice alongside any saved partial answer that
passes current disclosure checks. A partial answer does not mark the turn as
successful; revoked content and protected banking results remain excluded.
Other assistant messages are reauthorized against current policy before display.
This is neither a bank statement nor an indefinite transcript archive.

The SDK's **Nuevo chat** clears its active conversation ID; the next turn creates
a server-issued conversation. **Historial** lists and reopens retained chats,
including after reload. Background recovery is filtered to the opened conversation;
a fresh chat does not restore tasks from other chats. Starting a chat does not
cancel work in an earlier one. No browser-storage copy or host-contract change is
required. Native device acceptance remains separate from browser verification.

Catalogue responses include a readable bill/recharge summary as well as the typed
entries. The SDK renders those entries in separate sections, with amounts,
currency, reference requirements and local pagination. Empty and unavailable
catalogues are distinct; synthetic provenance remains visible. Catalogue display
does not prepare or execute a payment.

### Approved materials and recent assistant requests

`presentation.artifact` requires `artifact:read` through the current authority and an
explicit per-tenant `artifacts` catalog in the capability profile. The model sees only
IDs, titles and descriptions. The executor resolves the exact configured text/public
HTTPS link; it never generates a document or fetches an arbitrary URL. The console
renders text and explicit links without loading third-party media. Private/member
documents, signed download URLs, generated artifacts and WhatsApp delivery need
separate contracts. Saved results recheck the current catalog and reject changed or
withdrawn content. Console transcripts retain opaque references, including sanitizing
the top-level assistant text, and rehydrate through current engine authorization.

`assistant.activity` requires `activity:read`. It lists at most five caller-bound,
retained bank-handoff journals, ordered by creation time. Each entry independently
rechecks the original banking capability, account mapping and retention. It exposes
preparation/uncertainty status and exact requested amount, with no recipient or link.
Bank settlement is always `not_verified`; this is neither `bank.history` nor a bank
statement. Expired links are never refreshed by listing requests. Replay rechecks
the referenced journals and rejects changed entries.

### Explicit synthetic commerce test profile

Core's optional `synthetic_quotes` are typed test-supplier quotes for `flight`, `stay`
and `cart`. They are not real supplier offers. Exact account, quote ID, amount,
currency, expiry and category details are bound into the customer handoff. Cart line
prices must sum exactly. A synthetic quote ID must be supplied by the user or an
already captured continuation; the model cannot substitute another itinerary or
price. Missing quotes require clarification.

The Core adapter maps these into `buyEcommerce` with `vuelo`, `hospedaje` or
`carrito`, checks the exact nested source echo and qualified zero-fee total, and
leaves authorization to the bank. UI and concierge explicitly identify synthetic
quotes and state that no booking/order is made. Dispatch requires a current quote;
historical uncertainty remains visible after expiry without a URL or reinitiation.
This test path does not weaken other tenants' verified provider-quote/permit path.

Customer authentication preserves the credential's exact action scopes. V2 capability context intersects those scopes with the current grant/mandate and enabled tenant capabilities; history access does not require balance access. When that intersection is empty, account choices and preference are suppressed and the conversation performs no inference or bank read. Direct commands and saved JSON/SSE results retain their action/resource checks.

`src/ai_engine/capabilities/planning.py` captures balance, account information, history, catalog, transfers, bills, airtime, purchases, onboarding, materials and task goals. The enabled manifest and authorized account aliases come from trusted application code. The model cannot enable a capability, name a new identity or approve a commitment. The existing v1 balance planner and endpoint retain their behavior.

Account proposals are constrained to a generated alias enumeration and checked again locally. A supplied destination CLABE is captured verbatim from the request; a model cannot introduce a different destination. Missing critical fields require clarification even if the model claims the request is ready. Native contact resolution uses the explicitly provisioned tenant-directory port in [host banking](HOST_BANKING.md); other contact/media paths need their own trusted sources; typed capture is not proof of ownership, permission or execution.

A continuation explicitly names the prior pending goal as its context. The engine stores typed fields and exact server-resolved account references, then regenerates request-local aliases; it does not persist aliases as account identities. A new request for the same capability does not inherit the prior amount or recipient. The server resolves a permitted preferred/single account before deciding whether the account question remains necessary.

Financial amounts are positive exact decimal strings. Transfers validate the CLABE checksum. Service entries have an explicit bill/top-up class, stable identifier, currency, reference rules and amount bounds. Airtime denominations come from the catalog; there is no nearest-value rounding or carrier-based classification. Catalog IDs must be unique. A purchase names a current provider quote and evidence; its adapter must resolve and verify that quote independently rather than trusting model-authored prices.

## Protected operation lifecycle

`OperationService` depends on independent `OperationAuthority`, `OperationBank` and `OperationRepository` ports. A configured authority adapter must check current tenant, membership, caller, agent account, grant, resource and mandate. The service has no client-facing approval setter. Conversation text and an `approved` field cannot create an execution permit.

The operation proposal is bound to an operation ID and canonical terms digest. Authority returns either protected approval presentation or authorization under a mandate. An execution permit must match the operation, complete terms and approval reference and remain unexpired. The bank adapter must enforce final authorization and operation-ID idempotency at its execution boundary.

The encrypted PostgreSQL journal reserves a unique key per tenant, membership, client, agent account and grant. Identical replay returns the original operation; conflicting payload reuse returns 409. Revision-checked transitions allow one execution claimant. External calls happen outside database transactions. `executing`, `pending` and `uncertain` operations reconcile against the bank instead of resubmitting the effect. A process crash leaves a recoverable operation record; it does not establish a generic durable task runtime.

Completed and reversed outcomes require source evidence matching the operation and terms digest. A timeout, missing evidence or mismatched evidence remains uncertain. Cancellation before execution is idempotent; cancelling a record cannot undo an already committed bank/provider action. Financial records and bank balances are not reconstructed from this journal.

## Provisioned read routes and tenant preferences

The capability profile may optionally define `routes.routes`: a bounded list of
route IDs, registered implementation IDs, capability, executor, effect, evidence
description, priority and enabled state. The platform validates all semantics
against registered implementation descriptors. Tenant UI settings select only
from provisioned routes and never change an implementation, endpoint, credential,
permission, effect or evidence contract. Current route selection supports
`bank.catalog` using `core.catalog` and `broker.catalog`, plus enabling or
disabling the existing independently authorized `browser.shopping` public-read
route. The browser route requires the tenant's actual browser destination policy
and a configured background worker; it cannot sign in, book, purchase or pay.

Without an explicit catalog route list, the existing Core catalog is the default
for a Core tenant and the broker catalog for other tenants. An explicit list may
prioritize or disable its registered routes. The published assistant profile's
`route_preferences` maps a capability to an ordered subset of provisioned route
IDs; absent means the provisioned default, and an empty list disables all routes
for that capability. The console lists only routes reported by the bound engine.
Draft changes take effect only through the existing publication and runtime
acknowledgement path. Each read is authorized before and after dispatch, and an
attempted route is not automatically retried through another provider.

Catalog outcomes retain the route ID and a digest binding it to the tenant and
provisioned implementation. Replay checks the current route and binding. Older
catalog outcomes without this source binding cannot be redisclosed by this
gateway; issue a new authorized read. Console transcripts retain references,
not catalog content, and retrieve current authorized outcomes from the engine.
For Core bill and top-up planning, the native Core catalog remains the source of
payment terms even if a different route is selected for standalone catalog reads.

This is a **limited read-route increment**, not the complete general agent
route-selection layer. Other banking reads, multiple independently provisioned
provider adapters, alternate browser/API implementations for the same goal,
and financially consequential routing require their own executor contracts,
durable route binding, reconciliation and verification. A prepared bank handoff
is not a completed payment, and a failed or uncertain effect cannot trigger a
second route automatically.

## Bank-owned customer handoffs

[ADR-011](../decisions/011-tenant-api-and-channel-ownership.md) places WhatsApp ingress, account enrollment and bank-core knowledge in the tenant API. Trusted `tenant_handoffs` profiles select verified link clients and call the tenant API validation/preparation ports in [TENANT_BACKENDS](TENANT_BACKENDS.md#tenant-controlled-protected-links). This generic route returns the same `bank_handoff` presentation without a direct Core dependency; app/SDK `host_banking` remains distinct. The engine retains typed [onboarding intent](ONBOARDING.md), not enrollment execution.

An explicitly configured tenant can return `bank_handoff` from the conversational endpoint for protected consultations, CLABE/phone transfers, bill payments and top-ups. This is separate from `OperationService`: `awaiting_bank_authorization` means a bank-owned protected page is ready; `uncertain` means preparation could not be confirmed. Neither means paid, transferred, approved or settled. The engine never submits the bank PIN, creates an execution permit from a link, or automatically retries an uncertain initiation.

The human-approved development boundary permits this route for registered customer clients/assistants under A0/A1 only. The separate Go authority checks current customer, client, agent, grant, account, scope and mandate restrictions through `/v2/engine/handoffs/authorize`; both credential and mandate require `bank_handoff:prepare`. A2/A3 and external-agent spending remain on the independently enforced permit path. Core's protected page owns subsequent authorization/execution; its final engine-permit integration and verified settlement callback remain unqualified.

Before native I/O, the encrypted caller-scoped journal reserves exact terms, their digest, a current native-account mapping fingerprint and an uncertain child result. Replay makes no second native call; changed terms or mappings conflict. Current authority, binding and retention are rechecked before disclosure, including stored turns. Graceful cancellation and an expired lease after process death both recover persisted child requests into the interrupted parent. The shorter engine/tenant task retention applies. Expiry never proves that no bank-side request exists.

Core-specific CLABE/MXN/international-phone/catalog mappings live in the [tenant adapter](TENANT_BACKENDS.md). The common envelope permits other ISO currencies; each registered adapter qualifies its own bank contract. `bank.transfer_phone` captures an explicit international number rather than resolving a person's name. Top-up references follow separate catalog rules.

The console renders structured terms, source-validated fees/total and a protected-bank button separately from task completion. The requested-terms digest binds the customer's base instruction; the durable bank-owned quote preserves the source fee/total for the customer's later protected approval, not an engine execution permit. Its transcript stores opaque handoff references rather than duplicating protected URLs. History/replay refresh the engine task under current customer authority, then recheck the originating operator's session, edit access, chat lifetime and configuration immediately before disclosure. History refreshes at most five recent references concurrently with a five-second deadline per read; older/unavailable references remain non-actionable. The button expires at the engine disclosure deadline, which is not a promise that the bank link remains valid until then.

## Version 2 endpoints

Profile-configured tenants also support [assistant self knowledge](ASSISTANT_PROFILES.md):
authenticated `GET /v2/assistant` and additive `conversation` results from
`POST /v2/turns`. Enable profiles only for consumers supporting the new result
variant; financial operation and evidence contracts are unchanged.

Opt-in durable product research and caller-scoped listing/control use [the background-task contract](BACKGROUND_TASKS.md). `browser.shopping` currently searches/compares public source evidence without login, checkout or spending. An enabled name alone does not establish an approved destination, current mandate or qualified retailer. The concierge delegates work and owns all public wording; the worker returns observations and evidence IDs. Purchase and other protected banking handlers retain their existing independent lifecycle.

That contract also defines conversation-level task subscriptions/claim/ack delivery and evidence-bound recurring price watches. A normal JSON turn can supply a structured `watch` descriptor referencing a completed comparison in the same conversation; thresholds, schedule and product selection are explicit. Workers return typed source facts and the concierge renders the acknowledgement/result. Retention, retained checks, current mandate and customer-proof expiry bound monitoring; no financial permission or automatic credential renewal follows from a timer.

These additive endpoints do not change v1 result/event schemas. All require authenticated access and current capability/resource authorization. Unconfigured ports return `capability_unavailable`; the application never silently selects a synthetic bank.

| Method and path | Behavior |
| --- | --- |
| `POST /v2/turns` | Authenticated text turn with optional authorized account/conversation selection and required `Idempotency-Key`. Returns typed outcomes or the same events as SSE. |
| `POST /v2/media/observe` | Observe an opaque tenant-owned attachment under explicit media policy and current authority. Requires `Idempotency-Key`; encrypted replay makes no second provider attempt. Extracted fields do not grant approval. |
| `GET /v2/tasks/{id}` | Current stored turn view; reauthorizes every disclosed resource. |
| `GET /v2/tasks/{id}/events` | Finite SSE snapshot after `Last-Event-ID`; replay is an observation of the original result, not a fresh bank read. |
| `POST /v2/operations` | Validate a typed transfer, bill, top-up or quoted purchase; reserve its identity; return operation state and protected approval presentation. Requires `Idempotency-Key`. |
| `GET /v2/operations/{id}` | Read state only for its current authorized caller binding. |
| `POST /v2/operations/{id}/execute` | Obtain a current authority permit and execute once, or reconcile an existing attempt. No client approval field is accepted as proof. |
| `POST /v2/operations/{id}/reconcile` | Obtain authoritative bank outcome without repeating the effect. |
| `POST /v2/operations/{id}/cancel` | Cancel uncommitted work; committed outcomes require the provider's cancellation/reversal process. |
| `GET /v2/accounts/{id}/information` | Return authorized source-provided deposit coordinates with observation time and provenance. |
| `GET /v2/accounts/{id}/history` | Return bounded history with explicit `bank_statement` or `engine_activity` source. Pending is distinct from completed. |
| `GET /v2/services/catalog` | Return versioned catalog state: ready, empty or unavailable. An empty response does not disable the capability permanently. |
| `POST /v2/notifications/claim` | Lease a bounded batch of current, scoped operation updates through an explicitly enabled authority relay; no inference or financial execution. |
| `POST /v2/notifications/ack` | Acknowledge delivery with the matching lease token and current caller access. |

Account information/history recheck authority before publication. Returned account identity, history currency and bounds are validated. Catalog and history are fetched through ports; no bank statement or universal customer-profile endpoint is invented.

## Conversation execution and retention

Task-aware `dialogue` outcomes provide a bounded answer or essential question
without dispatching work. Capture receives at most twelve retained non-banking
turns from the same caller/conversation, with failed-attempt state and currently
authorized public-browser evidence. Banking results, pending private fields and
Maps output are excluded. These are projections of encrypted turn resources,
not a new memory store; source retention and current disclosure permission still
apply. Service continuations bind a supplied source turn, preserving exact
customer constraints rather than a model rewrite.
The customer request can remain a valid source even when its earlier response
was only an explanation. Generated assistant replies never become that goal.

Capture compilation preserves the canonical origin of that goal. A continuation
bound to an active public-research task updates that task instead of creating
another attempt, retaining counters and evidence. The generation schema offers
only current source/task IDs; local scope and authority checks remain mandatory.
Public task context distinguishes its accepted goal/revision from the revision
of observed evidence. A turn may combine a task control with a question; the
control runs first and its server-recorded state owns the acknowledgement.

Natural progress/correction/cancellation can select offered durable task IDs.
The engine supplies their expected revisions and calls the existing task
controller; neither model text nor a conversational reply changes task state.
`task_control.task_states` are observed lifecycle states, not provider settlement
or service fulfilment. Structured client controls remain available independently.
`control_applied` distinguishes an applied command from a terminal-state race.
Public corrections with a lost receipt reconcile only a stored server-issued
turn ID, action, expected goal revision and accepted-update digest. Matching goal
text or another turn's receipt cannot acknowledge the current control.
An optional validated `Question.prompt` renders a trusted provider's missing-goal
question without exposing protected account/contact choices or destinations.

The coordinator validates the complete captured plan before dispatch. An unsupported fragment causes no partial execution. Executors return internal `ExecutionOutcome` facts/evidence/status without public prose. The coordinator's `ConciergePresentation` owns normal conversational text, including clarification and unsupported responses; it converts those observations into the unchanged public `AssistantOutcome` schema. Executor-authored message fields are rejected. Protected approval payloads remain authority-owned and pass through unchanged. See [agent coordination](AGENT_COORDINATION.md#v2-concierge-presentation).

For a supported plan, each typed result and its concierge-rendered message are persisted before the next executor runs. A failure preserves already-observed outcomes; it does not claim rollback. A prepared financial operation is distinct from a completed effect. Saved JSON/SSE observations retain their original text on replay without new rendering, inference or execution; current disclosure checks still apply.

Turn resources, pending context, outcomes, events and inference usage are encrypted with tenant/member/resource/purpose binding. The database applies forced RLS plus caller/client/agent/grant predicates. Request replay and conflicting reuse survive process restarts. A revision-checked conversation lease serializes processing without holding a database transaction during inference or bank calls. A stale request becomes interrupted; it is not automatically resubmitted. This is still request-bound processing, not the general durable task runtime.

Once the conversational execution loop starts, graceful cancellation joins its
terminal persistence and lease cleanup before propagating cancellation, including
repeated cancellation of the caller. Cleanup failures remain errors; they do not
become successful cancellation receipts. This does not guarantee persistence after
process death, which retains the deadline-based reconciliation path.

Operator diagnostics distinguish conversation-capture JSON decoding from schema
validation failures using fixed stage/reason codes and sanitized validation paths.
They contain no raw provider output, customer text or exception messages; public
error codes are unchanged.

The opt-in [background-task profile](BACKGROUND_TASKS.md) adds `background: true` to JSON turn submission and returns independent background task IDs. Its bounded balance flow uses a separate Temporal/LangGraph worker, current-authority checks and explicit task-bound controls. It does not alter protected operation execution or the ordinary turn lease. Clients must distinguish the completed acknowledgement turn from the queued/running task.

Expired resource access stops immediately. The constrained cleanup worker physically erases expired resource payloads and later removes their replay markers. Terminal operation content has a separate bounded development retention; its minimal operation/replay marker remains so erasure cannot recreate an effect. Pending/uncertain effects retain protected recovery evidence until reconciliation. General erasure propagation, abandoned approval cleanup and the bank's long-term operation-identity policy remain part of the wider lifecycle implementation.

## Trusted tenant broker profiles

`ENGINE_CAPABILITY_BACKENDS_FILE` selects [version 2 profiles](../reference/config/capability-backends.example.json), validated against [the generated schema](capability-backends.schema.json). A profile binds a trusted tenant to one authority/bank broker origin, credential environment-variable name, supported/enabled actions, source provenance, approved approval-link origins and model disclosure policy. Credential values are never stored in the file. Empty enablement disables actions; absent data policy denies model disclosure. No profile falls back to another tenant or to synthetic records.

The broker exposes the optional engine-owned [request/reply contract](capability-connector.schema.json), including context, action/resource authorization, bank reads, quote resolution and protected operation preparation/permit/execution/reconciliation. This is an adapter boundary; banks need not adopt those native paths. The broker authenticates the engine service and independently checks current customer/caller/grant/mandate records. Context echoes correlate replies; they are not proof of authorization. Bank credentials stay behind that broker rather than entering the model.

Every request/reply binds tenant, membership, client, agent account and grant. Redirects, conflicting context, malformed/oversized output, credential echoes and mismatched provenance fail closed. Only configured HTTPS approval origins are accepted for secure links. Changing endpoint, credential reference or adapter identity requires restart; capability and disclosure-policy removal are checked again during requests. There is no automatic provider or bank fallback.

V2 validates the signed customer credential, then uses its configured authority source. It does not also require an unrelated legacy/local v1 grant. V1 retains its original grant gates. The current token verifier still supports the development customer profile only; external-agent, bank-assistant delegation and workload profiles remain separate implementation work.

## Adoption boundary

`authority/` is a separate, model-free Go/CEL kernel with its own PostgreSQL database and runtime role. It implements independent development ES256 delegation verification, exact owner-signed mandate changes, client connection, pause/revocation, global pause/signed resume, caller-bound encryption and serialized allowance reservations. Its JSON parser rejects duplicate, unknown and case-aliased fields; canonical terms hashes match the Python contract, including Unicode. The CEL module uses its [current upstream module path](https://github.com/cel-expr/cel-go/releases/tag/v0.32.0).

A0 hands commitments back to the user; A1 requires an exact protected approval. A2 requires an explicit signed `threshold_rule` (`below` or `at_or_below`); neither is a product default or a resolved production equality decision. A3 requires an explicit monthly cap and biometric activation. A zero allocation does not mean unlimited spending. Bank funds/regulatory caps and the account monthly cap cannot be overridden by an operation approval. New merchants, external-content goals, foreign currency and personal outbound data stop automatic authorization. Interactive authentication, blocked sites and inconsistent source evidence require an external step; an approval cannot complete those prerequisites.

Reservations lock the membership and agent before checking current state and allowance. They recheck expiry after waiting for locks and before issuing a reservation credential. Replay preserves the reservation; concurrent operations cannot overspend the account cap. Unresolved holds continue to consume allowance across period boundaries. A reversal does not silently replenish allowance. These are secondary authorization records, not bank balances or a ledger.

The [authority HTTP service](AUTHORITY.md) wires the kernel to authenticated engine/owner/core roles and a registered bank adapter. Its `Facts` come from the inspector, outside model/public inputs. Stored operation structures contain protected bank facts and credential references and are never serialized directly as public responses. Preparation replay, stable approval references, execution acceptance, reconciliation, uncommitted cancellation, independently signed callback recovery and a transactional notification relay have development HTTP coverage. Scheduled authority payload cleanup preserves a minimal separately encrypted recovery record for late outcomes and replay protection. Actual bank mapping/enforcement, channel delivery, final retirement of authority evidence and wider erasure propagation remain required. External-agent and bank-assistant credential profiles are separate work. Development proof formats do not establish approved real-tenant OAuth/assurance profiles.

Normal startup wires the v2 coordinator, read handlers and protected operations when explicit broker profiles are supplied. Without them the v2 services remain unavailable; no effect-producing adapter is silently enabled. Native Gemini and OpenRouter capture use engine-owned structured inference observations. The separate [authority service](AUTHORITY.md), bounded [durable tasks and delivery](BACKGROUND_TASKS.md), [tenant-owned onboarding handoffs](ONBOARDING.md) and [administration console](ADMINISTRATION.md) now have scoped development implementations and their own verification records. Those increments do not establish real tenant identity/bank mappings, native SDK adoption, tenant-side WhatsApp webhook/delivery adoption, complete financial lifecycle or production qualification. Optional [tenant media processing and protected-link lifecycle](TENANT_BACKENDS.md#optional-customer-media) require their own trusted source, policy and qualification. The [integration guide](../reference/development/INTEGRATION_GUIDE.html) explains the implemented contracts and the remaining adoption boundaries together.

Run deterministic and PostgreSQL checks with the [isolated setup](../reference/SOURCE_REFERENCES.md#source-8f929a906ccd). `scripts/capability_live_eval.py --allow-live` tests capture; `scripts/assistant_live_eval.py --allow-live` tests the HTTP conversation with isolated synthetic banking fixtures. Reports preserve source hashes, failed observations, usage, reported/unknown cost and fixture cleanup. These are developer observations, not held-out acceptance or real bank execution evidence. Required human and independent reviews remain governed by the existing policies.
