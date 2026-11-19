> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Engine user experience rules

This is the canonical intended UX for the conversational engine and its customer-facing task interactions. It covers questions, proposals, approval, progress, recovery, account connection, audio and customer-service administration. These product rules were recorded 3 November 2026; implementation and independent acceptance remain separate. Apps/SDKs and tenant channels render this experience under their [existing ownership](../decisions/011-tenant-api-and-channel-ownership.md). Current behavior and evidence remain in [background tasks](../contracts/BACKGROUND_TASKS.md) and [verification](../reference/development/VERIFICATION.md).

The [service integration contract](../contracts/SERVICE_INTEGRATIONS.md) separately owns provider capabilities, execution routes, technical requirements and qualification. Customer experience rules apply across providers; a provider document adds its own specifics without duplicating this policy.

Recover transient internal failures within the same authorized task when a
qualified, bounded recovery path exists. Successful recovery should not require
the customer to repeat the request or expose an intermediate failure. If recovery
is exhausted, report the resulting state honestly. Recovery never repeats an
uncertain external effect; provider-specific inference rules live in the
[provider contract](../contracts/PROVIDER_PROFILE.md#automatic-failover-for-stateless-tenant-profiles).

## Customer interaction

Interpret each turn against its relevant assignment: answer, clarify, execute,
revise, report progress or stop. A follow-up explanation or summary does not by
itself request another tool call. Preserve separate goals across topic changes;
explicit corrections replace the affected constraint. Ask only when an unknown
would materially change the next useful action, and never infer the customer's
location from the tool's supported geography. Resolve ambiguous task references
before controls. Report limitations and next steps specific to the current goal.

Make ordinary conversation welcoming and natural within the tenant's configured
style. Match detail to the request: brief greetings, complete explanations and
useful examples when needed. Avoid repetitive introductions, automatic tool
inventories and generic disclaimers. Use permitted earlier assistant wording to
revise or repeat a draft without asking the customer to paste it again. Prior
wording is not source evidence, a current capability guarantee or permission to
act. Do not claim to remember text that is no longer available.

A turn can contain an operative change and a question. Execute the change before
acknowledging it, then report the observed state. If the task finishes during
planning, explain that the change was not applied; do not silently restart it.
An incomplete answer to a clarification leaves that requirement unresolved.
Stopping blocks further actions immediately after the control is committed.
Acknowledge a requested stop while physical cleanup is pending; report cancellation
as complete only after the task owner confirms cleanup. Apply all requested task
controls before spending time on an explanatory answer.

Keep source facts, customer preferences, attempted work and verified outcomes
distinct. Retain permitted partial observations through execution failures;
recovery must not require the customer to restate known constraints. Present
concise relevant evidence with its source, while keeping detailed observations
available separately. No browser completion signal establishes goal fulfilment.

A focused question may quote a retained public observation before candidate or
criterion assessment finishes. Identify its actual source and observation time;
an earlier observation is not a current price or availability guarantee. Use only
the source's established entity association; otherwise describe page-level
context. Retained facts remain inspectable after a correction, explicitly marked
as predating that change, without claiming the revised goal is satisfied. Keep
quotes and citations together, report omitted detail, and explain when missing
text requires revisiting the source. Current disclosure authorization still applies.

For factual follow-ups, answer the requested facts first and group exact excerpts
under their source and observation time. Include labels needed to interpret a
value or product variant. Offer recovery when relevant information is actually
missing; a request to state unknowns does not itself imply a failed search.
Avoid unrelated booking or purchase disclaimers in a factual answer. A useful
research result may be complete as an investigation while explicitly leaving
subjective guarantees or unavailable facts unverified.
Use concise, source-attributed summaries in the customer's language when useful;
keep their exact supporting excerpts available for inspection. A paraphrase must
preserve qualifications, product variants and uncertainty. It does not become
new source evidence or authority to act.

1. **Prepare with minimal questions.** Use the customer's explicit request, permitted context and attributed preferences to prepare a useful proposal. Ask only for essential missing information or genuine ambiguity. Preferences guide preparation; they never grant permission or prove current availability.
2. **Resolve addresses in order.** Prefer the explicitly requested address, then an unambiguous contextual match, then a permitted saved default or most-used address. Match against saved labels and address details before creating a new entry. An explicit address that does not match must not silently become the default. Never invent a ride destination. Offer a short list of saved choices plus another address when clarification or a change is needed.
3. **Prepare a complete proposal.** For orders show merchant, delivery address/instructions, items, quantities, modifiers, substitutions, payment method label and itemized total/currency, including delivery, service, tip and discounts. For rides show origin, destination, ride type, pickup/arrival estimates, scheduled time where applicable, cancellation terms, payment label and fare. For bookings show provider, service, location, date/time with timezone, party size or duration, price/deposit and cancellation terms. Mark estimates and unknown values explicitly.
4. **Approve, Change, Cancel.** When current policy requires customer approval, present these three actions and explain their consequences. Change revises the same task and returns a new proposal; Cancel before submission prevents commitment. An authorized mandate may permit autonomous actions within its exact limits; the card does not impose approval on every A2/A3 action. A conversational or spoken "yes" is not a protected approval.
5. **Bind approval to current terms.** Approval identifies the task, proposal revision, resource, amount/currency and material terms. Changes to items, substitutions, address, service, time, cancellation terms or price invalidate the old approval as applicable. Expired quotes are re-read. Reject stale or already-consumed decisions and disable their controls. A prepared cart, saved card or connected session is not approval.
6. **Keep the conversation available.** Acknowledge accepted work promptly, show meaningful progress and allow other conversation while background work waits. Correlate answers, changes and cancellation with the exact task/question revision. Avoid duplicate acknowledgements and invented progress. Courtesy replies do not create new tasks or effects. A malformed optional answer must not discard an independently valid public-task correction or cancellation. Show saved filters separately from source verification; while a change awaits compilation, identify prior filters and the pending customer change without claiming the old value is the new accepted value.
7. **Pause and resume honestly.** A waiting customer, expired question or disconnected transport does not establish failure or cancellation. Show a paused/waiting state when supported by the task contract. On authorized resume, recheck access and refresh affected prices/availability; replace stale questions/proposals. Display a countdown from the source deadline, while the authoritative lifecycle decides expiration. Follow-up work after completion gets a linked new task.
8. **Report evidence-backed outcomes.** Distinguish proposal ready, submitted, confirmed, completed service, cancelled, failed and outcome uncertain. Submission is not provider confirmation; booking confirmation is not service delivery. Record provider references and confirmed terms. After uncertain submission, reconcile the provider before attempting another effect; never turn a timeout into "nothing happened." Cancellation after submission may have a fee or uncertain outcome and requires its own evidence.
9. **Present through the concierge.** Executors return typed observations, questions and evidence to the engine's presenter. Consumers preserve the resulting approved customer text, line breaks and actionable links without another model rewriting it. Render structured choices as controls; do not expose raw executor payloads, private reasoning or secret fields. Preserve the [coordinator/presentation boundary](../contracts/AGENT_COORDINATION.md).
10. **Track only within the assignment.** Where supported, provide a safe tracking link and meaningful provider-status changes. Deduplicate updates and preserve ordering; avoid notifications for every ETA fluctuation. Tracking stops at the authorized deadline, terminal outcome, cancellation or loss of authority. Do not imply delivery or completion from an earlier confirmation.

For interactive banking, [ADR-010](../decisions/010-app-host-banking-and-model-context.md) still requires protected host screens and excludes balance/history from chat and model context. Concierge service proposals do not move bank authentication or money screens into ordinary chat.

When execution is unavailable and the customer receives a provider link, say which fields were prefilled and which choices still require review in the provider. Preparing a link is a completed handoff, not a booked service. Never infer price, schedule, payment or provider confirmation from link delivery. Location links use customer/tenant-selected coordinates; an address label alone does not establish a point. See the [Uber handoff contract](../contracts/SERVICE_INTEGRATIONS.md#prefilled-customer-handoff).

Discovery shows attributed source options and reports search completion separately from contacting or booking a business. Render supplier summaries as untrusted text with their required typed source links; preserve citation associations without an unqualified model rewrite. Ask for a missing search area rather than guessing current location from language, a tenant region or server IP. See [Maps discovery](../contracts/SERVICE_INTEGRATIONS.md#development-discovery-tasks).

API estimates and availability are observations, not bookings. Show the source observation time, unknown values and whether a fare is fixed or a reservation exists. A restaurant selection includes local time/timezone and party size; the engine asks for structured selection rather than guessing it from an API key or model output. An empty search result is a completed search with no matching options. Present estimate/discovery results without an approval or checkout control; a requested purchase needs a separately supported proposal and effect flow.

## Account connection, secrets and audio

- Say "connect your account" in customer-facing guidance. Reuse a valid, authorized site session when permitted, and show clearly when reconnection or customer action is required. Closing a browser releases compute; it does not itself disconnect the account. Site expiry, revocation and tenant retention rules still apply; no session is promised to last indefinitely.
- Login, OTP, CAPTCHA, payment authentication and other secret entry use protected customer takeover or an approved protected capture channel. Secrets never enter ordinary chat, model context, transcripts or telemetry. A session proves access to that site, not authority for arbitrary purchases. Show only a permitted payment label; masked labels do not authorize PAN/CVV handling.
- Isolate sessions by verified tenant, membership, provider and task access. Serialize access to a shared customer/provider session; preserve other in-use tasks when releasing a browser. Vault and erasure requirements follow [data ownership](DATA_OWNERSHIP_AND_LIFECYCLE.md).
- Optional voice notes accompany the same approved text when explicitly requested and enabled for the tenant/channel. Agent voice selection is trusted configuration. Urgent connection, verification and approval messages must not wait for speech generation. Bound generation time and fall back to text; use approved temporary media delivery/expiry. Voice notes never expose codes, credentials or card data and never replace visual approval. Live voice remains governed by [ADR-004](../decisions/004-voice-channel-and-speech-providers.md).

## Customer administration and personalization

Future customer-service administration uses the existing [administration roles](../contracts/ADMINISTRATION.md), with tenant/member isolation and audited access. A customer view may show task timeline, attributed preferences, addresses, common orders/routes, bookings and confirmed spending; aggregate views may show conversion, recency/frequency, abandonment and category/provider activity. Distinguish real executed activity from simulated tasks, drafts, failures, reversals and cancellations. Never count drafts or test missions as real spend or completed service.

Mask contact details by default and audit authorized reveal. A phone number is a contact/search attribute, not a global identity key or proof of membership. Show provenance and allow correction/deletion of retained preferences. Empty sections say that evidence is missing; they do not invent conclusions. Customer-facing transcripts and sanitized inference context remain separate.

AI profile summaries require an approved purpose and profiling consent; marketing requires separate explicit opt-in and immediate opt-out. Without that permission, expose only authorized operational history and omit AI profiling/campaign use. Minimize summary inputs; exclude secrets, full contact identifiers, payment details and unapproved sensitive data. Report insufficient evidence and confidence rather than inventing habits, prices or propensity scores. Retention, access, erasure and suppression follow the existing data-lifecycle contract; this document creates no new store or retention period. Playground simulations are visibly marked and cannot trigger real execution through a production switch.

## Governance and adoption

For the continuing-assistant design, follow [ADR-014](../decisions/014-persistent-assistant-context.md).
Distinguish documented behavior, observed runtime state and unknown internals in
security/self-knowledge answers. Memory inspection distinguishes stated and
inferred preferences, intentions and source-confirmed outcomes, with provenance
and supported correction/deletion controls. Activity views show observed action
facts and sources; protected input and raw model reasoning remain private.
Do not promise an export, reset or ongoing assignment beyond implemented
lifecycle/authorization support. This direction does not add native controls
or enable general inferred-memory writes.

Apply [COMPLIANCE.md](../policies/COMPLIANCE.md), the [data-lifecycle contract](DATA_OWNERSHIP_AND_LIFECYCLE.md) and the [service compliance requirements](../contracts/SERVICE_INTEGRATIONS.md#compliance-and-adoption). These rules do not grant tools, autonomy, provider access or real-data processing. The host/tenant retains protected authentication and banking presentation; current authority and evidence govern what the concierge can offer or claim.
