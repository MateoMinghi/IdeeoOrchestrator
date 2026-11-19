> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Service integration contract and provider catalogue

This is the canonical intended integration contract for rides, food, shopping, reservations, appointments and local services, recorded 3 November 2026. It owns provider capabilities, trusted routes, execution requirements and qualification. Follow the separate [UX rules](../product/UX.md) for customer questions, proposals, approval, progress, recovery and presentation.

These rules govern adapters and contracts; they do not qualify a provider or select an external gateway/browser framework. A development service-task foundation is described below. Current evidence remains in [verification](../reference/development/VERIFICATION.md). App/SDK binaries and tenant channel delivery retain their [existing ownership](../decisions/011-tenant-api-and-channel-ownership.md).

## Development service-task boundary

`/v2/service-tasks` provides authenticated create/read/command operations with idempotent creation, conversation ownership, revision checks, encrypted task persistence and retained inference/action budgets. It reuses the [background task](BACKGROUND_TASKS.md) repository, outbox and Temporal/LangGraph worker. Its typed phase distinguishes preparation, connection, proposal, approval, submission, uncertainty and source confirmation; a confirmed request is not a completed trip.

Uber rides leads the first complete provider qualification. Eight packaged instruction-only skills cover the providers below. The synthetic Playwright profile uses configured semantic controls and typed JSON evidence; its quote/commit/status endpoints are fixture protocols, **not Uber endpoints or a real-site adapter**. The separate consumer DOM preparation path is described below. Models propose bounded preparation actions; only trusted code can arm a synthetic submission, after fresh exact terms and a protected authority receipt. Unknown outcomes are reconciled by the original operation ID, never resubmitted. An expired unresolved operation remains uncertain and supports bounded source reconciliation; this neither extends spending permission nor replenishes budgets.

No route is enabled by default. `ENGINE_SERVICE_ROUTES_FILE` accepts the generated [route schema](service-routes.schema.json). Selection is exact per tenant and provider. Browser routes require the separately qualified [consumer DOM profile](#consumer-browser-adapters); references alone still fail with `service_provider_unqualified`. Synthetic execution requires an explicit loopback fixture and provider-specific service authority; there is no banking/read-permission fallback. Explicit `handoff` routes produce a customer link and do not claim provider execution. Natural-language `/v2/turns` can delegate the eight `service.<provider>` capabilities into a durable task in the same conversation. Availability follows trusted enabled routes. Capture preserves the original customer request as the goal, rejects substitution of an explicitly named provider, and leaves essential service questions to the task. Task-bound answers and takeover/return/resume controls do not constitute payment approval.

The service-authority client uses `POST /v2/engine/services/authorize`, API version `2`, a trusted workload credential and audience-bound customer delegation. It sends the verified tenant/membership/client/agent/grant context, task, provider, permission, exact destination and route digest; commitment additionally binds the current mandate version, proposal digest, operation ID, protected approval reference and complete quote. The response must echo the binding, supply the current version and expire within the customer proof. Errors, redirects and mismatches deny access without retry. The [Go authority](AUTHORITY.md#service-provider-authorization-and-dispatch) implements this boundary with trusted provider profiles, independent current bank/mandate checks, and synthetic-only financial commitment through an existing protected purchase reservation. The separate `service_executor` workload alone can obtain one `/v2/engine/services/dispatch` permit. Dispatch marks the funding operation executing before provider I/O; it does not prove provider or bank acceptance. Post-effect disclosure uses current read permission rather than requesting another funding reservation.

The process qualification has explicit synthetic-authority and actual Go-authority profiles. The Go profile exercises engine capture, quote preparation, protected ES256 owner approval, one allowance reservation, separate executor dispatch and recovery through separate worker/browser-owner processes. Bank/owner and ride-provider data remain synthetic. This does not qualify a real funding adapter, card payment, zero-price booking or production spending-limit adoption.

When a quote is ready, the app/SDK requests `POST /v2/service-tasks/{task_id}/approval` with `expected_revision` and the displayed `proposal_digest`. The engine calls Go `POST /v2/engine/services/prepare`; trusted Go configuration supplies the funding account. A client/model cannot supply it. The response binds the task revision, deterministic operation ID, quote digest, mandate version, expiry and existing `AuthorityDecision`. A `secure_link` must belong to an explicitly configured HTTPS `approval_origins` entry; `host_intent` remains an opaque tenant-owned presentation, separate from native ADR-010 adoption. Approval-required responses must contain a matching, unexpired presentation clipped to the task, quote and customer proof. Changed revision or current authority denies disclosure.

Only the authenticated customer flow receives this response, with `Cache-Control: no-store`. Protected links/host payloads are not retained in task state/events or model context. The app opens the protected tenant flow; after that flow records the independently verified owner approval, it submits `commands/approve` with the same quote digest, revision and returned approval reference. Receipt possession or chat text alone does not authorize A1 spending. Repeating preparation recovers the same financial operation and never requests a ride. Actual SDK/native protected-screen adoption remains externally owned. The card/payment lifecycle still requires end-to-end funding adoption; cancelling a task is not a confirmed provider cancellation or refund.

Before cancellation, correction, takeover, quote replacement, pre-execution failure or expiry clears an existing quote, the engine retires its exact financial operation through Go `POST /v2/engine/services/retire`. Current service authority and full task/provider/route/quote/operation binding apply. Retirement is risk-reducing cleanup; it does not require a fresh fare or sufficient spending funds and grants no execution permission. It serializes with preparation/reservation/dispatch, erases full approval/credential content and excludes only undispatched allowance from current usage. Retirement before preparation creates a minimal encrypted recovery fence with no inspected funding amount. Late preparation or owner approval cannot reopen the operation. Dispatched, uncertain and bank-accepted operations cannot be retired; their holds remain for source reconciliation.

An API error is not confirmation of cancellation or correction; the client must retry/reconcile the command. If worker cleanup cannot be confirmed, `retirement_pending` retains the intended transition, blocks agent effects and offers authenticated resume/cancel controls. Resume finishes cleanup before applying that transition, preserves budgets/deadlines and refreshes the retained credential only from the verified caller's current proof. Expired tasks can finish risk-reducing cleanup without gaining new spending permission. This retires engine-authority preparation/allowance only, not an external card, bank hold, provider order or refund.

Protected `/browser` and `/browser-actions` operations authorize the task owner and keep entered secrets out of model calls and retained task payloads. When `ENGINE_SERVICE_BROWSER_ORIGIN` and `ENGINE_SERVICE_BROWSER_KEY_ENV` are configured, the API and worker use one engine-owned HTTP browser controller. Its [internal call schema](service-browser-call.schema.json) accepts typed actions, a task revision and a pinned route digest; callers cannot supply a URL, selector, script, principal or credential destination. The controller requires both its workload credential and verified customer delegation with the configured browser audience, then independently checks repository ownership, current authority, task/control phase, active action lease, operation and approved terms. Checks repeat inside the per-task lock and before disclosure. TLS is required except for an exact development loopback address with an explicit port. Redirects, errors and malformed responses do not trigger another attempt or a local-browser fallback. Workload-only maintenance can dispose a session; it cannot observe or act as a customer.

One controller process owns sessions at its endpoint; multi-replica session routing is not qualified. API or worker restart does not create a separate browser. Sessions have a global configured capacity and idle expiry, use distinct sandboxed Chromium instances and restrict source egress. The controller loads its profile from explicit environment configuration without the application's implicit `.env` file or model-provider setup. Its client rejects oversized/ambiguous JSON and workload/delegation credential echoes before producing a model observation; upstream error bodies are never customer text. Synthetic tests can still inject an in-process browser; that harness is separate from the shared HTTP route.

[ADR-012](../decisions/012-browser-execution-lifecycle.md) adds a fresh executor-owned generation to each physical browser environment. Internal `act` RPCs require both that generation and the current observation revision; neither comes from model output. Generations are omitted from model context. A stale action never opens a replacement browser. The local environment lifecycle separates starting, ready, interrupted, closing and closed from the durable task/provider state. Timeout or caller cancellation disables subsequent browser egress; it does not prove an already-started external effect is absent. Ownership, account exclusion and capacity remain held until physical teardown finishes. A failed or unfinished teardown cannot authorize another writer. This local backend remains development Chromium on one host, not VM isolation.

Preparation-only browser loss can recover within the same accepted task using bounded retained recovery attempts and the existing action/inference budgets and deadline. Recovery obtains current authority and task control, requires disposal before replacement work, and takes a fresh observation. It does not emit an intermediate customer failure when continuation succeeds. Submitting/uncertain operations retain their existing exact-operation reconciliation path and cannot enter preparation retry. Protected input cannot implicitly provision a new browser; native consumer adoption remains separate.

An upstream Browser Use completion without a verified source quote permits at
most two preparation continuations while the existing action/inference budgets
remain. The rejection count survives worker/browser replacement, refreshes the
agent's preparation context and grants no submission permission. Exhaustion
fails with `service_goal_unverified`; model completion text never supplies a quote.

Before submission, the controller atomically reserves one encrypted, caller-bound `artifact` marking the physical attempt. The marker holds only task/operation identifiers; its replay fingerprint binds the operation, proposal and route. It is not the authority's monetary reservation or a ledger. A duplicate or restarted controller must reconcile, even if it lost all browser state. Source quote and task expiry are checked again at effectful network egress. Ordinary terminal cleanup closes the task browser; cleanup transport failure preserves the recorded terminal result and relies on bounded owner expiry. Protected sessions are transient; persistent cookie/login storage is not implemented.

Real-site evidence extraction, end-to-end protected Go funding/approval adoption, persistent account reconnection where needed, provider cancellation/refunds, continued trip tracking and independent provider acceptance remain required before their respective capabilities can be enabled. The opt-in [Browser Use preparation driver](#browser-use-preparation) reuses the typed planner/browser boundary without executable skills. All real browser routes remain unqualified and disabled.

### Browser Use preparation

The [OpenMausBot development trial](../decisions/015-openmaus-browser-trial.md)
adds an explicit trusted backend selector; existing profiles remain on Browser
Use with their existing route digest. Switching backends changes that binding.
OpenMaus runs its native agent loop behind engine-owned inference and action
acknowledgments. The engine rechecks current authority/revision/deadline before
acknowledging work, reserves call/action budgets, and uses observed page text for
its existing completion assessment. Failed capture records an evidence gap;
native completion alone never verifies a goal. Extra source reads are bounded
adapter overhead, separate from the counted native agent actions.

The trial is synthetic/public/text/OpenAI on Windows and Linux x64. Its pinned internal
preload interface is not a stable upstream API. Correction rebuilds the native
session while preserving durable goals, evidence and spent budgets. A single
worker owner is required; distributed ownership, protected accounts, vision
and real-tenant use are not qualified. Linux uses a subreaper supervisor to contain
detached native browser processes. Image installation does not enable a tenant's
browser profile or its scheduler. See the
[setup](../reference/SOURCE_REFERENCES.md#source-6888cd86cead) and recorded
[evidence](../reference/development/VERIFICATION.md), rather than inferring support from
the upstream product's full tool set.

Normal public-research configuration can explicitly bind `provider: public_web`
to `browser.shopping` on one trusted origin per tenant. It uses the same upstream
worker and synthetic-authority restrictions as named public-service research.
It rejects overlapping legacy-browser ownership without replacing other tenants'
backends. Additional trusted privacy selectors extend the built-in exclusions
for both source snapshots and model capture and are bound to the route digest.
An unqualified explicit navigation proposal is rejected before browser dispatch;
the upstream agent receives a tool error and can continue on its current page.
This grants no new destination and leaves the independent network gate in force.

Trusted public profiles may qualify individual `qualified_public_read_urls`
needed by the page, separately from static asset origins. Only GET/HEAD XHR/fetch
reads are admitted, using a fresh credential-free client rather than browser
cookies, authorization or caller headers. Exact destinations still require
public HTTPS and destination checks. Robots is not an interactive access gate. Responses must be
uncompressed JSON within the size and absolute-time bounds; redirects and other
content are rejected. An explicit sole `version={timestamp}` query template may
match a canonical `YYYY-MM-DD HH:MM:SS` cachebuster on that exact origin/path;
it admits neither extra query parameters nor another endpoint. No public read is
enabled by default, and this does not qualify flight search, availability or
effectful APIs.

For reviewed public lookups, `qualified_public_operations` accepts at most 40
distinct exact HTTPS endpoints. Each declares `purpose` (`search`, `availability`
or `public_data`), `method` (`GET`, `HEAD` or `POST`), `query_values` and
`body_values` (field names mapped to finite allowed string values). Every declared
field is required; missing, extra, duplicate or altered fields fail closed.
POST bodies are at most 8 KiB and use the declared `content_type`:
`application/json` (default) or `application/x-www-form-urlencoded`. Nested JSON,
unreviewed values, protected fields and other methods are denied. This is trusted
operator configuration, never a model-supplied permission or proof of public-read
semantics. Qualification must establish that every admitted request is a public
lookup without a consequential effect.

An explicitly classified endpoint replaces method/path heuristics for that
endpoint only, including same-origin paths containing words such as `booking`.
It grants XHR/fetch access, not document/script access or neighboring paths.
Failed matching never falls back to generic GET admission. A lookup origin does
not become a navigation, search or asset origin. These requests use the bounded
credential-free JSON transport above: fresh client, no browser cookies or caller
headers, no Set-Cookie propagation, redirects rejected before following them.
DNS answers must all be public addresses; connection is pinned to a checked
address with the original Host and TLS name, preventing a second DNS resolution.
Private, mixed public/private and special-use answers are rejected. These added
transport checks qualify this operation path, not a general claim of network
isolation for the local browser backend. Cookie-dependent APIs, arbitrary POST
search values and anonymous session creation remain unqualified.

Interactive startup and dependency admission do not fetch robots.txt; robots
rules cannot veto a permitted document, asset or lookup. Site responses and
network failures remain distinct from engine policy denials. Network-policy
revision and all operation fields are bound into the route digest, so in-flight
tasks cannot silently acquire the new policy. No operation is enabled by default.

[ADR-013](../decisions/013-browser-use-preparation.md) adopts the upstream
`browser-use==0.13.14` library's `Agent`, `BrowserSession` and `Tools` as a child
browser worker. Trusted routes opt in with `preparation_driver: browser_use`;
`configured` remains the existing default. Preparation does not require individual
control selectors or a scope selector. Older `preparation_scope` metadata remains
fingerprinted, but is not an enforcement or isolation boundary.

Browser Use observes the page, builds its own action schema, tracks its history
and performs navigation over CDP. The engine advances one upstream step at a
time, charges its existing model budget, checks model-disclosure policy and
relays the upstream request to its registered model adapter. The worker receives
no API key and makes no independent model calls. The default service profile admits
one action per step. Trusted public experiment profiles can admit up to five,
reserving every proposed action against a separate retained action budget before
execution. Extra upstream judge/extraction/compaction inference is disabled. Model requests
are transient and are never durable task state or customer-visible history.

Controls remain visible, including login, payment choice and final submission.
Known protected/private values are redacted before text reaches the model;
protected secret input requires customer takeover. Protected controls keep generic
descriptors, with private attributes and unclassified derived child text removed
before upstream serialization. Public preparation labels/values remain visible.
Accepted answers refresh the upstream goal; handback clears transient questions
and handoff state while retaining the durable budget. The default uses text DOM
observation, without vision, arbitrary evaluate, filesystem access, uploads,
downloads or a separate extraction model. Native scrolling, dropdown and tab
tools remain upstream capabilities. Their presence does not qualify arbitrary
sites, account flows or effect semantics.
Trusted public development routes independently configure planning, Browser Use
thinking, page search/find, direct URL opening, vision and one-to-five actions per
step. Profile names supply defaults rather than coupling these features. Browser
Use thinking is separate from the native provider's trusted reasoning-effort
configuration. Vision requires a route opt-in and current screenshot-disclosure
permission; unavailable or unsafe active-page capture falls back to redacted DOM.
An unrelated tab cannot authorize or veto disclosure of the active page. Text
extraction retains its own protected-value checks.

The owner launches a task-local persistent context and attaches Browser Use to
that same browser. Its reviewed network gate applies to preparation and new
tabs. Ordinary agent actions cannot arm a commitment: source quote/approval
binding, current authority, a single dispatch attempt and reconciliation remain
outside the worker. Source readers establish terms and outcomes; model `done`
text is never evidence that a transaction succeeded. Takeover suspends agent
activity and discards its transient context before handback.

Install the upstream library in the separately locked dependency environment;
`ENGINE_BROWSER_USE_PYTHON` selects its absolute interpreter only in the browser
owner. No fork or copied navigation implementation is used. Isolated Python,
stripped inherited credentials, disabled telemetry/cloud sync and bounded
protocol/timeouts reduce exposure; a subprocess and loopback CDP are not an OS
security boundary. Wrong version, missing configuration or failed worker frames
fail closed without silent configured-driver fallback.

Current configuration and runtime reject non-synthetic Browser Use routes before
account access. Real adoption requires ADR-012's isolated runtime, gateway egress,
model/data processing authorization, and qualification binding the worker/library
artifact to the site's source and effect contracts. Maps retains its configured
query-preservation path. See [setup](../reference/SOURCE_REFERENCES.md#source-c238a39099e5)
and [verification](../reference/development/VERIFICATION.md) for actual tested coverage.

#### Local public-directory experiment

The engine also packages this public-read browser environment for normal API and
worker startup through trusted `ENGINE_PUBLIC_RESEARCH_FILE` configuration; see
[setup](../reference/SOURCE_REFERENCES.md#source-c238a39099e5). Registered
tenant/provider/client bindings select the destination and retain existing task
budgets and authority checks. Ordinary authenticated turns can start these tasks
without a demonstration prefix. Actual tenant/provider overlap rejects startup;
disjoint configurations retain caller-scoped dispatch and descriptions. This development backend accepts synthetic
authority contexts only and does not restore customer accounts or enable effects.
Browser Use continues to own navigation; source-bound engine assessment decides
whether the request is satisfied. Real-tenant isolated-runtime and site/legal
qualification remain pending. The older launcher below remains a compatibility
entry point with its original narrower fictional-patient rules.

General `public_web` profiles default to `network_mode: public_internet` and
`completion_policy: useful_research`. The configured origin is the starting
page, not a browsing-domain allowlist. Browser Use may follow public sources and
use public search across origins. A task-owned SOCKS proxy checks DNS destinations,
rejects private/loopback/link-local/metadata addresses and connects the approved
address; TLS, HTTP/2, redirects, anonymous cookies, API traffic and WebSockets
remain browser-native. Chromium cannot use its implicit loopback bypass or
non-proxied UDP. General mode retains Chromium's native user agent and permits
service workers; their connections pass through the same proxy. Clearing the
task's active signal fences new connections and forwarding, and a bounded monitor
closes existing tunnels independently of browser teardown. The proxy closes with
the task and fails closed if unavailable.

General profiles default to 48 browser steps and 120 reserved actions, with
trusted maxima of 128 steps and 512 actions. Thinking, page search and direct URL
opening are enabled; vision still requires explicit route and disclosure permission.
Inference, assessment, deadline and cancellation limits remain independent.
Public profiles may explicitly configure an IANA `reference_timezone`. The engine
retains the originating turn's acceptance timestamp and derives calendar dates in
that zone for requirement compilation, navigation and assessment. Each retained
factual or execution-method requirement keeps its own anchor through renumbering and unrelated corrections;
explicit replacements use the correction's acceptance time. Missing legacy anchors
stay unknown. Bounded goal-prefix boundaries preserve each accepted update's timestamp.
Pending updates compile in order before navigation/assessment; intermediate requirements
are not presented as the latest accepted revision. Existing call budgets are not refilled.
A configured zone is a default, not inferred customer geography;
explicit customer timezone instructions take precedence in semantic interpretation.
Without an established zone, relative dates require clarification. Provider schedule
zones and ambiguous DST times still need source evidence. Chromium uses the configured
zone, or explicit UTC for display only; UTC does not become a customer default.
Calendar arithmetic and anchor retention are deterministic; extracting temporal
intent and checking source schedule meaning remain model/evaluation obligations.

OpenAI quota exhaustion and access denial terminate public research without another
model attempt, retaining captured observations and a specific customer-visible reason.
The permanent stop marker is persisted with the rejected attempt. Restart reconciliation
also recognizes older permanent rejections; cleanup failures and concurrent corrections
cannot restart inference for that task. Physical cleanup may retry before terminal state.
Temporary throttling keeps a healthy browser and may retry under the existing durable
recovery/call/deadline limits. Browser replacement cannot resolve billing or model access.
General public research also exposes native text notes (`read_file`, `write_file`,
`replace_file`) in an isolated scratch directory: at most 16 files, 64 KiB each and
256 KiB total. Only plain local filenames with `.md`, `.txt` or `.json` extensions
are accepted; external files, path traversal and symlinks are denied. Notes share
the action budget and may disappear when a worker is replaced. Useful research
therefore supplies up to 12,000 characters of retained canonical source context
on subsequent steps, within a 16,000-character total runtime context. This memory
is untrusted navigation context; scratch notes cannot establish source evidence
or website interaction. Qualified profiles retain their previous context limits
and exclude scratch tools. Auxiliary extraction/judge models, arbitrary JavaScript,
uploads, downloads and access to host files remain disabled.

Native text search uses its own protected-content check, matching the upstream
tools' light-DOM read scope. Ordinary shadow roots and iframes do not disable
`search_page` or `find_elements`. Protected selectors and returned content remain
filtered, including extractable attributes and tool errors. Screenshot disclosure
still uses its separate, more restrictive check.

`useful_research` permits a successful agent finish with useful attributed partial
findings, explicit unknowns and `goal_verified: false`. Completion of research is
separate from satisfying every factual requirement. A system-level specialization
of Browser Use's completion rule makes that distinction explicit; a lower-priority
task instruction alone does not override upstream full-certainty guidance.
Actual failures and exhausted
budgets retain their recorded reason and observations. `verified_goal` retains
strict completion semantics. Neither policy accepts the agent's `done` prose as
source evidence or changes exact-source validation.

Observation answers may select up to 12 exact, task/revision-bound excerpts.
Each can carry an optional plain-text summary of at most 400 characters for
concise presentation or translation. The engine validates the excerpt against
captured source text and attaches its canonical source/date; it does not treat
the model's summary as evidence or change goal verification. Faithful paraphrasing
remains a model-quality and acceptance obligation, not a deterministic guarantee.
When requested, summaries may identify a relevant detail that the retained
excerpts do not establish, after checking the other offered excerpts for that
product. This is a limitation of the captured evidence, not a claim that the
website has no such information or the product lacks the feature. A broadly
supported requirement does not suppress these narrower uncertainties.
Without a summary, the exact-excerpt display remains available. Bounded output
preserves complete citations and explicitly reports omissions.

Requirements distinguish `evaluation_scope: per_candidate` (the backward-compatible
default) from `result_set`. Shared product facts and filters apply separately to
each candidate. Comparison membership and subject-specific source requirements
apply to the set: every required subject must be supported by an individually
qualified, source-bound candidate. Two variants of one requested product cannot
replace the other requested product. A collection requirement cannot carry an
alternative group. Recovery displays missing collection coverage once, rather
than labelling one requested product incompatible with the other.

In useful research, six confirmed passive steps can schedule an evidence assessment
under the existing call budget. A durable revision/step/observation marker prevents
repeating the same check after recovery, and a final assessment slot is reserved.
A fully verified goal can finish at this progress check; missing evidence
returns concrete gaps to navigation, subject to the bounded partial-completion
rules below. Repeated tab switching cannot itself establish success or an exhausted search.

Confirmed actions that retain no new source text, entity scope or observed link
provenance also qualify for the six-step progress check, including repeated
navigation/clicks. Timestamps alone do not count as progress. A durable marker
survives worker replacement and resets for new evidence or a goal revision.
Navigation receives the remaining gaps and guidance to investigate another
candidate/source instead of revisiting unchanged evidence. In `useful_research`,
after at least twelve unchanged steps and six further navigation calls since a
successful assessment of those same sources, the engine may finish with the
current assessed partial result without another model call. It preserves
`goal_verified: false`; it does not infer an exhausted search. `verified_goal`
does not use this partial stopping rule. Existing action/call limits still apply.
Two successful progress assessments separated by at least six navigation calls
may also end useful research when candidate identities and criterion/execution
statuses are unchanged. This evaluates the latest captures before stopping,
even when incidental page changes defeat exact-source comparison. New candidates
or changed coverage receive another investigation window. No current observation,
an unconfirmed action or a changed goal cannot reuse a stale stop decision.
Active research also receives a progress assessment after twelve new distinct
confirmed observations and at least twelve navigation calls since its previous
progress assessment. This bounds feedback delays when page content changes or an
earlier action was unconfirmed; the current action must still be confirmed and
have captured public pages. The checkpoint only invokes the source-bound verifier,
reserves the final assessment slot and never treats activity as proof of success.

Existing provider profiles retain `network_mode: qualified` and
`completion_policy: verified_goal`; their fixed-origin rules below still apply.
Both choices are trusted configuration included in the route fingerprint.
General networking does not grant action authority: no booking, purchase, account
creation, login or message submission is authorized by research. Protected input
and explicit effect controls remain guarded, but arbitrary public website traffic
cannot be certified side-effect-free from HTTP methods or control labels. Real
accounts and real-tenant qualification remain separate.

The native preproduction console launcher has a separate, opt-in
`--public-browser-demo` test harness. It registers a public-search handler for
`service.doctoralia` only for PayMe's local fixture principal; publication must
also enable that tool. Requests must start with `[Demo ficticia]`. It uses the
same locked upstream Browser Use Agent and engine model relay against **real
public pages**, not a synthetic provider. No production service route or browser
qualification is granted by this flag.

This fixture requires an explicit search area inside its configured CDMX/Miguel
Hidalgo/Polanco scope. An unresolved home/work alias returns a trusted missing-goal
question before browser creation or inference. This is adapter qualification,
using the common question/presentation interface, rather than a medical-question
rule in the shared planner.

The concierge describes this handler's actual read-only scope, separate from
the provider's broader catalogue. Browser checkpoints persist partial source
observations in the existing turn before subsequent inference/actions. Terminal
failure retains those observations and a safe reason code. Customer presentation
retains each page's observation goal revision across browser replacement and
correction; earlier evidence must be reassessed against changed constraints. Public research
compiles current factual criteria from exact customer spans, then assesses named
candidates against those criteria using observed passages. Semantic matching is a
model assessment. The model selects stable passage IDs; the engine hydrates exact
original quotations and origin-scoped candidate identities. Deterministic validation
checks source binding, up to three observed same-origin links through pages naming
the same candidate, the assessment's goal revision and complete criterion coverage.
Compilation, retained constraints, assessment and result schemas share a limit of
24 factual and 24 execution requirements; conversion never silently drops excess
criteria. A model-selected cross-candidate reference makes that entire criterion
unknown, preserving independent valid findings. Strict source/identity validation
still applies to all retained claims; an unknown criterion cannot establish success.
Repeated directory cards retain separate entity-scoped passages with observed
titles. Candidate evidence cannot cross those record boundaries; a missing or
pruned scoped passage never falls back to a flat page window. Source excerpts
remain verbatim, with privacy filtering and byte limits applied before retention.
Public source capture traverses open shadow roots and rendered slot content;
protected hosts protect their descendants. Embedded HTTP(S) documents retain
their own admitted URL and entity boundaries, never the embedding page's identity.
Every frame ancestor must pass public/visible checks before and after capture.
Capture considers at most 24 child frames and excludes duplicate frame URLs,
inline/opaque frames, hidden/private embeddings and detached documents. Closed
shadow roots remain unsupported. Frame visibility checks conservatively exclude
embeddings with boxless ancestors, including some slot/`display: contents` layouts.
These boundaries limit available evidence;
they do not establish that an omitted fact is absent from the website.
On the inspected Doctoralia Mexico clinic layout, a visible appointment widget
with exactly one completed, explicitly named practitioner selection retains its
own practitioner-scoped passage. Only that widget's public text belongs to the
selected practitioner; the clinic's general services and other providers remain
separate. Ambiguous, unselected, hidden and protected blocks cannot establish
this relationship. The provider selectors are limited to Doctoralia Mexico;
layout changes require requalification. Selection establishes evidence scope,
not appointment availability, booking authority or semantic price qualification.
Assessment must match person, service, modality, location and currency. A starting
price below a requested ceiling leaves that ceiling unknown; a starting price
above it contradicts it. A clinic membership alone cannot transfer clinic tariffs.
Cross-page facts require both sources to resolve to the same observed, named
profile identity. A truncated or unknown link catalogue cannot exclude competing
identities. `links_complete` defaults to false for older observations; unsupported
legacy cross-page findings become unknown while exact same-page facts survive.
Byte compaction retains competing identity witnesses or drops the affected support.
Page/byte limits persist `identity_graph_truncated` across checkpoints and browser
replacement. Trusted retention can preserve a known normalized name's complete
witness closure in `identity_graph_complete_for` only while every current witness
survives unchanged. Each pruning rechecks that closure; new snapshots inherit no
certificate, and a certificate cannot override an incomplete link catalogue.
Goal-ranked navigation hints are transient and separate from source identity links.
Visible public menu/expansion labels and states are also transient hints. They
precede optional asset diagnostics within the bounded model context, so upstream
Browser Use can reveal collapsed navigation through its ordinary tools. Menu
contents require a fresh observation; hints establish no provider fact or authority.
Qualified main/featured patient-review and health-question containers, including
review/question schema annotations, are excluded from Browser Use model capture
and retained source observations. Screenshots are withheld on pages containing
protected regions. Aggregate provider facts remain available. Layout changes
require requalification; these selectors do not classify arbitrary web content.
The revised provider-only policy fingerprint rejects earlier public-task bindings;
continuing those tasks requires a fresh request.
New public Temporal schedules carry a separate maximum of 512 engine increments
for startup, input, action and observation phases. Existing inference, assessment,
action and deadline limits remain authoritative. Historical schedules missing
`max_increments` retain their original 64-increment commands for replay. Exhausting
the new mechanical ceiling fails the task rather than claiming its deadline
expired. Worker and dispatcher releases must match before enabling new schedules.
Invalid references and associations return bounded actionable feedback. This is not independent
acceptance or provider confirmation. The separately retained assessment budget
includes requirement compilation and verification calls; every attempt also
consumes the grant's inference allowance. Navigation exhaustion can still finalize
already sufficient evidence without another browser `done` call.
Incomplete completion attempts can continue within the existing durable action,
inference, assessment and deadline budgets; an additional two-attempt cutoff does
not end otherwise budgeted research. If upstream observation returns before model
inference, the worker reobserves once within the same owner deadline, only when no
action was dispatched. It never replays a dispatched action or replenishes a budget.

After initial compilation, corrections propose explicit additions and removals
against the retained criteria. Omission preserves a criterion; removal and option
count changes require exact text from the new correction. The engine assigns
criterion IDs and commits a validated replacement atomically. Failed compilation
keeps the accepted criteria and their revision for retry after coordinator recovery.
New recognized output fields have a typed identity and a neutral label describing
the option matching the current constraints. Original quotes and descriptions
remain provenance. Untyped stored fields and explicitly independent output fields
retain their literal meaning; they are not automatically migrated or stripped of
qualifiers during corrections. Route boundaries such as public-only/no-booking
remain execution policy, rather than invented evidence-acquisition requirements.
Robots.txt is not a runtime navigation gate. Other denied document reads allow
the upstream agent to choose another permitted approach within retained budgets.
For the public Browser Use driver, worker initialization, model-input preparation,
action execution and fresh source capture use separate bounded owner calls and
durable increments. Preparation makes no model call and consumes no inference
allowance. A minimal continuation binds a completed action's question/stop/handoff
metadata to its attempt, goal revision and original environment generation. It
persists with execution settlement and clears with the post-observation state
transition, so owner replacement cannot skip a pending question or assessment.
Model requests and responses remain transient. Corrections supersede old control
flow while preserving the outstanding fresh-source read and spent budgets.
Synthetic service preparation also yields between browser startup, agent reset or
initialization, model-input capture and fresh observation. Internal pending replies
cross the HTTP executor boundary without a model call. A goal/generation-bound
reservation retains one action charge for that preparation cycle, with at most
eight preparation increments before bounded recovery. Worker bootstrap, bounded
compatibility-import warmup, Agent construction and browser connection have
separate deadlines. Warmup permits at most two 20-second polls with a 40-second
absolute limit; each worker command retains its 22-second worker and 27-second
parent deadline. Failed startup ends the contained child, including a stalled
import thread. These phases perform no model inference; the compatibility import
does not create an AI-provider client or make an AI-provider request.
Fresh quotes and protected
states are handled before inference. Corrections, handback and recovery discard
the reservation; model input stays in the owning process and is consumed once.
The model reservation renews the lease for its configured provider deadline plus
ten seconds to settle; dispatch receives a fresh forty-second lease after current
revision/authority checks. These leases do not extend the task deadline or mandate.

Assessed outcomes distinguish satisfied, partial, explicit no-match and blocked
research. No-match requires a trusted completed-empty search marker and cited current
source evidence; budget exhaustion, a broken page or an empty candidate list is
insufficient. A later unrelated failed navigation does not invalidate an earlier
current search result; superseding observations at the same URL and goal changes
still require current evidence. This conservative rule can leave an empty result partial when the
last navigation attempt consumed the budget before a completed search was recorded.
The presenter reuses assessed facts without a new
selection call and distinguishes published times from bookings. Unassessed results
retain brief source excerpts explicitly marked as pending evaluation; long page
bodies remain in evidence with bounded complete source links instead of chat dumps.
Capture or
follow-up generation failure falls back to the authorized durable task result;
an empty HTTP 200 answer is not successful delivery.
The failure handler preserves the failed turn and reason, prefixes a recovered
task snapshot as saved state, and otherwise returns a server-authored failure
answer without asking the customer to restate an already known goal. Ordinary
cited follow-ups render the canonical snapshot without appending model-written
provider facts that lack an evidence binding.
Assessed replies keep each displayed quote beside its full source URL and observed
time, within 3,600 characters to leave space for task status. Details that do not
fit are explicitly omitted without cutting a citation or the no-booking caveat.
An assessment may select an optional `display_quote` of at most 240 characters
from its cited passage. The engine accepts only an exact contiguous substring;
invalid display wording falls back to the retained passage. The full quotation,
identity association and criterion assessment remain unchanged. Explicit
follow-up snippet selections take precedence over this display aid. Saved-filter,
evidence and recovery views remain separately scoped to the accepted task revision.
The separate `observations` answer view selects exact contiguous excerpts of up
to 400 characters from retained public passages, without requiring a candidate,
criterion or completed assessment. It reuses the existing evidence catalogue and
encrypted result; there is no second evidence store or changed retention period.
Private capture handles bind task, current goal revision, evidence identity,
observation time and source entity label. Only the latest retained snapshot of a
URL is offered; repeated views do not consume distinct-page capacity. An unchanged
passage reobserved on the same URL, entity and goal revision can retain its prior
assessment even when unrelated page content changes its page fingerprint. Changed
or removed passages cannot. A single visible primary heading scopes that entity's
passages; independent listing/recommendation records keep their own scope whether
their navigation links wrap the headings or appear inside them. Fragment-only
section navigation can share evidence only with explicit matching primary-entity scopes
on both passages; different paths/query parameters still need observed identity links.
Separately captured, named public detail panels retain their
own observation times after closing; closing a panel does not reobserve its
contents. Panel capture is limited to an unambiguous primary entity and uses
the same protected-content exclusions. Reopening replaces that panel's passages;
document refresh, observed navigation away/back, entity change, selected variant
change, or changed captured main-page facts outside view controls/carousels clears the
in-memory panel cache. The main page still supersedes its previous prices and
other text. A fresh page after a goal correction cannot promote a panel captured
before that correction; the panel must be reobserved. Navigation hints come only
from an unambiguous worker-reported active URL, not another open tab.
Visible portal dialogs outside the main content need a unique observed primary-entity
controller (explicit `aria-controls` or an expanded controller naming that dialog).
Unrelated dialogs cannot borrow the entity. Named, observed carousel views retain
their passages as separate views; hidden/unvisited slides are not extracted.
Panel references survive bounded compaction only with their exact
retained source text; they grant no new access or verification exemption.
Compaction reuses the verifier's source-association path, including observed entity
scope, rather than applying a second text-only identity rule. Spare capacity first
restores whole useful passages on retained pages, preserving mandatory witnesses,
source timestamps, page-index references and provenance restrictions.
Pages from an earlier goal revision remain explicitly historical
context. They cannot establish a current quote or revised-goal completion.
Unknown or ambiguous entity association is rendered as page context. Model-written
provider prose cannot replace the selected exact source text.

Retrieval balances question-relevant whole passages with each candidate's current
assessed evidence and offers
at most 60 passages and 16,000 text characters per task, with an omitted-source
count. The planner receives this catalogue instead of a duplicate raw page dump.
It selects at most twelve excerpts; the engine revalidates them against refreshed
authorized task state before rendering. Each excerpt keeps its full source URL,
timestamp and historical label within the existing presentation bound. Missing
or pruned text cannot be reconstructed from a summary; reopening may be required.
When storage compacts unassessed observations, it first retains whole source
witnesses across origins and pages, then adds further passages in rounds before
enriching individual pages. This prevents a large or language-matched source from
displacing all evidence from another source. Exact text, capture times and entity
ambiguity remain unchanged; incomplete identity graphs cannot establish new
cross-page verification. The whole-resource byte limit still applies.
Brief factual answers prefer this view even when facts have already been assessed.
Distinct exact excerpts may share a passage; duplicate excerpts are rejected.
Rendering groups them under one complete source citation and capture time, admitting
whole excerpts incrementally when the reply budget cannot fit all of them. A retained
fragment keeps its original capture time even when its containing page was refreshed.
Ambiguous entity text remains quotable page context and cannot verify a candidate.
Recovery views show actual unresolved conditions and failures, respecting acceptable
alternative branches; they do not repeat supported facts or add unrelated booking
boilerplate to a factual answer. These presentation choices do not change verification.
Source privacy filtering, patient-review exclusions, current disclosure checks
and literal untrusted-text rendering apply equally to these unassessed passages.
Malformed optional selections still use the existing capture rejection behavior;
decoupling those errors from valid task controls is a separate increment.
Optional candidate `display_requirement_ids` rank at most three already assessed
criteria for the default short reply. They do not change verification, and an
explicit follow-up selection takes precedence. Corrections and evidence retention
drop display ordering for removed or no-longer-assessed criteria.
Snapshots contain
multiple bounded contiguous passages. Relevant observations share the existing
six-record bound; an older observation cannot survive retention without a newer
observation that supersedes its facts. Protected input, associated-label redaction
and source policy apply before collection.

The upstream worker distinguishes recoverable tool errors, protected-input
takeover, customer questions and agent termination. A tool error does not require
account connection. A pre-dispatch model failure may retry its exact transient
request while retaining the healthy browser and agent; no action is dispatched
from incomplete output. Recovery after dispatch uncertainty cannot replay that
request. A replacement agent receives the durable step index and remaining budget.
`done` without the required source outcome remains unverified. Under
`verified_goal` it can trigger a bounded continuation with missing-criterion
feedback; `useful_research` may deliver a sourced partial outcome instead.

The fresh task-local browser has no customer account or saved profile. In the
legacy directory experiment and `qualified` mode, egress
permits public HTTPS GET/HEAD to the fixed Doctoralia host and separately
qualified lookup operations described above. Public search parameters, filters, availability reads and
necessary same-origin assets/XHR are permitted. Additional static asset origins
must be exact trusted configuration with recorded
qualification; none is enabled by default. Their permission does not admit
documents, XHR or effects on those origins. External search is advertised only
when an exact search origin is qualified; public `profile` and `profiles` paths
are not classified as private merely by their names. Required dependency origins
are diagnostic configuration, separate from an egress grant. Sanitized blocked-resource metadata
and page health distinguish missing dependencies from completed searches.
Private/effect paths, unqualified writes/hosts and WebSockets are denied;
an explicitly qualified public lookup is assessed by its exact operation contract.
The launcher installs the existing encrypted background
task and Native Temporal lifecycle with twelve retained model/action steps and
two bounded preparation recoveries. The shared browser owner runs upstream Browser
Use; no second DOM executor is installed. Current authority is checked before inference,
before action-batch dispatch and before disclosure. Public source excerpts and links, observation
times and hashes are retained with the existing encrypted assistant turn and
admin transcript. Progress, follow-up and cancellation presentation use the same
validated durable result, including unresolved criteria, source URLs and observation
times. They do not require another model to rewrite verified evidence.
Material corrections retain the original request and budget, invalidate outstanding model
work, and increment the goal revision while preserving a healthy public browser.
The next increment reassesses retained observations against the revised request;
their original timestamps remain unchanged. Navigation receives useful pages,
completed and unresolved criteria, and bounded failed approaches. Repeated dialogue
corrections use a server-computed original-message/task identity and accepted goal
revision, so differing model-selected spans cannot create a new revision for the
same request. Direct commands retain normalized exact-update deduplication. An
unchanged correction records an `unchanged` receipt without a restart.
Session advisory locks serialize increments and the final control/action boundary
across cooperating API/worker processes. Dedicated unpooled autocommit connections
avoid holding a database transaction or starving the task-state pool during I/O.
Durable revision checks still reject stale results. Connection loss releases a
session lock; this is not proof that physical browser work stopped. Arbitrary
network-partition fencing and production browser-owner isolation remain qualification gaps.
Cancellation closes the browser before a
terminal state is recorded. Worker replacement reobserves under current authority.
Agent completion text is not a physician recommendation, slot verification or
booking confirmation. A source-verified goal means only that the retained evidence
supports the required global criteria and one complete acceptable alternative,
not that a published appointment remains available. The
cohosted local worker does not qualify production deployment. The foreground
component harness retains its six-step default. Neither path supports takeover,
appointment submission or account persistence.

Public-research deadlines derive from the configured provider timeout: the model
wrapper adds five seconds, the increment adds another 75 seconds for browser I/O
and cleanup, its lease adds ten seconds, and the Native activity adds twenty seconds
to the increment. Provider and background settings must match. The maximum configured
60-second provider timeout therefore uses a 160-second activity. Ordinary task/watch
activities retain forty-five seconds; old schedule histories decode to that
default. This extends no financial-effect deadline. A source-bound continuation
keeps the original durable task, accepted goal revision and consumed budgets;
the model cannot create a duplicate merely by describing the refinement as new
execution. A request to stop and ask for a summary executes the task control before
its actual recorded state is presented.

Natural-language public-read controls compare the accepted goal revision inside
a short caller-scoped resource transaction. Observation writes cannot interleave
with that accepted update; client-supplied controls still require the exact
resource revision. Authorization precedes the lock, and browser disposal/model
work never runs inside it. Answers also bind the current question identity;
replacing a question changes that identity. A lost acknowledgement is reconciled against
the stored server-issued turn ID, action, goal revision and update digest; goal
text alone is never proof that a command was applied. Clients and model output
cannot supply this internal receipt identity.

Generic `browser.shopping` research uses the same exact customer-input and
offered-turn binding as service research. Clarifications retain the original
request and selected customer corrections; model-written summaries are not
execution input. A continuation bound to active work updates that task rather
than starting a duplicate. Mixed goals require separate exact customer spans.
This does not enable a destination, grant authority or permit financial actions.

Requirement compilation separately classifies source facts, requested browser
methods, agent-policy instructions and answer presentation. Only facts and
actual acquisition methods become durable verification criteria; the original
customer goal retains policy and presentation instructions. Classification is
an untrusted model proposal, not proof of semantic correctness or permission.
Canonical source/method limits and exact customer provenance still apply after
filtering. Requirement `priority` distinguishes required criteria from explicit
preferences. Ungrouped required criteria apply to every candidate; each
`alternative_group` contains a complete acceptable branch, and any one branch
can satisfy the request. Supported preferences rank qualified options without
inventing support for unmet preferences. Search-order instructions stay in the
original goal: for "try 500 first, then allow 900", the upper limit remains a
hard source constraint and the lower target a preference, rather than requiring
a website to prove the assistant's search strategy. Corrections preserve these
distinctions and remove affected old constraints only with customer provenance.
Fresh runtime bindings reject earlier cached criteria rather than
silently reinterpreting their meaning.

Mixed service goals and correction-plus-question turns use exact contiguous
customer-text spans for task input. Private capture may select token indexes;
the engine retrieves the exact permitted text instead of accepting a paraphrase.
Saved requirements and pending changes remain visible independently of assessed
candidates through [the background contract](BACKGROUND_TASKS.md). Invalid
optional display selections cannot discard otherwise valid public controls;
target, scope, authority and effect validation still apply. Prior failure metadata can support a reply
but cannot supply new execution input. A substantive answer accompanying a task
control is composed after the control; public evidence uses the canonical result,
while other explanatory replies may use a separate metered call. Server-authored
state and receipt messages remain authoritative. A failed or invalid composition
does not undo the accepted control. This does not establish perfect mixed-intent
capture or unrestricted grounding of generated prose. A correction-only mixed
request can still be captured as a single goal; general per-goal correction
scoping remains unqualified. Non-correction controls discard an unused model
scope field rather than rejecting a valid cancellation/progress request.

An active public-task follow-up can recover a truncated/transient capture once
within the same turn under [the bounded capture contract](PROVIDER_PROFILE.md#bounded-recovery-of-an-active-public-task-follow-up).
Current authority/model policy and budget are rechecked before that second call;
the recovered plan cannot introduce banking or controls for a different task type.
Failed provider output never becomes execution input or future dialogue context.

Trusted experiment routes can select the upstream planning/thinking/vision profile
with up to five actions per step, independently bounded by a retained total action
budget and inference-call budget. Screenshot capture requires explicit current
disclosure permission and protected-content checks. Native OpenAI receives a
validated role-preserving transcript and bounded inline images; remote image URLs
are rejected. The paired local-source evaluation exercises search, dynamic public
availability and forbidden booking requests through authenticated engine turns.
Its deterministic source-fit and answer metrics remain separate from HTTP success
and the agent's completion claim. This experiment does not enable real accounts,
new destinations or financial effects.

The opt-in public demo defaults to the adaptive candidate: at most five actions
per step, twelve navigation calls, twenty-four total actions and twelve separate
compilation/assessment calls. It uses batched DOM observation, planning for routes
with at least eight navigation calls, and permitted vision when the focused page's
sanitized DOM is sparse or contains visible canvas content. This heuristic is not
a general visual-adequacy guarantee. Each observation reports its actual mode;
navigation or focused-target changes stop the remaining batch for re-observation.
Upstream DOM-staleness checks remain active. Durable attempt metadata separates
invocation, transport submission/response, proposed/reserved actions and dispatch
from confirmed execution. Interrupted completion stays unknown, retains consumed
budgets and is never replayed as an executed decision after restart.
Public-session disposal attempts every owned resource, retains the first failure
and bounded sanitized diagnostics, and retries only handles whose closure was not
confirmed. A cleanup error does not erase the measured outcome report.

Real-user use remains disabled pending site/legal and isolated-runtime
qualification. The experiment uses an explicitly fictional patient; bank results,
identities and credentials do not enter Browser Use or model input.

### Bounded post-confirmation tracking

An execution route may explicitly set `tracking_interval_seconds` (15–3600); omission keeps the existing confirmation-only assignment. The current controlled execution profile exercises this path. Actual provider API/DOM routes still need their own qualified source adapter and funding/execution adoption. The shared follower reads only the original operation, under current `reconcile`/`disclose` authority and a separate live-route `track` qualification permission. It performs no model inference, commitment or financial approval. Browser loss reconstructs source access from the retained task; it never requests a replacement booking.

`ServiceView.tracking` separates active, stopped and finished monitoring from `outcome.state`. Source confirmation is not service completion; `in_progress` projects phase `tracking`. Executor observation times and original provider/operation/quote/amount/currency bindings prevent stale or foreign observations from replacing current evidence. Backwards service transitions are ignored, and terminal outcomes cannot be reopened. Original task deadlines and retained action budgets bound every poll, including outages; neither resume nor reconnect replenishes them. Missing/transient source reads preserve the last observation and report delayed tracking. Invalid source bindings stop monitoring without relabeling the service as failed or cancelled.

`commands/stop_tracking` is revision-bound and stops monitoring only. Worker cancellation, failure, deadline or budget exhaustion likewise preserves the last source state; none proves provider cancellation, fee waiver or refund. Confirmed provider cancellation has its own source wording and does not assert payment reversal. Meaningful state changes enqueue one durable conversation delivery; unchanged polls and observation timestamps do not create notifications. Current schemas are linked from the [SDK/app contract](SERVICE_SDK.md#post-submission-lifecycle-and-proposed-extensions); native rendering/push adoption remains external.

### Browser connection lifecycle before VM adoption

The execution port returns an unstarted handle retained by its owner before
`start` creates physical resources. Startup failure retains that handle until
confirmed disposal; it cannot free the connection writer or capacity merely
because launch did not finish. Controller RPC queue waits use the configured
queue bound. Closing interrupts existing browser egress before waiting for the
active RPC, and a closing owner rejects work returning from authorization waits.
Independent cleanup attempts prevent a failed session from starving other tasks.

Explicit takeover opens the customer's shared browser even before the worker's
first observation. Its initial screenshot remains transient. Protected input and
agent actions cannot silently provision a replacement browser; agent work remains
blocked while the customer owns control. Handback requires a fresh observation.

Authority-owned browser connection storage is a separate, synthetic-only
[development port](AUTHORITY.md#synthetic-browser-session-vault). Browser account
bindings may select its opaque `connection_id` instead of an operator file.
Acquisition/check/refresh require the executor role, current exact caller/service
authority, task and browser generation. Refresh is revision-bound, cannot renew
expiry and cannot restore revoked state. Physical disposal precedes writer
release; unconfirmed cleanup retains capacity. No automatic file fallback,
real-account enrollment or API-token vault adoption is implied.

### Browser artifact evidence before VM adoption

The built-in local environment accepts synthetic routes only and checks backend
suitability before credential resolution. Real browser routes require a separately
qualified isolated backend; matching artifact/site flags cannot enable them locally.

The local browser backend can additionally load `ENGINE_SERVICE_BROWSER_ARTIFACT_FILE`. Its manifest inventories the selected Chromium distribution using relative file names and SHA-256 hashes, the actual browser version, Playwright version, platform/machine and the fixed sandbox/headless/context launch profile. A consumer browser route must bind its reviewed `site_profile.browser_artifact_sha256` to that manifest. Missing or changed artifacts fail before source navigation; the actual launched browser version is checked before opening a page. A manifest cannot enable an unqualified route. Synthetic fixtures may omit this gate or explicitly exercise it.

Generate the manifest on the target executor with the [setup command](../reference/SOURCE_REFERENCES.md#source-8f929a906ccd). The backend verifies the selected distribution before provisioning and explicitly launches that executable. Keep the distribution immutable while running. This is local content/version evidence, not signed image/OS attestation, protection against a hostile host, independent egress isolation, VM adoption or actual provider acceptance. The Python runtime digest and current authority remain separately required. Existing synthetic qualification does not authorize real customer sessions.

## Uber route selection

Uber rides is the first complete integration target. Select the route from demonstrated tenant access before implementing provider execution. The official [Rider API](https://developer.uber.com/docs/riders/references/api/v1.2/requests-post) describes rider OAuth and restricted ride-request access; its [migration guide](https://developer.uber.com/docs/riders/guides/migration-steps) changes scopes/endpoints and replaces some operations with app deep links. Do not combine legacy examples into an assumed current API contract. The distinct [Guest Rides API](https://developer.uber.com/docs/guest-rides/introduction) serves guest transportation and requires its own approved application access and funding arrangement; it is not a way to impersonate a customer's personal Uber account.

An approved API route should use a typed provider adapter behind the same task/quote/authority/reconciliation boundary. Otherwise qualify a permitted browser route with a dedicated authorized test account, protected connection and actual source evidence. If neither route is available, use an explicitly configured customer handoff. Uber's [Guest Rides sandbox](https://developer.uber.com/docs/guest-rides/guides/sandbox) may require whitelisting. The [Rider sandbox](https://developer.uber.com/docs/riders/guides/sandbox) warns that most endpoints proxy production; never assume a sandbox hostname makes every method harmless. No Uber sandbox, account or paid ride has been exercised by the development service tests.

### Prefilled customer handoff

The engine implements Uber's documented [universal ride link](https://developer.uber.com/docs/riders/ride-requests/tutorials/deep-links/introduction): `https://m.uber.com/looking`, the tenant's public application `client_id`, and URL-encoded location JSON in `pickup` and `drop[0]`. A tenant `handoff` route requires this exact origin/path, `uber_client_id`, and recorded legal/qualification references; no route or client ID is shipped enabled. A synthetic client ID proves local URL construction only. Physical-device link adoption requires its own qualification.

`POST /v2/service-tasks` optionally accepts `ride_locations`, containing `pickup` and `dropoff`, each with finite numeric `latitude`/`longitude`, a `label` and optional `formatted_address`. These points must come from the customer's selection or a tenant-approved location resolver. Text labels and addresses are display data; they never override coordinates. The model does not geocode or invent these points. This input currently applies only to Uber customer handoff.

Without selected points the task waits in `needs_input` with `required_input: ride_locations`. The authenticated SDK/tenant channel supplies both points through `answer` on `/v2/service-tasks/{id}/commands`, bound to the current revision, or supplies corrected points with `change`. A goal correction without replacement points clears earlier selections. Native location pickers and tenant geocoding remain externally owned integrations. Plain-text clarification alone does not establish coordinates.

The final task has phase `handoff`, `handoff_requires_confirmation: true` and `handoff_prefilled_fields: [pickup, dropoff]`; task completion means the link was prepared. It contains no quote, trip reference or provider outcome. The customer reviews locations and chooses ride type, time, fare and payment in Uber. No product ID, schedule or payment identifier is guessed or silently represented as applied. Link creation makes no Uber network request, opens no provider session and cannot expose engine browser takeover/screenshot/action controls. The browser controller and executor also reject handoff routes. An actual ride requires separate provider evidence.

## Instruction releases and qualification records

`ENGINE_SERVICE_SKILLS_FILE` is a trusted operator catalogue matching [service-skills.schema.json](service-skills.schema.json). Immutable artifacts contain provider, version, SHA-256 digest and instruction text; they contain no executable modules or account data. Built-in versions are content-addressed. Tasks retain the selected version and digest; planning loads that exact artifact. Keep prior releases available for in-flight tasks. Missing content, changed digest or a changed live-route qualification stops new preparation rather than silently loading newer instructions. Legacy tasks without a verifiable digest need explicit adoption/review; do not stamp them as verified automatically. Source reconciliation and protected receipt disclosure remain separate from loading instructions for new model actions.

Live API/browser routes additionally require an unrevoked, unexpired qualification record selected by the route's `qualification_reference`. It binds the exact tenant/provider/route digest, instruction version/digest, `runtime_sha256`, approved model route and individual permissions, plus source-evaluation, independent-review and human-acceptance references. The engine validates these bindings; it does not generate or approve those references. `live_enabled` and arbitrary reference strings alone cannot enable a route. Legal/content prerequisites, current customer authority and effect-specific funding remain independent gates.

When `ENGINE_SERVICE_SKILLS_FILE` is configured, API, worker and browser-owner registries reread that trusted local file at each instruction lookup or live qualification gate. Each qualification uses one catalogue snapshot. The file must be regular, at most 8 MiB and valid against the schema; duplicate JSON keys, missing files, invalid content, removed records and revoked/expired/mismatched qualifications deny access without a last-good fallback. Publish complete files through atomic replacement and make the same approved catalogue available to every process. Authorization and dispatch also recheck local qualification after awaiting the external authority, including tracking permission during active reconciliation. Directly injected in-memory catalogues used by development fixtures remain static.

This refresh applies at those local checks; it does not interrupt provider requests already started or undo a consumed dispatch/funding reservation. It supplies no signed publication, rollback protection, synchronized cross-host revocation, automatic canaries or managed release service. Route and account catalogue loading retain their separate lifecycle. Production publication/revocation and provider acceptance remain adoption work.

`runtime_sha256` identifies the entire shipped Python engine package, including instruction/reference resources, the Python implementation/version/platform and the normalized installed-distribution version inventory. API, worker and executor independently compute their own local digest; an engine's successful check cannot qualify a different executor. Missing or mismatched digests deny live-route preparation, disclosure and execution before provider I/O. Older records may remain as historical evidence with no digest, but cannot activate a live route. The explicit synthetic and customer-handoff paths do not acquire live qualification through this gate.

Generate the manifest in the actual target environment with `python -m ai_engine.services.release`; see [setup](../reference/SOURCE_REFERENCES.md#source-8f929a906ccd). Package hashes use relative names and exclude generated bytecode; the inventory contains no secret/environment values or workstation paths. The digest is pinned once per process. Deploy immutable package/environment files and restart all affected processes after changes; editing files in a running deployment is unsupported. Any packaged-content, Python or installed-version change requires qualification for the new digest, including an unrelated provider instruction change or an added development dependency. Do not stamp old acceptance records with the new digest without reviewing affected evidence. This local content/version inventory is not a signed image attestation and does not verify patched dependencies under unchanged versions, the OS/Chromium image, external authority code or actual vendor compatibility. Those remain separate deployment/provider qualification requirements.

The Rider client and registered execution path are described below. Its standalone DELETE client is not a task cancellation/refund capability; acknowledgement does not prove final cancellation or payment reversal. Uber's [migration table](https://developer.uber.com/docs/riders/guides/migration-steps) retains exact-request DELETE and replaces receipt retrieval with the trips-app deep link. That table does not establish a fee-bound cancellation preview or consumer refund contract. Do not invent those operations, assume cancellation is free or treat a receipt/deep link as payment settlement. Qualify the actual product/account and current fee/approval/source-evidence contract first.

## Uber Rider task execution

`api_profile.product: uber_rider` uses the documented [products endpoint](https://developer.uber.com/docs/riders/references/api/v1.2/products-get), [upfront-fare/request tutorial](https://developer.uber.com/docs/riders/ride-requests/tutorials/api/curl) and [request contract](https://developer.uber.com/docs/riders/references/api/v1.2/requests-post), with applicable entitlements from the [migration guide](https://developer.uber.com/docs/riders/guides/migration-steps). This path is registered in the engine and shared authenticated executor. Current qualification uses local HTTP protocol fixtures and actual Go authority with synthetic funding; it is not evidence of real Uber compatibility, access or payment adoption. No live profile is shipped, and the reference Go authority still rejects non-synthetic financial activation.

Typed Rider creation/preparation/observation performs no inference and uses qualification `model_route: none`. It still enforces current authority, source/content policy and retention; it does not grant model disclosure. Natural-language capture remains a separately authorized model call. An incomplete executor observation fails rather than falling back to a model or local Chromium.

The customer supplies selected `ride_locations` and `ride_order: {product_id, payment_option_id, timing: immediate}`. Missing selections produce task-bound structured questions and `ride_options` containing source product IDs/labels and customer-scoped payment aliases. Products preserve provider order; this implementation excludes pooled and non-upfront products and never substitutes another product. A products response alone does not prove availability. A subsequent upfront estimate must provide a fare ID, amount/currency, pickup estimate and unexpired source deadline. Scheduling is unsupported by this route; no current-location, last-used card or time is inferred.

Rider credentials are resolved in the separate executor process from an explicitly configured [customer connection catalogue](service-api-accounts.schema.json), not from `api_profile.credential_env`, SDK arguments, chat or the engine worker. Exact tenant/member/client/agent/grant bindings select one enabled, unexpired connection and its approved payment aliases. Only the executor sees the OAuth secret and provider payment reference. The development resolver reads an environment secret reference; this is not the authority-owned production vault or a qualified OAuth enrollment/refresh/revocation service. Tenant connection enrollment must verify provider subject, entitlements and permitted payment-method ownership. Catalogue edits cannot substitute for that evidence. Real-user adoption remains gated by legal/content, credential/egress and funding qualification.

Preparation retains encrypted private fare/selection metadata, without tokens, under the existing task lifecycle. The public quote's `provider_binding_digest` binds the precise fare, product, points, payment and connection version into the protected approval and Go operation. Existing quotes without that field preserve their canonical digest. The locked fare is reused only within its source/connection expiry; an expired quote is refreshed before approval. Unknown arrival/cancellation terms remain explicitly unknown, not free or guaranteed. Actual issuer/funding inspection must independently validate the payment mapping, source terms and enforceable charge limits before real spending; provider confirmation is not bank acceptance or settlement.

Before POST, the shared executor rechecks current authority and exact terms, records the durable physical-attempt fence and obtains one independent dispatch permit. It sends the explicitly selected provider payment reference, never Uber's implicit last-used method. The private binding is verified before dispatch and again before egress. A 202 processing response projects `submitted`, distinct from driver acceptance (`confirmed`), an in-progress trip and completion. The provider request ID is persisted before replying to the worker. Recreated executors read that exact ID for reconciliation/tracking. If the response/ID was lost, the operation remains uncertain: no retry and no adoption of `/requests/current` or another trip. Bounded recovery requires authoritative identification/support rather than a replacement request.

The executor consumes the authority's full dispatch receipt, including its actual expiry, rather than discarding it after an integer version check. Task, provider, route, quote, operation, mandate and caller bindings must match. The receipt is short-lived (at most 30 seconds), clipped to the task/quote/customer proof; its deadline reaches API and Playwright network execution. An expired receipt or one that expires during execution cannot permit a new provider write. Only explicit synthetic test authorities may use the legacy integer-permission shim; live effect routes require the bound receipt.

API account access loss pauses tracking for connection renewal while preserving the last observation; authenticated resume still needs the same verified connection identity and current grant. It grants no new effect or budget. Fare, receipt and physical-attempt artifacts cannot outlive the original task's content expiry; separate bounded replay markers remain governed by existing policy. This route has no browser takeover, screenshot, model-driven action, provider cancellation or refund command. The existing [tracking contract](#bounded-post-confirmation-tracking) and [SDK contract](SERVICE_SDK.md) govern customer projection and monitoring-only stop.

## Consumer API products

The engine implements read clients for the products below. Select one `api_profile.product` per trusted tenant/provider route; a supplied key does not select a product, enable a route or confer booking authority. `mode: api` requires the exact product origin, recorded legal/qualification references, `api_profile.live_enabled: true` and a `content_policy_reference` covering source disclosure, presentation and retention. No live profile is shipped. Synthetic tests use explicit loopback sources with the same wire contracts; they do not establish vendor entitlement or compatibility with a partner deployment.

| Product | Implemented operations | Credential and boundary |
| --- | --- | --- |
| `uber_estimates` / Uber | `GET /v1.2/estimates/price` and `/v1.2/estimates/time`; join price ranges and pickup ETAs by product ID | Server-held OAuth Bearer token with approved `ride_request.estimate` entitlement. Customer/tenant selects both coordinates. Preserve source order and unknown/metered prices; no competitive ranking. Prices are estimates, never locked fares or trip requests. |
| `opentable_availability` / OpenTable | Consumer v2 `GET {base_path}/v2/availability/{rid}` for the exact selected local quarter-hour and party size | Partner Consumer API Bearer token, approved platform base prefix and explicit restaurant/timezone allowlist. Reject timezone/selection mismatch and ambiguous DST times. No slot locks, experiences, card-secured results or reservation writes. An absent displayed price or deposit currency remains unknown. |
| `google_places` / Google businesses | Places Text Search (New), fixed `places.id` mask, at most five place IDs and documented Google Maps links | Server API key for the Places project. Original customer query and source-grounded area; no copied provider names, addresses, reviews or coordinates. IDs-only search is separate from Maps MCP content. |
| `maps_mcp` / Google businesses | Existing bounded MCP `search_places` discovery with attributed sources | Separate authorized Maps agent-tools key/product and approved Grounded Output mapping. Source content and private rendering token never become model input; the token is not retained. |

Credentials are resolved only from each profile's `credential_env` in the separate authenticated executor. The API/worker requires the configured executor RPC and performs no provider-key lookup, direct vendor HTTP or local-browser fallback for these products. Its internal `api_read` call carries only the task ID, expected task revision and exact route digest under workload authentication and audience-bound customer proof. The executor independently loads the caller-bound task, checks current qualification/authority, active phase/lease, deadline and debited action budget, and derives all provider inputs from that task. RPC arguments cannot supply an endpoint, credential, query, coordinates or restaurant selection.

The executor records one encrypted, caller-bound read-attempt marker per task revision before provider I/O. It retains only opaque task/route binding under the existing artifact/task expiry; it is not a source-result cache or monetary reservation. Repeated RPCs at that revision cannot repeat source reads, including when the worker has not yet stored the result. Read calls use a separate concurrency pool bounded by `service_browser_max_sessions`, without creating a Chromium session or consuming an idle-browser lease. The worker still owns the retained action debit and source-result persistence; a new attempt must follow the task lifecycle and consume its own budget.

API tasks share current customer/tenant/provider authority, route fingerprints, deadlines, retained action budgets, revision checks and encrypted cleanup. Authority is checked before each Uber read and before publishing any result; the worker rechecks revision/access after the RPC. Replay repeats no read; missing access, rate limits, redirects and invalid data fail without browser fallback or automatic retries. Source results remain outside model context. They return phase `discovered`, an observation time and typed `api_result` (or MCP `discovery`), with no monetary quote, approval, financial operation or booking outcome. Structured `ride_locations` and `booking_search` arrive at creation or through revision-bound answers/corrections; models cannot invent them. Browser controls are unavailable for these tasks. Executor-local environment resolution remains development bootstrap; authority-owned vault enrollment/injection, independent production egress isolation and actual vendor qualification remain prerequisites.

Use Uber's [migration guide](https://developer.uber.com/docs/riders/guides/migration-steps), [price estimates](https://developer.uber.com/docs/riders/references/api/v1.2/estimates-price-get) and [time estimates](https://developer.uber.com/docs/riders/references/api/v1.2/estimates-time-get): legacy server tokens are deprecated. An operator obtains and securely reuses the estimate token through the documented client-credentials exchange; the engine does not regenerate it per search or accept a rider token in chat. Rider booking and Guest Rides require separate products, scopes, customer/funding adoption and effect qualification. The [OpenTable Consumer v2 documentation](https://docs.opentable.com/) publishes relative availability paths; confirm the base prefix and authentication with the partner agreement. Never infer `/consumer` from a token or substitute restaurant-management/Voice AI credentials. No OpenTable OAuth exchange is guessed or exposed as an engine endpoint.

Read-only `service.google_businesses` capture can opt into [verified interpretation reuse](../reference/SOURCE_REFERENCES.md#source-3cb883e461bb). A reviewed candidate retains only the exact customer request as its encrypted typed goal, with current route/instruction bindings; it cannot supply remembered places, coordinates, prices or results. A hit skips intent capture while the existing location, authority, budget and fresh-source workflow still runs. Route/instruction changes invalidate the key, including changes observed after lookup awaits. This does not enable service-effect shortcuts or confer provider qualification; no production reuse approvals are shipped.

Uber Eats and Rappi merchant/POS APIs and Docplanner clinic-software APIs do not grant consumer ordering or patient-marketplace access. No such API adapter, or unverified DiDi consumer endpoint, is implemented. Keep the distinct browser preparation contracts and obtain the relevant consumer/partner contract before adding API effects. API keys alone do not make those flows available. Apply the legal/ISO obligations below, including LR-01/02/03/04/10/11/12/13; counsel and tenant/vendor prerequisites remain external approvals.

## Google Maps route and data boundary

Google's [Maps Experience agent tools](https://developers.google.com/maps/ai/maps-experience-agent-tools), formerly Maps Grounding Lite, are a model-neutral MCP candidate, separate from Gemini's built-in Maps grounding. The endpoint is `https://mapstools.googleapis.com/mcp`. A working Gemini credential does not prove Maps service authorization. Keep credentials and tool selection server-owned. Initially allow search/resolution only; enforce the Essentials limits in code, including at most five places and no extended details unless explicitly enabled.

The [agent-tools requirements](https://developers.google.com/maps/ai/maps-experience-agent-tools#policies-and-terms-of-service) require compatible LLM data handling and Google Maps source links alongside supported output. The current model configuration is not qualification. Preserve source associations, restrict model disclosure and use transient presentation by default; do not copy provider content into durable task fields or inference caches without an approved product/purpose mapping. Grounded output remains source content, not independent place evidence.

For a conventional [Places Text Search API](https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places/searchText) adapter, `POST /v1/places:searchText` uses a required `textQuery` and an explicit minimal field mask. This is a different product/data contract from agent tools. The [Places policies](https://developers.google.com/maps/documentation/places/web-service/policies) restrict storage except permitted cases and require attribution. The [service-specific terms](https://cloud.google.com/maps-platform/terms/maps-service-terms) distinguish place-ID retention, coordinate caching and map usage; do not assume a general task TTL grants storage permission. Confirm the applicable product, region and contract before copying Google-derived points into another provider's flow or map. Customer selection does not automatically remove every source restriction. Agent-tools terms separately permit purpose-bound storage of Grounded Output, including specified evaluation/display and chat-history uses; those exceptions do not authorize retaining arbitrary raw provider payloads or changing this engine's retention periods. Confirm the applicable exception before implementation. Legal interpretation stays pending under LR-01/02/03/13 and the existing compliance controls. No Maps API, MCP route or LLM disclosure is enabled by these findings.

The [search client](../reference/SOURCE_REFERENCES.md#source-d16c90e19b62) implements `search_places` with JSON/SSE replies, typed sources/attribution, bound citation indexes, no redirects/retries and a bounded response/deadline. It supports Essentials search only, excludes the private rendering token from ordinary serialization, and rejects credential echoes even after JSON decoding.

### Development discovery tasks

`service.google_businesses` uses a dedicated discovery path through the existing authenticated turns/service-task API. The legacy synthetic route requires an explicit loopback origin, `/mcp`, `maps_api_key_env` and no browser selectors or effect paths. `maps_language_code` and `maps_region_code` are trusted presentation configuration, not evidence of the customer's location. Legacy real `api` candidates without an explicit product profile still fail with `service_provider_unqualified`. The newer `maps_mcp` profile uses the [consumer API gates](#consumer-api-products); no qualified live profile is shipped.

The model sees only the approved customer goal and instruction guide. It identifies an explicit search area/landmark by copying a source substring, or asks for the missing area. Missing location produces `needs_input` with `required_input: search_location`; a task/revision-bound answer resumes the same task. The source query preserves the original goal and raw clarification with whitespace normalized. Endpoint, credential, query, result limit and SKU are not model-selected. Each model attempt consumes the retained inference/day budget; each MCP read consumes the retained action budget before I/O. Current authority, revision and deadline checks surround model/source work. Provider failure does not trigger a client retry or browser fallback.

Successful discovery has phase `discovered`, an engine-observed timestamp and a typed `discovery` containing the source summary, places, Google Maps links and attribution. It has no monetary quote, approval or provider booking outcome. Replay/read does not run another search. Consumers render the summary as untrusted text and place required source links beside it; source links are data, not permission to contact a business or visit another destination. Browser takeover/view/actions are unavailable for discovery.

Executed development checks retain only synthetic fixture results in the encrypted task under its existing cleanup/replay lifecycle. The temporary source-area copy is removed at terminal transition; the private rendering token is never retained. Maps results are not supplied to a subsequent model call or conversation capture. The actual Go authority development check confirms the read uses current service authority without financial preparation or bank effects. Native source presentation, real Maps project access, applicable Grounded Output retention/disclosure mapping and independent acceptance remain unqualified. Resolution, weather and routes are not implemented by this search path.

## Consumer browser adapters

The consumer browser path covers Uber Eats, Rappi, OpenTable, Doctoralia, Google Maps/businesses, DiDi rides and DiDi Food. These are DOM/network adapter contracts awaiting actual account/site qualification, not seven verified live integrations. Keep `site_profile.live_enabled` false until the actual consumer flow, geography, permitted destinations, source selectors and data handling are recorded and verified. DiDi's [Mexico passenger site](https://web.didiglobal.com/mx/pasajero/) and [Food site](https://web.didiglobal.com/mx/food/) direct customers to apps; an authorized account does not establish a usable web booking/ordering flow. Do not invent one.

The [Uber Eats Marketplace API](https://developer.uber.com/docs/eats/guides/getting-started) and [Rappi integration portal](https://dev-portal.rappi.com/en/getting-started/) serve merchant integrations; the [Docplanner API](https://integrations.docplanner.com/guide/) is limited to medical software providers and customer-authorized resources. They are not consumer ordering/appointment APIs for this concierge. [OpenTable](https://docs.opentable.com/) separately requires partner approval and distinguishes visually presented Consumer API reservations from Voice AI bookings. The browser adapters do not impersonate those API partnerships.

A trusted route selects `site_profile`, its version, exact origin, observed field/button selectors, connection landmarks, and reviewed request rules. A model receives semantic controls and permitted values, never selectors, account files or credentials. Ordinary page elements provide source facts; no injected JSON script or invented provider quote/status endpoint is required. Preparation-only DOM routes reject `allow_commit`, synthetic commit/status/quote-validation paths, and financial approval. Their proposals offer Change/Takeover/Cancel without an Approve action. Provider submission, cancellation, refunds, tracking and source reconciliation need their own verified execution/funding contracts; a ready proposal is not a booking/order.

Food proposals require merchant, fulfillment/address, items, fees, tip, discounts and payment label. OpenTable requires restaurant/location, local date/time, party size, experience and cancellation terms. Doctoralia requires practitioner/service, modality/location, local time, duration and cancellation terms; patient identifiers and secret inputs stay in protected takeover. Ride proposals require pickup/dropoff, ride type, pickup/arrival estimates, requested schedule, cancellation terms and payment label. A priced proposal needs a visible amount and a reviewed exact currency label, including declared inline currency forms. With `price_optional` explicitly enabled for OpenTable/Doctoralia, complete service terms can instead return `browser_proposal` with an unknown/incomplete-price status and no monetary quote; this never implies free service. Missing, duplicate, secret-bearing or ambiguous values cannot become a complete priced proposal. Terms are captured in one page evaluation to avoid mixing DOM revisions. The `dom_` quote ID is an engine snapshot fingerprint, and expiry is a bounded observation lifetime, not a provider fare lock or availability guarantee. Customer messages render source values as literal data rather than executable Markdown links/HTML.

Maps browser discovery uses at most five visible named source links with Google Maps attribution, separately from the MCP result. It requires a source-grounded search area, fills the query from the original goal and clarification rather than a model rewrite, returns `browser_discovery`, and does not turn search results into an appointment or monetary quote. Results stay outside subsequent inference. Maps product-specific source, storage and presentation restrictions still apply; do not select browser access to bypass the earlier data contract.

Network rules bind exact HTTPS origins, methods and paths. POST rules cannot authorize a subtree; a shared GraphQL endpoint additionally needs reviewed operation names and exact SHA-256 query-document/persisted-query hashes. Names alone cannot authorize a changed mutation; duplicate request fields are rejected. Unlisted requests are blocked, including unknown order/booking operations. Optional blocked assets do not require enabling analytics vendors. Blocked document/fetch/XHR requests stop preparation. Auth redirects and connection landmarks offer protected customer takeover, with account/OTP fields excluded from model observations. Screenshots remain protected customer views.

The browser owner reads `ENGINE_SERVICE_BROWSER_ACCOUNTS_FILE` using the generated [account-reference schema](service-browser-accounts.schema.json). Bind each reference to verified tenant, membership and provider; its `state_file_env` names an operator-held absolute Playwright storage-state path. Cookie/local-storage content never enters task/model/telemetry state. Reject unrelated cookie domains/origins and missing or malformed files without another account fallback. Each task receives a separate browser context, and concurrent tasks cannot edit the same member/provider account. Releasing a context leaves the operator-owned state file untouched. A saved profile does not grant task authority or prove site access/qualification. See [setup](../reference/SOURCE_REFERENCES.md#source-8d389323b530).

The proposed [service SDK/app contract](SERVICE_SDK.md) defines consumer adoption of current task APIs and explicitly separates proposed post-submission controls from implemented wire commands. Native app/SDK rendering remains externally owned.

### Native browser checkout

An optional reviewed `site_profile.checkout` adds an exact same-origin JSON POST, final selector, closed payload template, private DOM bindings, native response-reference path and original-reference status page/selectors. This is a development execution mechanism, not a qualified provider profile. `allow_commit` additionally requires bounded tracking and the shared authenticated executor; the API/worker cannot execute it through local Chromium. Unknown/free booking prices and discovery are unsupported by this priced path. Show complete terms and an explicit payment label before protected approval. No actual checkout selectors, partner endpoints or live profiles are shipped.

The source must atomically enforce a quote-lock/version covering all approved material terms and reject changed/expired terms without charging. Record that independently verified property in `precondition_reference`; a cart ID, DOM hash or arbitrary reference string is insufficient. Capture displayed terms and private lock/payment values in one page evaluation. Bind the complete rendered native payload digest into the public quote/authority approval; keep the payload and private values inside the executor. A changed lock/payment/total/currency or any extra native field cannot use the old approval. Native scalar types remain distinct; numeric booleans and duplicate JSON keys are rejected. Shared GraphQL preparation must use disjoint reviewed operations/documents.

Only trusted checkout execution can arm one final POST under the existing durable physical-attempt fence and actual dispatch expiry. Model actions and customer takeover cannot authorize it. The gateway forwards the native body without injecting operation IDs, prices or idempotency headers, follows no effect redirect and performs no effect retry. A successful native response with an exact provider reference first means `submitted`. The owner stores that minimal reference/outcome in an encrypted caller/task/operation/quote/route-bound artifact before replying; subsequent read-only reconciliation verifies the original status page, reference, total/currency and mapped source state. Missing IDs remain uncertain without current-order/list adoption or another checkout. Confirmation, fulfillment, payment and refunds remain separate facts.

Qualification must still establish the actual consumer flow, source precondition semantics, permitted browser/account access, native request/response/status shapes, funding/charge-limit/credential isolation and independent acceptance. The reference Go authority continues to reject non-synthetic financial activation. Local source fixtures demonstrate this machinery only; they do not establish Uber Eats, Rappi, booking or DiDi support. Provider cancellation/refunds remain separately unavailable.

## Integration contract required for each provider

Each provider specifies the following before its capability can be enabled:

| Area | Required rule |
| --- | --- |
| Capability and route | Declare search, quote, prepare, commit, cancel and track separately. Identify API, browser, customer handoff or external executor, supported geography and limitations. Never imply an official partner API from browser automation. |
| Trusted selection | Resolve adapter, approved destinations, credentials, capabilities and callback destinations from trusted configuration for the verified tenant/caller. Model text, page content and client URLs cannot extend access. No silent cross-tenant, cross-provider or fixture fallback. |
| Inputs and output evidence | Define typed inputs, exact money/currency, timezones, source observation/freshness, provider IDs, errors and evidence for each outcome. Preserve actual terms rather than inferred success. |
| Connection and data | Define protected connection/takeover, session scope, permitted fields, source of preferences, retention and deletion. Declare passenger, appointment and location-data needs and minimize disclosure. |
| Authority and commitment | Separate preparation from commitment. Enforce current mandate, approval, resource and spending limits at the trusted execution boundary; revalidate material terms immediately before commitment. |
| Durability | Bind idempotency to the intended operation, record attempts and effects durably, reconcile uncertainty, and define cancellation/refunds independently. Reauthentication and retries do not replenish budgets or extend the mandate. |
| Event delivery | Correlate task, caller, event ID, sequence/revision, source time and question ID where applicable. Authenticate source events, prevent replay, deduplicate retries and tolerate reordering without regressing state. A duplicate must not repeat the effect or customer message. Wire authentication and recovery must be agreed with the actual provider; no shared callback signing scheme is selected here. |
| Browser operation | Observe current state, act within the approved route, verify results and recover or request help. Page landmarks and selectors are hints; changed layouts or challenges must not trigger blind clicks, authentication bypass or invented success. |
| Qualification | Record disabled, synthetic-only, preparation-only, independently accepted and production-enabled scopes separately. Test approved flows, stale prices, changed pages, revocation, duplicate events, uncertain submission and absence of unauthorized effects. Maintain a provider kill switch. |

Skills supply concise instructions and reference material for these operations, including use of approved Playwright or browser-use tools. Detailed guidance loads only when relevant and is versioned for the task. Tools/adapters own executable operations; [ADR-007](../decisions/007-inference-reuse-and-cache-boundaries.md) defers executable skill packages and interpreters. A skill's presence does not qualify its provider or grant access. A permitted unfamiliar site can use the general agent observation/action/verification loop without a dedicated skill.

## Provider-specific requirements

This catalogue defines intended integration coverage. None of these provider routes is enabled or qualified by this document; inspect the actual registry and linked verification for support. Revalidate site flows before implementation rather than treating observed UI details as permanent APIs.

| Provider | Intended goals | Rules and capability boundaries |
| --- | --- | --- |
| Uber rides | Quote, prepare immediate or scheduled rides, submit, cancel and track | Distinguish immediate and scheduled quotes; show pickup window, estimated arrival, ride type and cancellation terms. Detect provider confirmation after one authorized submission and reconcile before another attempt. Provide tracking when supported; driver assignment and trip completion are separate observations. |
| Uber Eats | Search/menu, usual order, cart, delivery/pickup, submit and track | Connect the account when needed for personalized availability. Preserve branch, modifiers, quantities, substitutions, address, fees, tip and final total. Recheck at checkout; habitual items are proposed choices. |
| Rappi | Food, groceries and shopping preparation, submit and track | Qualify each category and geography separately. Specify unavailable-item substitutions, quantity/weight differences, merchant choice and final charges; reapproval follows material changes. Never reuse another provider's session. |
| OpenTable | Restaurant discovery, availability and booking | Specify restaurant, local date/time, party size, seating/experience, deposits and cancellation/no-show terms. Account or phone/email verification uses a protected flow; a held slot or prepared form is not a reservation. |
| Doctoralia | Practitioner discovery, available slots and appointment preparation/booking | Specify practitioner, service, location or remote modality, time, price and required patient information. Protect health-related data and verification. Do not claim an appointment from search availability or a draft. |
| Google Maps/businesses | Discover and compare local services; prepare an appropriate next action | Distinguish discovery from booking through a business's own site. Qualify that destination independently. A phone/WhatsApp link or message draft is a customer handoff, not proof of contact or booking; sending or calling requires a separately enabled capability and authority. |
| DiDi rides | Candidate ride integration or customer handoff | Keep automated quote/request/scheduling disabled until a supported, permitted route is demonstrated. Do not invent a web flow or use private endpoints to simulate app support. Offer a disclosed customer handoff or an explicitly chosen qualified alternative. |
| DiDi Food | Candidate food ordering integration | Keep effectful operation disabled until connection, search, address/cart, payment and provider confirmation are independently qualified on the permitted route. Offline/fake-page checks alone cannot qualify ordering. |
| Other providers | Flights, hotels, salons, spas and other services | Apply the same contract, with provider-specific passenger/contact requirements, terms and evidence. Category recognition does not establish execution support. |

## Compliance and adoption

Apply [COMPLIANCE.md](../policies/COMPLIANCE.md) and [legal-register](../compliance/LEGAL_REGISTER.md) entries LR-01/02/03 for personal/financial data and providers, LR-04 for authentication, LR-10/11 for marketing and consumer protection, LR-12 for approval/evidence, LR-13 for site access, LR-15 for cardholder scope, LR-16 for voice and LR-18 for messaging. Target ISO/IEC 27001 controls 5.12, 5.14–5.23, 5.31, 5.34, 8.3, 8.5, 8.10–8.12, 8.15, 8.24, 8.26 and 8.29; ISO/IEC 42001 A.5.2–5.4, A.6.2.2–6.2.4, A.6.2.7–6.2.8 and A.7–A.9. These identify engineering review obligations, not legal approval or certification. New destinations/vendors, real-tenant model disclosure, cardholder processing and production activation remain disabled until their recorded prerequisites hold.
