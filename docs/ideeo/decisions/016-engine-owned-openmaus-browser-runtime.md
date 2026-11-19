> **Imported context ? Ideeo-IA-general ? working-tree reference, 2026-11-18.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# ADR-016: Engine-owned OpenMaus browser runtime

| Field | Value |
| --- | --- |
| Status | User-authorized scoped implementation; independent acceptance pending |
| Date | 17 November 2026 |
| Basis | User requested internalizing the OpenMaus browser approach after its observed results outperformed the preceding Browser Use work |
| Related | [ADR-012](012-browser-execution-lifecycle.md), [ADR-013](013-browser-use-preparation.md), [ADR-015](015-openmaus-browser-trial.md), [service integrations](../contracts/SERVICE_INTEGRATIONS.md), [verification](../reference/development/VERIFICATION.md) |

## Decision

Internalize the pinned OpenMausBot open-source runtime used by the scoped browser
trial as a versioned engine-owned source package and harness input. The engine
builds its browser worker from the source checked into this repository; builds
and deployments no longer clone the runtime from a sibling workstation or fetch
its source checkout at runtime. The initial source base is upstream commit
`263d9b79b1164510718994d65dd678f266a61b3e`. Preserve the OpenMaus agent loop and
browser tools while moving task orchestration, provider calls, authority,
budgets, customer controls, durable evidence, and completion assessment under
the engine's existing contracts.

Keep the browser worker as a disposable, engine-owned process for Chromium
isolation and cancellation. The process boundary is an execution detail; its
source, packaging, configuration, version pin, and integration harness belong
to the engine. Keep the existing `browser_use` backend available as a separate
trusted option until comparative verification and independent acceptance
support changing any tenant's configured backend.

Only upstream open-source files are eligible for vendoring. Preserve upstream
Apache-2.0 license/NOTICE material and any applicable third-party licenses and
attributions, including MIT-licensed T3-derived browser code and Apache-licensed
keyboard rules. Exclude `enterprise/`, do not use OpenMausBot/MausBot marks as
engine product branding, and do not claim ownership of upstream authorship.

## Scope and qualification

The first-party runtime remains limited to the existing synthetic public
research profile, public text, the explicitly routed OpenAI adapter, and the
engine's existing deny rules. This decision does not enable real-customer
disclosure, tenant credentials, login, screenshots, uploads, financial effects,
WhatsApp, native banking callers, or a new browser destination. Tenant/backend
selection remains trusted configuration. Existing task budgets, current
authority checks, cancellation, source capture, and engine-side goal assessment
remain mandatory for every model call and browser action.

The vendored source introduces an ongoing upstream update and third-party
license review obligation. Upgrades require an explicit source revision, source
diff and provenance review, artifact hashes, regression/negative-control
coverage, repeated untuned live scenarios, and cost/time comparison. Passing a
developer harness does not establish independent human acceptance, legal
approval, production qualification, or certification. ADR-015 remains the
historical record for the external-source trial and is superseded for future
implementation by this first-party ownership direction.

Affected legal-register entries are LR-01, LR-03, LR-05, LR-12, LR-13, and
LR-17. Relevant ISO/IEC 27001 controls include 5.15-5.18, 5.19-5.23, 5.31,
5.34, 8.10, 8.15-8.16, 8.26, and 8.29. ISO/IEC 42001 impact, data, and
lifecycle evaluation controls apply. Legal interpretations remain pending
counsel confirmation; this development decision accepts no compliance risk.
