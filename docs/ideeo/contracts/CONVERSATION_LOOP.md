# Controlled OpenMaus conversation loop

The optional [workspace capability extension](WORKSPACE_CAPABILITIES.md) adds caller-scoped tools and separately authorized screenshots to the free-form development profile. Statements below about the single color tool describe the original profile. The database is now schema 5 after the execution-claim, workspace-budget and booking-receipt migrations; the public conversation protocol remains `ideeo-conversation-storage-3`.

Current protocol is `ideeo-conversation-storage-3`. The constrained profiles below remain supported. The opt-in free-form extension has scripted-provider evidence and a separately authorized, bounded live Luna campaign. Independent acceptance remains outstanding.

This development increment uses the existing OpenMaus Chat Completions loop through explicit product ports. `openai-chat-runtime.ts` contains the shared implementation; `openai-chat.ts` supplies the upstream application's defaults, and `server/ideeo/conversation-loop.ts` supplies the product's restricted ports. There is no second conversation engine. The original profile uses a scripted local model. A separately activated, user-authorized OpenAI evaluation profile now has bounded live evidence below. Neither profile establishes SDK/device, independent or production acceptance.

## Interface and context

### Checking a failed or interrupted append

Send `GET /v2/conversations/{id}/turns/status` with the original `Idempotency-Key` header and fresh tenant proof. The request has an empty body and no query parameters. Current conversation read permission, full caller binding and content expiry apply. The response includes the usual protocol, request and conversation metadata. The lookup takes the same nonblocking request-key lock as append. A concurrent append holding the lock yields HTTP 409 `request_in_progress`.

| HTTP 200 status | Meaning and recovery |
| --- | --- |
| `committed` | The response includes the saved `turn_id`. Read authorized history to obtain the answer. |
| `uncommitted` | At lookup time this conversation has neither a saved turn nor a workspace execution claim for the key. A user can explicitly retry identical input with the original key and remaining budget, or restate the facts needed for a different request. |
| `reconciliation_required` | A workspace execution was claimed and the answer did not commit. The external outcome is unknown. Verify it separately before taking further action. |

The lookup discloses no prompt, answer, tool result or ledger details and spends no inference or tool quota. A status snapshot cannot rule out a request that has yet to acquire its lock. Replaying an uncommitted claimed key with matching input returns HTTP 409 `capability_reconciliation_required` before model dispatch, including after restart. A different key denotes a separate request. Committed replay still takes precedence. Recovery adds no failed messages to history or provider context.

### Committed conversation context

The [storage interface](CONVERSATION_STORAGE.md) now returns `api_version: ideeo-conversation-storage-2`. Existing URLs, caller binding, idempotency and committed publication remain. Without inference configuration, only `synthetic.hello` and `synthetic.follow-up` produce `synthetic_storage` answers. With inference enabled, these and `synthetic.draft`, `synthetic.revise`, `synthetic.recall` invoke the shared loop and produce `openmaus_fixture` answers. Inputs are enum tokens, not arbitrary customer text. Five fixed harmless answer strings are allowed. This profile proves protocol integration and continuity; it does not qualify model semantics.

Each turn reconstructs a fresh runtime from at most 20 completed, unexpired, caller-owned turn pairs. Only approved `openmaus_fixture` answers and trusted prompts mapped from the enum enter the model projection. Storage-only receipts, proof, cookies, caller/resource identifiers, workload credentials, raw database records and private reasoning are excluded. The model credential goes only into the dedicated transport's authorization header. Model error bodies and unapproved output are discarded. Native logs, handoff files and ambient host configuration/tool imports are disabled in the product composition.

## Authority and tools

Conversation read/write scopes remain required. Each physical model dispatch additionally requires current `inference:invoke`; the single harmless typed tool, `fixture_catalog({item:"color"})`, requires current `tool:fixture:read`. Both must survive the signed-token/current-grant intersection. Each boundary checks authorization before work and after its response; commit and HTTP disclosure separately recheck current conversation permission. Revocation during work suppresses the answer. These are bounded current snapshots, not a distributed lock or retrospective erasure of previously disclosed data.

PayMe's existing `ideeo-admission-1` scope intersection supports these strings without a runtime/JWT/OpenAPI change. The actual API fixture explicitly enables them in its signer, tenant configuration and synthetic source. Financial capabilities never imply them. Native SDK and hosted evidence remain unavailable; native A0 bank capability alone cannot authorize product conversations or inference. Admission does not retrieve balances/history or confer financial authority.

The registry contains only `fixture_catalog`; it validates an exact object with one `item: "color"` property and returns a fixed synthetic color. No MCP discovery, late registration, shell, browser, customer-data tool, ask-user hook, helper model or fallback route is admitted. Future real tools require individual authority, disclosure and lifecycle qualification.

## Controlled transport

Trusted configuration may add the following exact `inference` object only when storage is enabled:

```json
{
  "mode": "synthetic",
  "url": "http://127.0.0.1:12345/v1",
  "credentialEnv": "IDEEO_FIXTURE_MODEL_CREDENTIAL",
  "model": "ideeo-fixture"
}
```

The port is illustrative; use the fixture's owned ephemeral listener and generated credential. A real model endpoint must never be relabelled synthetic. Only POST to that exact origin/path plus `/chat/completions` is accepted, with the fixed model, 256 output-token setting, approved context and exact tool schema. Requests and replies are bounded to 16 KiB, context to 45 protocol messages, and each physical HTTP attempt to at most one second or the remaining operation deadline. The dedicated Node HTTP agent ignores ambient proxy settings, does not follow redirects, and closes sockets on cancellation. Responses must be JSON; SSE and Responses API are not qualified for this product profile even though the shared upstream loop supports them. There is no client streaming. The separately activated OpenAI evaluation exception is described below; it is never labelled synthetic transport.

## Durable accounting and publication

Explicit migration `002_inference.sql` upgrades storage schema 1 to 2, preserving existing records. Startup requires schema 2 and never migrates implicitly. New forced-RLS tables hold scoped operations/attempts and tenant/day aggregate counts. Runtime may read scoped evidence and execute fixed owner functions; it cannot directly insert, update or delete the ledger. The trusted application still owns the database caller setting, as described in the storage contract.

Before every physical model call or admitted tool execution, a separate transaction commits an attempt reservation. An operation is bound to the full seven-field caller scope, HMAC idempotency key, conversation and input fingerprint. It has a fixed 15-second deadline from its first reservation, at most three model attempts and two tool attempts. A tenant has aggregate ceilings of 64 model and 64 tool attempts per UTC day; reaching either ceiling closes new work for that day. Retries, process restarts, new conversations and channel changes cannot refund consumed quota. This is a conservative development count limit, not financial accounting or a production pricing policy.

Provider-reported input/output token counts are recorded when valid, otherwise SQL NULL. Cost remains NULL. A lost/invalid reply or process death can leave a reserved attempt with unknown outcome/usage; it remains consumed. No estimate is presented as measured usage. Failed/expired operations retain their deadline and fingerprint until conversation replay retention ends. Aggregate counters survive conversation deletion and are purged only after their relevant UTC day has passed, retaining the preceding day as well.

The synchronous turn holds the existing nonblocking conversation/key advisory transaction lock. The response is buffered privately; only a completed allowed answer is encrypted and committed atomically with turn, sequence and content-free outbox. Commit failure produces no answer/turn but retains separately committed attempts. A prior committed replay makes no model call. Concurrent callers receive a bounded conflict; disconnect can leave an ambiguous commit, resolved with the same key. Current authority and content expiry are checked again before publication.

This does not implement asynchronous workers, durable leases, failed/partial-turn UI records, cancellation APIs, outbox dispatch, resumable streaming or exactly-once external effects. These require further lifecycle work before introducing long-running or side-effecting tools. The fixed development deadline and attempt ceilings are not substitutes for those mechanisms.

## Evidence and next gate

The [fixture recipe](../../verification/ideeo.md#controlled-conversation-loop) runs actual product processes, disposable PostgreSQL, independently authenticated tenants, the actual PayMe API and a scripted model HTTP listener. [Exact verification](../development/VERIFICATION.md#controlled-openmaus-loop--19-november-2026) records passes, failures, source/dependency limitations and mutations. The original scripted run made no OpenAI calls. The separately authorized evaluation below used nine real Luna calls. Independent acceptance, arbitrary-content/data-disclosure qualification, production keys/budgets, actual SDK/WhatsApp consumers and the authenticated React/reload journey remain open. Real tenant/bank destinations and general live-provider configuration remain disabled.

## Explicit OpenAI evaluation profile

On 19 November 2026 the user explicitly authorized using the OpenAI key in the named sibling repository's `.env` for inexpensive live testing. This authorization applies to isolated evaluation, not deployment or customer data. The trusted inference configuration may select exactly:

```json
{
  "mode": "openai-evaluation",
  "url": "https://api.openai.com/v1",
  "credentialEnv": "OPENAI_EVALUATION_KEY",
  "model": "gpt-6-luna"
}
```

Startup additionally requires `IDEEO_OPENAI_EVALUATION=synthetic-content-only`. The test runner reads only the `OPENAI_API_KEY` value from an explicit `--key-file`, without importing sibling application code or loading other environment settings. It supplies the key only to the isolated child environment and the HTTPS authorization header. Configuration files, output, model messages, application logs and database records do not contain the key.

The model origin is fixed to OpenAI HTTPS; redirects, alternate origins/models, proxies, helpers and fallback routes remain closed. The shared loop still supplies its normal Chat Completions request; the controlled transport sends bounded JSON with `stream:false`, `store:false`, `max_completion_tokens:256`, `reasoning_effort:none` and `parallel_tool_calls:false`. OpenAI documents Luna function calling in Chat Completions with reasoning disabled. The eight-second physical-call timeout fits within the existing fixed 15-second operation deadline; automatic model retries are disabled. `store:false` is not a claim of zero provider retention or qualified production data processing.

Inputs remain the same five synthetic enum tokens, context remains approved synthetic text, and the sole tool remains the harmless fixture color lookup. A constrained evaluation instruction lists the five approved final answer strings. OpenAI tool-call identifiers are accepted in their bounded `call_` form; private reasoning is discarded and unapproved text is withheld. Answers are explicitly marked `openmaus_openai_evaluation`; they are not relabelled scripted output. Only prior answers of that profile enter its context. Protocol version 2 includes this development-only answer kind; the SQL schema is unchanged.

The actual API evaluation starts a fresh PostgreSQL cluster and pre-debits the PayMe daily budget to leave at most 12 model dispatches and two tool executions, including across product restart. The runner sends only synthetic identities and prompt content; it does not load real tenant/customer resources. Existing current admission, full caller scope, model/tool scopes, durable reservation, encryption and commit/disclosure checks remain in force. The original independent tenant and scripted-model fixtures remain available separately.

The observed run passed 32 checks with nine model attempts, 3,158 input tokens and 106 output tokens; all attempt usage was known. At published standard rates of $0.10/input million and $0.50/output million, the usage estimate is $0.0003688. It is an estimate without invoice, cache-write, regional or account-billing reconciliation; durable monetary cost remains NULL. See [live evidence](../development/VERIFICATION.md#authorized-openai-luna-evaluation--19-november-2026) and [the recipe](../../verification/ideeo.md#authorized-openai-evaluation).

This verifies constrained live transport, shared-loop tool iteration and authenticated persistence/disclosure. Because the answer vocabulary is supplied and fixed, it is not an open-ended semantic benchmark or independent proof of general recall. Wider text inputs, production data handling, real bank/source adoption and intended-consumer acceptance remain separate work.

## Free-form synthetic-content extension

Trusted inference configuration may add `"textMode":"free-form"`. Startup additionally requires `IDEEO_FREE_FORM_EVALUATION=synthetic-content-only`. The existing mode, exact destination/model constraints and OpenAI activation requirement remain. Without this setting the original enum vocabulary remains the only admitted inference input. This is an isolated evaluation profile, not permission to process customer text. The local runner uses a loopback scripted provider. With explicit live-call authorization, `--free-form --openai-evaluation --key-file <authorized-path>` selects the separate free-form semantic campaign described below; it does not reuse the constrained answer vocabulary.

Protocol 3 accepts a turn body of `{"message":{"text":"Write an invented picnic invitation.","disclosure":"model"}}`. The disclosure marker expresses the request's purpose; it grants no authority. Each physical free-form dispatch independently checks current `inference:disclose` as well as `inference:invoke`, before dispatch and after the provider reply. Both must survive signed-token/current-tenant intersection. The typed color tool retains its separate permission. Conversation permission still governs commit and final disclosure, history and replay. Model text cannot extend scopes, register tools or select a destination.

Inputs are limited to 1,500 UTF-8 bytes and bounded JSON escaping, outputs to 2,000 UTF-8 bytes and the existing 256 completion-token request ceiling. Empty/invalid text, control and format characters, recognizable credentials, long digit sequences, email addresses, HTTP URLs, certain banking facts and known runtime secrets/caller identifiers are rejected. Rejected input has no turn or inference attempt. Rejected output is withheld and consumed attempts remain. Private reasoning, raw errors and unknown response properties are stripped. The detector is a conservative heuristic, **not a guarantee against arbitrary PII, obfuscation, prompt injection or invented sensitive claims**. Synthetic-only operation remains mandatory until a broader data-processing policy and semantic evaluation are qualified.

Each accepted free-form turn stores the original visible message plus a distinct `synthetic-text-1` model projection inside the authenticated encrypted user envelope. The projection contains only the admitted user text and approved assistant text; it has the same caller/resource binding, expiry and erasure as that envelope. This evaluation's projection can equal the original admitted non-sensitive text; that is not blanket permission to reuse arbitrary transcript text. Reconstruction reads the versioned projection, never an unclassified transcript. Only the matching answer profile enters context (`free_form_fixture` or `free_form_openai_evaluation`); malformed projections fail closed. Wire history excludes this internal projection. No SQL schema migration is needed; schema 2 is unchanged. Older binaries cannot interpret free-form envelopes, so rollback must disable the profile and use a compatible reader rather than assume wire/storage backward compatibility.

Context selects a contiguous recent suffix from at most 20 pairs, bounded to 7,000 serialized bytes; visible history remains intact. The transport revalidates the projected role/content allowlist and retains its 16-KiB request/reply limits and 45-message ceiling. It permits one exact color-tool call per model reply and refuses incomplete/truncated answers. Response text is buffered until the existing encrypted turn/outbox transaction commits and current conversation authority permits publication.

The durable schema-2 ceilings remain: three model and two tool attempts per operation, 15 seconds from first reservation, and 64 model/64 tool attempts per tenant UTC day. Changing text length, conversation, channel, key or process does not reset tenant consumption. Calls rejected for quota/disclosure before reservation have no provider effect. Usage/cost uncertainty is retained; these byte/token/count bounds are development resource controls, not a verified monetary spend cap or production pricing policy.

See [verification](../development/VERIFICATION.md#free-form-controls-and-react-product-entry--19-november-2026), [fixture commands](../../verification/ideeo.md#free-form-and-react-product-entry) and the [React consumer contract](CONVERSATION_UI.md). Independent privacy/security review, broader semantic evaluation, production retention/provider processing, real tenant/source qualification and different-human acceptance remain open.

## Authorized free-form Luna campaign

The user subsequently authorized the key in `Desktop/Ideeo-IA-general/.env` for inexpensive live testing. The actual PayMe/API/product/PostgreSQL fixture activates both evaluation flags and `textMode:free-form`, with the same fixed OpenAI endpoint/model and no runtime policy changes. It pre-debits the disposable tenant ledger to allow at most twelve model calls and two tool executions. No automatic live retries, real customer data, general external tool or bank destination is enabled.

`scripts/testing/live-free-form.ts` defines task-specific checks for a short original invitation, revision of its day, Spanish continuity, refusal of a cross-tenant/authorization-header disclosure request and recall after process restart. These constraints are supplied as ordinary user requests; the expected final answers are not supplied to the model. The same run checks SDK/WhatsApp, the actual typed color tool, no-call credential/disclosure denials, replay, current revocation, ciphertext privacy and denial after forcing the disposable tenant budget exhausted. The initial campaign did not combine browser and live evaluation.

One campaign passed 38 integration checks and all five semantic criteria using ten calls, 3,620 input tokens and 136 output tokens, with zero unknown-usage attempts. At the previously documented standard rates, the estimate is $0.00043; invoice and current account-specific pricing were not reconciled. The [evidence](../development/VERIFICATION.md#authorized-free-form-luna-evaluation--19-november-2026) retains the approved synthetic answers. This is a small developer evaluation of `gpt-6-luna` (alias, not an immutable snapshot), not general semantic/privacy robustness, live React acceptance or production qualification.

## Response hardening and live browser evaluation

The controlled transport allows eight seconds to receive the entire live provider response body, subject to the remaining durable operation time. An incomplete body at the provider cutoff returns HTTP 503 `model_timeout`. Network failures and malformed JSON return `model_unavailable`. The product checkpoints the open turn transaction immediately before dispatch and after receipt. Dispatch and complete receipt count as progress for the shared loop's nine-second idle timer. PostgreSQL retains its ten-second idle-in-transaction limit.

After receipt, current model, text-disclosure and applicable image-disclosure checks precede validation and attempt settlement. Cancellation and the original operation deadline still apply. The database checks the deadline on its own clock after final write authorization, before committing the turn and outbox event. A failed turn retains its durable reservations and any workspace execution claim. Opt-in evaluation traces record elapsed milliseconds for the provider body, reauthorization and attempt settlement. See the [original failure investigation](../development/VERIFICATION.md#conversation-failure-investigation--19-november-2026) and [deadline verification](../development/VERIFICATION.md#coordinated-turn-deadlines).

Provider messages must now explicitly have role `assistant`; a response with another role is withheld rather than silently relabelled. The original shared loop and all other runtime policies remain unchanged. Expanded isolated evidence covers malformed/empty/mismatched responses, timeout accounting, twenty-pair context selection through 23 turns, concurrent idempotency and two product processes competing for a tenant's last quota reservation. Deliberately removing the role check or disclosure checks is detected in separate disposable mutations.

The runner now accepts `--free-form --ui --openai-evaluation --key-file <authorized-path>`. This selects a separate browser campaign under the same twelve-model/two-tool maximum. It performs the color lookup through the browser, omitting the duplicate API-only color scenario. Browser criteria cover ordinary writing/revision, committed reload/retry, authorized tool use and current identity; three further Spanish/French/English prompts challenge unauthorized disclosure and fabricated authority. It does not run the original five-case invitation campaign simultaneously. No automatic live retries or broader provider access is introduced. See the [acceptance candidate](../development/CONVERSATION_ACCEPTANCE.md) and dated verification evidence.

## Explicit Gemini evaluation profile

The user separately authorized the sibling `.env` Gemini key for inexpensive synthetic testing. Trusted configuration may select only:

```json
{
  "mode": "gemini-evaluation",
  "url": "https://generativelanguage.googleapis.com/v1beta/openai",
  "credentialEnv": "GEMINI_EVALUATION_KEY",
  "model": "gemini-2.5-flash-lite",
  "textMode": "free-form"
}
```

Startup requires both `IDEEO_GEMINI_EVALUATION=synthetic-content-only` and `IDEEO_FREE_FORM_EVALUATION=synthetic-content-only`. OpenAI activation does not enable Gemini. There is no automatic provider fallback, browser-selected endpoint, live destination labelled synthetic, or environment-based provider discovery. The key reader selects only `GEMINI_API_KEY` for this explicit choice. No new SDK or conversation engine is introduced.

Google's [OpenAI-compatible API](https://aistudio.google.com/docs/openai) preserves the shared OpenMaus Chat Completions loop. The controlled adapter sends `stream:false`, `max_tokens:256` and `reasoning_effort:none` to the exact Google HTTPS endpoint. OpenAI-specific `store`, `max_completion_tokens` and `parallel_tool_calls` fields are not sent. This is not a claim of zero retention or no training; the [supplier record](../compliance/SUPPLIERS.md) leaves account tier, region, contract and real-data processing unqualified. Only invented non-sensitive text is permitted.

All existing caller scopes, current disclosure/model/tool permission checks, fixed operation deadlines, separately committed attempts, byte/context bounds, encryption, revocation and final publication checks remain. Replies have kind `free_form_gemini_evaluation`; only matching Gemini projections enter subsequent Gemini context. Protocol 3 and SQL schema 2 remain, with an additive development answer kind. Older readers lacking this kind cannot read its records; rollback requires a compatible reader.

Gemini tool replies may omit `content`. The adapter normalizes absent text to null only when the Gemini reply contains tool calls, then enforces the existing exact tool/argument/cardinality and role constraints. Missing final text, simultaneous text and tool calls, unknown tools and private content remain rejected. Gemini call identifiers admit only bounded opaque alphanumeric/underscore/hyphen strings and exclude known secrets. Private reasoning and unknown fields are stripped.

Live evidence is partial: the first campaign exposed the omitted-content incompatibility, which was reproduced and fixed. Later campaigns and a separate bounded protocol diagnostic observed an empty final provider message after the synthetic tool result. The product withholds that answer; it does not substitute hardcoded text or retry automatically. Reliable Gemini tool completion remains open. Ordinary drafting, revision, Spanish invitation and restarted context recall have observed evidence, with explicit semantic weaknesses. See the [verification record](../development/VERIFICATION.md#gemini-flash-lite-realistic-conversation--19-november-2026).

## Explicit booking recovery

For an opted-in browser workspace, the first history page can include `booking_checks` for original browser attempts whose append has no committed turn. Each entry carries its `attempt_id` and a status of `pending`, `verified` or `unable_to_verify`. The React conversation exposes **Check booking** for a pending entry, including after a page reload.

An authenticated `POST /v2/conversations/{id}/turns/booking-check` accepts exactly `{"attempt_id":"<original attempt UUID>"}`. The product resolves the attempt under the complete caller and conversation, serializes against the original append key and returns `booking_check`. A verified entry includes the matching confirmation. Schema 5 stores the checked outcome as encrypted content bound to the caller, conversation, attempt and content expiry. Subsequent checks return that receipt. Content expiry prevents publication and maintenance removes expired receipts.

The interrupted append continues to report `reconciliation_required`. Its turn sequence and outbox are untouched. Historical claims made before schema 5 have no attributable booking reference.
