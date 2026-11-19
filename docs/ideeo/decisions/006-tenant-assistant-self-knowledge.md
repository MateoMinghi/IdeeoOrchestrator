> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# ADR-006: Tenant assistant identity and current capability awareness

| Field | Value |
| --- | --- |
| Status | Proposed; scoped development implementation authorized |
| Date | 22 October 2026 |
| Authorization | Mateo requested implementation of the discussed tenant-customizable identity, current capability knowledge and conversational path, with a PayMe example usable through the local UI. This does not approve production, merge, or independent acceptance. |
| Related | [Coordinator contract](../contracts/AGENT_COORDINATION.md), [assistant profiles](../contracts/ASSISTANT_PROFILES.md), [ADR-002](002-ai-provider-adapters-and-routing.md), [ADR-005](005-data-ownership-and-lifecycle.md) |

## Problem

The v2 engine captured every utterance as a typed task. Its context had accounts,
capability IDs and data policy, but no tenant assistant identity. Basic questions
about its name, tenant, tools and limits therefore became unsupported operations.
The architecture's tenant persona requirement was not wired into that path.

## Scoped decision

Load versioned, validated public assistant profiles from trusted server
configuration keyed by the already-verified tenant. Names, organization, role,
purpose, language, tone, support guidance and business boundaries are data.
Do not select identity from chat text or use another tenant's profile as fallback.
The file-backed source is replaceable independently of the conversation contract;
this does not choose a production administration or persistence service.

Keep public tool metadata and capability/action bindings in one engine registry.
Derive current availability from actual handler registration, trusted tenant
enablement, current caller/grant scope and configured client restrictions. Include
explicit temporary-unavailability state and protected-authorization prerequisites.
Descriptions never grant permission or certify a particular transaction.

Extend typed capture with bounded conversational intent, including mixed
conversation/task turns. The provider selects topics and registered tool IDs;
the concierge renders identity and capability facts from the engine snapshot.
Provider-authored conversational prose, names, approvals and tool definitions are
not accepted. This foundation covers self knowledge, help and greetings; unrelated
general chat remains outside this increment.

The later scoped development conversation path also accepts validated `reply`
prose, grounded in the current snapshot, for ordinary greetings, explanations and
self questions. Mateo authorized the presentation/continuity refinement on
17 November 2026. The typed intent renderer remains available for formal
inventories and mixed turns; financial/source results and execution authority
retain their existing boundaries. See the current [reply and retention
contract](../contracts/ASSISTANT_PROFILES.md#conversation-and-http-contract).
This refinement does not change this ADR's proposed status or grant production
or independent acceptance.

Continue deterministic financial rendering from source evidence and the existing
authority/execution boundaries. Task workers receive their own role and a
restricted public context projection, never the concierge's full tool manifest.
Current model disclosure policy applies before either projection.

Bind saved self descriptions to a digest and complete public snapshot of the
current profile/access. Stale replays fail explicitly rather than advertising old
permissions or rerendering historical observations. Preserve pending task fields
when the user asks a conversational side question.

## Alternatives

- A tenant-specific prompt containing a manual tool list drifts from execution
  and permissions, and cannot repair the task-only reply schema.
- A hardcoded FAQ or keyword router does not cover natural paraphrases or mixed
  requests and puts tenant names into shared code.
- Unconstrained generated self descriptions permit invented tools or completion
  claims. Grounded typed intent keeps the initial contract auditable.
- UI-only identity text does not fix the assistant or other channels.

## Consequences and gates

The public v2 API gains an opt-in `conversation` result and authenticated assistant
description endpoint. Consumers must accept the additive variant before profiles
are activated for them; unknown variants never trigger actions. Existing tenants
without profiles retain their prior task behavior.

Tests/evals must cover multiple tenants, missing profiles, client restrictions,
current grants, profile reload, stale replay/SSE, mixed turns, pending continuity,
injection, language, synthetic provenance and absence of financial effects.
Google's structured-output schema complexity requires a compact generation
projection; strict local cardinality and enum validation remain authoritative.
The exact observed failure and correction belong in the verification evidence.

The PayMe example is synthetic development configuration. Production profile
governance, additional language renderers, consumer adoption and independent
acceptance remain separate gates. Full shared-engine scope is unchanged.
