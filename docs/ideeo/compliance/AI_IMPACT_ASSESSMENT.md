> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# AI impact assessment

Status: **Draft. Pending approval by Management system owner (to be appointed). Not certification evidence.**

Standard references: ISO/IEC 42001:2023 clauses 6.1.4 and 8.4; Annex A.5 (A.5.2 to A.5.5).

Initial assessment from repository evidence; pending owner review.

## 1. System description

The shared AI engine ("the engine") is a multi-tenant backend that serves a bank's customers through a concierge assistant. It has five AI-relevant parts:

| Part | What it does | Evidence |
| --- | --- | --- |
| Concierge brain | Spanish-language conversation; plans typed capability requests; routes balance reads and asks for clarification | [prompts](../reference/SOURCE_REFERENCES.md#source-7a31136c6562), [planning profile](../contracts/PROVIDER_PROFILE.md), [coordinator contract](../contracts/AGENT_COORDINATION.md) |
| Authority | Verifies customer and owner proofs; mandates with autonomy levels A0 to A3; approvals; spending limits; owner pause and revoke | [capabilities contract](../contracts/CAPABILITIES.md), [authority](../reference/SOURCE_REFERENCES.md#source-8f76fd501bb6) |
| Browser research and background tasks | Sandboxed browser reads public product pages on allowlisted HTTPS destinations; durable background tasks deliver results | [browser models](../reference/SOURCE_REFERENCES.md#source-4d0a6d80bdf0), [background tasks contract](../contracts/BACKGROUND_TASKS.md) |
| Tenant connectors | Read-only balance access to tenant backends; generic HTTPS connector; WhatsBank preproduction read adapter | [tenant HTTP adapter](../reference/SOURCE_REFERENCES.md#source-7d2120edf815), [WhatsBank adapter](../reference/SOURCE_REFERENCES.md#source-0c1a19371240) |
| Upstream models | Google Gemini Developer API; OpenRouter pinned to Google AI Studio; optional Jev router (disabled by default) | [Gemini adapter](../reference/SOURCE_REFERENCES.md#source-2f1279c24d1c), [OpenRouter adapter](../reference/SOURCE_REFERENCES.md#source-51aa789f92fe), [settings](../reference/SOURCE_REFERENCES.md#source-df0681319dea) |

Current state: development only. The engine is not deployed and processes no real customer data according to repository evidence. Planned: voice ([ADR-004](../decisions/004-voice-channel-and-speech-providers.md), Proposed), a WhatsApp channel, and external agents through an OAuth gateway. Production hosting on AWS is planned.

## 2. Intended use

Public-site development research uses synthetic tenant/customer context but reads
real third-party pages; that does not make incidental patient content synthetic.
The [recorded capture failure](../reference/development/VERIFICATION.md) found featured
testimonials and health questions outside the initially excluded review section.
Qualified container/schema exclusions now cover those placements in DOM/evidence,
with images withheld on protected pages and earlier task bindings rejected.
Layout drift, historical exposure scope and human incident/privacy disposition
remain open; the agent does not close the event or approve production use.
LR-01/03/05/13, 27001 5.34, 8.15, 8.26–8.29 and 42001 A.6.2 apply.

The synthetic-only [Browser Use preparation increment](../decisions/013-browser-use-preparation.md)
adds dynamically discovered controls to the existing engine-owned model/action
loop. New hazards are private labels/source bindings entering observations,
shadow-host exclusion bypass, stale action destinations and helper dependency
drift. Controls exclude protected label trees and checkout bindings before
extraction, reject shadow roots, bind physical elements/URLs to current
observations, preserve egress/authority/approval fences and reject real driver
routes before account access. The helper has a separately locked, audited
dependency environment and receives only minimized tag/label pairs. Current
evidence and retained review failures are linked from [verification](../reference/development/VERIFICATION.md).
No new hosted Browser Use vendor, data store, inferred-memory writer or autonomy
level is enabled. LR-01/02/03/04/05/12/13 (LR-15 before card handling), target
27001 5.15–5.23, 5.34, 8.3, 8.10–8.12, 8.26–8.29 and 42001 A.5/A.6.2/A.7–A.10
remain applicable. This is an engineering assessment; human acceptance, helper
artifact binding, real-isolated-backend qualification and legal approval remain
separate. [ADR-014](../decisions/014-persistent-assistant-context.md) records future
assistant-state/assignment contracts without adopting their runtime behavior.

Stateless tenant-profile inference can use configured qualified backups after
transient provider failures. Risks include sending data to an unapproved backup,
different model behavior, duplicated inference cost and increased latency.
Mitigations are exact tenant/purpose/processing/data-route checks for every
attempt, refusal/invalid-output exclusions, current authority/source and budget
checks, a shared deadline and per-attempt content-free observations. No bank or
service effect is repeated. See [the bounded policy](../contracts/PROVIDER_PROFILE.md#automatic-failover-for-stateless-tenant-profiles).
Affected obligations are LR-01, LR-02 and LR-03; applicable target controls include
ISO/IEC 27001 5.14, 5.19–5.20, 5.29–5.30 and 8.15, and ISO/IEC 42001 A.6.2.4,
A.6.2.8 and A.10.3. This engineering change grants no new processing approval or
legal conclusion; real-tenant chains and independent acceptance remain gated.

The read-only mission increment groups at most four existing balance/research/
watch tasks under narrowed consultation authority. Its change-specific hazards
are lost corrections, stale child publication, misrouted answers, repeated-work
cost and duplicate/missing joined delivery. Mitigations are retained aggregate
budgets, required correction context, parent-row generation/cancellation fences,
question/child/goal-revision binding and transactional parent delivery; developer
evidence is linked from [verification](../reference/development/VERIFICATION.md). Synthetic
Gemini tests exercise understanding and source-backed results. This records
engineering impact and mitigations, not owner acceptance, a new legal position,
real-tenant disclosure approval or a broader autonomy/profile decision.

- Customers of a tenant bank (initially PayMe, Mexico) ask in Spanish about balances, and in later increments about transfers, bills and purchases, under a mandate they control.
- Tenant banks delegate reasoning work to the engine through its API.
- External agents use an agent account to call authority and banking APIs under a grant. Those agents do not need the engine's reasoning.

Out of intended use: unsupervised payments without authority approval; use for credit or eligibility decisions (not in the product scope); use with real customer data before the [compliance rules](../policies/COMPLIANCE.md) are met.

## 3. Intended users

| User | Relation to AI system |
| --- | --- |
| Bank customers (AI subjects and users) | Converse with the concierge; approve operations; set mandates and limits |
| Tenant bank staff | Configure tenant backends and policies; monitor |
| Operators and engineers | Develop, evaluate and release the engine |
| External agent clients | Use authority APIs under a customer grant |

## 4. Foreseeable misuse

| Misuse | Description |
| --- | --- |
| Prompt injection via user text | A user or agent writes instructions to change the model's behaviour or claim approval |
| Prompt injection via web content | A product page or other web content contains instructions the model follows |
| Social engineering | A third party persuades a customer to approve a payment or disclose a code |
| Evading bank limits | Splitting operations or using a mandate beyond its autonomy level, merchant or currency scope |
| Scraping beyond permitted sites | Browser use against destinations outside the allowlist, or against sites whose terms prohibit automated access |
| Disclosure through the model | Real account or personal data sent to a provider without authorization |

## 5. Affected parties

| Party | Why affected |
| --- | --- |
| Bank customers | Financial effects of operations; personal and financial data; control over agents |
| Recipients of transfers and merchants | Receive or are affected by operations initiated by agents |
| Websites visited by the browser | Load, terms of use, and automated access |
| Tenant banks | Regulatory obligations and customer relationship; processing liability |
| Society | Financial inclusion; Spanish-language users; trust in automated financial services |

## 6. Impact assessment

Severity and likelihood use 1 (low) to 5 (high). Initial scores are the drafter's estimates for owner review. Mitigations cite evidence that was verified in the repository; "Planned" marks controls not yet implemented.

| Impact | Affected party | Severity | Likelihood | Existing mitigations (verified evidence) | Residual concern | Planned action |
| --- | --- | --- | --- | --- | --- | --- |
| Unauthorized or mistaken financial effect | Customers, recipients | 5 | 2 | The model has no authority; the authority decides and requires exact protected approval for A1 and above; biometric for A3 activation; signed approvals with nonce replay protection ([capabilities contract](../contracts/CAPABILITIES.md), [approval](../reference/SOURCE_REFERENCES.md#source-a58825227070), [lifecycle](../reference/SOURCE_REFERENCES.md#source-d26112b8ea63)). Execution is development-only. | Bank adapter enforcement, and real-tenant assurance profiles, are not evidenced | Qualify bank-side enforcement and idempotency before any transfer capability; enforce and test A1 as the default level for new agent accounts |
| Wrong account or amount from misunderstanding es-MX | Customers | 4 | 3 | Account aliases resolved only against authorized choices; ambiguity triggers clarification; eval cases for Spanish paraphrases and ambiguity ([data policy](../reference/SOURCE_REFERENCES.md#source-c79ca76f1746), [provider profile](../contracts/PROVIDER_PROFILE.md)) | Live Spanish quality of the changed projection is not yet established | Maintain Spanish eval slices with run counts; gate changes per [AI development policy](../policies/AI_DEVELOPMENT.md) |
| Disclosure of personal or financial data to AI vendors | Customers | 5 | 2 | Default-deny model routes; synthetic-only routes; request-local aliases ([data policy](../reference/SOURCE_REFERENCES.md#source-c79ca76f1746)). Vendor data terms are not evidenced (gap G3). | No data processing agreements, no zero-retention settings, and no CNBV filing coverage ([legal register](LEGAL_REGISTER.md) LR-01 to LR-03) | Record vendors in [SUPPLIERS.md](SUPPLIERS.md) and obtain DPAs before real data flows |
| Over-reliance and automation bias | Customers | 3 | 3 | Final amounts are rendered deterministically from the authority, outside the model; approval shows protected presentation ([capabilities contract](../contracts/CAPABILITIES.md)) | Customers may still accept summaries without reading the approval | Test approval-screen wording and comprehension with users (Planned) |
| Lack of transparency that the user is talking to an AI | Customers | 3 | 4 | Commitment in [AI policy](AI_POLICY.md); ADR-004 requires AI disclosure for a future phone agent. No disclosure in code was located. | Not implemented | Implement AI disclosure at session start for all channels before real users (Planned) |
| Exclusion and accessibility (voice, language) | Customers | 3 | 3 | Text is the fallback when voice fails ([ADR-004](../decisions/004-voice-channel-and-speech-providers.md)); no voice authentication factor; Spanish and English recognized in planning ([prompts](../reference/SOURCE_REFERENCES.md#source-7a31136c6562)) | Voice not built; accessibility not assessed; only Spanish and English tested | Assess accessibility for each channel before launch (Planned) |
| Manipulation by injected web content | Customers, tenant banks | 4 | 3 | Browser allowlist, login and checkout path blocking, JavaScript disabled, no cookies ([browser models](../reference/SOURCE_REFERENCES.md#source-4d0a6d80bdf0)); untrusted content rule in evals ([AI development policy](../policies/AI_DEVELOPMENT.md)) | Login and challenge avoidance relies partly on prompt instructions (gap G11); no browser injection eval was located | Add injection regression cases for browser content; record results (Planned) |
| Unfair treatment or bias | Customers, society | 3 | 2 | No credit or eligibility decision was located in the product context; authority rules are deterministic per mandate | No bias evaluation was located | Define fairness slices for conversation quality before expansion (Planned) |
| Third-party site harm | Website operators | 3 | 3 | Destination allowlist, 443 only, 1 MiB cap, non-global IPs rejected ([browser models](../reference/SOURCE_REFERENCES.md#source-4d0a6d80bdf0)); example config lists Mercado Libre only ([config](../reference/config/browser-policies.example.json)) | No robots.txt or site-terms check in code; legal opinion not recorded ([legal register](LEGAL_REGISTER.md) LR-13, Q5) | Obtain legal opinion and implement robots.txt and terms checks before new destinations (Planned) |
| Loss of customer control (pause or revoke) | Customers | 4 | 2 | Owner pause and revoke with current-state checks ([capabilities contract](../contracts/CAPABILITIES.md), [owner controls test](../reference/SOURCE_REFERENCES.md#source-eeed6df25904)) | Pause and revoke are development-tested only; bank-side effect not evidenced | Verify pause and revoke end to end with the tenant in a preproduction test |

## 7. Review triggers and cadence

Reassess this assessment, and record the result in [AI Statement of Applicability](AI_STATEMENT_OF_APPLICABILITY.md) where a control changes, when any of the following occurs:

- A model, provider, router or model version change (including a provider-side model revision).
- A prompt, tool, schema or capability change.
- An autonomy level or threshold change, or a change in the authority rules.
- A data-class change, or a new tenant, or a new route that could carry real data.
- A new channel (voice, WhatsApp, external agent gateway) or a new browser destination.
- An incident, a concern raised through the [reporting channel](AI_POLICY.md), or an eval regression.

Cadence: at least annually, and before each production release. Changes follow the [compliance rules](../policies/COMPLIANCE.md) (rule 11).

## Change history

| Version | Date | Change |
| --- | --- | --- |
| Draft | 2026-10-23 | Initial draft prepared with AI assistance from repository evidence; pending human review |
