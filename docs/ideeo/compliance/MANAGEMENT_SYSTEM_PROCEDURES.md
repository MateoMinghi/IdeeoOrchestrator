> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Management system procedures

Status: **Draft. Pending approval by Top management. Not certification evidence.**

Standard references: ISO/IEC 27001:2022 clauses 7, 8.1, 9 and 10; ISO/IEC 42001:2023 clauses 7, 8.1, 9 and 10.

## 7.1 Resources

Top management allocates people, tools, environments and budget to the objectives in [Management system policy](MANAGEMENT_SYSTEM_POLICY.md) section 4. Resource requests and gaps are recorded as backlog items or risk register entries, and reviewed at management review (section 9.3).

## 7.2 Competence

Competence requirements are defined per role in [Management system policy](MANAGEMENT_SYSTEM_POLICY.md) section 3. Evidence of competence is recorded in the record below by the person's line role, not pre-filled.

| Role | Competence required | Evidence (reference) | Date | Assessed by |
| --- | --- | --- | --- | --- |

## 7.3 Awareness

Everyone who works on the engine must know: the policy and scope; the engine principles in the policy; that AI assistants cannot approve; how to report an incident ([Incident and continuity](INCIDENT_AND_CONTINUITY.md)); and the rule against real data in the repository. Awareness is provided at onboarding and when these documents change. Records of awareness are kept by the management system owner.

## 7.4 Communication

| What | To whom | When | By whom |
| --- | --- | --- | --- |
| Policy and scope | All contributors and tenant contacts | On approval and each revision | Management system owner |
| Security or privacy incident | Affected tenant (per contract), Top management, Privacy lead | Immediately, per incident procedure | Engineering lead |
| Legal register change | Engineering lead, Compliance owner, Top management | On change, before affected release | Compliance owner |
| Supplier change (new vendor or region) | Compliance owner, Privacy lead, tenant as required by contract | Before any code path can send tenant data | Engineering lead |
| Objective status | Top management | At each management review | Management system owner |
| Audit results and nonconformities | Management system owner, owners of affected areas, Top management | On completion of each audit | Internal auditor |
| External communication about compliance status | Tenants, regulators (via tenant), certification body | Only when approved by Top management and counsel | Top management |

## 7.5 Control of documented information

| Aspect | Procedure |
| --- | --- |
| Storage | Documents live in the Git repository under `docs/compliance/` and related policy folders. |
| Changes | Changes go through pull requests and the branch rules in [METHODOLOGY.md](../policies/METHODOLOGY.md) section 10. Compliance reviewers check the stated compliance impact. |
| Approval | Each document records approval in its change history. A draft is not effective until its approver records approval. |
| Mirrors | Linear mirrors are maintained per [documents.json](../reference/SOURCE_REFERENCES.md#source-1ae59a1ede6a). A mirror that is out of date is marked stale and reported. |
| Records | Records (audit results, reviews, training, risk acceptances) are created only by the people who perform them. They are stored in the repository or the linked system of record and never pre-filled. |
| Retention | Document history is retained by Git. Retention periods for other records are set by the management system owner and recorded in [Security policies](SECURITY_POLICIES.md). |
| Access | Write access follows repository permissions. Branch protection and code-owner rules are not yet evidenced (see [Risk register](RISK_REGISTER.md)); a human approves merges. |
| Credentials and paths | No credentials, personal data or workstation-specific paths in documents. |

## 8.1 Operational planning and control

Operational control of delivery is set out in these documents, which are linked and not repeated here:

- [METHODOLOGY.md](../policies/METHODOLOGY.md): delivery process, roles, branching and review.
- [PRODUCTION_READINESS.md](../policies/PRODUCTION_READINESS.md): verification classes and release gates.
- [AI_DEVELOPMENT.md](../policies/AI_DEVELOPMENT.md): TDD, evaluations and AI change gates.

Changes to processes that affect the management system are subject to the change rules in 7.5.

## 9.1 Monitoring and measurement

| What | Method | Frequency | Owner |
| --- | --- | --- | --- |
| Objective measures ([policy](MANAGEMENT_SYSTEM_POLICY.md) section 4) | Measure as defined for each objective | Each management review | Management system owner |
| CI security checks (lint, type checks, tests, static security rules, dependency and secret scanning once enabled) | CI results on each pull request | Each change | Engineering lead |
| Compliance impact statements | Review of pull requests in regulated areas | Each change | Engineering lead |
| Legal register status | Review of entries and open questions | Each release and at least annually | Compliance owner |
| Supplier register | Review against the code and configuration | Each release and at least annually | Compliance owner |
| AI behaviour | Evaluation reports under the eval contract ([AI_DEVELOPMENT.md](../policies/AI_DEVELOPMENT.md)) | Each AI change and each release | Engineering lead |
| Access to authority audit records | Review of audit trail integrity and gaps | Each release and at least quarterly once in production | Engineering lead |
| Incidents and near misses | Incident log | As they occur and at management review | Management system owner |

## 9.2 Internal audit programme

- The programme covers every clause and each in-scope component at least once per year.
- The programme is a plan, not evidence. Audit results are recorded in the audit records below.
- Auditors must be independent of the work they audit. A developer may not audit their own change. Independence follows the rules in [TESTING_OWNERSHIP.md](../policies/TESTING_OWNERSHIP.md).
- The management system owner (to be appointed) maintains the plan and reports results to Top management.

Audit plan template (empty; to be completed by the management system owner):

| Audit ID | Scope (clauses, components) | Auditor (independent) | Planned period | Criteria | Status |
| --- | --- | --- | --- | --- | --- |

## 9.3 Management review

Top management reviews the management system at least annually and when significant change occurs.

Inputs:

- Status of actions from previous management reviews.
- Changes in external and internal issues, including legal register changes and supplier changes.
- Feedback from interested parties, including tenant feedback and complaints.
- Performance: objective measures, monitoring results and eval results.
- Nonconformities and corrective actions (section 10.2).
- Internal audit results.
- Risk assessment results and status of risk treatment plans.
- Opportunities for continual improvement.

Outputs:

- Decisions on continual improvement opportunities.
- Changes needed to the management system, including scope, policy and objectives.
- Resource needs.

Minutes template (empty; created by the people who hold the review):

| Date | Attendees (roles) | Inputs reviewed | Decisions | Actions (owner, due) |
| --- | --- | --- | --- | --- |

## 10.1 Continual improvement

Improvement opportunities come from monitoring, audits, incidents, evaluations, reviews and staff proposals. They are logged as backlog items, risk register entries or corrective actions, and reviewed at management review.

## 10.2 Nonconformity and corrective action

1. Record the nonconformity: what happened, where, and the requirement affected.
2. Contain immediately where needed. Security or privacy incidents follow [Incident and continuity](INCIDENT_AND_CONTINUITY.md).
3. Find the root cause.
4. Decide the action, its owner and the verification criterion.
5. Implement through the normal delivery process.
6. Verify the effectiveness and close the entry only after verification by a different person than the implementer.
7. Report the status at management review.

Corrective action register (empty):

| ID | Date found | Source (audit, incident, monitoring, review) | Nonconformity | Requirement affected | Root cause | Action | Owner | Verification | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Change history

| Version | Date | Change |
| --- | --- | --- |
| Draft | 2026-10-23 | Initial draft prepared with AI assistance from repository evidence; pending human review |
