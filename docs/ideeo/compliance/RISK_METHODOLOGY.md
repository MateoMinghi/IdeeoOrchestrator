> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Risk methodology

Status: **Draft. Pending approval by Top management. Not certification evidence.**

Standard references: ISO/IEC 27001:2022 clauses 6.1.1 to 6.1.3, 8.2, 8.3; ISO/IEC 42001:2023 clauses 6.1.1 to 6.1.3, 8.2, 8.3.

This method assesses information security, privacy and AI risks in one register. Results are recorded in the [risk register](RISK_REGISTER.md). Control applicability is recorded in the [Statement of Applicability](STATEMENT_OF_APPLICABILITY.md) (ISO/IEC 27001 Annex A) and the [AI Statement of Applicability](AI_STATEMENT_OF_APPLICABILITY.md) (ISO/IEC 42001 Annex A). AI system impacts on individuals, groups and society are assessed in the [AI impact assessment](AI_IMPACT_ASSESSMENT.md); this method does not repeat them. Engineering rules that trigger reassessment are in [COMPLIANCE.md](../policies/COMPLIANCE.md).

## 1. Scope and ownership

- Scope: the shared engine in this repository, its development environment, and the planned tenant deployment described in [data ownership and lifecycle](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md). The legacy orchestrator is in scope only as a tenant-side risk (risk R-15 in the register).
- Top management approves this method and accepts residual High and Medium risks (section 5).
- Risk owners are roles named in the register. Owners assess their own risks; models and agents do not (see section 5).

## 2. Process

1. **Identify** a scenario: asset or process, threat or risk source, and consequence. Example form: "prompt injection in the planner leads to an unauthorized payment attempt on a customer account."
2. **Analyse** the existing controls, citing repository evidence that was opened and checked. Controls that exist only in development are marked as such.
3. **Estimate** likelihood (L) and impact (I) on the 1 to 5 scales below. Use the worst credible impact across the five dimensions.
4. **Score** = L × I. Assign the band in section 3.
5. **Treat**: choose an option in section 4 and link Annex A controls.
6. **Record** the residual score after treatment. Acceptance is recorded only by the named role (section 5).
7. **Monitor and review** on the triggers in section 6.

Likelihood is assessed for the stated context. A risk that depends on real tenant data is scored for the period after that data is enabled, and the register says so.

## 3. Scales and bands

### Likelihood (L)

| L | Label | Definition for this engine |
| --- | --- | --- |
| 1 | Rare | Requires several independent failures or a deliberate, skilled attack; no known precedent in the repository. |
| 2 | Unlikely | Plausible for a determined attacker or a rare misconfiguration; controls exist but are not tested in production-like conditions. |
| 3 | Possible | Realistic over the product life; a known weakness is open, or a model or vendor behaviour can produce it without an attacker. |
| 4 | Likely | Expected to occur at some point with current controls; a gap is documented and no compensating control is evidenced. |
| 5 | Almost certain | Occurs routinely or is already observable in tests or evals. |

### Impact (I)

The impact is the worst of these dimensions. Monetary thresholds are to be set by Top management before the first assessment. Until then, use the qualitative wording.

| I | Label | Unauthorized financial effect | Customer or personal-data exposure | Regulatory or contractual breach for a tenant | Service unavailability | Tenant trust |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Negligible | No money moved; no effect beyond the attempt. | No personal data involved. | None. | Loss under one minute, no customer impact. | No visible effect. |
| 2 | Minor | Effect reversed by the tenant without customer loss; amount below the threshold to be set. | Synthetic or internal data only. | Internal finding; no notice required. | Degradation for a short period with no lost tasks. | Internal concern only. |
| 3 | Moderate | Customer loss recovered with effort; amount above the minor threshold. | Limited personal data of a few customers, with no sensitive fields. | Contractual notice or audit finding for the tenant. | Hours of loss or delayed tasks; tasks recoverable. | A tenant or customer complaint. |
| 4 | Major | Customer loss not fully recoverable; amount above the moderate threshold. | Personal or account data of many customers, or any credential-adjacent data. | Notifiable incident to a regulator or a material contract breach. | Loss of a critical channel for a business day or more. | Tenant reconsiders the engine; public complaint. |
| 5 | Severe | Large unrecoverable loss, or a fraud pattern affecting many accounts. | Bulk exposure of customer financial data, or cross-tenant exposure. | Sanction or licence risk for the tenant; mandatory regulator report with loss of trust. | Prolonged outage of a critical service. | Loss of tenant relationship. |

### Score bands

Score = L × I. Products of 1 to 5 scales produce 1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, 20 and 25 only, so every reachable score falls in exactly one band.

| Band | Score | Required action |
| --- | --- | --- |
| Low | 1 to 6 | Accept with owner record, or monitor. |
| Medium | 8 to 12 | Treat or accept with owner record; review at the next management review. |
| High | 15 to 25 | Must be treated. Residual High requires named acceptance by Top management. |

## 4. Risk sources and treatment

### AI-specific risk sources

Every AI-related scenario considers these sources. Mark a source "not applicable" with a reason when it does not apply.

| Source | Typical scenario |
| --- | --- |
| Prompt injection (user text, page content, tool output) | Model proposes an action the customer did not authorize. |
| Hallucination of facts or actions | Model states a balance, rate or completed action that did not happen. |
| Model or provider change | Silent upgrade or re-routing changes behaviour or data handling. |
| Behaviour drift | Quality changes over time without a code change. |
| Mexican Spanish quality | Misunderstood account, amount, date or name; ambiguous references. |
| Automation bias and over-reliance | Customer approves a summary without checking the amount or recipient. |
| Data disclosure to providers | Account or personal data leaves the tenant's approved chain. |
| Training on prompts | Provider retains or trains on tenant data. |

### Treatment options

| Option | Use when |
| --- | --- |
| Avoid | Do not enable the capability, route or vendor (for example, keep the model route list empty for real tenants). |
| Reduce | Add or strengthen controls; this is the default for High risks. |
| Transfer | Contract, insurance or a tenant obligation takes part of the risk. A transfer does not remove the duty to notify. |
| Accept | Residual risk is within criteria and the named role records it (section 5). |

Each treatment names Annex A controls: ISO/IEC 27001 controls in the Statement of Applicability and ISO/IEC 42001 controls in the AI Statement of Applicability. A treatment without a control reference is incomplete.

## 5. Acceptance criteria and authority

- Every High risk is treated before it is accepted. Residual High or Medium risk is accepted only by **Top management**, by a recorded decision that names the risk ID, the residual score and the review date.
- Owners of Low risks may accept them with a record.
- Models and agents cannot accept risk, approve exceptions or sign off controls. They may draft assessments and flag gaps ([COMPLIANCE.md](../policies/COMPLIANCE.md) section 5).
- A gap found during review is added to the register as a new risk or backlog item. It is never silently accepted ([COMPLIANCE.md](../policies/COMPLIANCE.md) section 4).
- Legal interpretations in a scenario remain "pending legal confirmation" until counsel confirms them in the [legal register](LEGAL_REGISTER.md).

## 6. Review triggers

Reassess affected risks, and update the register and both Statements of Applicability, when any of these occurs:

- a new tenant, or a change in a tenant's licence type or processing region;
- a new vendor, sub-processor, channel or third-party website;
- a change of model, provider, prompt, tool, autonomy level or data class (see [AI_DEVELOPMENT.md](../policies/AI_DEVELOPMENT.md));
- a security or privacy incident, or a near miss;
- a change in applicable law or a legal-register entry;
- at least once a year, and before any production promotion.

## 7. Documented information

Each assessment records the scenario, scores, evidence links, owner, treatment, residual score, acceptance decision (if any) and review date. Records of acceptances, reviews and approvals are created by the people who perform them. This method does not pre-fill them.

## Change history

| Change | Date | Note |
| --- | --- | --- |
| Draft | 2026-10-23 | Initial draft prepared with AI assistance from repository evidence; pending human review |
