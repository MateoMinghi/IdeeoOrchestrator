> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Data ownership, minimization and lifecycle

This is the shared engine's data contract. It complements [ADR-001](../decisions/001-tenant-authentication-and-delegation.md): authentication establishes the principal and current authority permits an operation; neither establishes permission to retain every returned field or send it to a model. [ADR-005](../decisions/005-data-ownership-and-lifecycle.md) records the decision and scoped implementation authorization. PayMe is one tenant, and its banking API is one integration.

## Responsibility and purpose

The tenant owns customer identity, KYC, customer credentials and its customer-to-account mapping. The bank/core owns balances, postings, settlement and the financial ledger. The engine owns its task state, delegation evidence, preferences and necessary delivery bindings. A trusted adapter can process more data than a model may see. Channel recognition, a customer-data reference, a cached balance, a task ID and a remembered preference never confer authority.

Minimization means retaining data for a defined product purpose, rather than claiming the whole database contains only `user_id ↔ phone`. Tasks may legitimately need a recipient, invoice tax identifier or shipping address. Obtain only the needed fields through the tenant's approved service or a protected user flow, use them in the authorized executor and expire them. Do not copy a whole customer profile into conversation, planner context or memory. Do not assume every banking core offers a customer-profile endpoint.

PIN setup and authentication use the tenant's protected flow. The engine does not archive raw KYC submissions, identity documents, PINs, passwords, OTPs, session tokens or signing secrets. Consent/assurance receipts and opaque references are distinct from those inputs. Ordinary conversation is not a credential form. The current sensitive-input detector is a defensive heuristic, not a guarantee that arbitrary free text contains no personal information.

## Retained categories

Every new field or store must specify these dimensions before enablement. “Protected” means approved secret/key resolution, authenticated encryption with tenant/member/resource/field/version binding, restricted readers and scoped lookup. Production KMS qualification remains open; development keys are not that qualification.

| Category and purpose | Authoritative owner; permitted engine readers/writers | Model visibility | Protection and retention trigger | Erasure propagation |
| --- | --- | --- | --- | --- |
| KYC submissions and authentication inputs | Tenant-owned protected enrollment/auth flow; no engine enrollment handler | None | Captured and processed outside the engine; no engine archive | Tenant handles its own records and transient buffers |
| Membership, client, agent account and channel bindings | Tenant identity plus engine authority; trusted identity/channel services | Only task-relevant opaque aliases, if needed | Protected necessary identifiers; relationship/access lifecycle | Remove delivery bindings and invalidate sessions/grants; preserve justified minimal authority evidence separately |
| Grants, approvals and mandates | Authority and tenant; authority services and approved audit readers | Action constraints, never credentials or authority to self-approve | Minimum structured evidence; purpose-specific audit/reconciliation policy | Revoke access immediately; retained evidence has a documented hold and release trigger |
| Funding-account references and preferences | Bank owns accounts; user states preference; authorized account tools and memory service | Per-request aliases; labels only under explicit disclosure policy | Protected account references; preference correction/deletion or policy expiry | Delete preference payload and indexes; do not change the bank account |
| Current balances, statements and transaction facts | Bank/core; host for interactive app/SDK banking; authorized bank executor for separately qualified paths | No app/SDK balance/history result in chat or model context; current direct-read development code still renders typed results | Host-only single display is the target; existing task observations remain timestamped development evidence, never a ledger | Host display expiry is separate from bank-record retention; erase existing task copies on their lifecycle |
| Customer-visible original messages | Customer/tenant transcript service; scoped UI/history readers | Not a prompt source; only separately permitted initial interpretation, then sanitized projection | May retain the customer's original non-secret input under an explicit bounded transcript policy | Delete transcript copies/exports on their lifecycle; retention does not authorize future inference |
| Temporary model conversation context | Engine; scoped context builder/concierge | Selected bounded context; captured sensitive banking fields replaced by references on subsequent calls | Encrypted context with expiry separate from visible history; ADR-010 projection is not fully implemented | Delete raw pending fields, derived summaries/indexes and provider continuation copies; provider retention is separately qualified |
| Reusable recipient contacts (target, not implemented by this decision) | Tenant contact source preferred; exact owner/store to be agreed; trusted resolver only | Scoped reference/minimal workflow state, not resolved CLABE/phone | Field set, saving/confirmation policy, encryption, retention and erasure required before a new store is enabled | Support correction/deletion and invalidate references/derived recall; do not recreate a deleted contact from retained chat |
| Tasks, attempts, operation evidence and delivery state | Engine for execution state; bank/provider for effect outcome; scoped coordinator/executors/reconciler | Minimal goal/state, opaque resources and sanitized observations | Structured IDs, outcome transitions and authority evidence; separate payload from replay/audit markers | Erase unnecessary content; retain only justified reconciliation/replay evidence until its separate expiry |
| Explicit personal preferences | User; authorized preference service | Selected relevant preference with provenance | Protected source/time/correction controls; user deletion or purpose expiry | Delete content and derived copies; suppress rederivation where sources remain |
| Inferred habits and familiar destinations | Derived from authoritative operational evidence; controlled derivation service | Structured attributed recall with uncertainty | Protected, correctable; source revision/outcome, derivation version and expiry | Invalidate on reversal/correction/source deletion; deletion suppression prevents recreation from retained audit sources |
| Audio, screenshots, receipts, page content and browser state | User/provider/source; scoped trusted tools | Selected minimized observations only | Temporary by default; retain a selected evidence item only for a stated purpose | Objects, thumbnails, OCR, summaries, embeddings, browser profiles and delivery URLs |
| Telemetry and native provider state | Engine/provider; allowlisted telemetry writers, separately authorized diagnostics | No telemetry feedback as authority | Typed metrics only in ordinary telemetry; opaque continuation data is protected task state, with the same expiry | Delete content-bearing diagnostics/continuations and exports; do not hide copies in workflow histories |
| Provider/backend credentials and encryption keys | Secret manager/KMS; authorized adapters/key resolver | None | Separate approved secret boundary; versioned rotation/rewrapping and invalidation | Revoke/rotate; retain old decryption versions only through rewrap/backup policy |

Tenant, membership and where applicable caller/client/agent/grant scope apply to reads, writes, uniqueness, relationships, jobs, events, files, caches, retrieval and browser profiles. PostgreSQL uses transaction-local verified scope, forced RLS, `USING` and `WITH CHECK`, and a runtime role that cannot own tables or bypass RLS. Selecting a scope is itself authorized server behavior, not something RLS proves. Operational dispatch must expose only minimal work identifiers and enter scoped execution; do not copy the legacy scheduler's broad owner connection.

## Retired account enrollment stores

[ADR-011](../decisions/011-tenant-api-and-channel-ownership.md) retires engine account-creation execution, forms/session exchange and WhatsApp webhook/Flow handling. The current [onboarding contract](../contracts/ONBOARDING.md) returns an intent-only tenant handoff. New KYC, PIN, applicant/session proofs, Meta payloads and bank-creation results are not accepted or stored by an engine enrollment workflow.

Applied migrations remain immutable. Historical encrypted `onboarding` and `channel_link` resources may remain from the earlier development increment; their existing scheduled resource lifecycle still erases expired content and retires bounded replay rows. Removal of runtime handlers is not permission to erase retained records, invent reconciliation evidence or declare an uncertain bank effect absent.

Historical `enrollment_anchor` rows contain only tenant, stable applicant reference, attempt UUID and creation time under forced tenant/applicant RLS. Their duplicate-prevention purpose remains while a relationship/outcome is unresolved. Tenant-approved reconciliation and identity retirement/ARCO processing must establish bank-side disposition before an operator retires a marker or migrates ownership. No new runtime enrollment delete, callback or creation API is exposed here. Real-tenant migration/retirement requires its own reviewed procedure and authority; no production erasure completion is claimed.

## Administration stores

The personal Railway test profile stores app-owned operator password hashes,
encrypted TOTP enrollment secrets and replay counters in the administration
database. Operator sessions are bounded to eight hours. A temporary self-hosted
Keycloak test database is retained separately after its service is stopped; it is
not used for current sign-in. Test identities and private login/enrollment exports
require explicit operator deletion when testing ends; automatic identity retirement
is not implemented. No customer bank PIN is retained there. Trusted synthetic bank
mappings and test signing keys remain private runtime
configuration, with a seven-day mapping/mandate validity bound. Disabling access and
erasing test identity/configuration copies are separate operations. These controls
do not authorize real customer data in this environment.

The [administration contract](../contracts/ADMINISTRATION.md) adds these stores;
its development fixtures contain no real bank customers. These are distinct from
bank identity, KYC, ledger records and authority evidence.

| Store and owner | Purpose and readers | Model visibility | Retention and erasure |
| --- | --- | --- | --- |
| Platform operator records and tenant memberships; platform identity administration | Operator email/name, immutable IdP subject or development password hash, roles and current status; authenticated operator service | None | Deactivation revokes sessions; membership revocation immediately restricts access. Operator retirement/pseudonymization and legally justified audit linkage need a production policy; tracked under R-12/G5 rather than claimed implemented. |
| Operator sessions and OIDC state; platform authentication service | Session/CSRF hashes and encrypted PKCE/nonce state; authentication boundary only | None | Sessions expire within eight hours; login state within five minutes. Scheduled cleanup removes expired records; logout/deactivation revokes sessions. Raw bank credentials are not identity inputs. |
| Tenant drafts and immutable publications; tenant administration | Reviewed public identity, branding, guidance, tools and connection references for rollback and audit; scoped operators and engine read-only profile source | Only selected public guidance under an approved route; real-tenant configuration inference needs registered processing prerequisites | Retain while serving the tenant and its approved configuration-history purpose. Final tenant retirement and audit/history retention require an approved policy. Private customer content and credentials do not belong in profiles. |
| Console conversation snapshots and messages; engine administration | Scoped operator QA and tenant support; originating operator and authorized tenant/platform administrators | Only the bounded user request and public facts under the tenant model policy | Encrypted messages expire after 1–7 days and are withheld immediately at expiry; bounded cleanup removes payloads and snapshots. Titles contain timestamps. Opaque replay/audit retirement and wider provider/backup erasure remain R-12/R-13 adoption work. |
| Tenant connection secrets; trusted secret resolution | Encrypted current credential values for approved adapters; scoped administrative replacement, with no value readback API | None | Replacement overwrites the current envelope. Bank/provider revocation, production KMS, rotation/rewrapping and backup retirement remain the secret owner's explicit lifecycle. |
| Administrative audit and request budgets; platform operations | Attributable access/change/denial evidence and atomic console quotas; scoped audit readers | None | No conversation text or credential values. Audit/replay retention and operator erasure linkage need a production retention decision; quota views expose at most 30 days. |

## Tasks and memory

[ADR-014](../decisions/014-persistent-assistant-context.md) records the continuing
assistant design: conversation, assignment, memory, files/artifacts, connection
and execution environment have separate lifecycles. Selective materialization,
general memory inspection/index erasure and ongoing assignment renewal remain
to be specified; this creates no new store or retention period.

The V2 customer history reader retains accepted original messages in the existing
encrypted `assistant_turn` payload, with the same task expiry and content erasure.
It introduces no separate archive or extended retention. `customer_message` is
customer-display data only: future model context still uses the separately
permitted projection. History reads recheck current caller authority and suppress
protected banking results and approval controls. Missing legacy originals remain
missing; they are not inferred from captured financial fields. See the
[history API contract](../contracts/CAPABILITIES.md#customer-conversation-history).

Conversation decisions may select the newest twelve scoped, unexpired turns with
accepted nonbank requests, original service goals and authorized public observations.
Banking results and captured protected fields are excluded from this context.
Source references are reauthorized before disclosure; previous generated replies
are not evidence. Opt-in public research retains goals, revisions, budgets and
partial public excerpts in the existing encrypted background task. Public research
also retains bounded attempt IDs, provider correlation IDs, transport timestamps,
usage, action reservation/execution uncertainty and validation feedback there.
These metadata do not retain model prompts, screenshots or private provider envelopes;
they inherit the task's expiry and erasure policy. Original source timestamps remain
unchanged when observations are reassessed after a goal correction.
Selected supporting turn IDs can recover exact, already classified customer
constraints independently of the original goal ID. An unclassified failed turn
exposes only its failure metadata, never its raw request; recovery must clarify
missing information rather than reintroducing protected inputs from visible history.
Disposable browser history is not conversation memory. Existing task/turn expiry and erasure
apply to these fields and their derivatives; no new preference store is created.

The [Browser Use worker](../decisions/013-browser-use-preparation.md) retains
upstream navigation history and browser state only in its disposable task
process. Model requests are transient engine-controlled disclosure, not task or
customer history. Controls stay visible; protected values are removed before
upstream DOM serialization, with live protected-target checks before input.
The text-only profile suppresses upstream automatic screenshots. All worker
temporary/config/file-system directories are rooted in the owned task directory
and removed on confirmed disposal. Browser Use Cloud/telemetry are disabled;
provider keys and delegated customer proofs are not inherited by the worker.
Existing task expiry, erasure and real-data disclosure gates apply. Failed
cleanup retains a blocked owner rather than claiming disposal.

The synthetic [browser session vault](../contracts/AUTHORITY.md#synthetic-browser-session-vault)
belongs to the separate Go authority database. It retains only encrypted
Playwright cookies/local storage and scoped connection/writer metadata, with
forced RLS. The requested expiry is capped by verified proof and mandate; saves
do not extend it. Owner revocation clears ciphertext immediately, and bounded
authority maintenance clears expired values. Old saves cannot revive them.
Compute disposal and saved-connection revocation remain distinct. A writer is
released only after disposal; expiry/erasure retains that fence. Opaque revocation
metadata, database WAL/backups, provider logout and production KMS/retention
qualification remain pending. Real account state is disabled on this port.
Executor-local operator files remain separately owned and are not a vault fallback.

The tenant model catalog is platform configuration, stored transactionally with
its attributable administrative audit. Scoped engine/admin projections expose
only eligible tenant profiles; provider credential values remain outside it.
Profile IDs and qualification/processing references do not establish legal approval.

Tenant knowledge libraries contain approved public assistance content in the
existing configuration/version store, with content hashes and source-bound
citations. They are not customer-document or KYC archives. Draft removal and a new
publication remove content from subsequent answers, while historical versions
retain their declared public-configuration purpose; full retirement/history
erasure needs the existing approved policy. The extractor does not retain uploaded
binary files or PDF child-process inputs. Customer secrets/personal records must
not be uploaded or embedded in personality instructions.

`inference_observations` retains content-free, tenant/member/client/agent/grant-bound
attempt metadata for 30 days: model/profile/purpose, outcome, latency, nullable
usage and optional referenced price estimates. It contains no prompts, replies,
bank values or credentials. Console-origin attempts carry fixed administration
identifiers and remain distinguishable from engine calls. Forced RLS protects
rows; authorized administration views return aggregates without member IDs.
Append-only runtime permissions and bounded lifecycle deletion apply independently
of transcript retention. Unknown usage/prices remain unknown, and estimates are
not provider invoices.

Native browser checkout keeps rendered native payloads and private lock/payment references only in executor working memory. Their digest binds the approved quote; the payload is absent from model context and durable task history. The executor owns an encrypted `artifact` with purpose `native_site_receipt`, retaining the minimal provider reference/outcome and operation/quote/route binding for exact-source recovery. It uses the same caller scope, task parent, expiry cap and cleanup/replay lifecycle as other service artifacts; it creates no new retention period or financial ledger. Source acknowledgement is not payment/settlement evidence. Operator cookie files and future authority-owned vault requirements remain separate; task cleanup does not silently delete an operator's account profile.

Verified interpretation candidates use encrypted, caller-bound `artifact` resources with purpose `verified_interpretation_candidate` and the existing cleanup/replay lifecycle. They retain a typed read template, its digest, opaque observation IDs and conflict state; they do not retain source answers, approvals, financial outcomes or raw request index keys. A Google business-discovery template additionally retains its exact safe customer request as the encrypted typed goal, under that same approved purpose/retention. Its index binds trusted route and instruction revisions; source results, selected locations and private rendering tokens are excluded. The exact-goal comparison digest is request-local working memory, not a new retained index. Exact projected request/context is keyed with the tenant/caller-bound fingerprint, including schema, prompt, model, policy and configuration revisions. Explicit rule retention is capped by both tenant and engine task-content limits. After expiry, a new retention epoch can relearn a candidate; an old approval cannot revive erased content. Independent promotion/acceptance references and immutable skill releases live in trusted operator configuration, contain no customer account state and are never model-created approvals. No new retention duration or cross-customer reuse is enabled by default.

Consumer API tasks use the same encrypted resource, replay and cleanup lifecycle. Customer-selected ride coordinates and restaurant/time/party selections, minimized source estimates/availability and observation times stay owner-scoped until existing expiry; no new catalogue or retention period is introduced. Credential values stay in operator-managed server secrets and are never retained in task/model/history. Only configured secret references participate in route fingerprints; the operator owns rotation/revocation. Source results are not model inputs. The Places client requests only place IDs and constructs Maps links from the customer's query; it does not copy provider names, addresses, reviews or coordinates. Maps MCP retains only approved Grounded Output, never raw responses or private rendering tokens. Live activation requires the recorded product-specific content/display/retention mapping; local wire fixtures do not grant real-data storage rights. See [consumer API products](../contracts/SERVICE_INTEGRATIONS.md#consumer-api-products).

Conversation context, durable task evidence and personal memory are separate lifecycles. A week-long task must keep the minimum recoverable state after a short channel session expires. Temporal histories, queues and object storage must carry protected references or minimized structured evidence; adopting Temporal must not create a second permanent transcript archive.

The bounded [background balance profile](../contracts/BACKGROUND_TASKS.md) retains the instruction, capture, selected account, progress and customer delegation proof only in an encrypted purpose-bound resource. Proof is reverified, never refreshed automatically, and removed with the instruction on terminal transition. Ordinary Temporal history contains opaque task references, sequence numbers and constant control states only; questions and observations remain in the application repository. Existing content cleanup erases the resource under its tenant/engine retention, and missing content stops worker continuation. Internal worker locator functions disclose routing metadata only to the runtime role; they are not customer APIs or authorization decisions.

The synthetic [service-task foundation](../contracts/SERVICE_INTEGRATIONS.md#development-service-task-boundary) uses these same encrypted conversation/background resources and their existing cleanup/replay lifecycle. Preparation retains the bounded goal, tenant/provider route fingerprint, mandate/skill version, quote and exact terms, protected approval reference, operation ID, bounded counters and minimized inference usage. Model context contains only the approved goal, loaded instructions and bounded non-secret browser fields; it excludes approval references, delegation proof, protected browser input and source outcome. Terminal transitions remove the goal, approval reference, transient observation and customer proof; the quote/outcome remain scoped receipt evidence until resource expiry. The [Uber customer handoff](../contracts/SERVICE_INTEGRATIONS.md#prefilled-customer-handoff) retains customer/tenant-selected coordinates and display labels in the same encrypted task for authenticated link delivery/replay until its existing resource expiry. These structured selections are not added to model context; the customer's original text remains governed by the existing disclosure policy. Link creation does not disclose them to Uber; customer navigation through the link does. No location catalogue or new retention period is introduced. Unresolved submissions remain uncertain and retain the minimum proof/evidence for bounded reconciliation until expiry; task expiry does not prove that a provider effect is absent.

The [development Maps discovery path](../contracts/SERVICE_INTEGRATIONS.md#development-discovery-tasks) retains synthetic summaries, attributed place references/links and the engine observation time in the same encrypted task until existing cleanup. Its temporary customer-area copy is removed at terminal transition; the private rendering token is excluded entirely. The model receives only the permitted original goal and clarification, never Maps results or a source rendering token. Real Maps routes remain unqualified: this fixture lifecycle is not permission to store/disclose Google content. A real-content mapping must identify the applicable Grounded Output exception, permitted model handling, display and retention before activation. No new store, retention period or location catalogue is introduced.

Unconfirmed pre-execution retirement keeps the old quote and intended transition in the same encrypted task resource, blocks effects and requires authenticated cleanup before applying a replacement or terminal state. Accepted caller controls may replace the retained credential with that caller's current verified proof; they do not reset counters, extend the task deadline or renew a mandate. No protected approval URL/host payload is added to retained state. Go retirement clears full approval/inspection and credential columns, retaining the existing encrypted operation-recovery identity and allowance/replay metadata with immutable `retired_at`. A retirement before preparation has no inspected funding amount or reservation. These markers share the existing operation/recovery lifecycle; bank/card cancellation, backups and wider erasure propagation remain separate.

The shared browser owner keeps protected input only in its transient, isolated Chromium context. API and worker requests carry verified delegation to that same owner; no screenshot or protected input is stored in application state or sent to the model. Screenshot responses are owner-authorized and `no-store`. Explicit/terminal close and bounded idle expiry dispose sessions; remote cleanup failure does not rewrite a confirmed/cancelled task outcome. Persistent cookie/login storage, multi-replica routing and backup/provider erasure remain unqualified. The synthetic profile uses no real credentials or provider accounts.

Consumer DOM preparation additionally accepts operator-owned Playwright storage-state references, bound to tenant/member/provider. The browser owner imports a bounded, domain-checked state into an isolated task context; it never copies the file into application resources, model context, telemetry or an engine credential catalogue. Concurrent tasks cannot edit one account at once. Context closure/idle expiry releases its imported state; refreshed login state is not automatically exported. The operator owns file permissions, rotation, expiry, replacement and physical erasure of the original file. Managed secret storage, temporary browser-file cleanup after host/process loss, backup erasure and real-account retention approval remain deployment/adoption requirements. No operator file is erased merely because a task ends.

Visible DOM proposals and Maps browser source links use the existing encrypted task lifecycle and current disclosure checks. Proposals with missing displayed booking prices retain typed source terms with an explicit unknown-price status, never a zero-cost financial operation. Source terms and results are excluded from subsequent model requests. DOM snapshot IDs and observation deadlines describe engine observation freshness, not provider confirmation or price locks. Live account/site activation needs its recorded permitted source fields, disclosure/display and retention mapping; synthetic-page evidence does not approve real provider-content storage.

The opt-in local fictional-patient public-directory experiment retains classified
public source excerpts/links, observation time/hash and browser action names in
the existing encrypted assistant turn and admin transcript, under their existing
owner, access, retention and erasure rules. It adds no independent memory or
retention period. Private DOM subtrees, input values, raw model reasoning,
screenshots and website account credentials are excluded. Its fresh task-local
browser and library working files are removed on normal close; host-loss cleanup
remains a local test-runtime limitation. Production health/customer processing
and persistent provider sessions remain disabled.

An encrypted caller-bound `artifact` records one physical browser submission attempt per task before egress. Its replay fingerprint binds the operation/proposal/route; its content contains only purpose, task ID and operation ID. The browser owner writes it solely to prevent duplicate effects after process loss; it is never model context or a financial ledger/reservation. It uses existing resource cleanup and replay retention. Hour-rounded content expiry is at most one hour beyond the task resource's expiry; this minimal marker cannot authorize access after the task expires. Ordinary replay tombstones follow the configured engine replay-retention policy.

Read-only API execution similarly retains an encrypted caller-bound `artifact` with purpose `service_api_read_attempt`, one task/revision replay key and a route-binding fingerprint. Its content contains only purpose and opaque task ID; no provider token, query or result is copied into this marker. The separate executor writes it before source I/O to prevent duplicate RPC reads against one action debit. It shares the task parent, exact task-expiry cap, tenant erasure and existing replay cleanup. Typed source results remain in the authorized task under their existing provider-specific content policy. The executor's referenced environment credential remains separately owned bootstrap state; marker or task deletion does not revoke it.

Read-only mission ancestry, authenticated origin, child questions/generations,
correction history, aggregate usage and progress fingerprints use those same
encrypted purpose-bound background resources and tenant/engine expiry/cleanup.
The brain owns this task data; Temporal receives only opaque references/control
values. Context projections are request-local derived data, never another store
or source of authority. Root/child disclosure rechecks current access, and erased
resource content cannot be restored by task replay or a summary.

An operation records attempted, pending, completed, failed and reversed outcomes distinctly, with an authoritative source/event identifier, observation time and reconciliation state. Pending can recall an intention; only authoritative completed evidence can support a completed purchase or habit. A reversal invalidates the corresponding positive evidence. Account balances are fetched from the bank, never reconstructed from engine operations.

Prefer deterministic derivation from existing records to model-written permanent notes. Preferences include whether the user stated them or they were inferred, source identifiers, time/version and correction controls. Corrections take precedence over inference. Forgetting inferred memory requires a minimal suppression marker while retained source evidence could otherwise recreate it; that marker contains no forgotten content and has its own expiry. Markdown can be an inspection interface, rather than canonical memory storage.

## Model disclosure

### Customer transcript, model context and contacts

[ADR-010](../decisions/010-app-host-banking-and-model-context.md) confirms that a customer-visible original message can remain while sensitive captured fields are excluded from subsequent model input. This is not an instruction to retain everything forever. UI history and model context have separate access, purpose and expiry. Never rebuild a prompt from raw visible history, or reintroduce fields through pending tasks, tool results, summaries, embeddings, memory, caches, subagents or opaque provider continuation. PINs, OTPs, passwords and credentials remain prohibited even on the first inference request; permitted non-secret initial disclosure still needs the tenant/provider gate.

Balance and movements for interactive app/SDK use stay in the host's protected, single-display screen. They must not return to chat/API replay, model context, assistant-spoken responses or chat exports. One display is not bank-record erasure. A reusable contact is structured protected data, resolved deterministically outside inference under current tenant/membership/resource authority; an alias grants no permission and cannot be resolved across users. Ambiguity requires selection. Before adding an engine store, agree its authoritative owner, fields, save behavior, correction/deletion, retention and erasure propagation. No engine-owned contact table or contact lifetime is introduced; the optional runtime port reads the tenant-owned directory. An encrypted caller-bound `host_banking` resource retains intent, conversation/account references, typed captured inputs and an access-token digest under the minimum tenant/engine task retention and existing replay-marker cleanup. Usability ends at credential/content expiry; consume atomically clears its raw input fields and prevents reuse. This is brain-owned delivery state, never a bank-result store, ledger or customer-authentication service.

Not resending a field is distinct from deleting the original inference request or provider logs. Regex detects some known formats but is not complete DLP. Do not classify financial identifiers or recipient/amount combinations as public merely because a customer entered them. V2 pending projection now sends capability, missing-field names and captured-field names only; the server restores exact typed values after inference for an explicit matching continuation. [Host banking](../contracts/HOST_BANKING.md) implements protected tenant-directory lookup, opaque chat results and session-bound one-time input delivery. Existing direct-read clients retain their separate scope; native adoption remains required.

Each real tenant explicitly enables exact provider/model routes and user-text processing. Approval must also cover processing region, subprocessors, retention/training terms and allowed data categories before real customer use; the current development route allowlist does not prove these vendor terms. Router, planner, embeddings, speech, reviewers and fallback paths share this boundary. A cheap classifier is still an external disclosure.

The current runtime sends request-local account aliases and hides account labels unless enabled. Known account IDs/labels in text are substituted using case/accent normalization and original spans; normalized collisions become ambiguous references rather than guessed matches. Arbitrary user text may still contain personal data; enabling its route permits that processing subject to the tenant's approved policy. It never permits credentials, raw KYC or unrestricted profile disclosure. Bank results are rendered deterministically without another model call. Model outputs remain proposals, and exact resource IDs are resolved server-side and reauthorized.

Capability support, tenant enablement, caller grant, resource ownership, current mandate and data disclosure are distinct checks. Empty capabilities disable the capability; an absent HTTP tenant data policy disables model disclosure. Each actual router/planner route is prechecked before budget reservation, then authorized again after awaited budget/current-resource work, immediately before constructing its model projection from that policy snapshot. A malformed, removed or changed connector configuration fails closed. Connector/credential changes require restart; current authority comes from the source on each applicable check.

## Retention, cleanup and erasure

Retention is purpose-specific. The development defaults (task content up to 24 hours, preference 90 days, replay markers an additional 30 days) exercise mechanisms; they are not universal product or legal retention decisions. Tenant task limits can shorten the engine limit. Future long-running tasks need their own continuity/audit policy rather than extending a raw conversation archive.

Expiry blocks use immediately. A scheduled, bounded cleanup worker physically clears expired task content/inference and deletes expired preferences. It preserves a minimal task/replay marker through the separate replay window, then removes it and orphan conversation identifiers. It removes obsolete daily budget counters separately. Cleanup runs without customer traffic while the service is running. The no-login maintenance role exposes a fixed erasure function, cannot be assumed by the runtime and returns counts, never customer content. A stopped service needs the operator's scheduled maintenance run; a timestamp alone does not delete bytes.

Deletion completion means each applicable store has acknowledged removal or a documented retention hold. Track request ID, category, affected scope, completion/hold, retry state and final time without retaining deleted content. Propagate deletion to summaries, embeddings, objects, workflow histories, caches, exports, provider state and restore-time tombstones. Backups require a bounded expiry and replay of deletion markers before restored data is served; local row cleanup does not certify backup erasure. Do not claim these unimplemented stores have a working erasure adapter.

Privacy deletion does not cancel a financial effect or erase a bank's ledger. Stop unauthorized continuation, revoke references/sessions and reconcile uncertain effects. Required authorization/action evidence must be durable before an effect; optional telemetry can be best effort. The [authority service](../contracts/AUTHORITY.md) now implements independently signed bank outcome ingestion, atomic inbox/outcome/outbox records and a scoped notification relay in controlled development. A fixed maintenance function erases expired full operation/inbox/outbox content while preserving a separately encrypted minimal recovery record. Uncertain holds are not released on TTL, and late signed reversals do not recreate erased full content. Retained authority evidence and actual channel delivery still need their separate adoption policies and implementations; no real bank execution or ledger ownership follows from synthetic tests.

## Current enforcement and adoption gates

The registered Rider executor keeps OAuth secrets in its own resolver, outside the engine worker/model/SDK. Its development connection catalogue contains caller/connection/provider-subject and payment-alias/reference metadata plus environment secret references; it is a private bootstrap configuration, not a production vault or an approved real-user connection lifecycle. Tenant enrollment must verify subject/payment ownership and permission. Private fare/receipt records contain only necessary source terms/references, are encrypted and expire no later than their original task. Physical-attempt markers share that expiry and the existing separate replay lifecycle. Closing an HTTP client neither revokes OAuth nor cancels a ride; erasure/rotation/revocation of the original connection and vendor state need their qualified owners. No new retention period, cardholder store or automatic real-account enrollment is introduced.

Individual owner restrictions keep a separate append-only, scoped control audit: opaque actor/target references, mandate/control versions, restriction, digest and time. Pausing/revoking stops authority immediately while preserving uncertain effects and signed bank recovery. It stores no raw approval proof, balance or credential. The [authority history contract](../contracts/AUTHORITY.md#immutable-mandate-history) additionally preserves complete immutable encrypted mandate versions and verified approval receipts, with authorized owner pagination. Legacy imports explicitly lack approval provenance and disclose preceding gaps. History is evidence, never current authority; no raw signature/token archive or financial ledger is created. Current mandate, history and nonce writes are atomic. Historical keys remain necessary after client/grant/key rotation; final mandate/control-audit retirement, production retention/hold policy and backup/key erasure remain separate human adoption decisions.

Implemented: current tenant/member/caller isolation; source authority checks; exact route/user-text disclosure gates; model account projections; encrypted task result/event payloads and explicit preference payloads; keyed request fingerprints; preference correction/deletion and provenance; expiry-safe continuation; bounded scheduled row cleanup and replay markers; an optional purpose-bound protected-data resolver port with expiring single-use caller-bound references and current authorization before/after retrieval.

The protected-data resolver is for trusted executors. No bank profile adapter or checkout/invoice executor is registered today; an absent provider is unavailable. Its initial field/purpose vocabulary is a controlled port contract, not proof that WhatsBank or every tenant supplies those fields. Existing plaintext development rows need the documented backfill before customer data adoption. Key versions/rewrapping are supported by the envelope/key port; production KMS, access audit, rotations/cache policy and operational qualification remain required.

Optional WhatsApp media observations use encrypted caller-bound `media` resources
under the existing task-content expiry and replay-retirement limits. Raw attachment
bytes stay in tenant-owned encrypted temporary storage and request-local processor
memory; the engine stores only the scoped extracted observation, provenance and
opaque reference needed for the conversation. Customer-visible transcript references
contain no extracted destination or protected URL. Provider usage observations are
content-free. Tenant source expiry, revocation and current media disclosure policy
bound both processing and reuse; retained observations cannot renew those rights.
The tenant remains responsible for attachment preflight, deletion, supplier retention
and applicable legal holds. This does not establish production erasure propagation.

Not yet implemented: effect-producing operational history/derived habit persistence and suppression, a production-wide erasure coordinator, backup/provider deletion integration and production deployment. Scoped durable execution, browser artifacts and media observations have development contracts and evidence; vector stores remain unimplemented. Agent accounts represent scoped mandates/limits/attribution today; a bank-backed reserved balance or “subledger” needs an explicit financial ownership/settlement contract and does not authorize a local financial ledger.
