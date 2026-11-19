> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# ADR-017: Ideeo-owned native conversation and execution

Date: 18 November 2026. Status: direction confirmed and incremental development authorized by the user; independent acceptance and production approval pending.

## Decision

Ideeo owns conversation reasoning, execution, authority checks and task lifecycle. Borrow useful architecture and design choices from OpenMausBot without installing its application runtime above the engine or vendoring/forking it. The target browser executor is [Vercel agent-browser](https://github.com/vercel-labs/agent-browser), called through an engine-owned adapter. This is a browser automation dependency, not a new browser engine.

This supersedes OpenMaus runtime adoption as the intended destination of the bounded [ADR-015 trial](015-openmaus-browser-trial.md). Existing Browser Use/OpenMaus implementations and their qualification limits remain until their consumers are explicitly migrated; this decision does not declare them removed or qualify agent-browser. ADR-016 is reserved by the separate, unmerged browser experiment.

## Scoped implementation

`ENGINE_CONVERSATION_RUNTIME=legacy|native` is an explicit startup choice, defaulting to `native`. Native source-free conversation is a separate service, not a subclass of the legacy assistant. Startup constructs no legacy capability planner or handlers for that path. Both implementations use shared encrypted turn reservation, event persistence, caller binding and conversation leases.

Native supports ordinary questions, drafting, revision and retained conversation
recall. With trusted `ENGINE_PUBLIC_RESEARCH_FILE` profiles, its typed tools list
and inspect existing public research tasks in the same conversation, query retained
observations, correct the same task and request cancellation. The loop permits at
most four tool calls and five inference steps per turn, with existing per-attempt
budgets, disclosure checks and request deadlines. Explicit `task_target` list,
progress, correct and cancel requests need no inference and use the same journal.
Inspection and selection expose scoped task labels and revisions for those explicit
controls. A read of retained customer text or evidence closes the mutation phase;
an ambiguous target is selected in a subsequent explicit control request.

Public answers bind exact source excerpts to engine-owned observation handles,
entity attribution, capture times and goal revisions. Short passages and complete
sentence context preserve price qualifiers; unsupported display paraphrases are
not published. Prior observations remain labelled after correction. Task controls
use the shared durable transition and action fence; a control and its turn receipt
commit atomically. A later reply failure preserves authorized partial content and
the control receipt. Replays do not reapply mutations. Cancellation remains pending
until the task's assigned worker confirms cleanup; native conversation does not
own or launch that worker or a browser.

This increment remains synthetic-only for public research. It does not create
research tasks, acquire pages, compile revised requirements or migrate legacy
conversations/tasks. Existing runtime bindings, deadlines and spent budgets remain
intact. Explicit banking selections, media and new background requests remain
unavailable. Background execution configuration cannot be combined with native
conversation at this stage.

Each conversation and turn records its runtime version. Unmarked records belong to legacy; a runtime mismatch fails explicitly. There is no automatic fallback and no model/client-controlled runtime selection. JSON, SSE, replay and transcript use the existing authenticated v2 interface. The separate domain API routes keep their current ownership and authority boundaries.

Model input is a permitted projection of user text and eligible native replies, separate from the customer transcript. No domain catalogue, financial result or raw principal is added to this projection. Public evidence enters only the scoped tool-result catalogue; task-result prose is not recycled as conversation memory. Account references in retained customer text are masked under current policy. Replies generated with task metadata retain engine-selected task dependencies, including on transitive memory reuse. Memory is bounded to twelve candidate turns and 24,000 complete text characters; unavailable context is omitted. Source references retain their original scope, expiry and profile requirements; repeated references are checked once per authorization boundary, with no cache shared across model attempts. Reload does not rerun inference.

The existing model catalogue, explicit approved failover routes, per-attempt observations, atomic budgets and tenant disclosure policy remain authoritative. Authority, profile, memory and lease checks surround inference and publication. Cancellation joins terminal persistence and lease release. Failed model output grants no tool authority.

Later increments add the direct agent-browser adapter and operational/consumer integration. Browser destination qualification, provider credentials, approved data processing, tenant backend selection and protected host banking remain governed by the existing contracts. No new browser destination or real-tenant model disclosure is enabled here.

## Consequences and verification

Native is the default by explicit user direction. Its current input is text; retained public-task tools are configured separately. Operators needing new domain/background execution must explicitly select `legacy`. Operators must start a new conversation after changing runtime; there is no migration of legacy active tasks. A shared persistence implementation avoids a second journal but requires legacy lifecycle regression coverage.

See [setup](../reference/SOURCE_REFERENCES.md#source-8f929a906ccd), [shared interface](../contracts/SHARED_INTERFACE.md) and the [verification index](../reference/development/VERIFICATION.md) for actual implementation evidence. Developer tests and synthetic live-provider checks do not satisfy independent human acceptance.

Affected register entries: LR-01/02/03/04/05/12 for privacy, secrecy, processing, providers and retained records. Relevant ISO/IEC 27001 controls include A.5.15/A.5.18, A.5.19/A.5.20, A.5.34, A.8.15, A.8.29 and A.8.32; ISO/IEC 42001 includes A.6.2.4, A.6.2.8 and A.7.2. Legal interpretations and production processing approval remain with the authorized owners.
