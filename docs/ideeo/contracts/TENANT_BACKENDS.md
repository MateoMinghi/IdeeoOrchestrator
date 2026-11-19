> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Minimum engine-side tenant backend contract

One shared engine serves multiple tenants concurrently. Every protected operation resolves its backend from the **verified principal's tenant**, with server-controlled adapter configuration, secrets and allowed capabilities. Database isolation and AI-provider adapters do not implement tenant banking connectivity.

For provisioned native clients, [HOST_BANKING.md](HOST_BANKING.md) defines the implemented engine-side navigation/input route, one-time consume and optional tenant-directory port. The engine uses current authority but does not fetch this path's bank results. Actual native screens and bank adoption remain separate.

## Tenant API ownership and channel routing

[ADR-011](../decisions/011-tenant-api-and-channel-ownership.md) confirms that apps/SDKs call authenticated engine APIs directly, while each tenant API receives its WhatsApp webhook and owns channel delivery and enrollment. The engine receives verified turns and calls the tenant's configured services. For PayMe, `engine → PayMe API → Armony` is the example; the engine does not require every tenant to use PayMe, Armony or a WebView. Existing explicitly qualified native adapters remain separate integrations and never serve as an unavailable tenant-API fallback.

V2 `CapabilityProfile` binds `tenant_id`, `origin`, `credential_env`, `enabled`, data policy, deadlines and optional delegation/approval configuration. It is selected using the verified principal, not a body-supplied URL or model text. Service credentials authenticate the integration; the tenant still independently enforces the current customer/client/agent/grant and bank mapping. Responses must match the exact verified context. Missing, invalid or changed configuration and dependency failures fail closed. Fixtures remain explicit synthetic profiles.

`onboarding` binds tenant profile version and channel to verified client IDs and returns only the [tenant-owned onboarding handoff](ONBOARDING.md). No engine enrollment/session/creation endpoint is involved.

### Tenant-controlled protected links

For WhatsApp and other approved link clients, provision this separate V2 capability profile block:

```json
"tenant_handoffs": {
  "client_ids": ["bank-whatsapp-api"],
  "capabilities": ["bank.balance", "bank.history", "bank.account_info", "bank.transfer", "bank.transfer_phone", "bank.bill", "bank.topup"],
  "contacts_enabled": true,
  "lifecycle_enabled": true
}
```

Each action must also be tenant-enabled and authorized. Verified client IDs cannot overlap the app/SDK `host_banking` client IDs. An unsupported capability for a provisioned link client fails unavailable rather than taking a direct bank-read/native-Core route. Configure exact trusted HTTPS `approval_origins` for protected pages. The caller cannot expand this allowlist.

The engine first checks current authority through `/v2/engine/handoffs/authorize`. Its tenant API connector then uses:

| POST path | Request/reply binding | Meaning |
| --- | --- | --- |
| `/v2/engine/handoffs/validate` | Request has `api_version`, verified `context` and exact typed `terms`; reply echoes them with `valid: true` | Tenant validates the proposed consultation/operation without executing it |
| `/v2/engine/handoffs/prepare` | Same context/terms plus durable UUID `request_id`; reply echoes them and supplies `presentation: BankHandoff` | Tenant prepares its protected consultation/authorization page idempotently |

The tenant must deduplicate preparation by `request_id` and reconcile an uncertain preparation; a network error is not permission to initiate again. The engine verifies source bindings, exact terms, HTTPS origin and presentation fields. Its channel response is the minimized `bank_handoff_presentation`: opaque handoff/source references, source state, safe labels and the protected action, without raw captured banking coordinates. The internal encrypted journal retains exact terms for binding and recovery. `awaiting_bank_authorization` is a pending protected presentation, never financial approval, execution or settlement. PIN entry and bank result display occur on the tenant's protected page; balances/history stay out of chat and model results for this channel route. Authority/read/disclosure checks and the handoff's expiry still apply to replay. App/SDK requests retain the separate [one-time host contract](HOST_BANKING.md).

`contacts_enabled` opts this client into `/v2/engine/contacts/search`.
Return caller-scoped contact IDs, labels, bank labels
and masked destinations. The tenant resolves `contact_id` to current bank-owned
coordinates; the model cannot supply a directory entry or choose another
customer's recipient. Ambiguous names produce stored choices. A later ordinal
selects the offered ID and revalidates it against the current directory, rather
than selecting the new response's position. Contact names do not grant access.
Natural replies such as `dos`, `opción 2` and explicit two-to-four-digit masked
endings select only one unambiguous offered ID. Alias/ordinal collisions and
shared endings ask again, including if the directory has since shrunk.

Directory requests and replies bind `purpose` (`transfer` by default, or
`transfer_phone`) as well as the query and verified context. Return destinations
usable for that purpose, under its current capability and scope. An opaque
`reference_only` contact declares `transfer_purposes` (default: `["transfer"]`);
phone delivery requires an explicit `transfer_phone` declaration. Its masked
destination must describe that phone, not its account. The tenant resolves the
reference privately against the current verified directory during validation and
preparation, preserving the phone-transfer method. Full directory phone numbers
need not enter engine or model context. A changed destination invalidates the
reference; it must never silently turn a phone request into an account transfer.
If no eligible saved phone exists, ask for an international number and retain the
captured amount. Multiple eligible phones use the existing offered-ID selection.
The current native Core directory adapter qualifies account contacts only; it
does not infer a phone from a CLABE, sender number or alias.

`lifecycle_enabled` opts into `/v2/engine/handoffs/status`, `/cancel`, `/reconcile`
and `/resend`. These bind the original request, exact terms, source reference and
revision. Reads can return a newer authoritative revision; mutations must enforce
their source concurrency contract. Cancellation or changed terms require source
confirmation before replacement. An identical continuation reconciles/reuses the
original request, including after a lost preparation reply. Resending a valid
action does not prepare another operation. Source uncertainty and expiry never
prove cancellation, failure or absence of a financial effect. JSON, SSE, task
reads and replay apply the same safe presentation and current-authority gates.
An explicit resend first reads current source state. Only an active source may
renew its tenant gate under current authority and strict revision checks; renewal
keeps the same bank request and terms. An absent live link must not be presented
as an openable page, and the tenant rechecks CTA expiry immediately before send.

Optional `bank.contacts`, `bank.cash_in`, `bank.cash_out`, `bank.card`,
`bank.rewards`, `bank.challenges` and `bank.process` provide typed tenant-owned
journeys. Each needs explicit capability/profile enablement, scope and a functional
tenant implementation. Shared schemas do not establish bank support. Cash code
creation, reservation, redemption and reversal are distinct source states; a card
page is not evidence of issuance, and a search page is not a completed booking.
Keep unsupported journeys unavailable rather than returning a successful empty page.
Cash-in funds the owner's account. A cash deposit addressed to another person
requires clarification; receiving-account details and an outgoing bank transfer
are separate intents. No chat request silently composes cash-in with a transfer.

### Optional customer media

An explicit `media` profile is separate from ordinary text disclosure. It pins
models, credential references, MIME/size/page/duration bounds and permitted model
routes. `POST /v2/media/observe` accepts an opaque attachment reference and returns
a minimized observation; `/v2/engine/media/read` retrieves bounded bytes from the
configured tenant backend under the same verified principal/delegation. It accepts
no customer-supplied download URL. The tenant owns encrypted temporary storage,
expiry, exact binding and an independently qualified safe-processing preflight.
KYC, PIN/OTP and cardholder documents are excluded from this port.

The [connector schema](capability-connector.schema.json) defines the separate
bounded `media/read` request and echo reply. Its asset contains MIME, base64 bytes,
SHA-256, expiry, source reference, trusted encryption/preflight flags and optional
audio duration. The financial connector's response limit is not widened.
Observation returns a durable `observation_id`; the tenant submits that opaque
ID as `media_observation_id` on its authenticated turn. The engine loads its own
stored observation, checks current policy and conversation ownership, and claims
it for one turn. Turn replay reuses that claim. Client-supplied extracted fields
cannot replace the stored observation. Images merge exact proposed values locally;
the planner receives their field names rather than raw extracted destinations.

Media support also requires metadata-only `media/authorize`: echo the exact
context/reference and return a strict `authorized` boolean. The tenant checks
the original asset's current owner, channel generation, backend realm, expiry
and processing eligibility; a fresh delegation must not revive an asset from
a disconnected channel. No bytes or extracted content belong in this reply.
The engine uses this port before processing, cached observation disclosure and
turn consumption, and rejects observations whose saved media policy has changed.

Each actual transcription/extraction attempt consumes the caller's retained
inference budget and records content-free usage, including failures. Current
authority and media policy are checked again before disclosure. Barcode mappings
come from trusted configuration and take precedence over conflicting extraction.
Extracted text and fields are proposals; voice agreement is not banking approval.
Past transfer receipts are informational and cannot initiate another payment.
The optional `cfe_v1` barcode convention is source-derived and currently qualified
only for synthetic tenants. Its trusted rule pins the exact service, payable
reference slice, MXN whole-peso units, timezone and qualification reference. It
checks checksum and calendar date before deriving an amount. Conflicting OCR or
explicit caption amounts ask for clarification; an overdue invoice adds a
deterministic customer warning without claiming bank acceptance or blocking a
protected proposal. This is not an official CFE format certification.
Qualified barcode facts resolve matching uncertainty labels, including the exact
decoded due date. Unknown uncertainty and low extraction confidence still require
clarification; the decoder does not override them.
Ordinary real-media processing approval does not enable this decoder for real tenants.
Real-tenant media processing remains denied until its recorded processing and
vendor prerequisites hold. See [data lifecycle](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md).

V2 response checks reject service-credential or delegated-proof echoes in both
plain text and percent-decoded text. Decoding is bounded; excessively nested
escaping fails closed. Malformed protected URLs become normalized dependency
errors. Once preparation has been reserved, those failures retain an `uncertain`
handoff without a link; replay does not dispatch another preparation.

## Minimum semantics

These implemented bank-read ports remain distinct from the later [interactive app/SDK target in ADR-010](../decisions/010-app-host-banking-and-model-context.md): for that path, the host opens banking screens and uses its bank integration; the engine does not call third-party cores to return balance/history to chat. The shared engine still needs trusted tenant authority/adapters for separately qualified channels and agent paths. Neither the host direction nor an unavailable adapter permits a silent fallback between paths.

The minimum contract belongs to the engine's ports in `src/ai_engine/ports.py`, not a bank's native wire format:

| Port | Engine requirement |
| --- | --- |
| `Authority.grant(principal, action)` | Check current membership, caller, agent account, grant status/validity and permitted action. Fail closed on denial or uncertainty. |
| `Authority.accounts(principal)` | Return only currently authorized display choices: opaque account ID, masked label and currency. No balances or credentials enter planning. |
| `Authority.authorize(principal, account_id)` | Recheck current action/resource grant and ownership immediately before a protected read. Account IDs never grant access. |
| `Bank.balance(principal, account_id)` | Read current available-to-spend money for the selected account: exact decimal string, currency, account, timezone-aware source observation time and provenance. Fail safely rather than fabricate or substitute money. |

Each adapter maps these semantics to its bank's REST, RPC, SDK or other API. It owns the verified membership-to-bank-user/account mapping and credential resolution outside the model. Banks need not rename endpoints, adopt PayMe identifiers, use the same authentication protocol or implement the optional HTTP paths below. An engine-side adapter is an alternative to a bank-exposed connector. Neither a field named `Balance` nor a successful login proves the required meaning or mandate binding.

The present execution capability is `bank.balance`. Future operations require task-specific permission/effect/approval/idempotency contracts. This increment does not add transfers, bank login, account creation or the complete authority lifecycle. External agents cannot enter through the customer-balance API to disclose a parent's bank balance.

## Configuration and dispatch

Set `ENGINE_TENANT_BACKENDS_FILE` to a JSON file matching [the generated schema](tenant-backends.schema.json). [The example](../reference/config/tenant-backends.example.json) configures two HTTPS connectors. Each entry binds one trusted tenant to an adapter, capabilities, endpoint, credential environment-variable **name**, provenance and deadline. Supply each service credential separately through its referenced process variable or approved secret injection; never store its value in this file.

Startup validates the configuration and credentials. Capability/data-policy changes are read again before applicable calls; removing a binding, disabling balance or an invalid configuration fails closed. Endpoint/credential/adapter changes require restart and return `tenant_configuration_changed` in the existing process. Duplicate bindings, unknown adapter types, untrusted tenants, missing credentials, invalid origins and malformed profiles prevent startup. An unconfigured tenant returns `tenant_not_configured`; disabled balance capability returns `capability_unavailable`, before inference/backend calls. Failed backends never fall back to another tenant or fixtures.

An HTTP binding without `data_policy` has no model disclosure permission. Explicitly enable `allow_user_text` and exact `model_routes` such as `gemini:gemini-3.8-flash`; optionally permit account labels. Synthetic development bindings have a controlled synthetic policy. [Data ownership](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md) defines the additional tenant approval and lifecycle obligations. Account aliases, encrypted payloads and current authority checks apply independently. [Customer-data access](TENANT_DATA_ACCESS.md) is optional and separate from the balance connector; no generic profile endpoint is assumed.

Without a file, only development-marked trust profiles receive exact-ID synthetic bindings; there is no wildcard. Non-demo trust requires explicit configuration. `adapter: synthetic` remains an explicit development option with synthetic provenance. A reference HTTP connector is delivered; registering another bank-specific implementation is a code change to the trusted adapter factory, never a client-selected plugin/import/URL.

## Optional engine-bank HTTP connector v1

`http-v1` is one implemented adapter for a bank-owned or engine-side compatibility service. This reference contract does **not require all banks to expose these endpoints**. Native bank adapters can implement the same internal ports directly.

Calls are HTTPS POSTs to the configured origin. HTTP is accepted only for explicit localhost development profiles. The connector credential is sent only in `Authorization: Bearer ...`. Engine/customer tokens, PINs, provider keys, conversations and signing keys are never forwarded. The service credential authenticates the integration; the receiver must independently enforce current bank/authority records. Echoing context correlates a response and does not authorize an operation.

Every request/response includes `api_version: "1"` and `context` with `tenant_id`, `membership_id`, `client_id`, `agent_account_id` and `grant_id`. Context comes from verified engine credentials. All returned context fields must match. [Generated schemas](tenant-connector.schema.json) define required fields and reject extras.

| Endpoint | Additional request | Additional response |
| --- | --- | --- |
| `/v1/engine/authorize` | `action`: `balance:read` or `preferences:write`; `account_id`: ID or null for a grant-level check | Strict boolean `authorized`, exact requested `action` and `account_id`. Validate current membership/client/agent/grant, status/expiry/action and account ownership/scope when supplied. |
| `/v1/engine/accounts` | None | `accounts`: at most 100 unique authorized choices. A grant-level check precedes the read. |
| `/v1/engine/balance` | `account_id` | `balance`: shared `BalanceResult`. Account-specific authorization precedes the read; the backend also enforces its own final check. |

The amount is an exact two-decimal string, mapped from the bank's authoritative available-to-spend field. Binary floating-point and remembered money are invalid sources. Account ID/label/currency must match the authorized selection and money currency must agree. Provenance must match the configured `bank` or `synthetic` profile. `bank` identifies the configured backend source, not certified production money. The source supplies `observed_at`; no universal age threshold is selected here.

Each call allows one attempt, no redirects/fallbacks/environment proxy inheritance, a 1–15 second deadline (default 5), four pooled connections per tenant and 64 KiB maximum decoded response. The whole-turn deadline still applies. Duplicate JSON fields, credential echoes, non-finite values, malformed/context-mismatched replies and invalid money produce `bank_invalid_output`. HTTP 401/403/404 deny access; 429/5xx/transport errors produce `bank_unavailable`; timeout produces `bank_timeout`. Upstream text/errors stay private. Authority outages block saved-result disclosure; they never authorize stale data.

## Consumer and verification implications

Public v1 balance provenance now supports `bank` and `synthetic`; generated OpenAPI/event schemas are updated. Consumers with synthetic-only validators must update before bank results. Synthetic balances retain the Spanish test-data notice; bank results do not acquire it. Replay retains the original observation and checks current authority without a new balance read.

See [implementation/evidence](../reference/development/VERIFICATION.md). Actual local HTTP servers with overlapping member/account IDs test distinct money and endpoint/credential isolation through the authenticated API and PostgreSQL. This is distinct from one bank's preproduction connectivity check and its independent mapping acceptance.

## WhatsBank example, 21 October 2026

Mateo authorized only **preproduction** through the [WhatsBank playground](https://whatsbank.com/playground). Its client distinguishes preproduction `core-v1`/`core-v2` from production routes. A playground login and preproduction v2 `ping` and `Balance` reads succeeded. No production or effect-producing method was called; credentials are omitted from artifacts.

The example takes `idUser` and returns `idUser`, `Balance`, `BalanceCents`, `Currency` and diagnostic trace metadata. It uses signed method/params envelopes via its playground proxy, rather than the optional connector above. These historical reads establish preproduction reachability/shape, **not an accepted customer-account mapping**. Other banks may use different auth, endpoints, fields, precision and account models.

## Dedicated WhatsBank preproduction adapter

`adapter: "whatsbank-preproduction"` composes independent current authority with a native read-only WhatsBank v2 client. This is one tenant's implementation; other banks retain their existing adapters and contracts. [The tenant example](../reference/config/whatsbank-preproduction.example.json) is deliberately inactive without separate authority/bank credentials and approved mappings.

The native client pins the preproduction `core-v2` endpoint published by the playground and exposes only `ping` and `Balance`. It signs the documented sorted, compact JSON parameter hash with HMAC-SHA256, a current epoch timestamp and a fresh nonce per request. The signing secret stays in the adapter. Requests have one attempt, no redirects/environment proxies, a bounded deadline and a 64 KiB decoded response limit. Playground login is an operator documentation/diagnostic login, not customer authentication; its password is never runtime configuration.

`base_url` and `credential_env` identify the **independent authority's existing v1 compatibility interface**, not the playground/core. That service must validate current membership, client, agent account, grant and resource access. The playground does not establish that service or its records; the standalone Go authority's v2 API is not implicitly a v1 endpoint. A tenant integration may instead compose its approved `Authority` implementation with `WhatsBankPreproductionBackend` directly. Static mappings and service credentials never replace current authority or establish a bank-authenticated customer session.

The nested `whatsbank` profile contains `api_key_env`, `signing_secret_env` and `mappings_file`. Relative mapping paths resolve from the tenant configuration file's directory. Supply credentials through their referenced process/secret-store values; do not copy playground defaults into tracked examples. Model disclosure defaults to denied.

The private mapping file follows [the example with no customer mappings](../reference/config/whatsbank-mappings.example.json):

- `api_version: "1"`, `environment: "preproduction"` and the exact verified `tenant_id`.
- `balance_semantics` defaults to `unconfirmed`; enabling `available_to_spend` requires a `balance_contract_reference` identifying the tenant's contract/evidence. The example references the qualified preproduction mapping below, without enabling any customer. Another core or changed source requires its own evidence.
- Each account supplies engine `membership_id`, opaque `account_id`, bank `id_user` (exact eighteen-digit string), masked `label`, `currency`, `ownership_reference` and `valid_until`. The ownership reference records the tenant-confirmed association; it does not authenticate it. Duplicate owner/account or native-user mappings are invalid. No website sample user is adopted automatically.

Only an independently authorized account with a matching, unexpired mapping can be read. Mapping files are checked around awaited authorization and before disclosure; removal, expiry or rebinding invalidates an in-flight result. Authority is checked before and after the bank read, and revocation suppresses the result. Catalogs expose only independently authorized, explicitly mapped accounts. Missing/expired ownership denies access; unavailable/invalid files produce `bank_mapping_unavailable`, and unconfirmed semantics produce `bank_contract_unconfirmed`, before bank I/O.

The response must contain the requested exact `idUser`, ISO currency, integer `BalanceCents` and numerically matching `Balance`. Parse JSON decimals without binary floats and derive two-decimal money from cents; zero is valid. Observation time comes from native `_trace.timestamp` in epoch seconds, checked against the bank's documented 300-second signing clock tolerance. Missing/stale time is not replaced by a local time. This is a source-response observation, not proof of ledger posting time or verification of the trace's cryptographic signature. Raw trace, native user ID and credentials are excluded from the public result. Mismatches, duplicate/malformed fields and credential echoes fail without a replacement balance.

`scripts/qualify_whatsbank.py --allow-preproduction --output <report.json>` explicitly tests native ping with process variables `WHATSBANK_PREPRODUCTION_API_KEY` and `WHATSBANK_PREPRODUCTION_SECRET`. Optional `--balance` also requires `WHATSBANK_QUALIFICATION_ID_USER`, supplied for an approved preproduction fixture. Reports omit identifiers, amounts, credentials, signatures and upstream text, and preserve failures. Native transport success does not qualify customer binding, available-to-spend meaning, app adoption or production. See [verification](../reference/development/VERIFICATION.md) for executed evidence.

### WhatsBank preproduction qualification

On 22 October the user authorized creation of synthetic preproduction users and API exploration. [Exploration evidence](../reference/SOURCE_REFERENCES.md#source-510d20956ea7) records the public client revision and the first created fixture. WhatsBank's bank-owned protected balance view labels its result **Saldo disponible**. With the created user's protected PIN flow, `data.saldo`, `data.saldoCents` and currency match native `Balance`, `BalanceCents` and `Currency` exactly. [The repeatable fixture qualification](../reference/SOURCE_REFERENCES.md#source-5e3515ec2c49) also verifies wrong-PIN rejection, consumed-link behavior, matching created/protected CLABE, protected history, nonexistent-account denial and invalid HMAC rejection.

This evidence supports the **current preproduction** mapping of native `BalanceCents` to available-to-spend money; it is not an inference from a field name. It does not establish production holds, overdrafts, posting/freshness rules or regulatory limits. Values in native and protected views were observed on newly created synthetic users; nonzero precision/failure boundaries have controlled fixture tests. Keep that scope explicit when adopting another environment.

| Published v2 method | Meaning and evidence |
| --- | --- |
| `ping` | Native signed health/environment/time; executed against preproduction. |
| `createAccount` | Historical qualification observation only: returned native `idUser`, CLABE and protected entry references for authorized synthetic fixtures. Account creation and fixture provisioning are now tenant-owned; no engine execution helper remains. |
| `Balance` | Signed read by exact bank `idUser`, with exact cents/currency and source trace; native and protected values compared. It is not itself customer authentication. |
| `getServices` | Read-only service catalog and reference rules; executed. |
| `requestConsulta` | Creates a PIN-gated, expiring, single-use view for `saldo`, `clabe` or `movimientos`; all three exercised on the created fixture. |
| `transfer`, `transferWhats` | Native preproduction preparation returning `URLFirma`, without inline PIN; qualified with generated synthetic sender/recipient accounts. Links were not approved. |
| `buyEcommerce` | Native preproduction bill/top-up preparation returning `URLFirma` and typed service metadata; qualified without bank authorization/execution. General merchant checkout still needs a qualified quote/provider contract. |
| `debit` | Moves funds to a master account; source-inspected, not executed. |

The inspected playground publishes no bank-customer session exchange or current client/agent/grant API. Creating a test user and controlling its PIN establishes the qualification fixture, not a production customer session contract. [The live engine check](../reference/SOURCE_REFERENCES.md#source-eeb8d2e2f3ae) connects the actual bank fixture through the authenticated engine, PostgreSQL and independent **controlled test** authority, checking source money, replay, caller mapping and revoked disclosure. Real tenant trust/authority and native client adoption retain their separate gates. Other tenants need not use this bank, its phone/PIN flow or its eighteen-digit native identifiers.


### Core customer-handoff adapter

The optional `core_handoffs` capability profile contains credential environment names, a verified preproduction mappings file, explicit `customer_clients` and `customer_agents`, and `protected_reads` (account information/history by default; protected balance is optional). The adapter uses only the pinned Core v2 preproduction endpoint. Credentials and native account IDs stay out of model context. There is no implicit production endpoint or tenant fallback.

Core accepts MXN transfers with a checksum-valid eighteen-digit CLABE, or a Mexican international phone number (`52` plus ten digits, including the source-compatible `521` form). Ten-digit top-up references are a different field and follow the selected catalog entry. The current catalog maps `MXP` to ISO `MXN`, separates `PAGO SERVICIOS` from `RECARGAS`, preserves exact denominations/reference limits and rejects unknown currencies/categories or duplicate products. Native product/service IDs and metadata are resolved server-side from a fresh catalog before preparing payment. The model sees public product names/rules, never signing credentials.

HMAC signing uses sorted compact JSON and JavaScript-compatible money numbers: whole pesos sign as `100`, not `100.0`; source amounts are parsed as exact decimals. Native replies must remain pending and any echoed account, amount, currency, recipient or service terms must match. The protected URL must be HTTPS on the qualified host/path, with its token equal to the returned operation ID. Current payment routes include `/core/firma/`; consultations use `/consulta/`. For bills/top-ups, `productUfee` from the fresh catalog determines the proposed fee. The native response must match the exact base amount, fee cents, commission breakdown and base-plus-fee total. The pending handoff carries these source charges separately from the requested-terms digest, and the concierge/UI show the commission and total to authorize. A different or unqualified extra fee is rejected; a displayed quote does not approve spending. The engine discloses a link for at most ten minutes, subject to earlier bank expiry/consumption and current authority.

Core preproduction enforces a thirty-second API-key cooldown across `transfer`, `transferWhats` and `buyEcommerce`. A rate limit, malformed reply, timeout or lost response does not trigger automatic resubmission. Qualification scripts pace distinct test intents and preserve failed runs. Preparations leave source requests awaiting bank authorization; no ledger completion is inferred. Earlier authorized qualification used `createAccount` for synthetic fixtures. The engine creation helper is now removed; new fixture provisioning belongs to the tenant. Historical observations do not establish production onboarding or customer session exchange.
