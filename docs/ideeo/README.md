# IdeeoOrchestrator product documentation

This repository is the OpenMaus-based candidate for Ideeo's shared multi-tenant product. Adopt OpenMaus's conversation, browser and React foundations; adapt trust, disclosure, persistence and execution to the shared product requirements. The separate Ideeo-native candidate is research and compatibility context, not this candidate's runtime.

## Read first

1. [Architecture — revision 5](product/architecture/arquitectura-motor-agentes-rev4.html): the architecture for this candidate, its retained product boundaries, module ownership, journeys and delivery gates. The filename is retained for link compatibility; its content has been rewritten.
2. [Project context](product/PROJECT_CONTEXT.md), [UX](product/UX.md) and [data lifecycle](product/DATA_OWNERSHIP_AND_LIFECYCLE.md): shared product scope and behavior.
3. [Candidate implementation status](IMPLEMENTATION_STATUS.md): what exists here versus what still requires implementation and qualification.
   Read the [tenant session integration](contracts/TENANT_SESSION_INTEGRATION.md) for the inspected PayMe cookie-to-token flow and SDK/WhatsApp client mapping.
   The [admission contract](contracts/ADMISSION.md) describes the implemented isolated entry, synthetic current-status checks and the missing real tenant endpoint.
4. Applicable [contracts](contracts/SHARED_INTERFACE.md), [decision applicability](decisions/APPLICABILITY.md), [compliance policy](policies/COMPLIANCE.md) and [readiness policy](policies/PRODUCTION_READINESS.md).
5. [Adaptation plan](../../output/ideeo-openmaus-product-adaptation-plan-2026-11-18.md) and the repository's [isolated verification guide](../verification/README.md).

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
| `contracts/` | Sixteen behavior/API documents; sixteen JSON schemas, OpenAPI and a synthetic conformance example |
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
