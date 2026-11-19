> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Scope and context

Status: **Draft. Pending approval by Top management. Not certification evidence.**

Standard references: ISO/IEC 27001:2022 clauses 4.1 to 4.4; ISO/IEC 42001:2023 clauses 4.1 to 4.4.

## 1. External and internal issues (4.1)

| Issue | Type | Effect on the management system |
| --- | --- | --- |
| Tenants are regulated financial entities serving retail customers. The first tenant (PayMe) operates in Mexico and may be a bank or an IFPE (open question Q1). | External | Financial secrecy, AML, consumer-protection and channel-security duties bind the tenant and reach us by contract. Controls must meet tenant obligations, not only our own policy. See [Legal register](LEGAL_REGISTER.md). |
| Mexican legal framework (personal data, financial secrecy, CNBV outsourcing and cross-border rules, SPEI, consumer protection, record keeping) is in flux; several 2026 instruments are unverified. | External | Legal entries stay "pending legal confirmation". Release gates depend on counsel confirmation ([COMPLIANCE.md](../policies/COMPLIANCE.md) section 4). Register review is recurring, not one-off. |
| Dependence on upstream AI providers (Google Gemini Developer API, OpenRouter) whose data terms, regions and tiers are not yet confirmed. | External | Supplier register, data processing agreements and model-disclosure gates are prerequisites for real data. See [Suppliers](SUPPLIERS.md). |
| Prompt injection and model misbehaviour are not a solved problem. Authority is designed to sit outside the model. | External (technology) | Security and AI risk treatment rely on deterministic authority checks, not on model behaviour. Residual AI risk is recorded in the [Risk register](RISK_REGISTER.md) and [AI impact assessment](AI_IMPACT_ASSESSMENT.md). |
| Third-party websites and channels (retail sites via the browser executor, WhatsApp, planned voice) have their own terms and robots rules. | External | Legal opinions are required before real users reach them (LR-13, LR-16, LR-18). |
| The engine is in development only. Production, real-customer operation and production key management are planned, not built. | Internal | Controls are described as "Implemented (development)" or "Planned". No control is claimed to operate in production. |
| Known gaps are recorded in code-level evidence: plaintext development key file, plain HTTP loopback in the authority, no secret or dependency scanning in CI, no incident procedure, no supplier register. | Internal | These gaps are the starting point of the [Risk register](RISK_REGISTER.md) and the objectives in [Management system policy](MANAGEMENT_SYSTEM_POLICY.md). |
| AI-assisted development: coding assistants (Claude Code, Codex) draft code, tests and documentation. | Internal | Assistants can draft but cannot approve scope, legal positions, risk acceptance or production promotion. Independent human testing and cross-model review apply ([METHODOLOGY.md](../policies/METHODOLOGY.md) section 11). |
| Multi-tenant design: one engine serves several banks with separate configuration, credentials and data. | Internal | Tenant isolation (database row-level security, per-tenant keys, separate adapters) is a principal security objective and a critical-change class in [PRODUCTION_READINESS.md](../policies/PRODUCTION_READINESS.md). |
| Small delivery team with a human-controlled production gate. | Internal | Roles that the standards require (management system owner, privacy lead, compliance owner) are not yet appointed. See [Management system policy](MANAGEMENT_SYSTEM_POLICY.md) section 3. |

## 2. Interested parties and relevant requirements (4.2)

| Party | Relevant requirements | Where addressed |
| --- | --- | --- |
| Tenant banks (e.g. PayMe) | Controller and regulated-entity duties; processor contract; sub-processor authorization; audit and information access; incident notification within agreed times; isolation of their data and configuration. | [Legal register](LEGAL_REGISTER.md) LR-01 to LR-05; [Privacy program](PRIVACY_PROGRAM.md); [Suppliers](SUPPLIERS.md); [Incident and continuity](INCIDENT_AND_CONTINUITY.md) |
| Bank customers (AI subjects and data subjects) | Privacy notice coverage of AI and messaging; no disclosure of protected banking data beyond the contractual chain; no PINs, codes or passwords in model input; access, rectification, cancellation and opposition (ARCO) rights; accurate product information; complaint routes. | [AI policy](AI_POLICY.md); [AI impact assessment](AI_IMPACT_ASSESSMENT.md); [Privacy program](PRIVACY_PROGRAM.md); [COMPLIANCE.md](../policies/COMPLIANCE.md) section 3 rules 2, 3, 8 |
| Regulators, reached through the tenant: CNBV, Banco de México, UIF, CONDUSEF, the data-protection authority (Secretaría Anticorrupción y Buen Gobierno per LR-01) | Outsourcing and cross-border filings; authentication factors; information-security incident reporting; SPEI and account-level rules; AML monitoring and record keeping; consumer complaints. Obligations are reached through tenant contracts and audits. | [Legal register](LEGAL_REGISTER.md) LR-01 to LR-10; [Legal register](LEGAL_REGISTER.md) open questions Q2, Q4 |
| AI and cloud suppliers (Google, OpenRouter, the operator of the router model, Supabase-hosted WhatsBank preproduction, AWS once planned, ElevenLabs and Meta if adopted) | Contract, data terms (no training, retention), region, sub-processor disclosure; their own security obligations. | [Suppliers](SUPPLIERS.md); [Legal register](LEGAL_REGISTER.md) Q7 |
| Staff and contributors (developers, testers, assistant operators) | Clear roles, competence, confidentiality, secure development rules, awareness of AI risks. | [Management system procedures](MANAGEMENT_SYSTEM_PROCEDURES.md) sections 7.2 and 7.3; [Management system policy](MANAGEMENT_SYSTEM_POLICY.md) section 3 |
| Certification body (future) | Evidence of an operating management system; scope and exclusions justified; nonconformities handled. | This document; [Management system procedures](MANAGEMENT_SYSTEM_PROCEDURES.md) sections 9 and 10 |
| External agents using agent accounts (e.g. third-party assistants) | Authenticated identity, user-approved grants, enforcement of mandates and limits, auditable actions. | [COMPLIANCE.md](../policies/COMPLIANCE.md) section 3 rule 9; [Product context](../product/PROJECT_CONTEXT.md) |
| Other banks' AI assistants that delegate work to the engine | Verified delegation; scoped tasks; confidentiality between tenants. | [Product context](../product/PROJECT_CONTEXT.md); [ADR-001](../decisions/001-tenant-authentication-and-delegation.md) (Proposed) |

## 3. AI roles under ISO/IEC 42001

| Role | Who here | Note |
| --- | --- | --- |
| AI producer | [Organization legal name] (develops the engine) | |
| AI provider | [Organization legal name] (provides the engine to tenant banks) | |
| AI customer | Tenant banks | |
| AI subjects / users | Bank customers; external agents acting under a grant | |
| Upstream AI suppliers | Google (Gemini Developer API); OpenRouter; operator of `typesafe/jev-1.14` (unknown) | Disabled by default for the router model. |
| AI partners / clients | External agents (e.g. third-party assistants) | Not automatically tenants. |

Role definitions follow [Legal register](LEGAL_REGISTER.md) scope assumptions and [COMPLIANCE.md](../policies/COMPLIANCE.md) section 2 for data-protection roles.

## 4. Scope (4.3)

### Proposed scope statement

The information security and AI management system of [Organization legal name] covers the design, development, testing, security review, release control and supplier management of the shared, multi-tenant AI engine for banks. The engine comprises the Python brain, the Go/CEL authority service, PostgreSQL data stores with row-level security, tenant connectors, AI provider adapters, the browser executor and the local playground, as held in this repository. It includes the delivery and operating processes that govern these components, and the planned production deployment for the first tenant, once it is built. It applies to all personnel and contributors, human and AI-assisted, who work on these components. The scope is limited to the engine and its boundary with tenants; tenant cores, mobile applications, SDKs and legacy systems are outside it, as set out below.

### In scope

| Item | Type |
| --- | --- |
| `src/ai_engine` (brain: conversations, planning, task agents, durable tasks, outbox, tenant registry and adapters, browser executor, protected data) | Repository component |
| `authority/` (Go/CEL authority service: proofs, mandates, approvals, limits, reservations, history, bank callbacks) | Repository component |
| `migrations/` and `authority/migrations/` (PostgreSQL schemas, row-level security, append-only audit tables) | Repository component |
| `tools/playground`, `scripts/`, `evals/` (local UI, operational scripts, evaluation reports) | Repository component |
| `.github/workflows/` and the CI configuration | Repository component (development process) |
| Engine-side APIs and channel adapters (authenticated turns, tenant SDK contracts, delegation endpoints, agent-account APIs) | Interface, engine side |
| Delivery methodology, testing, review, release gates, supplier register, AI development and evaluation process | Development and operations process |
| Production deployment artefacts and configuration in this repository (when built) | Operations, engine side |

### Exclusions and boundaries

| Exclusion | Justification |
| --- | --- |
| Tenant cores, ledgers, core banking and regulated system of record (e.g. PayMe's core) | Owned by each bank. The engine calls them through tenant ports and mappings ([Tenant backends](../contracts/TENANT_BACKENDS.md)). Bank controls are the tenant's; our contract interfaces are in scope. |
| Mobile applications and SDK binaries | Separate repositories and components ([Integration context](../product/INTEGRATION_CONTEXT.md)). Engine-facing APIs they call are in scope. |
| Legacy orchestrator (repository `legacy-ideeo-IA`) | Separate repository. It may serve real customers over WhatsApp today. Its compliance status is open (Legal register Q6) and is tracked as a tenant-level risk, not a control of this system. |
| Tenant-operated infrastructure, including the tenant's AWS account and its operation | Shared responsibility. Our responsibilities are defined in [Suppliers](SUPPLIERS.md) and [Security policies](SECURITY_POLICIES.md). Operation of the tenant account is to be agreed in contract. |
| Physical locations | [Locations to confirm] |
| Cardholder data environment | Not in scope today; no PAN or CVV is handled (LR-15, PCI DSS decision pending). Re-evaluate before any single-use card or checkout feature. |
| Public websites visited by the browser executor (e.g. Mercado Libre) | Third parties. Governed by legal opinion and site terms, not by this system's controls (LR-13). |
| WhatsApp, Meta and ElevenLabs platforms | Third-party platforms. Governed through supplier and channel obligations when adopted. |

## 5. Interfaces and dependencies

| Component | External party | Interface |
| --- | --- | --- |
| Brain: planning and conversation | Google Gemini Developer API | Provider adapter ([gemini.py](../reference/SOURCE_REFERENCES.md#source-2f1279c24d1c)); synthetic data only today |
| Brain: model routing | OpenRouter (pinned to Google AI Studio); router model operator | Provider adapter ([openrouter.py](../reference/SOURCE_REFERENCES.md#source-51aa789f92fe), [jev.py](../reference/SOURCE_REFERENCES.md#source-5b247a0dc380), disabled by default) |
| Brain: tenant banking operations | Tenant bank backends | Generic tenant connector ([tenant_http.py](../reference/SOURCE_REFERENCES.md#source-7d2120edf815)); per-tenant mapping |
| Brain: WhatsBank preproduction reads | WhatsBank preproduction API (Supabase-hosted) | Read-only adapter ([whatsbank.py](../reference/SOURCE_REFERENCES.md#source-0c1a19371240)); synthetic users only |
| Brain: background tasks | Temporal (self-hosted) | Durable worker |
| Brain and authority: state | PostgreSQL (tenant-owned or engine-owned, per deployment) | Row-level security; runtime role restrictions |
| Brain: product research | Public websites | Sandboxed Chromium browser (Playwright); allowlisted destinations |
| Authority: delegation and approvals | Tenant bank port; external agents; owners (customers) | Authority HTTP interface; bank event callbacks; proofs |
| Authority: tenant data | Tenant bank backends | Bank port ([BANK_ADAPTER.md](../contracts/BANK_ADAPTER.md)) |
| Engine: client turns | Tenant apps and SDKs (separate repositories) | Shared interface ([SHARED_INTERFACE.md](../contracts/SHARED_INTERFACE.md)) |
| Delivery: source and CI | Git hosting (Forgejo, operator to confirm); CI runners | Repository and workflows |
| Delivery: issue tracking | Linear | Compact mappings in [documents.json](../reference/SOURCE_REFERENCES.md#source-1ae59a1ede6a); Linear holds live state |
| Delivery: development | AI coding assistants (Claude Code, Codex) | Draft and review within authorization ([AI_DEVELOPMENT.md](../policies/AI_DEVELOPMENT.md)) |
| Planned: production hosting | AWS (EKS, Aurora, S3, KMS, Secrets Manager); Bedrock AgentCore (us-east-1) | Not built; subject to [Legal register](LEGAL_REGISTER.md) LR-03 |
| Planned: voice channel | ElevenLabs | Engine-owned speech ports ([ADR-004](../decisions/004-voice-channel-and-speech-providers.md), Proposed) |
| Planned: messaging channel | Meta WhatsApp Cloud API | Channel adapter; legacy use is outside this scope |
| Planned: external agent access | ChatGPT, Gemini, Siri, Grok and similar clients | OAuth gateway; not built |
| Planned: observability | Langfuse, Sentry, OpenTelemetry collector | [ADR-003](../decisions/003-engine-implementation-stack.md) (Proposed) |

## 6. Management system documents

The list of management system documents, their purpose and approvers is in [README.md](README.md). This document does not repeat it.

## Change history

| Version | Date | Change |
| --- | --- | --- |
| Draft | 2026-10-23 | Initial draft prepared with AI assistance from repository evidence; pending human review |
