> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Management system policy

Status: **Draft. Pending approval by Top management. Not certification evidence.**

Standard references: ISO/IEC 27001:2022 clauses 5.1 to 5.3 and 6.2, Annex A controls 5.1, 5.2 and 5.4; ISO/IEC 42001:2023 clause 5.

## 1. Policy statement

[Organization legal name] develops and provides a shared, multi-tenant AI engine for regulated banks. Our commitment is to protect the information of tenant banks and their customers, to keep AI behaviour within authorized limits, and to make every consequential action attributable and auditable.

Top management commits to:

1. Satisfy the applicable requirements: laws and regulations listed in the [Legal register](LEGAL_REGISTER.md), tenant contractual obligations, and the requirements of ISO/IEC 27001:2022 and ISO/IEC 42001:2023.
2. Provide the resources, roles and authority for this management system (section 3).
3. Continually improve the management system, using the monitoring, audit, management review and corrective action in [Management system procedures](MANAGEMENT_SYSTEM_PROCEDURES.md).
4. Keep this policy consistent with the scope in [Scope and context](SCOPE_AND_CONTEXT.md).

## 2. Engine principles

These principles apply to every change. They are the operational form of [COMPLIANCE.md](../policies/COMPLIANCE.md) section 3.

| Principle | Commitment |
| --- | --- |
| Authority outside the model | Consequential actions, approvals and limits are enforced by deterministic authority checks, never by model output. A model never grants itself permissions. |
| Default-deny model disclosure | No real tenant data reaches a model or vendor until the register records coverage, sub-processor authorization, data terms and privacy-notice coverage for that tenant and provider. |
| Tenant isolation | Tenant data, credentials and configuration are separated. Cross-tenant access is prevented by design and tested. |
| Human-controlled production | Production promotion needs human approval of the exact artifact, configuration and recovery evidence. |
| No secrets to models | PINs, one-time codes, passwords, full card numbers, CVVs and credentials never enter model input, prompts, telemetry, reports or fixtures. |
| Synthetic test data | Fixtures, evaluations and reports use labelled synthetic data only. Real customer data never enters the repository. |
| Honest status | No control, certification or legal compliance is claimed beyond recorded evidence. Development status is not production status. |

Detailed controls and their status are in the [Statement of Applicability](STATEMENT_OF_APPLICABILITY.md) and [AI Statement of Applicability](AI_STATEMENT_OF_APPLICABILITY.md).

## 3. Roles, responsibilities and authorities

| Role | Responsibilities | Authority |
| --- | --- | --- |
| Top management | Approves this policy, the scope, the risk methodology, the Statement of Applicability, the AI policy, and management review outputs. Allocates resources. | Approves management system documents. Accepts residual risk above the threshold in the risk methodology. |
| Management system owner (to be appointed) | Maintains the management system, schedules monitoring, internal audits and management reviews, tracks objectives and corrective actions. | Proposes changes to documents. Cannot approve its own audit results. |
| Engineering lead | Owns architecture, technical controls, release readiness and the technical side of each objective. | Approves technical designs within scope. Cannot approve legal positions, risk acceptance or production promotion alone. |
| Privacy lead (to be appointed) | Owns [Privacy program](PRIVACY_PROGRAM.md): records of processing, data-subject requests, breach duties and transfers. | Approves privacy impact decisions within its remit. |
| Compliance owner (to be appointed) | Maintains the [Legal register](LEGAL_REGISTER.md) and [Suppliers](SUPPLIERS.md) register; tracks compliance disposition of releases. | Proposes compliance dispositions; escalates to Top management and counsel. |
| Legal counsel (to be engaged) | Confirms legal interpretations and citations in the legal register. | Only qualified counsel confirms legal positions. |
| Tenant compliance | Holds the tenant's regulatory filings, privacy notice and sub-processor authorizations. | Owned by the tenant. |
| Developers | Implement changes, write and run tests, provide reproducible evidence, and state each change's compliance impact. | Within authorized scope. Cannot approve their own work. |
| Independent human testers | Own the verification sub-issue for each story ([TESTING_OWNERSHIP.md](../policies/TESTING_OWNERSHIP.md)). | Accept or reject verification results; findings are logged. |
| AI coding assistants (Claude Code, Codex) | Draft code, tests, documentation and reviews within authorization. | May draft and review. Cannot approve scope, legal positions, risk acceptance, exceptions, control sign-off or production promotion ([COMPLIANCE.md](../policies/COMPLIANCE.md) section 5). |

## 4. Objectives (6.2)

Objectives are proposed. Each objective has a measure and a target that must be checked by the owner before first production release.

| Objective | Measure | Target | Owner | Status |
| --- | --- | --- | --- | --- |
| Secret scanning runs on every change | CI configuration includes secret scanning on pull requests | Enabled in CI before first production release | Engineering lead | Proposed |
| Dependency vulnerability scanning runs in CI | Scanner in CI for Python and Go dependencies; findings triaged | Enabled and triaged before first production release | Engineering lead | Proposed |
| Managed keys before production | Authority and brain data keys held in a managed key service; no plaintext key file in any production profile | Met before first production release | Engineering lead | Proposed |
| Supplier register complete before real data | Each vendor that could receive tenant data has a register entry with region, retention, training and contract status | 100% of vendors in the code path listed before any real data flows | Compliance owner | Proposed |
| No real customer data in the repository | Repository scan for personal or financial data in fixtures and reports | Zero findings in each release review | Engineering lead | Proposed |
| Compliance impact stated on every PR touching regulated areas | Share of PRs in the listed areas with an explicit compliance impact statement ([COMPLIANCE.md](../policies/COMPLIANCE.md) rule 1) | 100% of such PRs | Engineering lead | Proposed |
| Incident procedure tested before production | Tabletop exercise of the incident and tenant-notification procedure, with recorded outcome | Exercise completed and findings closed before first production release | Management system owner (to be appointed) | Proposed |
| Authority audit covers denied attempts and customer-data reads | Audit design and tests cover these events ([Risk register](RISK_REGISTER.md)) | Implemented and tested before first production release | Engineering lead | Proposed |
| Documented access and data-subject rights for tenant data | Access and export workflow exists for tenant customers' personal data | Implemented and tested before first production release | Privacy lead (to be appointed) | Proposed |
| Legal register entries confirmed before release | Blocking entries for a release with counsel confirmation or recorded human exception | 0 "pending" blocking entries at each release | Compliance owner | Proposed |

## 5. Policy review

- Top management reviews this policy at least annually and whenever the scope, the legal register, a tenant contract or the engine's architecture changes significantly.
- Review results are recorded in the management review outputs ([Management system procedures](MANAGEMENT_SYSTEM_PROCEDURES.md) section 9.3).

## 6. Related policies

| Document | Purpose |
| --- | --- |
| [AI policy](AI_POLICY.md) | Commitments for responsible development and use of the engine's AI |
| [Security policies](SECURITY_POLICIES.md) | Topic-specific security policies |
| [Privacy program](PRIVACY_PROGRAM.md) | Personal-data processing, rights and breach duties |

## Change history

| Version | Date | Change |
| --- | --- | --- |
| Draft | 2026-10-23 | Initial draft prepared with AI assistance from repository evidence; pending human review |
