# Candidate implementation status

The documentation import on 18 November 2026 used OpenMaus `c444029f3dc97a65caab20b4c9a9f398f435c2f2` (package `0.1.170`). Git history was subsequently initialized with local baseline `b0a3906`. The 19 November implementation adds product admission, actual PayMe API integration with synthetic resources, encrypted conversation storage on disposable real PostgreSQL, and a controlled shared OpenMaus loop with a scripted local model. This establishes synthetic integration; open-ended model semantics, consumer UI and real bank integration remain unqualified; the explicit Luna evaluation below establishes only its constrained live scope.

## Implemented milestone

Commit `27865fcabadf5e5518263463d40d48c508f5d4fc` on `dev` contains the authentication/admission implementation and was pushed to `origin/dev`. The remote commit was verified at publication; later sessions must recheck branch state rather than assume this is still the tip.

- Product-only startup: `server/ideeo-main.ts`, `server/host/ideeo.ts`, and `server/ideeo/config.ts`.
- Token and current-status boundary: `server/ideeo/identity.ts`, `admission.ts`, and `authority-client.ts`.
- Closed public routes and wire types: `server/routes/ideeo-session.ts`, `shared/ideeo/admission.ts`.
- Disposable two-tenant/process fixture: `scripts/testing/ideeo-fixture.ts`; verifier and admission Node suites under `server/ideeo/`.
- Evidence: 53 passing Node test results, focused strict typecheck and targeted lint; deliberate revocation/context-binding mutations were detected. See [verification](development/VERIFICATION.md) for scope and dependency limitations.

This published commit completes the original synthetic admission milestone only. The subsequent tenant/storage integration below is committed and pushed to `dev`. The first full customer-to-conversation-to-storage-to-UI journey remains incomplete.

## Tenant API admission: local integration implemented

The API repository is `C:\Users\mateo\Desktop\Ideeo-AI\payme-api`; `Ideeo-AI` is a collection of independent repositories. Its local `dev` and registered worktree `.worktrees/payme-api-admission` are at `e55abc73e672ae7af44ce9f8e36e93e33a66eb0d`, fast-forwarded from previously pushed `f00f482`. The new commit coordinates loop/evaluation documentation and has not been pushed. API application source is the admission implementation in `4efeaf56d3e7f47248d76938f979b0d5a7d7b6cf`; the later commit coordinates storage documentation. The original documentation refresh was preserved. Loop coordination is included in that local commit; no deployment was performed.

1. The actual API exposes strict, bounded `POST /v2/engine/admission`, preserving `ideeo-admission-1`, workload Bearer plus customer delegation, full caller binding and safe errors. OpenAPI is regenerated.
2. Sandbox SDK/WhatsApp require current local user/link and session/channel records plus the new status-only source contract `ideeo-bank-admission-1`. That source extension is implemented by the disposable source fixture only; unextended backends return unavailable. Generic context success is insufficient.
3. Native WhatsApp projects current tenant-owned A0 identity/assistant, exact owner grant/account/capabilities and channel binding without decrypting bank identity or calling the provider. These are local authority facts, not bank-issued mandates or bank-account status. Native SDK and hosted Armoni are unavailable because their current interfaces do not supply the required evidence without unqualified assumptions or protected banking reads.
4. `scripts/testing/payme-admission.ts` runs the actual API implementation with PGlite/migrations and a synthetic status source, then launches the actual product entry in a separate isolated process. It covers SDK cookie exchange, both channels, current revocation/rebinding, cross-caller/tenant denial, expiry, workload proof, outages, bounded calls, strict replies and privacy. The independent two-tenant regression fixture is retained.
5. See [verification evidence](development/VERIFICATION.md#actual-payme-api-synthetic-integration--19-november-2026) and [the coordinated contract](contracts/ADMISSION.md). Real destinations remain disabled. Source/backend qualification, independent review, intended-consumer/device acceptance and production approval remain outstanding.

Relevant API seams are `src/modules/broker/index.ts`, `src/core/nico-jwt.ts`, `src/core/session.ts`, `src/modules/whatsapp/channel.ts`, `src/modules/whatsapp/tenant-services.ts`, `src/modules/native-bank/authority.ts`, and `src/modules/broker/armoni.ts`. Read applicable repository instructions before editing them.

## Conversation storage: implemented with synthetic integration

The storage increment builds on product local `dev` commit `a0d3273dc60c31e83db4af9417824de8de7357b2` and is delivered by the commit containing this record. The user subsequently requested commit and push to `dev`. API application source is unchanged from `4efeaf56d3e7f47248d76938f979b0d5a7d7b6cf`; its coordinated documentation is committed and pushed on API `dev` at `f00f4823c6f642d5edd542995c6520c3a5eb0521`. No deployment or model call was made.

- The delivered storage milestone used `ideeo-conversation-storage-1` routes create conversations, append fixed synthetic turns/answers, and read ordered paginated history. Arbitrary user content and full `/v2/turns` inference remain closed.
- PostgreSQL schema/migration with complete caller scope, restricted runtime/maintenance roles, forced RLS, AES-256-GCM field encryption, explicit key rotation, bounded retention and cleanup.
- Caller-scoped idempotency and concurrency locks; turn, answer, sequence and content-free outbox commit atomically before HTTP publication. Current permission is checked at admission, before commit and before disclosure, including replay and reads.
- The actual product process passed 23 Node results with real disposable PostgreSQL, including commit failure, crash/restart, database outage, revocation/rebinding, retention and role/ciphertext isolation. Two deliberately weakened controls were detected. Actual PayMe API plus product storage passed 27 checks using synthetic identities and source evidence. The existing 53-result two-tenant suite and 30-check API admission integration remain passing regressions.
- [Storage contract](contracts/CONVERSATION_STORAGE.md), [fixture recipe](../verification/ideeo.md#encrypted-conversation-storage) and [exact evidence](development/VERIFICATION.md#encrypted-conversation-storage--19-november-2026). Explicit conversation permissions use the API's existing scope intersection; financial scopes do not grant transcript access.

This is implementation and synthetic developer integration. Independent review, different-human acceptance, SDK/device/Meta adoption, production key/retention/backup operations and real backend qualification remain pending. Real destinations remain disabled.

## Controlled loop: implemented with synthetic integration

Developed from product `dev` at `4bc30d64a99716dc251183b4a5328b7bfcf97d48`; delivered to local `dev` by the commit containing this update, at the user’s request. That storage commit and API `f00f4823c6f642d5edd542995c6520c3a5eb0521` were pushed and their remote heads verified. The loop changes are included in this local commit and have not been pushed. The initial scripted increment made no OpenAI call; the later user-authorized Luna evaluation below did. No deployment was made.

- The existing OpenMaus Chat Completions implementation is shared between its upstream wrapper and an explicit product adapter. Host configuration, native logging, MCP discovery and alternate model/helper routes are excluded from this product profile.
- Protocol `ideeo-conversation-storage-2` adds optional fixture inference and greeting/draft/revise/recall continuity. Context comes from at most 20 approved committed turn pairs. A single harmless typed color tool has separate current permission; neither financial nor conversation scopes imply model/tool authority.
- Schema 2 adds separately committed attempts, fixed per-operation deadlines, retained model/tool ceilings and tenant/day quotas. Crash, retry and failed answer commit cannot refund consumed work; unknown token usage and all costs remain unknown.
- The [loop contract](contracts/CONVERSATION_LOOP.md), [fixture recipe](../verification/ideeo.md#controlled-conversation-loop) and [exact evidence](development/VERIFICATION.md#controlled-openmaus-loop--19-november-2026) distinguish scripted-model integration from semantic or production acceptance. Real tenant/bank destinations, arbitrary customer text and client streaming remain disabled; the explicit OpenAI evaluation exception is recorded below.

This completes a controlled synchronous development increment, not the full product conversation journey. Real-model/disclosure qualification, asynchronous leases/recovery, UI consumers, independent review and different-human acceptance remain pending.

## Authorized Luna evaluation: constrained live integration

The user authorized the sibling `.env` OpenAI key for inexpensive testing. An explicit `openai-evaluation` profile now admits only `https://api.openai.com/v1`, model `gpt-6-luna`, an additional activation flag and the existing synthetic prompt/answer vocabulary. Live answers have their own kind; the endpoint is never relabelled synthetic. The actual API/product/disposable-PostgreSQL run passed **32 checks**, including SDK/WhatsApp, typed tool calling, draft/revise/recall, reload/replay, revocation and denial. Nine model calls used 3,158 input and 106 output tokens, approximately **$0.0003688** at standard rates (estimate, not invoice). The separate scripted-loop suite now passes 29 Node results.

The key was not printed, persisted in product records or sent as model context. No real bank/customer application was used. [Exact evidence](development/VERIFICATION.md#authorized-openai-luna-evaluation--19-november-2026) records the narrow scope: this is a closed-vocabulary live integration, not general conversational semantics, production readiness or independent acceptance. Arbitrary-content policy and actual consumer/UI work remain next gates.

## Following milestones

| Order | Work | Exit evidence |
| --- | --- | --- |
| Completed development increment | Encrypted conversation/turn/answer records with complete caller scope, idempotency and committed publication | Synthetic process/PostgreSQL and actual API evidence above; independent and production acceptance pending |
| Completed development increment | Shared OpenMaus loop with controlled fixture transport, explicit tool permission and durable attempt accounting | Synthetic continuity, crash/retry, current authority and upstream regression evidence; real-model acceptance pending |
| Next | Expand from constrained live evaluation to qualified text/disclosure and budget behavior in isolated resources | Open-ended semantic and privacy evidence before broader inputs or destinations are enabled |
| Then | Wire the existing React chat to the product API | Authenticated conversation → authorized tool → committed answer → UI → reload, with another tenant denied |
| Later, by dependency | Protected banking handoffs/agent controls, durable tasks, browser evidence, administration and release qualification | The complete journeys in the [adaptation plan](../../output/ideeo-openmaus-product-adaptation-plan-2026-11-18.md) |

## Component status

| Area | Existing foundation | Ideeo adaptation / acceptance still required |
| --- | --- | --- |
| Conversation | OpenMaus model/tool iteration, streaming, retries and interruption | Controlled synthetic inference, closed tool and committed publication implemented; live semantics, real input and consumer qualification pending |
| UI | React conversation and task interaction components | Product API, tenant identity, protected handoffs and durable recovery views |
| Browser | Default agent-browser integration, observations, takeover and process management | Caller/task/generation fencing, qualified isolation and egress, encrypted evidence and disposal qualification |
| Identity | Isolated `/v2/session`; ES256 verifier; SDK/WhatsApp mapping; actual PayMe status endpoint verified with disposable SQL and synthetic source; independent two-tenant fixture | Real source/status and issuer qualification, bank-delegation/external-agent profiles; intended-consumer adoption |
| Records | Encrypted product PostgreSQL conversations/turns/answers, complete caller binding, forced RLS, bounded idempotency/retention and atomic outbox; synthetic process verification | Asynchronous inference/lease lifecycle, authorized outbox dispatch, production key custody, cleanup scheduling, backup recovery and independent acceptance |
| Authority | Bounded current-admission connector and PayMe projection; backend-specific status or explicit unavailability; fresh revocation/channel checks; no imported Go service | Source support/qualification, cohesive Go financial authority adoption, role separation, bank mapping and protected approvals |
| Durable work | Upstream coordination and local task concepts | Product lifecycle, Temporal worker, correction/cancellation fences, retained budgets and replay |
| Banking and agent accounts | No qualified Ideeo integration here | Host/link handoffs, mandates, allowance, owner controls and uncertainty reconciliation |
| Administration | Upstream application settings | Adapted tenant console/backend, operator controls, versioned publication and isolated previews |
| Providers / native SDKs | Source documents and compatibility examples | Actual tenant/provider access, SDK/device journeys and independent acceptance |
| Distribution | Separate product entry starts without upstream/enterprise imports or user state in its fixture; upstream build machinery retained | Complete release-artifact enterprise exclusion, Ideeo branding, pinned artifacts, recovery and release qualification |

The source candidate's tests, source reviews, live model calls and synthetic integration results retain their original scope. They do not establish any row's completed adaptation here. See [architecture](product/architecture/arquitectura-motor-agentes-rev4.html), [adaptation plan](../../output/ideeo-openmaus-product-adaptation-plan-2026-11-18.md) and [verification](development/VERIFICATION.md).
