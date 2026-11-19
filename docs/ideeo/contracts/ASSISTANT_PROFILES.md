> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Tenant assistant profiles and self knowledge

The shared concierge uses a tenant-owned public identity and a current,
engine-derived capability snapshot. [ADR-006](../decisions/006-tenant-assistant-self-knowledge.md)
records the design and authorization. This is part of the engine, not a UI prompt.

## Configuration

Set `ENGINE_ASSISTANT_PROFILES_FILE` to a file matching the generated
[profile schema](assistant-profiles.schema.json). See the
[PayMe development example](../reference/config/payme-assistant.example.json).

A file has `api_version: "1"` and one profile per configured tenant. Each profile
names its exact `tenant_id`, revision, assistant name, organization, public tenant
label, localized role/purpose/support guidance, boundaries, supported/default
language and tone. The current self-description renderer supports `es` and `en`;
profiles can enable either or both. Other languages need their own qualified
renderer rather than an unvalidated fallback.

Profiles bind only to existing trusted tenants. Duplicates, unexpected fields,
unregistered restriction IDs, malformed files and unknown tenant bindings are
rejected. Missing identity never borrows another tenant's branding. With no
configured profile, the existing task path remains available and conversational
identity is unavailable.

`client_capabilities` optionally narrows tools for a verified calling client;
`temporarily_unavailable` temporarily removes registered tools from concierge
dispatch. Neither can grant tools or expand authority. These are engine assistant
configuration; separate external-agent authority APIs still enforce their own
mandates independently of the conversational assistant.

The file is revalidated for current turns, description reads and publication.
Changing names or restrictions does not require an engine code change. Cache or
future storage implementations must preserve tenant/client binding and freshness.
Store public reviewed content only: no credentials, private policies, customer
identity fields or internal endpoints belong in a profile.

## Current capability facts

`src/ai_engine/capabilities/definitions.py` owns public names, descriptions,
execution modes and capability/action bindings. `AssistantService` combines that
registry with its registered handlers, current tenant/caller authority and
profile restrictions. A declaration in a profile or model response is not a
tool registration or permission.

The snapshot distinguishes `available`, `unavailable` and
`temporarily_unavailable`. Available means the tool is enabled for this session;
authorized resources, required inputs, current dependency availability and
operation-specific authorization still apply. Financial conversation tools
prepare proposals. Execution requires the current mandate or protected approval;
chat text cannot approve an operation. Never call a prepared proposal completed.

The snapshot identifies the concierge's role and source provenance as `synthetic`,
`bank` or `unknown`. A bank adapter is not proof of a production environment.
Research workers receive only their own executor/verifier role, public tenant
identity, provenance and authorized research tool; banking tools are excluded.
Task goals, budgets, observations and evidence retain their existing separate
bounded execution contracts.

## Conversation and HTTP contract

`GET /v2/assistant` requires the existing authenticated principal and current
authority. It returns the public identity/capability snapshot without inference,
balances, account references, credentials or private execution schemas. No banking
capability is required merely to describe the assistant under an active session.

The planner's `capability_capture_v3` schema can return a bounded conversational
intent alongside zero or more typed tasks. Semantic topics are identity, tenant,
role, capabilities, limitations, support, greeting and environment. Requested
tools must come from the engine registry. This uses the same provider/data-policy
gate as other inference. Only approved public profile facts and tool metadata
are added; the verified principal and actual banking results are not disclosed.

For ordinary greetings, explanations and self questions, the planner can return
a validated `reply` grounded in the current assistant snapshot. Wording follows
tenant style and the customer's requested depth; it does not override identity,
capabilities, source facts or authority. Complete replies have a 6,000-character
ceiling, not a target length. Financial results remain deterministically rendered.
The structured intent path remains available for formal inventories and mixed
conversation/task turns. The concierge builds its public `conversation` result with capability
`assistant.conversation`, requested topics/tools, current awareness and a context
digest. Financial result schemas and their deterministic formatting are retained.
At most four combined conversation/task outcomes fit one turn. Self questions
preserve an existing pending task; mixed requests keep both conversation and
typed task outcomes. Unsupported work never causes partial action execution.

Current provider generation omits nested conversation-array cardinality hints to
fit Google's structured-schema complexity budget. Local validation still bounds
topics/tools and rejects duplicates, unknown IDs and prose inside the structured
intent before dispatch. Generated wording belongs only in the validated reply
branch. This is not a relaxed authority or validation policy.

The provider's [structured-output guidance](https://ai.google.dev/gemini-api/docs/structured-output)
documents the schema subset and complexity limits; the live diagnostic and
correction are retained in the verification manifest.

The additive API/result variants are enabled only for profile-configured
consumers that support them. The local UI displays engine-authored messages and
structured details and never initiates actions from an unknown result variant.
Native app/SDK adoption needs its own compatibility qualification.

## Retention, replay and failure behavior

Within the existing caller-scoped retained conversation, sanitized model context
can include permitted nonfinancial assistant reply text. It is explicitly prior
wording, never source evidence, customer instructions or execution authority.
Current profile/access checks and account aliases still apply. Turns without an
eligible nonfinancial input, mixed protected outcomes, source-linked paraphrases
and task-derived replies are excluded; public observations keep their separate
reauthorization path. Only the latest 12 retained turns are considered, with a
24,000-character aggregate prose budget. Older replies are omitted whole and
marked unavailable rather than silently truncated. No new memory store or
retention period is introduced.

Self descriptions use the existing encrypted, caller-scoped turn/event storage
and retention. The digest binds tenant, client, profile revision and public
identity/capability/provenance facts. Publication and replay compare the complete
snapshot against current facts. Profile changes or revoked tools produce
`assistant_context_changed` (409); request a fresh turn with a new key. Replay
does not rerender, call the model or execute tools. The same checks apply to JSON,
task reads and SSE delivery.

Configuration errors are explicit `assistant_configuration_unavailable` or
`assistant_profile_unavailable` failures. Revoked/invalid sessions still fail the
normal identity/authority checks. A caller with no banking tools can ask who the
assistant is, but does not gain account access. Unrelated general knowledge,
unverified rates/fees and undocumented business facts are not invented.
