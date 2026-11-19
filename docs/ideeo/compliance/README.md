> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Management system documentation

Status: **Draft. Not approved and not certification evidence.** These documents describe one integrated management system for information security (ISO/IEC 27001:2022) and AI (ISO/IEC 42001:2023). Privacy (ISO/IEC 27701:2025) and cloud (ISO/IEC 27017 and 27018) extensions are planned. Engineering rules for applying them live in [COMPLIANCE.md](../policies/COMPLIANCE.md).

## Documents

| Document | Purpose | Standard references | Approver |
| --- | --- | --- | --- |
| [Legal register](LEGAL_REGISTER.md) | Applicable laws, regulations and contracts; open legal questions | 27001 4.2, A.5.31; 42001 4.1 | Legal counsel |
| [Scope and context](SCOPE_AND_CONTEXT.md) | Context, interested parties, scope, boundaries and AI roles | 27001 and 42001 clause 4 | Top management |
| [Management system policy](MANAGEMENT_SYSTEM_POLICY.md) | Information security policy, roles and objectives | 27001 5.2, 5.3, 6.2; A.5.1, A.5.2 | Top management |
| [Management system procedures](MANAGEMENT_SYSTEM_PROCEDURES.md) | Support, documented information, internal audit, management review and corrective action | Clauses 7, 9 and 10 | Top management |
| [Risk methodology](RISK_METHODOLOGY.md) | How information security and AI risks are assessed and treated | 27001 6.1.2, 6.1.3, 8.2, 8.3; 42001 6.1.2, 6.1.3 | Top management |
| [Risk register](RISK_REGISTER.md) | Initial identified risks and proposed treatments | 27001 8.2, 8.3; 42001 8.2, 8.3 | Risk owners |
| [Statement of Applicability](STATEMENT_OF_APPLICABILITY.md) | ISO/IEC 27001 Annex A controls: applicability, status and evidence | 27001 6.1.3 d) | Top management |
| [AI policy](AI_POLICY.md) | Commitments for responsible development and use of the engine's AI | 42001 5.2; A.2 | Top management |
| [AI impact assessment](AI_IMPACT_ASSESSMENT.md) | Impacts of the engine's AI on individuals, groups and society | 42001 6.1.4, 8.4; A.5 | AI management system owner |
| [AI Statement of Applicability](AI_STATEMENT_OF_APPLICABILITY.md) | ISO/IEC 42001 Annex A controls: applicability, status and evidence | 42001 6.1.3 | Top management |
| [Privacy program](PRIVACY_PROGRAM.md) | Processor role, records of processing, data-subject requests, transfers and breach duties | 27701; 27018; LFPDPPP | Privacy lead |
| [Suppliers](SUPPLIERS.md) | Supplier and sub-processor register with data, region and contract status | 27001 A.5.19 to A.5.23; 42001 A.10 | Compliance owner |
| [Security policies](SECURITY_POLICIES.md) | Topic-specific policies: access, cryptography, development, change, vulnerabilities, logging, classification, retention, cloud | 27001 A.5 to A.8; 27017 | Top management |
| [Incident and continuity](INCIDENT_AND_CONTINUITY.md) | Incident and personal-data breach response, tenant notification, continuity, backup and recovery | 27001 A.5.24 to A.5.30, A.8.13, A.8.14 | Top management |

## Conventions

- Every document starts as a draft. A document becomes effective only when its approver records approval in its change history.
- Records such as audit results, management reviews, training and risk acceptances are created by the people who perform them. Never pre-fill or invent them.
- Implementation status uses one of: Implemented (development), Partial, Planned, Not implemented, Not applicable. "Implemented (development)" means code exists and is tested in development only. It is not evidence that a control operates in production.
- Evidence links are repository-relative and point to files that exist. Review these documents when the code they cite changes.
- People are named by role until they are appointed. Credentials and workstation paths never appear here.
