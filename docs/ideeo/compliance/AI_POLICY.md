> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# AI policy

Status: **Draft. Pending approval by Top management. Not certification evidence.**

Standard references: ISO/IEC 42001:2023 clause 5.2 (AI policy); Annex A.2 (A.2.2, A.2.3, A.2.4); Annex A.3.3 (reporting of concerns).

This policy states the commitments that govern the AI in the shared engine: the brain (LLM-based concierge, planning and routing), the authority, browser research, background tasks and tenant connectors. It applies to every tenant, including PayMe. Legal basis is in the [legal register](LEGAL_REGISTER.md); this policy does not interpret law.

## 1. Commitments

1. **The model proposes; the authority decides.** Model output is data. Only the authority grants permissions, mandates, approvals and execution permits. Conversation text or an `approved` field cannot create an execution permit ([capabilities contract](../contracts/CAPABILITIES.md)).
2. **Models never grant themselves permissions or approve payments.** The planner has no bank tools, credentials or authority ([provider profile](../contracts/PROVIDER_PROFILE.md)). A model or judge cannot override a deterministic forbidden-effect assertion ([AI development policy](../policies/AI_DEVELOPMENT.md)).
3. **Autonomy levels A0 to A3.** A0 hands commitments back to the user; A1 requires an exact protected approval; A2 requires a signed threshold rule and monthly cap; A3 requires an explicit monthly cap and biometric activation ([capabilities contract](../contracts/CAPABILITIES.md), [authority policy](../reference/SOURCE_REFERENCES.md#source-ad8846edd7f3)). A1 is the intended default for new agent accounts, per the [architecture reference](../product/architecture/arquitectura-motor-agentes-rev4.html). Raising a level requires strong customer authentication; A3 activation requires biometric proof ([lifecycle](../reference/SOURCE_REFERENCES.md#source-d26112b8ea63)). The default-level behaviour must be confirmed in code before this commitment is relied on (see the [AI impact assessment](AI_IMPACT_ASSESSMENT.md)).
4. **Default-deny disclosure of real tenant data to providers.** No model route receives real tenant data until the [compliance rules](../policies/COMPLIANCE.md) (rule 2) are met for that tenant and provider. The default data policy has no model routes and denies user-text disclosure ([data policy](../reference/SOURCE_REFERENCES.md#source-c79ca76f1746)).
5. **Request-local aliases for account data.** Account identifiers and labels are replaced by request-local aliases before model calls. Financial results and the verified principal are never placed in the model view ([data policy](../reference/SOURCE_REFERENCES.md#source-c79ca76f1746)).
6. **Secrets never reach models.** PINs, one-time codes, passwords, full card numbers, CVVs and credentials are excluded from model input, prompts, telemetry, reports and fixtures ([compliance rule 3](../policies/COMPLIANCE.md)).
7. **Human-controlled production promotion.** No AI component reaches production without a human-approved release record ([production readiness](../policies/PRODUCTION_READINESS.md)).
8. **Evals and independent review before integration.** Model behaviour is governed by eval contracts, and changes pass primary and cross-model review before integration ([AI development policy](../policies/AI_DEVELOPMENT.md), [methodology](../policies/METHODOLOGY.md)).
9. **Transparency that the user is talking to an AI.** Users are told that they are interacting with an AI system at the start of each conversation or voice session. This disclosure is a commitment; no implementation is evidenced in the repository yet (see the [AI Statement of Applicability](AI_STATEMENT_OF_APPLICABILITY.md), A.8.2).
10. **No voice as an authentication factor.** Voice is never an identity or approval factor. The engine uses no speaker verification or voice biometrics, and never requests PINs or codes by voice ([ADR-004](../decisions/004-voice-channel-and-speech-providers.md)).
11. **Synthetic data for development and evals.** Fixtures, eval cases and reports use labelled synthetic data only ([compliance rule 13](../policies/COMPLIANCE.md)).
12. **Provider and model changes are re-qualified.** A change of model, provider, prompt, tool, autonomy level or data class goes through the [AI impact assessment](AI_IMPACT_ASSESSMENT.md) and the eval rules. Earlier evidence is invalid for the new configuration ([AI development policy](../policies/AI_DEVELOPMENT.md)).
13. **Honest status.** Development results are not claimed as production results, and no certification or regulatory approval is claimed ([compliance policy](../policies/COMPLIANCE.md), section 1).

## 2. Scope of the engine's AI

The engine does not train models. Data controls apply to eval datasets, prompts and inference inputs. Providers in scope today are Google Gemini Developer API and OpenRouter; optional routing through `typesafe/jev-1.14` is disabled by default ([provider profile](../contracts/PROVIDER_PROFILE.md)). Other providers are candidates only until qualified under [ADR-002](../decisions/002-ai-provider-adapters-and-routing.md).

## 3. Alignment with other policies (A.2.3)

| Policy | Relation to this AI policy |
| --- | --- |
| [MANAGEMENT_SYSTEM_POLICY.md](MANAGEMENT_SYSTEM_POLICY.md) | Overall information security policy, roles and objectives; this policy applies within it. |
| [SECURITY_POLICIES.md](SECURITY_POLICIES.md) | Topic-specific security rules (access, cryptography, change, logging, retention) apply to AI components. |
| [PRIVACY_PROGRAM.md](PRIVACY_PROGRAM.md) | Processor role, data-subject requests and transfers govern personal data used by AI. |
| [COMPLIANCE.md](../policies/COMPLIANCE.md) | Engineering rules for legal and standards compliance, including rules 2, 5 and 11. |
| [AI_DEVELOPMENT.md](../policies/AI_DEVELOPMENT.md) | Eval contracts, review and release gates for AI behaviour. |

Where two policies conflict, the stricter rule applies and the conflict is recorded as a risk in the [risk register](RISK_REGISTER.md).

## 4. Review of this policy (A.2.4)

- Reviewed at least annually, and on significant change: a new provider, a new autonomy behaviour, a new channel, a new tenant data class, or an incident.
- Review is performed and recorded by the Management system owner (to be appointed) and approved by Top management. No review has been performed yet.

## 5. Reporting of concerns (A.3.3)

Anyone (staff, tenant staff, users, or researchers) may raise a concern about AI behaviour, including unsafe output, unauthorized effects, data exposure or bias.

- Channel: Compliance owner (to be appointed), at a contact address to be published. The channel is not yet operational.
- Concerns about a suspected security incident or personal-data breach follow [INCIDENT_AND_CONTINUITY.md](INCIDENT_AND_CONTINUITY.md) immediately.
- Concerns are recorded, triaged and fed back into the risk register; they are never silently closed.
- No retaliation against anyone who raises a concern in good faith.

## 6. Roles

| Role | Responsibility under this policy |
| --- | --- |
| Top management | Approves this policy and the AI Statement of Applicability. |
| Management system owner (to be appointed) | Owns the AI management system, impact assessment and review. |
| Engineering lead | Owns model, provider and prompt change control and eval gates. |
| Privacy lead (to be appointed) | Owns data-subject rights and processor obligations for AI data. |
| Compliance owner (to be appointed) | Owns supplier register and concern channel. |
| Legal counsel (to be engaged) | Confirms legal positions in the [legal register](LEGAL_REGISTER.md). |

## Change history

| Version | Date | Change |
| --- | --- | --- |
| Draft | 2026-10-23 | Initial draft prepared with AI assistance from repository evidence; pending human review |
