> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Linear Scrum workflow

> **IdeeoOrchestrator operating profile.** Team/project IDs and schedules below are source traceability. This import creates no new backlog, cycle, assignment or external write. Query authorized live Linear records when needed; do not infer candidate work ownership from the copied snapshot.

This is the operating guide for the Ideeo-AI team (`IDE`) in workspace `ideeo-ai`. [SCRUM.md](SCRUM.md) defines the working agreement; [METHODOLOGY.md](METHODOLOGY.md), [AI_DEVELOPMENT.md](AI_DEVELOPMENT.md), and [PRODUCTION_READINESS.md](PRODUCTION_READINESS.md) define delivery and evidence gates. Compact references under `planning/linear/` link issues, native documents and cycles. Query Linear for current configuration and remaining work.

## Team and project structure

Use one team backlog and one shared cycle schedule across these existing projects:

| Project | Scope |
| --- | --- |
| [Shared engine backlog](https://linear.app/ideeo-ai/project/payme-agent-engine-functional-user-stories-2c9e7245c1a6) | One multi-tenant AI engine; PayMe is a tenant. |
| [PayMe app, SDKs and agent accounts](https://linear.app/ideeo-ai/project/payme-app-sdks-and-agent-accounts-fa05e9bb2909) | Equipo AI's app, SDK/channel, agent-account interface, and connector experience. |

The team-wide backlog is the ordered Product Backlog. Project views are filtered component views of it. Milestones preserve roadmap groupings; their source month names do not commit an issue to a Sprint or create a contractual due date. Process/enabling work can be team-level when no product project is the correct home.

## Configuration baseline

| Setting | Required configuration |
| --- | --- |
| Timezone | America/Mexico_City. |
| Cycles | Enabled, one week, Monday start, zero cooldown, four upcoming cycles. |
| Initial schedule | Next Monday, 19 October 2026. This establishes date containers; goals and scope are finalized in planning. |
| Cycle automation | Disable automatic assignment of started/completed issues to the current cycle. Explicit selection and scope-change records maintain the Sprint forecast. |
| Estimates | Fibonacci 1, 2, 3, 5, 8; extended scale and explicit zero estimates disabled. Unestimated items contribute no assumed points. |
| New issue default | Backlog. |
| Completion automation | Do not automatically close parents/children as a substitute for each item's acceptance/evidence gate. |
| Workflow | Backlog → Ready → In Progress → In Review → Done; retain Canceled and Duplicate. |

Cycle start/end timestamps follow the team timezone and Linear's cycle boundary behavior. Use returned cycle dates as the scheduling authority and check the first generated cycle rather than assuming an offset. If API configuration is used, inspect the current schema and permissions first. Let the enabled schedule generate cycles; the public schema marks direct cycle creation deprecated.

## State meanings and transitions

| State | Required meaning |
| --- | --- |
| Backlog | Captured ideas, unapproved drafts, unresolved scope, and future work. |
| Ready | Human-approved scope satisfies the readiness gate. Selection into a cycle additionally requires a human assignee and team estimate. |
| In Progress | A human owns delivery; authorized planning/implementation and resource claims are active. |
| In Review | Implementation appears to satisfy criteria and relevant checks pass; independent review/evidence is being completed. |
| Done | The shared Definition of Done is met, integrated evidence is linked, and required claims are released. |
| Canceled | A recorded decision not to pursue this scope. |
| Duplicate | Linked to the canonical item covering the scope. |

Ready is the renamed existing Todo state. Its identity and existing associations are preserved. Add In Review as a started category. Do not turn a draft Ready simply because it received a label, estimate, assignee, or cycle.

Use blocking relations and a dated cause/next action for impediments. Keep the state that accurately reflects the work. Return an item to an earlier state if its gate stops holding. Done is independent of deployment; release approval is recorded separately.

## Issue fields and work types

- **Feature:** functional actor-based stories. Keep behavior and acceptance criteria in the story; separate implementation tasks/plans.
- **Decision:** bounded questions with an accepted evidence/deliverable and a decision owner. Use for the existing channel-scope and agent-CLABE decisions.
- **Enabler:** testing infrastructure, tooling, process, or other necessary delivery support; do not disguise it as a product user story.
- **Verification:** one independent testing/eval-evidence sub-issue per functional story; its assignee is the tester and its parent remains the delivery owner's work item.
- **Bug / Improvement:** retain the existing labels for confirmed defects and changes to existing behavior.

Use the single human assignee for accountability; use an agent delegate only when installed, available, and authorized. Agents do not replace Scrum accountability. Do not create fake human accounts or assume a developer's identity.

Follow [TESTING_OWNERSHIP.md](TESTING_OWNERSHIP.md). Set the independent tester on the Verification child rather than replacing the parent's assignee. Keep that child unestimated and select it into the same cycle as its parent during planning. New draft verification tasks remain unassigned in Backlog until the team plans them. Parent/child auto-close remains disabled, and finishing the child does not satisfy the parent's remaining gates.

Assign story points in refinement/planning. Use due dates for real external deadlines, not every cycle issue. Confirm priorities and milestone targets with the Product Owner. Preserve blocking relations, source mappings, human edits, and stable issue identifiers during process updates.

## Views

The team uses these views where the workspace supports them:

| View | Filter and purpose |
| --- | --- |
| Product Backlog | Team IDE, top-level Backlog and Ready work, all projects, manually ordered by product value. |
| Current Sprint | Team IDE, current cycle; board grouped by workflow status. Show assignee, estimate, project, and blockers. |
| Ready for Planning | Team IDE, top-level Ready work, no cycle; inspect ownership, tester availability, and parent estimates before selection. |
| Review Queue | Team IDE, top-level In Review work; prioritize finishing and independent evidence. |
| [Verification Queue](https://linear.app/ideeo-ai/view/e29796f7-233a-46b6-b321-5b93ad84bc10) | Team IDE, open Verification sub-issues across projects; grouped by tester, with each task's state visible. |

Keep canceled/duplicate work outside active delivery views. A view's filter is separate from a user's personal layout preference. Verify the saved filters and inspect returned layout settings before claiming a shared board layout was configured.

## Sprint record template

Use a native document attached to the cycle for the full record. Cycle descriptions are limited to 255 characters, so keep a short goal/planning summary there and link the document. Fill in actual decisions during the events; placeholders are not commitments.

```markdown
## Sprint Goal
<One valuable outcome, finalized by the team during planning.>

## Forecast and capacity
Availability/constraints:
Selected issue IDs and planned story points:
Assignees:
Independent testers and linked Verification sub-issues:
Initial delivery plan / links:

## Scope changes and blockers
Date, issue, addition/removal, reason, Product Owner agreement,
goal impact, external dependency owner, and next action.

## Review
Goal outcome:
Done scope and completed story points:
Demonstration, PR, test/eval evidence:
Unfinished work and reasons:
Stakeholder feedback and backlog decisions:

## Retrospective
Observed process issue:
One improvement, accountable human, and inspection date:
```

At cycle end, preserve this record and inspect rolled-over work. Only select it for the next forecast after planning review. Linear's Cycle Success gives partial credit for started work; the team's delivered points count only Done stories, without parent/subissue double counting.

## Issue templates

Create reusable team templates using the existing ticket structure in docs/workflows/SPECS_TO_BACKLOG.md:

- **Functional story:** actor/outcome, context, acceptance criteria, edge cases, non-goals, constraints, approved references, feature-specific verification, sources, and open questions. Default Backlog and Feature.
- **Decision or investigation:** bounded question, context/options, scope boundary, required evidence, decision owner/approval, completion criteria, and sources. Default Backlog and Decision.
- **Enabler:** delivery outcome, scope, acceptance criteria, non-goals, evidence, dependencies, and governing process reference. Default Backlog and Enabler.
- **Story verification:** parent story, approved criteria/scenario matrix, independent evidence, findings and rechecks, applicable AI eval results, and completion conclusion. Default Backlog and Verification; create within the parent, unassigned and unestimated.

The functional-story template instructs authors to create or reuse the Verification child through the Story verification template. Check for an existing child before adding one. Template instructions do not themselves create a child or assign a tester.

Keep the generic engineering checklist in the repository PR template and linked policies. Repeating it in every functional story makes product requirements harder to maintain. Do not prefill points, due dates, assignees, cycles, or readiness approval in these templates.

## Native documentation and synchronization

The repository is canonical for the versioned process policies. Publish full editable copies in the Linear team documentation and link the common index from both project overviews. Keep the original architecture, plan, and meeting documents available as source evidence.

For a process change, update the canonical repository file and the corresponding native Linear document in the same authorized change. Record the local file path, content hash, Linear ID/URL, and publication date in `planning/linear/documents.json`. Replace local document links with the corresponding native links during publication. Flag an out-of-date mirror explicitly until synchronized; do not maintain contradictory operational rules.

Operational issue state, ownership, cycle membership, and estimates remain authoritative in Linear. Local publication mappings are audit/resume records, not a second live backlog. Never store API keys or sensitive test data in these files.

## Platform boundary

Linear stores plans, assignments, decisions, and evidence links. The actual code host and CI must run tests/evals and enforce protected integration/release gates. A Linear checkbox, status, webhook, or PR-open automation cannot prove the Definition of Done.

Where an API or MCP capability is missing, record the exact unapplied setting and use an authorized UI/API path. Verify mutations by reading the resulting object. After an uncertain write, look for the intended object before retrying to avoid duplicate cycles, templates, or views.

## References

- [Cycles](https://linear.app/docs/use-cycles)
- [Issue properties and estimates](https://linear.app/docs/issue-property)
- [Human assignment and agent delegation](https://linear.app/docs/assigning-issues)
- [Cycle graph](https://linear.app/docs/cycle-graph)
- [GraphQL authentication and error handling](https://linear.app/developers/graphql)
