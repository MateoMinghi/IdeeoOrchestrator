> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Proposed service-task contract for SDK and app adoption

This contract proposes the customer integration for [service tasks](SERVICE_INTEGRATIONS.md), requested 4 November 2026. Native apps/SDK binaries and tenant channel delivery remain externally owned under [ADR-011](../decisions/011-tenant-api-and-channel-ownership.md). The engine implements the endpoints explicitly labelled current below; lifecycle extensions remain proposed until their generated schemas and verification establish support. Follow [UX](../product/UX.md) for interaction rules and [host banking](HOST_BANKING.md) for protected banking. This document does not enable a provider, payment method or production deployment.

## Identity, transport and correlation

Use the existing authenticated `/v2` engine connection and tenant-approved customer proof. Identity comes from the verified tenant, membership, client, agent account and grant; a body field cannot select another principal, route or credential. Use `Idempotency-Key` for creation and reuse it for transport retries with the same body. Correlate `conversation_id`, `task_id` and server `revision`; a changed request needs an explicit correction or a new key. Every read, command and sensitive presentation rechecks current access. A connection loss does not cancel work or authorize a retry of a provider effect.

| Current endpoint | Consumer behavior |
| --- | --- |
| `POST /v2/turns` | Send the customer's request in its conversation; retain returned background task IDs. |
| `POST /v2/service-tasks` | Explicit creation alternative; send the provider/goal and supported structured selections. A 202 acknowledges task creation, not a booking. |
| `GET /v2/service-tasks/{task_id}` | Fetch the current `ServiceView` and render its message, typed evidence, required input and offered controls. |
| `GET /v2/background-tasks` and `GET /v2/background-tasks/{task_id}` | List/recover owned work using the background contract's filters and cursor. |
| `GET /v2/background-tasks/{task_id}/events` | Read authenticated control-state SSE with the existing `Last-Event-ID` contract; refetch the protected view for details. |
| `POST /v2/service-tasks/{task_id}/commands` | Send an offered action with `expected_revision`; stale revision requires refetch and customer review. |
| `POST /v2/service-tasks/{task_id}/approval` | Request the transient protected presentation for the displayed revision and proposal digest. |
| `GET /v2/service-tasks/{task_id}/browser` and `POST /v2/service-tasks/{task_id}/browser-actions` | Protected customer takeover interfaces; these are authenticated screenshots/actions, not a public browser streaming URL. |

Machine schemas in [OpenAPI](openapi.json) are the implemented wire authority. Support additive optional fields and unknown presentation extensions without interpreting them as executable instructions. No secret or access token belongs in a URL, analytics event or ordinary transcript. Preserve the concierge's message and typed links without another model rewriting them. Source text is untrusted display data.

## Versioning and adoption boundary

Keep this proposed consumer contract separate from the implemented `/v2` wire version. An incompatible command, required field or state interpretation needs an explicitly versioned contract; optional display additions may be additive. Unknown controls or states must produce an unsupported/update-required presentation and a protected refresh, never a guessed effect. A task's revision orders its controls; it is not a contract version.

For initial adoption, provision the engine origin, authenticated client identity and supported schema version through trusted tenant configuration. The proposed capability descriptor identifies the provider, permitted preparation/execution/cancellation/refund/tracking operations and supported protected-presentation modes. It describes current availability for this tenant and client, not a global promise of provider support or a replacement for task authorization. No capability-discovery endpoint is implemented by this proposal; until one is qualified, use the deployed contract and task-returned controls. Recheck task controls after reconnect, authentication changes and each mutation.

| Owner | Integration responsibility |
| --- | --- |
| Engine | Authenticated tasks, current authority checks, source normalization, proposal/revision binding, durable recovery and permitted customer projection. |
| Tenant backend | Verified identity/channel ingress, approved provider/account connections, protected authentication/approval and its bank/core adapters. |
| SDK | Authenticated transport, task/event correlation, protected host routing, transient presentation and clearing session-bound state. |
| App | Native cards and question inputs, protected screens, accessibility, foreground/background lifecycle and notification routing. |

These responsibilities describe logical ownership; co-locating a component does not transfer its trust or authority. Provider credentials and browser profiles remain behind the engine's trusted connection/executor interfaces, never in a model-facing SDK tool argument. An eventual connection-management contract must expose opaque, customer-bound references and revocation status, with its own approved enrollment flow; this document does not introduce a credential-upload endpoint.

## Questions, proposal and protected approval

The registered `uber_rider` route additionally asks for explicit `ride_order: {product_id, payment_option_id, timing: immediate}` plus `ride_locations`. `required_input: ride_order` and `ride_options` supply source product choices and scoped payment-option aliases/labels. Submit the customer's structured choice via a revision-bound answer. Product discovery alone is not availability; the engine still obtains an upfront fare. The SDK never receives the provider payment reference, OAuth credential or provider subject, and cannot select a default card or invent an immediate/scheduled choice. This route supports immediate trips only; actual native choice controls and connection enrollment remain externally owned.

`ServiceView.required_input` selects a structured customer interaction. Current `ride_locations` supplies both customer-selected coordinate pairs; labels do not geocode. `booking_search` supplies an approved restaurant ID, future local date/time with offset and party size. `search_location` accepts a task-bound textual clarification. Submit via `answer` with the displayed revision. A new question/revision invalidates old controls. The SDK does not infer missing selections, quote amounts or payment methods.

Render a proposal from the exact typed quote/terms, digest, revision and deadline. Show amounts/currency, material terms and source observation time; unknown price is explicit and never zero. Offer only `customer_controls` returned by the engine. Discovery/estimate/preparation-only results cannot display Approve or imply a committed service. Corrections invalidate affected approvals and refresh current terms through the engine.

A reviewed [native browser checkout](SERVICE_INTEGRATIONS.md#native-browser-checkout) uses these same proposal/approval/task endpoints. It does not add SDK selectors, browser scripting or native payload arguments. Its opaque `provider_binding_digest` binds executor-private source terms; show the visible payment label, never the private provider payment reference. The first acknowledged POST projects `submitted`; source reconciliation establishes later states. No actual provider profile is qualified by this development mechanism.

For an offered approval, send `expected_revision` and `proposal_digest` to `/approval`. Open the returned tenant-approved `secure_link`, or pass the opaque `host_intent` to the tenant's protected host handler. Protected authentication and owner signing belong there. An engine `AuthorityDecision` is not a native biometric implementation. After independent approval, submit `commands/approve` with the same revision/digest and the protected `approval_reference`; possession or chat text alone is insufficient. Never retain the protected presentation in ordinary history or model context. On expiry, changed terms, rejected approval or conflict, refetch and request a fresh proposal/presentation.

## Connection, takeover and provider handoff

On `needs_connection`, offer the engine's supported takeover route. `takeover` transfers control and agent actions stop; `return_control` requires current ownership and authority. Login/OTP values travel only through protected customer input, not `/turns`. Screenshots and secret values are not analytics or transcript content. A production live-view transport, encrypted profile connection/revocation flow and native embedded browser remain separate contracts to qualify; current screenshot endpoints must not be described as those completed capabilities.

For `handoff`, open only the typed provider link after the customer chooses it. Display `handoff_prefilled_fields` and `handoff_requires_confirmation`. Delivery of that link completes the handoff, not the provider service. Device link adoption needs its own native test. API-only and handoff tasks do not expose browser takeover controls.

## Post-submission lifecycle and proposed extensions

Rider `outcome.state: submitted` means the provider acknowledged processing; it is not driver acceptance or settled payment. Render the task's source state and timestamp. The opaque `quote.provider_binding_digest` is an engine/authority binding, not a customer approval token or display label. Connection renewal may offer `resume` while preserving the last trip state; resume cannot submit another ride. If the original provider ID is unknown, show uncertainty and supported recovery, never a locally inferred replacement booking.

The current opt-in development execution profile can continue source reads after confirmation. `ServiceView.outcome` carries the last provider observation, including executor `observed_at`; `in_progress` maps to task phase `tracking`. Optional `ServiceView.tracking` has `status: active | stopped | finished`, a `next_check_at` only while active, and a stop `reason`. Render these independently: a completed background assignment can retain a confirmed/in-progress service after monitoring stops. These fields do not describe payment settlement. No actual provider tracking route is qualified by this development profile.

The current `stop_tracking` command uses the task's `expected_revision` and is offered only while monitoring is active. It ends monitoring and preserves the last provider observation. It does not send provider cancellation, stop a trip/order or request a refund. Meaningful source-state changes use the existing conversation outbox; repeated observations/timestamps do not generate another notification. Fetch the protected current view after a delivery hint rather than treating its control state as a service receipt.

Keep three independent observations in the proposed lifecycle projection: provider service state, payment state and cancellation/refund state. A request acknowledgement is distinct from provider confirmation, fulfillment and payment. A cancellation acknowledgement is distinct from a cancelled order; a cancelled order is distinct from a settled refund. Each observation needs its source reference/time and current disclosure checks. The engine owns normalization and ordering; SDKs do not infer states from page text, timeouts or missing events.

Proposed lifecycle actions are `cancel_service`, `accept_cancellation_terms` and `request_refund`, separate from current pre-submission `cancel` and monitoring-only `stop_tracking`. They require task/revision binding and offered capability-specific controls. Fee-bearing/material cancellation terms need their own current proposal/approval. Refund requests bind the original provider/payment operation and permitted amount; no client may invent a refund destination. These three actions are not yet implemented wire commands. Until schemas advertise them, consumers show current supported controls or the explicit provider handoff. Never simulate success locally.

Tracking continues only within the authorized assignment/deadline. Show source-observed status and permitted tracking links; reconnect refetches current state and deduplicates event IDs. A monitoring timeout ends monitoring honestly without claiming the underlying trip/order stopped. After an uncertain submission, offer reconciliation/customer help; never create a replacement booking automatically. Native push is a wake-up hint to read the protected task, not an authority-bearing receipt. Completed follow-up work starts a linked new task.

## Adoption checks and ownership

Engine checks cover schema compatibility, owner/tenant isolation, exact revision/digest binding, stale controls, access loss, replay, missing events and absence of unsupported effects. App/SDK checks cover actual native cards, accessibility, protected host presentation, source attribution, question input, link routing, takeover rendering and reconnect after process/device loss. Tenant backends own WhatsApp/Meta ingress and delivery; they forward only verified turns and preserve task correlation. No native adoption is established by an admin-console demo.

Provider execution, card processing, real profile storage and source-content display need the [integration prerequisites](SERVICE_INTEGRATIONS.md#compliance-and-adoption). Affected legal entries include LR-01/02/03/04/11/12/13 and LR-15 if cardholder data is introduced; applicable ISO controls remain those in the service contract. This is engineering traceability, not legal or production approval.
