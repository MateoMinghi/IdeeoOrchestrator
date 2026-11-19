---
name: test-software
description: Verify a particular repository's change against approved behavior and production-readiness requirements using its actual test commands, environments, and resource constraints. Use for targeted verification or configuring a repository testing profile, not for certifying an application solely from green tests.
---


> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Skill: Test the software

> **IdeeoOrchestrator operating profile.** For IdeeoOrchestrator, the runnable profile is the root docs/verification/README.md and current package scripts. Source ENGINE_SETUP/Python commands are reference locators only. Extend isolated fixtures for newly implemented product services.

Build justified confidence in a specified change or release using independent expectations, complementary checks, and reproducible evidence. Select verification based on affected behavior and consequence. Do not treat test count, coverage percentage, or model agreement as proof of correctness.

Use the existing [engine setup](../reference/SOURCE_REFERENCES.md#source-8f929a906ccd) for this repository's actual commands and isolation profile. For another target repository, discover its own profile before running checks.

## Governing artifacts

Apply [AI_DEVELOPMENT.md](../policies/AI_DEVELOPMENT.md) for TDD and model evals and [SCRUM.md](../policies/SCRUM.md) for the shared Definition of Done. Include relevant eval dataset/configuration/grader revisions, case-level gates, and critical forbidden-effect assertions when AI behavior changes.

Read the target repository's instructions, [METHODOLOGY.md](../policies/METHODOLOGY.md), and the applicable sections of [PRODUCTION_READINESS.md](../policies/PRODUCTION_READINESS.md). Read approved ticket criteria, specifications, accepted ADRs, and existing verification evidence. Resolve references in the target repository.

The ticket defines behavior and constraints, not implementation steps. Unknown product policies require clarification/approval; do not choose a permission rule, rate limit, retention period, or recovery guarantee merely to make tests executable.

## Establish the target and operating mode

For story verification, use the linked Verification sub-issue under [TESTING_OWNERSHIP.md](../policies/TESTING_OWNERSHIP.md) as the independent tester's evidence record. Read the parent as the behavioral authority. Report the tested revision, findings/rechecks, and applicable AI eval evidence there; this skill does not assign people or grant authority to change either issue's status. Developer TDD and the existing review layers remain required.

- **Configure a testing profile:** discover and document the repository's real commands, environment prerequisites, isolation, and verification modules. Do not install dependencies or change CI just because discovery found a gap.
- **Verify a change:** establish the repository, worktree, branch, commit, comparison base, and approved behavior. Run the relevant checks and collect evidence.
- **Verify a release candidate:** additionally identify the deployable artifact/configuration and apply the release gate. This is not authorization to deploy or exercise production.

Infer the target from the active repository and session when unambiguous. Run checks appropriate to affected behavior. Documentation-only changes need link, reference and consistency checks; they do not require inventing runtime tests or claiming a new software qualification.

## Discover and maintain the software-specific profile

Use an existing verified profile if available, then check it against current manifests, scripts, CI, and repository instructions. Otherwise inspect those artifacts to establish the profile. Prefer authoritative documented scripts to guessed commands. Verify working directories and test discovery.

Maintain these fields in the existing setup/profile guide when that information changes; create a separate profile artifact only when explicitly requested:

| Field | Required content |
| --- | --- |
| Target and revision | Application/module paths, stack, and inspected source revision |
| Commands | Exact build, static, unit, integration, contract, E2E, security, and other applicable commands with working directories |
| Preconditions | Runtime/tool versions, fixture setup, required services, and configuration variable names; no secret values |
| Resource effects | Databases, ports, queues, storage, provider accounts, and destructive setup/teardown |
| Isolation | Actual per-run resources or exclusive lock mechanism and how ownership is established |
| Scope selection | How changed modules/contracts map to relevant suites and dependents |
| Evidence | Results/artifact locations and how the executed revision and environment are recorded |
| Additional modules | Approved performance/resource policies and relevant fuzz, mutation, race, lifecycle, or recovery procedures |
| Known gaps | Missing harnesses/tools, unverified commands, environmental differences, and human-approved exceptions |

Distinguish discovered configuration from commands actually executed successfully. Keep unknown fields visible without inserting plausible defaults. New harnesses or CI changes are implementation work requiring their own authorized scope.

## Establish expectations before accepting implementation behavior

Classify impact using the readiness policy. Build a scenario matrix mapping approved criteria and affected invariants to inputs, identities, expected outputs/effects, verification layer, and evidence.

Derive expectations from specifications/contracts rather than copying the implementation's decisions into assertions. Include representative happy paths, material boundaries, and failure paths. Existing patterns inform implementation/verification but cannot override approved behavior.

Preserve feature-branch requirements for primary review, independent cross-model review, automated checks, and end-to-end evidence. This testing skill does not impersonate both reviewers or authorize delegation. Record required reviews as pending unless actual independent evidence is available.

## Select meaningful checks

Use static/build checks and the lowest meaningful behavioral layer, then cover actual runtime boundaries with integration/contract/E2E checks. Select applicable additional modules:

- **Authorization/tenancy:** allowed and denied identities, forged resource references, relevant read/write/list/cache/job/event paths, and absence of forbidden effects.
- **Input/output security:** malformed inputs, injection/encoding, outbound URLs, uploads, webhook authenticity/replay, and sensitive-data exposure at changed boundaries.
- **Resource and rate policy:** approved limit/window/burst and identity scope, exact boundaries, multi-worker enforcement, reset/failure behavior, oversized/batched work, and no expensive effects on rejection.
- **Concurrency/idempotency:** concurrent duplicates, conflicting writes, uncertain external outcomes, persisted state, and side-effect counts.
- **Reliability:** provider timeout/429/5xx, cancellation, worker interruption, bounded retry/backoff, partial completion, reconciliation, and final state.
- **Data/migrations:** clean install and existing-data upgrade, integrity, backfills, transaction/lock behavior, rolling compatibility, and applicable recovery rehearsal.
- **UI:** meaningful user outcomes and persisted state, loading/empty/error behavior, accessibility, and supported environments.
- **Properties/fuzz/mutation:** risky boundaries, parsers, calculations, state machines, and critical controls whose assertions must demonstrate defect detection.
- **Capacity:** representative datasets, workload, duration, approved latency/error/resource/cost targets, and downstream/queue behavior.

Use real databases/middleware/providers or their documented sandbox boundaries where that behavior is being verified. Use controlled mocks for deterministic faults without claiming they establish real integration compatibility. Record sandbox and environment differences.

## Execute within resource and authorization boundaries

Check ownership and isolation before execution. Worktrees do not isolate shared databases or ports. If the harness resets a shared database, hold the actual exclusive lock for its entire lifecycle or use verified separate per-run databases. If neither is established, run independent safe checks and report the blocked destructive suite.

Run relevant required checks; do not replace meaningful suites with convenient green commands. Capture the command/procedure, working directory, revision, environment, result, and artifact. Record discovered test counts or another reliable signal that the intended suite actually ran. An empty/skipped suite is not successful verification.

For bug fixes, demonstrate the regression against prior faulty behavior where practicable. For changed critical controls, use targeted mutation or equivalent deliberate-fault verification in an isolated disposable checkout. Restore/verify the correct code afterward; never publish or deploy intentional defects. Review surviving mutations for equivalent behavior and real assertion gaps.

Control time, randomness, and fixtures. Save failing seeds and initial failure evidence. Investigate flakes instead of rerunning until green. Do not weaken assertions, delete regressions, disable gates, or change approved expected behavior to obtain a passing result.

Fix failures only within the user's authorized implementation scope. Otherwise report the reproduction and required correction. After remediation, repeat affected checks and broaden verification when the change invalidates wider assumptions; avoid redundant unrelated reruns.

External paid calls, destructive shared-resource operations, and production load/fault tests require their applicable authorization. A general request to test locally is not permission to disturb a production environment.

## Evaluate the result

Record each applicable module as passed, failed, not run, or not applicable with a reason. Missing applicable evidence stays missing; only a recorded human decision can grant an exception. Expose residual uncertainty and blockers.

For integration readiness, verify the combined result with the current integration branch through the established CI/merge mechanism. For release readiness, evaluate the identified artifact/configuration, observation/stop conditions, and recovery compatibility. Keep these conclusions separate.

No production-ready claim follows merely from a green local suite. Report what is supported by the actual evidence, what remains for CI/review/release validation, and whether production promotion still awaits human approval.

## Deliver evidence

Use existing repository evidence formats. At minimum, provide:

```markdown
## Verification scope
Target, commit, comparison base/combined result, artifact, environment,
impact class, approved criteria, and affected invariants.

## Evidence
| Criterion/invariant | Scenario and command/procedure | Expected result | Actual result | Evidence |
| --- | --- | --- | --- | --- |

## Gaps and findings
Failures, not-run checks, individual N/A reasons, flakes, environment
differences, missing reviews, and explicitly approved exceptions.

## Readiness
Integration evidence status and release evidence status, listed separately.
Required next actions and actual human approval status.
```

Link the evidence from the PR when requested; redact secrets and sensitive data. Do not modify Linear status, merge a PR, deploy, or approve production as a side effect of testing.

## Example requests

```text
Use docs/workflows/SKILL_TEST_SOFTWARE.md to discover and document the real testing
profile for this repository. Flag unknown commands and isolation gaps.
Do not install tools, change CI, or run production tests.
```

```text
Use docs/workflows/SKILL_TEST_SOFTWARE.md to verify this branch against its approved
ticket. Run applicable checks using the verified repository profile,
record evidence for the PR, and expose missing reviews/release validation.
```
