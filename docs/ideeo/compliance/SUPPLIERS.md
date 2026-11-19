> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Supplier register and onboarding

Status: **Draft. Pending approval by Compliance owner. Not certification evidence.**

Standard references: ISO/IEC 27001:2022 A.5.19 to A.5.23 (supplier relationships, cloud services); ISO/IEC 42001:2023 A.10.3 (suppliers of AI); ISO/IEC 27701:2025 sub-processor controls. Legal basis: [Legal register](LEGAL_REGISTER.md) LR-01, LR-03, LR-16, LR-18 (pending legal confirmation).

Rule: no supplier receives tenant data until its row here is complete and the tenant has authorized it ([COMPLIANCE.md](../policies/COMPLIANCE.md) rules 2 and 4). "Unknown — to verify" means the fact is not in repository evidence and must be obtained from the supplier or contract.

## 1. Supplier register

Risk tier is a proposed rating for the engine's use of the supplier, assigned by the compliance owner; it is not a vendor rating. Certifications are vendor-stated and unverified unless a report has been reviewed and recorded.

| Supplier | Service | Data (current / planned) | Location or region | Retention and training terms | Certifications (vendor-stated, unverified) | Contract / DPA | Tenant authorization | In tenant CNBV filing | Risk tier | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OpenAI API | Native Responses structured inference ([openai.py](../reference/SOURCE_REFERENCES.md#source-5831533e516c)) | Current: explicitly authorized synthetic engine/admin qualification only; no real customer data | Fixed API endpoint; processing region not qualified | Request sets `store: false`; this is not proof of zero retention, no training or an approved account contract | Unknown — not reviewed | No production DPA evidence | Synthetic development calls authorized by Mateo on 5 November 2026; real data default denied | Not authorized for real customer processing | High | Synthetic development only; exact profile and processing gates required |
| Google (Gemini Developer API) | Planning and classification model ([gemini.py](../reference/SOURCE_REFERENCES.md#source-2f1279c24d1c)) | Current: synthetic only. Planned: user text under an enabled tenant route | Unknown — to verify; region not pinned (LR-03) | Unknown — to verify (Q7); tier and data terms unknown (G3) | Unknown — to verify | Unknown — none in evidence | Not authorized (default deny) | Unknown — to verify (Q2) | High | Development only, synthetic |
| OpenRouter | Routes planner and router calls to Google AI Studio; Decisions API for the Jev router ([openrouter.py](../reference/SOURCE_REFERENCES.md#source-51aa789f92fe)) | Current: synthetic only. Planned: user text under an enabled tenant route | Unknown — to verify. Requests pin the upstream to google-ai-studio with fallbacks disabled | No zero-data-retention or no-training setting sent in the request; account terms unknown (G3, Q7) | Unknown — to verify | Unknown — none in evidence | Not authorized | Unknown — to verify (Q2) | High | Development only, synthetic |
| Operator of `typesafe/jev-1.14` (via OpenRouter) | Optional router model, disabled by default ([jev.py](../reference/SOURCE_REFERENCES.md#source-5b247a0dc380)) | Current: none (disabled). Planned: user text if enabled | Unknown — operator not identified | Unknown — to verify | Unknown — to verify | Unknown — none | Not authorized | Unknown | High | Disabled by default; operator to identify before enablement |
| Supabase (host of WhatsBank preproduction core function) | Tenant bank preproduction API ([whatsbank.py](../reference/SOURCE_REFERENCES.md#source-0c1a19371240)) | Current: read-only, purpose-made synthetic users. Planned: none | Unknown — to verify | Unknown — to verify | Unknown — to verify | Unknown — to verify whether the tenant or we hold the contract | Not authorized for real data | Unknown — to verify (Q2) | High | Development (preproduction) only |
| Railway | Personal development hosting: engine, console, PostgreSQL and self-hosted test OIDC | Generated operator records, purpose-made preproduction customer references, test conversations and private deployment configuration only | Observed deployment region `us-east4-eqdc4a`; real-data location approval absent | Application retention follows data lifecycle; platform terms/backup retention unknown — to verify | Unknown — not verified | No production DPA evidence | Mateo authorized this synthetic personal deployment on 27 October 2026; no real-data authorization | Not authorized for real customer processing | High | Personal preproduction only; see [deployment profile](../reference/SOURCE_REFERENCES.md#source-494551d6c6f5) |
| Amazon Web Services | Planned production hosting in the tenant's AWS account (EKS, Aurora, S3, KMS, Secrets Manager); Bedrock AgentCore Browser | Planned only | AgentCore: us-east-1 (planned, LR-03). Other production regions unknown — to verify | Unknown — to verify | Unknown — to verify | Unknown — none (tenant account) | Not authorized | Unknown: us-east-1 named in LR-03 (Q2) | High | Planned |
| ElevenLabs | Speech-to-text and text-to-speech; Speech Engine candidate ([ADR-004](../decisions/004-voice-channel-and-speech-providers.md)) | Planned: customer audio and transcripts. Current: none | Vendor-stated: US by default; isolated EU, India and Singapore on Enterprise; no Latin American region; processing may occur outside the selected location | Vendor-stated: transcripts and audio kept 2 years by default, configurable; Zero Retention Mode exists; Enterprise data not used for training by default, other plans can opt out. Required before real users: retention 0 or ZRM and no training (ADR-004 §8, LR-16) | Vendor-stated, renewed 16 October 2026: SOC 2 Type II, ISO/IEC 27001, 27701, 42001, 27017, 27018, PCI DSS Level 1 Service Provider. Not verified | Unknown — DPA and Enterprise terms required before real users | Not authorized | Unknown (Q2) | High | Proposed (ADR-004); no contract |
| Meta (WhatsApp Cloud API) | Messaging channel; the legacy repository uses it, outside this repository ([LR-18](LEGAL_REGISTER.md)) | Planned: inbound and outbound messages, phone identifiers | Unknown — to verify | Vendor retention: up to 30 days (per Rev4, LR-18). Other terms unknown | Unknown — to verify | WhatsApp Business Platform terms (LR-18); DPA unknown | Not authorized | Unknown (Q2) | High | Planned |
| OpenAI, Anthropic | Candidate model providers only | None | Unknown | Unknown | Unknown | None | Not authorized | Unknown | High | Not selected; named in ADR-002 and ADR-003 only |
| Langfuse, Sentry, OpenTelemetry collector | Observability ([ADR-003](../decisions/003-engine-implementation-stack.md)) | Planned: typed metrics and redacted traces; no raw audio or message content | Unknown — to verify; depends on self-hosting or SaaS choice | Unknown — to verify | Unknown — to verify | None | Not authorized | Unknown | Medium | Planned |
| Git hosting and CI (Forgejo instance per git remote; operator to confirm) | Source code and CI runners | Source code and synthetic fixtures only ([COMPLIANCE.md](../policies/COMPLIANCE.md) rule 13) | Unknown — operator to confirm | Unknown — to verify | Unknown — to verify | Unknown | Not applicable (no tenant data) | Not applicable | Medium | In use |
| Linear | Issue tracking with product information | Product information; no tenant data by rule | Unknown — to verify | Unknown — to verify | Unknown — to verify | Unknown | Not applicable (no tenant data) | Not applicable | Low | In use |
| AI coding assistants (Claude Code, Codex) | Implementation and review of code and documentation | Source code and documentation; synthetic data only | Unknown — to verify | Unknown — to verify | Unknown — to verify | Unknown | Not applicable (no tenant data) | Not applicable | Medium | In use |
| Temporal, PostgreSQL, Playwright and Chromium | Open-source software, self-hosted; not data processors | Data stays in the engine's own infrastructure in development | Self-hosted | Not applicable | Not applicable | Not applicable | Not applicable | Not applicable | Low | In use (development) |
| Browser Use 0.13.14 (open-source library only) | Upstream Agent, BrowserSession and tools in a separately locked local worker; MIT license | Synthetic UI observations; separately opt-in fictional-patient tests read public Doctoralia pages. No credentials or real customer information; model API stays in engine | Self-hosted development; telemetry/cloud sync disabled; loopback CDP, engine-controlled site egress | Task-local worker/browser files removed on close; existing encrypted turn/admin transcript lifecycle applies | Not applicable | No hosted service/DPA adopted | Mateo authorized implementation and OpenAI testing; public Doctoralia fictional-patient retry explicitly requested on 9 November 2026 | No real customer processing authorization | Development software dependency; production assessment pending | Scoped development only; see ADR-013 and service contract |

## 2. Third-party websites accessed

Not suppliers: no contract or data is exchanged with them, but the browser executor fetches their public pages. Legal basis: [Legal register](LEGAL_REGISTER.md) LR-13 and Q5.

| Website | Access | Terms and legal status | Status |
| --- | --- | --- | --- |
| Mercado Libre (Mexico) | Allowlisted in the example browser policy ([browser-policies.example.json](../reference/config/browser-policies.example.json)); public listing and article paths only | LR-13 records that its robots.txt blocks named AI agents on its listing and article hosts. No legal opinion recorded (Q5) | Not approved for real users |
| Doctoralia (Mexico) | Opt-in local PayMe fictional-patient public-directory test; fresh accountless Chromium, fixed host, GET/HEAD only, explicit agent identification | Robots checked on 9 November 2026: public directory pages allowed; `/buscar?`, `/ajax/`, `/api/` and private paths excluded. Runtime fetches current rules and denies queries/writes. No legal opinion recorded; robots permission is not contractual clearance | Development experiment only; not approved for real users, health data, contact or bookings |

## 3. Supplier onboarding

### 3.1 Due-diligence checklist

Complete every item, or record it as "Unknown — to verify" with an owner and due date. Evidence is attached or linked; nothing is pre-filled.

| # | Check | Evidence required | Blocks real data if missing |
| --- | --- | --- | --- |
| 1 | Security certifications and reports | Current report or certificate, reviewed by compliance owner; scope covers the service used | Yes |
| 2 | Data location and processing region | Written region commitment for the service and for backups, support and telemetry | Yes, if outside Mexico: tenant CNBV filing must cover it (LR-03) |
| 3 | Retention and training terms | Written retention period (or zero-retention mode), no-training commitment, human-review exposure | Yes |
| 4 | Sub-processors | Vendor's list and change-notice mechanism | Yes |
| 5 | Breach notification terms | Notice period agreed in writing, aligned to the tenant's deadline (LR-05) | Yes |
| 6 | Audit rights, including regulator access | Contractual audit and information-access clauses (LR-03) | Yes |
| 7 | Exit, return and deletion | Return and deletion commitments at end of contract, including backups and logs | Yes |
| 8 | Data processing agreement | Signed DPA with the processor terms in [Privacy program](PRIVACY_PROGRAM.md) section 6 | Yes |
| 9 | Privacy-notice coverage | Tenant confirms its notice covers the processing (LR-01) | Yes |
| 10 | Tenant authorization | Recorded written authorization from the tenant for the supplier and service | Yes |

### 3.2 Approval roles

| Step | Role |
| --- | --- |
| Prepare due-diligence evidence and register entry | Engineering lead (technical facts); Privacy lead (data terms) |
| Review evidence and set risk tier | Compliance owner (to be appointed) |
| Legal confirmation of transfers, filing and contract clauses | Legal counsel (to be engaged) |
| Tenant authorization and filing coverage | Tenant compliance |
| Approve onboarding | Compliance owner, with Privacy lead; Top management for high-risk suppliers |

### 3.3 Before any code path sends tenant data

1. The supplier row is complete (no "Unknown" in data location, retention, training, DPA or authorization columns).
2. The tenant's authorization and CNBV filing coverage are recorded for that supplier and location.
3. The tenant's model route is enabled explicitly in the tenant data policy ([data_policy.py](../reference/SOURCE_REFERENCES.md#source-c79ca76f1746)).
4. The change is reviewed under the AI impact assessment rules ([COMPLIANCE.md](../policies/COMPLIANCE.md) rule 11).

## 4. Monitoring and review

| Activity | Frequency | Owner |
| --- | --- | --- |
| Full register review, including certification currency and contract status | At least annually, and before each production release | Compliance owner |
| Review on any change: new supplier, new region, new data category, changed terms, sub-processor change notice | On change, before the change takes effect | Compliance owner, with Privacy lead |
| Vendor status and incident review (for example, availability incidents) | Quarterly | Engineering lead |
| Check that no code path reaches an unregistered supplier | Each release review ([COMPLIANCE.md](../policies/COMPLIANCE.md) section 4) | Primary and cross-model reviewers |

Vendor-stated facts (ElevenLabs, Meta) were read from vendor documentation on a date noted in [ADR-004](../decisions/004-voice-channel-and-speech-providers.md); re-read them before acceptance.

## 5. Exit and termination

| Step | Output |
| --- | --- |
| Stop new data flows: disable the route in the tenant data policy and remove the code path | Route removed; register updated |
| Request return and deletion from the supplier, including backups, logs and provider-side copies | Written confirmation with dates; any retention hold recorded |
| Reconcile erasure with the [data lifecycle](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md) propagation rules | Deletion record without retained content |
| Inform the tenant of the change, the end date and the deletion outcome | Tenant notice |
| Mark the row "Retired" and keep it for the record-keeping period set in the legal register (Q4) | Retired row with evidence links |

## Change history

| Version | Date | Change |
| --- | --- | --- |
| Draft | 2026-10-23 | Initial draft prepared with AI assistance from repository evidence; pending human review |

## IdeeoOrchestrator Gemini evaluation — 19 November 2026

The user explicitly authorized the Gemini key in the named sibling `.env` for inexpensive isolated testing. This candidate adds a synthetic-content-only `gemini-evaluation` profile for `gemini-2.5-flash-lite` at the fixed Google Gemini Developer API OpenAI-compatible endpoint. No real customer data, alternative provider route, bank access or deployment is authorized. Google documents different training/data-use terms for free and paid tiers; the account tier, contract, region and retention have not been qualified. No zero-retention or no-training claim is made. Existing real-data processing gates remain closed. See the candidate conversation contract and verification record for code and observed evidence; imported source-candidate authorizations above are unchanged.
