> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# ADR-009: Tenant administration and versioned assistant configuration

| Field | Value |
| --- | --- |
| Status | Scoped development implementation authorized |
| Date | 23 October 2026 |
| Authorization | Mateo requested implementation of the reviewed plan here, selected Next.js and the October patched Node release, and requested a seeded PayMe assistant. Production and independent acceptance remain separate. |
| Related | [Administration contract](../contracts/ADMINISTRATION.md), [assistant profiles](../contracts/ASSISTANT_PROFILES.md), [tenant backends](../contracts/TENANT_BACKENDS.md), ADR-001, ADR-005 and ADR-006 |

## Decision

Add a Next.js application and distinct FastAPI administration boundary here, preserving the brain, Go authority and banking ports. Pin Node.js 24.22.1 LTS from the requested [October security release](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases), with locked Next.js 16.4.2 and React 19.3.0. Runtime patching complements framework/dependency qualification.

Store memberships, revision-checked drafts, immutable publications, encrypted credentials and console conversations in PostgreSQL. Use a restricted administration role, forced tenant RLS, an engine read-only profile source and matching revision acknowledgement before reporting activation.

Keep operator login separate from customer authentication. Prefer configured OIDC/MFA; explicitly selected loopback development uses generated passwords. Platform roles cannot create banking authority. Conversational customization proposes allowlisted changes for review; previews remain isolated from publication.

On 27 October 2026, Mateo clarified that the personal deployment must retain the
app's own sign-in screen and approved the HTTPS password/TOTP profile described in
[the administration contract](../contracts/ADMINISTRATION.md#access), including
stopping the temporary test IdP after verification. This is a scoped preproduction
extension, preserving MFA, encrypted credentials, current membership checks,
sessions and CSRF. OIDC remains available for explicitly configured organizations;
neither operator profile establishes bank-customer identity or production approval.

Use configurable registered connectors. Banks sharing an API family reuse an adapter; unfamiliar semantics require engineering and qualification. Channel metadata, verification and delivery readiness remain distinct. Release publication identifies environment/maturity independently of actual tenant tool availability.

## Alternatives and consequences

Compliance review scope: legal-register LR-01 to LR-05 (operator/personal data,
bank confidentiality, processing locations, authentication and incident handling),
LR-12 (audit retention), LR-17 (AI obligations) and LR-18 (future messaging).
These are references for counsel/owner review, not approved legal interpretations.
Applicable target controls include ISO/IEC 27001 A.5.15–5.18, A.8.2, A.8.3, A.8.5,
A.8.9, A.8.15, A.8.24 and A.8.32; ISO/IEC 42001 A.5.2–5.4, A.6.2.2–6.2.4,
A.6.2.8, A.7.2 and A.10.3. Synthetic inference uses existing registered suppliers.
Real-tenant configuration inference needs a platform-registered tenant/provider
approval reference; UI text cannot satisfy that gate. The new store categories
and outstanding erasure/retention work are recorded in data lifecycle and R-12/R-13.
Accepted ADR-008 governs unavailable authority, durable commits and uncertain
outcomes; console failures do not create cached permission or bank success.

The local playground's single proof and process-wide busy flag cannot support public multiuser administration. Another reasoning implementation in Next.js would duplicate authority and bank contracts. A generic HTTP tool builder would confuse schemas with bank semantics and permission. A separate repository would split the administration contract from the engine.

This choice adds operator identity, database policies, replay/version checks, encryption and lifecycle responsibilities. The launcher remains synthetic. Real-bank trust/mappings, provider processing, WhatsApp activation, production key custody and independent acceptance require their own evidence.
