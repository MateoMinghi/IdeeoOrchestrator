> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Authority development service

The Go service in `authority/cmd/authority` implements the engine-owned v2 broker boundary for the current development customer profile. The brain proposes typed operations; this model-free service verifies delegation, reads current mandates, consults a registered bank adapter and controls reservations. Bank cores/ledgers remain external. This supports [ADR-001](../decisions/001-tenant-authentication-and-delegation.md), [ADR-003](../decisions/003-engine-implementation-stack.md) and [the capability contract](CAPABILITIES.md); it does not accept their unresolved production profiles.

## Authentication and configuration

[ADR-010](../decisions/010-app-host-banking-and-model-context.md) scopes interactive app/SDK banking to host-owned protected screens, authentication and bank integration; balance/history never return to chat/model context. Existing Go permit, bank-adapter and customer-link paths keep their documented scopes. The generic `host_intent` approval presentation is an opaque bank-supplied payload, not an implemented native navigation protocol or a substitute for host/bank authorization. Delegated-bank tasks and external-agent mandates remain separate integrations.

Customer and engine-broker requests carry a configured workload credential in `Authorization: Bearer ...` and a tenant-signed customer access credential in `X-Authority-Delegation`. The latter uses the development ES256 `at+jwt` profile, with the authority's configured audience. Its five identity fields must match the body context exactly. A workload token alone cannot name a customer. Workloads are restricted to configured tenants, clients and roles: `engine`, `owner`, `core` or the scoped `service_executor`. They cannot call another role's endpoints. Bank callbacks use the separate source-signature profile described below.

The Python verifier retains delegation proof only in memory, outside principal display/model/public/persisted data. A broker profile forwards it only when `delegation_audience` is configured and appears in the verified credential audience. The Go bank connector requires its separately configured bank audience before forwarding proof. The reference development flow uses an audience list containing `ai-engine`, `ai-authority` and `bank-core`; actual tenant token exchange/assurance remains a separate integration decision.

`-config` is mandatory. [The example configuration](../reference/config/authority.example.json) contains placeholders and environment-variable names, not credentials. Configuration binds public issuer keys, listener, secret environment-variable names, tenant bank origins, capabilities, provenance and approval origins. There is no default bank or synthetic fallback. The executable supports development and loopback listeners. Financial execution is disabled by default and can be enabled only for an explicitly synthetic local bank fixture. Real bank execution is not enabled by this profile.

Requests and replies bind tenant, membership, client, agent account and grant. Parsing rejects duplicate, case-aliased and unknown fields, oversized bodies and invalid financial schemas. Outbound calls have bounded deadlines, no redirects, no ambient proxy and no automatic retries. Credential/proof echoes and mismatched contexts fail closed. Protected operation preparation never returns stored source balance facts or reservation credentials.

`read_clock_skew_ms` is an explicit trusted uncertainty budget for read observation timestamps, default zero and bounded to 1,000 ms. It does not extend the stale-data window or relax customer/signature, mandate, permit, source authorization-fact or callback expiry checks. Each real adapter needs a justified clock profile. The local Python/Go fixture uses 10 ms after measured Windows clock differences caused sub-2 ms future observations to be rejected; this development setting does not qualify a production clock policy.

## Engine broker

`POST /v2/engine/browser/authorize` is the bounded public-research permission check. It requires the `engine` workload role, independently verified customer proof, `task_id`, `destination` and nullable `mandate_version`. Trusted tenant `browser_destinations` maps exact HTTPS hosts to permitted path prefixes; no destinations are enabled by default. The service requires `browser.shopping` / `browser:delegate`, an active connected mandate and current bank authorization. It rereads mandate state after the bank call and rejects version changes, pause/revocation and forbidden destinations. The response binds the task, destination, agent account, grant and actual mandate version. It supplies no bank balance, credential or financial permit. The Python browser policy is an additional constraint, never a replacement for this independent check.

The [generated broker schema](capability-connector.schema.json) defines the existing `/v2/engine` commands. The service implements context, capability authorization, account balance/information/history, catalog, provider quote, operation validation/preparation/permit/execution/reconciliation/cancellation. Source reads recheck current mandate and bank authorization before publication. Read history retains its `bank_statement` versus `engine_activity` attribution.

Preparation reserves an immutable operation identity and canonical terms. Its replay returns the original observation without charging another allowance or requiring the old money to remain available; current access/pause and material terms still apply. A1 returns a protected bank presentation and cannot issue a permit from a chat response. The presentation's approval reference remains stable when independently signed owner evidence is recorded.

Execution first claims the attempt in PostgreSQL, then calls the bank outside that transaction. The bank must independently validate the exact proposal, current funds/limits and operation-ID idempotency. As part of accepting its own bank transaction, it calls the authority acceptance endpoint below. A pause before acceptance rejects a new commitment. An already accepted commitment cannot be undone by changing a local status; cancellation/reversal follows the bank's outcome.

An interrupted, pending or uncertain attempt reconciles against the source instead of repeating execution. Completed/reversed outcomes require source evidence matching operation and terms. A missing response, missing evidence or missing bank acceptance cannot become completed. Unresolved holds remain reserved. The authority journal and allowance counters are secondary records, not a reconstructed financial ledger.

A final `failed` result also requires source evidence attesting a final no-effect outcome. A network error, inconclusive read or missing receipt cannot release an uncertain hold. A confirmed reversal does not replenish the mandate's allowance automatically.

## Protected owner and core commands

Commands use `api_version: "2"` and the same verified body context. The paths below require their named workload role as well as independent customer proof. Owner reads, connection, resume and mandate/approval changes consult current bank membership. Authenticated pause/revocation reduces existing local authority immediately without a bank round-trip or biometric challenge, including during a bank outage. Signed approvals use the development `authority-approval+jwt` profile and bind owner, target client/account/grant, purpose, exact canonical digest, version, expiry, method and single-use nonce.

| Path | Role | Additional fields and behavior |
| --- | --- | --- |
| `POST /v2/authority/mandates/change` | owner | `mandate`, `expected_version`, `proof`. Exact signed create/update; new accounts start paused. A3 activation requires biometric evidence. |
| `POST /v2/authority/mandates/history` | owner | `agent_account_id`, `limit` (1–50), `cursor` (empty string for the first page); requires `mandate:read` and current bank membership. Returns immutable historical evidence as specified below. |
| `POST /v2/authority/agents/connect` | owner | Connects the independently proven client/grant; does not silently activate a paused mandate. |
| `POST /v2/authority/agents/state` | owner | `agent_account_id`; requires `mandate:read`. Returns owned agent identity, signed mandate version/state, restriction/control revision, connection/effective status and global pause/version. No bank balance or source inspection facts. |
| `POST /v2/authority/agents/pause` | owner | `agent_account_id`; requires `mandate:pause`. Immediate individual restriction without changing the signed mandate; repeated pause is idempotent. |
| `POST /v2/authority/agents/revoke` | owner | `agent_account_id`; requires `mandate:pause`. Terminal restriction for that identity and disconnects it. New mandate changes, connection and resume cannot revive it. |
| `POST /v2/authority/agents/resume` | owner | `agent_account_id`, `expected_control_revision`, `proof`; requires `mandate:manage`, current bank membership and exact `agent_resume` approval. Clears only the individual restriction; signed mandate/global restrictions still apply. |
| `POST /v2/authority/pause-all` | owner | Immediate scoped restriction; repeated pause does not advance an already-paused revision. |
| `POST /v2/authority/resume-all` | owner | `expected_version`, `proof`. Fresh exact signed resume; individually paused agents remain paused. |
| `POST /v2/authority/operations/approval` | owner | `operation`, `proof`. Records exact protected approval through an allowance reservation; returns an acknowledgement, not credentials or bank facts. |
| `POST /v2/authority/permits/accept` | core | `permit`. Checks current identity/mandate/version/expiry and the reserved credential before accepting an executing attempt. The engine role cannot call this route. |

Individual restrictions have their own monotonic `control_revision`, initially zero. They leave the protected mandate intact. The resume proof's authorization digest is the canonical digest of `{"context": <target five-field identity>, "control_revision": <expected + 1>, "mandate_version": <current signed version>, "restriction": "none"}`. Its purpose is `agent_resume`; its `mandate_version` claim names the current mandate, not the control revision. Current identity/version/revision, expiry and nonce consumption are checked under the membership/agent locks. Exact current replay is idempotent; even a new nonce signed for an older restriction cannot clear a newer pause. Mandate updates and connect replays do not clear an individual restriction.

Control changes and single-use resume nonces commit atomically with append-only, RLS-scoped `agent_controls` audit rows. These contain opaque actor/target references, restriction/revision, mandate version, change digest and time; no raw proof, balance or credential. Runtime cannot update/delete them. Pausing/revoking leaves committed/uncertain holds and historical bank callbacks intact. Final audit retirement remains separate lifecycle work.

Migration 006 adds the restriction overlay and audit. Stop every old authority writer before applying it and start only the current build afterward; old binaries do not enforce the new overlay. This development migration does not establish rolling compatibility or production promotion. Existing SQL migrations remain immutable.

## Immutable mandate history

Every newly accepted mandate version is identified uniquely by `(tenant_id, membership_id, agent_id, revision)`. `mandate_history` retains the complete typed mandate, its canonical `Digest` SHA-256, format version 1, capture time and approval provenance in an authenticated encrypted envelope. The typed representation preserves every canonical signed field, including account/action lists, limits, validity, policy and notice; recomputing `Digest(mandate)` verifies the retained content. Current mandate, history insertion and approval nonce consumption commit in the same PostgreSQL transaction under the existing membership/agent locks. Replay of the exact current proof returns the existing current version; stale/conflicting changes do not append history.

History encryption uses purpose `mandate-history`, the historical revision as reference, and the original tenant, membership, client, agent and grant. These historical client/grant fields are stored with the row and checked against the decrypted mandate. A later client/grant rotation does not change the old envelope or require reconnecting that obsolete identity. Owner access is independently authorized using the **current** verified owner boundary. History is never read by the authorization/operation decision path. Reading an old active mandate cannot activate an account, clear a restriction or release an uncertain hold.

`provenance: "verified_approval"` means the private `ApprovalEvidence` was constructed by successful configured ES256 proof verification. Its encrypted `approval` receipt contains issuer, configured audience, key ID, algorithm, purpose, method, authentication/issuance/not-before/expiry times, verification time and the verified requesting actor identity. The actor identity comes from the verified customer delegation; it is not a claim that the approval token itself contained every actor field. The mandate digest, target identity and version bind the approved terms. Verification time is a service observation; `auth_time` and issuance times are verified issuer assertions. No raw JWT, signature bytes, PIN, access credential, private key or bank balance is retained. This receipt is **not a retained independently reverifiable signature**. Adding signature retention would require a separately reviewed sensitive-data contract.

PostgreSQL enforces version/nonce uniqueness, forced tenant/member RLS and SELECT/INSERT-only runtime history grants. Deferred constraints require every changed current mandate to have matching historical ciphertext fingerprints and nonce evidence, and require the previous version to be preserved before overwrite. Runtime cannot alter the legacy baseline or account identity columns. Thus an old writer cannot silently update a mandate without history; its transaction fails. Connection and restriction-only writes do not rewrite signed history. Migration/administrative privileges remain a separate trusted boundary; this is not tamper-proof storage against a database administrator.

### Owner response and pagination

The request uses the existing `api_version: "2"` and verified five-field `context`, plus the three required fields in the route table. Response fields are:

| Field | Meaning |
| --- | --- |
| `api_version`, `context` | Existing verified owner envelope. |
| `items` | Newest-first versions, each containing `format_version`, full `mandate`, `mandate_digest`, `provenance`, nullable `approval` receipt and `recorded_at`. |
| `next_cursor` | Opaque authenticated encrypted continuation, or an empty string at the end. |
| `earliest_available_version` | Earliest actually retained version for this agent in the page's snapshot. |
| `missing_versions_before` | Number of irrecoverable preceding versions; zero for a complete history beginning at v1. |

The first page fixes an upper revision; later accepted changes do not move that pagination snapshot. Each query reads at most `limit + 1` rows plus an indexed earliest-version lookup. The cursor binds the requesting five-field identity, target agent, upper revision, next position and a five-minute maximum lifetime clipped to customer expiry; it is not authorization. Changed identity/agent, malformed, oversized, altered or expired cursors fail. Start again with an empty cursor after renewal. Invalid input uses the existing 422 response, inaccessible agent 404, denied access 403, and unavailable/corrupt/unbackfilled history 503 without partial items.

Only an owner workload with independently verified customer proof, `mandate:read`, and current bank membership may retrieve history. Queries use the verified tenant/membership and selected owned agent. Membership is checked again after storage access, and customer expiry is checked immediately before disclosure. An expired/revoked customer session or inactive bank membership cannot read history. An expired, paused or revoked **target mandate** can still be inspected as evidence by its currently authorized owner, just as owner state can; it grants no operation authority. Responses expose no allowance usage, source facts, reservation credentials or raw proof.

### Legacy upgrade, keys and retirement

Apply forward migrations 007 and 008 with the current migrator after stopping all older writers. Migration 008 records the exact current revisions that predate history; the runtime cannot create that marker. Use the current migrator's immediate constraint checks at migration-file boundaries, including before 008's DDL. The normal runtime retains deferred atomic checks. Current builds require both migrations and reject missing history guards or unsafe runtime privileges at startup. Older binaries are unsupported after upgrade even though the database fence prevents silent mandate-history loss; the earlier restriction overlay still requires current binaries.

Run the explicit operator command `-config <trusted-config.json> -backfill-mandate-history -tenant <tenant> -membership <membership> -limit 100` using the same database and data keys as the service. Batches accept 1–500 agents, lock the membership, return the committed count only, and are resumable/idempotent; repeat until zero. There is no HTTP/model backfill endpoint. An accepted change also preserves an eligible available legacy version atomically before replacing it, so an unprocessed agent cannot lose its last available version. Backfill decrypts and validates the current payload; unavailable keys/integrity failures fail the batch visibly with no invented content. Missing history for a post-upgrade version is an integrity failure, not permission to relabel it as legacy.

A legacy item is `provenance: "legacy_snapshot"`, with `approval: null`. `recorded_at` is its capture time, not an original signing time. Earlier overwritten versions cannot be reconstructed: the response declares the earliest retained version and preceding gap. Existing nonce/control-audit rows are not retroactively promoted into verified approval receipts.

History exists for owner inspection and authority evidence. Authority runtime and explicitly scoped operators can decrypt it; it is not sent to a model. This increment supplies no history erasure/rewrapping endpoint or automatic key retirement. Retain historical decryption keys for all remaining envelopes and applicable backups; switching the active write key alone does not migrate old ciphertext. Production retention periods, legal holds/release triggers, audit access, approved KMS and evidence/key/backup retirement remain human adoption decisions under [the data contract](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md). No indefinite production retention policy or independent signature archive is selected here.

## Registered bank adapter additions

### Owner inventory and bank-owned allowance

Owner workloads can call `POST /v2/authority/agents/list` with `limit` (1–50) and `cursor` (empty for the first page). Independently verified customer proof must include `mandate:read`; current bank membership is checked before and after storage access. The response contains `agents` (current owner state, autonomy level, currency and validity) and an encrypted caller-bound `next_cursor`, valid for at most five minutes and no longer than the customer proof. Paused, revoked and expired target agents remain inspectable as owner records. This endpoint grants no operation authority and exposes no balances or reservation credentials.

`POST /v2/authority/agents/allowance` accepts an owned `agent_account_id` under the same owner/profile checks. The authority resolves the current signed mandate and calls the tenant's registered `POST /v2/authority-core/agents/allowance` port with that exact target identity and mandate version. Its response envelope remains bound to the authenticated owner; `allowance` contains target identity, mandate version, currency, exact `limit`, `used`, `held`, `remaining`, period start/end, observation/expiry times, provenance and opaque source reference. These values come from the bank's allowance records, not local authorization reservations or a reconstructed ledger.

Validation requires exact identity/version/currency/provenance, a current source period and bounded freshness, decimal amounts, and `remaining=max(0,limit-used-held)`. A positive signed account cap cannot be exceeded by the returned limit. The service rechecks current bank membership and mandate identity/version after fetching the source and checks proof/evidence expiry immediately before disclosure. Missing or invalid bank evidence is unavailable; no local-counter or parent-balance fallback exists. The typed response has no parent-balance field. Each tenant still has to implement and qualify this bank port; synthetic HTTP tests do not establish a real bank mapping.

The bank adapter authenticates the authority workload and independently verifies its intended customer proof. Existing read/authorization/quote/execution replies use the v2 broker schema. The following engine-owned additions keep bank-specific translation outside the brain:

| Path | Request fields beyond envelope | Reply fields beyond envelope |
| --- | --- | --- |
| `POST /v2/authority-core/member` | none | `active`, current bank membership status |
| `POST /v2/authority-core/inspect` | `intent`, `proposal` | `facts`: complete identity, account/terms binding, active/allowed flags, funding amount/currency, current available funds/regulatory cap, merchant/category, explicit risk/prerequisite flags and observation/expiry timestamps |
| `POST /v2/authority-core/approval` | `terms`: operation, proposal/authorization digests, mandate version, stable approval reference, proposal, gross funding amount/currency and expiry | `presentation`, a bounded protected bank/host presentation on configured origins |

Inspection facts are required source fields. They are never accepted from public/model request JSON, and their freshness is bounded by trusted adapter configuration. A bank without the required identity, approval, quote, acceptance or evidence contract remains unavailable; another tenant or fixture is not substituted.

`observed_at` identifies the actual source observation/publication, not the time an HTTP reply is assembled. Re-serving a retained snapshot cannot renew its observation time or extend its original expiry. Changes to underlying evidence require a new source observation/version; a fresh source query may establish a new observation even when values are unchanged. Financial inspection rejects future-dated facts; the separate `read_clock_skew_ms` setting does not relax that guard. Qualify each real source's UTC clock, timestamp precision and freshness behavior before activation. A local diagnostic reproduced validly shaped synthetic facts 0.87–1.17 ms ahead of Go's clock; the corrected native-checkout fixture publishes a bounded snapshot before requests. This is fixture/protocol evidence, not production clock qualification or proof that every earlier refusal had that cause.

## Durable bank callbacks

`POST /v2/authority/bank-events` requires a registered `core` workload credential and one `X-Authority-Event-Signature` header. It uses separately configured `callback_trust` public keys. Customer access/approval proofs cannot substitute for the bank signature. This route does not require a current customer token: a pause, revocation or expired session must not prevent recording the bank's actual outcome for an existing operation. It cannot create an operation, grant authority or initiate execution.

The JSON body contains `api_version: "2"`, the five-field `context`, `event_id` (1–100 ASCII reference characters), a positive per-operation `sequence`, `occurred_at` and the v2 `outcome`. The signature is an ES256 `bank-event+jwt` with a configured `kid`, issuer and audience. Claims include `sub: "bank-core"`, `kind: "bank_outcome"`, `tenant_id`, `jti` equal to `event_id`, and `event_digest` equal to the canonical SHA-256 digest of the entire JSON body. Integer `iat`, `nbf` and `exp` are mandatory; proof lifetime is at most ten minutes and expiry is checked again after the database lock. Bodies are bounded to 64 KiB. Development signing/exchange profiles still require real tenant agreement before adoption.

The source must use stable event IDs and a monotonically increasing sequence for each operation across retries and key rotation. A delayed event can be signed again with a fresh delivery proof and the same body. Exact replay returns `duplicate`; a lower sequence is durably classified `stale`; reusing an ID or sequence for changed content conflicts. The response contains only `event_id` and `disposition` (`applied`, `duplicate` or `stale`). Receipt acknowledgement means the database transaction committed, not that a customer notification was delivered.

The independently signed identity must match the persisted operation's tenant, membership, client, agent account, grant and terms. Source-confirmed pending/completed/reversed results require prior final bank acceptance; final outcomes require evidence. Later events cannot turn a reversal back into completion or a final no-effect failure into a commitment. The encrypted inbox record, operation transition and notification outbox insertion commit atomically. Raw signature/workload proofs are not persisted. A database error rolls all three back so the bank can retry the same event. Ingestion performs no model call, channel send or financial execution.

## Recoverable notification relay

The engine broker exposes `POST /v2/engine/notifications/claim` (`limit`, 1–50) and `/notifications/ack` (`notification_id`, `lease_token`) under the existing customer/workload envelope. The Python engine exposes equivalent authenticated `POST /v2/notifications/claim` and `/v2/notifications/ack`; acknowledgement returns 204. Profiles must explicitly set `notifications_enabled: true` and an intended `delegation_audience`. Disabled or unconfigured profiles do not use a fixture fallback.

Notifications contain an ID, `operation_updated` kind, capability, operation ID, local outcome revision, status and creation time. They contain no amount, bank account number, receipt, source evidence or banking credential. Current tenant capability settings, customer scope, mandate, permitted account, membership and registered bank authorization still govern publication. Only the latest outcome revision is claimable; a final current-policy/revision/lease check rejects superseded or revoked publication. Consumers use the revision to suppress delayed older messages and reconcile the operation for its current evidence-backed view.

Outcome recording creates the encrypted outbox entry in the same transaction. A claim leases an entry for at most thirty seconds, clipped to its twenty-four-hour disclosure expiry. Lease timestamps use PostgreSQL microsecond precision; only a matching opaque lease token can acknowledge delivery. Lost delivery can be reclaimed after lease expiry, with progressive 5–320 second backoff and at most ten attempts. Acknowledgement is idempotent under the matching token and current caller access; expiry returns 410 even before physical cleanup. Exhausted/expired entries stop normal delivery; operator redrive remains adoption work. Retries never invoke banking execution or inference.

This is a durable relay API. A configured app/channel consumer must perform and acknowledge actual delivery; no WhatsApp, external-agent webhook or other channel send follows merely from an outbox record. External-agent events require their separate signed webhook destination and disclosure profile, rather than the customer's channel.

## Content lifecycle and recovery evidence

Full operation content has a twenty-four-hour development lifetime from its reservation. Access stops at expiry even if the cleanup worker is unavailable. Each write also maintains a separately encrypted `operation-recovery` envelope: operation/terms and authorization digests, opaque account reference/action, mandate version, approval reference/expiry and source outcome references. It excludes source balances, inspection facts, proposal amounts/currencies and reservation credentials. Source reads still fetch the bank; this marker cannot supply a current balance or grant another execution.

Cleanup physically clears expired full operation payloads and credential hashes, callback bodies after twenty-four hours, and notification bodies/lease hashes at their disclosure expiry. It preserves operation identity, source event ID/digest/sequence and minimal reconciliation evidence. A late signed completion/reversal updates that recovery record without recreating erased full content. Current customer access still governs disclosure; the signed historical bank path does not create new authority. Database constraints and column privileges prevent an old runtime from undoing the erasure fence.

An expired `approval_required` or `authorized` operation with no bank acceptance becomes `expired` under a row lock. Executing, pending and uncertain attempts remain held, including across allowance periods. TTL, erasure and a missing bank response never prove no effect or justify releasing an uncertain hold. Stored funding counters remain secondary allowance evidence, not bank balances.

The service runs a bounded cleanup immediately and then every `cleanup_interval_seconds` (default 60, development range 1–3,600). Its fixed, no-argument SQL function returns counts only and handles at most 100 rows per category per call. A no-login maintenance role owns it, has limited column permissions and cannot be assumed by runtime. There is no customer/model maintenance endpoint. A stopped service can use the operator's `-cleanup` command; stopped software does not erase data by itself.

Applied migration 005 introduces the recovery path and maintenance function. Provision the maintenance role before applying it. Historical rows without recovery envelopes are a visible backfill hold: expired full content is unavailable, but physical erasure waits for successful recovery capture. The operator's `-backfill-recovery -tenant ... -membership ... -limit ...` command uses the existing keys, is explicitly scoped and returns a count only (batch 1–500). Run it before requiring the bounded `backfill_pending` count to be zero. Missing old keys or integrity failures fail closed; the command does not overwrite a valid recovery envelope or substitute another caller's data.

These mechanisms erase the named content categories, not all authority information. Active mandate configuration, approval/replay markers, allowance holds and minimal bank evidence have separate purposes. Their final retirement and each real bank's long-term operation-identity policy remain adoption work. Backup, provider, media, memory and workflow-store erasure are not established by local row cleanup. Development lifetimes do not select a production/legal retention policy.

## Service-provider authorization and dispatch

Effect executors consume the full bound dispatch reply and carry `expires_at` to network egress. Discarding expiry after checking only the mandate version is insufficient. Receipts expire within 30 seconds and the task, quote and customer proof; late execution denies the write. The Python controller validates all reply bindings and uses that expiry as the API/Playwright execution deadline. Its legacy integer-only authority shim is restricted to explicit synthetic fixtures; real effect integrations must expose the receipt. This closes an execution-time check within the existing port, not production funding/vault qualification.

Trusted tenant configuration may declare `service_providers` for Uber rides/food, Rappi, OpenTable, Doctoralia, Google businesses and DiDi rides/food. Provider capability enablement and exact destination/route digest are independent of a skill's presence. `POST /v2/engine/services/authorize` verifies the workload, audience-bound delegation, complete caller context, current provider-specific scope/mandate and independent bank access. It returns only the bound task/provider/action/route/operation/proposal identity, current mandate version and short expiry, without balances or credentials. Pause, stale version, unregistered destination and changed terms deny access.

An engine workload may call `POST /v2/engine/services/prepare` with the complete service binding, quote and task deadline. Go selects the funding account from its trusted provider profile, constructs the exact `service` financial proposal, independently inspects source funds/merchant/category and uses the existing protected operation preparation. Expiry is clipped to task, quote, proof, mandate and configured approval lifetime. Repeated preparation preserves the same operation/approval reference. The response exposes the bound service identity and `AuthorityDecision`, without funding account details, balances, inspection facts or execution credentials. The engine validates the presentation's origin/reference/expiry before returning it transiently to the customer SDK. Preparation neither reserves allowance nor executes a provider/bank effect.

For `commit`, the full exact quote determines a SHA-256 digest and UUIDv5 operation ID under the task namespace. The operation must already have a matching prepared `service` proposal binding provider, destination, route digest, quote and trusted funding account. Existing purchase policy, current independent bank inspection and protected owner approval govern the atomic allowance reservation. Chat text and an unregistered approval reference cannot authorize A1 spending. Repeated authorization retains one reservation. Financial service commitment is currently restricted to explicit synthetic local-core/provider configurations; nonfinancial/zero-price booking and real funding/card adoption are not qualified.

Only a distinct `service_executor` workload can call `/v2/engine/services/dispatch` with action `dispatch`. It revalidates the binding and reservation, then durably changes the existing operation from authorized to executing before returning one permit. A duplicate cannot obtain another dispatch permit. Cancellation can no longer classify this attempt as unexecuted or release its hold. Lost responses require source reconciliation and preserve uncertainty; neither expiry nor browser loss proves no effect. This transition is not final bank acceptance, provider confirmation, settlement or a card issuance. Provider confirmation is disclosed under current service access without requiring a second funding authorization. Generic bank execution rejects service proposals, and the executor workload cannot access engine banking/owner/core endpoints.

An engine workload retires a pre-execution operation through `/v2/engine/services/retire` with action `cancel`, the complete service/quote binding and current mandate version. The provider-specific current service grant and bank membership are checked; retirement grants no purchase authority and does not require a fresh quote or sufficient funds. The same membership lock serializes it with preparation, protected reservation and dispatch. Prepared/authorized operations become cancelled and retain only encrypted recovery evidence plus existing allowance metadata; their credentials/full inspection content are cleared. Cancelled allowance is excluded from current usage. Executing, uncertain, pending, completed or bank-accepted operations conflict and keep their holds. This is not provider cancellation, bank reversal, card cancellation or a refund.

If no financial record exists yet, retirement inserts a cancelled recovery-only operation identity with `reserved: false`, zero funding metadata and no full payload or credential. It records no invented bank inspection or reservation. Existing erased-content replay gates reject late preparation/approval. Forward migration 009 adds immutable `retired_at` and database guards against reopening retirement or retiring an already dispatched operation. Zero funding is allowed only for an unreserved retired fence; ordinary financial operations still require positive funding. The marker shares the existing operation-identity/recovery lifecycle and does not select a new production retention period. Historical allowance metadata is not a bank balance or settled spend.

Component tests cover the Go service port with real local PostgreSQL, signed ES256 owner approval, source inspection, retirement races/database guards and allowance checks. An explicit process profile exercises protected approval, correction/retirement, rejection of a delayed old approval, a freshly approved quote and one physical effect after separate worker/browser-owner loss. Its bank/owner and provider are synthetic. Native protected-screen adoption, approved funding/card adapters, financial lifecycle callbacks, real provider routes and independent acceptance remain adoption work. See [service integrations](SERVICE_INTEGRATIONS.md) and [verification](../reference/development/VERIFICATION.md).

## Remaining adoption work

The executable and local synthetic HTTP/Go/PostgreSQL observations do not qualify a real bank mapping. Actual channel notification delivery, operator redrive, retirement of mandate/audit/replay evidence, wider erasure propagation, long-lived task authority, external-agent/bank-assistant profiles and native A0 handoff remain part of the full migration. Production operating/assurance decisions and independent human/review gates remain open. Follow [setup](../reference/SOURCE_REFERENCES.md#source-8f929a906ccd) and [recorded verification](../reference/development/VERIFICATION.md).


## Synthetic browser session vault

[ADR-012](../decisions/012-browser-execution-lifecycle.md) adds an authority-owned
development port backed by forward migration **010_browser_sessions.sql**. Trusted
`service_providers` must explicitly set `allow_browser_sessions: true`; configuration
rejects this flag for non-synthetic providers or a non-synthetic core. This does not
enable real login enrollment, payment instruments or provider access.

Every POST uses the usual verified `api_version`/five-field `context` envelope.
Routing comes from the trusted service profile. Only executor acquisition returns
storage state; acknowledgements and checks contain binding metadata and
`storage_state: null`.

| Path under `/v2/browser-sessions/` | Workload | Additional required fields |
| --- | --- | --- |
| `connect` | owner | `provider`, `destination`, `route_digest`, `storage_state`, `expires_at`; requires `agent:connect`, current service grant and independent core access. Returns a fresh opaque `connection_id`. |
| `revoke` | owner | `provider`, `connection_id`; requires `agent:connect`. Erases the encrypted value immediately without needing a bank round-trip or an active mandate. |
| `acquire` | service_executor | `provider`, `destination`, `route_digest`, `connection_id`, UUID `task_id` and UUID `generation`; checks current service grant and core access, then obtains one writer. A duplicate with the same binding is idempotent. |
| `check` | service_executor | Same binding as acquisition; rechecks access, connection expiry and writer before further browser work. Returns no cookies. |
| `save` | service_executor | Same binding plus `expected_revision` and `storage_state`; atomically replaces encrypted state at the exact revision and returns the next revision. |
| `release` | service_executor | Same binding as acquisition; acknowledges confirmed disposal. It may release a revoked/expired connection, but cannot release another generation's writer. |

State is bounded to 256 KiB, 500 cookies and 100 origins. The synthetic profile
accepts only its exact loopback cookie host/origin and the implemented Playwright
cookie/local-storage shape. Unknown/duplicate fields and unrelated domains fail.
Encryption binds tenant/member/client/agent/grant, purpose, provider, connection,
route and revision as authenticated data. Forced RLS and the membership lock
isolate and serialize decrypt/save with local pause/revocation. Engine workloads
cannot access these routes.

Connection expiry is clipped to the owner's verified proof and mandate; refresh
cannot extend it. A changed mandate requires a new connection. Revocation/expiry
reject stale saves and restoration. Existing count-only authority maintenance
erases at most 100 expired payloads per invocation. It preserves writer ownership:
time passing or deleting credentials does not prove physical browser disposal.
Reconnection cannot replace a held writer. Opaque revocation metadata, database
WAL/backups, production retention and provider-side logout remain separate adoption
requirements; no full-erasure claim is made.

The executor imports state into task working memory, checks the authority before
each operation, and attempts a revision-bound refresh only on orderly close. A
failed or unconfirmed refresh does not block physical cleanup and is never retried. It releases the writer
only after disposal succeeds and retains capacity if release is unconfirmed. A
controller/process loss leaves the writer blocked for verified operator recovery;
this port provides neither automatic lock stealing nor distributed execution
fencing. Current checks do not revoke a request already in flight. Production KMS,
provider enrollment, crash recovery and gateway/microVM egress isolation still need
qualification. Operator-file profiles remain a separate bootstrap source and are
never a fallback for a configured vault.

## Bank-owned customer handoff gate

`POST /v2/engine/handoffs/authorize` uses the normal authenticated engine/delegation envelope and action/account authorization, then requires a customer principal, A0/A1 mandate, explicit tenant `bank_handoff_clients` and `bank_handoff_agents`, and `bank_handoff:prepare` in both scopes and mandate actions. Empty allowlists deny. Pause, revocation, account ownership and current mandate checks still apply. The reply is only a checked context: no reservation, funds hold, execution permit or bank execution occurs. A2/A3 and external-agent clients cannot use this route. The [capability contract](CAPABILITIES.md#bank-owned-customer-handoffs) records the approved development boundary and its separate bank-owned authorization state.
