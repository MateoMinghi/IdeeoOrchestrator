# IdeeoOrchestrator product documentation

Isolated booking diagnosis: a fully specified OpenAI request completed one real browser booking on the local fake site, returned its generated confirmation, replayed without another effect and verified it through a new browser read. The model, prompts, eight-second request limit and operation budgets were unchanged. The subsequent product restart timed out, so this is successful booking evidence rather than a clean complete campaign. See [the conversation](../../output/ideeo-booking-diagnosis-2026-11-19T23-14-53-967Z.html) and [causal findings](development/VERIFICATION.md#isolating-booking-from-conversation-and-restart-failures--19-november-2026).

Failure investigation: a diagnostic Luna campaign confirmed the eight-second model cutoff and misleading storage error classification. The classification is fixed locally; timeout tuning and reliable booking remain open. Seven turns timed out, and a separate connection reset interrupted the post-restart request. See [diagnosis and regression evidence](development/VERIFICATION.md#conversation-failure-investigation--19-november-2026).

Latest OpenAI retry: Luna performed real browser actions on the fake site but did not book. Six turns failed and two answers were saved; see [the retained conversation and evidence](development/VERIFICATION.md#openai-browser-retry--19-november-2026). The same runtime and controls were used without code changes.

Real-model browser test: [six retained Gemini conversations](../../output/ideeo-gemini-browser-conversations.html) now exercise the authenticated workspace path. Gemini independently opened/read the fake site, but no campaign completed booking. Empty provider completions and task-selection failures remain open; see the [dated evidence](development/VERIFICATION.md#live-browser-conversation--19-november-2026).

Workspace continuation: the user selected isolated production VMs and disposable local workspaces for testing. The [capability boundary](contracts/WORKSPACE_CAPABILITIES.md) connects scoped tool execution to the existing authenticated loop, with local native browser/file evidence. Full OpenMaus capability parity and production VM isolation remain incomplete.

Gemini continuation: an explicitly authorized synthetic-only `gemini-evaluation` profile now uses Gemini 2.5 Flash-Lite through the shared loop. The realistic workshop conversation produced useful writing/calculation and restart-recall evidence, but the live tool-answer path remains unqualified after empty provider replies, and answer-quality limitations are recorded. See [Gemini verification](development/VERIFICATION.md#gemini-flash-lite-realistic-conversation--19-november-2026). No real-data permission, deployment or acceptance is implied.

Latest continuation: [conversation hardening and live browser evidence](development/VERIFICATION.md#conversation-hardening-and-live-browser--19-november-2026), with separate [acceptance and staging gates](development/CONVERSATION_ACCEPTANCE.md). This local increment adds a provider-role fix, expanded isolated regressions, clean dependency verification, and bounded live React/Luna evidence. Independent review, human acceptance and remote CI remain open.

This repository is the OpenMaus-based candidate for Ideeo's shared multi-tenant product. Adopt OpenMaus's conversation, browser and React foundations; adapt trust, disclosure, persistence and execution to the shared product requirements. The separate Ideeo-native candidate is research and compatibility context, not this candidate's runtime.

## Read first

1. [Architecture — revision 5](product/architecture/arquitectura-motor-agentes-rev4.html): the architecture for this candidate, its retained product boundaries, module ownership, journeys and delivery gates. The filename is retained for link compatibility; its content has been rewritten.
2. [Project context](product/PROJECT_CONTEXT.md), [UX](product/UX.md) and [data lifecycle](product/DATA_OWNERSHIP_AND_LIFECYCLE.md): shared product scope and behavior.
3. [Candidate implementation status](IMPLEMENTATION_STATUS.md): what exists here versus what still requires implementation and qualification.
   Read the [tenant session integration](contracts/TENANT_SESSION_INTEGRATION.md) for the inspected PayMe cookie-to-token flow and SDK/WhatsApp client mapping.
   The [admission contract](contracts/ADMISSION.md) describes the isolated entry, actual PayMe tenant endpoint and synthetic integration, including unsupported backend evidence and remaining qualification.
   The [conversation storage contract](contracts/CONVERSATION_STORAGE.md) defines encrypted records, explicit conversation permissions, transaction/replay behavior and development-only limits.
   The [controlled loop contract](contracts/CONVERSATION_LOOP.md) defines shared OpenMaus execution, current model/tool permission, durable attempt budgets and synthetic-only limits.
   The [React consumer contract](contracts/CONVERSATION_UI.md) defines the authenticated product entry, tenant token callback, committed history and reload/retry behavior.
4. Applicable [contracts](contracts/SHARED_INTERFACE.md), [decision applicability](decisions/APPLICABILITY.md), [compliance policy](policies/COMPLIANCE.md) and [readiness policy](policies/PRODUCTION_READINESS.md).
5. [Adaptation plan](../../output/ideeo-openmaus-product-adaptation-plan-2026-11-18.md) and the repository's [isolated verification guide](../verification/README.md).

For implementation pickup, start with [the free-form/React status](IMPLEMENTATION_STATUS.md#free-form-controls-and-react-consumer-local-implementation). The increment is based on product `7cff7a6` and uses PayMe `e55abc7` without changing it; the user requested its delivery to `dev` in the containing commit. Free-form synthetic text, current disclosure authority, encrypted projections and a React product entry have isolated scripted-provider/API/browser evidence. A subsequent [authorized free-form Luna campaign](development/VERIFICATION.md#authorized-free-form-luna-evaluation--19-november-2026) passed 38 integration checks and five semantic criteria using ten calls (estimated $0.00043); the earlier constrained campaign retains its original scope. General customer-data handling, broader semantic robustness, independent review, human acceptance and production operations remain open. Publication to `dev` is not deployment or acceptance.

## How to interpret the imported documents

The source is **Ideeo-IA-general**, committed local `dev` at `644f0a1b7a44901dbaaaa18b376dac0180219860`, inspected on 18 November 2026. ADR-016 and three research reports came from explicitly identified working-tree files. No remote freshness is claimed. [SOURCE_MANIFEST.json](SOURCE_MANIFEST.json) records each original path, revision or working-tree status, source hash and imported destination.

| Material | Standing in this candidate |
| --- | --- |
| Confirmed product scope, tenant ownership, protected host banking, authority and privacy boundaries | Requirements to preserve |
| Proposed ADRs, service extensions and unapproved management-system documents | Proposals with their original approval status; import does not approve them |
| Python/FastAPI/LangGraph classes, internal schemas and setup commands | Source implementation references; preserve externally required behavior, not unnecessary internal structure |
| Source verification reports, control implementation claims and integration status | Evidence only for the named source revision, configuration, tenant and environment |
| OpenMaus-derived loop/browser/UI source in this repository | Existing foundation; not a qualified multi-tenant financial product |
| The rewritten architecture and adaptation plan | This candidate's implementation proposal under the confirmed direct-adoption direction |

Source-specific expressions such as “implemented,” “this repository,” “current runtime,” and scoped implementation authorizations in imported documents refer to **Ideeo-IA-general**, unless a candidate-specific section says otherwise. Use the status page before describing capabilities. The source candidate's native-runtime removal instructions do not apply here. An internal Python class or proposed stack is not a product requirement.

The architecture preserves the substantive product model and replaces the other candidate's execution and deployment design. It does not declare a new approval of every technical detail. Conflict resolution follows the user's current decisions, confirmed product boundaries and accepted applicable decisions; proposed choices and historical implementation descriptions cannot override them.

## Document map

| Directory | Contents |
| --- | --- |
| `product/` | Scope, experience, privacy, integration context, skill research and architecture |
| `contracts/` | Candidate session, admission, storage and controlled-loop contracts; sixteen imported behavior/API documents, sixteen JSON schemas, OpenAPI and a synthetic conformance example |
| `decisions/` | Original decisions with [candidate applicability](decisions/APPLICABILITY.md) |
| `compliance/` | Fifteen connected legal, security, AI, privacy, risk, supplier and continuity records; draft statuses retained |
| `policies/`, `workflows/` | Delivery and review rules, with source-specific operating details qualified for this checkout |
| `development/` | Candidate consumer conformance and verification status |
| `reference/development/` | Source candidate's verification index, integration guide and WhatsBank migration inventory |
| `reference/research/` | Repository comparison and both earlier runtime recommendations |
| `reference/config/` | Nine unchanged synthetic/reference configuration examples; no runtime activation |
| `reference/architecture/` | Previous architecture retained as historical reference |

## Local context and external evidence

The product documents, diagrams, schemas and research reports are local. Source code not adopted here, private runtime artifacts, external experiment logs, planning records and omitted setup instructions are represented in [source references](reference/SOURCE_REFERENCES.md). Those entries identify unavailable supporting material; they are not substitute evidence. Raw logs, private keys, access tokens and customer records were not copied. HTTP links to providers, standards, meetings and Linear remain external references.

No copied report is an acceptance result for this candidate. The [candidate verification record](development/VERIFICATION.md) starts separately. Do not infer native-device adoption from HTTP conformance or production readiness from synthetic fixtures.

## Repository operating rules

The root [AGENTS.md](../../AGENTS.md), [DESIGN.md](../../DESIGN.md) and [verification instructions](../verification/README.md) govern this checkout. Their paths are relative to the repository root, not the imported source. Use current package scripts and isolated fixtures. Do not run source Python commands or reuse source ports, databases, queues, deployments or credentials as this repository's operating profile.

This import does not configure a `dev` branch, make this checkout's `main` a production environment, install Git synchronization aliases, appoint reviewers or publish Linear changes. Preserve independent review, different-human functional acceptance and human-controlled production promotion. Source Linear IDs are traceability, not new assignments or a replicated backlog.

Update candidate documents when behavior changes. Preserve original source hashes and attributable historical findings. Refresh source imports deliberately at an identified revision, checking changes against this candidate's architecture and contracts rather than overwriting them wholesale.
