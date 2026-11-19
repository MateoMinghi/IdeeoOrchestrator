# Consumer conformance for IdeeoOrchestrator

This is acceptance guidance for this candidate, not an executed checker. The [source conformance guide](../reference/development/CONFORMANCE.source.md) supplies independent scenario examples; its Python runner and ports are not installed or qualified here.

## Public contract

Pin the imported [OpenAPI](../contracts/openapi.json), [shared interface](../contracts/SHARED_INTERFACE.md), [capability contract](../contracts/CAPABILITIES.md) and event schemas before implementation. Preserve consumed API/JSON/SSE behavior or explicitly version changes. Imported schemas describe the source protocol, not endpoints already exposed by this checkout.

Exercise `/v2/assistant`, turns, history, task controls, delivery and protected host consumption through the actual candidate API and intended renderer. Native host clients must not gain access to legacy direct-read bank routes. Test current authority before fresh disclosure and saved replay, not merely authentication at request start.

## Required independent cases

| Area | Required observations |
| --- | --- |
| Identity | Missing, expired, forged or wrong-audience proof fails; another tenant/member/client/agent/grant cannot adopt a resource. Two tenants route to different trusted backends. |
| Submission | Stable caller-bound idempotency; identical retries reuse committed results; conflicting payload fails. An uncertain response never grants a new effect identity. |
| JSON/SSE | Contract media type, no-store, request correlation, bounded bodies/events, valid cursor ordering and deduplication; malformed/conflicting duplicates fail. |
| Lifecycle | Disconnect does not cancel; explicit cancellation commits a fence and separately reports cleanup; expired proof needs same-binding reauthentication. |
| History | Authorized revisions and useful failed partials survive reload; revoked access denies replay without rerunning work. |
| Banking | Exact money/provenance for permitted routes; native host result excluded from chat/model/history; one consume winner, no rearm after lost reply or new token. |
| Consumer state | Session/logout/account changes discard buffered views and stale cursors; late replies cannot appear for another customer. |
| Actual host/channel | Device/build and backend evidence for protected display lifecycle, unavailable states and tenant delivery. A browser simulator does not establish native adoption. |

Expected values come from independently known synthetic source records, not copied responses. Include failures, races, unknown effects and forbidden disclosures, not only successful HTTP status. Keep actual bank/provider, public live-read and synthetic scenarios separately identified.

## Execution and evidence

Use the repository's [isolated fixture workflow](../../verification/README.md), extended with disposable product dependencies. Never run these mutations against a user's live app. A future checker must receive an explicit fixture URL and caller credentials through protected configuration; disable redirects and ambient proxy inheritance. No paid or real-bank calls are needed to validate this documentation.

Record case IDs, expected and observed outcomes, revision/build/configuration, selected contract/model/tool/browser versions, commands, failures and remaining consumer gaps in [candidate verification](VERIFICATION.md). Independent human acceptance and release approval remain separate gates.
