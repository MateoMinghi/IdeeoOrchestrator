> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# ADR-014: Persistent assistant context and proactive assignments

| Field | Value |
| --- | --- |
| Status | Design direction confirmed; detailed new contracts proposed; runtime adoption remains separate |
| Date | 8 November 2026 |
| Basis | Mateo requested architecture and design-decision updates after reviewing a persistent-assistant conversation. Browser Use implementation is separately scoped in ADR-013. |
| Related | [Data lifecycle](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md), [background tasks](../contracts/BACKGROUND_TASKS.md), [UX](../product/UX.md), [ADR-006](006-tenant-assistant-self-knowledge.md), [ADR-012](012-browser-execution-lifecycle.md) |

## Design direction

Present a continuing assistant while compute remains replaceable. Conversation,
durable assignment, personal memory, user files/artifacts, provider connection
and execution environment are separate objects with separate access and
lifecycle rules. Persist minimum recoverable task evidence outside compute.
Materialize only the authorized task's files and connection state; never mount
all customer data or the credential vault as one workspace disk. Replacing a
browser does not erase memory, and deleting a task does not revoke a connection.
Preserve verified tenant/member/caller/agent/grant scope across these operations.

Personal memory is inspectable, attributable and correctable. Prefer structured
records and deterministic derivation from authorized evidence, distinguishing
stated preferences, inferred candidates, plans and source-confirmed outcomes.
Retain provenance, time/version, purpose, expiry and correction/suppression
behavior. Markdown may be an inspection/export view; it is not a new canonical
store. Search indexes are derived data and must propagate access changes,
corrections and erasure. Retrieved content cannot become instructions, identity
or authority. This direction does not enable general inferred-memory writes.

General proactive assignments extend the existing bounded watch design. Each
assignment declares purpose, permitted sources, trigger/schedule and timezone,
budget, deadline, notification/deduplication rules and permitted effects. Every
wake rechecks current authority. Research/preparation can use a read-only
profile; effects use their exact mandate or protected approval. A preference,
timer or model recommendation cannot mint a new responsibility or renew proof.
Retain A0–A3 behavior; do not impose human approval on every authorized A2/A3
action. Ongoing assignments need an explicit lifecycle and tenant-approved
unattended authorization contract instead of silently extending conversation
retention or credentials. Current product-watch limits remain unchanged.

Activity views show observed actions, sources, current state, meaningful progress
and pending decisions. Protected takeover has one controller at a time, and
handback refreshes observations. Publish minimized action facts rather than raw
model reasoning, protected browser inputs or credentials. App/SDK and tenant
channel adoption remain separately owned under ADR-010/011.

Assistant self-knowledge combines approved product descriptions with a safe
current runtime/capability projection: available tools, permitted connection
status, retained data categories and supported controls. Distinguish documented
behavior, directly observed state and unknown internals. Do not infer another
product's implementation from its assistant's account, promise unimplemented
erasure/export, or expose secret values through introspection. Extend ADR-006
through a separately specified minimized interface; no new endpoint is adopted
by this record.

## Consequences and remaining decisions

Keep the existing independent authority, tenant-owned authentication/banking,
sanitized model context, durable task protocol and disposable-task compute
target. Prefer a qualified API for a capability where available; browser
discovery is an additional execution path under the same authority.

Specify file/artifact ingress and manifests, selective materialization, memory
inspection/correction/export, derived-index erasure, ongoing assignment retention
and renewal, live-view redaction and native consumer behavior before implementing
new stores or enabling them for real tenants. Each store still needs an owner,
approved purpose/retention and deletion path. This is no authorization for an
always-running VM per customer, an unrestricted persistent home directory,
autonomous memory promotion, a new vendor or general proactive effects.

Compliance impact: LR-01/02/03/04/05/12/13; LR-15 for future card handling.
Target ISO/IEC 27001 controls 5.12, 5.15–5.23, 5.34, 8.3, 8.5, 8.10–8.12,
8.15, 8.24, 8.26 and 8.29; ISO/IEC 42001 A.5, A.6.2, A.7–A.10.
Counsel confirmation, independent human acceptance and production approval
remain separate; the product conversation is not security or legal evidence.
