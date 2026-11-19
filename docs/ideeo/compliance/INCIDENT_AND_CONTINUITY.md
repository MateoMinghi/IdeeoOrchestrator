> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Incident management and business continuity

Status: **Draft. Pending approval by Top management. Not certification evidence.**

Standard references: ISO/IEC 27001:2022 Annex A 5.24–5.30, 6.8, 8.13, 8.14, 8.16; ISO/IEC 42001:2023 Annex A 8.4. Legal context: [LR-01](LEGAL_REGISTER.md) (personal data breach notification) and [LR-05](LEGAL_REGISTER.md) (CNBV incident reporting). Both are pending legal confirmation. Other documents: [COMPLIANCE.md](../policies/COMPLIANCE.md) rule 15 (report immediately), [Management system procedures](MANAGEMENT_SYSTEM_PROCEDURES.md) section 7.4 (communication), [Data ownership and lifecycle](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md).

Current state: development only. No production deployment exists, and the repository shows no real customer data processed. The procedures below are designed for the production model in [SCOPE_AND_CONTEXT.md](SCOPE_AND_CONTEXT.md). Most lever statuses are therefore "Implemented (development)" or "Planned".

## 1. Scope and definitions

| Term | Meaning for the engine |
| --- | --- |
| Security event | Any observed or reported state that may affect confidentiality, integrity or availability of the engine, its data, its keys or its authority decisions. Most events are not incidents. |
| Security incident | A confirmed or likely breach of a control, or an adverse effect on confidentiality, integrity or availability. |
| Personal-data breach | A security incident affecting personal data of tenant customers or of our staff/suppliers. Treated under [LR-01](LEGAL_REGISTER.md). Tenant is the controller. |
| AI incident | An incident where an AI component causes or enables harm, including: a model proposes an unauthorized or mistaken action; prompt injection (including from web pages read by the browser) changes a plan; data is disclosed to a model provider against [data policy](../reference/SOURCE_REFERENCES.md#source-c79ca76f1746); unsafe output reaches a customer; a model or provider change causes unexpected behaviour. See [AI impact assessment](AI_IMPACT_ASSESSMENT.md). |
| Near miss | An event that a control stopped before effect (for example an authority denial of a proposed operation). Recorded and reviewed; severity SEV3 or SEV4 unless the stopped action would have had a financial effect. |

## 2. Severity levels

Severity is set by the worst credible impact, not by how certain the cause is. Escalate upward at any time; downgrade only with incident lead and engineering lead agreement, recorded in the record.

| Level | Definition | Engine examples | Response target |
| --- | --- | --- | --- |
| SEV1 | Confirmed or likely unauthorized financial effect, cross-tenant exposure, or real customer personal data or secrets sent to an unauthorized party or outside an approved route. Loss of ability to pause or revoke an agent account. | Money moved without a valid mandate or approval; one tenant reads another tenant's data; customer PAN, CLABE or session token sent to a model provider; authority pause fails for an active agent. | Immediate. Incident lead named within [to define] minutes. Containment first. Tenant notified without undue delay (section 6). |
| SEV2 | Confirmed breach of a security or privacy control with limited or unknown customer impact, or a control that failed closed but showed a bypass path. | Prompt injection changes a plan and the authority denies the resulting operation; personal data exposed to an internal unauthorized person; unsafe output delivered to a real customer; audit row missing or altered; key or credential exposure with no evidence of misuse. | Same working day. Containment within [to define] hours. |
| SEV3 | Control failure or AI-quality incident with no customer effect and no data exposure. | Model proposes a denied operation; a backup or restore test fails; a monitoring or alert gap; a model route change without its impact assessment; secret found in a commit and removed before exposure. | Next business day. Tracked to closure in the risk register. |
| SEV4 | Weakness or observation without exploitation or effect. | Known gap re-found (for example G1 to G15 in the [risk register](RISK_REGISTER.md)); dependency advisory without reachable path; synthetic test data mislabelled. | Backlog within the review cycle. |

Current development evidence has no real customer data, so SEV1 and SEV2 examples describe the production design. Exercises use synthetic data.

## 3. Roles

| Role | Responsibilities in an incident |
| --- | --- |
| Incident lead | Owns the incident record, severity, decisions and closure. Usually the Engineering lead, unless conflicted. Named per incident. |
| Engineering lead | Technical triage, containment, eradication and recovery. Owns engine, authority and provider changes made during response. |
| Privacy lead (to be appointed) | Decides whether personal data is involved; prepares breach facts for the tenant under [LR-01](LEGAL_REGISTER.md). |
| Compliance owner (to be appointed) | Records the compliance impact, updates the legal register and risk entries, keeps evidence chain. |
| Top management | Approves severity downgrades of SEV1 and SEV2, any external statement, and the closure of SEV1 and SEV2 records. |
| Communications to tenant (Tenant compliance contact, per contract) | Single point of contact with the tenant. Sends only facts approved by the incident lead and privacy lead. |
| Legal counsel (to be engaged) | Confirms notification duties and wording under [LR-05](LEGAL_REGISTER.md) and [LR-01](LEGAL_REGISTER.md). |

One person may hold several roles when the organization is small. Nobody may approve their own incident closure.

## 4. Reporting and detection

**Anyone who suspects an event reports it immediately** through [incident channel to define]. Do not wait for confirmation. Do not paste customer data, secrets or prompts with real data into the report; describe the location instead (see section 7). The reporter is not blamed for a false alarm.

| Detection source | Current state |
| --- | --- |
| Automated tests and CI checks (ruff, mypy, pytest, Go tests, mutation checks) | Implemented (development). See [COMPLIANCE.md](../policies/COMPLIANCE.md). |
| Authority audit tables (`agent_controls`, mandate history) and deny decisions | Partial. Reads of customer data and denied attempts are not recorded (gap G7 in the [risk register](RISK_REGISTER.md)). |
| Eval reports and live-run reports | Implemented (development). Recorded under `evals/reports/`. Not monitoring. |
| Production monitoring and alerting (Langfuse, Sentry, OpenTelemetry) | Planned ([ADR-003](../decisions/003-engine-implementation-stack.md)). |
| Reviews (primary, cross-model, independent tester) | Implemented (development) per [METHODOLOGY.md](../policies/METHODOLOGY.md). |
| Tenant reports | Planned: contact route and SLA to be agreed in the tenant contract. |
| Provider notices (Google, OpenRouter, others) | Planned: no supplier register or data processing agreement exists yet (gap G10 in the [risk register](RISK_REGISTER.md)). |
| Bank callbacks and reconciliation mismatches | Partial: authority bank-event ingestion exists; no alerting on mismatches was found. |

## 5. Response procedure

Stages: **triage → contain → eradicate → recover → close**. Each stage has an entry in the incident record (section 11).

| Stage | Required actions |
| --- | --- |
| Triage | Open the record. Assign severity and roles. Record what is known, what is not, and whether personal data, secrets, financial effects or other tenants are involved. Decide notification timers (section 6). |
| Contain | Stop further harm first, without destroying evidence. Use the levers in the table below. Preserve state before changing it (section 7). |
| Eradicate | Remove the cause: fix the code or configuration through the normal feature worktree, review and test process. Do not patch production data by hand without a recorded, approved statement. |
| Recover | Restore service using the procedures in section 9. Recovery is forward-only: no downgrade of applied migrations and no reset of data ([ENGINE_SETUP.md](../reference/SOURCE_REFERENCES.md#source-8f929a906ccd), section "Stop and recover"). Verify with tests and a rehearsed check. |
| Close | Complete the post-incident review (section 8). Top management approves SEV1 and SEV2 closure. Update the [risk register](RISK_REGISTER.md) and [AI impact assessment](AI_IMPACT_ASSESSMENT.md). |

### 5.1 Containment levers

Lever status uses the vocabulary of [COMPLIANCE.md](../policies/COMPLIANCE.md) and the status rules of the [statement of applicability](STATEMENT_OF_APPLICABILITY.md).

| Lever | Effect | Evidence | Status |
| --- | --- | --- | --- |
| Owner pause of one agent account (`/v2/authority/agents/pause`) | Restricts one agent immediately. Does not need a bank round-trip. Works during a bank outage. Repeated calls are idempotent. | [owner.go](../reference/SOURCE_REFERENCES.md#source-cff3da286940) lines 54–66; [owner_controls.go](../reference/SOURCE_REFERENCES.md#source-e6e444e357a1) `RestrictAgent` line 133; [AUTHORITY.md](../contracts/AUTHORITY.md) owner commands | Implemented (development) |
| Owner revoke of one agent account (`/v2/authority/agents/revoke`) | Terminal restriction for that identity; disconnects it. Revocation is not reversible by resume. | Same as above; `restriction = "revoked"` sets `connected = false` in `owner_controls.go` | Implemented (development) |
| Pause of all agents for a membership (`/v2/authority/pause-all`) | Scoped restriction of every agent under the membership. | [owner.go](../reference/SOURCE_REFERENCES.md#source-cff3da286940) line 45; [lifecycle.go](../reference/SOURCE_REFERENCES.md#source-d26112b8ea63) `PauseAll` line 184 | Implemented (development) |
| Fail-closed authority decisions | Unknown mandate state, policy evaluation failure and access denial produce no protected effect. Default decision is `denied`. | [policy.go](../reference/SOURCE_REFERENCES.md#source-ad8846edd7f3) line 37 and line 94 (`policy_evaluation_failed`); [execution.go](../reference/SOURCE_REFERENCES.md#source-3f9940230218) returns `Denied` or `Unavailable` on lock and state checks | Implemented (development) |
| Hold of uncertain operations | An `executing`, `pending` or `uncertain` operation is not released by a network error, timeout or missing bank response. Its allowance hold continues to count across period boundaries. Reconciliation reads the source instead of repeating execution. | [execution.go](../reference/SOURCE_REFERENCES.md#source-3f9940230218) `uncertain` function line 115; [AUTHORITY.md](../contracts/AUTHORITY.md) reconciliation and holds | Implemented (development) |
| Default-deny model disclosure | Real tenant bindings have no model routes. Only the synthetic policy allows Gemini or OpenRouter routes. Disclosure without an allowed route returns `model_disclosure_denied`. | [data_policy.py](../reference/SOURCE_REFERENCES.md#source-c79ca76f1746) `model_routes` line 15, `authorize` lines 21–23, `synthetic` lines 25–35 | Implemented (development) |
| Remove a model route for a tenant | Stops disclosure for that provider and model. Done by changing the tenant's data policy configuration. No verified runtime switch exists. | [tenants.py](../reference/SOURCE_REFERENCES.md#source-e98e8b46dabe) loads `data_policy` per principal | Partial: configuration change only, requires restart or reload to be confirmed |
| Background work disabled by default | `background_enabled` defaults to `False`. Disabling stops new submissions. Existing accepted work needs its worker or explicit cancellation. | [settings.py](../reference/SOURCE_REFERENCES.md#source-df0681319dea) line 18; [api.py](../reference/SOURCE_REFERENCES.md#source-d71d552c10eb) line 168; [ENGINE_SETUP.md](../reference/SOURCE_REFERENCES.md#source-8f929a906ccd) background section | Implemented (development) |
| Stop the background worker | Ordinary conversation turns remain available. Stop the worker before changing its workflow. | [ENGINE_SETUP.md](../reference/SOURCE_REFERENCES.md#source-8f929a906ccd) background section | Implemented (development) |
| Graceful local shutdown | Operator file `.runtime/playground-engine.stop` closes engine and authority services. | [ENGINE_SETUP.md](../reference/SOURCE_REFERENCES.md#source-8f929a906ccd) local shutdown section | Implemented (development) |
| Tenant-side kill switch for bank execution | Tenant can refuse acceptance of new commitments at the bank. Engine cannot force the bank. | [AUTHORITY.md](../contracts/AUTHORITY.md) acceptance section | Partial: depends on bank implementation |
| Global engine kill switch (production) | Single control that stops all customer effects and all model calls. | None | Not implemented |
| Revocation of provider API keys and tenant credentials | Stops calls from the engine to providers and banks. | Secrets from environment only ([settings.py](../reference/SOURCE_REFERENCES.md#source-df0681319dea)). No rotation process. | Partial: manual, no rotation (gap G1, G2) |
| Credential rotation for workload tokens | Replaces a leaked workload bearer token. | Static tokens, no rotation ([authority/config.go](../reference/SOURCE_REFERENCES.md#source-7fda34e56797)) | Not implemented |
| Forced session end for a customer | Ends a customer session. | Short-lived tokens, maximum 900 s ([auth.py](../reference/SOURCE_REFERENCES.md#source-fb73258223a6)). Server-side session revocation not verified in code. | Partial |

Missing levers that the first production incident would need: runtime model-route disable, global kill switch, credential rotation, server-side session revocation, and on-call paging. These are backlog items to be recorded in the [risk register](RISK_REGISTER.md).

### 5.2 Designed behaviour under failure

| Failure | Designed behaviour | Evidence |
| --- | --- | --- |
| AI provider outage or error | Engine asks for clarification or hands off; it does not act on a guessed result. | Clarification result path in [coordinator.py](../reference/SOURCE_REFERENCES.md#source-69ab68496d82); [contracts.py](../reference/SOURCE_REFERENCES.md#source-e70aa4f02ded). Provider timeout behaviour to be verified in each adapter. |
| Tenant bank unavailable or timing out | Read or operation returns `bank_unavailable` (503) or `bank_timeout` (504), marked retryable. No effect is assumed. | [tenant_http.py](../reference/SOURCE_REFERENCES.md#source-7d2120edf815) lines 125, 143, 145; [adapters/authority.py](../reference/SOURCE_REFERENCES.md#source-af4876c5dd68) line 87 |
| Authority unavailable | No protected effect. Owner pause and revoke remain the authority's responsibility when reachable. | Fail-closed design in [AUTHORITY.md](../contracts/AUTHORITY.md); not yet proven in a failure test in production. |
| Background worker down | Ordinary turns continue. Accepted background work waits; no new submissions while disabled. | [ENGINE_SETUP.md](../reference/SOURCE_REFERENCES.md#source-8f929a906ccd) background section |
| Bank outcome not received | Operation stays uncertain and reserved until source evidence confirms. | [AUTHORITY.md](../contracts/AUTHORITY.md) reconciliation |

## 6. Tenant and regulatory notification

- **Tenant first.** We notify the affected tenant without undue delay, and within **[N hours — to agree in tenant contract]** of confirming a SEV1 or SEV2 event, or of first suspicion of personal-data breach if earlier. Notification is per the [legal register](LEGAL_REGISTER.md) entries LR-01 and LR-05, pending legal confirmation.
- **The tenant decides and notifies.** The tenant, as controller and regulated entity, decides whether and how to notify its supervisors (CNBV and, where applicable, Banco de México), data subjects, and any other party. Our organization does not notify regulators or customers on the tenant's behalf unless the tenant agrees in writing.
- **We provide facts and evidence.** Our notice contains: what happened, when it was detected, the systems and tenant scope affected, the data categories involved, containment status, and the evidence references in section 7. We state unknowns as unknowns.
- **No speculation.** Facts are verified by the incident lead and privacy lead before sending. Corrections are sent as updates with the same record reference.
- **Sub-processors.** If a provider (AI provider, hosting) is the source, we inform the tenant of the provider's role. Provider notification duties are recorded in the [supplier register](SUPPLIERS.md) once it exists.

| Notice | From | To | Deadline | Status |
| --- | --- | --- | --- | --- |
| Initial notice | Incident lead, approved by privacy lead | Tenant contact per contract | [N hours — to agree in tenant contract] | Not established |
| Updates | Communications to tenant | Tenant contact | [to define] | Not established |
| Final report | Incident lead | Tenant and Top management | [to define] | Not established |
| Supervisor and data-subject notices | Tenant | CNBV, Banco de México and data subjects as the tenant determines | Tenant decides | Not applicable to us unless the tenant asks |

## 7. Evidence collection

Evidence is collected at triage, before recovery changes state. Preserve and record:

| Evidence | Where it lives | Notes |
| --- | --- | --- |
| Authority control audit | `agent_controls` table (append-only, RLS-scoped) | Opaque actor and target references, revision, digest, time. See [AUTHORITY.md](../contracts/AUTHORITY.md). |
| Mandate history | Immutable encrypted history table | Requires the historical data key to read. Do not rotate or retire keys during an incident. |
| Operation and bank-event records | Authority operations and bank-event inbox | Source evidence and outcome revision. |
| Engine application logs and task state | PostgreSQL engine database | Task payloads are encrypted; expiry removes content after the task retention period. Preserve before cleanup runs. |
| Eval and live reports | `evals/reports/` and distinct report paths | Record model, provider, cost and fingerprints. Preserve failed reports. |
| Code and configuration identifiers | Git commit SHA, CI run ID, migration revision | Record the exact revision running at the time. |
| Provider and bank communications | Ticket or email outside the repository | Store in the restricted location [evidence store to define]. |

Rules:

1. **No customer data in the repository.** Evidence describes customer data by reference (IDs, hashes, counts), never by content. Synthetic examples only. See [COMPLIANCE.md](../policies/COMPLIANCE.md) rule 13.
2. **Chain of custody.** Each evidence item records: identifier, source, collector (role), collection time (UTC), hash, storage location, and every transfer. Use the template in section 11.
3. **Preserve before change.** Take a copy or snapshot of the affected records before any correction. Do not run cleanup, backfill or erasure jobs during an open SEV1 or SEV2 without the incident lead's approval.
4. **Keys are evidence too.** Do not regenerate or overwrite a key file to fix a read error ([ENGINE_SETUP.md](../reference/SOURCE_REFERENCES.md#source-8f929a906ccd), data key section).

## 8. Learning from incidents

Post-incident review (PIR) for every SEV1 to SEV3 event and for near misses that the incident lead selects. Held within **[to define]** days of closure. Blameless: it examines controls and decisions, not individuals.

PIR template:

| Field | Entry |
| --- | --- |
| Incident record ID | |
| Severity (initial and final) | |
| Summary of what happened (facts only) | |
| Timeline (UTC) | |
| Detection source and time to detect | |
| Containment and time to contain | |
| Root cause(s) | |
| Contributing factors | |
| Controls that worked | |
| Controls that failed or were missing | |
| Notifications made and their timing | |
| Actions (owner role, due date, linked backlog item) | |
| Risk register entries updated (ID) | |
| AI impact assessment updated (Y/N, reference) | |
| Lessons for tests or evals (new regression case, mutation check) | |
| Approved by (role) | |

Follow-up actions are tracked in the [risk register](RISK_REGISTER.md) and the backlog. Each AI incident also updates the [AI impact assessment](AI_IMPACT_ASSESSMENT.md) and, where applicable, the eval set under [AI_DEVELOPMENT.md](../policies/AI_DEVELOPMENT.md).

## 9. Business continuity and ICT readiness

### 9.1 Critical services and dependencies

| Service | Depends on | Current state |
| --- | --- | --- |
| Engine conversation API (customer turns) | Engine PostgreSQL, authority, tenant bank, AI provider | Development only |
| Background tasks | Temporal, engine PostgreSQL, historical data keys, AI provider | Development only; disabled by default |
| Authority (owner controls, operations) | Authority PostgreSQL, bank core, data keys, workload credentials | Development only |
| Engine and authority PostgreSQL | Hosting (planned: Aurora on AWS) | Local development clusters |
| Data keys | Key file (development) or environment (authority). Planned: KMS. | Development only; no rotation (gap G1 in the [risk register](RISK_REGISTER.md)) |
| Tenant bank core | Tenant's systems | External. Preproduction read adapter only. |
| AI providers (Gemini, OpenRouter) | Vendor availability | In development; no data processing agreement on file |
| Temporal | Self-hosted; history must be kept with application data | Development only |

### 9.2 Recovery objectives

RTO is the maximum tolerable time to restore a service. RPO is the maximum tolerable data loss. Values are for the tenant and Top management to set.

| Service | RTO | RPO | Degraded behaviour until restored | Status |
| --- | --- | --- | --- | --- |
| Engine conversation API | [to define] | [to define] | Customers receive no answer; no action is taken | Not established |
| Owner pause and revoke | [to define] | [to define] | Must remain available; highest priority in recovery | Not established |
| Authority execution | [to define] | [to define] | No new commitments (fail closed) | Not established |
| Engine PostgreSQL | [to define] | [to define] | As above | Not established |
| Authority PostgreSQL and audit tables | [to define] | [to define] | Operations stop; audit must not have gaps | Not established |
| Background tasks | [to define] | [to define] | New submissions disabled; accepted work waits | Not established |
| Historical data keys | [to define] | Zero loss required | Ciphertext unreadable if lost | Not established |

### 9.3 Failure modes and rules

- **Provider outage:** hand-off or clarification to the customer; no action on a guessed model output.
- **Bank unavailable:** defer or deny. Reads return `bank_unavailable`. Operations do not change state without bank acceptance or source evidence.
- **Authority unavailable:** no protected effect. Pause and revoke take priority when restored.
- **Database restore:** forward recovery only. No downgrade of applied migrations. Old binaries must not run against upgraded data ([ENGINE_SETUP.md](../reference/SOURCE_REFERENCES.md#source-8f929a906ccd), migration sections).

### 9.4 Exercise requirement

Before any production launch, the following must be rehearsed and recorded with date, participants (roles), scope, result and gaps:

1. Owner pause and revoke of an agent account while the bank is unreachable.
2. Restoration of engine and authority databases from backup, with decryption verified by key version.
3. Disable of background work and of one model route for a tenant.
4. A tabletop exercise of a SEV1 personal-data scenario through the tenant notification path.

Exercise records are not created until the exercises happen. No exercise has been performed. Exercises use synthetic data only.

## 10. Backup and redundancy

| Area | Planned design | Status |
| --- | --- | --- |
| Engine and authority databases | Tenant AWS managed database with automated backups and point-in-time recovery (Aurora). Retention period to define. | Planned |
| Backup restore testing | Scheduled restore into an isolated environment, with decryption and migration check. Frequency to define. | Not implemented |
| Key availability for restores | Historical data keys must be available with the backup. Planned: AWS KMS and Secrets Manager. Key version retention to be kept for all remaining ciphertext. | Not implemented (development key file only) |
| Redundancy | Multi-AZ database and stateless services on EKS. | Planned |
| Backup retention and erasure | Backups hold personal data and are not erased by row-level cleanup. Erasure of backup copies, provider copies and exports is an unresolved production requirement. Backup retention must be reconciled with the erasure rules in [Data ownership and lifecycle](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md) (section "Retention, cleanup and erasure") and with record-keeping duties in [LR-01](LEGAL_REGISTER.md) and open question Q4 of the [legal register](LEGAL_REGISTER.md). | Not established |

Backups must be encrypted, must not be restored into a production environment without an incident record, and must not be copied into the repository or into development machines.

## 11. Incident record template

Copy this template to the incident channel [incident channel to define]. Do not store customer data in this record.

| Field | Entry |
| --- | --- |
| Incident ID | |
| Title (neutral, no customer names) | |
| Reported by (role) and time (UTC) | |
| Detection source (section 4) | |
| Severity (SEV1–SEV4) and date assigned | |
| Incident lead, engineering lead, privacy lead, compliance owner | |
| Tenant(s) affected | |
| Personal data involved (Y/N/unknown; categories only) | |
| Financial effect (Y/N/unknown; amount and currency only if approved) | |
| AI component involved (Y/N; model, provider, prompt or tool reference) | |
| Containment actions (lever, time, actor role) | |
| Evidence items (section 7: identifier, source, hash, location, custody log) | |
| Eradication actions (change reference) | |
| Recovery actions and verification | |
| Tenant notification (deadline, sent time, approved by) | |
| Regulator or data-subject notifications (tenant decision, reference) | |
| Closure date and approver (Top management for SEV1 and SEV2) | |
| Post-incident review reference (section 8) | |
| Risk register and AI impact assessment updates | |

## Change history

| Version | Date | Change |
| --- | --- | --- |
| Draft | 2026-10-23 | Initial draft prepared with AI assistance from repository evidence; pending human review |
