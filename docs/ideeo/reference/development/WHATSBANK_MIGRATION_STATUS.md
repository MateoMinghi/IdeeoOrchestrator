> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../../README.md).

# WhatsBank capability migration: implementation and architecture status

Updated 28 October 2026 against the shared-engine development source. The previous report described checkpoint `b1f23f4` on `feat/whatsbank-capability-migration`; its paused investigation state was historical. Subsequent work includes immutable mandate history, centralized concierge presentation, durable balance/research tasks, conversation delivery, owner inventory/allowance interfaces, and recurring read-only monitoring. Git records revisions; the [verification index](VERIFICATION.md) records actual evidence and remaining gates.

**The complete migration remains unfinished.** Executable development behavior, real-model/source observations, actual bank/channel adoption, independent acceptance and production readiness are different claims. This report does not accept Proposed ADRs, declare stories Done, or approve production promotion.

## Scope and ownership

The later [ADR-011](../../decisions/011-tenant-api-and-channel-ownership.md) places enrollment/KYC/forms/session exchange, account creation and WhatsApp webhooks/Flows in each tenant API. The engine keeps authenticated SDK/tenant-channel entry points, typed handoffs and tenant-service connectors. PayMe/Armony is one example. The 28 October tables below retain their historical revision/scope and do not make those tenant services engine backlog items.

The later [ADR-010](../../decisions/010-app-host-banking-and-model-context.md) changes the target for interactive app/SDK banking: infer intent, deliver to the host, and keep authentication/core screens and single-display balance/history outside chat/model context. Current direct-read/link behavior in this status snapshot is development evidence, not adoption of that target. Sensitive-field removal from pending model context and protected contact resolution also remain to be implemented; full agent-account and other-channel scope is preserved.

Build the entire shared multi-tenant engine in [product context](../../product/PROJECT_CONTEXT.md) and [Rev4](../../product/architecture/arquitectura-motor-agentes-rev4.html), respecting the [ADR acceptance status](../../decisions/README.md). PayMe is one tenant. Banking cores/ledgers remain external; app UI and SDK binaries live in their repositories. The engine owns APIs, channel adapters, bank/provider ports, task agents, authority and agent-account interfaces. Another bank's assistant delegating reasoning to our brain is distinct from an external agent using authority/banking APIs only.

## Current development boundary

| Area | Implemented behavior | Remaining boundary |
| --- | --- | --- |
| Shared engine/tenant routing | Python/FastAPI, typed HTTP/JSON/SSE, tenant-selected backends, capability/model-egress policies, encrypted scoped PostgreSQL state and replay. | Real tenant mappings, consumer adoption and production isolation. |
| Banking reads | Balance/account selection, account information, source-attributed bounded history, service catalogs and exact money/currency validation. A dedicated WhatsBank adapter qualifies native preproduction HMAC balance reads against created synthetic users, protected source cents and the authenticated engine path with controlled authority. | Real customer trust/authority adoption and production field/hold/freshness semantics. Other banks retain their own mappings. Engine activity is not a bank statement. |
| Protected operations | Deterministic transfer/bill/airtime/quoted-purchase preparation, independent permits/protected approvals, idempotency, uncertainty reconciliation and signed source evidence. An explicit Core customer route additionally prepares bank-owned authorization links; it cannot grant autonomous spending. | Actual bank/provider/host mapping. Chat agreement is not financial approval. |
| Independent authority | Separate model-free Go/CEL executable/database, signed mandates, A0–A3 development policy, current restrictions, atomic reservations and bank checks. | Production trust/deployment/operation. Local holds are secondary authorization state, not a ledger. |
| Owner controls/history | Individual/global pause, terminal revocation, exact signed resume, separate restriction revisions, append-only control audit and immutable encrypted mandate history with verified provenance and explicit legacy gaps. | Frictionless lowering and final evidence retirement. Overwritten versions are not fabricated. |
| Owner inventory/allowance | Scoped paginated inventory and a registered bank port for source usage, holds and remaining allowance, bound to exact identity/version/currency/freshness. | Each real bank must implement/qualify that port. No local-counter or parent-balance fallback. |
| Concierge | Executors return typed observations; the concierge owns normal public wording and exact source/financial facts. Authority approval payloads remain protected. | Open-ended conversational reasoning and synthesis over general task trees. |
| Durable work | Separate Temporal workers with LangGraph activities, encrypted assignments/results, retained budgets, input/authorization waits, correction/cancellation, recovery and reconnect. Conversation leases end with the turn. | General durable financial execution, broader task trees and production Temporal qualification. |
| Public browser research | Fresh sandboxed Chromium, credential-free approved reads, independent destination/mandate checks, bounded observe/plan/act/verify/replan, evidence IDs and goal assessment. Approved user product URLs can seed research. | Generic/dynamic retailer discovery, challenges, authenticated sessions, checkout/spending and production computer isolation. Direct product success does not qualify the whole retailer. |
| Task delivery | Atomic transition outbox; conversation subscription/replay, claim/ack leases, retries, current-authority resolution and an idempotent reference inbox storing opaque references. | App/SDK/channel adoption, actual WhatsApp/push/signed agent consumers and exhausted-delivery redrive. |
| Price monitoring | Evidence-bound product/variant/currency, exact thresholds with explicit equality, durable timers, retained read limits, cancellation, deadlines and first-match concierge delivery. | Unattended tenant-issued renewal and broader proactive missions. Expired proof requires same-binding reauthentication; timers never extend authority or retention. |
| Bank callbacks | Signed source outcomes, duplicate/stale/conflict handling, atomic outcome/outbox and recoverable banking notification relay. | Actual channel delivery/redrive. Late evidence does not grant execution/disclosure. |
| Data/providers | Encryption, forced RLS/non-owner roles, explicit model egress, local aliases, bounded cleanup, minimal reconciliation evidence and Gemini/OpenRouter task ports. | Production keys/rotation, wider erasure/retirement, full observability and broader model qualification. |

Details remain canonical in [background tasks/delivery/monitoring](../../contracts/BACKGROUND_TASKS.md), [authority/owner APIs](../../contracts/AUTHORITY.md), [coordinator/executors](../../contracts/AGENT_COORDINATION.md), [capabilities](../../contracts/CAPABILITIES.md), [tenant backends](../../contracts/TENANT_BACKENDS.md), [data lifecycle](../../product/DATA_OWNERSHIP_AND_LIFECYCLE.md), and [setup](../SOURCE_REFERENCES.md#source-8f929a906ccd).

## Architecture alignment

The implemented subset preserves one shared engine, separate deterministic authority, external bank ownership, tenant-specific backends, protected execution and scoped evidence. Workers do not independently publish dialogue. Background work no longer holds a conversation-wide lease. Actual bounded browser loops and Temporal/LangGraph workers exist; describing these as absent or as deterministic handler names only is now inaccurate.

These additions do not complete structured child delegation, aggregate mission budgets, arbitrary specialist environments, all channels or the complete durable runtime. A single workflow is not a general multi-agent mission. Source-backed product evidence is not independent verification of merchant claims. An outbox is not a delivered external message. Qualification applies to the recorded revision/configuration/source/model, not every tenant or provider.

## Remaining full-product inventory

| Area | Missing implementation or qualification |
| --- | --- |
| Real tenant identity/banking | Approved exchange/session/assurance contracts; customer/member/client/grant/account mappings; qualified reads, funds/risk, approval, quote, execution and evidence. Playground diagnostics do not establish these. |
| Native handoff | Core preproduction customer links now support protected consultations, CLABE/phone transfers and bill/top-up preparation through the separate Go gate. Native app/host adoption, verified settlement callbacks and autonomous final-permit integration remain open. |
| External-agent banking | Registered/sender-bound clients, mandate-limited authority-only APIs, allowance-only disclosure and signed qualified destinations. |
| Other-bank assistant delegation | A distinct authenticated task entry into our brain, bounded rights, progress/input/approval/evidence lifecycle. |
| WhatsApp/onboarding | Historical web-app qualification used authorized synthetic preproduction accounts. Under ADR-011 the tenant API owns enrollment, fixture/account creation, verified webhooks/Flows, linking/recovery, protected KYC/PIN and channel delivery. Engine work is authenticated turns, typed handoffs and tenant API integration; actual tenant adoption remains separate. |
| Media/voice | Scoped encrypted expiring objects, transcription/extraction/provenance/confirmation; concierge speech ports, app/session integration and es-MX qualification. Voice ADR remains Proposed. |
| General agents/proactivity | Parent/child assignments, inherited/aggregate limits, skills, broader specialist loops/missions and unattended bank-approved renewal. |
| Shopping effects/phone | Authenticated browser sessions, authority-mediated checkout and uncertainty recovery; separate phone executor, consent, evidence and protected commitments. |
| Memory/artifacts | Approved public tenant materials now have a typed executor, exact source replay checks and reference-only console history. Attributed recall, correction/forgetting, generated/member-specific artifacts and channel delivery remain open. Preferences are not complete memory. |
| Operations/production | Administration/analytics, actual destination/channel adoption, redrive, telemetry/redaction, CI/protections, isolated deployment, recovery exercises, production keys and evidence retirement. |

## Evidence and acceptance

The web-test increment also adds five-entry current-authority assistant request
history (bank settlement remains unverified) and explicit synthetic flight, hotel
and cart quotes leading to Core preproduction payment links. These do not book
travel or place merchant orders. Media ingestion/receipt extraction, voice ports,
tenant-authored journeys and broader proactive missions remain unimplemented;
they are not implied by these banking tests. The architecture's self-hosted speech
endpoint is not configured in this checkout.

[VERIFICATION.md](VERIFICATION.md) links commands, source fingerprints, tests/evals, retained failures, source observations, paid usage and cleanup. Developer checks do not replace current independent primary/cross-model review, separate human Verification, human critical-control acceptance or production approval. Synthetic banking and public retailer reads remain separately attributed.

The earlier absence claims about history, concierge presentation, durable workers and bounded autonomous browsing have been superseded. Missing real bank/channel/production boundaries remain open. Follow [methodology](../../policies/METHODOLOGY.md), [AI development](../../policies/AI_DEVELOPMENT.md), [testing ownership](../../policies/TESTING_OWNERSHIP.md) and [readiness](../../policies/PRODUCTION_READINESS.md). Linear owns live Sprint/assignment/acceptance state; this repository update does not modify it or assign people.
