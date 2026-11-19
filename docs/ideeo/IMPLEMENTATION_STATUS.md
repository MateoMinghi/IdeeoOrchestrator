# Candidate implementation status

As of the documentation import on 18 November 2026, the application baseline is OpenMaus `c444029f3dc97a65caab20b4c9a9f398f435c2f2` (package `0.1.170`). This change adds documentation; it implements no product service or integration.

| Area | Existing foundation | Ideeo adaptation / acceptance still required |
| --- | --- | --- |
| Conversation | OpenMaus model/tool iteration, streaming, retries and interruption | Controlled inference, closed tools, sanitized context and awaited durable publication |
| UI | React conversation and task interaction components | Product API, tenant identity, protected handoffs and durable recovery views |
| Browser | Default agent-browser integration, observations, takeover and process management | Caller/task/generation fencing, qualified isolation and egress, encrypted evidence and disposal qualification |
| Identity | OpenMaus local/device/workspace access | Customer, channel, bank-delegation and external-agent profiles; distinct tenant backends |
| Records | OpenMaus files/SQLite application stores | Encrypted product PostgreSQL journal, complete caller binding, forced RLS, retention and outbox |
| Authority | No imported Go service in this checkout | Cohesive versioned authority adoption, role separation, bank mapping and protected approvals |
| Durable work | Upstream coordination and local task concepts | Product lifecycle, Temporal worker, correction/cancellation fences, retained budgets and replay |
| Banking and agent accounts | No qualified Ideeo integration here | Host/link handoffs, mandates, allowance, owner controls and uncertainty reconciliation |
| Administration | Upstream application settings | Adapted tenant console/backend, operator controls, versioned publication and isolated previews |
| Providers / native SDKs | Source documents and compatibility examples | Actual tenant/provider access, SDK/device journeys and independent acceptance |
| Distribution | Upstream package/build machinery | Ideeo branding, enterprise exclusion, pinned artifacts, recovery and release qualification |

The source candidate's tests, source reviews, live model calls and synthetic integration results retain their original scope. They do not establish any row's completed adaptation here. See [architecture](product/architecture/arquitectura-motor-agentes-rev4.html), [adaptation plan](../../output/ideeo-openmaus-product-adaptation-plan-2026-11-18.md) and [verification](development/VERIFICATION.md).
