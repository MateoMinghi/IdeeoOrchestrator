> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# AI development with TDD and evals

This policy governs how Equipo AI uses coding agents and verifies the behavior of its shared AI engine. It extends [METHODOLOGY.md](METHODOLOGY.md) and [PRODUCTION_READINESS.md](PRODUCTION_READINESS.md); [SCRUM.md](SCRUM.md) defines when work is ready and Done. PayMe is a tenant of the one shared engine. Tenant configuration needs appropriate coverage without duplicating the engine or its backlog.

## Human and AI responsibilities throughout delivery

| Activity | AI contribution | Human accountability and evidence |
| --- | --- | --- |
| Discovery and refinement | Read sources, extract actors and behavior, identify contradictions, propose slices and acceptance scenarios. | Product Owner approves scope and decisions; preserve source-to-issue traceability through docs/workflows/SPECS_TO_BACKLOG.md. |
| Planning | Suggest dependencies, missing test cases, implementation options, and uncertainty. | Developers estimate and select the Sprint forecast; approve non-trivial plans and consequential ADRs. |
| Implementation | Implement authorized scope on the appropriate branch using approved contracts and the [checkout policy](METHODOLOGY.md#6-pickup-ownership-and-worktrees). | Human issue owner coordinates delivery; file/resource claims and permissions remain binding. |
| Testing and evals | Create candidate tests/cases, run authorized checks, collect failures and reproducible evidence. | Humans approve behavioral expectations and consequential thresholds; independent reviewers challenge both code and tests. |
| Review | Perform primary automated review and independent cross-model adversarial review in separate sessions. | Reviewers inspect a recorded revision; humans review critical controls and resolve accepted risk. |
| Integration and release | Remediate, collect combined-result evidence, draft release notes and recovery steps. | Integration stays within authorization and enforced gates; humans approve the exact production candidate and operations. |
| Review and improvement | Summarize observed outcomes, cluster failures, propose backlog updates and regression cases. | Team inspects outcomes and decides improvements; agent summaries link to actual evidence. |

Claude Code remains the default implementer/primary automated reviewer in the existing methodology; Codex can implement or provide the independent review. If Codex implements, use another model for cross-model review. Separate sessions preserve review independence. These roles do not themselves authorize spawning agents or expanding tool access. If a required reviewer or tool is unavailable, record the gap and follow the exception policy; do not impersonate it.

## Per-story delivery loop

Use [TESTING_OWNERSHIP.md](TESTING_OWNERSHIP.md) to name the parent delivery owner and an independent tester on the Verification sub-issue during planning. The implementer writes/runs developer tests; the tester independently challenges acceptance scenarios, test expectations, and applicable eval evidence. This assignment complements the required automated and cross-model reviews and human review of critical controls.

1. Read the approved story, governing specification, accepted ADRs, and relevant existing patterns. Classify risk and identify affected invariants.
2. Claim work and shared resources, select the checkout under the [checkout policy](METHODOLOGY.md#6-pickup-ownership-and-worktrees), and discuss the approach in the existing issue or conversation as needed.
3. Write the scenario matrix from approved behavior before accepting implementation-derived expectations. Include meaningful success, boundary, failure, permission, and side-effect cases.
4. For deterministic behavior, follow the TDD loop below. For model behavior, define the eval contract before changing prompts, routing, or tools.
5. Implement the smallest authorized change, then integrate through the real affected boundaries. Preserve existing regression assertions.
6. Run applicable checks/evals and obtain the required independent reviews. Remediate and refresh invalidated evidence.
7. Verify the combined integration result and record the PR, checks, eval report, decisions, and remaining obligations in Linear.
8. Apply the shared Definition of Done. Prepare a separate human-approved release record before any production promotion.

## TDD for deterministic behavior

For a small observable behavior, write a focused test first, run it, and observe failure for the intended missing behavior. A syntax error, missing dependency, or wrong environment does not establish the behavioral red step. Implement the minimum needed to pass, then refactor while retaining the assertions. Repeat in small steps.

For a bug, preserve a regression that reproduces the faulty behavior and demonstrates the fix. Prefer the lowest meaningful layer, with integration/contract/E2E evidence for actual boundaries. Avoid asserting private implementation structure when the product contract concerns an observable result.

Use controlled time and randomness, isolated fixtures, and meaningful output/state/effect assertions. Verify that critical tests detect a deliberately broken control in a disposable environment as required by docs/policies/PRODUCTION_READINESS.md. Do not weaken a test to match a convenient implementation or describe unexecuted tests as passing.

Discovery work can begin with a bounded experiment and explicit question when the intended behavior is unknown. Record why test-first is not yet meaningful, establish the contract through the required human decision, and add meaningful regression coverage before integrating resulting production behavior. Documentation-only changes use applicable document review rather than invented runtime tests.

## Deterministic controls and probabilistic behavior

| Area | Required evidence |
| --- | --- |
| Permissions, tenant separation, budget/amount boundaries, state transitions, idempotency, and allowed side effects | Deterministic tests and affected integration evidence enforce approved invariants. A model or judge cannot grant authority. |
| Intent understanding, clarification, tool choice, task completion, grounded answers, and recovery from provider behavior | Task-specific evals assess outputs and traces under representative scenarios. |
| App/SDK/native host/channel handoff | Contract and user-flow evidence checks observable host behavior; use model evals as well when the change affects interpretation or routing. |
| Operational use | Observe redacted traces, failures, latency, and cost against approved budgets, with detection and recovery plans. |

A favorable average cannot compensate for a forbidden financial action or tenant leak. Evals complement the guards around execution. Success requires the intended final state and permitted effects, not merely a convincing response or a matching tool-call name.

## Eval contract

Before changing behavior, identify the relevant existing suite or propose one with these fields:

| Field | Required content |
| --- | --- |
| Behavior and scope | Approved requirement, actor, tenant/channel/configuration scope, and explicit exclusions. |
| Cases | Inputs, identity/authority, initial state, expected outcome, acceptable alternatives, forbidden effects, and relevant trace assertions. |
| Dataset revision | Versioned development, regression, and held-out cases with provenance, authorized data handling, and leakage controls. |
| Evaluation method | Deterministic assertions where possible; documented rubric and calibrated model/human judgement where needed. |
| Run configuration | Source revision, model identifier/version where available, prompt/tool/schema/policy revisions, provider/runtime configuration, and judge/rubric version. |
| Execution design | Number of repeats, seeds where supported, representative variations, applicable uncertainty reporting, environment, and external-call budget. |
| Gates | Per-scenario or per-severity thresholds, critical hard failures, acceptable regression budget, and approver. |
| Results | Case-level outcomes, failed traces, aggregate/slice results, latency/cost, comparison baseline, and reproducible report links. |

The policy uses task-specific evaluations, withheld cases, repeated observations where variability matters, and human-calibrated graders. Derive the actual acceptance rules from approved product contracts and observed failure costs. The Product Owner and responsible engineering human approve consequential thresholds before the run used for acceptance. Do not invent a universal success percentage.

## Scenario selection for this engine

Maintain a shared regression suite plus relevant tenant/configuration cases. Select the affected slices for each change:

- Supported and unsupported requests, incomplete information, ambiguity, corrections, and cancellation.
- Tool availability/selection, schema-conformant arguments, rejected arguments, tool errors, uncertain outcomes, and bounded retries.
- Explicit approval, revoked/expired/changed authority, approved autonomy rules, amount boundaries, and denied side effects.
- Cross-tenant resource references, conversation/task separation, and configuration-dependent tool availability.
- Duplicate/replayed requests, concurrent tasks, interrupted work, partial completion, and reconciliation.
- App native handoff versus WhatsApp protected links, including final payment authority and user-visible status.
- Untrusted tool/page/message content, prompt-injection attempts, and unsupported claims of successful execution.
- Long conversations, relevant memory changes, supported language variation, and provider availability where they affect the requirement.
- Approved latency, resource, and cost budgets, including expensive failure loops.

These categories identify questions; the approved architecture/contracts establish exact outcomes. An unresolved rule, such as threshold equality or channel scope, stays a visible product decision rather than an eval author's guess.

## Dataset and grader quality

Keep held-out cases out of routine prompt tuning. Review generated cases for realism, correct expected behavior, duplication, and missing hard negatives. Use synthetic or appropriately authorized and redacted data; do not copy sensitive production transcripts into repositories or unrestricted artifacts.

Where a judge is appropriate, prefer a specific rubric or pairwise/classification task over an ungrounded opinion. Calibrate against human-labelled cases, inspect disagreements, and test position/wording sensitivity. Record the judge version. Do not rely solely on the same model to generate answers, expected outcomes, and acceptance scores. A judge's pass cannot override a deterministic forbidden-effect assertion.

Preserve failures and failing seeds. Add confirmed production failures to the regression suite after establishing intended behavior. Do not improve the headline score by dropping difficult cases, changing the rubric after seeing a failure, or repeatedly rerunning until a pass appears.

## Change impact and execution gates

| Change | Minimum eval consideration |
| --- | --- |
| Prompt, model, orchestration, tool selection, retrieval, or memory behavior | Affected behavior slices and shared regressions for plausible interactions. Model changes require broader representative comparison. |
| Tool schema, bank adapter, permission/policy, payment, or tenant configuration | Contract/invariant tests plus task traces exercising permitted and denied behavior for affected configurations. |
| App/SDK/channel routing | Applicable channel/host contracts and model cases when interpretation, authority, or task handoff changes. |
| Documentation or contained change with no model/runtime effect | Written impact rationale; do not fabricate an eval run. |

Run fast deterministic and stable smoke gates for each relevant PR, then the affected eval suites before integration. Run the agreed broader suite for release candidates and significant model/prompt/provider changes. Expensive, paid, or external-effect runs follow their authorized budgets and environments. Record unavailable checks as missing; a local documentation policy does not implement CI.

Block integration on unresolved critical permission, tenant, or unauthorized-effect failures. For other quality regressions, apply the previously approved gate and baseline rules. Summarize results by affected tenant/channel/task and severity so a large successful slice cannot hide a failing small slice. Where outcomes vary, report run counts and uncertainty rather than presenting one favorable run as dependable behavior.

## Evidence and production learning

Use the PR template's AI/eval section. Link case-level reports and redacted traces from the implementation story. Reports identify code/configuration revisions, dataset/grader versions, exact commands/procedures, environment, results, and reviewer decisions. Record which evidence remains valid after remediation.

The release record identifies the effective model/prompt/tool/configuration bundle as well as the deployable artifact. A later provider/model/configuration change can invalidate previous evidence without a code diff. Apply the release approval, observation, stop, and recovery rules to its actual impact.

During operation, track task outcomes, forbidden-effect attempts, unexpected tool use, hallucinated completion, escalation, cost, and latency for relevant slices. Humans inspect representative and failure traces with appropriate access controls. Use verified findings to update requirements, tests/evals, monitoring, and the backlog.

## References

- [Test Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html) describes the test-first feedback loop.
- [OpenAI evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices) provides general evaluation guidance. This policy does not select or require a vendor evaluation platform.
- [PRODUCTION_READINESS.md](PRODUCTION_READINESS.md) governs risk, test quality, security, real integrations, concurrency, migrations, CI, and controlled release.
