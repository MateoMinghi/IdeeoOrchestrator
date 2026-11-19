> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Topic-specific security policies

Status: **Draft. Pending approval by Top management. Not certification evidence.**

Standard references: ISO/IEC 27001:2022 Annex A (control numbers cited per section); ISO/IEC 27017 (cloud) in section 8. Management-system context: [Management system policy](MANAGEMENT_SYSTEM_POLICY.md), [Statement of Applicability](STATEMENT_OF_APPLICABILITY.md).

Scope: the shared AI engine repository (Python brain in `src/ai_engine`, Go authority in `authority/`, PostgreSQL migrations, CI, playground). Status vocabulary: Implemented (development), Partial, Planned, Not implemented, Not applicable. Gap IDs (G1 to G15) are defined in the [risk register](RISK_REGISTER.md). The current deployment is development only: no production environment, and no real customer data is processed (see [Scope and context](SCOPE_AND_CONTEXT.md)).

---

## 1. Access control and identity

Annex A: 5.15 access control, 5.16 identity management, 5.17 authentication information, 5.18 access rights, 8.2 privileged access rights, 8.3 information access restriction, 8.5 secure authentication.

### Policy

1.1. Every access to customer data MUST be tied to an authenticated principal and a current, scoped grant. Shared human accounts are prohibited.
1.2. Customer-facing API calls MUST present a short-lived credential validated against a configured trust profile: ES256 signature, `at+jwt` type, pinned issuer, audience and key ID, lifetime at most 900 seconds ([AUTH_PROFILE.md](../contracts/AUTH_PROFILE.md)).
1.3. Each protected operation MUST recheck current authority (membership, client, agent account, grant, permitted resource) before a bank read and before publishing any result.
1.4. Tenant data MUST be protected by forced row-level security. Runtime database roles MUST NOT be superusers, hold BYPASSRLS, create roles or databases, or own tables.
1.5. Workload credentials MUST be supplied from the environment or a secret manager, MUST be rotated on a defined schedule, and MUST NOT appear in code, fixtures or documents.
1.6. Privileged roles (migration owner, maintenance, lifecycle) MUST be separate from runtime roles, MUST NOT be assumable by the runtime, and MUST be granted to named individuals only.
1.7. Access rights MUST be reviewed periodically and when roles change. The Management system owner (to be appointed) keeps the review records; none are pre-filled here.
1.8. Production access MUST be granted only through the human approval path in [METHODOLOGY.md](../policies/METHODOLOGY.md#12-definition-of-done-and-production-promotion).

### Current implementation

| Control | Status | Evidence |
| --- | --- | --- |
| Customer JWT: ES256, `at+jwt`, kid-selected key, 900 s lifetime cap, 8,192-char limit | Implemented (development) | [auth.py](../reference/SOURCE_REFERENCES.md#source-fb73258223a6) (checks around lines 52-98); [authority/auth.go](../reference/SOURCE_REFERENCES.md#source-b9446bebdaf4) (lines 66-114) |
| Current-authority rechecks before reads, replays and disclosure | Implemented (development) | [AUTH_PROFILE.md](../contracts/AUTH_PROFILE.md) (current authority checks) |
| Forced RLS on tenant/membership tables; `WITH CHECK` policies | Implemented (development) | [tenant isolation migration](../reference/SOURCE_REFERENCES.md#source-b3322c3ddd59) (lines 19-22) |
| Runtime refuses superuser/BYPASSRLS/create roles (engine and authority) | Implemented (development) | [store.py](../reference/SOURCE_REFERENCES.md#source-3b8d820bbe5e) (line 72); [authority/store.go](../reference/SOURCE_REFERENCES.md#source-5833820575dd) (line 36) |
| Least-privilege database roles | Partial | Lifecycle role is NOLOGIN, NOBYPASSRLS ([lifecycle migration](../reference/SOURCE_REFERENCES.md#source-e3718bffbef2), line 28); CI and local Postgres use trust authentication ([engine.yml](../reference/SOURCE_REFERENCES.md#source-c416479486f9) line 20; [compose.yaml](../reference/SOURCE_REFERENCES.md#source-facaded51b7d)) |
| Workload bearer tokens: length 32 to 256, hashed comparison | Partial | [authority/server.go](../reference/SOURCE_REFERENCES.md#source-3b409d0781e4) (lines 23-27, 72-80); no rotation, plaintext HTTP loopback (G2) |
| Owner approvals: signed, nonce-replay protected, biometric or bank PIN method | Implemented (development) | [authority/approval.go](../reference/SOURCE_REFERENCES.md#source-a58825227070) (line 94) |
| Biometric required to activate level A3 | Implemented (development) | [authority/lifecycle.go](../reference/SOURCE_REFERENCES.md#source-d26112b8ea63) (line 45) |
| Human identity provider, MFA and SSO for repository and cloud | Not implemented | No evidence in repository (G14) |
| Access review records, joiner/leaver process | Not implemented | No evidence in repository (G14) |
| Real bank session validation and assurance | Planned | [AUTH_PROFILE.md](../contracts/AUTH_PROFILE.md) (tenant integration requirements); [ADR-001](../decisions/001-tenant-authentication-and-delegation.md) (Proposed) |

### Required before production

- Bank session validation, issuer key rotation and assurance rules agreed with the tenant (AUTH_PROFILE; ADR-001).
- Workload credentials rotated, stored in a secret manager, and carried over TLS (G2).
- Trust-auth removed from every non-local Postgres path; production DB roles split by owner, runtime, lifecycle and maintenance.
- MFA and SSO for repository, CI and cloud accounts; documented joiner/mover/leaver and access-review procedure (G14).

---

## 2. Cryptography and key management

Annex A: 8.24 use of cryptography. Related: 5.14 information transfer, 8.5 authentication.

### Policy

2.1. Customer data at rest MUST be protected by authenticated encryption (AES-GCM or an equivalent AEAD) with associated data binding tenant, membership, resource, field and version.
2.2. Data keys MUST be separated per tenant (derived or independently generated). One tenant's key MUST NOT decrypt another tenant's data.
2.3. Production key material MUST be held in a managed KMS or HSM with access logging. Key material MUST NOT be stored in the repository, in logs, or in plaintext files outside a documented development boundary.
2.4. Every key MUST have an identifier and version. Rotation MUST support rewrapping, and retired key versions MAY be kept only under a documented hold or backup policy.
2.5. Token signing keys MUST stay out of the engine verifier and out of app and SDK bundles. Signatures use ES256.
2.6. Customer data and credentials MUST be transported only over encrypted channels (TLS), including internal service-to-service and database connections.
2.7. Key custody roles (creation, activation, rotation, destruction) MUST be named, and production master-key operations MUST require dual control.
2.8. Request fingerprints MUST use keyed HMAC; raw user messages MUST NOT be stored.

### Current implementation

| Control | Status | Evidence |
| --- | --- | --- |
| AES-GCM field envelopes with per-tenant HKDF key and AAD (tenant, membership, resource, field, version) | Implemented (development) | [protected.py](../reference/SOURCE_REFERENCES.md#source-5f7581f679f7) (HKDF and AESGCM, lines 13-14, 73-88, 117) |
| Keyed request fingerprint (HMAC-SHA256 over tenant-derived key) | Implemented (development) | [protected.py](../reference/SOURCE_REFERENCES.md#source-5f7581f679f7) (lines 105-107) |
| Authority AES-GCM keyring from environment variables, base64, key ID selection | Implemented (development) | [authority/crypto.go](../reference/SOURCE_REFERENCES.md#source-de9708436c0c) (lines 12-33); [authority/config.go](../reference/SOURCE_REFERENCES.md#source-7fda34e56797) (lines 55-102, `key_environment_variables`) |
| ES256 token verification and owner-approval signatures | Implemented (development) | [auth.py](../reference/SOURCE_REFERENCES.md#source-fb73258223a6); [authority/auth.go](../reference/SOURCE_REFERENCES.md#source-b9446bebdaf4) |
| Key versions and rewrapping port | Partial | [DATA_OWNERSHIP_AND_LIFECYCLE.md](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md) (protected payloads section); production KMS not qualified |
| Development master key: plaintext JSON, auto-created with exclusive create and mode 0600 | Implemented (development). Gap G1 | [protected.py](../reference/SOURCE_REFERENCES.md#source-5f7581f679f7) (`LocalKeyProvider`, lines 26-45); default path `.runtime/data-keys.json` in [settings.py](../reference/SOURCE_REFERENCES.md#source-df0681319dea) (line 44) |
| KMS/HSM, key custody roles, automated rotation | Not implemented (Planned for the AWS tenant account) | G1; [COMPLIANCE.md](../policies/COMPLIANCE.md) rule 10 |
| TLS for authority listener and database DSN | Not implemented | Authority listens on plain HTTP loopback ([cmd/authority/main.go](../reference/SOURCE_REFERENCES.md#source-3b8945025b34) line 64); database URL has no TLS setting ([settings.py](../reference/SOURCE_REFERENCES.md#source-df0681319dea) line 13) (G2) |

### Required before production

- Replace development key files and environment-variable keys with KMS/HSM-managed keys per tenant; document custodians and dual control (G1).
- Automated rotation with rewrap tests, including restore of backups that hold older key versions.
- TLS on every customer-data and credential path; remove plain HTTP listener from production profile (G2).
- Qualify key handling in the production environment; development keys are not that qualification ([DATA_OWNERSHIP_AND_LIFECYCLE.md](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md)).

---

## 3. Secure development and change management

Annex A: 8.25 secure development life cycle, 8.26 application security requirements, 8.27 secure architecture, 8.28 secure coding, 8.29 security testing, 8.31 separation of environments, 8.32 change management, 8.4 access to source code.

### Policy

3.1. Changes MUST be developed in isolated feature worktrees and integrated through `feature -> dev`. Production promotion MUST be a human decision on an exact artifact and configuration ([METHODOLOGY.md](../policies/METHODOLOGY.md) sections 6, 10, 12).
3.2. Feature work MUST have a primary review in a separate session and an independent cross-model review, recorded against the reviewed revision ([METHODOLOGY.md](../policies/METHODOLOGY.md) section 11).
3.3. Changes to authentication, authorization, tenant boundaries, data classes, model providers or channels MUST have a threat analysis and ASVS-subset checks ([PRODUCTION_READINESS.md](../policies/PRODUCTION_READINESS.md) section 6).
3.4. Merges MUST pass the CI checks for the changed stack: lint and security rules, types, tests, build, contract drift and, where relevant, database checks ([engine.yml](../reference/SOURCE_REFERENCES.md#source-c416479486f9); [authority.yml](../reference/SOURCE_REFERENCES.md#source-4b98103a9048)).
3.5. Applied database migrations MUST be immutable. Changes are forward migrations; history is never rewritten to fix a checksum ([METHODOLOGY.md](../policies/METHODOLOGY.md) section 13).
3.6. Development-only configuration MUST be refused outside development. Real deployment stays unsupported until its contract is implemented and verified.
3.7. AI coding assistants (Claude Code, Codex) are tools under review. Their output MUST pass the same reviews and CI as human output. They MUST NOT approve their own scope, evidence or promotion ([METHODOLOGY.md](../policies/METHODOLOGY.md) section 2; [COMPLIANCE.md](../policies/COMPLIANCE.md) section 5).
3.8. Fixtures, evals and reports MUST use labelled synthetic data. Paid or external live calls MUST require an explicit flag ([COMPLIANCE.md](../policies/COMPLIANCE.md) rule 13).
3.9. Secret-echo and credential-leak tests MUST exist for every component that handles credentials.

### Current implementation

| Control | Status | Evidence |
| --- | --- | --- |
| Feature worktrees, primary and cross-model review, human production promotion | Partial | Documented in [METHODOLOGY.md](../policies/METHODOLOGY.md) and [PRODUCTION_READINESS.md](../policies/PRODUCTION_READINESS.md). Review records are not in the repository. Branch protection not evidenced (G8) |
| CI on pull requests: ruff with bandit (`S`) rules, mypy strict, pytest with coverage, alembic check, contract export check, uv build | Implemented (development) | [engine.yml](../reference/SOURCE_REFERENCES.md#source-c416479486f9) (lines 166-176); [pyproject.toml](../reference/SOURCE_REFERENCES.md#source-50c86b7ed8ac) (ruff `select` includes `S`; mypy strict) |
| Go verification: go mod verify, gofmt, vet, `-race` tests, build, mutation testing | Implemented (development) | [authority.yml](../reference/SOURCE_REFERENCES.md#source-4b98103a9048) (lines 51-61); [scripts/authority_mutations.py](../reference/SOURCE_REFERENCES.md#source-708533faf39b) |
| Required CI checks enforced by branch protection or rulesets | Not implemented | Not evidenced in repository (G8) |
| Environment guard refuses non-development configuration | Implemented (development) | [settings.py](../reference/SOURCE_REFERENCES.md#source-df0681319dea) (line 12); [authority/config.go](../reference/SOURCE_REFERENCES.md#source-7fda34e56797) (line 73) |
| Migrations are forward-only; `alembic check` in CI | Partial | Forward migrations in `migrations/versions/`; check at [engine.yml](../reference/SOURCE_REFERENCES.md#source-c416479486f9) line 166. Immutability not enforced by tooling |
| Live calls gated by `--allow-live` | Implemented (development) | [scripts/jev_eval.py](../reference/SOURCE_REFERENCES.md#source-aa259356578a) (line 88); [scripts/assistant_live_eval.py](../reference/SOURCE_REFERENCES.md#source-c739435cc2cb) (line 853) |
| Secret-echo checks in authority | Implemented (development) | [authority/core.go](../reference/SOURCE_REFERENCES.md#source-97f57b88a699) (lines 52-68, 122) |
| Threat analysis and ASVS-subset baseline for critical changes | Partial | Required by [PRODUCTION_READINESS.md](../policies/PRODUCTION_READINESS.md) section 6; no completed analyses in repository |
| CODEOWNERS for security-relevant paths | Not implemented | No CODEOWNERS file (G8) |
| Pinned third-party actions by full commit SHA | Not implemented | Tags only, e.g. `actions/checkout@v4` ([engine.yml](../reference/SOURCE_REFERENCES.md#source-c416479486f9) line 33) (G8) |

### Required before production

- Enforce branch protection or rulesets with the required checks listed in [PRODUCTION_READINESS.md](../policies/PRODUCTION_READINESS.md) section 9; add CODEOWNERS.
- Record each release approval for the exact artifact and migration order ([PRODUCTION_READINESS.md](../policies/PRODUCTION_READINESS.md) section 10).
- Maintain an AI-assistant tool register (tool, version, permitted repositories, permitted actions) owned by the Engineering lead.
- Add static analysis and dependency-aware security tests to CI as specified in section 4.

---

## 4. Vulnerability, dependency and supply-chain management

Annex A: 8.8 management of technical vulnerabilities, 8.7 protection against malware, 5.21 managing information security in the ICT supply chain. Supplier register: [SUPPLIERS.md](SUPPLIERS.md).

### Policy

4.1. Python and Go dependencies MUST be pinned by lockfile (`uv.lock`, `authority/go.sum`) and installed in locked mode.
4.2. Dependency vulnerability scans MUST run in CI for every component (Python, Go, Node). Findings MUST be triaged, and remediation deadlines MUST be set by the Management system owner (to be appointed).
4.3. Secret scanning MUST run in CI and before commit for the repository.
4.4. CI actions and container images MUST be pinned by full commit SHA or digest.
4.5. Each release artifact MUST have a software bill of materials (SBOM).
4.6. Every component with a dependency manifest MUST have a committed lockfile.
4.7. Dependency updates MUST be automated through a bot and reviewed like any other change.
4.8. Scanning results and exceptions are recorded in the risk register ([RISK_REGISTER.md](RISK_REGISTER.md)). Scanner silence is not proof of security ([PRODUCTION_READINESS.md](../policies/PRODUCTION_READINESS.md) section 6).

### Current implementation

| Control | Status | Evidence |
| --- | --- | --- |
| Locked installs: `uv sync --locked` in CI; `uv.lock` committed | Implemented (development) | [engine.yml](../reference/SOURCE_REFERENCES.md#source-c416479486f9) (lines 38, 162); [uv.lock](../reference/SOURCE_REFERENCES.md#source-84321598744d) |
| Go module verification and checksums | Implemented (development) | [authority.yml](../reference/SOURCE_REFERENCES.md#source-4b98103a9048) (line 51); [authority/go.sum](../reference/SOURCE_REFERENCES.md#source-dcb044274deb) |
| pip-audit available as a dev dependency but not run in CI | Partial | [pyproject.toml](../reference/SOURCE_REFERENCES.md#source-50c86b7ed8ac) (dev group); not invoked in [engine.yml](../reference/SOURCE_REFERENCES.md#source-c416479486f9) (G8) |
| Dependency vulnerability scanning for Go (govulncheck) | Not implemented | Not in [authority.yml](../reference/SOURCE_REFERENCES.md#source-4b98103a9048) (G8) |
| Secret scanning | Not implemented | No scanning step in any workflow (G8) |
| SBOM | Not implemented | No SBOM generation in workflows (G8) |
| Dependabot or Renovate | Not implemented | No `.github/dependabot.yml` (G8) |
| Playground lockfile | Not implemented | [tools/playground/package.json](../reference/SOURCE_REFERENCES.md#source-45b440726f19) present; no `package-lock.json` (G8) |
| Browser runtime installed in CI from the package manager | Partial | `playwright install --with-deps chromium` ([engine.yml](../reference/SOURCE_REFERENCES.md#source-c416479486f9) line 39); no image or version pin review |

### Required before production

- Add pip-audit, govulncheck and npm audit to CI, with recorded triage and exceptions.
- Add secret scanning (pre-commit and CI); pin actions and images by SHA or digest.
- Generate and retain an SBOM per release artifact; commit the playground lockfile; configure Dependabot or Renovate.
- Assess each supplier and sub-processor before dependency adoption that touches customer data ([SUPPLIERS.md](SUPPLIERS.md); G10).

---

## 5. Logging and monitoring

Annex A: 8.15 logging, 8.16 monitoring activities, 8.17 clock synchronization. Related: 5.28 collection of evidence.

### Policy

5.1. Log messages MUST use fixed event strings and identifiers. Logs MUST NOT contain prompts, message content, bank payloads, account numbers, PINs, tokens, keys or other secrets.
5.2. Authority mandate, approval, control and history records MUST be append-only for the application role, and modification MUST be blocked by the database.
5.3. Access to customer financial data, including reads and denied attempts, MUST be recorded in an attributable audit trail.
5.4. All systems MUST synchronize clocks to a trusted, documented time source. Authorization freshness and audit ordering depend on this.
5.5. Audit and security logs MUST be protected from modification and retained per [DATA_OWNERSHIP_AND_LIFECYCLE.md](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md) and the legal register ([LR-09](LEGAL_REGISTER.md), [LR-12](LEGAL_REGISTER.md)).
5.6. Security alerts and their owners MUST be defined before production. Telemetry sinks MUST receive typed metrics only, not content.

### Current implementation

| Control | Status | Evidence |
| --- | --- | --- |
| Fixed-string event logs (Python lifecycle and background workers) | Implemented (development) | [api.py](../reference/SOURCE_REFERENCES.md#source-d71d552c10eb) (line 133); [background/worker.py](../reference/SOURCE_REFERENCES.md#source-5d3c4a743334) (line 68) |
| Fixed-string authority logs; no payloads in maintenance output | Implemented (development) | [authority/cmd/authority/main.go](../reference/SOURCE_REFERENCES.md#source-3b8945025b34) (lines 56, 76-78); [authority/retention.go](../reference/SOURCE_REFERENCES.md#source-cb788e2f1aa4) (lines 150-152) |
| Append-only authority audit: grants limited to SELECT and INSERT; trigger requires history rows | Implemented (development) | [006_agent_controls.sql](../reference/SOURCE_REFERENCES.md#source-f3c42495a8d5) (line 25); [007_mandate_history.sql](../reference/SOURCE_REFERENCES.md#source-c75629db42ef) (lines 36-64) |
| Audit of customer-data reads and denied attempts | Not implemented | No read or denial audit found in [authority/access.go](../reference/SOURCE_REFERENCES.md#source-66ba67277ec9) or [authority/read.go](../reference/SOURCE_REFERENCES.md#source-b5b10636a6fc) (G7) |
| Clock synchronization standard | Not implemented | No time-source documentation or configuration in repository |
| Monitoring and tracing sinks (Langfuse, Sentry, OpenTelemetry) | Planned | [ADR-003](../decisions/003-engine-implementation-stack.md) (Proposed) |
| Eval and cost reports recording model, provider and cost | Implemented (development) | `evals/reports/` (see [COMPLIANCE.md](../policies/COMPLIANCE.md) rule set; CI uploads background reports in [engine.yml](../reference/SOURCE_REFERENCES.md#source-c416479486f9) line 125) |

### Required before production

- Record reads of customer financial data and denied attempts in the authority audit trail, attributed to the actor (G7).
- Define and document the time source and drift tolerance for all environments.
- Select the log sink, retention and access controls; confirm no content reaches telemetry (see section 6).
- Define alerts for authorization denials, replay attempts, signature failures and cleanup failures.

---

## 6. Information classification and handling

Annex A: 5.12 classification of information, 5.13 labelling of information, 5.14 information transfer, 8.11 data masking, 8.12 data leakage prevention.

### Policy

6.1. Every information asset MUST carry one of four classes. Unclassified data is treated as Confidential.

| Class | Definition | Examples |
| --- | --- | --- |
| Public | Approved for public release | Public product pages; published documentation intended for the public |
| Internal | Company information that is not customer data and not sensitive | Internal ADRs, Linear items, this policy set |
| Confidential | Tenant and customer personal data; non-public product information | Customer identifiers, balances, transaction facts, task content, preferences, tenant configuration, eval results with business data |
| Restricted | Authentication and cryptographic material | Credentials, bearer tokens, keys, PINs, OTPs, passwords, full card or account numbers, CVVs, authentication proofs, signing secrets |

6.2. Handling rules by class:

| Rule | Public | Internal | Confidential | Restricted |
| --- | --- | --- | --- | --- |
| Stored in repository | Allowed | Allowed (no secrets) | Prohibited; synthetic only | Prohibited |
| Model or vendor disclosure | Allowed | Only with a supplier register entry | Default deny; only for an enabled tenant route with approved terms, using request-local aliases | Prohibited |
| Logs, fixtures, reports, telemetry | Allowed | Allowed without secrets | Prohibited in logs, fixtures and reports; typed metrics only | Prohibited |
| Transfer | Any channel | Encrypted channel | Encrypted channel only | Encrypted channel only, within the protected flow |
| At rest | Any | Standard | Encrypted per section 2 | Managed key store only |
| Retention | None | Per owner | Per [DATA_OWNERSHIP_AND_LIFECYCLE.md](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md) | Not retained; transient buffers cleared |

6.3. Model disclosure MUST default to deny. Real-tenant model routes stay empty until the approvals in [COMPLIANCE.md](../policies/COMPLIANCE.md) rule 2 are recorded. Model input MUST use request-local aliases for accounts, and MUST NOT include tokens, principals, signing material or raw KYC.
6.4. Restricted data MUST NOT appear in logs, fixtures, eval cases, reports, documentation or model input. Fixtures MUST be synthetic and labelled.
6.5. Data-loss prevention for model and vendor egress MUST cover card numbers, CLABE and CURP, not only keyword patterns (G4).
6.6. Classification MUST be recorded on each new store in its data-ownership entry before it is enabled.

### Current implementation

| Control | Status | Evidence |
| --- | --- | --- |
| Four-class scheme in use | Planned (defined here; not yet applied to stores) | This section; [DATA_OWNERSHIP_AND_LIFECYCLE.md](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md) (retained categories table) |
| Default-deny model disclosure; synthetic routes only | Implemented (development) | [data_policy.py](../reference/SOURCE_REFERENCES.md#source-c79ca76f1746) (`DataPolicy` defaults and `authorize`); `synthetic()` routes only, with its own comment that real bindings default to no disclosure |
| Request-local account aliases before model calls | Implemented (development) | [data_policy.py](../reference/SOURCE_REFERENCES.md#source-c79ca76f1746) (`ModelProjection`); [capabilities/assistant.py](../reference/SOURCE_REFERENCES.md#source-4a066f417fc2) (around lines 478-486) |
| Restricted-data detection at input | Partial | Keyword-only heuristic: [service.py](../reference/SOURCE_REFERENCES.md#source-961ce220c26a) (lines 25-27). Does not detect card numbers, CLABE or CURP (G4) |
| No PAN or CVV stored or accepted by authority | Implemented (development) | Authority migrations and wire format (no card fields found in `authority/migrations/*.sql` or `authority/wire.go`) |
| Synthetic-only data in repository and evals | Implemented (development) | [COMPLIANCE.md](../policies/COMPLIANCE.md) rule 13; [authority/cmd/authority/main.go](../reference/SOURCE_REFERENCES.md#source-3b8945025b34) (development-only) |
| Model disclosure for OpenRouter and Gemini: no zero-retention or no-training request settings | Not implemented | [openrouter.py](../reference/SOURCE_REFERENCES.md#source-51aa789f92fe) payload (no retention or training flag; G3); [LEGAL_REGISTER.md](LEGAL_REGISTER.md) Q7 |

### Required before production

- Apply the four classes to every store and interface; add labels to data-ownership entries.
- Replace keyword-only sensitive-input checks with a tested detector and extend egress checks to CLABE and CURP (G4).
- Obtain vendor terms (no training, retention, region) and record them in [SUPPLIERS.md](SUPPLIERS.md) before any real route (G3, G10).
- Confirm the model-disclosure and bank-secrecy position with counsel ([LEGAL_REGISTER.md](LEGAL_REGISTER.md) LR-02, LR-03).

---

## 7. Retention and deletion

Annex A: 8.10 information deletion, 5.33 protection of records. Lifecycle detail: [DATA_OWNERSHIP_AND_LIFECYCLE.md](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md).

### Policy

7.1. Every store MUST declare its owner, class, retention period, legal basis and erasure path before enablement ([COMPLIANCE.md](../policies/COMPLIANCE.md) rule 7).
7.2. Retention periods MUST be set by the owner with legal confirmation and MUST NOT rely on development defaults.
7.3. Deletion MUST reach every applicable copy (summaries, indexes, caches, backups, provider state) or a documented hold MUST be recorded.
7.4. Records that must be retained under law (for example anti-money-laundering or commercial records) MUST be held under a documented hold, not under an ad hoc exception ([LEGAL_REGISTER.md](LEGAL_REGISTER.md) LR-09, Q4).
7.5. Data-subject requests (access, rectification, cancellation, opposition) MUST be supported for each personal-data store, or the gap MUST be recorded as a risk ([COMPLIANCE.md](../policies/COMPLIANCE.md) rule 8).

### Current implementation

| Control | Status | Evidence |
| --- | --- | --- |
| Development defaults: task content 24 h (max 168 h); replay markers 30 days | Implemented (development) | [settings.py](../reference/SOURCE_REFERENCES.md#source-df0681319dea) (lines 42-43) |
| Preference retention 90 days | Implemented (development) | [data_policy.py](../reference/SOURCE_REFERENCES.md#source-c79ca76f1746) (`preference_retention_days`) |
| Scheduled cleanup and lifecycle roles | Implemented (development) | [18b863f34d8c migration](../reference/SOURCE_REFERENCES.md#source-e3718bffbef2) (lines 28-38); [api.py](../reference/SOURCE_REFERENCES.md#source-d71d552c10eb) |
| Authority operation content erased after 24 h; minimal recovery record kept | Implemented (development) | [authority/retention.go](../reference/SOURCE_REFERENCES.md#source-cb788e2f1aa4) (line 11, cleanup at lines 70-84) |
| Authority mandate history, nonces and controls retained indefinitely | Partial. Gap G6 | [authority/migrations](../reference/SOURCE_REFERENCES.md#source-a53ae59a054a); [AUTHORITY.md](../contracts/AUTHORITY.md) |
| Data-subject access, export and full erasure workflow | Not implemented (G5). Only deletion of the balance-account preference is exposed | [api.py](../reference/SOURCE_REFERENCES.md#source-d71d552c10eb) (around lines 367-370) |
| Backup erasure and deletion propagation to backups and providers | Not implemented | [DATA_OWNERSHIP_AND_LIFECYCLE.md](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md) (not yet implemented list) |
| Production retention periods and legal holds selected | Not implemented (G6) | [LEGAL_REGISTER.md](LEGAL_REGISTER.md) Q4 |

### Required before production

- Select production retention periods per category, with counsel confirmation of minimums and the conflict with the 24 h operation erasure (G6, Q4).
- Implement the data-subject request workflow for each personal-data store (G5).
- Implement backup retention with deletion-marker replay before restore (DATA_OWNERSHIP_AND_LIFECYCLE).

---

## 8. Cloud services

Annex A: 5.23 information security for use of cloud services. Extension: ISO/IEC 27017 (cloud security controls for cloud service customers and providers).

### Policy

8.1. Each cloud deployment MUST have a written shared-responsibility table before data is placed in it.
8.2. Cloud accounts and regions MUST be documented, and data residency MUST match the legal register ([LR-03](LEGAL_REGISTER.md)).
8.3. Cloud resources MUST be created by infrastructure-as-code reviewed under section 3.
8.4. Cloud logging, key management and backup configuration MUST be owned and reviewed as specified in sections 2, 5 and 7.

### Shared-responsibility table (planned; nothing deployed)

| Layer | Tenant bank (AWS account owner, to confirm) | Organization (engine operator) | AI and other providers |
| --- | --- | --- | --- |
| Physical and facility security | AWS | AWS | Provider-managed |
| Hypervisor and managed service patching (EKS, Aurora, S3) | AWS | Configuration and version choice | Provider-managed |
| AWS account, IAM, organization guardrails | Tenant (to confirm) | Role design and access requests | Not applicable |
| KMS keys and key policies | Tenant (to confirm) | Key usage design; custody roles (section 2) | Not applicable |
| Engine application, authority, RLS and migrations | Not applicable | Owner | Not applicable |
| Secrets Manager entries | Tenant (to confirm) | Names, rotation design | Not applicable |
| Backups and restore tests | Tenant (to confirm) | Retention design and restore evidence | Not applicable |
| Logging and audit storage | Tenant (to confirm) | Event design (section 5) | Vendor telemetry only if approved |
| Model and browser provider data handling | Not applicable | Route approval and minimization (section 6) | Google, OpenRouter, Bedrock AgentCore (us-east-1); contract and terms pending (G3, G10) |

### Current implementation

| Control | Status | Evidence |
| --- | --- | --- |
| Shared-responsibility table | Planned | This section |
| AWS production hosting (EKS, Aurora, S3, KMS, Secrets Manager) | Planned | [PROJECT_CONTEXT.md](../product/PROJECT_CONTEXT.md) (planned components); [SUPPLIERS.md](SUPPLIERS.md) |
| Local development Postgres bound to loopback | Implemented (development) | [compose.yaml](../reference/SOURCE_REFERENCES.md#source-facaded51b7d) (`127.0.0.1:55487`) |
| Cloud provider and region register with data terms | Not implemented | [SUPPLIERS.md](SUPPLIERS.md) (to be completed; G10) |
| Infrastructure-as-code for cloud resources | Not implemented | No infrastructure definitions in repository |

### Required before production

- Confirm the AWS account owner, region and the CNBV filing coverage for each service before any real data flows ([LEGAL_REGISTER.md](LEGAL_REGISTER.md) LR-03, Q2).
- Complete the shared-responsibility table with named owners.

---

## 9. Endpoints, remote working and acceptable use

Annex A: 8.1 user endpoint devices, 6.7 remote working, 5.10 acceptable use of information and assets, 7.7 clear desk and clear screen. Related: 8.7 malware protection (CI runners).

### Policy

9.1. Customer data (any class above Internal) MUST NOT be stored on developer workstations or in local databases. Local work uses synthetic data.
9.2. Secrets MUST be kept in ignored `.env` files or a secret manager, never committed. Templates use `.env.example` with placeholders only.
9.3. Developer workstations that access the repository, CI or cloud MUST have full-disk encryption, automatic screen lock, endpoint protection and current operating-system patches.
9.4. Remote access to repository and cloud MUST use approved, authenticated and encrypted paths.
9.5. An acceptable-use statement for company systems and AI coding assistants MUST be acknowledged by each person with access, and the acknowledgment kept by the Management system owner.
9.6. Local runtime key files and generated secrets MUST stay in ignored directories and MUST NOT be shared outside the workstation.

### Current implementation

| Control | Status | Evidence |
| --- | --- | --- |
| Secret and runtime files git-ignored | Implemented (development) | [.gitignore](../reference/SOURCE_REFERENCES.md#source-bc37d034bad5) (`.env`, `.env.*` except `.env.example`, `.runtime/`) |
| Environment template with placeholders | Implemented (development) | [.env.example](../reference/SOURCE_REFERENCES.md#source-a3046da0d15a) |
| Local key file in ignored runtime directory | Implemented (development) | [protected.py](../reference/SOURCE_REFERENCES.md#source-5f7581f679f7) and `.runtime/` in [.gitignore](../reference/SOURCE_REFERENCES.md#source-bc37d034bad5) (G1) |
| Developer disk encryption, screen lock, endpoint protection | Not implemented | No evidence (G14) |
| Acceptable-use statement and acknowledgments | Not implemented | No evidence (G14) |
| Remote-working standard | Not implemented | No evidence (G14) |
| Clear desk and clear screen | Not implemented | No evidence (G14) |

### Required before production

- Adopt an endpoint standard for developer machines (items 9.3, 9.4) and record compliance per person.
- Publish and collect the acceptable-use acknowledgment, including AI coding assistant rules.
- Keep customer data out of workstations and enforce it in onboarding (section 6).

---

## 10. Third-party website access by the agent browser

Annex A: 5.14 information transfer, 5.31 legal requirements, 8.26 application security requirements. Rules: [COMPLIANCE.md](../policies/COMPLIANCE.md) rule 12. Legal position: [LR-13](LEGAL_REGISTER.md) and Q5.

### Policy

10.1. The agent browser MUST reach only allowlisted HTTPS destinations on port 443 from a reviewed allowlist.
10.2. The browser MUST block login, checkout, cart, payment, logout, OAuth, redirect and state-changing paths.
10.3. The browser MUST NOT use cookies, stored credentials or a host profile, and MUST NOT run page-authored scripts.
10.4. Non-public destination addresses MUST be rejected.
10.5. The agent MUST identify itself honestly to third-party sites.
10.6. Before real users can use a destination, the team MUST check robots.txt and site terms and record a legal opinion ([LR-13](LEGAL_REGISTER.md), Q5).
10.7. A destination MUST be added to the allowlist only with its recorded legal opinion and tenant approval where required.

### Current implementation

| Control | Status | Evidence |
| --- | --- | --- |
| HTTPS, port 443, no userinfo or fragment, bounded input length | Implemented (development) | [authority/browser.go](../reference/SOURCE_REFERENCES.md#source-a05dccdc02d8) (line 16); [browser/models.py](../reference/SOURCE_REFERENCES.md#source-4d0a6d80bdf0) (line 55) |
| Forbidden path patterns (login, checkout, cart, payment, OAuth, redirect, logout, state-changing actions) | Implemented (development) | [authority/browser.go](../reference/SOURCE_REFERENCES.md#source-a05dccdc02d8) (line 12); [browser/models.py](../reference/SOURCE_REFERENCES.md#source-4d0a6d80bdf0) (line 64) |
| Non-global IP rejection | Implemented (development) | [browser/runtime.py](../reference/SOURCE_REFERENCES.md#source-bba452854a7a) (line 142) |
| No cookies, host profile or page scripts in the sandbox | Implemented (development) | [browser/runtime.py](../reference/SOURCE_REFERENCES.md#source-bba452854a7a) (module description, line 3; line 249) |
| Allowlist: Mercado Libre only, in example config | Implemented (development) | [config/browser-policies.example.json](../reference/config/browser-policies.example.json) |
| Honest agent identification (user agent and disclosure) | Partial | Fetches send `User-Agent: Ideeo-Research/1.0` ([browser/runtime.py](../reference/SOURCE_REFERENCES.md#source-bba452854a7a), line 160); the agent is not declared as an AI agent or registered with sites (G11) |
| robots.txt and site-terms check in code or process | Not implemented | No robots.txt handling in repository (G11) |
| Recorded legal opinion per destination | Not implemented (LR-13 pending legal confirmation) | [LEGAL_REGISTER.md](LEGAL_REGISTER.md) LR-13, Q5 |
| Login and challenge avoidance by prompt instruction only | Partial | Prompt-level control; G11 |

### Required before production

- Record a legal opinion and robots.txt and terms review per destination before any real user reaches it (G11, Q5).
- Add honest agent identification and robots.txt enforcement to the browser runtime.
- Replace prompt-only login and challenge avoidance with code-enforced blocks and tests.

---

## Change history

| Version | Date | Change |
| --- | --- | --- |
| Draft | 2026-10-23 | Initial draft prepared with AI assistance from repository evidence; pending human review |
