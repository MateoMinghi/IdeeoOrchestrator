> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# ADR-012: Browser execution lifecycle before isolated compute

| Field | Value |
| --- | --- |
| Status | Scoped development implementation authorized; production acceptance pending |
| Date | 7 November 2026 |
| Basis | Mateo authorized the five pre-VM foundations: generation-bound browser lifecycle, bounded recovery/takeover, replaceable execution environments, browser artifact qualification and synthetic vault-backed connection lifecycle. He requested architecture/ADR updates and real OpenAI engine tests under the documented UX. |
| Related | [Rev4 §5](../product/architecture/arquitectura-motor-agentes-rev4.html#computadoras), [ADR-005](005-data-ownership-and-lifecycle.md), [ADR-007](007-inference-reuse-and-cache-boundaries.md), [ADR-008](008-partition-consistency-and-availability.md), [service integrations](../contracts/SERVICE_INTEGRATIONS.md), [UX](../product/UX.md) |

## Decision

Keep reasoning, durable tasks and independent authority outside replaceable browser execution environments. Implement the local development backend behind an engine-owned environment lifecycle; it is not VM isolation or a production credential boundary. Preserve Rev4's disposable microVM per task and separately encrypted tenant/member/provider connection target. Do not adopt persistent computers per bot, cross-member shared profiles or model-controlled credentials from reference products.

Browser lifecycle and provider/task outcomes are separate facts. Every provisioned environment receives a fresh opaque generation. An agent preparatory action must bind both the generation and the observation revision; replacing an environment invalidates every earlier action reference even when revision numbers coincide. Session ownership and capacity remain held until teardown is confirmed. Queue waits and execution are bounded; cancellation or timeout stops subsequent egress and marks the environment interrupted. A cancelled request does not prove that work stopped or that an external effect did not happen.

Recovery revalidates current task control and authority, waits for or destroys the previous environment, then observes a replacement. It never repeats a provider commitment: durable attempt markers, exact operation identity and source reconciliation remain authoritative. A browser that cannot be safely stopped cannot be replaced by a competing writer. Human takeover blocks agent work and disclosure of protected input; handback requires fresh observation. Native consumers remain externally owned; no automatic handback or new customer approval policy is adopted.

Bind qualification to the actual browser artifact and launch profile as well as existing Python release evidence. A digest is local artifact evidence, not signed OS/container attestation or real-site qualification. Connection import/export, refresh, revocation and erasure belong behind the authority-owned session port; the pre-VM implementation exercises synthetic data only. Secrets never enter task/model/telemetry state. Closing compute does not revoke a saved connection; revocation prevents future restoration. Preserve single-writer and version checks during save and deletion.

Keep the current single browser owner. This decision does not implement Redis routing/fencing, qualify a new browser driver, enable real sites/accounts, introduce executable skills or provision/deploy VMs. Operational settings and actual evidence belong in [setup](../reference/SOURCE_REFERENCES.md#source-8f929a906ccd) and [verification](../reference/development/VERIFICATION.md).

[ADR-013](013-browser-use-preparation.md) subsequently authorizes a bounded
Browser Use observation adapter behind this owner. It preserves these lifecycle,
authority and real-route isolation requirements; it does not qualify a VM backend.

## Alternatives and consequences

Allocate and retain an addressable environment handle before physical startup.
Partial startup failure still owns cleanup, capacity and any connection writer;
absence of a completed launch is not proof of disposal. The environment port's
`provision` returns an unstarted handle and `start` performs physical work only
after retention. Uncertain driver shutdown remains fenced for operator recovery.

The shared controller bounds its own RPC queue, not just the backend queue.
Disposal interrupts the backend before waiting for the active RPC to settle;
queued/authorizing calls recheck the closing owner before physical work. Cleanup
attempts are isolated per task so one failed environment cannot starve others.

The local backend accepts synthetic routes only. It rejects a real browser route
before account-state resolution or process launch, even if an artifact digest and
site enablement flags match. Backend suitability is checked through the environment
port before credentials are read. A real route needs a separately qualified isolated
backend; artifact identity cannot substitute for the Rev4 isolation boundary.

The scoped [authority session port](../contracts/AUTHORITY.md#synthetic-browser-session-vault)
uses a separate forced-RLS authority table, encrypted state and revision checks.
Only synthetic trusted profiles can opt in. Proof/mandate expiry bounds the
connection; refresh cannot renew it. Closing compute can save refreshed state,
then releases the writer after confirmed disposal. Revocation erases the payload
without releasing a live writer. Process loss remains blocked for verified
operator recovery; automatic lease stealing and production KMS/retention/provider
logout are not adopted by this increment. The existing operator file remains an
explicit alternative, with no fallback from a configured vault.

- Reusing a revision counter after restart permits a stale action to target a replacement browser; an explicit generation prevents that ambiguity.
- Releasing ownership when a caller times out permits two physical writers. Retaining ownership until confirmed teardown can reduce availability, consistent with accepted ADR-008.
- Keeping live browser state as the durable task source couples recovery to one process. Retain durable assignments and effect evidence separately and reconcile the external source.
- Adopting a whole external harness or driver would change authority/tool boundaries without evidence of better qualified journeys. Adapt lifecycle and adversarial test patterns under our existing ports.

Compliance impact: legal-register LR-01/03/04/05/12/13/15; target ISO/IEC 27001 controls 5.15–5.18, 5.23, 5.34, 8.3, 8.5, 8.10–8.12, 8.20–8.24, 8.26, 8.28 and 8.29; ISO/IEC 42001 A.5, A.6.2, A.7–A.9. These are engineering obligations, not legal approval or certification. Existing real-data, provider, funding and independent human acceptance gates remain in force.
