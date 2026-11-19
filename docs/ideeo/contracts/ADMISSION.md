# Product admission boundary

The isolated development entry point authenticates a tenant-issued customer token and asks a separately authenticated tenant service for current status. Admission is checked on every request. It is not permission to run a model, disclose stored history, use a tool or execute a financial operation; those actions still require their own current authorization.

## Customer surface

`GET /health/live` reports only that the process is serving requests. It does not certify authority availability or product readiness.

`GET /v2/session` requires a single `Authorization: Bearer` header. Cookies, identity headers, caller-selected tenant IDs and channel hints do not authenticate or route the request. Query variants and all other paths return 404; methods other than GET on the session path return 405. This is an additive candidate endpoint, not an implementation of the imported assistant, turn or history APIs.

Successful response:

```json
{
  "api_version": "2",
  "request_id": "server-generated-request-id",
  "status": "admitted",
  "tenant_id": "alpha",
  "client_id": "app",
  "channel": "sdk",
  "banking_presentation": "host"
}
```

WhatsApp maps to `channel: whatsapp` and `banking_presentation: protected_link`. Neither value establishes that the banking integration is implemented. Responses contain no account list, bank data, grant document, token or service credential. Every JSON reply has `Cache-Control: no-store`, a server-generated request ID and `X-Content-Type-Options: nosniff`.

| HTTP | Error | Meaning |
| --- | --- | --- |
| 401 | `invalid_session` | Missing, malformed, expired or invalid customer proof; includes a Bearer challenge |
| 403 | `access_denied` | Current authority denies access, a required state is inactive, scopes no longer overlap, or a WhatsApp binding no longer matches |
| 503 | `authority_unavailable` | Authority cannot be reached, times out, redirects, or returns an invalid/stale/unbound response |
| 503 | `service_unavailable` | Unexpected internal failure, with no exception details exposed |

An authority HTTP 401/403 denies admission. Other non-200 statuses are unavailable. These responses never cause a second request, another tenant lookup or a fixture fallback. Customer proof is checked for expiry again after the authority call.

## Tenant status extension

**External integration gap:** `POST /v2/engine/admission` and `ideeo-admission-1` are a proposed tenant-service extension implemented by the disposable fixture only. The inspected PayMe API at `0d111de98b996d68b4af30115de620c2254973ef` does not expose it. Its broker validates proof/context and has current checks in distinct sandbox, hosted-bank and native-bank paths. A successful existing `context` response does not explicitly attest all the states required here. No PayMe API files were changed by this implementation.

The request uses the existing broker authentication pattern: workload `Authorization: Bearer` plus the original tenant proof in `X-Authority-Delegation`. The latter is released only for a configured audience present in the signed token. The authority must independently verify both proofs, the workload's tenant/client permissions, the customer's exact context and its association with current records. An engine-supplied context is not authority by itself.

```json
{
  "api_version": "ideeo-admission-1",
  "request_id": "fresh-engine-generated-uuid",
  "context": {
    "tenant_id": "alpha",
    "membership_id": "member-1",
    "client_id": "whatsapp",
    "agent_account_id": "assistant-1",
    "grant_id": "grant-1"
  },
  "authentication": {
    "channel": "whatsapp",
    "auth_time": 1795046400,
    "channel_binding_id": "generation-1"
  }
}
```

The reply must echo the exact `api_version`, `request_id` and five-field `context`, and contain:

- `checked_at`: integer UTC epoch seconds between the engine request start and response validation, with zero clock-skew allowance in this synthetic profile.
- `membership: { status }` and `agent_account: { status }`.
- `grant: { status, expires_at, scopes }` for the exact owner/client/account association.
- `channel_binding: null` for SDK, or `{ id, status, auth_time, expires_at }` for WhatsApp.

Statuses are `active`, `inactive`, `paused`, `revoked` or `expired`; only active states pass. Grant and channel expiry must be in the future. WhatsApp generation and authentication time must match verified proof. At least one current grant scope must overlap the token's scopes; the result cannot enlarge either set. Future operations must require their particular scope and resource permission, even after session admission succeeds.

[`shared/ideeo/admission.ts`](../../../shared/ideeo/admission.ts) defines these wire types. The client validates response shape, bounded scope values, current timestamps and complete caller/correlation binding. It accepts only JSON, limits the response to 16 KiB and imposes a total deadline of 50–5,000 ms. It makes one request through a dedicated HTTP agent, forwards no inbound cookies or identity-hint headers, and does not follow redirects or inherit an ambient proxy. No approval is cached. A disconnected caller aborts the pending authority request.

The tenant must implement and qualify this status projection before real integration, including all backend variants, bank-link semantics, current grant/account ownership and current channel status. Admission cannot substitute for Go financial authority or bank final enforcement. Revocation after an admission response is handled by a fresh action/disclosure check at its own execution boundary, not by treating this response as an enduring permit.

## Startup and trusted configuration

Run `pnpm start:ideeo --config <absolute-config-path>` after installing this repository's locked dependencies. There is no default configuration, tenant or credential. Invalid/missing configuration or a missing workload secret prevents the listener from starting. Configuration is immutable for a process; changes take effect by restarting with a newly validated configuration.

The configuration has exactly `environment`, `listen` and `tenants`. Currently only `environment: development`, a `127.0.0.1` listener and explicitly synthetic authority endpoints on `http://127.0.0.1:<port>/v2/engine/admission` are accepted. Port zero requests an ephemeral port. Real destinations are intentionally not enabled by this profile.

Each tenant contains `issuer`, `tenantId`, `audience`, `publicKeys`, `clients`, `delegationAudiences`, and `authority`. Public keys map configured key IDs to P-256 public PEMs. Clients map unique client IDs to `sdk` or `whatsapp`. Authority configuration contains its exact `url`, `credentialEnv`, `delegationAudience`, `timeoutMs`, and `provenance: synthetic`. The credential is resolved from the named environment variable, never from request/model content. Issuer and tenant mappings are unambiguous; an absent tenant cannot inherit another tenant's backend.

`server/ideeo-main.ts` is the separate product composition entry. It imports the explicit host factory, token verifier, configuration parser, tenant client and closed session routes. It does not import `server/index.ts`, the upstream route table, local stores, enterprise, cloud services or ambient tool registries. Import-time upstream initialization is why this profile cannot be implemented as a late route guard inside the existing composition root.

## Verification and remaining product work

The [isolated admission fixture](../../verification/ideeo.md) starts the actual product entry as a separate process with temporary configuration/home, generated keys and two separate tenant HTTP services. Negative cases include revoked grants, paused agents, stale/replaced WhatsApp bindings, cross-tenant/caller claims, removed configuration, missing secrets, wrong workload credentials, unavailable authority, invalid replies and replay. Deliberately disabled guards must cause the corresponding acceptance checks to fail.

Conversation, PostgreSQL, Go financial authority, task admission, banking handoffs, real tenant access and intended-consumer acceptance are not implemented by this boundary. The next product increment can attach encrypted conversation records and the OpenMaus loop to it while preserving current checks at each protected action and disclosure.

Affected existing controls include legal-register LR-01, LR-04 and LR-05; ISO/IEC 27001 identity/access controls 5.15–5.18, secure authentication 8.5, logging 8.15 and security testing 8.29. These are engineering mappings, not legal acceptance or certification.
