> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Planning and optional Jev routing profiles

## Native OpenAI and tenant model selection

HTTP 429 responses with bounded structured `error.code` or `error.type` equal to
`insufficient_quota` become non-retryable `provider_quota_exhausted`. Other 429s
remain retryable `provider_rate_limited`; raw provider error prose is not exposed
or retained, and the classification reader is bounded to 8 KiB. HTTP 401/402/403
remain non-retryable `provider_access_denied`. Public research stops on quota/access
failure while retaining partial findings; those errors do not trigger customer
reauthentication or browser recovery. This does not add automatic provider fallback.

`ENGINE_PLANNER_PROVIDER=openai` selects the native Responses adapter with
`OPENAI_API_KEY` and `ENGINE_OPENAI_MODEL` (development default `gpt-6-luna`).
It sends `store: false`, an engine-owned strict JSON schema, no provider tools,
one bounded HTTP attempt per adapter invocation. Engine-owned qualified failover
is defined below. Provider refusals, incomplete output,
unknown output items, mismatched models, invalid usage, credential echoes and
oversized bodies fail safely. Optional fields become required nullable fields
for OpenAI generation; local domain validation remains authoritative. Schemas
that cannot preserve the supported strict semantics are rejected before I/O.
Responses may contain completed assistant commentary followed by one explicitly
phased `final_answer`. Validate all messages, discard commentary and parse only
that final structured result; intermediate updates never become domain actions
or customer dialogue. A single legacy unphased result remains supported.
Commentary-only, ambiguous/multiple finals, unknown phases, malformed commentary,
refusals and provider tool calls still fail closed. This is stateless parsing;
no provider continuation or raw commentary is retained. See OpenAI's
[message phase contract](https://developers.openai.com/api/docs/guides/reasoning#phase-parameter).
See [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
and the [Luna profile](https://developers.openai.com/api/docs/models/gpt-6-luna).

Published tenant configuration can select separate registered profiles for
conversation, configuration assistance and knowledge questions. The platform
catalog binds exact provider/model, eligible tenants/purposes, qualification,
credential references and processing references. PostgreSQL catalog updates and
their audit commit atomically; an operator file is a read-only bootstrap source.
`ENGINE_MODEL_PROFILES_DATABASE_URL` (or the existing assistant-profile database)
provides scoped runtime reads. Missing/unavailable catalog state never selects
an unregistered provider. Credential aliases additionally require server-owned
`ENGINE_INFERENCE_CREDENTIAL_BINDINGS`; catalog text cannot select unrelated
host secrets. Default provider keys retain their existing server settings.

Synthetic exemptions require the server's exact synthetic-tenant allowlist and
current synthetic source context; a catalog checkbox is insufficient. Real
processing also requires registered processing references and the independent
exact tenant data-policy route. Disabling/rebinding a selected profile fences
inference and later dispatch. `GET /v2/model-profile` reports the currently
authorized configured route without inference; recorded observations separately
identify the model that actually answered. Connectivity diagnostics use a bounded
synthetic probe and do not qualify model quality or real-data processing.

## Current planner and router profiles

The server-owned factory selects `GeminiPlanner`, `OpenRouterPlanner` or `OpenAIPlanner` for the explicitly configured `gemini`, `openrouter` or `openai` provider. All implement `plan(message, authorized_accounts, pending_balance)`, returning the same typed extensible `TaskPlan` with profile `goal-plan-v1` / `task-plan-v1`. The prompt is shared in `src/ai_engine/prompts.py`. The coordinator resolves capability names against its qualified executor registry. Only `bank.balance` is executable in this increment. Other and mixed goals are represented honestly and reported unavailable before any partial action. The planner has no bank tools, credentials or authority.

The OpenRouter generation adapter uses the fixed chat-completions endpoint, `google/gemini-3.8-flash`, strict JSON-schema output and local strict validation. It requires `OPENROUTER_API_KEY`; direct Gemini requires `GEMINI_API_KEY`. The factory does not infer the provider from whichever credential happens to be present. OpenRouter planning is separate from Jev routing even though they use the same service credential. Both can be selected explicitly with their own profile configuration.

The development OpenRouter planner requires supported parameters and a Google AI Studio upstream, disables provider fallback/redirects, allows one HTTP attempt per invocation, bounds the decoded body to 64 KiB and uses the existing deadline/output/day budget. Refusal, truncation, malformed/privileged plans, unexpected model/upstream, invalid/non-finite usage, echoed credentials, billing/access failures and timeout are safe failures. Unknown usage remains unknown; native usage extensions and supplied upstream provenance are retained without response text or private reasoning. See [verification](../reference/development/VERIFICATION.md).

Optional `JevRouter.route` uses OpenRouter's Decisions API with the pinned development candidate `typesafe/jev-1.14`. A confident balance-only route may skip planning; uncertain, new or mixed requests go to the planner. Jev is disabled by default and requires its process-environment key plus an explicit development threshold. Authorized synthetic live checks now establish API compatibility and developer observations; production qualification and confidence calibration remain open. See [routing observations](../reference/development/VERIFICATION.md). See [the coordinator contract](AGENT_COORDINATION.md) for exact decision validation, data minimization, errors, provider sources and confidence semantics.

Every actual customer inference attempt consumes the atomic grant/day budget.
Tenant-profile conversations and knowledge answers support the bounded automatic
failover below; administration assistance uses its tenant/day allowance and a
separate accounting receipt for each attempt. The existing whole-request
deadline still bounds combined processing. Failed attempts retain content-free
provider/model/error observations and unknown usage rather than zero cost.

## Automatic failover for stateless tenant profiles

A platform-owned model profile can declare `fallback_profiles`, an ordered list
of at most two other registered profile IDs. The selected primary is tried once,
then each listed backup at most once. Nested backup lists are not followed. An
empty list preserves a single attempt; credentials alone never create a route.

The engine advances only after a retryable `provider_timeout`,
`provider_unavailable` or `provider_rate_limited`. Refusals, invalid/truncated
output, access/billing failures, missing credentials, catalog/policy failures,
accounting failures, cancellation and budget/deadline exhaustion stop inference.
There is no implicit retry loop, speculative parallel call or provider-side
automatic redirect. OpenRouter's own upstream fallback remains disabled.

Before every outbound attempt, the backup must be enabled and qualified for the
same tenant and purpose, have approved credential/processing references and pass
the current exact tenant data-policy route. Customer authority, conversation or
knowledge-source binding, synthetic-source eligibility and budgets are rechecked
after awaited work. Every used profile remains subject to revocation before
later dispatch. No permission or refusal is bypassed by switching providers.

Native adapter timeouts are capped at the smaller of their configured limit and
an equal whole-second share (minimum one second) of the existing request timeout
across primary plus backups. The
logical inference also has a whole-request cap; a parent's earlier deadline or
cancellation wins. A failed primary and successful backup each consume an
attempt and retain their own actual profile/provider/model/error/usage record.
No circuit breaker or background health probing is implemented.

Only engine-owned stateless structured inference is repeated, with the same
permitted request and schema. Domain validation still applies to the resulting
answer. Bank/service effects, approval, native continuation state and tool loops
are outside this policy. A successful backup completes the same customer turn
without emitting an intermediate failure or requiring customer action. If all
eligible attempts fail, the normal explicit failed result remains.

This runtime policy is wired to registered-profile v2 conversation capture,
customer knowledge and administration configuration/knowledge assistance. A
connectivity diagnostic deliberately tests only the selected profile. The v1
planner/Jev router, environment-only adapters and background/browser planners
retain single-attempt behavior until they use a qualified tenant-profile route
with current authority, budget and observation hooks. Their existence does not
establish fallback coverage. No enabled real-tenant fallback chain is shipped;
independent review, human acceptance and processing qualification remain separate.

### Bounded recovery of an active public-task follow-up

Before any task control or effect is dispatched, conversational capture may retry
once for an existing server-bound active public research task after
`provider_truncated`, `provider_timeout` or `provider_unavailable`. The same input
and schema are used; failed output is never interpreted or replayed. Current
conversation ownership, exact model-disclosure context and budget are checked
again. Both attempts are charged and observed; existing turn deadlines apply.
Registered-profile timeout/unavailability already handled by its failover chain
does not gain another chain. A truncated registered-profile response may use this
single public capture recovery because failover does not handle truncation.

Recovery is unavailable while any uncommitted draft is pending. The recovered
decision cannot introduce banking, protected handoffs, missions, draft-cancellation
replies, an unbound provider or controls against non-public tasks.
Invalid-output repair and transient recovery share a two-capture bound, rather
than nesting into additional attempts. Refusals, authorization/policy failures,
revocation and exhausted budgets/deadlines stop. Exhaustion preserves accepted
task criteria and reports failure; it does not retrospectively capture a lost
turn. This is an engine-owned public-follow-up exception, not a change to native
adapter single-attempt behavior or permission to repeat an external effect.

The retained `Interpreter` classifier below is a compatibility port used by controlled clients/tests through `InterpretationPlanner`; it is not the normal planner. [Verification](../reference/development/VERIFICATION.md) separates current and historical provider observations.

## Historical Sprint 1 classification profile

This is the initial inference profile under [ADR-002](../decisions/002-ai-provider-adapters-and-routing.md). The user selected Gemini for Sprint 1 implementation and live verification. Bank logic depends on `Interpreter`, not the Google SDK. The model performs bounded interpretation; authority and bank execution remain engine responsibilities.

## Versioned semantics

- Port: `Interpreter.interpret(message, authorized_accounts, pending_balance)`.
- Result: typed `InterpretationResult` containing `Interpretation`, provider/model provenance, prompt revision and usage.
- Intent enum: `balance`, `ambiguous`, `unsupported`.
- Optional `account_hint`: display label/reference explicitly requested, bounded to 100 characters. It is resolved against authorized choices and cannot assert ownership.
- Prompt revision: `balance-intent-v1`; output schema revision: `interpretation-v1`.
- Provider integration: official `google-genai` SDK, `models.generate_content`, JSON-schema structured output and local Pydantic validation.
- Initial server-configured model: `gemini-3.8-flash`; the observed model revision returned by the provider is recorded. Model access must be confirmed with real calls; a configured name is not qualification.

The input JSON is untrusted content under a server-owned system instruction. It contains only the current bounded message, authorized account display choices and whether the previous turn requested account clarification. No signing keys, bank/provider tokens, full principal, money result or privileged grant records are supplied. Display labels remain data and cannot change system instructions.

The final balance is rendered deterministically from the authorized bank result. The provider does not need to see the balance for this flow. An unsupported/ambiguous result must not trigger a bank read.

## Capabilities and policy

This profile supports stateless text classification with structured output. It does not implement generation/tool loops, embeddings, provider-hosted banking tools, arbitrary modalities, native interaction continuation, or automatic provider fallback. Those require their own task-facing contracts and qualified profiles. No opaque reasoning/signature artifact is flattened into domain data or transferred to another provider; this classifier makes one independent request per turn and stores no provider session.

Provider key, endpoint/API selection, model and budgets are operator-controlled. Request text cannot select a model, endpoint, route, system prompt or credential. Only the Google SDK's configured provider endpoint is used. Synthetic data is the permitted classification data in this development profile; real tenant data needs an approved provider/region/retention profile first.

## Failures and budgets

The [tenant data policy](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md#model-disclosure) is checked before inference spending/calls, including the optional router. Models receive request-local account aliases; labels require explicit enablement, and actual bank results are rendered outside the model. Exact aliases are mapped back before deterministic authorization. Native usage extensions remain available in encrypted task state; ordinary stored evidence uses a runtime-validated schema. Earlier live qualification used the prior prompt projection and does not establish Spanish quality of this changed projection; controlled regression checks are separate evidence.

The SDK is configured for one attempt, bounded wall-clock/HTTP deadlines and output tokens. Max-token termination, refusal/blocked/no candidate, malformed/schema-invalid output, access denial, rate limiting and service unavailability are visible failures. Schema-valid output is still subject to deterministic account resolution and authority checks. A provider timeout does not imply any bank operation succeeded or failed; the interpretation happens before the balance read.

Unknown token counts remain null. Retain native provider usage fields alongside normalized input/output/reasoning/total counts; missing counts are not zero. Store safe provider/model/prompt/usage metadata, not credential values or raw SDK exception bodies. A reserved inference attempt consumes the development budget even if it fails; changing the request ID or idempotency key does not reset the grant/day counter. There is no automatic cross-provider retry to bypass a refusal or exhausted budget.

## Qualification and evidence

Deterministic adapter checks cover strict output parsing, provider failures, truncation/refusal, missing usage, timeouts and credential-free inputs/errors. Opt-in live checks exercise synthetic Spanish paraphrases, account selection, ambiguity, unsupported requests, and the HTTP workflow. Record dataset/profile revisions, actual SDK lockfile, model response revision, per-case expected/observed outcome, forbidden bank-read checks, timing and token usage.

Live calls are explicitly enabled and bounded; they are not part of ordinary offline CI. Preserve failed observations. A successful classification proves neither real bank access nor every future model capability, and a judge cannot override an unauthorized action invariant.

Official references: [Google Gen AI SDK](https://googleapis.github.io/python-genai/), [structured output](https://ai.google.dev/gemini-api/docs/structured-output), [initial model](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash).
