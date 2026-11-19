> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# ADR-007: Verified interpretation reuse, cache boundaries, and website skills

| Field | Value |
| --- | --- |
| Status | Proposed |
| Date | 23 October 2026 |
| Requested by | Mateo |
| Acceptance | Full-record acceptance remains pending. The 4 November request authorizes the Redis session-coordination proposal and scoped development implementation of verified interpretation reuse and skill qualification. Actual evidence is recorded in [verification](../reference/development/VERIFICATION.md); this grants no production or independent acceptance. |
| Related | [Project context](../product/PROJECT_CONTEXT.md), [architecture Rev4](../product/architecture/arquitectura-motor-agentes-rev4.html#memoria), [ADR-001](001-tenant-authentication-and-delegation.md), [ADR-002](002-ai-provider-adapters-and-routing.md), [ADR-003](003-engine-implementation-stack.md), [ADR-005](005-data-ownership-and-lifecycle.md), [skill research and interpreter deferral](../product/RSI_RESEARCH.md) |

## Context

The engine repeats some interpretations, tenant configuration reads, model prefixes, API reads, and browser observations. Repeating a model call for a previously verified, self-contained request can waste time and money. General browser execution still needs live observation and recovery; a familiar site can also offer a qualified procedure. The architecture already mentions learned shortcuts, short-lived reads, prefix caching, site skills, and clean browser snapshots, without one contract for their scope and invalidation.

These mechanisms have different owners. The bank and authority own current financial and permission facts. The task log and domain records own progress, evidence, idempotency, and uncertain effects. A cache is disposable acceleration. A saved user preference or qualified skill is a versioned domain artifact with its own lifecycle, even if its reads are cached.

## Proposed decision

[ADR-010](010-app-host-banking-and-model-context.md) adds the later app/SDK banking boundary: a reused interpretation must still request the host flow, never return a cached balance/history to chat. Raw banking fields retained in the customer's visible original message cannot be reintroduced into later inference through cached prompts, summaries or provider continuations. Protected contacts resolve outside inference; a contact/reference or cached intent grants no authority. The cache mechanisms below remain Proposed.

### 1. Reuse verified interpretations before model routing

Add an optional deterministic route before the inference router. A candidate maps a canonical, self-contained request and relevant verified context to a typed intent or action-plan template. The first durable candidate/promotion store may be PostgreSQL; Redis is not required. The stored value is a proposal to run the current domain workflow, never a previous answer, tool result, approval, principal, or completed effect.

The key is derived on the server from the authenticated tenant and membership, caller/channel and conversation state when relevant, the exact normalized request, task class, and revisions of the applicable policy, assistant profile, tool schema, skill, and interpretation contract. Store a scoped keyed fingerprint of the request, not a raw message as an index key; any retained source text follows ADR-005. Only normalization proven to preserve meaning is allowed: amounts, currencies, account references, dates, recipients, negations, and quoted text remain distinct. An arbitrary client-supplied JSON principal or tool name is not trusted key material. Context-dependent turns such as “yes,” “again,” or “the usual one” need an explicit bound reference or use the normal interpretation path. A match for one member cannot serve another member; any wider reuse needs its own qualification and data policy.

Promote only allowlisted task classes after repeated, consistent typed interpretations, independent correctness checks, and source-backed outcomes where an external result is involved. A model result alone, a matching tool name, or an apparent success message is insufficient. Record candidate provenance, source outcome references, revisions, contradictions, corrections, eligibility, and promotion/disable state. The threshold and qualifying scenarios are task-specific acceptance settings, not a universal number chosen by this ADR. Start with read-only or preparatory paths; effect-capable templates require separate qualification of their exact parameters, current checks, and approval flow. A conflicting interpretation, unsupported or mixed request, missing required context, stale revision, correction, or disabled route falls back to clarification or qualified inference before any effect.

On a hit, resolve resources from current trusted server context, validate the typed template and arguments, apply the same authority and tenant data policy as a model proposal, run the current adapter, and render from fresh evidence. For “what is my balance?”, the shortcut may skip interpretation while the bank still supplies the current authorized value. For “my usual order,” it may supply remembered items while availability, total, mandate, approval, and order evidence remain current. A deterministic route must never silently convert a user correction or a different amount into the old action.

### 2. Cache stable reads at their owning boundary

Each cacheable class declares its authoritative source, allowed scope, data classification, key/version, freshness contract, invalidation events, retention, encryption, failure behavior, and whether stale data may be shown. Cache keys and access paths include verified tenant and membership plus caller, agent account, grant, task, site, or session where that data needs them. Deletion, correction, revocation, provider disablement, policy changes, and skill releases invalidate affected entries and derived copies. An unavailable cache reads the owner when permitted; an unavailable required source does not turn an old entry into current authority.

Good candidates are versioned tenant configuration, public assistant profiles, tool manifests, qualified skill bundles, provider capabilities and canary status, and approved knowledge retrieval. Read-only public catalog/search responses and nonfinancial API metadata may use bounded freshness or source validators when the upstream contract permits it. A validated extraction from an unchanged page, document, or API response may be reused under the source content digest, provenance, data scope, parser/model revision, and freshness contract; it remains untrusted source data, not an instruction or authority decision. Personalized offers require member scope. Prices, inventory, booking terms, and availability are re-read before an effect. Current balance, remaining allowance, account/grant status, mandate, revocation, approval, fraud decision, and effect outcome do not derive authority from a cache. Effectful API calls use durable idempotency and reconciliation records, not response caching.

Prompt-prefix or KV caching belongs to the qualified inference provider/runtime and reduces repeated prefill work; it does not skip the model. Shared prefixes contain only data permitted to that scope. Personalized context requires narrower isolation and the provider data policy in ADR-002. Model continuation artifacts remain protected task state. A full personalized model response is not a reusable cache entry.

### 3. Browser working data and instruction skills

Keep a clean pre-login browser snapshot and warm pool as the architecture describes. Browser HTTP caching may reuse site-approved static assets within an isolated session. The current accessibility tree, page fingerprint, and observation diff are task-local working data; selected durable evidence follows ADR-005. An element reference, authenticated page, cookie jar, checkout total, or prior click result is not a cross-task cache. Cookies and profiles remain in the encrypted session vault. On restart, reconstruct from the task record and observe/reconcile the external site again.

The provider registry may retain reviewed routes, page landmarks, selectors, constraints, and canary observations. A fast copy can serve many workers, but a site hint must match a fresh page fingerprint before use. A failed match, changed layout, unclear result, or unknown site hands control to the general browser executor or a clarification. A provider kill switch and egress rule must take effect independently of a stale cached hint.

A skill contains portable instructions, examples and reference material for a task or site. Load its detailed guidance when relevant. It can teach the agent how to use approved Playwright, browser-use or API tools: recognize the current page, choose the next bounded step, verify results and recover from changed layouts. Selectors are hints checked against fresh observations; a recorded click sequence is not an execution contract. No browser framework is selected by naming it here.

Skills declare required capabilities, provenance, version, data scope and qualification evidence. Pin the version for an in-flight task and select available skills from trusted tenant/task configuration. Loading instructions never grants tools, destinations, credentials or authority. Every browser or API operation crosses the same trusted gateway, budget, approval and audit boundaries. A skill may guide preparation; committing an effect requires current authority and source-backed evidence. General browser exploration remains available for qualified destinations without a site-specific skill. Apply the [UX rules](../product/UX.md) to customer interaction and the [service integration contract](../contracts/SERVICE_INTEGRATIONS.md) to provider capabilities and outcomes.

Deterministic operations remain ordinary typed, reviewed tools/adapters under their existing execution contracts. Skill-bundled executable scripts, automatic module imports and an interpreter runtime are deferred; this ADR does not introduce them. The [research](../product/RSI_RESEARCH.md#why-interpreter-execution-is-deferred) records the upstream portability change and the evidence required to reconsider execution. Candidate instruction improvements remain isolated and reviewed before release.

### 4. Adoption and observable behavior

#### Redis for browser-session coordination

Use Redis for shared browser-owner routing, heartbeat/idle-expiry metadata and atomic concurrency/rate counters when multiple browser workers need coordination. Scope keys to verified tenant, membership and provider, with task/client/agent/grant binding where required. Store opaque owner/session references and coordination metadata only. Live Chromium objects remain on the execution host; login cookies, tokens and saved profiles belong in the authority-owned encrypted session vault. Task history, approvals, financial reservations and effect evidence keep their existing authoritative stores. Redis does not replace Temporal, the vault or domain PostgreSQL.

An expiring lease alone cannot stop a paused or partitioned browser. Ownership acquisition must issue a fencing generation that the trusted execution/egress boundary validates before acting; a stale owner loses permission before a replacement can act. Preserve durable operation idempotency and uncertainty reconciliation independently of Redis. A Redis restart, failover or counter reset must not let an older owner become current, duplicate an effect or create new authority. The durable fencing source and its binding to browser/egress execution must be qualified before multi-owner activation; a Redis lock by itself is insufficient.

Lease loss or unavailable coordination stops new actions and sensitive disclosure; it does not select another account, bypass current authority or silently launch a second browser. A replacement reconstructs from durable task state, restores an authorized vault profile and observes/reconciles the provider before continuing. Releasing a lease is separate from provider logout and vault-profile deletion. Define bounded metadata expiry, authenticated transport/access, ownership renewal/release and tenant erasure in the session contract. Retain the explicit single-owner development profile until distributed ownership and failure recovery pass their acceptance checks.

Start with durable interpretation candidates and deterministic read paths, local or source-backed caches for stable configuration, and task-local browser observation reuse. Add a shared cache such as Redis when measured cross-worker latency, invalidation, or coordination needs justify its operating cost. Rate-limit and concurrency counters may use an atomic shared store, but financial reservations, task history, and effect evidence retain their authoritative stores. ADR-003's deferred Redis adoption remains in force.

Record route chosen, cache class and hit/miss, source observation time, version, invalidation reason, inference calls/tokens avoided, latency, cost, fallback, and failed or conflicting fast-path attempts without retaining prohibited content in telemetry. A cache outage must be visible and must not widen permissions or produce a false success.

## Alternatives and consequences

| Alternative | Assessment |
| --- | --- |
| Cache the complete model input and response | Exact hits are rare when dynamic context is included; a saved answer can disclose stale or wrong personal data. Keep a stable, meaning-preserving request key and typed plan template instead. |
| Use semantic similarity to replay tool calls | Similar wording can differ in amount, negation, recipient, or intent. Keep deterministic matching initially; any broader matcher needs separate qualification and an ambiguity fallback. |
| Put every cache and session in Redis from the start | Adds an operational dependency without proving value. Keep durable artifacts in their owners and adopt shared caching for a measured capability. |
| Replay a recorded browser click sequence | Page state, element references, price, and side effects change. Reuse a qualified procedure only after live state recognition and verification. |
| Require a site-specific skill for every site | Prevents general exploration and recovery. Instructions help with familiar sites while the general browser executor covers permitted unfamiliar states. |

This design adds promotion, invalidation, tenant isolation, and skill qualification work. It can remove inference from repetitive supported paths and reduce work elsewhere, but its savings must be measured against incorrect-match and stale-data risk.

## Supporting contracts and verification before implementation

Specify the canonical request projection, eligible task classes, promotion evidence and thresholds, conflict handling, version dependencies, cache entry lifecycles, source freshness contracts, and skill discovery/loading with the existing tool boundary in the affected contracts. Define the exact user correction/deletion path and suppression of rederived personal candidates under ADR-005. Distinguish real tenant data from synthetic development evidence.

Verification should cover equivalent self-contained requests, different amounts/negations, ambiguous and mixed turns, changed preferences or account access, tenant/member/caller isolation, invalidated policy and skill versions, cache/source outages, erasure, stale API reads, changed browser layouts, poisoned page content, restart/replay, concurrent browser sessions, effect idempotency, and current approval/mandate checks. Compare qualified fast paths and skills with the baseline on correctness, forbidden effects, latency, cost, fallback, and recovery under the existing [AI development](../policies/AI_DEVELOPMENT.md), [testing ownership](../policies/TESTING_OWNERSHIP.md), and [readiness](../policies/PRODUCTION_READINESS.md) gates. The [setup guide](../reference/SOURCE_REFERENCES.md#source-8f929a906ccd) describes the scoped development profiles; the ADR itself supplies no runtime or production qualification.
