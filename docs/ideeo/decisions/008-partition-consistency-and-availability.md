> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# ADR-008: Consistency and availability during network partitions

| Field | Value |
| --- | --- |
| Status | Accepted |
| Date | 23 October 2026 |
| Revision | 2026-10-23.1 |
| Requested by | Mateo |
| Acceptance | Mateo approved revision 2026-10-23.1 in the 23 October 2026 conversation and requested its integration into `dev`. This accepts the partition policy; supporting bank contracts, implementation plans, and production promotion retain their separate gates. |
| Related | [Project context](../product/PROJECT_CONTEXT.md), [ADR-001](001-tenant-authentication-and-delegation.md), [ADR-003](003-engine-implementation-stack.md), [ADR-005](005-data-ownership-and-lifecycle.md) for data lifecycle, [ADR-007](007-inference-reuse-and-cache-boundaries.md) for cache boundaries, [architecture Rev4](../product/architecture/arquitectura-motor-agentes-rev4.html) sections 4.3, 4.5, 4.8–4.11, and [production readiness](../policies/PRODUCTION_READINESS.md) |

## Context

The shared engine spans the brain, authority, task runtime, domain databases, bank core, host, channels, and external providers. PayMe's core owns money and bank records; the engine owns delegated authority, task records, and integration behavior. A network partition can leave some of these components reachable while others are not. The choice is therefore per operation and authoritative state, not a single CAP label for the product.

During a partition, a distributed operation cannot guarantee both a linearizable result and a successful response from every reachable side. The design must say which operations wait, reject, or defer for a current authoritative decision, and which may return a clearly identified older observation. Ordinary uptime, replicas, retries, and recovery after the partition are separate concerns. This ADR does not claim that any proposed database or deployment already provides a particular consistency level.

Existing requirements already constrain the choice: balances and remaining allowance come from current bank records; the authority checks current grants, mandates, and approvals; the core makes the final money decision; task and notification delivery may repeat; uncertain external effects require reconciliation. See [project context](../product/PROJECT_CONTEXT.md#accounts-balances-and-spending-preferences), [ADR-001 section 6](001-tenant-authentication-and-delegation.md#6-authorization-and-durable-work), and [ADR-003 section 3](003-engine-implementation-stack.md#3-bounded-reasoning-and-durable-execution-have-distinct-owners).

## Decision

Prioritize **consistency over availability for authority, money, and accepted state transitions**. If a required current source or durable commit is unreachable, do not produce the protected effect or claim that a state change succeeded. Preserve an explicit unavailable, deferred, pending, or uncertain outcome as appropriate.

Prioritize **availability of nonauthoritative observations where safe**: previously confirmed, immutable history; task/event snapshots; provider discovery; and personal preferences may remain readable during a partition only after the caller's access is currently established. Show observation time and completeness, and never present a snapshot as a current balance, remaining allowance, pending-operation status, approval, permission, or evidence of a new effect. This is a deliberately bounded degraded mode, not a promise that every partition leaves a readable replica.

The policy applies to the PayMe assistant, other tenant assistants, bank-assistant delegation, and external-agent authority access. One caller class does not gain a weaker authorization route because it bypasses the brain.

Implement the safety rules when each operation is built; add the availability infrastructure as demand justifies it. These failures can happen with one worker and one bank connection, so they are not only scaling problems.

### Operation policy

| Operation or state | Partition choice | Required behavior when the authoritative path is unavailable |
| --- | --- | --- |
| Verify tenant membership, client/grant binding, active agent account, current mandate or pause/revocation, and restrictive tenant policy | Consistency | Deny or defer protected reads and effects. A valid old token, cached grant, model claim, or reachable replica without a defined freshness guarantee cannot substitute for a required current check. Public or onboarding-only help may remain separate. |
| Create/change/revoke a grant or mandate; approve/reject an action; pause/resume an agent account | Consistency for the acknowledged state | Report success only after the authoritative write is committed with its version and acknowledged by each required enforcement boundary. A received request may be shown as **pending** and retried. Locally suppress known agent work immediately on a pause request, but do not claim bank-wide pause until the bank enforcement path confirms it. A bank-owned emergency pause path should be specified so a reachable core can stop debits independently of the engine. |
| Revoke a connection, withdraw data consent, or delete personal memory | Consistency for the acknowledged control | Once the authoritative restriction is committed, stale copies must not keep granting access or be served as if still permitted. If a reader cannot establish the current restriction/version, withhold the affected data. Report completion of deletion only after its required propagation and evidence contract is satisfied. |
| Transfer, debit, payment, card issuance/use, points redemption, charged booking, order placement, or other irreversible external commitment | Consistency | Require current authorization, exact approval or mandate version, available limit, a durable intent/audit record, and final bank/provider enforcement at the effect boundary. If any required gate is unavailable, do not start the effect. A timeout after submission is **outcome unknown**, not permission to submit it again. |
| Remaining allowance, available-to-spend balance, funding choice used for execution, and current payment/approval status | Consistency | Return unavailable or pending with a retry path. Never fill the gap from memory or an older replica and call it current. External agents still receive only their mandate allowance, never the parent balance. |
| Enforce hard tenant/task spend and concurrency limits; acquire browser-session writer control; switch between agent action and human takeover | Consistency | Do not start metered work, open a competing browser writer, or allow an agent action when the controlling counter, lease/fence, or takeover state cannot be established as current. Soft usage charts may lag, but they cannot enforce hard limits. |
| Accept a task, user turn, correction, cancellation, or webhook as durably recorded; advance its authoritative lifecycle | Consistency for acknowledgement | Acknowledge acceptance only after the owned durable record is committed. If the commit result is uncertain, use the same idempotency key to look up the outcome before retrying. Losing an SSE/push connection does not cancel a committed task. Cancellation is a request, not proof that an already executed effect was undone. |
| Read task/conversation progress or notifications | Availability-oriented snapshot, conditional on current access | A known older snapshot may be displayed with its observation time and stale/incomplete marker. It cannot authorize an approval or show a newly completed effect without authoritative evidence. A fresh task-status read is unavailable when its authoritative record cannot be reached. Notifications remain hints, not state. |
| Read historical transaction events | Availability-oriented snapshot, conditional on current access | Previously confirmed events whose past occurrence is immutable may be shown with an `as of` time and a warning that newer entries, reversals, or corrections may be missing. Pending/reversible statuses and a requested **current** result require the authoritative source. Never infer a successful payment from an old list or absent entry. |
| Read provider catalog, search results, public help, or nonsecurity preferences | Availability-oriented, within tenant data policy | Serve a bounded stale result if its provenance/age is known; otherwise mark unavailable. Revalidate price, inventory, recipient, terms, and authority before a commitment. A stale tenant security policy or grant is never treated as a preference. |
| Read memory, analytics, model-usage reports, or operational telemetry | Availability-oriented, conditional on access and data policy | Delayed or incomplete projections may be shown with their observation time. They provide neither current authorization nor evidence that a payment, cancellation, deletion, or other protected action completed. |
| Reconcile an uncertain external effect and publish its final result | Consistency for completion; eventual delivery for copies | Check the bank/provider's authoritative operation record using the stable effect identity. Until resolved, retain **uncertain** and avoid a second effect. Delivery to app, webhook, WhatsApp, analytics, and search may lag or repeat; consumers deduplicate and refresh from the owned record. |

### Cross-boundary rules

1. **Name one writer and one authoritative read path for each state.** Bank balances, debits, card enforcement, and bank transaction records remain with the bank core. The authority owns its authorization decisions and approval evidence; the authoritative grant/mandate version, status, and usage sources must be agreed with the bank before integration. The domain store owns task/user-visible event records; Temporal owns workflow execution history. Copies, memory, caches, channel messages, and model context are not new authorities. Neither the bank nor the engine may treat a lagging copy of the other's state as an independent source of permission.
2. **Fence concurrent effects.** A grant or mandate decision cites the current version. Per-operation and aggregate spend limits need an atomic reservation or equivalent serialization at their authoritative enforcement point, plus final core/issuer checks. Two workers or partitions must not independently spend the same allowance. The exact reservation, expiry, release, and bank handshake require a reviewed contract; an in-memory counter or eventually consistent cache is insufficient.
3. **Do not claim a cross-service transaction that does not exist.** Persist an effect identity and intent before dispatch; use downstream idempotency where supported, deduplicate inbound results, and reconcile the authority record, task record, Temporal history, and bank/provider result after partial failure. A provider without idempotency may leave a human-resolved uncertain state. Audit unavailability before dispatch blocks the protected effect.
4. **Keep stale data from changing permissions or truth.** A snapshot can assist display or planning only. Before an effect, recheck the current policy, approval, mandate, funds/limits, quote, and provider state relevant to that effect. A status must not move backward in a client view after a newer authoritative version has been observed; event IDs and versions support deduplication and refresh. Replicas must also honor current access and deletion restrictions before serving old personal data.
5. **Make degradation explicit.** Responses and events distinguish `current`, `as_of`/possibly incomplete, `unavailable`, `pending`, and `outcome_unknown` using the shared API contract. Do not turn a partition into a confident natural-language claim. Access checks still precede stale personal-data display; if current access cannot be established, withhold it.

### Partition examples

- **Authority reachable, bank core unreachable:** a current balance, allowance, debit, card, or bank-result confirmation is unavailable. The assistant may explain that status and retain an authorized task as waiting. It cannot use a remembered value or submit a purchase on the assumption that the core will later approve.
- **Bank core reachable, authority/grant store unreachable:** the core may continue its own bank-operated flows under its contract, but the shared engine and external-agent route defer protected operations. An engine outage must not bypass the user's pause or grant controls. The bank-owned pause path is an integration requirement, not a capability established by this ADR.
- **Effect submitted, acknowledgement lost:** the task records an uncertain outcome and reconciles by the effect ID. It does not create a new ID and repeat the effect. User-facing completion waits for independent bank/provider evidence.
- **Notification/read replica available, primary task record unreachable:** show only a dated snapshot to an authorized viewer. An approval button, cancel action, or assertion that the task just completed must reach the authoritative path.
- **Model/provider unreachable:** an already accepted durable task waits or follows a separately qualified provider fallback; its authorization and task state remain governed by the same rules. A stateless public-help response may remain available through a qualified route without claiming durable task acceptance.

## Alternatives considered

| Alternative | Why it is not selected |
| --- | --- |
| Treat the whole engine as uniformly consistency-first | Needlessly hides safely cached historical or public information and obscures which user actions truly require current state. |
| Treat the whole engine as uniformly availability-first | Could authorize from stale grants, overspend a mandate, repeat external effects, or report a false completion. |
| Trust short-lived tokens or local snapshots for every partition | Token validity does not prove a grant is unrevoked or a spending limit remains; a universal lease duration would silently define a revocation window that has not been approved. |
| Assume retries, Temporal, or eventual reconciliation provide exactly-once effects | They recover execution but do not atomically commit across the authority, bank, and arbitrary external providers. |

## Consequences and required contracts

Some valid user requests will wait or fail during authority/core partitions. That is intentional for protected operations. Historical views and public discovery can remain useful but must expose staleness. The authority, bank, and host need distinct `pending`, `unavailable`, and `outcome_unknown` behavior; channel messages must not flatten them into success.

Before affected implementation, specify and review:

1. For each protected operation: authoritative service, exact freshness/version proof, final enforcement point, outage result, retry deadline, and whether an already submitted effect can be queried by its stable ID.
2. Atomic mandate/allowance reservation and release, core/issuer enforcement of pause/revocation, and a bank-owned emergency pause route. Include behavior when one side acknowledges a change and the other is partitioned.
3. Durable intent/audit and task-event publication protocol, idempotency scope/retention, out-of-order event handling, and reconciliation ownership. Do not assume one transaction spans separate service databases or external providers.
4. Shared response/event fields for current versus dated/incomplete snapshots and uncertain results; caller-specific disclosure and channel policy; maximum acceptable lag for any permitted snapshot. Define whether a historical projection can survive later reversals or corrections. No generic freshness duration is approved here.
5. Deployment topology, database replication/read routing, failover ownership, and observability for lag, blocked protected actions, pending pauses, uncertain effects, and reconciliation age. These are implementation choices, not inferred from naming Aurora, PostgreSQL, or Temporal.

## Verification obligations

Under [AI development](../policies/AI_DEVELOPMENT.md) and [production readiness](../policies/PRODUCTION_READINESS.md), inject partitions and delayed/out-of-order acknowledgements at the authority–core, authority–domain store, Temporal–domain store, engine–provider, and event-delivery boundaries. Verify actual downstream effect counts and persisted states, not only response text. Include concurrent spending against one mandate, pause during an in-flight commitment, revoked access to a stale replica, a lost write acknowledgement, worker replay after submission, duplicate webhooks, competing browser writers, takeover during disconnection, hard-quota backend loss, and failover/replica lag. Check that stale history is labeled, current balances and pending statuses are withheld when unavailable, and uncertain effects never become claimed completions without evidence. Set exact limits and environment-specific test gates in the approved contracts and implementation plan; no runtime checks are claimed by this ADR.
