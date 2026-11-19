> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# AI Statement of Applicability

Status: **Draft. Pending approval by Top management. Not certification evidence.**

Standard references: ISO/IEC 42001:2023 clause 6.1.3 and Annex A (controls A.2 to A.10 listed below). Status vocabulary: Implemented (development) | Partial | Planned | Not implemented | Not applicable. "Implemented (development)" means code exists and is tested in development only.

Evidence links point to repository files. Gap identifiers (G1 to G15) are defined in the [risk register](RISK_REGISTER.md). No control is claimed to operate in production.

Organization context: the engine is an AI producer and AI provider; the tenant bank is the AI customer; upstream model providers are suppliers (see [AI policy](AI_POLICY.md) and [AI impact assessment](AI_IMPACT_ASSESSMENT.md)).

## A.2 Policies related to AI

| Control | Applicable | Justification | Status | Evidence or planned action |
| --- | --- | --- | --- | --- |
| A.2.2 AI policy | Yes | Engine AI needs a top-management policy. | Partial | [AI_POLICY.md](AI_POLICY.md) drafted; approval pending. |
| A.2.3 Alignment with other organizational policies | Yes | AI rules must match security, privacy and compliance policies. | Partial | [AI_POLICY.md](AI_POLICY.md) section 3 links the policy set; all are drafts pending approval. |
| A.2.4 Review of the AI policy | Yes | Policy must be reviewed when the AI changes. | Planned | Annual and on-change review defined in [AI_POLICY.md](AI_POLICY.md); no review performed. |

## A.3 Internal organization

| Control | Applicable | Justification | Status | Evidence or planned action |
| --- | --- | --- | --- | --- |
| A.3.2 AI roles and responsibilities | Yes | AI roles must be assigned and recorded. | Partial | Roles in [AI_POLICY.md](AI_POLICY.md) and [COMPLIANCE.md](../policies/COMPLIANCE.md) section 2; people to be appointed. |
| A.3.3 Reporting of concerns | Yes | Staff and users need a route to raise AI concerns. | Planned | Channel defined in [AI_POLICY.md](AI_POLICY.md) section 5; not yet operational. |

## A.4 Resources for AI systems

| Control | Applicable | Justification | Status | Evidence or planned action |
| --- | --- | --- | --- | --- |
| A.4.2 Resource documentation | Yes | Resources used by the AI system must be documented. | Partial | Design records in [docs/decisions](../decisions/README.md) and [contracts](../reference/SOURCE_REFERENCES.md#source-d0d89b91fb30); no resource register. |
| A.4.3 Data resources | Yes | Data used for prompts, evals and inference must be controlled. | Partial | Data policy in [data_policy.py](../reference/SOURCE_REFERENCES.md#source-c79ca76f1746); retention defaults in [settings.py](../reference/SOURCE_REFERENCES.md#source-df0681319dea); gaps G5 and G6 open. |
| A.4.4 Tooling resources | Yes | Development and eval tools must be identified and controlled. | Partial | CI in [engine.yml](../reference/SOURCE_REFERENCES.md#source-c416479486f9); no dependency scanning or SBOM (G8). |
| A.4.5 System and computing resources | Yes | Production compute and cloud resources must be specified. | Planned | Production on tenant AWS is planned; only development setup exists ([ENGINE_SETUP.md](../reference/SOURCE_REFERENCES.md#source-8f929a906ccd)). |
| A.4.6 Human resources | Yes | Competence and training for AI roles must be evidenced. | Not implemented | No training, access review or personnel evidence in repository (G14). |

## A.5 Assessing AI system impact

| Control | Applicable | Justification | Status | Evidence or planned action |
| --- | --- | --- | --- | --- |
| A.5.2 AI system impact assessment process | Yes | A repeatable process is needed for AI change. | Partial | Review triggers in [AI_IMPACT_ASSESSMENT.md](AI_IMPACT_ASSESSMENT.md); method in [RISK_METHODOLOGY.md](RISK_METHODOLOGY.md); both drafts pending approval. |
| A.5.3 Documentation of AI system impact assessments | Yes | Impact results must be recorded and approved. | Partial | [AI_IMPACT_ASSESSMENT.md](AI_IMPACT_ASSESSMENT.md) drafted; owner review pending. |
| A.5.4 Assessing AI system impact on individuals or groups | Yes | Customers and recipients are affected by financial operations. | Partial | Impact table in [AI_IMPACT_ASSESSMENT.md](AI_IMPACT_ASSESSMENT.md) section 6; mitigations are development-only. |
| A.5.5 Assessing societal impacts of AI systems | Yes | Financial inclusion and language access are relevant to a bank assistant. | Partial | Societal parties and impacts in [AI_IMPACT_ASSESSMENT.md](AI_IMPACT_ASSESSMENT.md); no accessibility or fairness assessment yet. |

## A.6 AI system life cycle

| Control | Applicable | Justification | Status | Evidence or planned action |
| --- | --- | --- | --- | --- |
| A.6.1.2 Objectives for responsible development of AI system | Yes | Responsible-development objectives must be stated. | Partial | Commitments in [AI_POLICY.md](AI_POLICY.md) section 1; no measurable objectives yet. |
| A.6.1.3 Processes for responsible AI system design and development | Yes | Design must follow defined development and review processes. | Partial | [AI_DEVELOPMENT.md](../policies/AI_DEVELOPMENT.md) and [METHODOLOGY.md](../policies/METHODOLOGY.md); policy approval pending. |
| A.6.2.2 AI system requirements and specification | Yes | Behaviour and authority limits must be specified. | Partial | [CAPABILITIES.md](../contracts/CAPABILITIES.md), [PROVIDER_PROFILE.md](../contracts/PROVIDER_PROFILE.md); several design questions open. |
| A.6.2.3 Documentation of AI system design and development | Yes | Design decisions must be recorded. | Partial | [docs/decisions](../decisions/README.md); most ADRs are Proposed with scoped authorizations; statuses are tracked in the ADR index. |
| A.6.2.4 AI system verification and validation | Yes | Model and system behaviour must be verified before release. | Implemented (development) | Development test and eval reports in [evals/reports](../reference/SOURCE_REFERENCES.md#source-ba251de2dfe1), with synthetic provenance; live qualification open. |
| A.6.2.5 AI system deployment | Yes | Deployment needs human approval and a release record. | Planned | Human-approved release required ([PRODUCTION_READINESS.md](../policies/PRODUCTION_READINESS.md)); no production deployment. |
| A.6.2.6 AI system operation and monitoring | Yes | Operating AI must be monitored for failures and misuse. | Planned | Observability planned in [ADR-003](../decisions/003-engine-implementation-stack.md); not implemented. |
| A.6.2.7 AI system technical documentation | Yes | Technical documentation must describe the system. | Partial | Contracts and schemas in [docs/contracts](../reference/SOURCE_REFERENCES.md#source-d0d89b91fb30); [openapi.json](../contracts/openapi.json) exported. |
| A.6.2.8 AI system recording of event logs | Yes | AI actions and approvals need attributable logs. | Partial | Inference evidence in [evidence.py](../reference/SOURCE_REFERENCES.md#source-46a7e7fc071d); append-only authority history ([007_mandate_history.sql](../reference/SOURCE_REFERENCES.md#source-c75629db42ef)); reads and denials not logged (G7). |

## A.7 Data for AI systems

| Control | Applicable | Justification | Status | Evidence or planned action |
| --- | --- | --- | --- | --- |
| A.7.2 Data for development and enhancement of AI system | Yes | Eval and development data must be controlled. | Implemented (development) | Synthetic-only data rule in [COMPLIANCE.md](../policies/COMPLIANCE.md) rule 13 and [AI_DEVELOPMENT.md](../policies/AI_DEVELOPMENT.md). The engine does not train models. |
| A.7.3 Acquisition of data | Yes | Tenant and supplier data sources must be agreed. | Partial | Connector profiles in [TENANT_BACKENDS.md](../contracts/TENANT_BACKENDS.md); no tenant data agreements (G10). |
| A.7.4 Quality of data for AI systems | Yes | Eval datasets must be reviewed for quality. | Partial | Dataset review rules in [AI_DEVELOPMENT.md](../policies/AI_DEVELOPMENT.md); no production data quality process. |
| A.7.5 Data provenance | Yes | Data sources must be traceable. | Partial | Eval reports record provenance such as `bank_provenance: synthetic` ([assistant-backends-verification.json](../reference/SOURCE_REFERENCES.md#source-3d297ff03eba)). |
| A.7.6 Data preparation | Yes | Data given to models must be prepared and minimized. | Partial | Request-local aliases in [data_policy.py](../reference/SOURCE_REFERENCES.md#source-c79ca76f1746); keyword-only sensitive-input screen in [service.py](../reference/SOURCE_REFERENCES.md#source-961ce220c26a) (G4). |

## A.8 Information for interested parties

| Control | Applicable | Justification | Status | Evidence or planned action |
| --- | --- | --- | --- | --- |
| A.8.2 System documentation and information for users | Yes | Users must know they interact with AI and how it acts. | Planned | AI disclosure committed in [AI_POLICY.md](AI_POLICY.md); no disclosure found in code. |
| A.8.3 External reporting | Yes | Tenant regulators may require AI-related reporting. | Planned | Tenant reporting duties in [LEGAL_REGISTER.md](LEGAL_REGISTER.md) LR-05; tenant-first notification drafted in [INCIDENT_AND_CONTINUITY.md](INCIDENT_AND_CONTINUITY.md), approval pending. |
| A.8.4 Communication of incidents | Yes | AI incidents must be communicated to the tenant. | Planned | AI incidents defined and procedure drafted in [INCIDENT_AND_CONTINUITY.md](INCIDENT_AND_CONTINUITY.md); not approved or exercised; tenant notice times not agreed (G9). |
| A.8.5 Information for interested parties | Yes | Interested parties need access to the AI policy and limits. | Planned | Publication of [AI_POLICY.md](AI_POLICY.md) to tenants not yet arranged. |

## A.9 Use of AI systems

| Control | Applicable | Justification | Status | Evidence or planned action |
| --- | --- | --- | --- | --- |
| A.9.2 Processes for responsible use of AI systems | Yes | Use must follow the autonomy and approval rules. | Partial | Autonomy levels A0 to A3 and approvals in [CAPABILITIES.md](../contracts/CAPABILITIES.md) and [policy.go](../reference/SOURCE_REFERENCES.md#source-ad8846edd7f3). |
| A.9.3 Objectives for responsible use of AI system | Yes | Use objectives must match the policy. | Partial | Commitments in [AI_POLICY.md](AI_POLICY.md) section 1; no use metrics yet. |
| A.9.4 Intended use of the AI system | Yes | Intended and excluded uses must be documented. | Partial | Intended use and misuse in [AI_IMPACT_ASSESSMENT.md](AI_IMPACT_ASSESSMENT.md) sections 2 and 4. |

## A.10 Third-party and customer relationships

| Control | Applicable | Justification | Status | Evidence or planned action |
| --- | --- | --- | --- | --- |
| A.10.2 Allocating responsibilities | Yes | Responsibilities across the tenant, engine and providers must be allocated. | Partial | Roles in [COMPLIANCE.md](../policies/COMPLIANCE.md) section 2; contracts pending. |
| A.10.3 Suppliers | Yes | Model providers and hosting are suppliers of AI components. | Partial | Supplier rules in [COMPLIANCE.md](../policies/COMPLIANCE.md) rule 4; register drafted in [SUPPLIERS.md](SUPPLIERS.md); no DPAs (G3, G10). |
| A.10.4 Customers | Yes | Tenant banks are AI customers with specific obligations. | Planned | Tenant obligations to be set in contracts; processor terms not yet agreed. |

## Change history

| Version | Date | Change |
| --- | --- | --- |
| Draft | 2026-10-23 | Initial draft prepared with AI assistance from repository evidence; pending human review |
