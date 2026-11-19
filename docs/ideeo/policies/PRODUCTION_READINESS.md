> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Production readiness: testing, evidence, and controlled delivery

The shared Definition of Done is in [SCRUM.md](SCRUM.md). [AI_DEVELOPMENT.md](AI_DEVELOPMENT.md) adds TDD, deterministic execution invariants, model eval contracts, dataset/grader quality, and change-specific eval gates. Apply those modules alongside this policy whenever AI behavior or its authority boundary is affected.

This policy complements [METHODOLOGY.md](METHODOLOGY.md). Use the [PR template](../reference/SOURCE_REFERENCES.md#source-b2496e80299b) for change-specific evidence. Keep tickets focused on the WHAT: approved behavior, edge cases, non-goals, constraints, patterns, and verification.

The objective is justified confidence that a change meets its contract, preserves critical system properties, and can be operated and recovered safely. Testing reduces uncertainty; it cannot guarantee that every production scenario is covered. The team retains responsibility for test expectations, review findings, accepted risk, and rollout decisions regardless of who writes the code.

These files establish policy and templates. They do not configure CI, deploy infrastructure, install security tools, or certify an application that has not been tested.

## 1. Three separate gates

| Gate | Question | Evidence location |
| --- | --- | --- |
| Ticket readiness | Is the intended behavior clear and human-approved? | Ticket and governing specifications/ADRs |
| Integration readiness | Does this change satisfy its contract without unacceptable regressions? | PR, reviews, and CI evidence against the combined result |
| Release readiness | Can this particular artifact/configuration be promoted, observed, and recovered? | Human-approved release record and rollout evidence |

A passing PR is not automatically an approved production release. Several individually passing changes may interact. A release candidate must be validated as a combined deployable result.

## 2. Classify impact before selecting additional tests

Choose the highest applicable class and explain the classification in the PR. File count and diff size do not determine impact.

| Class | Typical change | Additional verification emphasis |
| --- | --- | --- |
| Routine | Existing-pattern feature with contained, reversible effects | Approved criteria, targeted regression, integration/E2E behavior, baseline security and operational review |
| Elevated | Public endpoint, shared contract, background job, external integration, significant query or configuration change | Relevant negative security, concurrency, resource-limit, compatibility, and dependency-failure tests |
| Critical | Authentication/authorization, tenant boundaries, money, destructive data operations, broad privilege changes, irreversible migration | Explicit threat/failure analysis, independent invariant review, targeted mutation or equivalent deliberate-fault checks, realistic data/lifecycle tests, recovery rehearsal, and human review of the affected controls |

The primary automated review, cross-model review, required automated checks, and appropriate end-to-end evidence remain mandatory for feature branches. Classes select additional depth, not permission to skip those layers. Documentation-only chores use applicable checks and reasoned exclusions rather than fabricated runtime evidence.

Record security-sensitive surfaces, affected dependencies, external effects, and plausible harm. Revisit the class when implementation expands scope. If important acceptance criteria or safety boundaries are unknown, resolve them before proceeding; do not invent them inside the checklist.

## 3. Build a verification matrix from requirements and invariants

The independent tester owns the story-specific matrix and result in the linked Verification sub-issue under [TESTING_OWNERSHIP.md](TESTING_OWNERSHIP.md). Developers still create and run their own tests and supply reproducible evidence. The parent cannot be Done while applicable verification is unfinished or invalidated by a later change.

For each acceptance criterion and each affected critical invariant, specify the expected result and the evidence needed. Include invariants across features, such as tenant isolation, bounded cost, valid state transitions, and no duplicate side effects.

| Requirement or invariant | Scenarios | Verification layer | Expected result | Evidence |
| --- | --- | --- | --- | --- |
| Only the owning tenant can access an export | Owner, other tenant, forged ID, unauthenticated request | API/integration | Approved access/error behavior; unauthorized attempts create no job or external effect | Test case and CI run |
| Retries do not repeat an external action | Replay after success, concurrent duplicate, timeout with uncertain outcome | Integration/failure injection | At most one logical action, or the approved reconciliation behavior | Effect count and persisted-state assertions |
| Resource use stays bounded | At limit, above limit, oversized input, exhausted tenant quota | API/load | Approved rejection/defer behavior before expensive work | Response, downstream call count, and measured resource use |

The rows are illustrative. Project contracts define actual identities, policies, response shapes, limits, and failure behavior.

Do not map criteria only to test filenames. Identify assertions and outcomes. Verify effects in the database, job queue, external sandbox, or user-visible result where appropriate, not just an HTTP success status or a mocked method call.

## 4. Use complementary verification layers

| Layer | What it establishes | Use when |
| --- | --- | --- |
| Static checks and builds | Syntax, typing, lint rules, generated-contract drift, build validity | Relevant to the changed stack |
| Unit/component tests | Business rules, boundaries, state transitions, rendering behavior | Behavior is isolated and assertions are meaningful |
| Integration tests | Real database constraints, transactions, middleware, queues, and adapters cooperate | A change crosses a runtime boundary |
| Contract tests | API/event schemas and consumers preserve approved compatibility | Shared or external contracts change |
| End-to-end tests | A user or operational path succeeds through the deployed system | A feature changes an operational workflow |
| Property-based/fuzz tests | Invariants survive generated boundary or malformed inputs | Parsers, validation, calculations, transformations, or state machines carry meaningful risk |
| Race/concurrency tests | Duplicate requests and competing workers preserve invariants | Shared writes, locks, idempotency, queues, or parallel execution matter |
| Security checks | Applicable controls resist specific threat scenarios | Authentication, authorization, input/output boundaries, secrets, or exposed surfaces change |
| Load/failure tests | Capacity and dependency failures stay within defined behavior | Resource consumption, retries, deadlines, jobs, or provider traffic change |
| Migration/recovery tests | Existing data, rolling versions, recovery, and data guarantees remain compatible | Schema, storage, destructive operations, or deployment order change |

Use real integrations for the behavior under examination. Mocks are useful for deterministic dependency failures, but an all-mocked suite cannot establish actual database, middleware, or provider compatibility.

For provider adapters, combine deterministic fault tests with applicable sandbox/contract checks. A sandbox result does not establish every production-provider behavior; record differences and limitations.

End-to-end assertions must check the outcome: reload persisted state, inspect the downstream result, or verify a completed lifecycle. A screenshot alone does not prove tenant isolation or durable writes.

## 5. Verify that the tests can detect defects

The agent that implements a feature can write tests, but an independent reviewer must evaluate expected behavior from the approved specifications and invariants, rather than accepting the implementation as the oracle.

For bug fixes, demonstrate that the regression test fails against the prior faulty behavior and passes with the fix where practicable. For critical controls, deliberately break the control in an isolated disposable checkout and show the relevant test fails. Never commit or deploy the deliberate defect.

Examples include removing a tenant predicate, disabling a permission guard, allowing an out-of-range quantity, or removing an idempotency constraint. A test that still passes needs investigation. Some automated mutations are equivalent or irrelevant; review surviving mutants rather than treating every survivor as a confirmed bug. [Mutation testing](https://stryker-mutator.io/docs/) offers tooling for these deliberate changes.

Other test-quality requirements:

- Assert expected values, errors, and absence of forbidden side effects.
- Derive fixtures and expected outputs independently of the implementation being checked.
- Preserve valuable existing regression assertions. Do not weaken, delete, skip, or change tests merely to obtain green results; behavior changes need approved justification.
- Control time, randomness, environment, and fixture isolation. Save failing seeds when generated cases are used.
- Treat flakes as defects in verification. Do not rerun until green and discard the failed evidence.
- Track coverage to discover unexercised paths, especially critical branches. Do not treat a coverage percentage as a proof of correctness or invent a universal target.
- Review changes to CI, test discovery, mocks, and fixtures as changes to the verification system itself.

Run targeted mutation/fault checks when their affected logic changes, or reuse identified evidence only when that logic and its relevant dependencies remain unchanged. Avoid adding implementation-mirroring tests or redundant reruns with no new uncertainty.

## 6. Security and architecture review

Replace the question "is it safe?" with explicit control checks and attack cases. Use an agreed, versioned subset of [OWASP ASVS](https://owasp.org/projects/asvs) as a security baseline appropriate to the application. Record the baseline version and applicable controls; a checklist does not certify full ASVS compliance.

Consider changed attack surfaces: authentication/session behavior, resource- and operation-level authorization, tenant boundaries, input validation, injection, output encoding, outbound URLs, file access/uploads, webhook authenticity, secrets, and sensitive data exposure. Exercise relevant unauthenticated, unauthorized, malformed, replayed, and expired inputs. Include denial-path side effects, not only response codes.

Dependency and secret scanning complement these tests. Triage applicable findings and preserve existing gates. Scanner silence is not proof that the design is secure.

For design-pattern review, identify the actual existing pattern, contract, or accepted ADR and explain why the implementation fits. Check responsibility boundaries, dependency direction, transaction ownership, error shapes, and consistency with existing modules. Avoid forcing a named pattern onto a problem that does not need it. A material departure needs written rationale and an accepted ADR when architecturally significant.

For multi-tenant systems, inspect read, write, list/search, cache, jobs, and event paths affected by the change. Do not assume a controller-level guard alone proves data isolation.

## 7. Rate limits, resource budgets, and failure behavior

Rate limiting is one control among several. Request frequency alone does not bound the cost of a large request or the background work it triggers. Review payload/page/batch bounds, concurrency, execution deadlines, queued work, and paid downstream effects alongside request limits. This follows the resource-consumption concerns described by [OWASP API4](https://api-security.owasp.org/editions/2023/en/0xa4-unrestricted-resource-consumption/).

For an applicable endpoint or workflow, document the approved policy:

- Identity/scope of the limit: user, tenant, IP, credential, operation, or relevant combination.
- Limit/window/burst behavior and effective configuration location.
- Enforcement layer and coverage across instances, workers, and alternate entry points.
- Maximum input size, fan-out, pagination, queued work, execution time, and concurrency.
- Cost/spend boundaries for paid actions or provider calls.
- Response or defer behavior, retry guidance, and limiter/backend failure policy.

Do not invent these values as incidental implementation choices when they affect product behavior. Reference the approved contract. IP-only controls may have shared-user and proxy effects; evaluate the deployment's identity and forwarding assumptions.

Verify the policy with deterministic boundary tests and representative deployment-topology tests when applicable:

- Allowed requests, the exact limit boundary, and over-limit requests behave as defined.
- Denied work does not call paid providers, enqueue jobs, or perform prohibited writes.
- A user's or tenant's budget cannot be bypassed by changing a request identifier or alternating workers.
- Recovery/reset behavior works using a controlled clock for deterministic tests.
- Multi-instance behavior and atomic counters preserve the intended aggregate limit.
- Oversized payloads, page sizes, and batch/fan-out requests cannot evade the cost boundary.
- The documented limiter failure behavior is exercised; do not silently default to fail-open or fail-closed.

For reliability, test relevant provider 429/5xx responses, timeouts, cancellation, worker interruption, partial writes, duplicate/out-of-order events, and retry exhaustion. Verify bounded retries/backoff, deadlines, reconciliation, and final state. "Retry" must not create an uncontrolled loop or repeated side effect.

Load tests require approved traffic patterns and resource/SLO budgets: dataset size, request mix, concurrency, duration, latency/error targets, and downstream budgets. Record results under realistic limits and check queues, connections, memory, and downstream effects as appropriate. Do not invent targets or run destructive load/fault tests against production without explicit authorization.

## 8. Data and deployment compatibility

Migration tests cover both a clean installation and upgrade from representative existing data/schema when applicable. Review transaction boundaries, uniqueness, backfills, lock duration, data preservation, and old/new application compatibility during rollout.

Use expand/contract sequencing where rolling deployment requires both versions to coexist. Evaluate the actual release sequence and old application behavior against the new schema. Immutable migrations and forward correction remain mandatory under docs/policies/METHODOLOGY.md.

Recovery is not always a database downgrade. Identify whether the safe action is disabling a feature, rolling back compatible binaries, reconciling state, or applying a forward fix. Returning to an old binary must not corrupt data created by the new release. Backup/restore evidence is required when recovery relies on it; "we have backups" is insufficient without a suitable restoration rehearsal and understood data-loss window.

## 9. PR evidence and enforcement

Use the PR template as a review aid. For each applicable checklist group provide evidence; mark an individual item not applicable with a concrete reason in the evidence table. A check means the item was evaluated and supported, or its non-applicability was justified. It does not mean an unperformed check passed.

Record commit, comparison base/merge result, environment, exact command or procedure, result, and artifact/run link. Redact secrets and sensitive data from evidence. When a new commit invalidates evidence, update it and repeat affected verification.

Unresolved blocking findings prevent integration. Missing required evidence remains missing until completed or covered by an explicit human-approved exception with rationale, owner, bounded scope, and follow-up. An agent cannot grant itself an exception. N/A cannot conceal absent verification of an applicable control.

An integration exception does not make unfinished work Done. Alternate evidence must still meet the shared Definition of Done in docs/policies/SCRUM.md; otherwise keep the remaining gap visible and exclude the item from delivered-story points. Critical permission, tenant, and unauthorized-effect invariants cannot be waived through a model score or process exception.

Configure CI separately to run the real repository commands and enforce stable required checks through branch protection/rulesets. At minimum, CI must establish test discovery and successful execution, build/static checks for the changed stack, and the relevant integration/contract/security gates. Empty or accidentally skipped suites must not appear successful.

Critical-control or test-infrastructure changes need independent human review in addition to automated evidence. Keep gate configuration and credential scope resistant to unreviewed bypasses.

Validate combined changes against the current integration branch. Use a [GitHub merge queue](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue) where available, or equivalent checked merge results. If the repository uses GitHub Actions with a merge queue, configure required workflows for the merge-group event as well as PR validation; merely enabling a queue does not supply checks. Confirm the platform's availability and repository settings before adopting it.

The local PR template becomes automatically available on GitHub after it is present on the repository's default branch. See [GitHub's template documentation](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository).

## 10. Release readiness and production promotion

Use this checklist in the release record or production-promotion PR. It supplements the feature PR evidence rather than duplicating every feature checklist.

- [ ] Identify the exact source revision, build artifact identifier/digest, configuration revision, included PRs, and migration order.
- [ ] Required combined-result checks and operational validation pass for the release candidate; applicable feature exceptions are visible and explicitly accepted for release.
- [ ] Validate the deployable artifact in an environment with representative runtime, middleware, database, configuration, and dependency boundaries. Record meaningful production differences.
- [ ] Confirm applicable dashboards, error/latency/resource metrics, redacted logs, alert delivery, and an incident owner/runbook. Exercise new alert paths when introduced.
- [ ] Define initial exposure, rollout stages, observation windows, success metrics, and explicit stop/recovery thresholds before release. Do not invent them during promotion.
- [ ] Rehearse the applicable disable, rollback, restore, or forward-recovery procedure and confirm schema/data compatibility.
- [ ] Resolve production secrets/permissions and resource limits through the approved environment configuration; no development defaults or disabled guards remain.
- [ ] Record human approval for the identified candidate and operations, including production migrations where applicable.
- [ ] After authorized deployment, run non-destructive smoke checks, evaluate rollout signals, and record the outcome before expanding exposure.

Prefer bounded exposure through a feature flag, internal cohort, canary, or other rollout mechanism suitable to the system. Shared backends and migrations can affect users outside the cohort; analyze their actual scope. Google's [canary release guidance](https://sre.google/workbook/canarying-releases/) explains why production signals complement pre-release tests.

Do not require every service to implement a complex canary platform before its first release. Require an explicit exposure, observation, and recovery plan that matches the change's consequences. If safe incremental exposure is not feasible, document the alternative and have the human approve the additional risk.

## 11. Agent verification workflow

1. Read the ticket and governing artifacts; classify impact and identify invariants.
2. Prepare the scenario matrix independently of implementation details and obtain required plan/decision approval.
3. Use the TDD loop for deterministic behavior and the approved eval contract for model behavior, preserving existing verification; record justified exclusions.
4. Run relevant checks in isolated environments and collect reproducible evidence.
5. Obtain primary review and independent cross-model review of behavior, tests, and architecture. Seek human review for critical controls.
6. Remediate findings, repeat affected verification, and complete the PR evidence/checklist.
7. Verify the combined integration result before authorized merge.
8. Prepare the release record and obtain human production approval. Observe the authorized rollout and recover when stop conditions trigger.

Suggested reviewer prompt:

```text
Review <commit> against <base> using the ticket, approved specifications,
accepted ADRs, docs/policies/METHODOLOGY.md, and docs/policies/PRODUCTION_READINESS.md.
Derive expected behavior from those artifacts before assessing the code.
Challenge both implementation and tests: missed edge cases, weak assertions,
tenant/permission boundaries, resource budgets, duplicate effects,
dependency failures, migration compatibility, and recovery.
Check existing patterns where applicable; do not invent design requirements.
For each material finding provide the scenario, expected/actual behavior,
evidence or reproduction, and severity. Do not mark unexecuted tests passing.
Record coverage gaps and justified non-applicability separately.
```

## 12. Improve the verification system from production findings

For escaped defects, first establish the intended behavior and add a regression test at the lowest meaningful layer. Identify why the existing verification missed the issue: absent scenario, wrong oracle, unrealistic environment, insufficient assertion, ignored finding, or ineffective rollout detection.

Update the relevant matrix, guardrail, or operational signal. Track flaky tests, bypassed checks, escaped defects, recovery success, and false confidence from weak tests. Improve the evidence system rather than expanding a checklist indefinitely.
