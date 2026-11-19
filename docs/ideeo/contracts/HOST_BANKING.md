> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Interactive host-banking contract

Engine-side development implementation of [ADR-010](../decisions/010-app-host-banking-and-model-context.md), authorized by Mateo on 2 November 2026. Native app/SDK binaries, protected screens, authentication and core integration remain separately owned. This contract is a navigation/input-delivery protocol, never a bank execution permit. Real tenant/provider prerequisites remain disabled by default.

[ADR-011](../decisions/011-tenant-api-and-channel-ownership.md) keeps tenant SDK calls to this engine separate from tenant API ownership of enrollment, WhatsApp ingress and banking-core integration. A host uses its tenant API; PayMe/Armony is one example. WhatsApp link clients use the separately configured [tenant handoff ports](TENANT_BACKENDS.md#tenant-controlled-protected-links).

## Provisioning and routing

In the trusted V2 tenant capability profile, configure:

```json
"host_banking": {
  "client_ids": ["bank-mobile-sdk"],
  "capabilities": ["bank.balance", "bank.history", "bank.account_info", "bank.transfer", "bank.transfer_phone", "bank.bill", "bank.topup"],
  "contacts_enabled": false
}
```

Each listed capability must also be tenant-enabled and authorized by the current customer proof/grant. The exact authenticated `client_id`, never message text or a client-supplied channel hint, selects this route. Provision native clients before use. Keep WhatsApp, delegated bank AI and external-agent API clients distinct. A configured native client with an unsupported host banking intent receives `host_unavailable`; it cannot fall back to direct banking or protected links. Without this profile, existing development/client routes retain their prior behavior.

The engine obtains current identity/account choices and authorization from the configured authority broker. It does not fetch balance/history/account details or initiate transfers/links on the native host route. Context creation skips implicit Core/broker catalog reads for native clients. Bill/top-up amount/reference clarification stays conversational; service selection/validation is completed in the host using the bank catalog. Explicit public catalog requests keep their separately configured route.

Native clients are denied V1 turn/task reads, direct V2 account information/history and operation endpoints. Saved non-host banking outcomes cannot be redisclosed after enabling this profile. Background balance and bank-balance mission children are excluded for native clients; permitted research/watch missions remain available. Other registered clients retain their existing authority/mandate interfaces.

## Turn response and one-time delivery

Submit the ordinary authenticated `POST /v2/turns` with `Idempotency-Key`. A ready request yields an outcome with capability and selected account plus:

```json
{
  "kind": "host_banking",
  "version": "1",
  "request_id": "11111111-1111-4111-8111-111111111111",
  "intent": "bank.balance",
  "status": "host_required",
  "expires_at": "2026-11-02T22:00:00Z",
  "display": "single_use"
}
```

These canonical intent identifiers are `bank.balance`, `bank.history`, `bank.account_info`, `bank.transfer`, `bank.transfer_phone`, `bank.bill` and `bank.topup`. This result and JSON/SSE replay contain no captured destination, amount, reference or financial result. The outcome means the host must continue, not that a screen opened or an operation succeeded. `ApprovalPresentation.kind=host_intent` remains a separate opaque authority approval interface.

The trusted SDK bridge delivers only `request_id` to its host integration. The host consumes it over the configured authenticated HTTPS engine connection:

```http
POST /v2/host-banking/{request_id}/consume
Authorization: Bearer <same verified customer access token used for the turn>
```

No request body, alternate URL, event-provided identity or financial results are accepted. The engine verifies tenant, membership, client, agent account, grant, exact access-token digest, expiry, current capability/resource authority and pending state. A replacement credential cannot consume the old delivery; discard the old view/credential and request a new deliberate consultation after reauthentication. Revocation of an otherwise unexpired old credential remains the tenant authentication policy. Expiry is bounded by the existing customer credential's expiry, with no new universal screen timer. Authenticated HTTPS retrieval provides authenticity/integrity; the result is not a separately signed mobile command.

The single successful response is `HostBankingInput` (see [OpenAPI](openapi.json)), with `version`, `request_id`, `conversation_id`, `intent`, `account_id`, `fields`, `expires_at`, `display=single_use`, `authorization=required_by_bank`. Only intent-relevant typed captured inputs appear in `fields`: CLABE or international phone for transfers; amount/currency; service catalog ID/payment reference for bills/top-ups. Consultation fields are empty. The host treats inputs as unapproved proposals, checks ownership/current terms and obtains all bank-required authentication and authorization before its bank integration executes anything. A contact match or chat “yes” grants no authority.

Consume commits a revision-checked transition before returning inputs and clears their raw fields from that delivery record. Concurrent consumption has one winner; duplicate consume returns 409 (`host_request_consumed` or concurrent `resource_changed`). Forged/foreign IDs return scoped 404/403; session replacement returns `host_session_changed`; expired input returns 410. Revocation or authority failure prevents delivery. Responses use `Cache-Control: no-store`. A lost HTTP response or app crash after consume does not rearm it. Replaying the turn/SSE returns the same opaque request ID, never a new display permission.

The host must claim the request before fetching/displaying bank data, deduplicate IDs and use a transient protected view. Dismissal, backgrounding, logout, account/session switch, app restart and expiry invalidate/clear that view and its data; a replay must not reconstruct it. Native lifecycle enforcement and tenant authentication policy need actual device acceptance. If the host is unavailable or the response is lost, surface unavailable/interrupted and require a deliberate fresh flow. For transfers/payments, the bank must reconcile its own operation state before offering a retry; navigation expiry/absence is not proof of no effect. There is no completion callback in this version and no way to upload balances/history, receipts, PINs or bank execution claims to this protocol. Chat continues to say only that the request was prepared.

## Private capture and contacts

The visible original customer message can remain in that customer's channel transcript under its own retention/access policy. V2 inference receives the new message and account aliases, never a raw transcript. A pending model projection contains only capability, missing-field names and `captured_fields` names. No prior CLABE, phone, amount, recipient name, reference or free-text goal is resent. The server restores exact structured fields after inference only for a single matching explicit continuation. A new goal or changed recipient does not inherit the old destination. No opaque provider continuation is used.

Optional `contacts_enabled` calls the tenant-owned exact-name contact directory through `POST /v2/engine/contacts/search`, with the broker's normal verified `context`, credentials/delegation, `query` and destination `purpose` (`transfer` or `transfer_phone`). Its reply echoes context/query/purpose and at most 20 authorized exact matches (`contact_id`, `label`, optional `clabe`/`phone`). It must scope and authorize the directory to the current tenant/membership and requested destination; this port is not an arbitrary SQL interface or fuzzy model ranking. The engine checks duplicate IDs, query/context/purpose echo, current transfer authority and recipient format/checksum before delivery. Only contacts with the requested destination are offered. Missing/unprovisioned contact support never invents a destination. Opaque tenant-link references follow [the separate purpose-qualified contract](TENANT_BACKENDS.md#tenant-controlled-protected-links); host consumption still requires an actual captured coordinate.

One current exact match can resolve locally. Several matches produce `Question.contacts` with ID/label only. A client may answer conversationally or submit a new turn with:

```json
{
  "message": "Seleccionar contacto",
  "conversation_id": "22222222-2222-4222-8222-222222222222",
  "contact_selection": {
    "turn_id": "33333333-3333-4333-8333-333333333333",
    "contact_id": "hugo-reza"
  }
}
```

Selection must belong to the latest single pending task and offered choices. It re-resolves under current authority and makes no model call. A removed selected ID fails rather than substituting another contact. The current directory supplies the destination; the host must display and obtain bank-required approval of its current terms. Exact resolved destinations never become model input. No new persistent contact store, automatic saving or lifetime is introduced. Saving/correcting/deleting contacts remains the tenant directory's responsibility; a future engine-owned store requires a separate lifecycle decision.

An exact offered label or a standalone ordinal reply such as “el segundo” can select a previously offered contact without inference. Resolve the ordinal against the **stored offered IDs**, then re-resolve that ID in the current tenant directory; never rank or guess a destination in the model. Replies containing changed terms are not treated as an automatic selector. Explicit input-selection turns consume no inference budget.

A request to discard an incomplete conversational capture may produce `pending_cleared`, with `scope=unsubmitted_capture` and `bank_effect=not_changed`. The internal capture plan has an exclusive `cancel_pending` flag, valid only with an existing pending capture and no new task, mission or dialogue proposal. The server ends its model continuity; a subsequent transfer does not inherit the discarded amount or destination. This does not cancel a host request, bank operation or durable task, erase the visible transcript, or prematurely delete retained encrypted records. Previously submitted banking work must be checked/cancelled through the bank's protected flow.


Encrypted pending task state follows the minimum tenant/engine task retention. The engine owns the encrypted `host_banking` delivery resource, scoped through existing RLS/caller bindings and scheduled resource cleanup; its content follows that same bound and replay marker window. Delivery usability ends at the earlier credential/content expiry, consumed fields are cleared immediately, and remaining bounded control metadata is not banking evidence. Removing subsequent context does not erase the initial provider request, user transcript, bank records or backups. Initial non-secret disclosure still requires the exact tenant/provider gate; secret-entry remains prohibited and regex is only a supporting detector.

Developer tests and live inference observations are indexed in [verification](../reference/development/VERIFICATION.md). Native lifecycle adoption, independent reviews/human acceptance, actual bank contact mapping and real-data/production approval remain separate. Compliance impact: LR-01/02/03/04/06/12/18; ISO/IEC 27001 5.12, 5.14–5.23, 5.34, 8.3, 8.5, 8.10–8.12, 8.15, 8.24, 8.29; ISO/IEC 42001 A.5.2–5.4, A.6.2.2–6.2.4, A.6.2.7–6.2.8, A.7.3–7.5. Legal interpretation and certification are not supplied by implementation.
