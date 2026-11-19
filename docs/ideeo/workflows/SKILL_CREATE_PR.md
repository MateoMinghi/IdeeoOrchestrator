---
name: create-pr
description: Prepare, create, or update a pull request with a concise behavior-focused description, readiness checklist, and actual verification evidence. Use for presenting an existing branch for review, not as permission to implement, merge, or deploy it.
---


> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Skill: Create a pull request

> **IdeeoOrchestrator operating profile.** Use this checkout's actual remotes, branch policy and PR template when publication is authorized. Do not run the source repository's sync alias or publish to its mirror merely because the historical workflow mentions them.

Make the change concrete and reviewable: explain the resulting behavior, connect it to approved scope, and present reproducible evidence and remaining risks. A PR checklist records evaluation; it does not replace tests or enforce CI by itself.

This file is a reusable skill definition stored as a standalone Markdown document. Its invocation does not imply permission to merge or promote production.

## Governing artifacts

Apply [SCRUM.md](../policies/SCRUM.md) for Done and [AI_DEVELOPMENT.md](../policies/AI_DEVELOPMENT.md) for TDD/eval evidence. Use the AI/eval section of the PR template when applicable and record an explicit impact rationale otherwise.

Read [METHODOLOGY.md](../policies/METHODOLOGY.md), the relevant portions of [PRODUCTION_READINESS.md](../policies/PRODUCTION_READINESS.md), and the target repository's [.github/pull_request_template.md](../reference/SOURCE_REFERENCES.md#source-b2496e80299b). Read the ticket, approved specifications/ADRs, implementation plan when present, and relevant review findings. Resolve paths in the target repository rather than assuming this document folder contains application code.

Use established repository formats and commands. If no PR template exists, use the evidence and checklist structure defined by the readiness policy and state the limitation. Do not fabricate CI links, approvals, screenshots, commands, or review results.

## Establish scope and destination

- A request for a description or local draft produces that artifact without a remote write.
- A request to create/update a PR authorizes the requested PR operation and necessary publication of the intended feature branch, subject to existing repository permissions. Preserve any explicit narrower scope.
- Confirm repository, remote, current branch/worktree, comparison base, and intended target branch from the actual checkout and existing instructions.
- The normal feature PR target is the configured integration branch, not main. A production-promotion PR is a distinct requested operation requiring release evidence and human approval before promotion.

Use the existing feature branch. Do not create a second implementation branch, reset work, force-push, stage unrelated files, or include another session's changes to make the PR convenient. If no code repository/branch exists, prepare the requested prose and identify the missing publication context.

## Inspect the final change

Compare the intended branch with the appropriate base and inspect its actual diff, commits, working-tree state, and changed contracts. Confirm the diff represents the requested work. Separate unpublished/uncommitted changes from what the remote PR will contain.

Check that the approved criteria still match the result. Record material discoveries and any revised approval. Do not rewrite ticket criteria to fit an implementation after the fact.

Classify impact as Routine, Elevated, or Critical using the readiness policy. Identify affected boundaries and applicable verification modules. Changes to tests, fixtures, CI, or verification tooling need review of their effect on the gate itself.

## Assemble evidence and obtain missing verification

Link the parent story and its Verification sub-issue, record the implementation/delivery owner and independent tester when assigned, and identify the revision covered by that tester's evidence. Apply [TESTING_OWNERSHIP.md](../policies/TESTING_OWNERSHIP.md). An opened verification task or a completed child cannot replace the parent's other integration and Done gates.

Read existing evidence before rerunning checks. Confirm its commit/base, environment, assertions, and results. Reuse evidence only when relevant behavior and dependencies remain unchanged.

Run documented, applicable checks needed for the current revision if that work is authorized and safe in the configured environment. Establish database/resource isolation before destructive integration tests. If substantial scenario discovery or a missing software profile is needed, follow docs/workflows/SKILL_TEST_SOFTWARE.md when available or the readiness policy directly.

A feature PR requires primary automated review, independent cross-model review, applicable automated checks, and end-to-end validation. Record actual reviewers/models and reviewed revisions. Do not spawn other sessions unless delegation is authorized, or imply a review occurred because the skill names it.

Resolve findings within the authorized scope, then repeat affected checks and review remediation. For unresolved questions, absent tools, missing reviews, or failed checks, clearly report the gap. If PR creation is still requested, open a draft PR and label its missing readiness evidence. Do not represent it as review-ready or grant an exception on the human's behalf.

## Write the PR

Lead with the concrete problem and resulting behavior. Include a before/after example when useful. Scale the description to the change and use the repository template.

Record:

- Ticket/specification/ADR references and impact classification.
- Verified commit, base/combined-result revision, environment, and build artifact when available.
- Acceptance criteria and invariant evidence, including meaningful failures and side effects.
- Evaluated security, rate/resource, architecture, data, UX, and operational checklist items.
- Individual N/A reasons, explicitly approved exceptions, and remaining risks.
- Primary/cross-model review findings and remediation evidence.
- Deployment requirements and the applicable disable/rollback/forward-recovery procedure.

Leave unchecked items that have not been evaluated. Check an N/A item only when its reason is recorded according to the template convention. A missing applicable check is not N/A. Evidence invalidated by a later commit must be refreshed before integration.

Keep implementation detail only where it helps a reviewer assess behavior, compatibility, or risk. Omit conversational history and abandoned approaches unless they explain an accepted tradeoff.

## Publish and verify when requested

Use available GitHub tools or the authenticated CLI. Check for an existing PR for the branch and update it rather than create a duplicate. For multiline prose, use a structured body argument or write the exact text to a temporary file and pass it with `--body-file`.

After a write, read back the PR's title, body, draft status, branch/base, and URL. If a response is uncertain, search for the intended PR before retrying. Stop ambiguous mutations and report the remaining action. Do not merge, alter protections, approve production, or deploy as part of PR creation.

For a requested production-promotion PR, include the release checklist from docs/policies/PRODUCTION_READINESS.md and expose the exact candidate and production operations awaiting human approval. Feature-checklist completion alone is insufficient.

## Deliver

Return the PR link when actually published, or the local title/body when only drafted. State the target branch, readiness/draft status, verification performed, and material remaining gaps. Distinguish locally verified work, pending CI, and production approval.

## Example request

```text
Use docs/workflows/SKILL_CREATE_PR.md to create a PR for this feature branch into the
configured integration branch. Use the repository template and actual
verification evidence. Keep it draft if required reviews/checks are missing.
Do not merge or deploy.
```
