# Tenant session and channel integration

Inspected on 19 November 2026. This candidate uses tenant-owned customer authentication. The newer PayMe sources below establish a concrete cookie-to-engine-token integration that the older imported SDK/PHP observations did not cover. This is source evidence, not a claim of deployed compatibility or production acceptance.

## App and SDK

1. PayMe authenticates the customer and sets `payme_session`. It is an opaque random token, not a JWT with channel claims. The tenant stores its SHA-256 hash and checks active user status, revocation, absolute expiry and idle expiry.
2. The cookie is HttpOnly, SameSite=Lax, Path=/, with no Domain attribute. Secure is enabled when the tenant's public origin is HTTPS. The native banking view and assistant sheet share cookies through the host integration.
3. The web host calls same-origin `POST /api/nico/token` using its cookie. PayMe requires a current session and active bank link. Cookie-authenticated mutations are checked against the configured origin and JSON content type. These protections remain in the tenant backend.
4. PayMe returns `{ token, expiresAt }` with `Cache-Control: no-store`. The host keeps the access token in memory and supplies it to the SDK's `getToken()` callback. The current host explicitly selects bearer mode; the SDK's cookie mode is a separate interface option, not evidence that this engine accepts customer cookies.
5. The SDK sends `Authorization: Bearer <token>` to the engine with browser credentials omitted. A 401 permits one token-refresh attempt with the same idempotency key. Logout/account changes must clear buffered token, conversation and display state.

The older `getsha1` / `LoadSection` / `tokenSAML` flow remains historical integration context. It must not be confused with this cookie-backed host's engine-token exchange. IdeeoOrchestrator does not read the PayMe session database, receive a signing private key, or implement another customer login.

## WhatsApp

The tenant receives Meta webhooks and validates `X-Hub-Signature-256` over the raw request body. A valid webhook identifies the channel event; bank-customer access additionally requires the tenant's current customer/channel binding.

The inspected conversation handler obtains the binding and generation, checks the captured message generation, resolves the membership/grant/agent account, and issues a customer JWT with `client_id: payme-whatsapp`, `channel_binding_id`, `auth_time`, and a tenant bank-realm claim. The tenant backend sends that proof to the engine. A browser cookie is not the credential used for this server-to-server conversation path.

The tenant broker checks current binding generation, revocation, expiry and authentication time on its applicable WhatsApp path. Signature verification in the engine cannot establish those current conditions. Protected actions and saved disclosure must still consult current authority. Persist caller/channel binding with durable work; a rotated channel binding must not inherit old work merely because the customer ID matches.

## Engine token contract

| Field | Observed PayMe contract |
| --- | --- |
| Signature/header | ES256, `typ: at+jwt`, configured `kid`; public keys exposed through `/.well-known/jwks.json` |
| Issuer | Tenant configuration; no token-selected discovery endpoint |
| Audience | `ai-engine` and `payme-broker` |
| Customer | `tenant_id: payme`, `sub` mapped to bank membership |
| Caller | `payme-app` for the current web/native SDK host; `payme-whatsapp` for the tenant WhatsApp backend |
| Delegation | `agent_account_id`, `grant_id`, `kind: customer`, explicit `scope` |
| Time | Integer `iat`, `nbf`, `exp`, `auth_time`; issuer/verifier ceiling 900 seconds |
| Correlation | `jti`; WhatsApp also carries `channel_binding_id` |
| Bank realm | Optional `bank_backend`, interpreted by the tenant broker; never an arbitrary endpoint or credential selector |

The token endpoint documents a maximum of ten minutes, while the issuer implementation permits up to fifteen. Configure the actual TTL explicitly and resolve that discrepancy before consumer qualification. The host's memory cache refreshes sixty seconds before the returned expiry.

These names belong to PayMe's integration. Other tenants have separate trusted issuer/key/client configuration. Channel recognition comes from the validated client mapping, not a body field, query parameter, cookie name, phone number or model instruction. A recognized SDK client receives the host-banking route; WhatsApp receives the tenant protected-link route. Neither route permits balance/history in chat or model context.

## IdeeoOrchestrator implementation

[`server/ideeo/identity.ts`](../../../server/ideeo/identity.ts) supplies `createTenantVerifier`. It accepts configured public PEM keys and registered clients, verifies the bearer proof with the existing pinned `jose` dependency, and returns an immutable principal. WhatsApp requires a signed channel binding. No default banking scopes are added. Unknown issuers, keys, clients, malformed identity, wrong audience, expired proof and token-supplied key URLs are rejected with a generic `invalid_session` error.

The credential is retained only inside an explicit `delegationFor(audience)` closure. It is released only when both trusted configuration and the signed token permit that audience and the token remains unexpired. This allows the tenant broker to receive the original proof, including tenant-specific claims, without copying tokens into enumerable conversation state. Actual forwarding must use trusted endpoints and reject redirects.

The verifier authenticates proof only. The separate [product admission service](ADMISSION.md) now wires it into `GET /v2/session`, checks current status through a tenant connector and formats HTTP errors/challenges. That connector is qualified against two synthetic services only: the required status endpoint is not implemented by the inspected PayMe API. There is no customer-cookie fallback, background revocation subscription, token-renewal service or durable task admission here. Protected action approval and fresh disclosure authorization remain separate checks.

Next tenant integration: implement the bounded status extension for every applicable PayMe backend, qualify its current membership/grant/agent/channel checks, and then configure real issuer keys and client mappings. Actual SDK and tenant-channel consumer acceptance remains pending. The current product startup deliberately accepts synthetic loopback profiles only.

## Verification

Run `pnpm test:ideeo-auth` after installing this repository's locked dependencies. The Node test suite generates disposable P-256 keys, tests overlapping identifiers in two tenant namespaces, malformed/tampered/expired proof, audience restrictions, explicit key rotation and SDK/WhatsApp separation. Its HTTP fixture binds only an ephemeral loopback port and rejects cookie-only/channel-hint requests. It does not contact banks, issuers, models or the user's running application.

Application verification still follows the [isolated fixture guide](../../verification/README.md). No live product integration or independent human acceptance is established by these module checks.

The process-level suite is `pnpm test:ideeo-admission`; see the [isolated product fixture](../../verification/ideeo.md).

## Inspected sources

All paths below are relative to `Desktop/Ideeo-AI`; source repositories were read, not modified. The [source manifest](../SOURCE_MANIFEST.json) records file hashes and repository revisions for this inspection.

- `payme-api/src/core/session.ts` and `src/modules/session/middleware.ts`: opaque cookie and current session checks.
- `payme-api/src/core/csrf.ts`, `src/modules/nico/index.ts`, `src/contracts/nico.ts`: protected cookie exchange and public token contract.
- `payme-api/src/core/nico-jwt.ts`: signing, claims, audiences, registered client names and public key publication.
- `payme-api/src/modules/whatsapp/signature.ts`, `channel.ts`, and `src/modules/broker/index.ts`: authenticated channel ingress, generation-bound proof and broker checks.
- `payme-web/src/features/nico-host/NicoPage.tsx`, `token.ts`, and `src/api/client.ts`: cookie-authenticated exchange and memory-only SDK token provider.
- `nico-sdk/src/transport/client.ts` and `src/contract/host.ts`: bearer/cookie transport modes and retry contract.

This authentication work falls under the existing identity/access, privacy, logging and verification controls in the [compliance policy](../policies/COMPLIANCE.md). It grants no new bank access or model disclosure.
