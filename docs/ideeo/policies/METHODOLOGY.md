> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Agent-assisted software development methodology

> **IdeeoOrchestrator operating profile.** This candidate uses the current checkout and its authorized Git workflow. The source document's `feature branch -> dev`, production `main`, claims system and publication setup describe Ideeo-IA-general, not configured behavior here. Preserve delivery/review gates; use root AGENTS.md and the local isolated verification profile for execution.

This is the canonical delivery process. [SCRUM.md](SCRUM.md) owns cadence, readiness and the shared Definition of Done; [AI_DEVELOPMENT.md](AI_DEVELOPMENT.md) owns TDD/evals; [PRODUCTION_READINESS.md](PRODUCTION_READINESS.md) owns risk-based verification and release evidence; [TESTING_OWNERSHIP.md](TESTING_OWNERSHIP.md) owns independent human testing; [COMPLIANCE.md](COMPLIANCE.md) owns regulatory and ISO compliance-by-design rules. Use [ENGINE_SETUP.md](../reference/SOURCE_REFERENCES.md#source-8f929a906ccd) for actual engine commands.

## 1. Core principles

Implement approved behavior, verify meaningful outcomes and preserve tenant/authority boundaries. Models and agents do not approve their own scope, missing evidence or production promotion. Preserve unrelated work and separate implementation from independent review. Missing checks remain missing; a passing average cannot compensate for an unauthorized financial action or disclosure. Design every change for the applicable laws, tenant regulatory obligations and target ISO controls under [COMPLIANCE.md](COMPLIANCE.md); working software that breaches a recorded obligation is not done.

## 2. Roles and authority

Humans own product decisions, scope, acceptance, estimation and production promotion. Developers own implementation and verification. Claude Code and Codex may implement/review within authorization; required primary and cross-model reviews use independent sessions/models. Review requirements do not authorize spawning agents or expanding access. Git and PRs own code/change history.

### Documentation responsibilities

Maintain one canonical home for each fact:

| Information | Home |
| --- | --- |
| Confirmed product scope/rules | Product context and applicable contracts |
| Consequential architecture decisions | ADRs, with acceptance status and supersession history |
| Current task scope, plan, blockers, approvals and handoff | Existing PR or conversation |
| Current commands/configuration/recovery | Existing setup guide or relevant runbook |
| Actual test/eval observations | Tests and reports, linked from the existing verification index |
| Legal/regulatory obligations, ISO scope, policies, risks and statements of applicability | [Legal register](../compliance/LEGAL_REGISTER.md) and [management system documents](../compliance/README.md) |
| Commit and merge history | Git |

Update existing documentation when behavior changes. Do not create committed implementation plans, Sprint/session diaries, merge-authorization records, per-change evidence summaries or review handoff documents by default. A separate such artifact requires an explicit user request. Preserve important review findings, decisions and failed observations in their canonical location; remove obsolete prose instead of moving it into an archive directory. Resolve actual conflicts rather than silently changing accepted behavior.

## 3. Roadmap and rolling grooming

Plan outcomes and dependencies first; elaborate the next useful slice. Keep requirements linked to work and approved deferrals. A roadmap does not itself approve implementation scope.

## 4. Work scope: describe the WHAT, not the HOW

Define observable behavior, acceptance criteria, material edge cases, non-goals, constraints (including applicable legal-register obligations), dependencies, existing-pattern references and verification expectations. Match detail to ambiguity. Avoid implementation recipes, unapproved design choices and session-coordination instructions. Discuss implementation approach in conversation or the existing PR; use an ADR for consequential architectural choices. Do not generate a separate plan file to compensate for unclear scope.

Readiness requires human-approved scope and sufficiently resolved product/contract questions to define acceptance. Investigations instead specify a bounded question, deliverable and completion criteria.

## 5. Progress and completion

Record progress and blockers in the existing PR or conversation. Implementation can proceed to review when it appears complete and relevant developer checks pass. Completion requires the shared gates and integration; stopping work, opening a PR or an unavailable test does not satisfy it. Deployment remains separate.

## 6. Pickup, ownership, and worktrees

Read the authorized task scope, governing contracts/ADRs, relevant discussion and current integration state. Follow [TESTING_OWNERSHIP.md](TESTING_OWNERSHIP.md): a different human owns independent acceptance testing; the implementer retains TDD responsibility.

Before edits, inspect `git worktree list`, preserve user changes and claim the task/file areas through an exclusive shared registry. Reuse the current checkout for sequential work; a feature branch does not require a separate worktree. Create separate worktrees only when multiple authorized agents need to edit related features simultaneously, and reuse each agent's worktree for its ongoing task. Read-only reviews do not require a new worktree. Continue to serialize overlapping changes under section 7.

Reserve actual ports/databases for runtime checks. Claims identify owner, branch/worktree, file/resource scope and timestamps; verify inactivity before reclaiming. Update the claim when scope changes and release it at handoff. After integration, remove temporary worktrees and their rebuildable artifacts once no active session needs them; preserve uncommitted changes and non-rebuildable data unless the user authorizes their deletion.

## 7. Parallelization by contracts and resources

Serialize overlapping files and shared contract/migration/client/configuration changes. Integrate a contract before its dependent consumers. Worktrees do not isolate databases, ports, external accounts or integration-branch changes. Prefer separate databases; destructive tests on a shared database require a real exclusive lock for their entire lifecycle. Parallel/delegated work still requires authorization.

## 8. Planning and architectural decisions

Plan proportionately in the conversation or existing PR. An explicit user implementation request authorizes routine implementation choices within that scope; do not invent a second approval gate or a committed plan requirement. Seek decisions for unresolved consequential architecture, material scope changes or genuinely missing authorization. Preserve those decisions in the governing contract/ADR or existing PR, not a session log.

An analysis, comparison, review or proposal request calls for a read-only answer unless the user also requests changes or an active task already authorizes them. Do not change tracked files or external systems merely to make a proposal concrete. When the user asks to implement the proposal, apply only the authorized scope and use the normal change gates.

Use an ADR when meaningful alternatives impose durable constraints, an expensive reversal or a significant tradeoff (for example authentication, storage, execution model or API versioning). Prepare the proposal, obtain the required human decision, link accepted constraints and supersede rather than silently rewrite an accepted decision. A Proposed ADR is not accepted by publication. A separate implementation-plan file is created only when explicitly requested by the user.

## 9. Implementation and emergent work

Follow the TDD/eval rules in [AI_DEVELOPMENT.md](AI_DEVELOPMENT.md). Implement approved behavior with existing patterns, preserve regressions and keep changes focused. Fix blocking discoveries within scope; record material additions in the PR or conversation. Product/contract/accepted-architecture changes require the applicable revised decision. Note unrelated improvements in the PR or conversation for future consideration rather than expanding the task.

## 10. Branching and integration

This repository uses `feature branch -> dev` for local integration; `main` is human-controlled production. Existing `staging` does not override that mapping. Use a feature branch for runtime/shared-contract/ADR changes and substantial documentation cleanup; keep remediation on it. Low-impact chores may follow the repository's authorized direct-commit rules.

Merge only within authorization and the required gates; preserve protection/CI enforcement. Verify the combined result against the current integration branch. A fast-forward preserving an already verified tree can reuse its evidence where applicable; no extra merge-log document is required. Never infer push, deployment or production permission from a local merge instruction.

## 11. Review and verification

Feature work requires applicable automated checks, primary review in a separate session, independent cross-model adversarial review and validation across affected real boundaries. Run reviews against identified revisions; preserve findings, severity, fixes and rechecks in the existing PR, conversation or verification index. Do not relabel historical reviews as approval of changed code.

Apply [PRODUCTION_READINESS.md](PRODUCTION_READINESS.md) to security, tenant isolation, resource limits, concurrency, provider failures, recovery and artifact checks. Apply [COMPLIANCE.md](COMPLIANCE.md#3-rules-for-every-change) to changes affecting personal or financial data, money movement, authentication, AI providers, channels, third-party sites, retention or cross-border processing; reviews check the stated compliance impact. Assert intended effects and absence of forbidden effects. Deliberately break critical controls in disposable copies to check verifier sensitivity. Preserve failed observations and disclose flakes/skips; do not weaken assertions to get green. Record missing independent checks and obtain an explicit human exception where policy permits integration; do not impersonate a reviewer or count unavailable checks as passed.

## 12. Definition of done and production promotion

Use the Definition of Done in [SCRUM.md](SCRUM.md), independent acceptance testing and applicable eval/readiness gates. Evidence must identify criteria, actual revision/configuration, commands/results, review disposition and acceptance gaps. A bounded integration exception does not establish completion while acceptance remains unmet.

Production promotion requires human approval of the exact artifact/configuration and operations, with deployment/migration order, monitoring/stop conditions and recovery evidence under [PRODUCTION_READINESS.md](PRODUCTION_READINESS.md#10-release-readiness-and-production-promotion), and the release's legal-register obligations confirmed by counsel or covered by a recorded human exception under [COMPLIANCE.md](COMPLIANCE.md#4-review-and-release). Material changes invalidate affected approval/evidence.

## 13. Database migration policy

Keep applied migrations immutable. Use the actual migration generator and forward changes; verify compatibility, data/backfill effects and recovery. Never reset a database or rewrite history to fix a checksum. Production migration execution needs its own authorization.

## 14. Documentation and handoff

Use [the PR template](../reference/SOURCE_REFERENCES.md#source-b2496e80299b) and [PR workflow](../workflows/SKILL_CREATE_PR.md) when a PR is requested. Link existing evidence rather than copying it into another document. A final response or existing PR update is the normal handoff: branch and commit; whether it is integrated or pushed; checks and evidence; and the next owner/action or blocker. State unknown or unperformed steps plainly. Resource claims are operational records, not a reason to add committed session files.

Keep AGENTS.md canonical for agent entry rules and link it from CLAUDE.md. Keep credentials and workstation-specific paths out of tracked documentation. Changes to substantive delivery gates still require a human decision; reducing duplicate documentation does not waive testing, review or production controls.
