> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# ADR-015: Bounded OpenMausBot browser-worker trial

| Field | Value |
| --- | --- |
| Status | Scoped development trial authorized; adoption and independent acceptance pending |
| Date | 16 November 2026 |
| Basis | User authorized implementation and real OpenAI tests, with Railway changes if necessary |
| Related | [ADR-013](013-browser-use-preparation.md), [service integrations](../contracts/SERVICE_INTEGRATIONS.md), [verification](../reference/development/VERIFICATION.md) |

Evaluate OpenMausBot as an explicitly selected `openmaus` backend for synthetic
public research. The default remains `browser_use`; this trial does not supersede
ADR-013 or qualify a real tenant. A successful standalone demo is insufficient:
the authenticated engine must retain authority, budgets, cancellation and source
verification while the upstream application runs its native agent loop.

Pin upstream commit `263d9b79b1164510718994d65dd678f266a61b3e`, the Windows/Linux x64
agent-browser artifact and Chromium. Launch an isolated disposable application
home in an engine-owned process tree. A version-specific preload adapter connects
the upstream model transport and MCP browser calls to the engine. The engine keeps
the OpenAI key, checks each inference/action, and captures source observations for
its existing assessor. Neither upstream idle status nor the agent's answer proves
goal completion. No upstream source fork or replacement navigation loop is added.

This seam uses upstream internal interfaces and needs requalification on upgrade.
The implementation supports one Windows or Linux x64 worker owner, synthetic authority,
public text and OpenAI only. Screenshots, authenticated sites, arbitrary JavaScript,
uploads, bank operations and real-customer disclosure remain unavailable. Known
commitment controls are denied, but this is not a general proof that arbitrary
website interactions have no effects. Correction restarts the disposable agent;
the durable goal, sources and spent budgets survive. Linux uses an owner-pipe
supervisor with child-subreaper adoption and PID handles: native daemons can leave
the worker process group, so group termination alone is insufficient. The pinned
Linux image is `deployment/openmaus/Dockerfile`. Installing it does not select
the backend for a tenant or provision its Temporal scheduler. Distributed ownership
and comprehensive crash recovery remain unqualified.

The user subsequently authorized connecting the trial to the adjacent Ideeo-AI
development deployments. That connection uses the PayMe tenant's explicit
synthetic sandbox permission, the shared API/worker process, a private persistent
development Temporal service, authenticated edge routes and SDK task controls.
It does not extend the trial to native bank callers, WhatsApp or real customers.
Before replacing the single owner, drain its tasks; zero rollout overlap is not
a distributed ownership protocol. The deployment wiring and observed failures
remain separately recorded in the verification index.

The connected deployment places that sole API/worker owner on a private Railway
VM, with the existing engine service acting as its ingress proxy. Ordinary
container runs failed to capture sources; the VM separately demonstrated an
unprivileged Chromium launch with its sandbox enabled. VM placement must match
the database region: a cross-region candidate introduced unacceptable API
latency. This is a development hosting choice under the authorized trial, not
a production availability or distributed-worker decision. Runtime settings and
supervision are explicit; sandbox lifecycle and configuration synchronization
remain operator responsibilities.

Public observations permit credential words embedded in hyphenated protocol
identifiers (for example `Sec-Private-State-Token-Lifetime`), while assigned
credential headers, secret values and protected object keys remain rejected.
This narrower rule applies to browser model payloads and public source fields in
assessment/selection; customer input and other model context retain the strict rule.

The trial's acceptance decision must use repeated Doctoralia runs, untuned tasks,
engine control checks, actual source attribution and total inference/time costs.
Preserve failed observations. Passing a task does not grant independent acceptance
or production approval. Stop expanding the integration if the bounded trial does
not establish an advantage; retain the existing backend.

Affected register entries are LR-01, LR-03, LR-05, LR-12, LR-13 and LR-17.
Relevant ISO/IEC 27001 controls include 5.15–5.18 (access), 5.19–5.23 (suppliers),
5.31/5.34 (legal/privacy), 8.10 (deletion), 8.15–8.16 (logging/monitoring) and
8.26/8.29 (application security/testing). ISO/IEC 42001 impact, data and lifecycle
evaluation controls apply. Legal confirmation, vendor approval and certification
are not established by this synthetic development trial.
