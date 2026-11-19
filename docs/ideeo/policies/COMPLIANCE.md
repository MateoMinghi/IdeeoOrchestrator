> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Regulatory and standards compliance

Every change to this repository is designed, reviewed and released with the applicable laws, tenant regulatory obligations and the target ISO management-system controls in mind. This document owns the compliance-by-design rules. The [legal register](../compliance/LEGAL_REGISTER.md) owns identified legal and regulatory obligations; the [management system documentation](../compliance/README.md) owns ISO scope, policies, risks and statements of applicability. [PRODUCTION_READINESS.md](PRODUCTION_READINESS.md) and [AI_DEVELOPMENT.md](AI_DEVELOPMENT.md) still own verification evidence and eval gates.

This is engineering policy, not legal advice. Legal interpretations remain **pending legal confirmation** until qualified counsel confirms them in the legal register.

## 1. Target frameworks

| Framework | Target | Current status |
| --- | --- | --- |
| ISO/IEC 27001:2022 (information security management) | Certification | Not certified; documentation drafted |
| ISO/IEC 42001:2023 (AI management) | Certification, integrated with 27001 | Not certified; documentation drafted |
| ISO/IEC 27701:2025 (privacy information management) | Certification after 27001/42001 | Not started |
| ISO/IEC 27017 and 27018 (cloud security, PII in public cloud) | Extensions to the 27001 scope | Not started |
| ISO 22301 (business continuity) | When the engine becomes a critical tenant channel | Not started |
| PCI DSS v4.0.1 | Required before the engine, browser or agent computers store, process or transmit cardholder data | Out of scope today: no cardholder data is handled |
| SOC 2 Type II | Only if a tenant requires it | Not started |

No certification is held. Do not claim certification, compliance or regulatory approval in code, documentation, product text or tenant communication.

## 2. Roles under the law

Until counsel confirms otherwise, design to these roles:

- Each **tenant bank** is the controller (*responsable*) of its customers' personal data and the regulated entity that holds the licence, ledger and customer relationship.
- **We** are a technology service provider to that regulated entity and a processor (*encargado*) of its customers' data. Our sub-processors (AI providers, hosting, messaging and speech vendors) need the tenant's authorization.
- We are the controller only for our own operational data, such as staff and supplier records.

The first tenant operates in Mexico. Mexican law applies first; obligations for any other jurisdiction are added to the legal register before a tenant from that jurisdiction is onboarded.

## 3. Rules for every change

1. **Identify obligations.** When a change touches personal or financial data, money movement, authentication, AI providers or models, channels, third-party websites, retention or processing outside the tenant's country, name the affected legal-register entries and ISO controls in the issue or PR. "No compliance impact" is a valid, explicit answer.
2. **Default deny for real data.** Keep real-tenant model disclosure (`model_routes` in the tenant data policy) empty until the register records, for that tenant and provider: coverage by the tenant's regulatory filing for processing outside the country, the tenant's sub-processor authorization, a data processing agreement with no-training and retention terms, and privacy-notice coverage.
3. **Never send secrets to models or vendors.** PINs, one-time codes, passwords, full card numbers, CVVs and credentials never enter model input, prompts, telemetry, reports or fixtures.
4. **Register suppliers first.** Add a vendor to the [supplier register](../compliance/SUPPLIERS.md) with its region, retention, training, certification and contract status before any code path can send it tenant data. Synthetic-only use is recorded as such.
5. **No processing abroad without filing coverage.** Real customer data of a Mexican tenant is not processed outside Mexico unless the tenant's CNBV filing for that processing covers the vendor and location.
6. **Cardholder data needs a PCI decision.** No component stores, processes or transmits a PAN or CVV until the PCI DSS scope decision and its controls are approved.
7. **Declare retention and erasure.** Every new store declares its owner, data class, retention period and erasure path in [data ownership and lifecycle](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md). Reconcile minimization with record-keeping duties (for example anti-money-laundering and commercial records) that the tenant or we must meet.
8. **Support data-subject rights.** New personal-data stores support the tenant's access, rectification, cancellation and opposition (ARCO) requests, or record the gap as a risk.
9. **Keep actions auditable.** Consequential actions, approvals, denials and access to customer financial data leave attributable, tamper-evident records under the authority's audit design.
10. **Do not weaken controls.** Changes keep or strengthen the controls listed in the statements of applicability. Production additionally requires managed keys, encrypted transport, rotated credentials and the other production controls those statements list as planned.
11. **Treat AI changes as AI system changes.** A change of model, provider, prompt, tool, autonomy level or data class goes through the [AI impact assessment](../compliance/AI_IMPACT_ASSESSMENT.md) and the eval rules in [AI_DEVELOPMENT.md](AI_DEVELOPMENT.md).
12. **Get legal clearance for third-party sites and channels.** New browser destinations, monitoring of third-party sites, and messaging or voice channels need a recorded legal opinion before real users can use them. Identify the agent honestly and respect site terms and access controls. Under the authorized interactive-browser policy in [ADR-013](../decisions/013-browser-use-preparation.md), robots.txt is not an executable startup or request veto. This engineering policy does not establish permission under site terms or approve real-user access; those legal and contractual prerequisites remain separate.
13. **Use synthetic test data.** Fixtures, eval cases and reports use labelled synthetic data only. Real customer data never enters the repository.
14. **Do not invent law.** Mark legal assertions "pending legal confirmation" until counsel confirms them. Do not present an interpretation as settled, and do not cite a provision that has not been checked against its official source.
15. **Report incidents immediately.** A suspected security incident or personal-data breach follows the [incident procedure](../compliance/INCIDENT_AND_CONTINUITY.md) at once, including notification to the affected tenant.

## 4. Review and release

- Primary and cross-model reviews check the applicable rules above and the PR's stated compliance impact.
- A discovered compliance gap becomes a [risk register](../compliance/RISK_REGISTER.md) entry or backlog item. It is never silently accepted.
- Production promotion requires every legal-register obligation that applies to the release to be confirmed by counsel, or to carry an explicit, recorded human exception. No blocking entry may remain "pending".
- The human approver of a release also approves its compliance disposition.

## 5. Authority and limits

Models and agents may draft compliance documentation, identify obligations and flag gaps. They do not approve legal interpretations, accept risks, approve exceptions, sign off controls, record evidence they did not observe, or claim certification. Top management approves management-system policies; designated humans own risk acceptance; qualified counsel confirms legal positions.
