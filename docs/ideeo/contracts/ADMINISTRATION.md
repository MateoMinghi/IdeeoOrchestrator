> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Tenant administration console

`apps/admin` is the Next.js console for the existing shared engine. Its FastAPI boundary is `ai_engine.admin.api:create_admin_app`; PostgreSQL stores operators, memberships and tenant configuration. PayMe is seeded idempotently. Real bank trust, customer mappings, WhatsApp provisioning and production promotion retain their own gates.

The console interface and catalog descriptions are in Spanish, with `es-MX` date
formatting. Labels are distinct from protocol values, and tenant-authored content
and bilingual configuration fields retain their stored values. Chat updates scroll
only the message panel, without moving the page; reading earlier messages suspends
automatic following, including when returning after a response finishes offscreen.

## Access

Organization login uses configured OIDC endpoints, authorization code with PKCE, browser-bound single-use state, nonce, trusted issuer/audience/JWKS and required MFA evidence. Operators are preprovisioned by immutable IdP subject; email claims do not grant privileges. Explicit development mode permits generated passwords only for a loopback console. Bank-customer identity remains tenant-owned.

The personal hosted preproduction profile can instead select `ADMIN_AUTH_MODE=password`:
the existing web form signs in through this backend with email, password and an
authenticator code. This mode requires an exact HTTPS origin and secure cookies.
Passwords use the existing salted scrypt verifier; TOTP secrets are encrypted and
bound to the operator ID. Six-digit SHA-1 TOTP uses a 30-second period and one-step
clock tolerance. PostgreSQL locks and consumes the matched counter atomically with
session creation, so a code cannot produce two sessions across instances. Missing
MFA never falls back to password-only access. Persisted limits allow at most ten
attempts per fifteen minutes both per operator and per operator/address, including
unknown identities. New operators receive one-time password/authenticator setup
details only through an authorized administration response. Adding a membership
for an existing operator never resets or exposes that operator's credentials.

Opaque sessions are stored as hashes, use HttpOnly cookies, expire, and check current operator status, exact origin and a session-bound CSRF token. Deactivation revokes sessions. Membership removal applies on the next tenant access and before asynchronous conversation disclosure.

Before buffering enlarged draft, catalog or document writes, the console calls
`POST /admin/v1/auth/validate`. This core authentication endpoint checks the same
session, origin and CSRF proof as the final mutation; it grants no tenant or bank
authority. Deploy it before a console that requires it. A missing endpoint or
upstream failure is service unavailability, not evidence that the operator signed
out. Validation failure never forwards the pending write.

| Role | Scope |
| --- | --- |
| Super admin | All tenants, platform operators, connections and releases. |
| Tenant admin | Assigned tenant configuration/publication, team and credentials. |
| Tenant editor | Assigned tenant drafts and conversations. |
| Tenant viewer | Permitted assigned-tenant metadata. |

Memberships are independent per tenant. Backend destinations and configuration-AI disclosure require platform administration. Operators cannot remove their own platform access. Member creation sends no invitation message. Administrative roles never establish customer proof or financial approval.

`engine_admin` neither owns tables nor bypasses RLS. Tenant tables force RLS; audit is append-only for the runtime. `engine_app` has only scoped configuration reads. Authenticated server transactions supply operator context; request JSON cannot establish it.

## Configuration

**Estudio → Modelos IA** selects exact catalog profiles independently for
conversation, configuration assistance and tenant-document questions. Super
admins manage the version-checked platform catalog; edits and audit share one
PostgreSQL transaction. Provider credentials remain in approved server settings,
and catalog registration does not supply processing approval. Effective runtime
information comes from the authenticated engine, separately from draft choices
and last-observed usage. Synthetic connectivity tests require a saved selection,
current operator/session/CSRF, disclosure permission and an atomic daily budget;
they do not qualify a profile. Session, selection, source and processing checks
repeat around model calls and before disclosure.

Personality adds independent formality, brevity, warmth and emoji controls, plus
named guidance entries. Finite ordinary-response styling preserves exact identity,
support, capability facts and approval requirements. Arbitrary guidance remains
bounded lower-priority interpretation context; it cannot grant authority or
rewrite protected financial presentations. Legacy tone-only configurations keep
their existing rendering. Changes remain draft-only until publication.

**Estudio → Conocimiento** manages approved public tenant documents and HTTPS
informational/handoff links. TXT/MD/PDF uploads are bounded to 5 MiB; PDF extraction
runs in a credential-free, resource-bounded subprocess. Documents are limited to
20,000 characters each and 100,000 UTF-8 bytes per library. Encrypted PDFs,
scanned files without extractable text and invalid/oversized content fail visibly.
Extracted candidates change only the local draft until saved. Question tests use
the saved revision, a separate explicit knowledge-disclosure flag and the selected
knowledge profile. Citations bind exact active document IDs, content hashes and
source quotes; attribution validation alone does not establish semantic quality.
Missing information produces abstention. These documents are public assistance
content, not customer records or executable service instructions. Removing a
document affects subsequent publications; immutable configuration history retains
its historical snapshot and is not presented as a completed erasure request.

Published approved links are rendered exactly for support/resources questions.
Their destinations never enter inference or worker context. Displaying a handoff
link establishes neither a booking nor payment; a protected tenant session link
remains a separate authenticated capability. Publication changes fence old profile
metadata and selections, including a default-to-selected model change while a
request waits.

`assistant.knowledge` is a distinct `knowledge:read` capability. It answers from
the current published public library using the selected knowledge profile and an
additional bounded inference attempt. Current authority, disclosure and unchanged
source checks apply before/after the call and on replay. The tenant broker must
explicitly enable the capability and caller scope; a console toggle does not add
a mandate. File-only identity profiles have no implicit document source.

Knowledge answers use the configured default language when mirroring is disabled
or only one language is supported; multilingual mirroring follows the question.
Citation quotes retain their source language. Similar organization names do not
establish that one tenant's documents answer a question about another.
The internal answer proposal identifies the question's organization separately
from its proposed facts. Named subjects must match the trusted organization and
complete verbatim spans in the original question; missing or unresolved subject
evidence produces abstention. This does not select another tenant or retrieve its
documents. Organization identification remains model behavior covered by evals.
New knowledge results carry a subject-validation revision; earlier cached results
cannot bypass that check. Console transcripts retain knowledge references and
refresh bounded recent results through the authenticated engine on read/replay.

**Uso y l?mites** aggregates content-free inference attempts for thirty days,
separately from console request counters. Capture and knowledge calls are separate
attempts. Missing usage/prices remain unknown, with known subtotals identified.
A completed provider call can belong to a subsequently denied engine request.
Administration preauthorizes a one-use, five-minute accounting receipt before a
call; a restricted finalizer can retain its metadata after membership revocation
without permitting another inference or disclosing the answer. Bounded cleanup
erases expired receipts. Historical billing reconstruction after process loss is
not supplied.

**Calidad** records tenant-scoped manual cases and optional references to retained
conversations. A guidance change does not resolve a case. Resolution requires
explicit passing verification evidence; source access/expiry still apply.
Synthetic regression export requires explicit synthetic marking and does not
export WhatsApp transcripts. `/eval-comparisons` compares submitted property
results with exact dataset/grader/case coverage, explicit synthetic attestation
and per-case forbidden-effect gates; it does not execute tests, establish evidence
provenance or replace independent human acceptance. Automatic failure detection,
model training and autonomous prompt publication are not implemented.

Default JSON requests remain bounded to 64 KiB. Exact authenticated draft and
catalog writes allow 256 KiB and 128 KiB; the authenticated extraction route allows
7 MiB including base64 overhead. Both proxy and API authenticate enlarged writes
before buffering their bodies. Unknown similarly named routes keep the small bound.

`AgentConfiguration` includes public identity, branding, explicit registered tools, environment/model profile, connector/WhatsApp metadata, public guidance and console limits. Empty tools disables all tools. Current publications reach the existing engine through `DatabaseAssistantProfiles`; bank authority still constrains operations.

The dark workspace uses a messaging layout with tenant identity, searchable local
conversation history and a responsive navigation drawer. In **Estudio del agente →
Apariencia**, editors/admins can upload, preview, replace or remove the AI avatar.
The browser accepts still PNG/JPEG/WebP files up to 5 MiB, 16 megapixels and 8192
pixels per side. It preflights actual format, container integrity and all raster
dimensions before decoding, removes PNG ancillary metadata before any decoder,
crops to a square and re-encodes as PNG. `branding.avatar_data_url` defaults to an empty
string for existing configurations. The API accepts only decoded still PNG/JPEG/WebP
images up to 24 KiB and 256×256 pixels, with matching MIME type. Server preflight
checks PNG chunk checksums/endings, JPEG frames/scans and WebP canvas/packed-frame
dimensions before Pillow. PNG ancillary metadata is stripped before decompression;
animation, multiple frame headers, incomplete containers and trailing bytes are
rejected. Decoded pixels are normalized to metadata-free RGBA PNG, reduced only
when necessary to fit 24 KiB. Normalization is idempotent across reloads/restores;
stored encoder bytes can differ from the browser's PNG. EXIF orientation is
applied for JPEG/WebP without reserializing unrelated EXIF tags. PNG metadata,
including EXIF orientation, is discarded before decoding. Embedded color metadata
is not retained. The authenticated draft write uses the 256 KiB bound described above; avatars use the existing revision-checked tenant
draft and immutable publication storage, with no separate public upload service.
Saving does not change the published avatar. Preview uses the draft; published
chat uses the active version. Retained conversations render their own saved
identity/configuration snapshot, even after another version is published. History
rows use neutral icons rather than attributing the current avatar to old replies.
Active mode without a publication shows an unpublished placeholder; draft identity
is shown only in preview. Restoring a version also restores its avatar.
An empty uploaded avatar falls back to the existing HTTPS logo, then the default
bot icon. Uploaded images appear in the sidebar, overview, preview, chat header,
welcome and assistant replies; no image bytes enter the model profile or
configuration-AI context. Avatar images are public assistant branding rather than
customer documents; their retention follows the existing configuration history.
Steady-state engine profile and chat execution reads project out branding before
validation; the engine's database projection also omits it. Display images are
not decoded/recompressed for customer turns. Full validation still applies to
draft input, publication, restoration and configuration proposals.
Existing stored profiles remain readable without backfill. Upgrade all backend
readers (administration APIs and engines using `DatabaseAssistantProfiles`) before
enabling writers/frontend; even ordinary draft writes/creation serialize the new
empty default key. Once profiles contain `avatar_data_url`, rollback
requires a backend that understands this additive field, since old contracts
reject unknown branding keys.

Change impact: elevated (new image validation in the configuration contract).
Relevant existing register entries are LR-01 (images can contain personal data),
LR-05 (input validation) and LR-12 (configuration history), pending the register's
existing human/legal review. Target controls: ISO/IEC 27001 A.5.15/A.8.3, A.8.9,
A.8.26/A.8.28/A.8.32; ISO/IEC 42001 A.6.2.4/A.6.2.8 and A.7.2. The avatar is display
data; the change does not alter inference behavior or add a supplier/data-egress
route. Independent review and production approval remain separate.

Draft writes require their exact revision. Serialized publication adds an immutable version. Restore creates a draft for review and publication. Existing chats reject new turns after their relevant configuration changes. Suspension is also checked by the engine profile source.

Publication reports `active` only after `GET /v2/assistant` acknowledges the matching `X-Assistant-Profile-Revision`. Saved, published, awaiting-runtime and unavailable are distinct. The additive header preserves the customer response schema; profile changes during description return a conflict.

Console limits are 1–10,000 requests per database day, 1–20 concurrent turns per tenant and 1–7 days of transcript retention. PostgreSQL reservations enforce limits across API instances and serialize conversation turns. Configuration proposals consume the daily budget. These supplement engine/authority budgets; production values and customer-channel quotas remain tenant adoption decisions.

## Chat and data

Each tenant has separate app conversation and **WhatsApp** simulation tabs.
`POST /admin/v1/tenants/{tenant}/chats` fixes `channel: app|whatsapp` when the
conversation is created; existing chats migrate to `app`. List requests filter
by channel, and subsequent turns/replay use the stored channel's configured
customer proof and verified `client_id`. The browser cannot override that
binding on a message. Missing channel provisioning fails closed. Operator
permissions, CSRF, current tenant/configuration access and customer authority
remain required independently.

The WhatsApp tab simulates tenant-channel conversations through the engine API;
it does not receive a Meta webhook or send messages. Its tenant API supplies
protected banking links; app/SDK requests retain host-owned protected banking
handoffs. Typed onboarding results direct the customer to tenant-owned setup,
without an engine enrollment form. See [setup](../reference/SOURCE_REFERENCES.md#source-a78cb37430d7)
for the explicitly synthetic two-tenant profile. Chat encryption, retention,
replay authorization and operator access rules apply to both channels.

An additional development-only profile can embed the separately running tenant
simulator in this tab. `GET /admin/v1/tenants/{tenant}/whatsapp-simulator` requires
the current operator session and tenant edit permission. Trusted administration
settings bind an explicitly synthetic tenant to an exact loopback
`/__simulator` URL; organization authentication and arbitrary destinations are
rejected. The response contains presentation metadata only. A sandboxed iframe
opens the tenant application without exchanging customer proofs, PINs or
enrollment data through the engine administration API. Ports isolate script
origins, not browser cookies: this explicit local synthetic profile uses trusted
processes on the same loopback hostname. It is not a deployment isolation model.

In that profile, PayMe owns captured signed webhook processing, OTP, encrypted
Flow screens, the test contract, account creation and the PIN-backed channel
connection. Its verified customer turns then reach the engine. Captured Meta
messages are displayed in the tenant application. This opt-in can create a
bounded number of synthetic accounts in actual Core preproduction; it is
separate from the existing simulator's synthetic banking fixtures. See the
[interactive profile setup](../reference/SOURCE_REFERENCES.md#source-f1cf50872424).

Configuration chat sends public personality fields and the operator request to the configured model. Typed proposals edit public personality/guidance and select connector-supported registered tools. They cannot change trust, destinations, credentials, roles, authority or publication. Applying a proposal saves a draft. `allow_configuration_ai` explicitly controls disclosure.

Real-tenant configuration AI is also default-denied unless the platform has registered
the exact tenant/provider/processing-approval reference. A typed reference or toggle
alone cannot enable it. Synthetic exemptions identify exact tenants in trusted server
settings and require a development synthetic connector. Production prerequisites and
supplier authorization follow [COMPLIANCE.md](../policies/COMPLIANCE.md); no legal
interpretation or certification is approved by a configuration edit.

Tenant conversations use authenticated engine v2 APIs. Trusted server runtime bindings supply customer proof, connector/provider and engine origin. Proof tenant consistency is checked before independent engine credential/authority verification. The browser supplies neither customer proof nor model keys.

The console keeps its workspace/session mounted across client navigation and loads
tenant metadata independently of the shared tenant list/catalog. Mutation refreshes
discard results from an earlier tenant or operator context. Chat remains mounted
when visiting another page in the same workspace; leaving the tenant cancels its
stream. Explicit preview links select the saved draft without changing publication.

Conversation message POSTs accept JSON (the existing terminal payload) or
`Accept: text/event-stream`. SSE emits `accepted`, engine `progress` and verified
public outcome snapshots, then `completed` with the same persisted payload as JSON.
The browser renders its user message immediately and replaces partial assistant
snapshots as results arrive. Raw provider tokens are not conversation results.
Current operator session, membership, chat expiry, tenant state and configuration
revision are checked before disclosure; the engine retains customer/authority
checks. Uncertain transport failures are visibly retryable with the same request
key, including after reloading history. Confirmed failed/interrupted engine tasks
are retained as terminal failures and allow a subsequent message. History returns
the latest 200 turns in chronological order; only the originating operator receives
recovery keys. No successful completion is inferred from a closed connection.
Streams are bounded to 256 KiB and 110 seconds at the engine binding, with bounded
in-process backpressure and explicit cleanup on completion, revocation or disconnect.

The development launcher provides PayMe and Northstar with separate Go authority services and synthetic banks. Draft preview uses a request-local development profile overlay without publication. Remote/real-bank previews require a provisioned preview runtime and otherwise fail visibly.

Credentials and transcripts are tenant-bound encrypted. Titles contain timestamps rather than message text. Super admins and tenant admins inspect retained console conversations with audit evidence; only their originating operator continues them. Customer-channel transcript adoption is separate. Identical request-key replay returns the same result; changed text conflicts. Uncertain calls recover through the same key.

A scheduled bounded lifecycle function erases expired message payloads and conversation snapshots, retaining opaque replay rows. Expired content is not returned. Engine content can expire sooner. Audit, public configuration history and credentials have separate lifecycles under [data ownership](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md).

## Connections and capabilities

The catalog includes synthetic banking, native WhatsBank preproduction balance reads, v1 bank connectors and v2 capability brokers. New API families require reviewed adapters; schemas do not establish ownership, balance meaning, approval, idempotency or settlement.

The UI stores approved HTTPS origins, environments, credential references and qualification references. Credential input is write-only, encrypted and excluded from model input. WhatsBank diagnostics call only preproduction `ping`; the playground password is not a runtime bank credential. Runtime/customer-proof/model/bank-authority provisioning is explicit, and failures never substitute another tenant or fixtures.

WhatsApp settings distinguish tenant-owned channel metadata from engine availability. Under [ADR-011](../decisions/011-tenant-api-and-channel-ownership.md), the tenant API owns signed webhooks, customer linking, Meta delivery and enrollment/Flows. Saving metadata does not activate a channel or install a webhook in this engine. A tenant workspace can simulate WhatsApp separately from its app/SDK conversation using provisioned verified client bindings and synthetic tenant services. Protected consultation/authorization links remain pending bank presentations. The default simulator performs no account creation; the explicit tenant-owned interactive profile above can create synthetic preproduction accounts. Neither sends real Meta messages. Conversation/mode/tenant identity and replay must remain isolated.

Super admins write release drafts and publish separately. Entries identify version, environment, capability IDs, maturity, setup and limitations. Maturity is planned, development, qualified, available or deprecated. Announcements do not enable tools; engine-derived snapshots determine tenant availability.

## Intended customer-service administration

The [UX rules](../product/UX.md#customer-administration-and-personalization) define future customer views, provider activity, real-versus-simulated metrics, consent-gated AI profiles and marketing. These are intended capabilities, not implemented console screens. Apply existing scoped roles, masked identifiers, audited reveal and the data-lifecycle contract; do not introduce global phone-based customer identity or infer consent from task history. Playground simulations remain visibly synthetic and cannot trigger real orders/bookings.

See [setup](../reference/SOURCE_REFERENCES.md#source-b91d46b500d2) and [verification](../reference/development/VERIFICATION.md). Independent review, human Verification and human-controlled production promotion remain required.
