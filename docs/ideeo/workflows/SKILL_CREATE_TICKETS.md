---
name: create-linear-tickets
description: Draft, refine, or publish behavior-focused Linear tickets from written specifications using the repository methodology and available Linear MCP tools. Use for backlog preparation or ticket creation, not implementation planning or coding.
---


> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Skill: Create Linear tickets

Produce traceable tickets that another developer or agent can understand without the author's private context. Keep the roadmap broad and elaborate the next delivery slice. Agent-generated tickets require human approval before becoming ready.

This file is a reusable skill definition stored as a standalone Markdown document. Reading or naming the skill does not authorize writes to Linear.

## Governing artifacts

Use [SCRUM.md](../policies/SCRUM.md) for readiness and planning and [LINEAR_WORKFLOW.md](../policies/LINEAR_WORKFLOW.md) for current fields/states. The approved unstarted state is Ready (formerly Todo); resolve its actual ID/name before mutation. Keep story points owned by the Developers and evals as quality evidence.

Read [SPECS_TO_BACKLOG.md](SPECS_TO_BACKLOG.md) for the planning/publication workflow and [METHODOLOGY.md](../policies/METHODOLOGY.md) for readiness, ownership, and architectural rules. Read the supplied specifications, accepted ADRs, relevant contracts, and existing patterns. Resolve paths relative to the target repository; these sibling links refer to the current document collection.

If required context is unavailable, identify the gap and prepare the useful portion of the draft. Do not invent product behavior, architecture, command names, or repository references.

## Determine the requested outcome

- **Draft or refine:** produce a local proposal. Do not create or modify Linear objects merely because MCP is connected.
- **Publish drafts:** when authorized, publish the specified scope into Backlog without implying readiness approval.
- **Publish ready work:** require recorded human approval of the actual criteria/scope and satisfaction of the readiness gate before Ready.

Use existing session authorization. Do not ask again for already approved actions or for each issue in an authorized batch. A request to write tickets is not approval to implement them or decide unresolved product behavior.

## Prepare the tickets

1. Inventory the relevant specification sections and record their revision. Extract explicit requirements, constraints, and unresolved decisions with stable requirement IDs.
2. Inspect existing implementation and tests when available. Read existing Linear work through MCP when connected to the intended workspace/team. Reuse established mappings and investigate possible duplicates.
3. Propose outcomes and useful delivery increments. Detail the next slice and keep later work broad. Leave unsupported owners, estimates, priorities, and dates unset.
4. Identify shared-contract dependencies and decisions needing ADRs. Record work dependencies as relationships; keep session scheduling and ownership claims outside tickets.
5. Draft the tickets using the rules below. Mark material uncertainties as open decisions and leave affected implementation work unready. Use a bounded investigation ticket when resolving uncertainty is itself useful work.
6. Check requirement coverage, duplication, contradictions, and dependency cycles. Present the proposal and unresolved decisions for the required human review.

## Ticket detail: describe the WHAT, not the HOW

Include:

- Concrete acceptance criteria: testable conditions, not "it works."
- Explicit edge cases: required behavior the implementer should not have to invent.
- Explicit non-goals: deliberate exclusions.
- Constraints: compatibility, security, tenancy, architecture, or scope boundaries.
- Pointers to actual existing patterns and accepted contracts/ADRs.
- Verification instructions: real test commands, example requests/responses, screenshots, or observable evidence appropriate to the behavior.

Exclude step-by-step implementation instructions, unapproved code-level design decisions, private-context assumptions, and coordination instructions for another ticket or session. Discuss implementation approach in conversation or the existing issue/PR; create a separate committed plan only when explicitly requested. Keep the general engineering checklist in the PR rather than copying it into tickets.

Match detail to ambiguity. Familiar, repetitive work can use short criteria plus an existing-pattern reference. Novel work needs fuller criteria, edge cases, and clarification when required. Missing rate-limit, retention, error, or permission policies that affect behavior are decisions to resolve, not defaults to silently choose.

Another developer or agent must be able to implement from the written artifacts. Agent-generated tickets describe behavior, constraints, and verification and still require human approval before becoming ready. Roadmap approval does not automatically approve individual generated tickets.

Use the ticket template in docs/workflows/SPECS_TO_BACKLOG.md, combining headings where appropriate. Preserve the substance without padding familiar work. An investigation ticket instead states its question, scope boundary, evidence/deliverable, and completion criteria.

## Publish through Linear MCP when authorized

For functional-story publication, create or reuse one unassigned, unestimated Verification sub-issue according to [TESTING_OWNERSHIP.md](../policies/TESTING_OWNERSHIP.md). Read existing children before creation; preserve their identities and human edits. Keep parent criteria authoritative, copy team/project/milestone associations, and record both IDs in the publication mapping. Do not invent testers or Sprint selection; those are set during planning. Decision/investigation items use their accepted deliverables.

Confirm the workspace/team and inspect actual available tools and workflow states. Re-read relevant objects before mutation. Use stored IDs and source/task identifiers to match work; titles alone do not establish identity.

Create or reuse the authorized structure, then issues, then supported relationships. Immediately record returned object IDs, issue identifiers, URLs, and proposal/source revision in the established mapping artifact. Read back the results to verify descriptions, state, and relationships.

After an uncertain write, query Linear before retrying. If the intended object cannot be identified unambiguously, stop that item's mutations and report the uncertainty; do not keep recreating it. Preserve partial progress and unrelated human edits. If MCP is absent or a required property is unsupported, provide a ready-to-publish draft and an explicit remaining action without claiming publication.

## Deliver

Return the roadmap/next-slice proposal or the requested ticket drafts, requirement-to-work coverage, unresolved decisions, and readiness/approval status. For publication, additionally report created, reused, updated, skipped, and incomplete items with actual Linear links.

## Example requests

```text
Use docs/workflows/SKILL_CREATE_TICKETS.md to draft the next slice from docs/.
Read existing Linear work, but do not publish yet.
```

```text
Use docs/workflows/SKILL_CREATE_TICKETS.md to publish the reviewed batch to team ABC.
Publish unapproved drafts into Backlog. Readiness approval covers only
the ticket IDs and proposal revision already recorded in this session.
```
