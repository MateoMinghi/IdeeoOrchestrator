> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Tenant authentication profile: development customer access

This implements the Sprint 1 subset of [ADR-001](../decisions/001-tenant-authentication-and-delegation.md). The bank owns customer authentication and account binding. The engine consumes a credential intended for its API, validates it through configured trust, and checks current authority before protected reads. There is no engine password/PIN store and no phone-only login.

[ADR-011](../decisions/011-tenant-api-and-channel-ownership.md) places applicant/session exchange and enrollment in the tenant backend. The credential below authenticates SDK and tenant-channel API callers; a phone/Meta sender or pre-account applicant is not a substitute for it. Route profiles use the verified `client_id`, not a request channel hint.

## Candidate integration note

The newer [tenant session integration](TENANT_SESSION_INTEGRATION.md) documents PayMe's opaque `payme_session` cookie, its exchange at `/api/nico/token`, and signed `payme-app` / `payme-whatsapp` client identities. The imported development profile below remains source-candidate context. IdeeoOrchestrator now has an [isolated admission service](ADMISSION.md) with a verifier and synthetic current-status checks. The required real tenant status endpoint and consumer qualification remain pending.

## Trust and deployment boundary

The executable service currently supports **development with synthetic identities and records only**. `ENGINE_ENVIRONMENT` accepts `development`; real deployment is deliberately unsupported until its tenant session/assurance contract and separate authority boundary are implemented and verified. The isolated issuer is not a bank authentication service.

Configure `ENGINE_TRUST_FILE` as a local JSON array of profiles. Each profile defines `issuer`, `tenant_id`, `audience`, `keys` (a key-ID to PEM public-key mapping), and `development`. No issuer endpoints or signing keys can come from a user message, request JSON, redirect assertion, or token-supplied URL. An unverified `iss`/`kid` is used only to select among already configured trust; all claims are then cryptographically validated. Keep private signing keys out of the engine verifier and out of app/SDK bundles.

The local key helper writes a development private key and public trust profiles under ignored `.runtime/`. Those files contain no real bank identity and must never be copied into a real environment. The validator refuses development trust when constructed for a non-development environment. The service does not provide an authentication-disabled fallback or a public token-minting HTTP endpoint.

## Credential wire profile

Send a signed compact JWT access credential in `Authorization: Bearer <token>`. The configured algorithm is **ES256**, the protected header type is **`at+jwt`**, and `kid` must select a configured public key. Credential length is bounded at 8,192 characters.

| Claim | Type and requirement |
| --- | --- |
| `iss` | Exact configured issuer |
| `aud` | Includes the configured engine API audience, initially `ai-engine`; an ID token for a different audience is rejected |
| `sub` | Stable membership identifier within the issuer/tenant namespace |
| `tenant_id` | Must equal the tenant bound to that configured issuer |
| `client_id` | Current authenticated calling client, distinct from the customer |
| `agent_account_id` | Assistant agent account bound to this owner and client in current records |
| `grant_id` | Current delegation record bound to the same membership/client/account |
| `kind` | Exactly `customer`; onboarding, service, bank-delegation, and external-agent profiles are not enabled by this slice |
| `scope` | Nonempty string of API scopes. Verification preserves exactly the supplied scopes; it never adds `balance:read`. Each operation separately requires its action scope and current grant permission. |
| `iat`, `nbf`, `exp`, `auth_time` | Required integer UTC epoch seconds; validity and freshness checked, no clock-skew allowance in this development profile |

Identity strings are nonempty, printable Unicode text and at most 100 characters. NUL/control characters and unpaired surrogates are rejected before database access. Reject expired/not-yet-valid credentials, future authentication/issuance timestamps, authentication later than issuance, and token lifetime over 900 seconds. The demo helper uses five-minute credentials. These are explicit development profile limits, not universal bank assurance rules.

Renewal is performed by the trusted issuer after its applicable bank-session verification. The engine does not turn an expired token, typed PIN, SDK app key, installation ID, or matching phone into fresh access. Protected API reads and replays always require a currently valid credential.

## Current authority checks

V2 history can use `history:read` without balance access; other capabilities use their registered action scopes. A valid unknown scope grants no banking capability. A conversation with no effective capabilities receives no account choices and performs no inference or bank read. The existing v1 balance endpoints, balance task replay and balance-account preference routes retain their balance permission checks; preference writes additionally require `preferences:write`.

The synthetic authority reads current scoped records for every authenticated endpoint and rechecks before a bank read. It requires:

- The credential scope and current grant both permit the requested action.
- Tenant/membership match the row-level scoped records.
- Calling client and active agent-account references match the grant.
- Membership and agent account are active; the grant is active and unexpired.
- An account reference belongs to the membership and the grant's permitted resources.

Pause/revoke/expiry during inference must deny the subsequent bank read. Task lookup, event replay, and idempotent response reuse also require current authority. A user preference only selects among permitted resources.

Current authority covers disclosure as well as dispatch. Before publishing a fresh result, the engine rechecks the grant and every account in a balance or clarification result. Before returning stored task/event or JSON/SSE submission replays, it checks those accounts against current grant resources and membership ownership. Narrowing an active grant or removing ownership can therefore make an earlier result inaccessible. Such a saved response returns 403 without re-running inference/banking or filtering/reinterpreting its historical payload; SSE replay denial occurs before stream headers. If authority changes during fresh processing, the task fails with no protected result or choices.

An external agent's future profile needs registered-client proof, user-approved grant, sender binding where required, and the distinct allowance disclosure contract. Supplying `kind: customer` without a valid configured signature and the matching records cannot enable it. This implementation does not implement external-agent OAuth, DPoP/mTLS, CIBA, account linking/recovery, or long-running renewal; no downgrade substitutes for those missing profiles.

## Secrets and error handling

Bank login/PIN enrollment/challenges belong in protected tenant flows outside ordinary chat. Never put a PIN, bank/session credential, signing key, or provider key in input text, query strings, public events, traces, or documentation. Common explicit credential patterns are rejected at input, but this heuristic is not complete DLP protection.

The LLM receives only the bounded message, authorized account display references, and a clarification flag. It receives no bearer token, full principal, signing material, or grant-management capability. Provider adapters cannot authorize or execute bank operations.

Invalid proof returns generic 401 `invalid_session`, with a Bearer challenge. Valid proof with insufficient current authority returns 403 `access_denied`. These responses do not echo tokens, claims, key values, SDK errors, or database exception text. Unknown/inaccessible task and conversation references return 404 after authentication.

## Tenant integration requirements before real access

Specify the real bank session validation/exchange service, stable membership mapping, issuer ownership/key rotation, assurance requirements, session freshness/renewal/revocation, grant and agent-account lifecycle, current status source, service-to-authority integrity, and protected operation approval. Validate these contracts with the tenant and actual adapter rather than treating an existing field named `tokenSAML` as evidence of a protocol.

Use separate profiles for customer channels, bank-assistant delegation, external agents, and workloads. None receives arbitrary impersonation rights. Acceptance and security evidence for a real profile remain separate from the development token helper and local test results.
