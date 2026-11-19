> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# ADR-005: Purpose-bound data ownership and lifecycle

| Field | Value |
| --- | --- |
| Status | Proposed |
| Date | 21 October 2026 |
| Requested by | Mateo |
| Scoped implementation authorization | Mateo requested docs plus runtime enforcement, integrated locally into the latest `dev`. This authorizes the controlled development boundaries below; full-record acceptance, production policy and real tenant/provider qualification remain pending. |
| Related | [ADR-001](001-tenant-authentication-and-delegation.md), [ADR-002](002-ai-provider-adapters-and-routing.md), [ADR-003](003-engine-implementation-stack.md), [ADR-004](004-voice-channel-and-speech-providers.md) |

## Context

The [legacy source and meeting evidence](../product/INTEGRATION_CONTEXT.md#data-ownership-review-21-october-2026) support tenant-owned KYC, minimized identity bindings, database isolation and recall derived from operational evidence. They do not show a database containing only user/phone mapping, a universal customer-profile API, or permission to copy the bank ledger. Durable tasks, general assistance and full agent accounts still need controlled engine-owned state.

## Decision

[ADR-010](010-app-host-banking-and-model-context.md) adds the 2 November distinction between customer-visible original messages and subsequent model context: retaining an authorized visible transcript does not permit resending sensitive captured fields. Bank balance/history for interactive app/SDK use stay in the host's single protected display. Protected contacts resolve outside inference. That product direction does not approve a new store's lifecycle, vendor retention or real-data disclosure, and is not yet fully implemented by the current pending-context path.

Use the canonical [data ownership and lifecycle contract](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md) for all engine data. Keep tenant identity/KYC and the bank ledger authoritative externally. Retain minimum purpose-bound task/authority evidence and attributed memory. Resolve task-specific protected fields through optional tenant services outside models, using expiring scoped references that do not grant access. Separate conversation, task, memory, telemetry and replay/audit lifecycles.

Enforce data minimization in addition to ADR-001 authority checks. Model disclosure needs its own tenant policy, including every router/provider path. Store customer-bearing payloads with authenticated encryption bound to tenant, membership, resource, field and format version. Keep keys behind an engine-owned resolver port; local file keys are development-only. Preserve RLS and least privilege for runtime and cleanup.

Expire access and actively erase content. Keep only separately justified replay/reconciliation markers; removing a transcript must not silently enable repeating a financial effect. Derive habits from authoritative completed evidence, treat pending as intention, invalidate reversals and suppress rederivation after deletion. Fetch current banking facts from the bank.

## Alternatives and consequences

- A user/phone-only database cannot support durable recovery, delegated authority or attributed preferences. Accurate minimization specifies each retained category instead.
- Copying complete bank profiles or maintaining a financial mirror increases disclosure/staleness risk and confuses ownership. Optional field/purpose adapters support task needs across different tenant cores.
- A permanent transcript or canonical Markdown notes store duplicates sensitive history and obscures correction/expiry. Controlled records can expose an inspectable notes view later.
- Expiry-only reads leave physical content indefinitely. Scheduled erasure and separate replay windows add operational work but make the lifecycle measurable.
- Model route approval is separate from bank authorization. Safe provider fallback must satisfy both, and unavailable policies fail closed.

## Implementation and unresolved decisions

The [contract's implementation boundary](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md#current-enforcement-and-adoption-gates), [setup guide](../reference/SOURCE_REFERENCES.md#source-8f929a906ccd) and [verification index](../reference/development/VERIFICATION.md) identify actual runtime controls and checks. This decision does not select production retention periods, accept vendor regions/terms, approve a KMS deployment or create a bank-backed subledger. Full authority, operation reconciliation, memory suppression and every future storage adapter must meet the same contract before enablement.
