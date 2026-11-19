> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Privacy program

Status: **Draft. Pending approval by Privacy lead. Not certification evidence.**

Standard references: ISO/IEC 27701:2025 (processor controls), ISO/IEC 27018 (PII in public cloud, processor commitments), ISO/IEC 27001:2022 A.5.34. Legal basis: [Legal register](LEGAL_REGISTER.md) LR-01 only; all other entries are cited there, pending legal confirmation.

Scope: personal data processed by the shared engine for tenant banks. The first tenant is PayMe (Mexico). Nothing in this program is in production: the engine runs in development with synthetic users only ([Scope and context](SCOPE_AND_CONTEXT.md)).

## 1. Roles and instructions

| Party | Role | Duties in this program |
| --- | --- | --- |
| Tenant bank (for example PayMe) | Controller (*responsable*) | Privacy notice (covers AI, voice and messaging processing), legal basis, ARCO request intake, notification to data subjects and authorities, authorization of sub-processors, filing with the CNBV for processing outside Mexico |
| [Organization legal name] | Processor (*encargado*) | Processes only on documented tenant instructions; security measures; sub-processor controls; breach notice; assistance with ARCO requests; return or deletion at contract end |
| Our sub-processors (AI providers, hosting, messaging, speech) | Sub-processors | Used only after tenant authorization and [supplier register](SUPPLIERS.md) entry; bound by a data processing agreement |
| [Organization legal name] | Controller | Only for own staff and supplier records (not covered by this program's processing table) |

Rules: [COMPLIANCE.md](../policies/COMPLIANCE.md) sections 2 and 3 (rules 2, 4, 5, 7, 8, 13).

## 2. Record of processing activities

Status key: Implemented (development) = code exists and is tested in development only; Planned = not built. Retention values are development defaults unless stated; production retention is not selected ([Data ownership and lifecycle](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md)).

| Activity | Data categories | Data subjects | Purpose (tenant instruction) | Systems and stores (evidence) | Retention | Recipients and sub-processors | Processing outside Mexico | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Authenticated conversation turns (`POST /v1/turns`) | Message text (may contain personal data), tenant/membership/agent-account identifiers, task state | Tenant customers | Answer the customer's request in an authenticated session | [api.py](../reference/SOURCE_REFERENCES.md#source-d71d552c10eb), [store.py](../reference/SOURCE_REFERENCES.md#source-3b8d820bbe5e), [protected.py](../reference/SOURCE_REFERENCES.md#source-5f7581f679f7) (encrypted), migrations under [migrations/versions](../reference/SOURCE_REFERENCES.md#source-644306f103f0) | Task content 24 h default, max 168 h, tenant may shorten ([settings.py](../reference/SOURCE_REFERENCES.md#source-df0681319dea)) | Model providers only when a tenant route is enabled (see model rows below); none for real data today | Depends on provider; see Gemini and OpenRouter in [suppliers](SUPPLIERS.md) | Implemented (development), synthetic data only |
| Balance and account reads | Account identifiers, balances, transaction facts | Tenant customers | Show the balance the customer asked for | [whatsbank.py](../reference/SOURCE_REFERENCES.md#source-0c1a19371240) (preproduction), [tenant_http.py](../reference/SOURCE_REFERENCES.md#source-7d2120edf815), [capabilities](../reference/SOURCE_REFERENCES.md#source-179421c017d3) | Fetched fresh; retained task observation expires with the task. Bank records stay bank-owned ([lifecycle](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md)) | Tenant bank core; WhatsBank preproduction host (Supabase, see [suppliers](SUPPLIERS.md)) | Supabase host location: unknown, to verify | Implemented (development), read-only synthetic users only |
| Account-selection preference (`/v1/preferences/balance-account`) | Protected account reference, preference record | Tenant customers | Remember the account the customer chose for balance questions | [api.py](../reference/SOURCE_REFERENCES.md#source-d71d552c10eb) (PUT and DELETE), [store.py](../reference/SOURCE_REFERENCES.md#source-3b8d820bbe5e), `preferences` table | 90 days default ([data_policy.py](../reference/SOURCE_REFERENCES.md#source-c79ca76f1746)); customer deletion via DELETE | None | None | Implemented (development) |
| Background tasks (durable balance and monitoring tasks) | Instruction, captured selection, progress, delegation proof (encrypted, purpose-bound) | Tenant customers | Carry out a task the customer asked for later | [background/](../reference/SOURCE_REFERENCES.md#source-38224921978e), [BACKGROUND_TASKS.md](../contracts/BACKGROUND_TASKS.md); Temporal and LangGraph worker | Proof and content removed on terminal transition; content cleanup by scheduled job | Temporal (self-hosted in development) carries opaque references only | Self-hosted in development; production hosting planned in tenant AWS | Implemented (development) |
| Task delivery outbox | Task event notifications, conversation identifiers | Tenant customers | Deliver task updates to the customer's conversation | [background/delivery.py](../reference/SOURCE_REFERENCES.md#source-8fdfd7ea6579) | Content as task retention; replay markers 30 days | None | None | Implemented (development) |
| Public product research and price watches (`/v2/product-watches`) | Watch definition linked to a customer; public product page content | Tenant customers (watch owner); none for page content | Monitor public prices for the customer | [monitoring.py](../reference/SOURCE_REFERENCES.md#source-477ba79b727e), [watch_http.py](../reference/SOURCE_REFERENCES.md#source-aa2ab5a595cc), [browser/](../reference/SOURCE_REFERENCES.md#source-76ee41d58f6b), [browser policy example](../reference/config/browser-policies.example.json) | Page content and browser state temporary (lifecycle contract); watch follows task retention | Third-party retailer site (Mercado Libre, not a supplier; see the third-party sites table in [suppliers](SUPPLIERS.md)); planned AWS us-east-1 cloud browser | Planned AWS AgentCore us-east-1 | Implemented (development); legal opinion not recorded (LR-13) |
| Authority mandates, approvals and agent controls | Customer and owner proofs (verified, not stored raw), mandate versions, approval receipts, owner restrictions, nonces | Tenant customers; agent-account owners | Enforce customer-granted authority for agent accounts | [authority/](../reference/SOURCE_REFERENCES.md#source-8f76fd501bb6), [retention.go](../reference/SOURCE_REFERENCES.md#source-cb788e2f1aa4), [AUTHORITY.md](../contracts/AUTHORITY.md) | Full operation content erased after 24 h; mandate history, nonces and controls retained indefinitely (gap G6) | Bank event callbacks (inbound); none outbound | None | Implemented (development) |
| Inference evidence and eval reports | Synthetic prompts, model outputs, usage counts, provider metadata | Synthetic users only | Prove model behaviour before release ([AI development rules](../policies/AI_DEVELOPMENT.md)) | [evals/reports](../reference/SOURCE_REFERENCES.md#source-ba251de2dfe1), `inference_budget` table | Reports kept in repository; synthetic only (COMPLIANCE rule 13) | Model providers used for live synthetic checks | Google and OpenRouter (see [suppliers](SUPPLIERS.md)) | Implemented (development), synthetic only |
| Planned voice channel (ADR-004) | Customer audio, transcripts, voice session identifiers | Tenant customers | Spoken conversation with the concierge | [ADR-004](../decisions/004-voice-channel-and-speech-providers.md) (Proposed) | Audio temporary by default; transcript per approved retention | ElevenLabs (first candidate; Speech Engine), see [suppliers](SUPPLIERS.md) | Yes: US default processing unless an approved region applies | Planned |
| Planned messaging channels (WhatsApp Cloud API) | Inbound and outbound messages, phone identifiers | Tenant customers | Conversation over WhatsApp | [LR-18](LEGAL_REGISTER.md); legacy adapter is outside this repository (gap G15) | Meta retains messages up to 30 days (LR-18, per Rev4) | Meta | Unknown, to verify | Planned |
| Planned telemetry and observability (ADR-003) | Typed metrics; redacted traces | Tenant customers (indirectly) | Operate and diagnose the service | [ADR-003](../decisions/003-engine-implementation-stack.md); [DATA_OWNERSHIP_AND_LIFECYCLE](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md) telemetry rules | Typed metrics only; no raw audio or message content | Langfuse, Sentry, OpenTelemetry collector (see [suppliers](SUPPLIERS.md)) | Unknown, to verify | Planned |

## 3. Data-subject requests (ARCO)

The tenant receives requests from its customers. The organization assists the tenant within the time agreed in the tenant contract ([to agree in tenant contract]).

| Right | Current capability | Gap |
| --- | --- | --- |
| Access | None exposed | No access or export workflow (G5) |
| Rectification | Account preference can be replaced by `PUT` | No general correction workflow |
| Cancellation (erasure) | Balance-account preference deletion only ([api.py](../reference/SOURCE_REFERENCES.md#source-d71d552c10eb), `DELETE /v1/preferences/balance-account`) | No full erasure workflow across stores, backups, summaries or provider copies (G5; [lifecycle](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md) erasure section) |
| Opposition | None exposed | No workflow (G5) |

Required before real use: request intake and tracking record (request ID, category, scope, completion or hold, retry state), erasure propagation to every store, and tested assistance time. Recorded as risk; see [risk register](RISK_REGISTER.md).

## 4. Personal-data breach

- The organization notifies the tenant without undue delay, within the notification time agreed in the tenant contract (LR-05; procedure in [Incident and continuity](INCIDENT_AND_CONTINUITY.md)).
- The tenant handles notifications to data subjects and to authorities (LR-01).
- The organization does not notify customers or authorities on the tenant's behalf unless the tenant contract says so.
- Gap: no documented incident response or breach procedure yet (G9).

## 5. Sub-processors and processing outside Mexico

- Every sub-processor needs tenant authorization, a data processing agreement with no-training and retention terms, and a [supplier register](SUPPLIERS.md) entry before any code path sends tenant data (COMPLIANCE rules 2 and 4).
- Processing of real data outside Mexico needs the tenant's CNBV filing to cover the vendor and location (LR-03; open question Q2).
- Sub-processor changes: the tenant is notified and its authorization is recorded before the change takes effect. The notice period is [to agree in tenant contract].
- Current state: model routes for real tenants are empty by default (default deny in [data_policy.py](../reference/SOURCE_REFERENCES.md#source-c79ca76f1746)). Only synthetic policy allows the Gemini and OpenRouter routes. No real data reaches a vendor.

## 6. Commitments to the tenant (processor)

| Commitment | Status | Evidence or gap |
| --- | --- | --- |
| No use of tenant data for our own purposes or marketing | Partial | Contract clause to draft; no marketing use in code |
| No training of models on tenant data | Partial | Vendor terms not verified (G3, Q7); no training-free setting sent to OpenRouter ([openrouter.py](../reference/SOURCE_REFERENCES.md#source-51aa789f92fe)) |
| Disclosure requests (for example from authorities) handled per tenant contract | Planned | No procedure (G9); contract clause to draft |
| Return or deletion at contract end | Planned | No end-of-contract procedure; see [Suppliers](SUPPLIERS.md) exit steps |
| Temporary files erased | Partial | Scheduled cleanup for task content; browser response body capped at 1 MiB ([runtime.py](../reference/SOURCE_REFERENCES.md#source-bba452854a7a)), which bounds size, not erasure; no evidence for every temporary store (lifecycle contract) |

## 7. Privacy by design: existing controls

| Control | Evidence | Status |
| --- | --- | --- |
| Default-deny model disclosure for real tenants | [data_policy.py](../reference/SOURCE_REFERENCES.md#source-c79ca76f1746), [tenants.py](../reference/SOURCE_REFERENCES.md#source-e98e8b46dabe) | Implemented (development) |
| Account aliases replace account IDs and labels before model calls | `ModelProjection` in [data_policy.py](../reference/SOURCE_REFERENCES.md#source-c79ca76f1746) | Implemented (development) |
| Field-level authenticated encryption, per-tenant key, bound to tenant and resource | [protected.py](../reference/SOURCE_REFERENCES.md#source-5f7581f679f7) (AES-GCM, HKDF) | Implemented (development); development key file only (G1) |
| Raw user message not stored; keyed fingerprint instead | [protected.py](../reference/SOURCE_REFERENCES.md#source-5f7581f679f7) (`request-fingerprint`, HMAC) | Implemented (development) |
| Short retention for task content and preferences | [settings.py](../reference/SOURCE_REFERENCES.md#source-df0681319dea), [data_policy.py](../reference/SOURCE_REFERENCES.md#source-c79ca76f1746) | Implemented (development); production periods not selected |
| Sensitive-input screen (PIN, password, CVV, API key, bearer) | [service.py](../reference/SOURCE_REFERENCES.md#source-961ce220c26a) | Partial: keyword-only, no card number, CLABE or CURP detection (G4) |
| Tenant isolation with forced row-level security | [store.py](../reference/SOURCE_REFERENCES.md#source-3b8d820bbe5e), migrations under [migrations/versions](../reference/SOURCE_REFERENCES.md#source-644306f103f0) | Implemented (development) |

## 8. Gaps

| ID | Gap | Treatment | Owner | Status |
| --- | --- | --- | --- | --- |
| G3 | AI vendors: no zero-retention or no-training settings sent to OpenRouter; Gemini used rather than an enterprise endpoint; tier and data terms unknown; no DPA in evidence | Block real data (COMPLIANCE rule 2); close with [suppliers](SUPPLIERS.md) onboarding | Engineering lead, Compliance owner | Not implemented |
| G4 | Sensitive-input screen is keyword-only; does not detect card numbers, CLABE or CURP | Extend detector before real use; CLABE extraction by the model is by design and needs the same disclosure gate | Engineering lead | Partial |
| G5 | Data-subject rights: only balance-account preference deletion is exposed; no access, export or full erasure | Build ARCO workflow and erasure propagation before real use | Privacy lead | Not implemented |
| G6 | Retention: production periods and legal holds not selected; authority history retained indefinitely; operation details erased after 24 h, which may conflict with record-keeping duties (LR-09, Q4) | Decide periods and holds with tenant and counsel | Privacy lead, Legal counsel (to be engaged) | Not implemented |
| G10 | No supplier register or data processing agreements | This register is the first step; DPAs required before real data | Compliance owner | Partial |
| G15 | Legacy orchestrator (separate repository) appears to serve real customers over WhatsApp; outside this evidence (Q6) | Confirm LR-01 to LR-05 status with the tenant | Compliance owner | Not implemented |

## Change history

| Version | Date | Change |
| --- | --- | --- |
| Draft | 2026-10-23 | Initial draft prepared with AI assistance from repository evidence; pending human review |
