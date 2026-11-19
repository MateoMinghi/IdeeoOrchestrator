> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# ADR-010: App-host banking and separate model context

| Field | Value |
| --- | --- |
| Status | Confirmed product boundary; scoped engine development implementation authorized |
| Date | 2 November 2026 |
| Basis | Mateo requested this record after supplying Fer's WhatsApp decisions and voice-message transcription. The product requirements below are confirmed; event schemas, contact lifecycle and native adoption remain unresolved. Mateo subsequently explicitly requested implementation, integration-guide updates and real LLM testing on 2 November. This authorizes the scoped engine development implementation below, not production disclosure or native deployment. |
| Related | [ADR-001](001-tenant-authentication-and-delegation.md), [ADR-005](005-data-ownership-and-lifecycle.md), [product context](../product/PROJECT_CONTEXT.md), [data lifecycle](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md), [integration guide](../reference/development/INTEGRATION_GUIDE.html) |

[ADR-011](011-tenant-api-and-channel-ownership.md) additionally confirms that tenant APIs own enrollment and WhatsApp ingress. This record continues to govern the app-host banking and model-context path.

## Context and sources

The [2 November Check Up Ideeo meeting](https://fathom.video/share/jdgVw2VKNJsR6EzEzxM5w2GupRN7y_1r?timestamp=1214) raised privacy, deterministic banking handling and conversational UX. Around 20:14–25:40, Hugo questioned sending banking details through the conversation; Mateo committed to discussing a proposal before implementation.

Mateo subsequently supplied Fer's WhatsApp clarification (2 November, 13:51–14:03) and the transcription of the 14:05 voice message. Fer permits the original user message to remain visible to that customer, while sensitive fields must not persist in model context. Balance and transaction-history results belong in the app's protected screens, shown once, rather than in chat. For banking-core requests through an embedded SDK, the engine infers intent, the SDK delivers an event, and the host app owns the banking flow. These supplied communications are product evidence, not an independent legal or security approval. The earlier suggestion that names/account coordinates are inherently public is not adopted as a data classification.

## Decision

### 1. Interactive banking in an app or tenant SDK

For PayMe and other banks embedding our SDK:

```text
Customer's conversational request
  -> engine identifies intent and any missing information
  -> SDK delivers a validated, scoped request to the host app
  -> host opens the corresponding protected banking screen
  -> tenant authentication/authorization and bank backend/core
  -> customer sees the result in the host's banking experience
```

The user can give a complete instruction, then answer only necessary clarifications. The host has on-demand screens for balance, movements, transfers and other supported banking actions; "hidden" means not always displayed, not an unauthenticated endpoint. The SDK transports the request and does not execute the financial operation. The app conducts the flow, including Face ID or bank PIN where required; the bank validates and executes it.

For this path, do not have the engine query a third-party core merely to return balances, statements or transaction details to chat. The host uses its bank integration. Detecting intent or handing off a request does not mean the banking operation succeeded, and a conversational "yes" is not financial authorization. Engine access restrictions still apply; the host and bank independently validate customer, account, terms and approval.

Balance and movements are displayed **once in the protected host view** and are absent from chat messages, chat replay and model input. Another deliberate consultation is a new protected host interaction, not replay of a stored chat balance. This is a presentation requirement, not deletion of bank records. Exact reveal-consumption, navigation/backgrounding, expiry and reauthentication behavior must be specified with native integrators; no universal timer or new authentication policy is selected here.

### 2. Separate customer-visible history from model context

| Surface | Required treatment |
| --- | --- |
| Original customer message | May remain visible to that same authorized customer under the transcript's access/retention policy. It is not a credential-entry surface. |
| Initial interpretation | May process user-supplied non-secret banking details only under an approved tenant/provider disclosure policy. This product direction does not enable real data or exempt the first request from policy. |
| Subsequent model calls | Replace captured sensitive values with scoped references and minimal task state. Do not resend them through pending fields, tool results, summaries, memory, embeddings, delegated agents, prompt caches or provider continuation state. |
| Host banking results | Balance/history values stay in the host flow. Do not copy them into chat, model context, assistant-generated speech, screenshots supplied to the assistant or transcript exports. Any return status/evidence needs an explicit minimized contract. |
| Authentication and signing material | PINs, passwords, OTPs, session tokens, full card numbers, CVVs and signing credentials never enter model input or ordinary chat. |

The visible transcript must not be reused as the model prompt wholesale. Removing data from future model input does not erase the original inference request or provider logs. Provider retention, training, location and contractual prerequisites remain governed by [compliance](../policies/COMPLIANCE.md); regex is a supporting detector, not a guarantee that arbitrary text has been fully sanitized.

### 3. Contacts and deterministic resolution

Reusable recipients are structured, protected contacts rather than LLM memory. A trusted resolver obtains the exact destination for the current tenant/membership outside inference; the model works with an authorized reference and minimal workflow state, not the recovered CLABE or phone. Ambiguous names require customer selection; neither a model guess nor a matching name establishes account ownership or authority. A known contact never grants permission to transfer.

Prefer reusing a tenant-owned contact source where available. The discussion does not settle a new engine database schema, automatic saving, consent UX, retention duration or store ownership. These must be agreed before implementing a new store, with correction/deletion and isolation requirements in [data lifecycle](../product/DATA_OWNERSHIP_AND_LIFECYCLE.md#customer-transcript-model-context-and-contacts).

### 4. Preserve distinct channels and agent paths

- **WhatsApp:** use the bank-controlled protected consultation/authorization page for core banking; no bank PIN in chat. The existing link adapter is not an implementation of the native host flow. Final expiry, consumption and bank-evidence guarantees depend on the qualified bank integration.
- **Superagent tasks:** reasoning, research, browser/API/phone work remain engine capabilities. Models propose actions; trusted executors and the independent authority enforce mandates and permitted effects. "Occurs on the LLM side" does not give a model banking credentials or permission to execute money movement.
- **Another bank's AI delegating work:** remains a reasoning/task-delegation integration, with verified delegation and its own evidence/approval contract.
- **External agent using banking APIs:** remains an authority/agent-account integration under a user-approved mandate and need not invoke our brain. This decision does not remove the full A0–A3 scope or require every autonomous task to use a human app screen.

The app/SDK decision narrows the interactive banking path, not all engine-to-bank integrations. Trusted tenant backend configuration and authority contracts remain required for the other paths. Sharing a PayMe organization does not merge app, SDK, engine and core ownership.

## Alternatives and consequences

- Returning bank values to chat would contradict the host-only balance/history requirement, even with deterministic rendering and no LLM exposure.
- Forcing every field through a long separate form would lose the requested conversational UX. Protected host completion and optional compact selectors remain compatible; exact UX is not prescribed here.
- Replaying raw chat or a model-managed contact memory would repeatedly disclose banking fields. Separate transcript, operation/contact state and model projection add lifecycle and integration work.
- Direct engine banking adapters remain useful for their explicitly qualified paths; silently using them when an app host is unavailable is not an approved fallback for this flow.

## Current code and adoption boundary

Mateo authorized implementation after the documentation was merged. The [host-banking contract](../contracts/HOST_BANKING.md) now specifies and implements engine-side intent IDs, caller/session binding, one-time consume, private pending projection and optional tenant-owned contact resolution. Expiry uses the existing customer credential; consumption is atomic and precedes input delivery. No financial completion callback is accepted. Bank-only mission/read API bypasses are denied for provisioned native clients while separate agent/channel paths remain. Native screens, protected authentication/core execution, lifecycle/device acceptance and an engine-owned contact-save policy are not implemented by this repository. [Verification](../reference/development/VERIFICATION.md) records actual checks and missing reviews.

The table below preserves the baseline that motivated this change:

Source inspection at `dev` `cd45f19` established the following differences before implementation:

| Existing implementation | Remaining difference |
| --- | --- |
| `ModelProjection` aliases source accounts; `DataPolicy` gates inference. | V2 capture still sends user text and raw captured CLABE/phone/amount/reference in pending tasks. No general context-cleaning/contact-resolver path implements this decision. |
| V1 balance and generic V2 banking handlers return typed bank data with deterministic presentation. | Those development flows do not satisfy host-only, single-display balance/history behavior. Client-side hiding alone would leave values in engine results/replay. |
| `ApprovalPresentation` accepts `host_intent`; the Go authority obtains a presentation from a configured bank integration. | Its payload is opaque. There is no agreed complete native event contract or native consumer in this repository; the existing generic approval hook is not a balance/navigation protocol. |
| Core customer handoffs prepare protected URLs; generic operations implement approval permits and reconciliation. | Link preparation is not settlement or native-host adoption. Preserve their qualified scopes while specifying the new interactive path. |

Relevant source: [capture](../reference/SOURCE_REFERENCES.md#source-5b77e961975b), [coordinator](../reference/SOURCE_REFERENCES.md#source-4a066f417fc2), [projection](../reference/SOURCE_REFERENCES.md#source-c79ca76f1746), [operations](../reference/SOURCE_REFERENCES.md#source-1c6b8ba37642), [Core handoffs](../reference/SOURCE_REFERENCES.md#source-71cda7dbc395), [Go presentation port](../reference/SOURCE_REFERENCES.md#source-97f57b88a699). [Verification](../reference/development/VERIFICATION.md) remains the index for actual revision-specific evidence. Existing passing developer checks do not demonstrate this new behavior or native adoption.

## Contract and verification requirements before native adoption

The [development host contract](../contracts/HOST_BANKING.md) specifies the versioned intent vocabulary, input/reference fields, authenticated retrieval, identity/session binding, expiry and duplicate/error behavior. Native adopters must validate this contract against their trusted bridge and bank session. The words `saldo`, `movimientos` and `transferencias` in product discussion are semantic examples, not published event names. Do not treat illustrative names as an executable wire schema or grant a request execution authority merely by calling it a signed event.

Specify host completion/cancellation/unavailability and uncertain outcomes, any future minimized verified status returning to the engine (none is accepted by the current navigation protocol), and how changed terms invalidate approval. No raw balance/history return is allowed. An absent host fails as unavailable rather than falling back to chat disclosure or direct core execution. Event expiry without bank evidence does not prove that no financial effect occurred.

Verify original history remains scoped to its customer, captured values never reappear in subsequent model routes or derived context, contact lookup cannot cross tenants/memberships, balance/history stay outside chat/API replay and model context, and one protected display cannot be reopened by replaying the same event. Exercise app restart/backgrounding, session changes, duplicate/forged/expired events, denial, cancellation, changed terms and uncertain bank results with the actual native host. Preserve independent human acceptance and production gates.

Compliance review references: [legal register](../compliance/LEGAL_REGISTER.md) LR-01, LR-02, LR-03, LR-04, LR-06, LR-12 and LR-18 for personal/financial data, provider processing, bank authentication, account identifiers, retention and messaging. Target ISO/IEC 27001 controls 5.12, 5.14–5.18, 5.19–5.23, 5.34, 8.3, 8.5, 8.10–8.12, 8.15, 8.24 and 8.29; ISO/IEC 42001 A.5.2–5.4, A.6.2.2–6.2.4, A.6.2.7–6.2.8 and A.7.3–7.5. These name review obligations; legal confirmation, risk acceptance, certification and real-data approval are not supplied by this ADR.
