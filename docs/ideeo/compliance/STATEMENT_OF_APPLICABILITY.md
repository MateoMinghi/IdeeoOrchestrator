> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Statement of Applicability (ISO/IEC 27001:2022 Annex A)

Status: **Draft. Pending approval by Top management. Not certification evidence.**

Standard references: ISO/IEC 27001:2022 clause 6.1.3 d) and Annex A (controls 5.1 to 8.34).

Applicability decisions below are proposed. The organization's offices, staff and hosting are not fully known, so people and physical controls are marked applicable. Most physical controls are "Planned (inherited from cloud provider)" for data-centre scope once production runs on the tenant's AWS account; office controls are "Not implemented". Status vocabulary and conventions are in [README.md](README.md). Gap IDs (G1 to G15) and the risks behind them are in [RISK_REGISTER.md](RISK_REGISTER.md).

## A. Organizational controls (5.1 to 5.37)

| Control | Applicable | Justification | Status | Evidence or planned action |
| --- | --- | --- | --- | --- |
| 5.1 Policies for information security | Yes | Policy set is required for the ISMS and for tenant trust. | Partial | Drafts in [MANAGEMENT_SYSTEM_POLICY.md](MANAGEMENT_SYSTEM_POLICY.md) and [SECURITY_POLICIES.md](SECURITY_POLICIES.md); none approved; see [COMPLIANCE.md](../policies/COMPLIANCE.md). |
| 5.2 Information security roles and responsibilities | Yes | Roles must be assigned before controls can be owned. | Partial | Roles named in [MANAGEMENT_SYSTEM_POLICY.md](MANAGEMENT_SYSTEM_POLICY.md); owners "to be appointed". |
| 5.3 Segregation of duties | Yes | Implementer and verifier must differ for changes to a bank engine. | Implemented (development) | Independent tester and cross-model review rules in [METHODOLOGY.md](../policies/METHODOLOGY.md) and [TESTING_OWNERSHIP.md](../policies/TESTING_OWNERSHIP.md); human-controlled promotion in METHODOLOGY section 12. |
| 5.4 Management responsibilities | Yes | Top management must direct and support the ISMS. | Planned | Management review and responsibilities in [MANAGEMENT_SYSTEM_PROCEDURES.md](MANAGEMENT_SYSTEM_PROCEDURES.md). |
| 5.5 Contact with authorities | Yes | Regulatory incident and filing contacts are required for CNBV and data-protection duties. | Planned | Contact list to be added to [INCIDENT_AND_CONTINUITY.md](INCIDENT_AND_CONTINUITY.md); obligations in [LEGAL_REGISTER.md](LEGAL_REGISTER.md). |
| 5.6 Contact with special interest groups | Yes | Security community contacts support vulnerability and threat awareness. | Not implemented | No membership or contact list in the repository; to be defined in [MANAGEMENT_SYSTEM_PROCEDURES.md](MANAGEMENT_SYSTEM_PROCEDURES.md). |
| 5.7 Threat intelligence | Yes | Threats to AI agents and financial APIs change quickly. | Not implemented | Only per-change threat analysis exists ([PRODUCTION_READINESS.md](../policies/PRODUCTION_READINESS.md) section 6); no threat intelligence process. |
| 5.8 Information security in project management | Yes | Engine changes carry tenant, money and AI risk. | Partial | Impact classes and security review in [PRODUCTION_READINESS.md](../policies/PRODUCTION_READINESS.md); the [PR template](../reference/SOURCE_REFERENCES.md#source-b2496e80299b) has no compliance-impact field required by [COMPLIANCE.md](../policies/COMPLIANCE.md) rule 1. |
| 5.9 Inventory of information and other associated assets | Yes | Data stores and components must be inventoried for protection and erasure. | Partial | Data stores and owners in [DATA_OWNERSHIP_AND_LIFECYCLE.md](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md); no asset register. |
| 5.10 Acceptable use of information and other associated assets | Yes | Staff and AI coding tools must have use rules. | Not implemented | Acceptable-use requirement drafted in [SECURITY_POLICIES.md](SECURITY_POLICIES.md) section 9; not adopted or acknowledged. |
| 5.11 Return of assets | Yes | Staff and contractors hold code, credentials and devices. | Planned | To be defined in [SECURITY_POLICIES.md](SECURITY_POLICIES.md) with personnel records. |
| 5.12 Classification of information | Yes | Customer, financial and synthetic data need distinct handling. | Partial | Data classes in [DATA_OWNERSHIP_AND_LIFECYCLE.md](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md); four-class scheme drafted in [SECURITY_POLICIES.md](SECURITY_POLICIES.md) section 6, not yet applied to stores. |
| 5.13 Labelling of information | Yes | Synthetic test data must be distinguishable from real data. | Partial | Synthetic fixtures are labelled in tests (e.g. [test_assistant_identity.py](../reference/SOURCE_REFERENCES.md#source-c1c18a660760)); no general labelling scheme. |
| 5.14 Information transfer | Yes | Data moves to AI providers, the tenant and the browser. | Partial | Default-deny model routes in [data_policy.py](../reference/SOURCE_REFERENCES.md#source-c79ca76f1746); no transfer agreements for vendors ([SUPPLIERS.md](SUPPLIERS.md)). |
| 5.15 Access control | Yes | Tenant and agent access must be limited by grant. | Implemented (development) | Authority grants in [access.go](../reference/SOURCE_REFERENCES.md#source-66ba67277ec9); tenant row-level security in [tenant isolation migration](../reference/SOURCE_REFERENCES.md#source-b3322c3ddd59). |
| 5.16 Identity management | Yes | Customer and owner identities come from tenant issuers. | Partial | Issuer and audience pinning in [auth.py](../reference/SOURCE_REFERENCES.md#source-fb73258223a6); no staff identity provider defined. |
| 5.17 Authentication information | Yes | Passwords, tokens and keys must be protected and rotated. | Partial | Secrets from environment only ([settings.py](../reference/SOURCE_REFERENCES.md#source-df0681319dea)); static workload bearer tokens without rotation (gap G2). |
| 5.18 Access rights | Yes | Staff, CI and production access must be reviewed. | Not implemented | No access review or access-rights register in evidence (gap G14); to be defined in [SECURITY_POLICIES.md](SECURITY_POLICIES.md). |
| 5.19 Information security in supplier relationships | Yes | Suppliers receive or process tenant-related data. | Not implemented | Register and onboarding checklist drafted in [SUPPLIERS.md](SUPPLIERS.md); no supplier assessed and no data processing agreements (gap G10). |
| 5.20 Addressing information security within supplier agreements | Yes | AI providers and hosting need security, retention and training terms. | Not implemented | No agreements in evidence; LR-01 and LR-03 require them ([LEGAL_REGISTER.md](LEGAL_REGISTER.md)). |
| 5.21 Managing information security in the ICT supply chain | Yes | Dependencies, CI actions and AI coding tools form the supply chain. | Not implemented | No SBOM or dependency scanning (gap G8); see [engine.yml](../reference/SOURCE_REFERENCES.md#source-c416479486f9). |
| 5.22 Monitoring, review and change management of supplier services | Yes | Provider terms and models change without notice. | Not implemented | Review cycle drafted in [SUPPLIERS.md](SUPPLIERS.md) section 4; no review performed. |
| 5.23 Information security for use of cloud services | Yes | Production is planned on AWS and Bedrock. | Planned | Planned AWS scope in [ADR-003](../decisions/003-engine-implementation-stack.md); controls to be set in [SECURITY_POLICIES.md](SECURITY_POLICIES.md). |
| 5.24 Information security incident management planning and preparation | Yes | Incidents must be detected and reported to the tenant within its regulatory deadlines. | Planned | Procedure drafted in [INCIDENT_AND_CONTINUITY.md](INCIDENT_AND_CONTINUITY.md); not approved or exercised (gap G9). |
| 5.25 Assessment and decision on information security events | Yes | Events must be triaged to incidents. | Planned | Severity levels drafted in [INCIDENT_AND_CONTINUITY.md](INCIDENT_AND_CONTINUITY.md) section 2; not approved. |
| 5.26 Response to information security incidents | Yes | Containment and tenant notification are required. | Planned | Response stages and containment levers drafted in [INCIDENT_AND_CONTINUITY.md](INCIDENT_AND_CONTINUITY.md) section 5; reporting duty in [COMPLIANCE.md](../policies/COMPLIANCE.md) rule 15. |
| 5.27 Learning from information security incidents | Yes | Lessons must update controls and risks. | Planned | Post-incident review drafted in [INCIDENT_AND_CONTINUITY.md](INCIDENT_AND_CONTINUITY.md) section 8; corrective action in [MANAGEMENT_SYSTEM_PROCEDURES.md](MANAGEMENT_SYSTEM_PROCEDURES.md). |
| 5.28 Collection of evidence | Yes | Authority audit records support investigations. | Partial | Append-only mandate history in [007_mandate_history.sql](../reference/SOURCE_REFERENCES.md#source-c75629db42ef); read and denied-attempt logging missing (gap G7). |
| 5.29 Information security during disruption | Yes | Controls must survive outages. | Not implemented | Continuity section drafted in [INCIDENT_AND_CONTINUITY.md](INCIDENT_AND_CONTINUITY.md) section 9; RTO/RPO not set and nothing exercised (gap G9). |
| 5.30 ICT readiness for business continuity | Yes | Recovery objectives are not set. | Not implemented | No RTO/RPO or recovery rehearsal (gap G9); see [PRODUCTION_READINESS.md](../policies/PRODUCTION_READINESS.md) section 8. |
| 5.31 Legal, statutory, regulatory and contractual requirements | Yes | Mexican data, banking and AI duties apply. | Partial | Register of obligations in [LEGAL_REGISTER.md](LEGAL_REGISTER.md); every entry is pending legal confirmation. |
| 5.32 Intellectual property rights | Yes | Code, third-party libraries and model terms carry IP obligations. | Not implemented | No LICENSE file or third-party license inventory in the repository; to be added with the [SBOM](SUPPLIERS.md) work. |
| 5.33 Protection of records | Yes | Mandates and approvals may be needed as evidence. | Partial | Append-only triggers in [007_mandate_history.sql](../reference/SOURCE_REFERENCES.md#source-c75629db42ef); retention periods not selected (gap G6); NOM-151 pending ([LEGAL_REGISTER.md](LEGAL_REGISTER.md)). |
| 5.34 Privacy and protection of PII | Yes | The engine processes customer personal data as a processor. | Partial | Field encryption in [protected.py](../reference/SOURCE_REFERENCES.md#source-5f7581f679f7) and model masking in [data_policy.py](../reference/SOURCE_REFERENCES.md#source-c79ca76f1746); no access or erasure workflow (gap G5); see [PRIVACY_PROGRAM.md](PRIVACY_PROGRAM.md). |
| 5.35 Independent review of information security | Yes | The ISMS needs an independent check. | Partial | Independent review rules in [METHODOLOGY.md](../policies/METHODOLOGY.md); no internal audit programme yet ([MANAGEMENT_SYSTEM_PROCEDURES.md](MANAGEMENT_SYSTEM_PROCEDURES.md)). |
| 5.36 Compliance with policies, rules and standards for information security | Yes | Engineering rules must be enforced. | Partial | Rules in [COMPLIANCE.md](../policies/COMPLIANCE.md); enforcement in CI only partly covers them. |
| 5.37 Documented operating procedures | Yes | Operators and developers need repeatable procedures. | Partial | Setup in [ENGINE_SETUP.md](../reference/SOURCE_REFERENCES.md#source-8f929a906ccd) and delivery in [METHODOLOGY.md](../policies/METHODOLOGY.md); no production runbooks. |

## B. People controls (6.1 to 6.8)

| Control | Applicable | Justification | Status | Evidence or planned action |
| --- | --- | --- | --- | --- |
| 6.1 Screening | Yes | Staff with access to bank systems must be screened. | Planned | To be defined in [SECURITY_POLICIES.md](SECURITY_POLICIES.md); no personnel records in repository (gap G14). |
| 6.2 Terms and conditions of employment | Yes | Contracts must state security duties. | Planned | To be drafted in [SECURITY_POLICIES.md](SECURITY_POLICIES.md). |
| 6.3 Information security awareness, education and training | Yes | Staff and reviewers need training on bank data and AI risk. | Not implemented | No training record or plan (gap G14); to be planned in [MANAGEMENT_SYSTEM_PROCEDURES.md](MANAGEMENT_SYSTEM_PROCEDURES.md). |
| 6.4 Disciplinary process | Yes | Breaches of policy need a defined process. | Planned | To be defined in [MANAGEMENT_SYSTEM_PROCEDURES.md](MANAGEMENT_SYSTEM_PROCEDURES.md). |
| 6.5 Responsibilities after termination or change of employment | Yes | Access and keys must be removed on exit. | Planned | To be defined in [SECURITY_POLICIES.md](SECURITY_POLICIES.md). |
| 6.6 Confidentiality or non-disclosure agreements | Yes | Bank secrecy (LR-02) requires confidentiality from people. | Planned | To be obtained from staff and suppliers; see [LEGAL_REGISTER.md](LEGAL_REGISTER.md). |
| 6.7 Remote working | Yes | Development is done from workstations and remote AI tools. | Not implemented | No remote-working rules (gap G14); to be defined in [SECURITY_POLICIES.md](SECURITY_POLICIES.md). |
| 6.8 Information security event reporting | Yes | Staff must report suspected incidents at once. | Partial | Duty to report immediately in [COMPLIANCE.md](../policies/COMPLIANCE.md) rule 15; reporting channel defined in [INCIDENT_AND_CONTINUITY.md](INCIDENT_AND_CONTINUITY.md) when approved. |

## C. Physical controls (7.1 to 7.14)

| Control | Applicable | Justification | Status | Evidence or planned action |
| --- | --- | --- | --- | --- |
| 7.1 Physical security perimeters | Yes | Data-centre and office perimeters hold systems. | Planned (inherited from cloud provider) | Data-centre perimeter inherited from AWS once production runs on the tenant account ([PRODUCTION_READINESS.md](../policies/PRODUCTION_READINESS.md)). |
| 7.2 Physical entry | Yes | Entry to offices and data centres must be controlled. | Planned (inherited from cloud provider) | Data-centre entry inherited from AWS; office entry not defined ([SECURITY_POLICIES.md](SECURITY_POLICIES.md)). |
| 7.3 Securing offices, rooms and facilities | Yes | Office premises are not yet known. | Not implemented | Office premises and rules unknown; to be defined in [SECURITY_POLICIES.md](SECURITY_POLICIES.md). |
| 7.4 Physical security monitoring | Yes | Monitoring of facilities is needed. | Planned (inherited from cloud provider) | Data-centre monitoring inherited from AWS; office monitoring not defined. |
| 7.5 Protecting against physical and environmental threats | Yes | Fire, flood and power threats apply to premises and data centres. | Planned (inherited from cloud provider) | Data-centre protection inherited from AWS; see [INCIDENT_AND_CONTINUITY.md](INCIDENT_AND_CONTINUITY.md). |
| 7.6 Working in secure areas | Yes | Secure areas must be defined where bank data is handled. | Planned (inherited from cloud provider) | Secure areas to be defined in [SECURITY_POLICIES.md](SECURITY_POLICIES.md); data-centre areas inherited. |
| 7.7 Clear desk and clear screen | Yes | Staff workstations may show customer or synthetic data. | Not implemented | No clear-desk or screen-lock rule (gap G14); to be defined in [SECURITY_POLICIES.md](SECURITY_POLICIES.md). |
| 7.8 Equipment siting and protection | Yes | Equipment must be sited and protected. | Planned (inherited from cloud provider) | Data-centre equipment inherited from AWS; office equipment not defined. |
| 7.9 Security of assets off-premises | Yes | Laptops and remote work take code and credentials off-site. | Not implemented | No off-premises asset rule or device management (gap G14). |
| 7.10 Storage media | Yes | Removable media and backups hold data. | Not implemented | No storage-media policy; secrets kept out of the repository by [.gitignore](../reference/SOURCE_REFERENCES.md#source-bc37d034bad5). |
| 7.11 Supporting utilities | Yes | Power and cooling support the systems. | Planned (inherited from cloud provider) | Utilities inherited from AWS for production. |
| 7.12 Cabling security | Yes | Network cabling carries data in data centres and offices. | Planned (inherited from cloud provider) | Data-centre cabling inherited from AWS; office cabling not defined. |
| 7.13 Equipment maintenance | Yes | Equipment must be maintained to keep it available. | Planned (inherited from cloud provider) | Data-centre maintenance inherited from AWS; office maintenance not defined. |
| 7.14 Secure disposal or re-use of equipment | Yes | Disks and devices may hold data when retired. | Planned (inherited from cloud provider) | Data-centre disposal inherited from AWS; office disposal not defined ([SECURITY_POLICIES.md](SECURITY_POLICIES.md)). |

## D. Technological controls (8.1 to 8.34)

| Control | Applicable | Justification | Status | Evidence or planned action |
| --- | --- | --- | --- | --- |
| 8.1 User endpoint devices | Yes | Developer workstations hold code, keys and AI tool sessions. | Not implemented | No endpoint management or device standard (gap G14). |
| 8.2 Privileged access rights | Yes | Owner and runtime database roles must be separated. | Partial | Runtime role refuses superuser and BYPASSRLS ([tenant isolation migration](../reference/SOURCE_REFERENCES.md#source-b3322c3ddd59)); no privileged-access review. |
| 8.3 Information access restriction | Yes | Tenant data must be isolated from other tenants and from models. | Implemented (development) | Forced row-level security ([migration](../reference/SOURCE_REFERENCES.md#source-b3322c3ddd59)); default-deny model routes in [data_policy.py](../reference/SOURCE_REFERENCES.md#source-c79ca76f1746). |
| 8.4 Access to source code | Yes | Source and CI settings must be restricted. | Partial | Feature branches and [PR template](../reference/SOURCE_REFERENCES.md#source-b2496e80299b); branch protection and CODEOWNERS not evidenced (gap G8). |
| 8.5 Secure authentication | Yes | Customer and owner access need strong, short-lived proof. | Partial | Short-lived ES256 tokens in [auth.py](../reference/SOURCE_REFERENCES.md#source-fb73258223a6) and [authority/auth.go](../reference/SOURCE_REFERENCES.md#source-b9446bebdaf4); static workload tokens (gap G2). |
| 8.6 Capacity management | Yes | Overload can cause outages and cost overruns. | Partial | Body, browser and output limits in [settings.py](../reference/SOURCE_REFERENCES.md#source-df0681319dea) and [browser models](../reference/SOURCE_REFERENCES.md#source-4d0a6d80bdf0); no capacity plan ([PRODUCTION_READINESS.md](../policies/PRODUCTION_READINESS.md) section 7). |
| 8.7 Protection against malware | Yes | Browsers and uploads can carry malware. | Not implemented | No malware scanning; browser runs with JavaScript disabled ([browser models](../reference/SOURCE_REFERENCES.md#source-4d0a6d80bdf0)) but this is not malware protection. |
| 8.8 Management of technical vulnerabilities | Yes | Dependencies and runtimes have known vulnerabilities. | Not implemented | No dependency or vulnerability scan in CI; pip-audit listed but not run ([pyproject.toml](../reference/SOURCE_REFERENCES.md#source-50c86b7ed8ac)) (gap G8). |
| 8.9 Configuration management | Yes | Settings must be controlled across environments. | Partial | Settings and examples in [settings.py](../reference/SOURCE_REFERENCES.md#source-df0681319dea), [.env.example](../reference/SOURCE_REFERENCES.md#source-a3046da0d15a) and [compose.yaml](../reference/SOURCE_REFERENCES.md#source-facaded51b7d); no production profile (gap G14). |
| 8.10 Information deletion | Yes | Retention and erasure duties apply to customer data. | Partial | Scheduled cleanup and retention settings in [settings.py](../reference/SOURCE_REFERENCES.md#source-df0681319dea); production periods not selected and erasure incomplete (gaps G5, G6). |
| 8.11 Data masking | Yes | Model input must not expose account identifiers. | Implemented (development) | Request-local aliases in ModelProjection in [data_policy.py](../reference/SOURCE_REFERENCES.md#source-c79ca76f1746). |
| 8.12 Data leakage prevention | Yes | Customer data must not leave to unapproved vendors or outputs. | Partial | Default-deny data policy in [data_policy.py](../reference/SOURCE_REFERENCES.md#source-c79ca76f1746); keyword-only sensitive-input screen in [service.py](../reference/SOURCE_REFERENCES.md#source-961ce220c26a) (gap G4). |
| 8.13 Information backup | Yes | Ledger-linked and task data must be recoverable. | Not implemented | Backup design drafted in [INCIDENT_AND_CONTINUITY.md](INCIDENT_AND_CONTINUITY.md) section 10; no backups or restore rehearsal (gap G9). |
| 8.14 Redundancy of information processing facilities | Yes | Availability needs redundancy for a bank channel. | Planned | Planned on AWS (EKS, Aurora); see [ADR-003](../decisions/003-engine-implementation-stack.md) and [INCIDENT_AND_CONTINUITY.md](INCIDENT_AND_CONTINUITY.md). |
| 8.15 Logging | Yes | Consequential actions and access must be attributable. | Partial | Append-only mandate and control history in [007_mandate_history.sql](../reference/SOURCE_REFERENCES.md#source-c75629db42ef); reads and denials not logged (gap G7). |
| 8.16 Monitoring activities | Yes | Abnormal activity must be detected. | Planned | Observability planned in [ADR-003](../decisions/003-engine-implementation-stack.md); alerting required by [PRODUCTION_READINESS.md](../policies/PRODUCTION_READINESS.md) section 10. |
| 8.17 Clock synchronization | Yes | Token lifetimes and audit times depend on accurate clocks. | Planned | Production clock sync to be inherited from AWS and recorded in [SECURITY_POLICIES.md](SECURITY_POLICIES.md). |
| 8.18 Use of privileged utility programs | Yes | Maintenance scripts can alter data. | Not implemented | Scripts in [scripts/](../reference/SOURCE_REFERENCES.md#source-8c5967fd8486) run with owner database URLs; no restriction or logging rule yet. |
| 8.19 Installation of software on operational systems | Yes | Production hosts will need controlled installs. | Planned | To be defined in [SECURITY_POLICIES.md](SECURITY_POLICIES.md) with the [deploy process](../policies/METHODOLOGY.md). |
| 8.20 Networks security | Yes | Network paths carry tenant and agent traffic. | Partial | Browser HTTPS/443 allowlist in [browser models](../reference/SOURCE_REFERENCES.md#source-4d0a6d80bdf0); authority on plain loopback HTTP ([main.go](../reference/SOURCE_REFERENCES.md#source-3b8945025b34)) (gap G2). |
| 8.21 Security of network services | Yes | Services exposed to banks and agents need protection. | Partial | Outbound HTTPS to providers; database URL has no TLS setting ([settings.py](../reference/SOURCE_REFERENCES.md#source-df0681319dea)) (gap G2). |
| 8.22 Segregation of networks | Yes | Tenant, engine and browser networks should be separated. | Planned | Planned on AWS; local compose only ([compose.yaml](../reference/SOURCE_REFERENCES.md#source-facaded51b7d)). |
| 8.23 Web filtering | Yes | The browser must reach only approved sites. | Partial | Allowlist in [browser config example](../reference/config/browser-policies.example.json) and login/checkout blocks in [browser models](../reference/SOURCE_REFERENCES.md#source-4d0a6d80bdf0); robots.txt and site terms not checked (gap G11). |
| 8.24 Use of cryptography | Yes | Customer data and tokens need strong encryption and key management. | Partial | AES-GCM with per-tenant HKDF keys in [protected.py](../reference/SOURCE_REFERENCES.md#source-5f7581f679f7) and [crypto.go](../reference/SOURCE_REFERENCES.md#source-de9708436c0c); development key file, no KMS or rotation (gap G1). |
| 8.25 Secure development life cycle | Yes | Engine changes need a controlled life cycle. | Implemented (development) | Delivery methodology in [METHODOLOGY.md](../policies/METHODOLOGY.md) and [AI_DEVELOPMENT.md](../policies/AI_DEVELOPMENT.md). |
| 8.26 Application security requirements | Yes | Security requirements must be set for each feature. | Partial | Threat and ASVS-subset baseline in [PRODUCTION_READINESS.md](../policies/PRODUCTION_READINESS.md) section 6; no versioned requirement set. |
| 8.27 Secure system architecture and engineering principles | Yes | Tenant isolation and fail-closed defaults must be designed in. | Implemented (development) | Tenant isolation, fail-closed model routes and authority controls in [data_policy.py](../reference/SOURCE_REFERENCES.md#source-c79ca76f1746) and [policy.go](../reference/SOURCE_REFERENCES.md#source-ad8846edd7f3). |
| 8.28 Secure coding | Yes | Code must avoid common weaknesses. | Implemented (development) | Ruff with security (S) rules and mypy strict in [pyproject.toml](../reference/SOURCE_REFERENCES.md#source-50c86b7ed8ac) and [engine.yml](../reference/SOURCE_REFERENCES.md#source-c416479486f9). |
| 8.29 Security testing in development and acceptance | Yes | Security behavior must be tested before release. | Partial | Authority mutation tests in [authority_mutations.py](../reference/SOURCE_REFERENCES.md#source-708533faf39b) and [authority.yml](../reference/SOURCE_REFERENCES.md#source-4b98103a9048); no SAST beyond ruff, no DAST. |
| 8.30 Outsourced development | Yes | AI coding assistants and contractors write code. | Partial | AI development rules in [AI_DEVELOPMENT.md](../policies/AI_DEVELOPMENT.md); no contractor agreements yet ([SUPPLIERS.md](SUPPLIERS.md)). |
| 8.31 Separation of development, test and production environments | Yes | Production must be separate from development. | Partial | Only the development environment is allowed ([settings.py](../reference/SOURCE_REFERENCES.md#source-df0681319dea), [config.go](../reference/SOURCE_REFERENCES.md#source-7fda34e56797)); production not yet built. |
| 8.32 Change management | Yes | Changes to bank-facing code must be controlled. | Partial | Feature branches, PR template and human-controlled promotion in [METHODOLOGY.md](../policies/METHODOLOGY.md); branch protection not evidenced (gap G8). |
| 8.33 Test information | Yes | Test data must not include real customer data. | Partial | Synthetic data rules in [COMPLIANCE.md](../policies/COMPLIANCE.md) rule 13; test fixtures are labelled synthetic (e.g. [test_assistant_identity.py](../reference/SOURCE_REFERENCES.md#source-c1c18a660760)); no automated check. |
| 8.34 Protection of information systems during audit testing | Yes | Audits must not disrupt or expose production data. | Planned | To be defined in [MANAGEMENT_SYSTEM_PROCEDURES.md](MANAGEMENT_SYSTEM_PROCEDURES.md) when an audit is scheduled. |

## Summary of priority gaps

The ten most important Not implemented or Partial controls for a first certification audit. Each is tracked in [RISK_REGISTER.md](RISK_REGISTER.md).

| Control | Status | Gap | Risk link |
| --- | --- | --- | --- |
| 5.19 Information security in supplier relationships | Not implemented | No supplier register (G10) | [RISK_REGISTER.md](RISK_REGISTER.md) |
| 5.31 Legal, statutory, regulatory and contractual requirements | Partial | All obligations pending legal confirmation; CNBV filing unknown (LR-03, Q2) | [RISK_REGISTER.md](RISK_REGISTER.md) |
| 5.34 Privacy and protection of PII | Partial | No access or erasure workflow (G5) | [RISK_REGISTER.md](RISK_REGISTER.md) |
| 8.24 Use of cryptography | Partial | Development key file, no KMS or rotation (G1) | [RISK_REGISTER.md](RISK_REGISTER.md) |
| 8.8 Management of technical vulnerabilities | Not implemented | No vulnerability scanning in CI (G8) | [RISK_REGISTER.md](RISK_REGISTER.md) |
| 8.13 Information backup | Not implemented | No backup policy or restore rehearsal (G9) | [RISK_REGISTER.md](RISK_REGISTER.md) |
| 5.24 Information security incident management planning and preparation | Planned | No approved incident procedure (G9) | [RISK_REGISTER.md](RISK_REGISTER.md) |
| 8.15 Logging | Partial | Reads and denied attempts not recorded (G7) | [RISK_REGISTER.md](RISK_REGISTER.md) |
| 5.18 Access rights | Not implemented | No access review or rights register (G14) | [RISK_REGISTER.md](RISK_REGISTER.md) |
| 6.3 Information security awareness, education and training | Not implemented | No training records or plan (G14) | [RISK_REGISTER.md](RISK_REGISTER.md) |

## Change history

| Version | Date | Change |
| --- | --- | --- |
| Draft | 2026-10-23 | Initial draft prepared with AI assistance from repository evidence; pending human review |
