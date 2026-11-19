> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Architecture decision records

Read [project context](../product/PROJECT_CONTEXT.md) first. These records describe consequential engine design choices, alternatives, and consequences. They supplement the architecture proposal and the approved functional requirements.

| Record | Decision | Status |
| --- | --- | --- |
| [ADR-001](001-tenant-authentication-and-delegation.md) | Tenant-owned authentication, verified engine principals, and delegated agent-account access | Proposed |
| [ADR-002](002-ai-provider-adapters-and-routing.md) | Task-facing AI interfaces, provider adapters, and capability-aware routing | Proposed |
| [ADR-003](003-engine-implementation-stack.md) | Engine implementation stack, shared integration boundaries, and staged runtime adoption | Proposed |
| [ADR-004](004-voice-channel-and-speech-providers.md) | Streaming STT → existing concierge → streaming TTS; engine-owned speech ports; ElevenLabs remains a candidate | Streaming direction accepted (15 November 2026); remaining design details proposed |
| [ADR-005](005-data-ownership-and-lifecycle.md) | Tenant-owned identity/ledger, purpose-bound engine state, model disclosure, protected data access and active erasure | Proposed; scoped development implementation authorized |
| [ADR-006](006-tenant-assistant-self-knowledge.md) | Tenant-customizable assistant identity, current capability awareness and grounded conversational replies | Proposed; scoped development implementation authorized |
| [ADR-007](007-inference-reuse-and-cache-boundaries.md) | Verified interpretation reuse, scoped data/browser caches and portable instruction skills; executable bundles and interpreters deferred | Proposed |
| [ADR-008](008-partition-consistency-and-availability.md) | Per-operation consistency and availability policy during network partitions | Accepted |
| [ADR-009](009-tenant-administration-console.md) | Next.js administration, operator/tenant roles, versioned profiles and connector onboarding | Scoped development implementation authorized |
| [ADR-010](010-app-host-banking-and-model-context.md) | App-host banking, single-display balance/history and separate customer-visible transcript/model context | Confirmed product boundary; scoped engine development implementation authorized |
| [ADR-011](011-tenant-api-and-channel-ownership.md) | Tenant API owns enrollment and WhatsApp ingress; shared engine serves tenant SDKs and APIs | Confirmed product boundary; scoped development implementation authorized |
| [ADR-012](012-browser-execution-lifecycle.md) | Generation-bound browser ownership, bounded recovery and replaceable task environments before VM adoption | Scoped development implementation authorized; production acceptance pending |
| [ADR-013](013-browser-use-preparation.md) | Upstream Browser Use Agent/browser tools as an isolated library worker; engine-owned task, inference budget and authority | Scoped development implementation authorized; independent acceptance pending |
| [ADR-014](014-persistent-assistant-context.md) | Separate assistant state lifecycles, inspectable memory, proactive assignments, activity and grounded self-knowledge | Design direction confirmed; detailed new contracts proposed |
| [ADR-015](015-openmaus-browser-trial.md) | Bounded native OpenMausBot worker evaluation through engine authority and source verification | Scoped development trial authorized; adoption pending |
| [ADR-017](017-native-conversation-runtime.md) | Ideeo-owned native conversation/execution; direct agent-browser target without OpenMaus runtime adoption | Direction confirmed; incremental development authorized; acceptance pending |

Each record identifies its date, confirmed product requirements, and acceptance status. Requesting a draft does not mark its complete proposed design Accepted. Approval is recorded against the reviewed revision under [METHODOLOGY.md](../policies/METHODOLOGY.md#8-planning-and-architectural-decisions).

Proposed records are review material. Accepted records constrain implementation; superseding records preserve earlier decisions and explain the change. Exact service APIs, model profiles, tenant contracts, and implementation setup can live in linked specifications without making every configuration value an architectural decision. Unresolved dependencies remain visible before the affected implementation starts.

These are the first ADRs in this new engine repository. Numbers in the separate legacy repository refer to that repository's decisions and are not imported here.
