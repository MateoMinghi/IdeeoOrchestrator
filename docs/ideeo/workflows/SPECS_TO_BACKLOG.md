> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# From specifications to a Linear backlog

Use this workflow when asked to audit, draft, refine or publish backlog work. [Project context](../product/PROJECT_CONTEXT.md) governs the full shared-engine scope; [methodology](../policies/METHODOLOGY.md), [Scrum](../policies/SCRUM.md) and [testing ownership](../policies/TESTING_OWNERSHIP.md) govern delivery. Publication requires authorization; drafting alone does not permit issue/document mutations, assignments or invitations.

## 1. Sources of authority

Read the relevant product rules, architecture, accepted ADRs, contracts and current Linear issues. Proposed ADRs are proposals. Distinguish confirmed scope, unresolved decisions, historical reference material and observed implementation. One shared engine serves PayMe and other tenants; keep brain, authority, app/SDK, legacy and bank-core ownership correct.

Do not infer deadlines, accepted architecture, resource availability, estimates, people or production readiness from a reference plan. Surface contradictions before publishing dependent work. Existing code is evidence, not automatic acceptance criteria.

## 2. Inspect current work

Use the connected Linear tools to inspect the actual workspace/team/projects, existing issues/relations, workflow states and relevant cycles. Check for work already covering a requirement and update/reuse it when authorized. Consult [compact mappings](../reference/SOURCE_REFERENCES.md#source-056ac7aa65fd) for stable IDs and source links; query Linear for live descriptions, ownership and status.

Prefer supported service tools and existing repository setup. Tool availability does not grant write permission. If access is unavailable, prepare a clearly labelled proposal and report the missing readback rather than inventing current state.

## 3. Requirements and coverage

Identify actors, functional outcomes, constraints, edge cases, authority/tenant invariants, dependencies and open decisions. Map source requirements to existing/proposed stories and explain deliberate deferrals or exclusions. A coverage row is not proof that code exists or work is accepted.

Prepare working inventories/proposals in conversation or the existing issue/PR. Do not create committed coverage dumps, copied story bodies, planning payload bundles or publication snapshots by default. If the user explicitly requests a separate export, produce that artifact. After authorized publication, retain only useful stable requirement/issue/source references in `planning/linear/issues.json`; actual ticket content stays in Linear.

## 4. Slice the roadmap

Group outcomes by dependencies and a usable increment, keeping distant work broad. A launch/legacy fallback does not reduce this repository's full-engine scope. Confirm sequencing and major decisions with the responsible human; do not assign dates or estimates without authorization.

## 5. Draft functional tickets

Use [the ticket workflow](SKILL_CREATE_TICKETS.md). Each story identifies the actor, desired outcome, acceptance criteria, material edge cases, non-goals, constraints, dependencies, relevant source/pattern links and verification expectations. State the WHAT, not a code-editing recipe. Use an investigation/decision item for genuinely unresolved behavior rather than inventing a contract in a functional story.

Keep common engineering checklists in canonical policies and the PR template. Do not paste them into every ticket. Discuss approach in the existing issue/PR or conversation; durable architectural choices belong in ADRs.

Functional stories use one existing or newly authorized unestimated Verification child. A different human tester is assigned during planning with authorization. Avoid duplicate children; points include verification in the parent, and completing a child does not itself complete its parent.

## 6. Review and approve the proposal

Present scope coverage, additions/reuse, dependencies, exclusions, open decisions and proposed publication changes. Humans approve the actual criteria, assignments/estimates and consequential decisions. A roadmap approval does not automatically make every story Ready. Resolve blocking ambiguities before affected implementation.

## 7. Publish and verify authorized changes

Apply only the approved issue/document/relationship changes through Linear tools. Do not silently delete, close, reschedule or reassign other work. Use existing IDs for updates and preserve unrelated edits. Check the current remote record before overwriting it and read back changes afterward.

Keep compact issue/source/Verification references in `issues.json`, native document IDs/URLs and published source hashes in `documents.json`, and cycle-document links in `cycles.json`. Do not retain full request/response bodies, copied descriptions or before/after configuration snapshots. Preserve important decision/acceptance evidence in its actual issue or canonical artifact. A failed publication/readback remains explicit; resume by known IDs rather than creating duplicates.

## 8. Reconcile and hand off

As specifications change, compare approved behavior against existing tickets and implemented evidence, identify gaps and propose the smallest reconciliation. Do not overwrite an accepted ADR or change expectations to accommodate a defect. Synchronize authorized policy mirrors and their hashes, or mark them stale if publication is outside authorization.

The final response or existing issue/PR supplies the normal handoff: what changed, stable links, coverage gaps and next required decisions. Keep live Sprint planning/review/retrospective content in its native Linear record. Do not create another committed handoff or task plan unless explicitly requested.
