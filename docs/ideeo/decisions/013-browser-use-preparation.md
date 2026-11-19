> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# ADR-013: Upstream Browser Use Agent as the browser worker

| Field | Value |
| --- | --- |
| Status | Scoped development implementation authorized; independent acceptance pending |
| Date | 8 November 2026; revised 9 November for upstream adoption, 13 November for qualified operations, and 14 November for useful general public browsing |
| Basis | Use Browser Use as an upstream library for a persistent assistant's browser work; test actual OpenAI calls through the engine. No fork. |
| Related | [ADR-012](012-browser-execution-lifecycle.md), [service integrations](../contracts/SERVICE_INTEGRATIONS.md#browser-use-preparation), [persistent assistant design](014-persistent-assistant-context.md) |

## Decision

Adopt the pinned upstream `browser-use` library, including `Agent`, `BrowserSession`
and `Tools`. Browser Use owns page observation, its agent history, dynamic action
schemas, action validation and browser interaction over CDP. Its navigation tools
include links, inputs, scrolling, dropdowns and tabs. Do not implement a second
DOM indexing/clicking framework. The engine remains the parent concierge and
owns durable tasks, tenant routing, model policy/budgets, current authority,
customer controls, proposal binding, dispatch and source confirmation.

The engine advances one upstream `Agent.step()` per authorized task increment.
A small model transport relays Browser Use's own messages and output schema to
the engine's registered structured-model adapter. The worker pauses for that
response; it does not receive provider keys, call another model or run an
unmetered inference/retry loop. Profile defaults can be independently overridden
by trusted public development configuration for planning, Browser Use thinking,
page search/find, direct URL opening and one-to-five actions per step; vision additionally
requires the registered route and current screenshot-disclosure policy. Native
OpenAI transport preserves validated message roles and bounded inline images.
Every proposed action is reserved before executing a batch; partial execution
does not refund the reservation. Additional extraction/judging/compaction models
remain disabled: `Agent.step()` does not invoke the full-run judge, and compaction
needs an auxiliary-inference protocol that this profile does not implement. Library
history stays with the disposable browser worker and is rebuilt after recovery
or protected takeover; durable business state remains outside it. Accepted customer
clarification refreshes the upstream goal, and every handback resets transient
question/handoff state without resetting the durable task budget. A pre-dispatch
provider failure can retry the exact transient request without replacing the
healthy browser. Replacement workers receive the durable step index and remaining
budget. Public research uses separately metered source-bound outcome assessment;
its criteria and evidence survive browser loss, and sufficient evidence can be
finalized at the navigation limit without another `done` inference.

An opt-in adaptive public profile starts with DOM observation, uses planning for
longer routes and escalates to permitted screenshots for sparse DOM or visible
canvas content on the focused page. It retains the upstream multi-action executor
and stops batches after navigation/target changes. Source-bound assessment selects
engine-owned passage IDs rather than reproducing quotations. Durable attempt
metadata and cross-process database locks complement the disposable agent history;
unknown completion is preserved after interruption. These mechanisms require
the targeted visual, recovery and conversation evidence in the verification index;
they do not establish production browser-owner or network-partition qualification.

Browser Use 0.13.14 has dependency pins incompatible with the engine's Google and
Pillow requirements. Install the actual library as a dependency in the separately
locked `tools/browser-use` Python environment. This is dependency isolation,
not vendoring or a fork. The worker uses isolated Python, a stripped environment,
an ephemeral user/config directory, disabled telemetry/cloud sync and bounded
stdio frames/timeouts. AnyIO, MCP, Pillow and pypdf advisory overrides require
verification against the full agent path now used. Bind both this dependency
artifact and the browser/engine artifacts before real-site qualification.

The browser owner launches one temporary persistent Chromium context for the
whole task and registers its network gate before navigation. Browser Use attaches
to that same browser over loopback CDP; new tabs use the same gated context.
No personal Chrome profile is inherited. Connection state still belongs to the
existing scoped account/session boundary, not to a long-lived unowned VM.
The owner pumps Playwright's event loop while the library operates, so request
interception continues during CDP actions. Generation/revision and current task
checks still precede action admission. Only the protected commit path can arm a
single exact source-bound effect; an agent click cannot arm it.

Keep login, payment-choice and submission controls visible. Protect secret
**values**, rather than deleting useful controls from the agent's view. The
current text-observation profile sanitizes protected nodes before upstream
serialization, using generic protected-control descriptors and removing private
attributes/derived child text. Public preparation controls retain their content.
Protected input routes to customer takeover. Passwords,
OTPs and card capture are not navigation model arguments. Arbitrary JavaScript,
filesystem/upload/download and extra extraction-model tools are not exposed by
this service task profile. General public research separately exposes bounded,
task-local text notes, with no host-file access, and retained canonical source
context for worker recovery; see the integration contract. Notes cannot verify
facts or substitute for observed website interaction. Vision is disabled by default. The opted-in visual experiment
uses fictional local pages and refuses capture when protected content cannot be
excluded. Images remain transient, bounded model inputs, never durable task
evidence. Upstream support alone does not establish real-site screenshot disclosure
qualification.

The configured driver remains available for existing deterministic integrations;
trusted routes explicitly select `preparation_driver: browser_use`. Individual
preparation selectors and `preparation_scope` are no longer required. Existing
scope metadata is retained for route-fingerprint compatibility, not advertised as
a sandbox. Reviewed source/commit selectors and network/effect contracts remain
necessary; a general agent cannot establish a provider's price, transaction or
cancellation semantics by guessing. Source readers, not the agent's `done` text,
establish quotes and outcomes.

Current service execution remains synthetic-only under ADR-012. Configuration and
runtime fences reject real Browser Use routes before account resolution until
the isolated runtime, egress, data processing and provider contracts are
qualified. Maps retains its separate source-query preservation contract. No
real account, destination or financial effect is enabled by this decision.

Public discovery and appointment preparation have different evidence requirements.
An explicitly opted-in local fixture experiment may use the same upstream agent
to inspect real public Doctoralia directories for a labelled fictional patient;
it returns attributed page observations rather than a priced proposal or booking.
The [test contract](../contracts/SERVICE_INTEGRATIONS.md#local-public-directory-experiment)
permits public discovery on the fixed origin, including search/query/filter and
read-only availability routes, subject to explicit private
and consequential-action denials, authority and inference bounds, source privacy
filtering and existing transcript retention. The former narrow path/query policy
is retained only as an explicit comparison baseline. A healthy public browser
survives a refinement while its outstanding model decision is invalidated; the
upstream agent refreshes its goal and observations. Identical normalized corrections
are acknowledged without a new goal revision. Cancellation and uncertain physical
work retain the existing teardown requirements. This does not
relax real-user route, account, isolated-runtime or legal qualification gates.

For general public browsing, the 14 November implementation request authorizes
replacing endpoint enumeration with public internet egress. Trusted `public_web`
profiles default to `network_mode: public_internet`; existing provider profiles
retain `qualified` mode. A task-owned SOCKS proxy resolves each destination,
rejects nonpublic addresses and connects the checked address. Chromium carries
TLS, HTTP/2, anonymous session cookies, API requests, redirects and WebSockets
through that proxy. New tabs share the same boundary. Browser launch disables
implicit loopback bypass and non-proxied UDP. Public networking is not a claim of
production process isolation or permission to perform website transactions.
General mode preserves Chromium's native user agent and permits service workers.
The proxy observes task interruption independently of browser teardown, including
existing service-worker and WebSocket traffic. Recognizable commitment controls
are guarded across click, keyboard activation and native input/focus paths.

This follows the transport-level separation in
[OpenMausBot's egress gate](https://github.com/milind-soni/OpenMausBot/blob/db2e1bec8c3681760add75094ba20e5289abc522/server/browser/egress/gate.ts).
The alternative, enumerating every public endpoint and finite request value,
breaks ordinary dynamic websites and keeps the engine dependent on per-site
maintenance. That stricter mode remains appropriate when explicitly selected.
No third-party implementation is incorporated. Upstream Browser Use remains the
navigation engine; its auxiliary model tools stay disabled until the relay can
meter them.

General research uses `completion_policy: useful_research`: a successful agent
finish may deliver sourced partial findings with explicit unknowns. Strict
`goal_verified` still requires evidence for all required criteria. Budget exhaustion
and browser failure retain their own stop reasons and available evidence;
they do not become verified success. `verified_goal` preserves the older
completion policy. Route fingerprints bind these choices, so old tasks cannot
silently acquire broader access or changed completion semantics.

Network permission and action authority are distinct. General browsing has no
customer account, tenant credentials, booking or purchase authority. Protected
input and explicit consequential-action controls remain guarded. Anonymous POST,
GET and JavaScript can nevertheless have effects; neither path-word filters nor
semantic control checks prove every website interaction read-only. This broader
mode must not be described as a deterministic no-effects sandbox. Synthetic
principals and current disclosure, cancellation and budget checks remain required.

Interactive browsing no longer fetches or enforces robots.txt, including the
narrow comparison profile. Its former robots behavior is historical evidence.
In `qualified` mode, trusted public profiles can classify exact XHR/fetch endpoints as public search,
availability or public data operations. Each binds its method and finite allowed
query/body fields and values; explicit classification takes precedence over
path-word heuristics, with no fallback when the request fails that contract.
Unclassified traffic retains the existing public GET/HEAD and private/effect
denials. POST does not independently imply an effect or grant one.

These operations use the bounded credential-free JSON reader. It pins a verified
public DNS address with original-host TLS verification, rejects redirects and
strips browser credentials and response cookies. This deliberately does not
qualify anonymous session creation, browser-cookie-dependent APIs or arbitrary
POST payloads. Ordinary page assets retain browser-context loading. The network
policy version and full operation configuration are included in route bindings;
old tasks cannot silently adopt the expanded permission. No new live operation
is enabled in the example profile. See the canonical integration contract for
the supported fields and verification index for actual evidence.

## Superseded approach

The first scoped implementation used only Browser Use's DOM serializer and
public-control indices, retaining a custom engine navigation loop and excluding
protected/final controls. Mateo explicitly rejected that restricted adoption.
This revision replaces it with the upstream agent and tools. The earlier
verification records remain historical evidence, not evidence for this worker.
Adopting an autonomous browser worker does not replace the parent engine or its
authority, so those boundaries do not justify rebuilding navigation ourselves.

## Consequences and evidence

The library supplies browser behavior and recovery primitives; it does not
supply multi-tenant isolation, durable task recovery, authority, a credential
vault or transaction reconciliation. Missing/incompatible worker configuration
fails closed with no driver fallback. Tests must exercise the actual upstream
agent against real Chromium and engine APIs, including changed layouts,
dropdowns/tabs, protected-value redaction, denied effects, stale revisions,
takeover, recovery and replay. Library tool availability is not a claim that
every website or widget has been qualified.

Commands and actual outcomes belong in [setup](../reference/SOURCE_REFERENCES.md#source-c238a39099e5)
and [verification](../reference/development/VERIFICATION.md). Developer checks and paid
OpenAI calls do not replace independent review, a different human tester or
production approval.

Compliance: LR-01/02/03/04/05/12/13/17, and LR-15 before cardholder-data handling.
Target ISO/IEC 27001 controls 5.15-5.18, 5.19-5.23, 5.34, 8.3, 8.5, 8.10-8.12,
8.15, 8.20-8.24, 8.26, 8.28 and 8.29; ISO/IEC 42001 A.5, A.6.2, A.7-A.10.
Counsel/vendor/real-data processing prerequisites remain pending. No certification
or production qualification is claimed.

## Primary references

- [Browser Use source and MIT license](https://github.com/browser-use/browser-use)
- [Upstream Agent](https://github.com/browser-use/browser-use/blob/main/browser_use/agent/service.py)
- [Browser session](https://github.com/browser-use/browser-use/blob/main/browser_use/browser/session.py)
- [Tools](https://github.com/browser-use/browser-use/blob/main/browser_use/tools/service.py)

The pinned installed 0.13.14 source is the implementation reference; `main` links
are explanatory and may advance independently.
