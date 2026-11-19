> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Adjacent repositories and authentication context

Source-inspection snapshot: 19 October 2026. This document supports [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md); it does not establish an authentication protocol or approve copying legacy behavior. No application, endpoint, or test/eval was executed for this inspection.

## Concierge provider integration direction

The [service integration contract](../contracts/SERVICE_INTEGRATIONS.md) owns provider rules for Uber, Uber Eats, Rappi, OpenTable, Doctoralia, Google Maps/businesses and candidate DiDi rides/food routes. The separate [UX rules](UX.md) own common customer interaction. This coverage is separate from implemented bank adapters and public-document research. Each route needs its own trusted tenant configuration, protected account connection, authority, idempotency/reconciliation, event delivery and qualification evidence before enablement. An external task executor is a possible adapter, not a selected platform dependency. A delegated task agent is not automatically a tenant or an external banking agent with a mandate.

Portable instruction skills can guide use of approved browser/API tools and recovery from live page observations. [ADR-007](../decisions/007-inference-reuse-and-cache-boundaries.md) defers bundled executable scripts and interpreter loading. Customer/channel integrations render the concierge's approved text and task controls; bank screens, tenant ingress and credentials retain their existing ownership. The integration contract defines provider-specific requirements; UX defines customer-personalization and consent behavior.

## Current tenant-service boundary, 2 November 2026

The newer [team meeting](https://fathom.video/share/Sy1oXDnenWLxG_ZF3Eyd7otxv7CMYx7N), Mateo's subsequent confirmation and supplied diagram establish [ADR-011](../decisions/011-tenant-api-and-channel-ownership.md). Accounts belong to the tenant/backend/core (10:20–11:40); WhatsApp enters the tenant API, which routes AI requests to this engine (15:36); PayMe API encapsulates Armony (29:12–30:02). App/SDK AI calls may reach the engine directly. This supplements the earlier Check Up meeting and supersedes the engine-owned enrollment execution increment.

For PayMe, the diagram is `app/AI SDK → engine API → PayMe API → Armony`, with the app also using PayMe API. It is an example tenant, not a universal API/core/UI schema. Other tenants supply their own APIs, identity, credentials and supported capabilities. Tenant-owned channel backends forward authenticated turns and deliver results; accountless applicants use the tenant's enrollment flow. Engine APIs, typed handoffs, reasoning, authority and agent-account interfaces remain here. [Onboarding](../contracts/ONBOARDING.md), [tenant backends](../contracts/TENANT_BACKENDS.md) and the [integration guide](../reference/development/INTEGRATION_GUIDE.html) define the current boundaries. The source observations below retain their historical scope and do not authorize restoring retired engine enrollment/webhook endpoints.

## Where the related code was found

Mateo authorized inspecting the separate repositories listed below. Source paths start at each named repository's root; their checkout locations are not dependencies of the new engine.

| Repository | Role | Relevant source paths from that repository's root |
| --- | --- | --- |
| `wbsdk-ios` | Embedded chat/session and host bridge for iOS | `README.md`, `Sources/WbSDK/Auth/AuthService.swift`, `Sources/WbSDK/Auth/AuthModels.swift` |
| `wbsdk-android` | Equivalent Android SDK | `README.md`, `wbSDK/src/main/java/com/convergence/wbsdk/WbSDK.kt`, `wbSDK/src/main/java/com/convergence/wbsdk/utils/NetworkHelper.kt` |
| `wl-ios` | PayMe iOS app shell and web/native bridge | `README.md`, `Payme/Services/Network/APIService.swift`, `Payme/Managers/BiometricAuthManager.swift` |
| `wl-android` | PayMe Android app shell and web/native bridge | `README.md`, `app/src/main/java/com/ideeolabs/payme/data/api/ApiService.kt`, `app/src/main/java/com/ideeolabs/payme/ui/main/MainViewModel.kt` |
| `legacy-ideeo-IA` | Existing TypeScript shared HTTP/WhatsApp banking orchestrator | `whatsbank/whatsbank/AGENTS.md`, `whatsbank/whatsbank/README.md`, `whatsbank/whatsbank/apps/orchestrator/README.md`, `whatsbank/whatsbank/apps/orchestrator/src/channels/httpAuth.ts`, `whatsbank/whatsbank/apps/orchestrator/src/channels/http.ts`, `whatsbank/whatsbank/docs/reference/adapter-contract.md` |

Before further inspection or changes in an adjacent repository, read its own instructions. Their implementations, operating profiles, resource claims, secrets, and review obligations are not inherited by this new engine. The legacy repository is useful integration/reference material and can serve the separate timeline fallback; it does not replace this repository's full-engine target.

## What the native apps and SDKs currently do

The 2 November [ADR-010](../decisions/010-app-host-banking-and-model-context.md) defines the target beyond this historical source snapshot: chat infers a core-banking intent, the SDK delivers it to the host, and the host opens its own protected balance/history/transfer flow and bank integration. Balance/history are displayed once outside chat/model context. Original customer messages may remain visible while later model inputs use sanitized references; contacts resolve outside inference. This does not establish adoption in the inspected SDK/app binaries. The generic engine `host_intent` approval payload is opaque; the [engine-side host contract](../contracts/HOST_BANKING.md) now defines intent IDs, session binding, one-time consume and required view invalidation, with no financial completion callback. Actual native integration and device acceptance remain pending. Direct engine reads and Core link preparations are different development paths, not evidence that the native flow works.

The inspected source implements this session bootstrap:

1. Send an app key, installation/device identifier, SDK version, and derived value to a PHP endpoint with `Services=getsha1`.
2. Receive `tokenSessionSDK` after the endpoint reports success.
3. Send that SDK-session token and a host-supplied `tokenSAML` with `Services=LoadSection`; optional `json_data` accompanies it.
4. Receive a web session URL (`URLEmbed`) and `tokenSession`, then open the embedded web experience.

The iOS implementation is in `AuthService.validate` / `validateSession`; Android equivalents are `NetworkHelper.validateAppKey` / `validateSession`. The source's device-derived value is MD5 of device identifier plus app key. This observation documents the existing bootstrap, not a recommended identity mechanism for the new engine.

The READMEs state that the real procedure for obtaining and renewing `tokenSAML` will be supplied later and that a placeholder value can be used for development. A field named `tokenSAML` is not evidence of a verified SAML assertion, OAuth access token, or user-to-bank binding. Native biometric callbacks exist, but their existence alone does not establish the bank-side authorization contract.

The PHP server implementation behind these endpoints was not present in the inspected local repositories. Its validation rules, identity guarantees, expiry/revocation semantics, issuer configuration, and production behavior were not established by this review. Do not infer that they are absent on the server or that development placeholder behavior describes production.

## Existing legacy engine HTTP identity contract

In the `legacy-ideeo-IA` repository, `whatsbank/whatsbank/apps/orchestrator/src/channels/httpAuth.ts` contains an existing, versioned custom token implementation:

- `issueChatToken` is documented for a trusted backend to call after authenticating the account holder.
- Identity fields are `tenantId` and `idUser`.
- Chat claims contain version `1`, audience `whatsbank-chat`, `issuedAt`, and `expiresAt`.
- The payload is base64url-encoded JSON signed with HMAC-SHA256. This is not a JWT or a complete OAuth/OIDC service.
- The default chat lifetime is 300 seconds; the code bounds accepted lifetime to at most 3,600 seconds.
- `verifyChatToken` verifies the signature and checks claim types, audience/version, and time validity. HTTP routes consume it from a Bearer authorization header.
- Separate onboarding-token functions represent a verified phone and onboarding attempt, with a different audience. Onboarding and authenticated account access are separate states.

This gives us an existing server-side principal pattern and potential compatibility reference. It does not establish the new engine's issuer trust model, caller/delegation identity, membership/agent-account claims, grant lifecycle, or all required authorization controls. A source inspection is not evidence that the code is deployed, integrated with the SDK's PHP session, or sufficient for the new product.

The legacy repo also contains a bank-agnostic `BankAdapter` contract and bank-specific adapters. Inspect those before designing a conflicting balance/bank interface; treat their current behavior as evidence to compare against approved requirements.

## Authentication design still to settle

### Later tenant-backend implementation

On 21 October Mateo explicitly requested multi-tenant backend connections and clarified that each bank's API can differ. [The engine minimum contract](../contracts/TENANT_BACKENDS.md) now separates shared authority/account/balance semantics from optional connector wire format and native bank adapters. The tenant registry resolves verified tenant IDs to configured integrations; PostgreSQL fixtures are one explicit development adapter, not a universal bank connection.

Mateo authorized inspecting the WhatsBank playground and using only preproduction. A login plus preproduction v2 `ping` and `Balance` reads succeeded; no production/effect-producing methods were invoked. The example result uses `Balance`, `BalanceCents`, `Currency` and bank `idUser`. This does not establish the new engine's membership/account/grant mapping or available-to-spend field meaning. Do not copy the example API, credentials or bank-user semantics into every tenant's contract. Adapt each backend behind the minimum engine ports and verify it independently.

The proposed architecture is now captured in [ADR-001](../decisions/001-tenant-authentication-and-delegation.md). Its status is Proposed; the details below remain evidence and integration requirements rather than an accepted wire contract.

The engine needs a trusted bridge from the bank's verified user/session to an engine-scoped principal. Mateo confirmed that customer authentication/authorization belongs to the tenant and that the engine routes authentication there. The common principal and separate client entry flows were accepted in principle, with explicit distinctions among owner, calling client/actor, and delegated rights. The credential issuer/exchange arrangement and wire protocol are not accepted designs yet.

Before implementing the real integration, establish:

- Who validates the bank session and who issues or exchanges the credential intended for this engine.
- How trusted issuer/key configuration is bound to a tenant and how signature, audience, expiry, renewal, revocation, and replay protections work.
- Which verified fields identify the tenant, user/membership, caller, active agent account, grant, and permitted actions/resources.
- How bank-assistant delegation differs from external-agent banking access and how each client proves its identity.
- How a grant/mandate is checked against current authority/core records, including pause, revocation, and protected approvals.
- How local controlled test principals are isolated from real bank identities and how unavailable real integration is represented honestly.

App keys, install identifiers, phone text, SDK metadata, model claims, and arbitrary account references do not by themselves establish bank membership or delegated permission. Credential values belong in approved environment/secret configuration, never in this document, a prompt, or publication mappings.

## WhatsApp onboarding and returning senders

A further source inspection during the 19 October auth discussion found:

- `whatsbank/whatsbank/apps/orchestrator/src/flows/types.ts` defines `OnboardingInput`: invite code, phone, optional business-scoped sender ID, name, RFC, birth date, gender, city/state, setup PIN/confirmation, consent, and preferences. These are legacy PayMe-related fields, not a universal requirement for every bank.
- `whatsbank/whatsbank/apps/orchestrator/src/flows/validation.ts` validates the setup PIN and confirmation as matching four-digit strings. This validates the format of a newly chosen PIN; it is not verification against an existing bank credential.
- `whatsbank/whatsbank/apps/orchestrator/src/onboarding/workflow.ts` passes the account-creation fields, including the setup PIN, to `config.bank.createAccount`, records the bank-returned user ID, and associates the channel identity with that user. PIN enrollment is separate from returning-user authentication.
- `whatsbank/whatsbank/apps/orchestrator/src/channels/httpOnboarding.ts` uses that same shared workflow and field mapping for HTTP onboarding. It requires a signed onboarding identity and supplies its phone to the workflow. Its handler removes setup PIN fields from the response and documents that they must not enter model context or persisted API events.
- `whatsbank/whatsbank/apps/orchestrator/src/channels/whatsapp.ts` resolves returning senders through the user map using a phone, falling back to a business-scoped sender ID. It then supplies a server-side principal to the engine. The inspected channel function does not perform a bank-PIN challenge on every turn.
- `whatsbank/whatsbank/apps/orchestrator/src/identity/sender.ts` distinguishes phone, business-scoped ID, and reply handle. A channel handle is not the immutable bank customer ID.

These observations describe source behavior, not a security certification or proof of deployed end-to-end identity binding. In particular, the account-creation flow does not settle account linking on a new channel/device, phone changes, account recovery, session assurance/expiry, or which bank operations require a fresh challenge.

Mateo confirmed that the new engine should use the same underlying account-creation information across channels. Preserve a tenant-level onboarding contract with separate channel rendering; adapt channel-only consent where appropriate. The suggestion of phone-only access remains open. PIN setup, returning-user authentication, linking a channel, and authorizing an operation must be specified as separate stages of the tenant's policy. A bank PIN, if used, must be verified through an approved protected flow outside the model and ordinary conversation.

## LLM-provider discussion to carry forward

The proposed design is now captured in [ADR-002](../decisions/002-ai-provider-adapters-and-routing.md), including alternatives, capability profiles, prompt/native-state handling, authority boundaries, and verification obligations. Its status is Proposed.

The requested goal is flexibility across providers and model classes. A candidate design discussed in the session is a task-facing internal contract with provider adapters, explicit model capabilities, and policy-based routing. Provider-specific prompt rendering and opaque continuation data may remain behind the adapter; banking permissions and execution remain with the authority.

Separate contracts may serve classification, generation/tool use, and embeddings. Provider interchangeability does not imply identical behavior, support for all features, or permission to send tenant data to any provider. Each selected model/prompt/tool profile needs the applicable eval evidence. Libraries, exact schemas, capability requirements, provider/model choices, retry/fallback semantics, and data-egress policies are not approved here.

Implementation setup was explicitly deferred during the discussion. This record does not choose commands, CI, deployment services, branch mapping, environment resources, or model credentials.

## Voice channel integration questions

[ADR-004](../decisions/004-voice-channel-and-speech-providers.md) records the streaming STT → existing concierge → streaming TTS direction confirmed on 15 November 2026. The integration questions originated on 20 October; adjacent repositories have not been qualified for live voice, and no end-to-end engine/app voice flow is established here. Speech Engine and an engine-operated runtime remain candidates. These are questions to settle with the app, SDK and legacy integrators:

- **Client path.** The inspected SDKs bootstrap a session and then open an embedded web experience (`URLEmbed`). Voice could run through a JavaScript speech client inside that web view, or through a native client in `wbsdk-ios`, `wbsdk-android`, `wl-ios` and `wl-android`. Microphone permission, WebRTC support, echo cancellation and audio routing inside the web view have not been established. ElevenLabs documents a JavaScript client for Speech Engine. Its support for native or web-view clients is a vendor question.
- **Session proof.** A voice session must start from the same verified engine principal as text turns. The engine mints the provider token server-side. The legacy `tokenSessionSDK`, app keys and device identifiers do not establish voice-session identity, as with text.
- **Screen events during voice.** Approval cards, host events and the on-screen transcript must keep working while the user speaks, so the host must receive and show them during a voice session.
- **Streaming and lifecycle.** Qualify microphone-to-transcript and concierge-to-playback streaming, interruption, reconnect and late task-result delivery while the user is silent. Speech Engine's response methods are scoped to a transcript handler; a transport bridge alone does not establish background speech support. Measure first useful audible response separately from acknowledgments and final task results.
- **Protected banking.** App/SDK balance and history results remain in the host screen under ADR-010, outside assistant speech and model/speech-provider context. Host accessibility belongs to the tenant.
- **WhatsApp.** The legacy orchestrator already serves the WhatsApp number through the Cloud API. ElevenLabs' WhatsApp documentation says the number cannot already be registered with another provider. ElevenLabs' WhatsApp channel is therefore not assumed compatible; voice notes stay on the existing adapter.


## Data ownership review, 21 October 2026

The [Hugo/Mateo call](https://fathom.video/share/yBWYKkabEYf9ecg9VmgMyiuZDG8XtZAU) was read alongside the separate `whatsbank` repository's current working tree and this engine's latest `dev`. Around 02:00 Hugo describes keeping the bank user reference in the bot and resolving other facts from the core. Around 03:38–05:09 agent-account/subledger discussion leaves financial ownership and reserved-funds semantics unresolved. These observations support minimization and external financial ownership, rather than a requirement that the entire engine database contain only one identity mapping.

The legacy working tree contained substantial uncommitted changes. These are source observations, not execution, migration, deployment or security-certification evidence. Paths below are relative to the separate `whatsbank` repository root.

| Data/behavior | Legacy storage versus authoritative fetch | Source |
| --- | --- | --- |
| Identity/KYC | Persisted bank user reference, encrypted phone and channel identifiers; minimized identity columns. Onboarding forwards bank-required fields and setup PIN through the protected flow rather than retaining a KYC archive. | `docs/decisions/005-data-minimization.md`, `apps/orchestrator/src/db/prismaStore.ts`, shared onboarding and channel adapters |
| Accounts/balances | Local account coordinates, currency and cached balance existed, with one account per membership. The conversational balance path requests a secure bank consultation URL; local account information is not a generic bank profile read. Direct core balance diagnostics are a separate path. | Legacy account schema, `get_balance`/`getAccountInfo` tools and core client |
| Transfers/purchases | Operation records retained parameters/results, including destination CLABEs and signature/delivery URLs. Settlement callbacks updated local operation state. Local history is engine activity, not the bank's statement/ledger. | `apps/orchestrator/src/orchestrator/tools/transfers/transferToClabe.tool.ts`, operation and settlement handlers |
| Service information | Service catalogs and operation outcomes came through tenant core methods. No general arbitrary customer-profile getter was found in the inspected core client. | Legacy core client and service tools |
| Conversation/memory | Encrypted bounded conversation buffers had a default 24-hour expiry; structured recurring-service/destination memory folded operational records, including pending and successful rows. Pending evidence must not become a completed-purchase habit. | `packages/data/src/conversations.ts`, `packages/data/src/memory.ts` |
| Isolation/crypto | Transaction-local tenant context, RLS read/write policies and authenticated encryption/blind lookup indexes were useful foundations. User-field binding lacked a unique user resource in its AAD; conversation binding was stronger. | `packages/data/src/client.ts`, `packages/data/src/crypto.ts`, migrations/isolation tests |

The review also found source patterns to avoid: a broad owner/BYPASSRLS scheduler; a potential conversation ACL conflict through earlier default grants (effective ACL verification is necessary); arbitrary metadata shapes despite no-content policy; best-effort trace writes; dedup claims committed before webhook work; opportunistic expiry cleanup; and local financial mirrors. None is copied as the new engine's authorization or financial contract.

The [WhatsBank playground](https://whatsbank.com/playground) describes one tenant core, not a platform-wide bank API. The separately recorded preproduction reads below establish only that adapter candidate's reachability/shape. Other tenants may expose different capabilities and fields. [Data ownership and lifecycle](DATA_OWNERSHIP_AND_LIFECYCLE.md) and [optional protected-data access](../contracts/TENANT_DATA_ACCESS.md) define what carries forward, what changes and which capabilities remain unqualified. Credentials and raw customer data are omitted.

## Consumer compatibility evidence

The 21 October source inspection covered `legacy-ideeo-IA` at `f4c4f5c`, `wl-android` at `cb499df`, `wl-ios` at `962c773`, `wbsdk-android` at `7e8f644`, `wbsdk-ios` at `61a27e2` and `wbsdk-ios-test` at `6677fa6`. These are historical inspected revisions, not current delivery status.

The legacy HTTP surface was `/api/chat`, with `requestId`/`message` input, `requestId`/`messages`/`status` output and the custom HMAC credential described above. A conforming bridge to the engine's v1 wire/token contract was not found in that snapshot. The native SDK/app sources bootstrap PHP `getsha1`/`LoadSection` web sessions; the hosted chat/PHP implementation was absent from those repositories, so those sources did not establish direct v1 consumption. An integration may exist elsewhere; the inspection did not prove its absence on a server.

Actual app builds, shared-contract adoption and correlated bank-source/UI behavior remain unverified by that inspection. Use the existing IDE-168/169 verification work and [consumer conformance checks](../development/CONFORMANCE.md), with independent fixture expectations and real build/revision identification.
