> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Implementation and independent testing ownership

Each functional story has a delivery owner and an independently assigned verification sub-issue. This agreement applies to the shared AI engine and Equipo AI's app, SDK/channel, and agent-account interfaces. It extends [SCRUM.md](SCRUM.md), [AI_DEVELOPMENT.md](AI_DEVELOPMENT.md), and [PRODUCTION_READINESS.md](PRODUCTION_READINESS.md).

## Responsibilities

| Work item | Assignee and responsibility |
| --- | --- |
| Parent functional story | The implementer/delivery owner coordinates implementation, developer tests, remediation, integration, and the complete Definition of Done. |
| Verification sub-issue | A different human tester owns independent acceptance checks, review of applicable test/eval evidence, findings, and the verification result. |

Testing ownership is a responsibility within the Developers of the Scrum Team. It does not create a separate Scrum accountability or a later testing phase. A developer can test another developer's story. The tester must be independent of the implementation they verify; any inability to obtain that independence is a visible planning impediment governed by the existing exception policy.

The implementer still writes and runs meaningful tests through TDD and supplies appropriate integration and eval evidence. The tester challenges both the resulting behavior and the expectations/assertions used to verify it. Coding or evaluation agents may assist within authorization; the named human remains accountable. A passing agent report does not replace required human review of critical controls or the existing primary/cross-model review layers.

## Planning and fields

Maintain one `Verification` sub-issue per functional story, named `Verify acceptance criteria and relevant evals — <parent ID>`. Reference the live parent story as the authority for scope, acceptance criteria, edge cases, constraints, and unresolved decisions. Refine a scenario matrix from its approved criteria before testing. Do not copy criteria into a competing contract or invent missing banking/product rules.

During Sprint Planning, name the parent delivery owner and the independent tester, include both implementation and verification capacity, and select the parent and child into the same cycle. A verification task can exist unassigned in Backlog before planning. Creating it does not approve the parent's requirements or make either item Ready. The initial publication is explicitly unassigned.

Use the parent's team, project, and applicable milestone. Keep the child unestimated; the parent's story points include all testing, eval preparation, review, and integration effort. Report completed parent-story points and verification throughput separately. Do not count the child as another delivered functional story or add its work to points a second time.

The `Verification Queue` shows open verification sub-issues with their own assignee and status. Product Backlog, Ready for Planning, and the parent Review Queue show top-level work; the Current Sprint view can show both parent and verification work so the team's plan remains visible.

Open the [Verification Queue](https://linear.app/ideeo-ai/view/e29796f7-233a-46b6-b321-5b93ad84bc10) to plan and track the testing work. Publication mappings are in `planning/linear/issues.json`. Current assignments and acceptance results live in Linear.

## Workflow and completion

1. **Backlog:** verification work is captured; parent scope or prerequisites may still be unresolved.
2. **Ready:** the approved scope and expected evidence are clear. Set human owners and the same cycle before Sprint selection.
3. **In Progress:** the tester prepares cases early and performs independent checks as usable changes become available. Testing need not wait for the parent to be Done.
4. **In Review:** evidence or finding disposition is awaiting its required review. Use the actual work state and dated blocker comments; do not misrepresent a blocked check as passed.
5. **Done:** the verification report maps approved criteria/invariants to scenarios, expected and observed results, relevant revision/environment, and evidence. Applicable eval results are reviewed; blocking defects are remediated and rechecked; required critical-control human review is linked. Record justified N/A items and any approved exceptions explicitly. Missing applicable evidence remains missing.

The parent remains In Progress or In Review as appropriate until verification and every other shared Definition of Done gate are satisfied. Completing the child alone does not complete the story or approve production. A verification-only deliverable does not need a fictitious code merge; any test/code changes it produces follow the actual PR/integration gates. If a later revision invalidates results, reopen the relevant verification work and refresh its evidence before declaring the parent Done.

Keep automatic parent/child closure disabled. Do not add a circular dependency requiring the parent to be Done before its verification can start. The parent-child relationship and the documented completion gate express the required coordination. Linear's statuses and relationships do not themselves enforce CI or evidence quality.

## Findings and evidence

The verification report links the implementation PR, tested revision/build/configuration, environment, exact procedures, scenario results, relevant test/eval reports, and findings with their disposition. For AI behavior, use the dataset/model/prompt/tool/policy/grader revisions and case-level gates defined in docs/policies/AI_DEVELOPMENT.md. For UI or SDK work, include applicable observable flows and host/channel boundaries; explain when model evals do not apply.

Keep fixes needed to satisfy the approved story in its scope and link defect records when separate tracking is useful. Material behavior changes still require approval. Unrelated findings become separate Backlog work. Do not grant permission, payment, or tenant-invariant exceptions to obtain a green result.

Research/decision records complete through their accepted evidence and decision deliverables. They do not automatically receive software-testing sub-issues. Later implementation stories receive verification work when published. Before adding a child, inspect existing children and publication mappings to avoid duplicates.

The generic test/review checklist remains in the PR template and governing policies. The child records the story-specific matrix, execution, and independent conclusion.
