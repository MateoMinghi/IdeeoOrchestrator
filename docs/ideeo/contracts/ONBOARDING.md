> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Tenant-owned onboarding handoff

[ADR-011](../decisions/011-tenant-api-and-channel-ownership.md) places enrollment/KYC, protected forms, session exchange, PIN handling, account creation and reconciliation in each tenant backend. The engine recognizes an onboarding request and returns a typed handoff. PayMe is one tenant example, with its API encapsulating Armony; other tenants provide their own backend and enrollment policy.

## Authenticated conversational entry

An app/SDK or tenant channel backend submits the ordinary authenticated `POST /v2/turns` with `Authorization: Bearer <engine-customer-proof>` and `Idempotency-Key`. Use the current [authentication profile](AUTH_PROFILE.md) and [shared interface](SHARED_INTERFACE.md); tenant, membership, calling client, agent account and grant derive from validated proof, never a phone, message or request-selected tenant endpoint.

When `account.onboard` is configured, caller-scoped and currently authorized, the assistant can return:

```json
{
  "kind": "onboarding_required",
  "version": "1",
  "tenant_id": "demo-bank",
  "profile_version": "demo-v1",
  "channel": "sdk",
  "owner": "tenant",
  "protected_input_required": true,
  "tenant_proof_required": true
}
```

This means the tenant must continue its protected enrollment flow. It does not mean an account exists, KYC passed, authentication succeeded, a grant was issued or money moved. The result contains no engine enrollment endpoint, form schema, bank coordinates, token or model-authored URL. The host/tenant API selects its own approved protected presentation outside the model.

These are customer-authenticated engine APIs. A person without the required engine principal starts directly in the tenant's applicant/onboarding flow; a Meta sender signature, phone number or app install does not become customer proof. Creating a banking account does not itself establish an engine session or assistant mandate. The tenant obtains subsequent banking access through its approved authentication and authority integration.

## Trusted configuration and replay

Use the tenant's existing `ENGINE_CAPABILITY_BACKENDS_FILE` entry:

```json
"onboarding": {
  "profile_version": "demo-v1",
  "clients": {
    "bank-mobile-sdk": "sdk",
    "bank-web": "web",
    "bank-whatsapp-api": "whatsapp"
  }
}
```

`account.onboard` must also be in that tenant's enabled capabilities and permitted by the caller's current scope/grant/authority. Exact verified `client_id` selects the configured channel. A client body or model cannot choose a channel, profile, tenant or backend. Missing provisioning fails unavailable; it never instantiates a bank adapter or falls back to another tenant. Handoff reads/replay recheck current authority and configured metadata; a changed profile cannot silently reuse an obsolete request.

The engine keeps the ordinary encrypted turn/task reference under its existing retention and caller isolation. It does not create a separate applicant identity, enrollment attempt or account-creation journal for this handoff. [Data ownership](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md#retired-account-enrollment-stores) covers historical records from the retired execution implementation.

## Channel responsibilities

| Entry | Tenant responsibility | Engine responsibility |
| --- | --- | --- |
| App/SDK | Own applicant verification, protected enrollment screens and API calls to its bank; establish customer proof separately | Accept verified conversation, recognize intent, return typed handoff |
| WhatsApp | Receive/verify/deduplicate Meta webhook, link/verify customer, run protected enrollment/Flows and deliver channel responses | Accept authenticated tenant-API turns; never accept Meta webhook or Flow payloads |
| Web | Own protected forms, consents, session exchange and account creation | Same authenticated intent/handoff contract |

All KYC/PIN entry and account creation stays outside the engine, ordinary conversation and model context. Tenant-specific field/consent/PIN rules are not a universal engine schema. Tenant-side duplicate prevention, uncertain effects and bank reconciliation need their own implementation and evidence; a conversational retry is not permission to repeat a creation.

## Retired engine execution surface

The former `/onboarding` form/assets, `/v2/onboarding` execution/session/callback routes, WhatsApp launch/messages/Flow endpoints, enrollment bank adapters and Flow export are removed. They are not SDK integration entry points. The current generated [OpenAPI](openapi.json) is authoritative for engine routes. Old development settings and execution clients must be removed from consumer configuration; route absence is explicit, not a proxy to the tenant or a silent legacy fallback.

Applied migrations and historical reports remain unchanged. Retained encrypted records expire under their existing lifecycle; duplicate-prevention anchors require tenant-approved reconciliation/retirement. This change does not approve production migration, automatic deletion or a claim that an uncertain bank creation failed.

Compliance impact: [legal register](../compliance/LEGAL_REGISTER.md) LR-01/02/03/04/09/12/18; target ISO/IEC 27001 5.15–5.18, 5.31, 5.34, 8.24, 8.26, 8.28, 8.29 and ISO/IEC 42001 A.7–A.9. Real-tenant disclosure, legal confirmation, independent acceptance and production approval retain their separate gates. See [verification](../reference/development/VERIFICATION.md) for actual evidence.
