> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Scrum working agreement

Adopted on 18 October 2026 for Equipo AI. This agreement connects weekly Scrum delivery to the engineering controls in [METHODOLOGY.md](METHODOLOGY.md), the AI workflow in [AI_DEVELOPMENT.md](AI_DEVELOPMENT.md), and the evidence gates in [PRODUCTION_READINESS.md](PRODUCTION_READINESS.md). [LINEAR_WORKFLOW.md](LINEAR_WORKFLOW.md) describes the corresponding Linear configuration.

## Product scope and accountability

Equipo AI delivers one shared AI engine. PayMe is a tenant. App, SDK/channel, and agent-account interfaces are separate delivery components tracked alongside the engine; this repository contains the AI work and shared process documentation. PayMe's banking core, ledger, issuance, legal work, and infrastructure administration retain their agreed external ownership.

The team uses one Product Goal and one ordered Product Backlog across its Linear projects. The Product Owner owns value and ordering; the Developers select and plan Sprint work and uphold quality; the Scrum Master supports Scrum and removes impediments. Each Sprint produces a usable Increment meeting the Definition of Done. The Sprint Goal, selected items, and delivery plan form the Sprint Backlog. These accountabilities belong to humans. Coding agents support them.

The initial Product Goal is to deliver a usable shared assistant and the Equipo AI product interfaces, with dependable permission and payment boundaries. The Product Owner refines this goal and records any change before planning against it.

| Accountability | Working agreement |
| --- | --- |
| Product Owner | One named human owns the Product Goal, backlog ordering, product decisions, and acceptance criteria approval. |
| Developers | Human contributors own estimates, Sprint selection, implementation decisions within approved contracts, testing, reviews, and the Increment. |
| Scrum Master | One named human facilitates the events, tracks impediments, and helps improve the process. This can be a part-time responsibility. |
| Issue assignee | One human coordinates each item's delivery and evidence. This does not prevent collaboration. |
| Verification assignee | A different human owns the parent story's verification sub-issue, acceptance checks, and test/eval evidence. This responsibility belongs within the Developers. |
| AI agent | May draft, implement, test, review, or summarize within authorized scope. It cannot approve its own scope, exceptions, or production release. |

The team must record the actual names and availability at its first planning session. Do not infer Scrum appointments from a Linear admin flag or assign every story to the only registered member. Invite additional team members through the team's normal account administration process.

## Weekly cadence

The initial cadence is one-week Sprints, Monday to the following Monday, with no cooldown. Working events use America/Mexico_City. Friday review and retrospective inspect the week's result; the configured cycle closes at the next Monday boundary. Work completed after the review remains visible in the cycle record.

| Event | Cadence and starting timebox | Required result |
| --- | --- | --- |
| Sprint Planning | Monday after the 09:30 PayMe coordination meeting; 45 minutes | One Sprint Goal, realistic selected scope, human owners, estimates, and initial delivery plan. |
| Daily Scrum | Every working day at a consistent time; 15 minutes | Developers inspect progress toward the goal and adapt the next day's plan. Update Linear before the event. |
| Backlog refinement | Ongoing; initially reserve 30 minutes midweek | Clarify the next small slice, resolve decisions, split oversized work, and prepare estimates. |
| Sprint Review | Friday; 30 minutes | Inspect the usable Increment with relevant stakeholders, compare outcomes with the goal, and adjust the backlog. |
| Sprint Retrospective | Friday after the review; 30 minutes | Inspect how the team worked and select one concrete improvement with an owner. |
| PayMe coordination | Monday and Thursday at 09:30; 30 minutes, per the meeting agreement | Confirm external dependencies and decisions. Record resulting scope changes and blockers. |

These durations and working days are team choices. Reassess after three Sprints. PayMe coordination and written updates support the events; they do not replace the Developers' Daily Scrum, Sprint Review, or retrospective. Review and retrospective may be adjacent calendar slots but have distinct purposes and records. No calendar invitations are created by this agreement.

## Backlog and Sprint Planning

Maintain one ordered team backlog across the engine and product-component projects. Projects and milestones describe outcomes and roadmap groupings; cycles describe the short delivery period. Source month labels remain planning context until an owner confirms actual target dates.

At planning:

1. Inspect the last Increment, unfinished work, dependencies, team availability, and incoming urgent work.
2. Agree on a valuable, coherent Sprint Goal. Record why the selected outcome matters.
3. Select only items meeting the readiness gate below. Include the testing, review, documentation, and integration work needed for Done.
4. Assign the parent story's delivery owner and a different human tester to its verification sub-issue; select both into the same cycle. Agree on the parent estimate including verification. The Developers own the forecast.
5. Record the implementation plan or small subissues separately from the functional story. Reserve time for reviews, integration, and operational support.
6. Save the planned scope and points in the Sprint record. Keep later scope changes explicit.

Do not schedule the entire roadmap into future Sprints. Upcoming cycles may exist as empty date containers. An empty cycle has no Sprint commitment until the team finalizes its goal and selection. Start with available capacity and a small coherent slice; use actual completed work to improve forecasts as history develops.

## Readiness gate

A functional story describes the correct actor and observable behavior using the agreed wording, such as “Me, the user, have to be able to…” or “I, the system, have to be able to…”. Acceptance criteria cover meaningful boundaries and failures without prescribing implementation.

Before moving an item to Ready:

- A human approved its actual scope and criteria; material product decisions are resolved.
- Dependencies, external contracts, non-goals, and constraints are understood.
- The item is small enough to complete with verification inside a Sprint.
- Expected evidence is identifiable, including AI behavior/eval impact where applicable.
- A significant architecture decision has an approved ADR or a defined approval step before coding.

Before selecting Ready work into a Sprint, add its human assignee and team estimate. A bounded investigation can be ready with a question, scope/time boundary, expected deliverable, and decision owner. It does not imply implementation approval for the eventual answer.

Each functional story also has an unestimated Verification sub-issue. Name its independent tester before selection. Apply [TESTING_OWNERSHIP.md](TESTING_OWNERSHIP.md); a pending product decision keeps affected verification unready. The implementer retains TDD responsibility and the tester plans/checks evidence within the same Sprint.

## Estimation

Use Fibonacci story points: 1, 2, 3, 5, 8. Points express relative total work, complexity, and uncertainty required to reach Done, including tests, eval preparation, review, and integration. They are not hours or an individual performance target. Story points are the team's estimation practice; Scrum does not mandate them.

Compare items against a few completed reference stories. Discuss differing estimates until the team understands the uncertainty. Split an item larger than 8 into independently useful slices; use a bounded investigation when the uncertainty prevents a meaningful estimate. AI may suggest factors and missing cases, but the Developers decide the number.

Leave unrefined work unestimated. Configure unestimated work to contribute no assumed point value to forecasts. Do not assign points from the number of eval cases, expected model tokens, or an AI's implementation-speed claim. Evals measure behavior and quality. This agreement supersedes the work plan's suggestion to use evals instead of story points.

When subissues describe a story's implementation plan, estimate the parent story and avoid adding their points again. Separately deliverable work can be split into separate stories before selection. Do not inflate estimates after completion to match time spent.

## During the Sprint

Protect the Sprint Goal and the Definition of Done. Developers adapt the plan as they learn. Renegotiate meaningful scope changes with the Product Owner, record additions/removals and their effect on the goal, and keep urgent incidents visible. Only the Product Owner cancels a Sprint when its goal becomes obsolete.

Use blocking relationships for actual prerequisites and a dated comment for the cause, external owner, next action, and follow-up. An issue can remain In Progress or In Review while blocked; do not hide it in a generic status. Reprioritize available work and escalate impediments through the Scrum Master.

Keep work in progress limited: initially each developer leads at most one implementation item at a time, with shared attention to reviews and blockers. Authorized agent concurrency must obey file claims, shared-contract ownership, database isolation, ports, and external-resource limits in docs/policies/METHODOLOGY.md. More agents do not create unlimited team capacity.

## Definition of Done

For an implementation story, all of the following must hold:

- Approved acceptance criteria, edge cases, constraints, and affected invariants are satisfied.
- The linked Verification sub-issue is complete with independent testing evidence for the current revision; applicable blocking findings are resolved. The parent delivery owner remains responsible for the full story.
- Relevant automated checks executed successfully against the recorded revision; test expectations were reviewed independently of implementation.
- Critical-control changes have the deliberate-fault/mutation or equivalent defect-detection evidence required by docs/policies/PRODUCTION_READINESS.md and human review of affected controls.
- Applicable AI eval gates in docs/policies/AI_DEVELOPMENT.md pass, with no unresolved blocking case or unapproved regression. Changes with no AI behavior impact record why the eval module is not applicable.
- Primary automated review, independent cross-model review, and appropriate integration/E2E evidence are recorded; blocking findings are resolved.
- Documentation, contracts, accepted ADRs, monitoring, and recovery instructions affected by the change are current.
- The combined result is verified and merged into the configured integration branch, with the PR and evidence linked from Linear.
- Resource claims are released and remaining operational obligations are recorded.

docs/policies/METHODOLOGY.md and docs/policies/PRODUCTION_READINESS.md define how a human exception is recorded. Missing evidence never becomes a pass. Work with an exception that means it does not satisfy the shared Definition of Done is recorded separately and receives no delivered-story credit until the gap closes. A risk acceptance cannot weaken an approved permission, tenant, or payment invariant.

Research/decision items complete when their agreed evidence and decision/deliverable are accepted and linked. Any code they produce follows the applicable code gates. They do not demonstrate that the resulting feature exists.

Done means usable and integrated. Production promotion remains a separate human decision for an exact artifact and configuration, with rollout and recovery evidence. A Sprint boundary, opened PR, demo, passing local test, or AI completion message cannot establish Done.

## Review, retrospective, and reporting

At review, demonstrate the actual integrated result and inspect progress toward the Product Goal. Discuss unresolved gaps as unfinished work. Capture stakeholder feedback as proposed backlog changes; do not silently rewrite completed acceptance criteria.

At retrospective, inspect impediments, handoffs, escaped defects, flakes, review findings, AI rework, and evidence quality. Choose one practical improvement and inspect its effect next week. Record operationally sensitive information only in the appropriate restricted destination.

The Sprint record contains: goal and outcome; planned/completed scope and points; changes; unfinished items and reasons; demo/PR/evidence links; decisions; and the improvement action. Count only Done stories in delivered story points. Track research/enabler throughput separately where useful. Do not double count parent/subissue estimates or award partial points for started work.

Linear's Cycle Success includes partial credit for started issues; use completed points and actual goal outcomes for team reporting. Review automatic rollover during the next planning session rather than treating it as renewed commitment. Keep external due dates separate from Sprint forecasts.

Inspect a small set of measures: goal outcomes, completed points, lead/cycle time, blocked time, escaped defects, flaky checks, and AI quality/cost/latency by relevant scenario. Use trends to adapt capacity and quality; do not rank individual developers or compare velocity between teams.

## References and relationship to the original plan

The [Scrum Guide](https://scrumguides.org/scrum-guide.html) defines the framework. This document supplies the team's cadence and engineering practices. [Linear cycles](https://linear.app/docs/use-cycles) and the [cycle graph](https://linear.app/docs/cycle-graph) explain tool behavior.

The original work plan remains historical product context in Linear and Git history. This agreement governs current delivery practice wherever its Scrum cadence, Daily Scrum, separate review/retrospective, estimation, or quality gates differ. It does not revise product promises or establish new release commitments.
