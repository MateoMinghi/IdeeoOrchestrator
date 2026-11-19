> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Durable background tasks

This contract implements the user-requested durable development runtime, the existing balance flow, and bounded product-comparison work under [ADR-003](../decisions/003-engine-implementation-stack.md). The complete ADR remains Proposed. Existing deterministic banking handlers and authority checks remain authoritative. Production deployment and long-lived bank credential renewal require separate qualification.

## Native retained-task access

The native conversation service can inspect retained public research tasks, query
source-bound observations and correct or cancel an existing task in the same
conversation, under matching trusted public-research configuration and current
authority. Its typed tools do not instantiate a legacy assistant or browser owner.
The existing encrypted background journal and public command transitions are shared;
a control and its native turn receipt commit atomically. Explicit `task_target`
controls need no model call. Natural-language corrections must select exact text
from the current customer message and match the offered goal revision.

Native controls read a locked snapshot, release the SQL transaction for current
tenant authorization, then atomically compare and update that snapshot in a second
short transaction. Lock acquisition is bounded to 250 ms; contention or a changed
snapshot requires a fresh attempt. Remote authorization does not hold task/turn row
locks and does not provide distributed atomic revocation. Exact client revisions
remain mandatory for explicit controls; unrelated worker writes before the native
snapshot do not invalidate an inferred goal-revision control.

The model receives only task identifiers and trusted state metadata while controls
are available. Reading goals, constraints or evidence closes the mutation phase for
that turn. Ambiguous targets produce a typed selection with scoped labels and
revisions; consumers submit the selected ID/revision through `task_target` with the
customer's correction or stop request. Conflicting repeated controls fail explicitly.

Corrections retain task identity, deadlines, runtime binding and spent budgets.
Old observations remain available with their original timestamps and revision labels;
they do not verify the revised goal. Cancellation commits `cancel_requested` under
the worker's existing action fence; only the assigned worker confirms cleanup and
terminal cancellation. New corrections cannot restart a cancellation-pending task.
Later model failure preserves authorized receipts and partial evidence through
reload. Replays recheck access and never reapply controls.

This increment has synthetic retained-record/API verification, not new native task
creation or browser acquisition. It does not migrate legacy conversations or adopt
old execution state under a new worker. Existing task HTTP/worker deployment and
consumer qualification remain separate; see [ADR-017](../decisions/017-native-conversation-runtime.md).

## Interaction and identity

The background balance development profile below is not the [ADR-010 interactive app/SDK flow](../decisions/010-app-host-banking-and-model-context.md). Do not use its retained result or notification delivery to put a customer's balance/history into app chat. Interactive banking belongs in the host's protected single-display screen; any future unattended banking use needs an explicit disclosure/delivery contract. General research, task durability and agent-account scope are unchanged.

A conversation turn captures an instruction and returns an acknowledgement, question or immediate answer. Its conversation lease ends when that turn finishes. A background task has its own opaque ID, deadline, state, event sequence and result; it never holds the conversation lease while executing or waiting. Banking operations remain the existing independently authorized, idempotent operation records. A task is not permission to move money. Background capabilities currently comprise a balance read and public product research without sign-in, ordering or spending.

The concierge is the only source of user-facing messages. Executors return typed observations; existing deterministic presentation preserves account, currency, amount, provenance and observation time. Acknowledging a queued task does not claim a bank read succeeded. Disconnection stops delivery, not execution. A reconnect reads the current task and replays events after the consumer's cursor, with current authorization before each disclosure.

Configured `public_research` task views use a concise `message` for the observed
state, selected source evidence and pending conditions. The full typed `outcome`,
including its detailed message, remains available under the same authorization.
Follow-up interpretation may privately select current option, criterion and
engine-owned excerpt handles, or request detailed evidence. These display choices
cannot change the goal, establish facts, authorize actions or appear as additional
public `DialogueDecision` fields. Stale or unoffered handles cannot silently refer
to another option. Short unassessed observations remain explicitly pending;
source excerpts and a finished browser step do not establish goal fulfilment.

Public task views also expose `accepted_constraints`, derived from the existing
task record under the same current disclosure check. It includes the current
`goal_revision`, `compiled_goal_revision`, compiled factual/execution requirements,
option count and any exact `pending_update`. During correction, prior compiled
filters are labeled as awaiting update; the pending customer change is shown
separately. Clearing assessed candidates does not erase these saved constraints.
Successful compilation advances the compiled revision and clears the pending
projection. Failed compilation preserves it. This adds no memory store or new
retention policy. Private saved-filter selections bind both revisions; stale
selections cannot silently reuse a criterion ID after recompilation.

For independently valid public tasks and controls, an invalid optional display
selection is discarded without changing executable intent or spending another
capture call. Invalid/ambiguous targets, correction scope and financial controls
still fail their normal validation. Current-turn token spans are private capture
references: the engine retrieves the exact permitted customer text, preserving
whitespace and punctuation. Mixed goals use nonoverlapping spans; a separate
question is excluded from the correction. Existing bounded scope repair must
retain task/control targets and prior-turn source references.

Task commands identify an explicit task ID and expected revision. A clarification answer, account correction or cancellation must refer to that task in the same authenticated conversation and caller scope. If a conversational correction lacks an unambiguous target, the concierge asks which task; it must not infer the latest task across concurrent work. An account correction is allowed only while waiting for input; after execution begins, cancel the old read and submit a new task. Completed observations are immutable and never relabeled as observations of another account.

Submission idempotency binds tenant, membership, client, agent account, grant and canonical request. Identical duplicates return the original task; conflicting reuse returns 409. Retries of activity publication use a stable transition identity, so redelivery cannot append duplicate events. Delivery itself is at least once: consumers deduplicate by task ID and event ID.

## HTTP development profile

With explicit `ENGINE_CONVERSATION_RUNTIME=legacy` and `ENGINE_BACKGROUND_ENABLED=true`, `POST /v2/turns` accepts `background: true` and returns a JSON 202 receipt. The existing `task_id` identifies the completed acknowledgement turn; `background_task_ids` identifies independently executing work. Background acceptance uses JSON; `Accept: text/event-stream` is rejected before reservation. Ordinary turns retain their existing JSON/SSE behavior. Capture runs in the worker and is limited to one balance goal; unsupported or ambiguous non-account goals fail explicitly without a banking call.

For explicit product research, additionally send `background_capability: "browser.shopping"`; its goal is the turn's `message`. The default remains `bank.balance`, including existing replay fingerprints. With a browser policy configured, ordinary concierge capture can also delegate a `browser.shopping` goal and return its opaque task reference. An acknowledgement means accepted work, not a verified product or completed purchase.

An explicit background research request may include `research_url`, a user-selected public product document. Tenant destination policy and independent authority must authorize it before acceptance and again before navigation. The worker observes that document before inference, charges its retained navigation budget, and supplies actual evidence to the same research/verification loop. It never treats the URL as a source observation or as permission by itself. Omitted fields preserve existing request fingerprints. JavaScript-dependent search/discovery remains source-specific; successful direct product research does not qualify that retailer's entire search or checkout experience.

`GET /v2/background-tasks` lists only the verified tenant/member/client/agent/grant's unexpired tasks, optionally filtered by `conversation_id`. `limit` is 1–50; `cursor` is the opaque UUID returned as `next_cursor`. Listing reauthorizes each task's sensitive content. Completed results remain discoverable after reconnect; revoked access exposes control metadata only. Lists never infer or adopt a task from another caller.

An ordinary JSON turn may carry `task_target: {action, task_id, expected_revision}`. Actions are `list`, `progress`, `correct` and `cancel`. Corrections use the turn message as the corrected goal; mutations require the explicit task ID, current revision and matching conversation. A missing target yields task selection without mutation. Structured results carry task references; the task read endpoint returns its currently authorized progress, concierge question, observations and final outcome. These control turns perform no inference. A plain follow-up without a target does not silently mutate background work.

`GET /v2/background-tasks/{id}` returns state, revision, execution deadline and, when currently permitted, the question or completed observation. A freshly authenticated owner whose grant is now denied may see this non-sensitive control metadata with `authorization_required: true`; questions and bank results are suppressed. `GET /v2/background-tasks/{id}/events` returns a finite SSE control-event snapshot after `Last-Event-ID`. Poll/reconnect for subsequent events, then fetch the current view for authorized content. No sensitive payload is embedded in the event stream.

`POST /v2/background-tasks/{id}/commands` requires `conversation_id`, `expected_revision` and `action` (`answer`, `resume` or `cancel`). `answer` additionally requires an exact `account_id` while waiting for account input. `resume` supplies the current authenticated proof through the normal Authorization header while waiting for authorization. Missing or ambiguous task targets cannot mutate a task: conversational clients must request a selection and send the explicit ID; plain follow-up turns never implicitly adopt a background task. A stale revision returns 409, a different caller/conversation returns 404, and forbidden account access returns 403.

For browser work, `correct` supplies a bounded `goal`; a task-bound `answer` may also supply the clarified goal. Previous goals and their revisions remain encrypted. New observations are tagged with the goal revision, so results from an older goal cannot satisfy the correction. Corrections retain the original execution deadline and consumed budgets and fence in-flight publication. They cannot add destinations, change the mandate or replenish resources. A signed mandate change requires a new assignment; an old task cannot silently adopt another mandate version.

## Bounded product-comparison executor

Trusted browser policy bounds `max_stagnant_observations` (default 2),
`max_repeated_rejections` (default 2) and `context_max_bytes` (default 65,536).
Task-local progress ignores observation times/cosmetic HTML hashes while keeping
distinct merchant/product identities. Unchanged reads, repeated source failures
or unchanged rejected evidence stop with `no_progress`. A correction resets only
the progress window; absolute consumed budgets and deadlines remain. Price-watch
polling retains its separately paced policy.

Model context is a synchronous projection of protected task state, tagged with
resource/goal revisions and source/claim provenance. Required current goals,
the full bounded correction history and exact selected/candidate evidence are
preserved; optional old observations, page text and links yield to the total UTF-8
bound. Required data exceeding the bound fails with `context_limit_exceeded`
before inference. No derived transcript is persisted or applied asynchronously.
The optional Gemini computer demonstration validates every response step and
call ID before accepting its single proposal. Unknown/nested wrappers, malformed
later calls and duplicate/multiple calls reject the entire response before dispatch.
Call IDs are not business idempotency.

The encrypted assignment carries capability, goal, success criteria, permitted destination paths, agent/grant/mandate binding, goal revision and action/inference budgets. Browser assignments bind the actual mandate version returned by the separate authority; the legacy balance profile continues using its existing current-permission checks without inventing an unavailable mandate version. Defaults bound research to 12 navigations and eight model calls, within the existing one-hour absolute deadline and daily grant inference budget. Retries and corrections never refund attempts.

Each activity performs a bounded observe/plan/authorize/act/verify step. The model can search, open an indexed link from the current observation, request an essential item/variant/preference, select observed evidence IDs, or stop. It cannot supply an execution URL, price, credential, grant or user-facing completion message. A persisted activity lease and revision checks fence overlapping/retried work. An observation committed before activity acknowledgement is reused after worker loss.

Trusted tenant browser policy and the independent authority both constrain destinations. The authority checks the current signed mandate, caller scopes and bank restriction, returns the exact task/destination/mandate binding, and rejects old versions. Current checks run before inference/navigation and publication. Policy removal, scope changes, expired proof, pause and revocation stop further protected work/disclosure.

The development browser launches a fresh sandboxed Chromium process/context for each document observation. It has no persistent profile, credentials, cookies, page scripts, service workers, downloads, forms or click interface. All page networking is denied. The trusted document fetcher makes only credential-free GETs, validates exact HTTPS hosts and configured path prefixes, pins a public DNS answer to the actual socket with hostname-verified TLS, and bounds response size/time. It never automatically follows a redirect: an approved destination becomes a link observation, and opening it requires a separately authorized task action. A forbidden redirect is unavailable. An explicit synthetic loopback fixture is restricted to the search origin's exact port. This development containment does not qualify production container/host isolation or arbitrary authenticated browsing.

Visible text and approved links come from the rendered document. Product facts come from observed schema.org Product/Offer JSON-LD; exact decimal parsing avoids binary floats. Unsupported/dynamic/challenged sources yield unavailable evidence rather than invented products or an agent-block bypass. The model chooses evidence IDs; deterministic verification rejects invented IDs, superseded product observations and evidence from older goal revisions. Source hashes, URLs, times and availability remain attached to each product. Verified here means source-backed facts, not independent verification of a merchant's claims.

Only `ConciergePresentation` renders dialogue and comparison text. It preserves exact source amounts/currencies and distinguishes available, unavailable, unknown and partial results. A product comparison never prepares an order or financial operation. Real retailer/model quality, native delivery, human acceptance and production isolation remain separate qualification gates.

Before publishing selected products, a separately prompted, budgeted assessment checks them against the latest item, variant, price and preference requirements, with the exact source evidence IDs. A mismatch returns structured feedback to the next planning step instead of completing the goal. This probabilistic assessment supplements deterministic source/price/authority checks; it does not grant access or replace retailer/model evals. Its call consumes the same retained per-task and daily grant budgets.

The active-task default is four per tenant/membership/client/agent/grant, serialized in PostgreSQL across API workers; the boundary can be configured from one to 100. Identical duplicate submissions remain readable at capacity. The enqueue acknowledgement does not take the conversation execution lease. If the API loses the response after reservation, retrying the same idempotency key recovers the same task.

## Read-only mission coordination

An enabled background runtime accepts `background_capability: "assistant.mission"`;
ordinary capture can also propose coordination for connected read-only goals.
The worker plans at most four typed `bank.balance`, `browser.shopping` or
evidence-bound `tasks.watch` nodes. Unknown dependencies, cycles, nested missions
and effect capabilities are rejected. Temporal remains the scheduling/recovery
owner and encrypted application records own task state.

Resource `parent_id` still identifies the conversation. Separate encrypted
`mission_link` metadata binds root/parent task, node, generation, authenticated
origin and the child's singleton delegated capability. Server-verified caller
records supply origin. The only mode is `consultation`; current authority, tenant
policy and the parent's retained subset narrow every child action. No model can
assign identity, grants, financial approval or effect tools.

Children have stable IDs and can progress independently while siblings wait for
input. Parent-row locking atomically fences child birth/publication against
correction/cancellation and records a durable join wake. Child deliveries are
suppressed; the parent publishes one joined result. An unchanged question remains
claimable across sibling wakes without another notification. Parent completion
requires every current child to have authorized completed evidence; failed,
partial and waiting children remain distinguishable.

The task view adds `mission`: nodes, superseded generations, provenance, narrowed
capabilities and retained aggregate `TaskBudget`. Each attempted child action or
inference charges parent, leaf and applicable daily-grant budgets before I/O.
Default parent limits are twelve actions/eight inference calls and the original
background deadline. Corrections/retries never replenish them.
This bounded profile stops all further decisions/actions when either retained
ceiling is exhausted, including verification and deterministic dependent checks.
It does not silently grant extra work of another kind after the assignment stops.

Admission bounds
bookkeeping roots and executing leaves separately by `background_max_active_tasks`
each, so roots cannot consume every child slot (at most twice that many resources).

Node-specific control uses the parent's `/commands` endpoint. An `answer` supplies
`node_id`, `question_id`, `expected_child_revision`, `expected_goal_revision` and
exactly the permitted `account_id`, clarified `goal` or observed `evidence_id`.
The current question binds the assignment and answer shape; stale/replaced/cancelled
questions cannot resume work. Multiple eligible watch offers require explicit
selection. Whole-mission clarification uses the root question and goal revision.
Ordinary turn `task_target` remains list/progress/whole-goal correction/cancellation;
node-specific answers/corrections use the direct command endpoint.

`correct` with a node fences it and dependent descendants, preserving unaffected
results and consumed budget; omit the node to correct the whole goal. Parent
cancellation fences pending children before draining them. Completed observations
remain attributed history. Resume requires fresh proof with the original caller
binding and current authority. Transport Stop, cancellation and mandate revocation
retain separate meanings; cancellation does not undo submitted financial effects.

Compliance impact: LR-01/02/03/04/05/10/12/13/17; ISO/IEC 27001 controls 5.15, 5.18,
5.23, 5.31, 5.34, 8.11, 8.15, 8.26, 8.28, 8.29; ISO/IEC 42001 A.4.3, A.5.2,
A.6.2.2–A.6.2.4, A.9.2. Existing legal/real-tenant disclosure and acceptance gates
remain. New vendors/destinations, authenticated browser/helper profiles, inferred
memory, general provider continuation and RSI mechanisms stay disabled/unselected.

## Conversation delivery

Task transitions to `waiting_input`, `waiting_authorization`, `completed`, `failed`, `expired` or `cancelled` create a task-delivery outbox entry in the same PostgreSQL transaction. The outbox holds opaque task/event references and control states, not a second copy of the question/result. Forced tenant/membership RLS and explicit client/agent/grant/conversation checks apply to every read, claim and acknowledgement. A conversation lock serializes cursor allocation through commit. Expired delivery records are erased by bounded scheduled cleanup; deleting a task replay record cascades to its delivery references.

`GET /v2/conversations/{conversation_id}/deliveries/events` subscribes to control updates across that conversation's tasks. `Last-Event-ID` is the numeric conversation-delivery sequence. A subscription lasts at most 25 seconds, then reconnects with the last cursor; `duration=0` gives a finite replay. Events contain no questions, prices, bank results, credentials or raw model text. Session/conversation validity is checked on each polling cycle and emission.

`POST .../deliveries/claim` accepts `limit` (1–50) and an optional `after` cursor. It leases unacknowledged entries for up to 30 seconds with progressive retry backoff and ten attempts. Unacknowledged entries before the cursor remain eligible: recording a stream cursor never acknowledges receipt of a result. The response resolves each task through current authority and the concierge view; revoked access suppresses its content. A claim currently returns at most one task view (the requested limit is an upper bound), so an earlier private result never waits while another task is authorized. The reference consumer drains up to 50 claims per receive. Lease time and attempt charging start after view preparation, with final eligibility and task-revision checks preventing overlapping claims or changed results. Superseded questions are acknowledged internally without becoming another completion message. Claiming or retrying delivery does not execute research, inference or financial operations.

`POST .../deliveries/ack` accepts `delivery_id` and its opaque `lease_token`. Matching acknowledgements are idempotent; expired/replaced leases cannot acknowledge a newer claim. This is at-least-once delivery. Consumers persist/upsert by delivery ID before acknowledging, rather than appending an unkeyed message. Exhausted entries require operational intervention; automatic retries do not run forever.

The executable reference is `TaskInbox` and `scripts/task_inbox.py`. Its SQLite inbox stores only origin/conversation binding, delivery IDs, cursor and task IDs. It survives a lost acknowledgement/restart without duplicate inbox entries, and fetches task views under current authorization when rendering. It does not retain private transcripts/results. App/SDK/channel consumers must adopt this contract in their repositories; this increment does not send WhatsApp, push or third-party webhook messages.

## Recurring product monitoring

`POST /v2/product-watches` creates a recurring read-only task from an authorized completed comparison in the same conversation. Required fields are `conversation_id`, `source_task_id`, exact `evidence_id`, decimal `threshold`, `interval_seconds` (60–86,400), and `deadline`; `comparison` is `below` by default or explicitly `at_or_below`, and `max_checks` is 1–24 (default 12). `Idempotency-Key` binds the complete request. A normal JSON concierge turn may supply the same structured `watch` descriptor with a matching `conversation_id`; it returns the concierge's acknowledgement and opaque background task reference. Unstructured text alone does not silently select a product or invent a monitoring schedule.

The selected source determines the exact product URL, title, variant URL and currency. The worker reobserves that public document, rejects ambiguous/mismatched offers, and compares exact decimal prices without currency conversion. The trigger also requires source availability. Source evidence is preserved in the result, and the concierge owns its message. Each attempted document read consumes a retained check/navigation before I/O. Worker restart, reauthentication and retries cannot refund checks or extend the absolute deadline. A watch stops after its first match, cancellation, deadline or exhausted checks. Existing task listing, revision-bound cancellation and authorization-resume commands apply. Changing its product/threshold/schedule requires a new assignment.

The dedicated Temporal watch workflow waits on durable timers and signals, uses an absolute deadline across continue-as-new, and retains its counters in encrypted application state. The deadline must leave one hour for delivery before both the shorter tenant/engine content expiry and the existing conversation expiry (default retention is 24 hours; configured engine maximum is 168). Thus a fresh default conversation supports deadlines up to 23 hours; an older conversation has less remaining time, and longer watches require an expressly permitted retention profile. Identical caller-bound retries recover the original retained watch before applying creation-only deadline/source checks, with current authorization still required for disclosure. No task continues after erased content expires.

Monitoring does not extend a customer credential or mint a replacement. Expired proof, revoked grants, policy removal and mandate changes prevent new reads. An expired session produces `waiting_authorization`; fresh proof must preserve the original tenant/member/client/agent/grant and current mandate binding. A timer, a stored approval or an old successful check cannot renew authority. This provides explicit reauthentication for long-running work; unattended bank-issued renewal remains a separate tenant trust contract.

## Lifecycle

| State | Meaning and permitted continuation |
| --- | --- |
| `queued` | Durably reserved, awaiting dispatch or a worker. |
| `running` | A bounded activity is resolving or executing the task. |
| `waiting_input` | Account selection is missing or inaccessible; an explicit task-bound answer can resume it. |
| `waiting_authorization` | Customer proof expired or current authority denies continuation; no further reads or result disclosure. Fresh customer authentication and a successful current-authority check are required for resume. |
| `waiting_timer` | A durable controlled delay is pending. No conversation lease is held. |
| `cancel_requested` | Cancellation is durably requested; subsequent reads and result publication are forbidden. An already-issued read may finish, but its result is suppressed. |
| `completed` | A typed authorized observation is persisted. Disclosure still requires current authorization. |
| `cancelled` | Cancellation acknowledged; terminal. |
| `expired` | Execution/input/authorization deadline exhausted; terminal. |
| `failed` | Bounded attempts exhausted or a nonrecoverable error occurred; terminal. |

Every transition has an ordered event with a constant phase/code and timestamp. Progress contains no private reasoning, credential, raw provider output or invented percentage. Sensitive questions/results are encrypted and disclosed only after current checks. An expired login can be refreshed for the same caller binding; a different grant, client or membership cannot adopt the task. A revoked grant does not resume merely because a workflow timer fires or an older successful check is replayed.

## Execution and protection

The background worker supports `ENGINE_BACKGROUND_EXECUTOR=native_temporal` as
an opt-in development adoption candidate; the default remains `langgraph`.
Native mode schedules the existing bounded domain step through a typed Temporal
activity, using distinct `NativeBackgroundTaskWorkflowV1` /
`NativeProductWatchWorkflowV1` types and a `-native-v1` task-queue suffix. Existing
graph workflows stay unchanged and require their original worker and queue.
Both modes retain current authority checks, budgets, encrypted application content,
opaque workflow payloads and the same customer-facing task contract. Selection is
trusted process configuration; clients and models cannot choose it.

`ENGINE_BACKGROUND_DISPATCH_ENABLED=false` keeps a worker serving accepted work
without querying the pending-task outbox or assigning new executions. Use this
for compatibility drains. Only one executor mode may dispatch new work for a
shared namespace/task population; running dispatchers of both modes races the
assignment even though workflow IDs are idempotent. Follow the
[cutover and rollback procedure](../reference/SOURCE_REFERENCES.md#source-f2331501cda6).
Switching configuration never rewrites, resets or restarts accepted histories
under another workflow type. Each history replays with its own implementation.
Production adoption and cross-type replay compatibility are not established.

Temporal owns scheduling, timers, signals and recovery. Legacy mode executes bounded steps through the single-node LangGraph plugin without a second durable checkpointer; native mode calls the same domain handler through a native activity. Completed activity results replay from Temporal history; external I/O never runs in workflow code. Activities reload protected application state and current authorization before protected reads and before publication. Repeated read attempts can occur after uncertain worker loss; this does not authorize repeated financial effects. Existing banking operation idempotency and reconciliation remain unchanged.

In legacy mode, the bounded background plugin disables Temporal workflow-instance/sticky caching (`max_cached_workflows: 0`) and rejects disabled safe eviction. With the qualified Temporal 1.34.0/LangGraph 1.2.16 dependency set, cached graph awaiters can survive worker shutdown and later fail during garbage collection outside their workflow runtime. Zero caching safely evicts them between activations. The three-cycle shutdown regression requires no remaining graph generators, unraisable errors or unawaited-coroutine warnings; timer-based watch replay must not repeat activity work. This affects in-memory workflow instances only; task/history retention and inference caches keep their existing contracts. More history replay is the performance tradeoff, so production load qualification remains required before changing this policy. The isolated Temporal 1.35.0 comparison did not resolve the leak; project dependency versions remain unchanged.

Workflow arguments, activity results, signals, search attributes and failures contain only opaque task references and bounded control values. Credentials, principal bindings, instructions, account references and bank observations remain in the encrypted application repository. Unexpected exceptions become constant failure codes before crossing the activity boundary. Worker access to the internal dispatch locator is not a customer-facing data API. Production KMS, worker identity and namespace access remain deployment gates.

The development profile bounds tasks to one read, one selected account, a one-hour absolute lifetime, at most three activity attempts per step and 64 scheduling steps. Inference remains subject to the existing per-grant daily budget and provider timeout/token limits. Resubmission, reauthentication and worker restart do not reset task deadlines or budgets. Controlled delay is trusted development configuration, never an arbitrary client timer or endpoint. Task content expires under the shorter existing tenant/engine retention; a replay marker cannot resurrect erased content.

Durable reservation precedes dispatch. An outbox reconciler retries uncertain dispatch with the same workflow ID; it does not recreate task execution state or reset a finished workflow. If Temporal or the worker is unavailable, the task remains visibly queued/waiting; the API must not claim it is running or completed. Task cancellation is an explicit authorized command and is distinct from transport cancellation. Execution is disabled for unsupported write capabilities rather than silently falling back to a synthetic adapter.

## Required qualification

The outbox is the encrypted `background_task` resource itself. Narrow internal security-definer functions, owned by the existing no-login lifecycle role, expose at most 100 pending opaque IDs/revisions and the caller binding for one background ID. They expose no payload or credential. Only the runtime role may invoke them; these are never HTTP endpoints. The worker then uses ordinary RLS-scoped, caller-bound resource reads and verifies the retained customer proof before current bank authority checks. The proof is encrypted only for this bounded task, removed on terminal transition, and never automatically renewed. Key loss or task-content erasure prevents continuation. Uncertain inference can retry within the existing per-grant budget; a persisted capture is reused after restart.

The executable experiment must use a real Temporal service, a separate worker process, a bounded activity in each selected executor and persistent event publication. It checks worker termination after publication but before activity acknowledgement, restart/retry without duplicate publication, history replay, timers surviving worker loss, waiting for input, cancellation, bounded failures and absence of sensitive values in ordinary history. The application flow additionally checks concurrent conversation turns, reconnect, duplicate submission, account clarification, expired/revoked authority, cross-caller denial and a real LLM capture with synthetic banking data. A mock-only test does not establish durability or provider compatibility.
