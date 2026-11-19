> **Imported context ? Ideeo-IA-general ? working-tree reference, 2026-11-18.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../../README.md).

# Ideeo: independent architecture and repository comparison

**Assessment date:** November 17, 2026  
**Scope:** Read-only research of the local Ideeo and OpenMaus repositories, current upstream implementations, canonical product contracts, historical test evidence and relevant local development sessions.  
**Artifact requested by:** Mateo, after the conversational report.  
**Status:** Research and proposals; not an implementation plan approved for execution, an ADR acceptance, independent human acceptance, or production authorization.

This file preserves the full substantive report delivered in the conversation and adds the supporting research ledger, implementation details, qualifications and comparison design. It leaves the earlier report, [ideeo-openmaus-runtime-comparison-implementation.md](ideeo-openmaus-runtime-comparison-implementation.md), unchanged. That earlier report was treated as a set of hypotheses to verify.

## 1. Recommendation and confidence

**My recommendation is to retain Ideeo’s domain foundation and replace a substantial part of its conversational and research orchestration. Start with PydanticAI core as the Python implementation candidate, and use Pi’s agent core as the strongest architectural challenger. Do not migrate the entire product into another application at this point.**

That is a recommendation for a substantial architectural change, not for continuing to patch the current pipeline. The replacement should remove the existing planning, repair, task-control and presentation choreography from the new execution path. Adding an SDK underneath that choreography would preserve much of the problem.

My confidence is:

- **High** that product boundaries, authority, tenant adapters and effect reconciliation should remain independent of the conversational runtime.
- **High** that the current conversation/research orchestration warrants simplification.
- **Medium** that PydanticAI is the best implementation choice. Its Python fit is attractive, but Pi has a particularly clear reusable loop and could prove simpler.
- **Low** that any candidate has already demonstrated better end-to-end behavior for Ideeo. The available experiments do not establish that.

The strongest uncertainty is whether replacing the runtime will remove enough complexity after preserving the controls Ideeo actually needs. Some observed failures come from evidence, history and lifecycle contracts that **no agent library fixes automatically**.

Parallel research and independent agent review were used. Implementation was inspected rather than relying only on READMEs. During the research, no repository changes were made. No packages were installed, downloaded applications executed, inference run, services deployed or customer systems contacted. Creating this new file is the subsequently authorized documentation action.

## 2. Baseline: current local dev and pending work

The required startup commands were executed separately:

- git worktree list
- git branch --show-current
- git rev-parse --short HEAD
- git rev-parse --short dev
- git rev-list --count HEAD..dev

| Item | Observed state |
|---|---|
| Active worktree | C:/Users/mateo/Desktop/Ideeo-IA-general |
| Active branch | feat/engine-owned-openmaus-browser |
| Active HEAD | 68749d1 |
| Local dev | 68749d1 |
| Commits in dev missing from HEAD | 0 |
| Local OpenMaus branch | main |
| Local OpenMaus HEAD | 263d9b79b1164510718994d65dd678f266a61b3e |

The earlier assessment’s reference commits happen still to match these local committed baselines. This was verified rather than assumed.

No fetch was performed, so the report establishes the state of **local dev**, not freshness against Concierge.

The Ideeo checkout contains significant uncommitted work: OpenMaus deployment changes, adapter and worker changes, a new engine binding, vendoring machinery and upstream source, tests, documentation changes and proposed ADR-016. The previous comparison report is also untracked. OpenMaus itself has an untracked evaluation document.

These are three separate evidence categories:

1. Committed Ideeo at 68749d1.
2. Pending engine-owned OpenMaus implementation.
3. Historical deployments and experiments, sometimes based on other commits or fingerprinted dirty trees.

They must not inherit each other’s qualifications.

### 2.1 Uncommitted state observed before this artifact

Modified:

- .gitattributes
- .gitignore
- README.md
- deployment/openmaus/Dockerfile
- deployment/openmaus/vm_bootstrap.sh
- docs/contracts/SERVICE_INTEGRATIONS.md
- docs/decisions/README.md
- docs/development/ENGINE_SETUP.md
- src/ai_engine/browser/openmaus.py
- src/ai_engine/settings.py
- tests/test_openmaus_deployment.py
- tools/openmaus/worker.mjs

Deleted:

- tools/openmaus/host-hook.mjs

Untracked:

- docs/decisions/016-engine-owned-openmaus-browser-runtime.md
- output/ideeo-openmaus-runtime-comparison-implementation.md
- scripts/openmaus_vendor.py
- tests/test_openmaus_vendor.py
- tools/openmaus/README.md
- tools/openmaus/engine-binding.mjs
- tools/openmaus/engine-mcp.test.mjs
- tools/openmaus/engine-model.test.mjs
- tools/openmaus/engine-runtime.test.mjs
- tools/openmaus/upstream/

The local OpenMaus checkout contained untracked BROWSER_EVALUATION_AND_PROPOSAL.md. These changes were preserved.

### 2.2 Canonical context and ADR interpretation

The canonical product, UX, interface, authority, tenant, host-banking, background-task, lifecycle, methodology and verification documents were reviewed, including:

- [AGENTS.md](../SOURCE_REFERENCES.md#source-a54ff182c7e8)
- [README.md](../SOURCE_REFERENCES.md#source-b33563055168)
- [Project context](../../product/PROJECT_CONTEXT.md)
- [Integration context](../../product/INTEGRATION_CONTEXT.md)
- [UX](../../product/UX.md)
- [ADR index](../../decisions/README.md)
- [Shared interface](../../contracts/SHARED_INTERFACE.md)
- [Tenant backends](../../contracts/TENANT_BACKENDS.md)
- [Authority](../../contracts/AUTHORITY.md)
- [Host banking](../../contracts/HOST_BANKING.md)
- [Background tasks](../../contracts/BACKGROUND_TASKS.md)
- [Service integrations](../../contracts/SERVICE_INTEGRATIONS.md)
- [Data ownership and lifecycle](../../product/DATA_OWNERSHIP_AND_LIFECYCLE.md)
- [Verification index](../development/VERIFICATION.md)
- [Methodology](../../policies/METHODOLOGY.md)
- [Testing ownership](../../policies/TESTING_OWNERSHIP.md)
- [Compliance](../../policies/COMPLIANCE.md)
- [Legal register](../../compliance/LEGAL_REGISTER.md)

The October 27–November 17 development history and relevant local Codex session records were reviewed. Session summaries were used to locate and cross-check work, not as independent acceptance evidence. Private prompts, credentials and unrelated session contents were not exported.

ADR status distinctions matter. ADR-003 is not an accepted universal endorsement of LangGraph. ADR-015 authorizes an OpenMaus trial rather than completing adoption. ADR-016 is pending work, with independent acceptance still outstanding. Native-host banking and tenant-channel boundaries are product requirements with scoped implementation records, not proof that every tenant integration is qualified.

More specifically:

- ADR-001, ADR-002 and ADR-003 are proposals with scoped implementation records.
- ADR-008 is accepted.
- ADR-010 and ADR-011 establish confirmed product boundaries with scoped engine implementation; native tenant adoption remains separate.
- ADR-012 and ADR-013 have scoped development implementations with independent acceptance pending.
- ADR-014 records a design direction whose detailed contracts remain proposed.
- ADR-015 authorizes the OpenMaus trial; adoption remains pending.
- Pending ADR-016 describes an authorized implementation scope, not completed independent acceptance.

## 3. Product requirements used to judge alternatives

Ideeo is a shared multi-tenant engine. PayMe is a tenant and its Armony connection is one example, not a universal backend.

The comparison preserves these requirements:

- Different tenants can have different banking adapters, endpoints, credentials and capabilities.
- Backend selection comes from trusted server configuration, never arbitrary client text or model output.
- Tenant/member/client/agent/mandate scope is substantive, beyond chat-history separation.
- Independent authority owns permissions, mandates, approvals, revocation and execution admission.
- Financial effects need stable operation identity, idempotency and reconciliation after uncertain outcomes.
- The engine owns authenticated APIs and conversational reasoning.
- Tenant backends own enrollment execution, account creation and channel-specific integration.
- Native-app banking uses engine intent inference and host-owned protected screens/authentication.
- Native-host balance/history values must not enter chat or model context.
- WhatsApp, delegated bank AI and external agents using banking APIs under mandates are different paths.
- Persistence, replay, retention, erasure, cancellation, recovery and disclosure checks are part of the product.
- Public research must maintain attribution, distinguish verified facts from gaps and remain useful in conversation and reloaded history.

A proposed architecture, source file or feature claim does not establish that all these requirements are qualified in a live tenant integration.

## 4. The coupling concern is supported by code

The identified hotspots remain relevant.

| Committed file under src/ai_engine | Approximate size | Relevant concentration |
|---|---:|---|
| capabilities/assistant.py | 3,939 lines | AssistantService._run spans roughly 1,405 lines |
| capabilities/planning.py | 2,018 | CapabilityPlanner.capture spans roughly 1,140 lines |
| capabilities/presentation.py | 1,742 | Large progress, assessment and final-message branches |
| browser/public_tasks.py | 2,406 | Research lifecycle, evidence, assessment, presentation and worker coordination |
| browser/public_site.py | 2,508 | Browser execution and observation processing |
| browser/openmaus.py | 500 committed | Adapter reaches into task, assistant, repository and budget ownership |
| background/service.py | 899 | Composition and lifecycle ownership |
| background/worker.py | 166 | Small itself; participates in the larger ownership chain |

Size alone would not justify replacement. The stronger evidence is how responsibilities interact:

- AssistantService._run combines conversation decisions, task controls, private banking handling, dispatch and presentation.
- CapabilityPlanner.capture builds a dynamic structured-output contract, invokes inference, repairs output and reconstructs the typed plan.
- BackgroundService.__init__ borrows the assistant’s repository and settings, constructs research components, assigns assistant.mission_runtime and mutates assistant handlers. That is concrete circular ownership.
- PublicResearchTasks.checkpoint both persists research progress and invokes presentation.
- PublicResearchTasks.advance handles source acquisition, requirements, assessment, completion, presentation, cleanup and budgets.
- The OpenMaus adapter reaches through tasks.background.assistant, so replacing the browser does not sever the orchestration coupling.

The history shows sustained repair activity in these areas. That is evidence of maintenance pressure, not proof that every repair was unnecessary or that a rewrite will succeed.

There is an important correction to a possible diagnosis: **the current default LangGraph usage is a thin, essentially single-node control wrapper.** The bespoke pipeline carries most of the complexity. Replacing LangGraph alone would accomplish little. There is no separate persistent LangGraph checkpointer in that default wrapper.

### 4.1 A specific history defect

In [history.py](../SOURCE_REFERENCES.md#source-ad0ef9815705), transcript selects a generic failure message when the resource status is failed, before rendering otherwise safe persisted outcomes.

Meanwhile, AssistantService.fail in [assistant.py](../SOURCE_REFERENCES.md#source-4a066f417fc2) can construct and save a useful partial answer while retaining failed task status.

That combination explains how a useful answer can appear live and disappear after reload. It separates:

- Whether the task completed successfully.
- Whether a useful, authorized answer exists.

A new runtime would still exhibit this defect if the history contract remained unchanged.

This is a code-supported explanation of the retained observation, not a fresh runtime reproduction.

### 4.2 Historical evidence and its limits

The retained November 17 review records 47 live turns across 11 conversations: all returned HTTP 200, while two ended in provider_invalid_output. Corrections and side conversation worked in some cases; broad follow-up and retry failed despite retained evidence; a narrower request could use saved examples without creating a new task. Useful fallback content disappeared on reload.

That campaign used synthetic PayMe application context in a development environment with a real model, on a fingerprinted increment over an earlier revision. It is not a clean qualification of all functionality at 68749d1.

Earlier campaigns recorded evidence attribution, correction, cancellation and research-completion failures, followed by improvements. Some later failures involved quotas or test-harness limits. Those observations should not all be attributed to architecture.

The available records do **not** identify the precise rejected model-output field behind every broad-follow-up failure. Claims that a particular schema or planner branch caused those failures remain hypotheses.

The [verification index](../development/VERIFICATION.md) is the appropriate entry point to those reports.

## 5. Comparison of every candidate

“Snapshot” identifies the inspected local revision or recorded upstream HEAD. **P** means important implementation files were inspected at a pinned revision; **M** means supplementary or principal inspection used moving main. A recorded HEAD does not mean every linked file was fetched by immutable SHA.

Licenses describe the inspected project or component, not every transitive dependency, model service or distributed binary.

| Candidate | Actual category and snapshot | Useful contribution | Main limitation for Ideeo | Judgment |
|---|---|---|---|---|
| Ideeo | Domain engine plus custom runtime; 68749d1, local | Tenant configuration, independent authority, authenticated APIs, financial effects, host handoffs, scoped persistence | Conversation/research responsibilities are entangled; qualifications remain partial | Keep foundation; replace substantial runtime |
| OpenMausBot | Full agent application plus browser integration; 263d9b79, P/local; Apache-2.0 core, separate enterprise terms | Relevant local browser evidence, tool interaction, context repair, steering | Loop extraction crosses application configuration, MCP, logging and lifecycle; pending integration still boots broad application machinery | Keep as browser contender; do not make it the product base |
| OpenBot | Organizational agent platform/template; 7c9a4f7, M; MIT public app, separately licensed Intelligence | Substantive documented organization, policy, audit, approval and durable-work infrastructure | Inspected public checkout does not build the deployed backend image; enforcement internals unavailable there | Commercial platform option, not presently a verified open runtime foundation |
| OpenClaw | Operator-oriented application; f126fb8, M; MIT | Mature interaction features; now has an internal reusable core | Explicit trusted-operator threat model; internal core is private workspace package with additional dependencies | Learn from it; not preferred base or extraction |
| Hermes Agent | Personal/operator application; 5ebfa75, M; MIT | Strong conversational controls, turn persistence, tool-round bookkeeping | Personal threat model; embedding carries home/config/plugin/session machinery and auxiliary calls | Not preferred base |
| nanobot | Application with distinct runner; 53a5565, M; MIT | AgentRunner/AgentRunSpec, checkpoints and injectable tools/provider runtime | Runner hooks do not necessarily intercept physical provider retries; default application adds its own state and memory | Credible reserve Python contender |
| NanoClaw | Container-oriented agent application; 2cb6926, M; MIT | Process ownership, fencing, container claims, credential-gateway patterns | Group workspace is not mandate isolation; external gateway implementation required; provider and binary dependencies | Borrow lifecycle patterns, not whole platform |
| IronClaw | Modular platform with internal loop crates; b0b999d, P+M; MIT OR Apache-2.0 | Host-inverted loop, capability authorization, explicit uncertain-side-effect recovery | Unpublished Rust crate closure; platform adoption duplicates services; browser/process-sandbox readiness is incomplete | Serious extraction reserve |
| Pi | Embeddable agent core plus separate applications/packages; 6359527, P+M; MIT | Small clear loop, injected transport, awaited event sink, steering, cancellation and hooks | TypeScript boundary; no product durability, authority or tenant isolation | Strongest challenger |
| PydanticAI | Embeddable Python agent framework; 62e7b66, P+M; MIT | Typed tools/results, streaming, model injection and execution hooks | Broader framework than a minimal loop; retries and durable integration require careful adaptation | First implementation candidate |
| Deep Agents | Opinionated research/delegation harness; 1a7d602, P+M; MIT | Subagents, context management, filesystem abstractions, tool patching | Introduces filesystem, summarization, delegation and state conventions | Consider later for a bounded research capability |
| LangGraph | Stateful execution/checkpoint framework; 02f2c2e, P+M; MIT | Explicit workflow state, interrupts, retries and persistence | Does not supply Ideeo’s evidence, authority or effect semantics; can add another durable owner | Retain only where it earns its role |
| OpenHands Software Agent SDK | Modular software-agent SDK; 06f643c, P+M; MIT | Embeddable agent, event lifecycle, tools, workspaces and remote execution | Coding-agent assumptions and substantial lifecycle/browser machinery; isolation requires deliberate composition | Strong SDK, weaker product fit |

The former Pi and NanoClaw URLs resolve to the current repositories requested in the assessment.

## 6. PydanticAI: pragmatic first candidate, with limits

PydanticAI can be embedded without starting a complete application or adopting a mandatory hosted service. Its agent execution is implemented in its own graph machinery, not LangGraph. The useful integration points are Agent execution, model implementations, tool execution and capabilities. This is a materially cleaner starting point than extracting an application’s loop. It is nevertheless a substantial framework, with continuations, capabilities, history processing and durable integrations—not a tiny function.

Sources: [agent graph](https://github.com/pydantic/pydantic-ai/blob/main/pydantic_ai_slim/pydantic_ai/_agent_graph.py), [package manifest](https://github.com/pydantic/pydantic-ai/blob/main/pydantic_ai_slim/pyproject.toml).

Its hooks are useful but must be placed correctly:

- prepare_model_request operates at framework request-attempt boundaries.
- before_model_request is not interchangeable with a physical-network-attempt authorization check.
- A fallback model, provider SDK retry or helper call can introduce another execution boundary.
- Tool hooks provide admission and wrapping opportunities, but a wrapper can invoke its handler more than once.

Therefore, Ideeo should supply an audited model adapter and keep effect authorization inside the actual tool/service dispatch path. A generic hook must not become the sole financial control.

Sources: [capability interface, pinned](https://github.com/pydantic/pydantic-ai/blob/62e7b66c9f4da5c788eb360e49522a98e8fa0c86/pydantic_ai_slim/pydantic_ai/capabilities/abstract.py), [tool execution](https://github.com/pydantic/pydantic-ai/blob/main/pydantic_ai_slim/pydantic_ai/tool_manager.py).

Deferred tool approval is useful interaction machinery. It does not replace an independent mandate, approval reservation, current authorization or revocation check.

Context projection and retention should remain explicit Ideeo responsibilities. Optional summarization and memory features introduce additional model calls and data stores that need disclosure, budgets and erasure behavior. Streaming and cancellation are useful, but cancellation of an agent coroutine does not prove browser termination.

**Initially use PydanticAI core inside Ideeo’s existing lifecycle, without its Temporal durability integration.**

The current integration is moving toward TemporalDurability, with TemporalAgent deprecated. More importantly, default transport serialization can place messages, settings, parameters and dependencies into workflow/activity payloads. That conflicts with Ideeo’s existing intent to keep durable workflow histories limited to opaque references and control data. This is an adaptation problem, not an automatic benefit of choosing the same workflow engine.

Sources: [durability implementation, pinned](https://github.com/pydantic/pydantic-ai/blob/62e7b66c9f4da5c788eb360e49522a98e8fa0c86/pydantic_ai_slim/pydantic_ai/durable_exec/temporal/_durability.py), [transport serialization](https://github.com/pydantic/pydantic-ai/blob/main/pydantic_ai_slim/pydantic_ai/durable_exec/temporal/_transports.py).

The principal risk is reproducing today’s problem with a new library: one enormous structured response deciding conversation, controls, evidence and presentation. The proposed runtime needs smaller contracts, not merely a different validator.

### Additional implementation observations

- ToolManager.execute_tool_call and its hook execution path distinguish user tools and output tools; output tools do not traverse every user-tool hook.
- Tool wrapping can cause multiple handler executions, so bank idempotency must remain in the service.
- Realtime interfaces have separate hook paths; inspecting ordinary model hooks does not qualify them.
- A custom Model adapter is preferable to blindly wrapping the existing StructuredModel interface: model/tool message shapes differ.
- Temporal _ModelRequestTransport.dump includes messages, settings, request parameters, run context and context dependencies.
- Temporal function-call transport can include tool arguments and dependencies.
- Logfire is optional, not a mandatory hosted runtime dependency.
- The core does not supply tenant isolation, a browser sandbox or bank reconciliation.

## 7. Pi: the clearest alternative loop architecture

Pi exposes a reusable core rather than requiring extraction from its coding application.

packages/agent/src/agent-loop.ts contains agentLoop, continuation variants and the underlying loop. It accepts an injected stream function and an **awaited event sink**. That matters because persistence and admission cannot safely rely on fire-and-forget event observers. The agent exposes request preparation, context conversion, tool hooks, steering, follow-up queues and abort behavior.

Sources: [pinned loop](https://github.com/earendil-works/pi/blob/635952742b0ea6ec17a9e229e531590460873727/packages/agent/src/agent-loop.ts), [agent implementation](https://github.com/earendil-works/pi/blob/main/packages/agent/src/agent.ts), [interfaces](https://github.com/earendil-works/pi/blob/main/packages/agent/src/types.ts).

Its inspected package closure is comparatively clear: the agent package directly depends on Pi’s AI and schema packages. That is a stronger extraction story than importing an application driver and gradually discovering ambient configuration and services. It is not proof of a fully audited transitive build.

Source: [package manifest](https://github.com/earendil-works/pi/blob/main/packages/agent/package.json).

Pi supplies neither durable financial execution nor hostile-tenant isolation. Its state is principally agent/session state. Its cancellation signals and waitForIdle semantics do not establish that an external process stopped. Provider-internal retries still require controlled transport.

Use:

- A controlled StreamFn for every physical model attempt.
- Ideeo tool adapters that authorize immediately before dispatch.
- An awaited event sink that persists canonical events before dependent effects.
- Ideeo-owned context projection and research evidence.
- Existing durable task ownership.

Do **not** adopt Pi’s separate experimental durable package in the first comparison. That would change both the conversational runtime and state ownership at once.

Source: [durable package documentation](https://github.com/earendil-works/pi/blob/main/packages/durable/README.md).

The main disadvantage is operational: Python-to-Node communication, event ordering, cancellation propagation, packaging and crash ownership could erase the apparent simplicity. Pi wins only if the implemented boundary remains simpler than the PydanticAI adaptation.

This is the most important change to the earlier assessment: **a supported reusable core makes extracting OpenMaus’s conversational loop less compelling.**

### Additional implementation observations

- AgentOptions includes streamFn, convertToLlm, transformContext, getApiKey, prepareRequest, prepareNextTurn, finishTurn and tool hooks.
- Steering and follow-up have separate queues and timing semantics.
- The loop exposes before/after tool execution hooks and schema validation; batch-level preparation is not necessarily the last boundary before egress.
- prepareRequest occurs on loop inference boundaries, but the injected transport still has to govern provider-internal retries.
- waitForIdle concerns the run and subscriber work; it is not a process-disposal receipt.
- The inspected agent-core manifest identified version 1.5.2, Node >=22.19 and direct Pi AI/schema dependencies.
- Core build uses TypeScript tooling; a complete dependency rebuild was not performed.
- The README does not promise a filesystem, credential, process or network permission boundary.

## 8. nanobot: credible reserve Python candidate

nanobot/agent/runner.py exposes AgentRunner and AgentRunSpec, with injectable tools, provider runtime, transcript handling, hooks, checkpoints and continuation behavior. It is a credible Python challenger, not just a small chatbot application. It still imports context-governance and provider/session support, so the closure is not trivial.

Source: [runner](https://github.com/HKUDS/nanobot/blob/main/nanobot/agent/runner.py).

Two details affect adoption:

- The runner’s model hook surrounds logical execution; provider retries and some context processing occur underneath it.
- Composite hook handling can swallow exceptions unless configured to re-raise. An observational hook is unsafe as an authorization boundary unless failure closes execution.

The actual tool execution boundary is more useful for enforcement than a high-level observer.

Sources: [provider execution](https://github.com/HKUDS/nanobot/blob/main/nanobot/providers/base.py), [tool dispatch](https://github.com/HKUDS/nanobot/blob/main/nanobot/agent/tools/execution.py).

The earlier characterization that it has only session keys is incomplete. It now has workspace-access and platform-sandbox machinery. Nevertheless, session/workspace scope is not Ideeo’s tenant/member/client/agent/mandate model. Its Windows shell path can proceed without the configured sandbox when that sandbox is unsupported, which matters in this environment.

Sources: [workspace access](https://github.com/HKUDS/nanobot/blob/main/nanobot/security/workspace_access.py), [shell execution](https://github.com/HKUDS/nanobot/blob/main/nanobot/agent/tools/shell.py).

Its web tools have substantive URL and DNS protections, including private-address checks. They are HTTP research tools, not proof of a complete Chromium execution boundary or uniform restrictions on shell/MCP tools.

Sources: [web tools](https://github.com/HKUDS/nanobot/blob/main/nanobot/agent/tools/web.py), [network controls](https://github.com/HKUDS/nanobot/blob/main/nanobot/security/network.py).

**Recommendation:** keep nanobot as the reserve candidate if PydanticAI requires extensive private adaptation or Pi’s process boundary becomes too expensive. Do not implement three Python/TypeScript challengers simultaneously.

### Additional implementation observations

- Runner checkpoints cover model input, awaiting tools, tool completion and final results.
- AgentRunSpec supports transcript, hook, checkpoint, consolidation, injection, terminal injection and continuation inputs/events.
- The ordinary AgentLoop has SQLite/session recovery, pending tool state and memory conventions that would duplicate Ideeo if adopted wholesale.
- CompositeHook defaults to suppressing some hook exceptions; _reraise must be selected for fail-closed enforcement.
- PinnedDNSAsyncTransport checks resolved targets; private, link-local and metadata destinations are restricted.
- CIDR allowlisting includes global module state that requires deliberate tenant composition.
- Remote Jina fetching refuses credential-bearing URLs.
- Shell execution curates environment variables and explicit allowed keys/login profiles.
- Process-session ownership uses session keys. Cancellation shields cleanup and retains unsettled state after failure, but in-memory ownership does not prove crash recovery.
- No verified native Chromium browser implementation was established; browser automation can be added through MCP/custom/CLI tools.

## 9. IronClaw: serious extraction reserve

The internal ironclaw_agent_loop crate exposes AgentLoopExecutor::execute_family against an AgentLoopDriverHost. Its direct closure is internal contracts and common support, rather than a database, browser or provider SDK. This contradicts a blanket claim that using IronClaw necessarily requires adopting its whole platform. The crate is unpublished, however, so extraction carries upstream maintenance responsibility.

Sources: [pinned manifest](https://github.com/nearai/ironclaw/blob/b0b999d96781516ee05e6ba961d6f3ead900da96/crates/loop/ironclaw_agent_loop/Cargo.toml), [executor](https://github.com/nearai/ironclaw/blob/main/crates/loop/ironclaw_agent_loop/src/executor.rs).

Its checkpoint semantics are unusually relevant: recovery from a checkpoint before a side effect can fail closed when the effect’s outcome is uncertain, instead of automatically replaying it. Model attempts and capability dispatch have explicit host calls and retry accounting. That is closer to Ideeo’s needs than merely saving messages. It still does not reconcile a bank operation by itself.

Sources: [model execution](https://github.com/nearai/ironclaw/blob/b0b999d96781516ee05e6ba961d6f3ead900da96/crates/loop/ironclaw_agent_loop/src/executor/model.rs), [checkpoint handling](https://github.com/nearai/ironclaw/blob/b0b999d96781516ee05e6ba961d6f3ead900da96/crates/loop/ironclaw_agent_loop/src/executor/checkpoint.rs).

The wider platform has substantive trust-aware authorization and scoped secret primitives. Those are more than an approval dialog, but they still need composition and do not establish equivalence to Ideeo’s independent financial authority.

Sources: [authorization](https://github.com/nearai/ironclaw/blob/main/crates/kernel/ironclaw_authorization/src/lib.rs), [secrets](https://github.com/nearai/ironclaw/blob/main/crates/substrates/ironclaw_secrets/src/lib.rs).

A significant qualification: current source explicitly states that Docker process-sandbox execution is **not production-wired**. The existing production paths validate plans and related metadata; the process execution capability lacks a production backend. Its WASM runtime is a separate implementation and should not be conflated with that gap. A ready native browser replacement was not established.

Sources: [sandbox source](https://github.com/nearai/ironclaw/blob/main/crates/lanes/ironclaw_sandbox/src/lib.rs), [WASM source](https://github.com/nearai/ironclaw/blob/main/crates/lanes/ironclaw_wasm/src/lib.rs), [feature matrix](https://github.com/nearai/ironclaw/blob/main/FEATURE_PARITY.md).

**Recommendation:** a serious reserve if the first SDKs fail the seam test, particularly for effect-aware loop design. Rust and unpublished internal dependencies make it a less economical first experiment.

### Additional implementation observations

- The inspected structure is the modular Reborn layout, not the former root-src monolith.
- The loop crate is publish=false and depends on internal common, host API and loop-contract crates plus ordinary async/serialization support.
- Loop contracts introduce extension-contract dependencies; the closure is small relative to the platform, not a single self-contained source file.
- Model execution calls host.stream_model, charges each attempt and persists retry-budget/fallback-index state.
- Capability dispatch routes through invoke_capability.
- BeforeSideEffect recovery remains uncertain until a later durable transition establishes a safe continuation; it is not an automatic replay permit.
- Batch optimization respects state transitions and gate references.
- Cancellation is cooperative, with final-checkpoint configuration.
- Trust-aware authorization uses grants/leases, invocation fingerprints and tenant/user/agent/thread context, rather than trusting a deserialized context field alone.
- Provider abstractions cover several model families, but each configured provider still needs Ideeo disclosure qualification.
- Scoped secret handles support leases, expiration, revocation and versioned writes. The secret service explicitly does not itself authorize or inject credentials.
- Full-platform adoption brings identity, events, memory, capabilities, WASM/MCP and process ownership that can duplicate Ideeo.
- No mandatory proprietary service was identified for the inspected loop.

## 10. OpenMaus: browser evidence versus runtime extraction

The current driver exposes a plausible loop factory, createOpenAIChatRuntime, but its dependency closure reaches tool mounting, application configuration, MCP integration, logging, context repair and provider-specific handling. Configuration also has ambient environment/home behavior.

The loop contains more than ordinary inference and tools: retry and protocol repair, context shrinkage, tool adaptation and auxiliary generation. All of those calls need disclosure and budget enforcement. Its event listener mechanism is synchronous; durable ordering cannot be assumed merely by attaching an asynchronous listener.

Source: [pinned OpenMaus driver](https://github.com/milind-soni/OpenMausBot/blob/263d9b79b1164510718994d65dd678f266a61b3e/server/drivers/openai-chat.ts).

The pending Ideeo implementation improves control by replacing monkey-patching with explicit engine callbacks and hash-checked vendoring. That is useful work. But the vendored manifest contains roughly 7,192 files across server, UI, Electron, scripts and other application areas, and the worker still invokes the control application machinery.

**That establishes controlled packaging, not a minimal extracted runtime.**

The current model relay is also narrower than generic provider portability: it qualifies an OpenAI planner path, controls accepted endpoints and model choice, and rejects unsupported modalities/tools. A future library should preserve those restrictions until other providers are qualified.

OpenMaus has the most directly relevant local browser evidence among the alternative applications:

- Standalone Doctoralia tests varied from 0/3 strict successes with minimal instructions to 3/3 with explicit instructions.
- The successful runs still consumed substantial context; one recorded about 404,000 input tokens.
- Later authenticated Ideeo journeys demonstrated useful research, reload without new model calls, and cancellation/cleanup observations.
- Those runs occurred across successive revisions and different environments.

They do not establish a valid speedup ratio against an earlier, much slower Ideeo run with different instructions, policies, budgets and backend conditions.

The browser can succeed while the authenticated conversation fails on follow-up, task controls or history. That is precisely why OpenMaus should remain a browser candidate while the conversational runtime is replaced separately.

The inspected OpenMaus core is Apache-2.0. Enterprise components have separate source-available/commercial terms; hosting and redistribution conditions require attention. Excluding enterprise code is useful but does not make Chromium, patched browser binaries and every dependency reproducible from the Python repository. No clean build was performed.

### Additional implementation observations

- createOpenAIChatRuntime returns a ProviderInstance but imports tool refitting, MCP mounting, logging, key rejection and continuation support.
- chat-mcp-tools.ts reaches product configuration, AppObserver, cloud-home discovery and process/MCP integrations.
- The committed factory lacks the explicit modelFetch and tool-mount hooks added by the pending engine-owned work.
- Auxiliary generateText calls, context shrinkage, announcement nudges and local-model corrections are inference paths requiring control.
- sendTurn indicates start, not completed work.
- Steering is applied at model-round boundaries, not necessarily in the middle of a tool batch.
- interruptTurn awaiting a provider promise does not itself kill an external browser process.
- In-memory maps are not durable task recovery.
- BrowserRuntime.agentRpc and browser-engine integration provide the browser substrate; request/service trust does not express Ideeo’s full mandate scope.
- Limited loopback service trust in request-auth.ts needs to be accounted for when embedding a full server.
- The application itself warns about uncertain effects after interruption.

### Pending Ideeo integration details

- tools/openmaus/worker.mjs imports control-omb.ts and invokes its server environment/argument and run helpers.
- It starts the application server machinery, creates a bot and drives the application HTTP loop.
- tools/openmaus/engine-binding.mjs performs additional URL/title/body and selected-excerpt reads after browser calls.
- Up to five selected excerpts and approximately 48,000 characters can be collected at that boundary; the Python assessment representation retains up to approximately 24,000 characters.
- Those capture reads are additional browser work and must be counted separately from native action counts.
- OpenMausTasks.advance connects task state, model budgets, repository state, browser observations and Ideeo assessment.
- Native final output is not automatically accepted as verified evidence; Ideeo assessment still establishes completion.
- Correction can restart the browser task.
- relay_model accepts the qualified OpenAI path, restricts endpoint forms and model choice, sets store=false and rejects unsupported image/hosted-tool paths.
- OpenMausProcess checks binaries and uses Windows Job Object or Linux supervisor machinery. Distributed ownership remains separately unqualified.
- The pending manifest excludes enterprise code and pins upstream 263d9b79.
- Manifest categories included approximately 3,226 server files, 2,139 UI source files, 533 Electron files, 340 scripts, 261 shared files, 95 package files, 93 app files and 84 companion files.
- Browser packaging uses agent-browser 0.37 on Linux/macOS and a patched 0.36-omb.1 Windows variant, with Chromium 153.0.8010.47; their source/patch/build and third-party license obligations remain separate from the Python repository.

## 11. OpenBot: substantial platform, incomplete public backend source

Its documentation describes organizations, membership, policy, approvals, audit, credential handling, PostgreSQL-backed infrastructure and durable work. Dismissing it as a toy would be wrong.

However, the inspected deployment pulls a published backend image for the server and agent computer. The public checkout does not contain the implementation necessary to rebuild that backend, and deployment documentation says that this tree does not build the image. Consequently, the main loop, physical retry hooks, cancellation implementation and recovery enforcement could not be verified from this checkout.

Sources: [Compose deployment](https://github.com/CopilotKit/OpenBot/blob/main/docker-compose.yml), [deployment documentation](https://github.com/CopilotKit/OpenBot/blob/main/docs/deployment.md), [architecture](https://github.com/CopilotKit/OpenBot/blob/main/docs/architecture.md).

The MIT template license does not encompass CopilotKit Intelligence automatically. The README explicitly treats Intelligence separately. Exact commercial and source-access rights would need to be obtained before treating this as a replaceable, rebuildable foundation.

Source: [license explanation](https://github.com/CopilotKit/OpenBot/blob/main/README.md#license).

Its documented approvals are action-policy mechanisms, not independent bank authority. External agents executing their own tools are also outside parts of that policy boundary. Scheduled-work deduplication and documented missed/in-flight behavior should not be mistaken for financial exactly-once execution.

Sources: [approvals](https://github.com/CopilotKit/OpenBot/blob/main/docs/approvals.md), [routines](https://github.com/CopilotKit/OpenBot/blob/main/docs/routines.md).

**Verdict:** evaluate as a commercial organizational platform only if its source, contracts and operational ownership become acceptable. It is not currently the strongest answer to “which open runtime should we own?”

### Additional implementation/documentation observations

- Public source includes frontends, examples, shared/API specifications and deployment assets.
- The documented server, agent-computer and supervisor backend implementation is not present in the inspected public checkout.
- The deployed image supplies both /app/bin/openbot server and /app/bin/openbot-computer.
- Organization APIs use /api/v2/organizations/{id}; documented capabilities include membership, API keys/OAuth PKCE, write idempotency keys, audit and encrypted credentials.
- Documented replicas share PostgreSQL-backed coordination/queues and Intelligence threads/memory.
- Routine scheduling uses advisory locking and minute-level deduplication; missed-window and in-flight occurrence behavior needs to be understood rather than assumed to be durable exactly-once execution.
- Deployment separates database/server credentials and computer execution, but standalone shared-computer operation is not a tenant isolation boundary.
- Approval descriptions include automatic/user/admin review categories and limitations around action labeling.
- AG-UI/frontend integration may be useful independently of choosing the runtime.
- “Unavailable in this inspected checkout” is the finding; it is not a claim that the vendor cannot provide source under another agreement.

## 12. OpenClaw: strong application, operator threat model

Current source includes a private internal packages/agent-core, with injected streaming, awaited events, steering and tool hooks. Extraction is possible. Its package is not a separately published stable SDK and depends on additional workspace packages.

The full application adds transcript leases, session placement, model admission, failover, compaction and plugin machinery. Its security policy explicitly assumes a trusted operator rather than hostile tenants sharing a gateway. Separate sessions do not change that assumption.

Sources: [security policy](https://github.com/openclaw/openclaw/blob/main/SECURITY.md), [core package](https://github.com/openclaw/openclaw/blob/main/packages/agent-core/package.json).

Browser support is substantive: managed profiles, remote CDP and existing Chrome connections, with SSRF policy and authenticated control interfaces. A separate profile still is not an OS isolation boundary.

Sources: [browser tool](https://github.com/openclaw/openclaw/blob/main/extensions/browser/src/browser-tool.ts), [browser security](https://github.com/openclaw/openclaw/blob/main/docs/tools/browser/security.md).

**Verdict:** Pi offers a cleaner supported embedding proposition without first separating the equivalent core from OpenClaw’s application.

### Additional implementation observations

- Application execution proceeds through run.ts, run-orchestrator.ts::runEmbeddedAgent, run-loop.ts::runPreparedEmbeddedLoop and run/run-attempt-dispatch.ts::prepareAndDispatchEmbeddedRunAttempt.
- Internal core exposes runAgentLoop/Continue and tool-execution hooks.
- The package is private, versioned 0.0.0-private, with workspace dependencies including AI, LLM-core, normalization-core and schema support.
- Compaction and branch summarization are additional inference paths when enabled.
- Application tool wrappers perform preparation, reconciliation, policy checks and receipt finalization; their existence does not prove that every lower transport path is mediated.
- Current browser implementation is under extensions/browser rather than older locations.
- createBrowserTool routes host/node/sandbox bridge calls with invocation-current checks, host-control permission, session/tab binding and abort signaling.
- Browser SSRF configuration defaults to a strict policy; private access requires an explicit option.
- The control HTTP API uses loopback/shared-secret authentication.
- Remote CDP URLs can contain credentials and must be treated as secrets.
- No mandatory private backend was identified for the inspected application, but no build was run.

## 13. Hermes: conversational engineering with personal-agent assumptions

AIAgent and conversation-loop mixins support programmatic use. Turn leases, persisted tool rounds and steering fences are meaningful implementations. The application also carries home configuration, plugins, memory, background behavior and auxiliary model calls. Main-loop middleware does not by itself control every compression, search or vision call.

Sources: [conversation loop](https://github.com/NousResearch/hermes-agent/blob/main/agent/conversation_loop.py), [tool-round handling](https://github.com/NousResearch/hermes-agent/blob/main/agent/turn_tool_round.py), [auxiliary client](https://github.com/NousResearch/hermes-agent/blob/main/auxiliary_client.py).

Its security model explicitly relies on single-tenant/operator trust and whole-process containment; a terminal sandbox does not contain in-process plugins or MCP integrations.

Source: [security policy](https://github.com/NousResearch/hermes-agent/blob/main/SECURITY.md).

Current browser source has changed: the former browser tool is a compatibility stub; browser_exec uses Browser Use CLI/browser-harness over CDP. Profile-scoped credential handling and URL restrictions are useful, while own-tab behavior on a shared CDP connection is explicitly best effort.

Sources: [current browser implementation](https://github.com/NousResearch/hermes-agent/blob/main/tools/browser_use_cli.py), [URL policy](https://github.com/NousResearch/hermes-agent/blob/main/tools/browser_url_policy.py).

**Verdict:** useful interaction patterns, unfavorable dependency and trust-model fit for Ideeo’s core.

### Additional implementation observations

- Entry flows from run_agent.AIAgent to TurnFacadeMixin.run_conversation and conversation-loop implementation.
- Embedding still reaches dotenv/home/bootstrap, CLI/plugin, memory and session dependencies.
- Cross-process turn leases and watchdog behavior are more than simple transcript saving.
- turn_tool_round.py persists tool-call intent before effects and can fail closed if canonical-store persistence fails.
- perform_api_call invokes run_llm_execution_middleware for main streaming/non-streaming requests.
- Interrupt control distinguishes soft/hard interruption and uses steering/redirect locks and commit fences.
- These controls do not prove physical tool-process termination.
- Auxiliary compression/search/vision calls can select different configured providers; a main-loop middleware review is insufficient.
- Current browser credentials use the active profile’s BROWSER_USE_API_KEY scope rather than blindly adopting launch-profile credentials.
- Browser sessions can come from BU_CDP configuration, connected operator sessions, cloud sessions, local real profiles, Lightpanda or packaged Chromium.
- URL policy includes metadata refusal, restrictions on private addresses, operator exceptions, allow/deny policy, secret-like URL rejection and CDP SSRF helpers.
- URL-literal scanning is not network enforcement for arbitrary executed code.
- Memory/source attribution does not supply a canonical research-claim graph or bank reconciliation.

## 14. NanoClaw: useful execution ownership patterns

Its current runner has provider abstractions, not merely a hard-coded Claude loop. Container execution uses claims, fencing and adoption of running sessions. Teardown failures preserve claims rather than pretending cleanup succeeded. Those patterns are directly relevant to cancellation and restart ownership.

Sources: [container ownership](https://github.com/nanocoai/nanoclaw/blob/main/src/container-runner.ts), [provider interface](https://github.com/nanocoai/nanoclaw/blob/main/container/agent-runner/src/providers/types.ts).

Its containers and mounts offer a stronger process boundary than session IDs. Nevertheless, group memory/workspaces are not member or mandate isolation. The credential/network gateway is a required external implementation choice, not a complete gateway supplied by the repository.

Source: [security design](https://github.com/nanocoai/nanoclaw/blob/main/docs/SECURITY.md).

Browser setup installs Chromium and agent-browser; some browser/provider components are downloaded binaries, and package installation choices limit reproducibility. Provider continuation and queued input recovery do not reconcile an uncertain external effect.

Sources: [container build](https://github.com/nanocoai/nanoclaw/blob/main/container/Dockerfile), [poll loop](https://github.com/nanocoai/nanoclaw/blob/main/container/agent-runner/src/poll-loop.ts).

**Verdict:** borrow fencing, ownership and cleanup patterns where Ideeo lacks them. Adopting the application would bring another scheduler, session store and workspace model.

### Additional implementation observations

- container/agent-runner/src/index.ts builds provider, mailbox, memory and MCP support before runPollLoop.
- Provider types expose query, pushInput, events, abort and opaque continuation state.
- Provider SDK retries and compaction can occur below that abstraction.
- Poll-loop persistence includes continuations and pending inputs, with stale-processing cleanup.
- Recovery can repeat work; persisted continuation is not effect reconciliation.
- claimSessionRun and adoptRunningSessions use durable claims/fencing/incarnation identity.
- Failed teardown retains the claim and gateway lease; unreadable fence state defers finalization.
- Containers run non-root with explicit mount/configuration boundaries.
- The external credential/network gateway must be supplied; startup refuses to proceed without required gateway configuration.
- Browser trust setup imports the gateway CA into Chromium’s NSS trust; failure is nonfatal and may leave HTTPS access failing.
- Base/Bun and lockfile versions offer some reproducibility, but apt Chromium is not pinned to an exact immutable package.
- Claude Code native components are downloaded through installation machinery.
- MIT repository licensing does not mean the entire assembled runtime is MIT or reproducible from that checkout alone.

## 15. Deep Agents and LangGraph: different layers

create_deep_agent is embeddable and accepts models, tools, middleware, backends, stores and checkpointers. It assembles an opinionated harness around filesystem tools, subagents, summarization and other capabilities. This can accelerate substantial research delegation. It can also introduce additional inference, offloaded context and data stores that need authorization and erasure.

Sources: [pinned factory](https://github.com/langchain-ai/deepagents/blob/1a7d602a7ef6b54269bbb268e4bbc71f27ada0f9/libs/deepagents/deepagents/graph.py), [subagents](https://github.com/langchain-ai/deepagents/blob/main/libs/deepagents/deepagents/middleware/subagents.py), [summarization](https://github.com/langchain-ai/deepagents/blob/main/libs/deepagents/deepagents/middleware/summarization.py).

Its filesystem backend explicitly warns against treating local filesystem access as a secure sandbox for a web application.

Source: [filesystem backend](https://github.com/langchain-ai/deepagents/blob/main/libs/deepagents/deepagents/backends/filesystem.py).

LangGraph provides actual checkpoint, interrupt and replay mechanisms. Durability mode affects crash behavior, and replay does not make arbitrary tool effects idempotent. A checkpoint store alongside Temporal requires a clear division of ownership.

Sources: [persistence documentation](https://docs.langchain.com/oss/python/langgraph/persistence), [pinned retry implementation](https://github.com/langchain-ai/langgraph/blob/02f2c2e6c992ffccce9e9129781fdd04f015c6fa/libs/langgraph/langgraph/pregel/_retry.py).

ADR-003 already considered this territory. There is no new evidence here that adopting the full Deep Agents harness is the best first repair for ordinary conversation, correction and history.

**Verdict:** possibly a bounded research worker later. Avoid making its filesystem and checkpoint conventions the new universal product architecture.

### Additional implementation observations

- Deep Agents defaults to a state-backed filesystem abstraction and composes filesystem, subagent, summarization and tool-message repair middleware.
- Optional profiles, memory, skills and human-in-the-loop features add conventions beyond a loop.
- Declarative/compiled subagents and experimental forks have context inheritance rules; selected exclusions do not establish tenant disclosure policy.
- Subagents introduce separately attributable model calls.
- Summarization can offload history/media to storage. This creates retention and erasure obligations and does not turn summaries into verified evidence.
- LangGraph distinguishes thread checkpoint state from cross-thread stores.
- Durability modes such as sync, async and exit have different crash windows.
- Interrupt/Command, retries, timeouts and cancellation are workflow primitives, not independent authorization or external-effect reconciliation.
- Running a bounded non-checkpointed graph inside an existing activity is different from introducing another durable checkpoint owner.
- LangSmith and managed services are optional, not required for the inspected open-source core.

## 16. OpenHands SDK: modular, but optimized for software agents

The SDK can run without adopting the whole OpenHands application. Agent.step/astep, conversation events, confirmation policies and workspaces provide reusable boundaries. LocalConversation also owns substantial persistence, execution, plugins and lifecycle machinery.

Sources: [pinned agent](https://github.com/OpenHands/software-agent-sdk/blob/06f643ca471eea73c662a76fef2e0b836a33c826/openhands-sdk/openhands/sdk/agent/agent.py), [local conversation](https://github.com/OpenHands/software-agent-sdk/blob/main/openhands-sdk/openhands/sdk/conversation/impl/local_conversation.py).

The LLM layer has its own retries and fallback behavior; its default retry count is five. Summarization can invoke another model. A retry listener and confirmation policy are not per-attempt disclosure authorization or bank authority.

Sources: [pinned LLM implementation](https://github.com/OpenHands/software-agent-sdk/blob/06f643ca471eea73c662a76fef2e0b836a33c826/openhands-sdk/openhands/sdk/llm/llm.py), [summarizing condenser](https://github.com/OpenHands/software-agent-sdk/blob/main/openhands-sdk/openhands/sdk/context/condenser/llm_summarizing_condenser.py).

A concrete browser integration concern is a class-level shared browser executor, intended to support sharing within an execution context, rather than being keyed by tenant/conversation. Running hostile tenants together without explicit isolation would be unsafe. Root execution can disable Chromium’s sandbox; cleanup can log surviving processes without proving successful disposal.

Sources: [browser definition](https://github.com/OpenHands/software-agent-sdk/blob/main/openhands-tools/openhands/tools/browser_use/definition.py), [browser implementation](https://github.com/OpenHands/software-agent-sdk/blob/main/openhands-tools/openhands/tools/browser_use/impl.py).

**Verdict:** a good software-agent SDK, with more coding/workspace/lifecycle machinery than this product needs. It is not the first choice for a banking-aware conversational engine.

### Additional implementation observations

- Pending actions are resolved before another sampling step; confirmation policies include always-confirm and risk-based confirmation.
- CancellationToken is a cooperative event, not process termination proof.
- Hook facilities cover tool execution, prompts, sessions and stopping.
- The inspected manifest identified version 1.62 and Python >=3.12, with LiteLLM, FastMCP, ACP, telemetry and parsing dependencies.
- LLM credential handling avoids some ambient provider-key mixing, but this is not tenant authorization.
- BrowserToolExecutor uses CustomBrowserUseServer/browser-use and Chromium with allowed-domain settings and a generated disk-profile path.
- Application URL filtering is not proof of destination-level network enforcement.
- Browser cleanup drains/stops the session, then uses process inspection and kill/wait; surviving processes can be logged rather than turned into a failed disposal receipt.
- Browser cookie storage is not a tenant credential vault.
- BrowserToolSet._shared_executor is a class-level singleton; later differing configuration is ignored with a warning.
- This sharing is intended within an execution sandbox. Hostile tenants need a separate isolation domain or explicit per-domain executor.
- LocalWorkspace executes commands/files on the host for local development.
- DockerWorkspace runs an agent server in a container, with explicit mounts/ports and a default network setting that is not a destination egress policy.
- Versioned credential binding supports refreshed/versioned secrets.
- Registered-string masking does not automatically redact browser screenshots or arbitrary binary artifacts.

## 17. Target architecture: preserve responsibilities, replace choreography

Preservation should follow responsibilities and qualified behavior, not module boundaries.

| Responsibility | Existing useful seam | Proposed treatment |
|---|---|---|
| Authenticated request and tenant context | assistant_http.py:assistant_routes; AssistantService.prepare | Preserve boundary; make runtime entry explicit after admission |
| Scoped resources, reservations and replay | resources.py:ResourceRepository | Preserve semantics and storage ownership; simplify consumers |
| Trusted banking configuration | adapters/tenants.py:TenantGateway.binding/backend | Preserve; never delegate backend selection to the model |
| Independent authority | Go authority Store.Accept, Prepare, Reserve | Preserve independent service and current checks |
| Financial execution | operations.py:OperationService.execute | Preserve operation identity, executing/uncertain states and reconciliation |
| Native host banking | host_banking.py:HostBanking.prepare/consume | Preserve typed, scoped, single-consume handoff and data exclusion |
| Model disclosure and attempt budgets | profile_runtime.py:ProfileModel behavior | Adapt behind audited transport; preserve per-attempt controls |
| Durable task control | background/native.py, workflow/activity contracts | Preserve ownership and opaque-history principle; replace coupled choreography |
| Browser execution and disposal | Browser worker containment and supervisor interfaces | Keep fixed in first comparison; qualify independently |
| Conversational reasoning | CapabilityPlanner.capture, most of AssistantService._run | Replace on the new path |
| Research evidence and presentation | PublicResearchTasks, presentation and history paths | Redesign contracts and projections; retain substantive verification |

Important existing examples include:

- TenantGateway fails closed when trusted configuration changes or disappears.
- OperationService.execute sends pending/executing/uncertain operations to reconciliation rather than blindly repeating execution.
- Native-host handoff consumption checks scope and current authorization and does not place balance/history in the model.
- Native workflow activities use opaque identifiers and control responses rather than raw prompts.

These are valuable architectural behaviors. Their existence does not establish complete independent acceptance or production readiness.

The replacement should introduce a small runtime boundary—**a proposed interface, not something already present**—with:

- An authenticated execution envelope.
- A minimized context projection.
- Controlled model and tool ports.
- A stream of answer, question, proposed action and task-control events.
- Explicit steering and cancellation requests.
- No ownership of bank credentials, mandate truth or permanent financial outcomes.

The runtime may request an operation. The domain gateway decides whether the operation can execute now.

For research, there should be one canonical evidence representation containing source identity, acquisition time, entity association, task/goal revision and supported claims or gaps. Conversation context and reloaded history should be projections of it. Repeated page capture should have a justified freshness or verification purpose.

The new route should remove:

- Mandatory all-purpose plan capture for ordinary conversational replies.
- Multiple interpretations of the same correction or cancellation.
- Duplicate reconstruction of fallback answers.
- An automatic second presentation-model call where it adds no demonstrated value.
- Application-level state stores introduced merely because an SDK supports them.
- Direct runtime access to arbitrary browser, bank or provider credentials.

It must retain uncertainty, evidence checks and authority. Removing those would create an unfairly fast but materially weaker product.

### 17.1 Existing source seams in more detail

- AssistantService.prepare, around line 1943 in the inspected revision, creates authority context, checks secrets/account scope, reserves caller fingerprints, stores encrypted original display content and establishes a lease.
- AssistantService.run, around line 2168, handles deterministic controls before profile/default execution. This is a plausible location for a new explicit ConversationRuntime seam after admission, not a license to bypass checks.
- ResourceRepository.reserve/read/replay/replace express scoped identity, encrypted storage, revisions and caller idempotency.
- TenantGateway.binding/backend validates configured capability and data policy; removed bindings deny access. Endpoint/credential configuration changes fail closed across restart rather than silently selecting fixtures.
- CapabilityGateway and create_capability_runtime supply trusted composition.
- OperationService.execute, around line 208, reconciles executing/pending/uncertain state, checks permit terms and expiry, validates current banking authority, persists executing state before bank execution and records uncertain outcomes on ambiguous failure.
- record_outcome binds operation, digest and evidence.
- The Go authority Store.Accept and reservation Prepare/Reserve paths keep mandate execution outside model reasoning.
- HostBanking.prepare/consume bind typed fields to session, scope, digest and expiry. Consumption clears the protected fields atomically; a lost response does not automatically rearm the handoff.
- ProfileModel.configure_attempts/_structured uses explicit fallback configuration, per-attempt callbacks and accounting. Transient failure does not permit ambient recursive fallback.
- NativeActivities.advance accepts an opaque task ID, command and sequence; workflow state is control information rather than raw prompts.
- Native workflows have explicit retry/timer choices. Worker type/queue/drain ownership remains separate.
- BrowserWorkerContainment and the OpenMaus supervisor express process ownership; they are not a blanket hostile-tenant sandbox qualification.

### 17.2 Repository strategy versus architecture strategy

| Strategy | Preserves | Replaces/removes | Duplicates or risks | Judgment |
|---|---|---|---|---|
| Continue improving current implementation | Everything | Individual defects and branches | Ongoing coordination across many layers | Reasonable only if bounded repairs prove sufficient |
| Replace conversation/research runtime with a library | Domain services, APIs, authority, storage responsibilities | Planner/repair/control/presentation choreography | SDK hooks, context and optional persistence need restraint | Preferred |
| Extract a runtime from an application | Domain foundation | Existing loop | Internal dependency closure and upstream patch maintenance | Reserve; IronClaw or OpenMaus only with a measured advantage |
| Adopt another application as the main base | Domain services as external APIs | API/channel/session/product shell | Duplicate identity, policy, secrets, tasks, history and retention | Not justified by inspected evidence |
| Rebuild a smaller product around components | Selected domain behaviors and contracts | Most orchestration and unnecessary wrappers | Risk of losing qualified edge cases during replacement | Good architecture; can be done inside this repository |

A different Git repository is not required to obtain the fifth strategy. Conversely, moving the same tangled responsibilities into a new repository would not achieve it.

A separate runtime service is justified if Pi wins or if process isolation provides a demonstrated operational benefit. For PydanticAI, begin in-process. Adding RPC, deployment and another failure boundary before it is needed would obscure the comparison.

## 18. Mapping the recommendation to actual failures

| Failure | Evidence status | What a cleaner runtime can improve | What remains custom |
|---|---|---|---|
| Broad follow-up fails despite retained evidence | Historically observed; exact rejection cause unresolved | Direct conversational reasoning over a stable evidence projection; fewer schema/repair stages | Evidence selection, token budgets, attribution and useful-answer contract |
| Correction or side question disrupts background work | Historical failures and later improvements | Explicit steering queue and typed controls; one interpreter of user control | Goal revisions, concurrency rules and stale-result rejection |
| Partial answer disappears after reload | Observed, with code-supported history mechanism | Little by itself | Persist/render useful answer independently of task success |
| Evidence crosses entities or gets lost | Historical observations | Stable tool messages and simpler handoffs | Canonical source/entity/claim IDs and validation |
| Repeated source capture and excessive orchestration | Code and retained traces support concern | Fewer planning/presentation passes; clearer continuation state | Freshness policy, source receipts and browser accounting |
| Cancellation/restart ownership becomes complex | Code and historical experiments | Cooperative stop/steering primitives | Fencing, durable ownership, actual process disposal and uncertain effects |
| Browser succeeds but authenticated journey fails | Demonstrated distinction | Better conversation continuation after browser completion | API admission, authority, persistence, history and channel delivery |

PydanticAI and Pi can address the orchestration problems without forcing a new product platform. nanobot and IronClaw offer related mechanisms. None eliminates the custom domain/evidence/lifecycle responsibilities.

A full application migration mostly relocates those responsibilities into adapters around another platform. Without a measured advantage, that is additional integration work rather than simplification.

## 19. Bounded, falsifiable comparison proposal

Authorize a comparison implementation next, not an open-ended rewrite. This document itself does not authorize implementation.

### 19.1 Establish two baselines

- Freeze committed 68749d1 with an explicitly pinned browser configuration.
- Treat pending OpenMaus work as a separate, fingerprinted baseline if included.

The history/fallback contract defect should be corrected as a common prerequisite and applied equally to all runtime arms. Do not credit one library with an unrelated defect fix.

### 19.2 Static integration gate before full alternatives

For PydanticAI and Pi, demonstrate:

1. Every actual inference attempt is mediated, including retries, fallback and helpers.
2. Every real tool dispatch reaches the existing authority/domain boundary.
3. No mandatory additional persistent state owner is introduced.
4. Cancellation and event ordering can be mapped without private patches throughout the library.
5. A clean pinned build and license inventory are feasible.

If one fails this gate, substitute nanobot or IronClaw. Do not build four challengers.

### 19.3 Compare conversation while holding acquisition constant

Use the same:

- Model/version and reasoning configuration.
- Substantive permissions and disclosure rules.
- Tool contracts and budgets.
- Browser backend and process environment.
- Evidence fixtures and user scenarios.
- Prompts where equivalent; record unavoidable framework-format differences.

Include both preloaded evidence and actual browser acquisition. The preloaded cases isolate whether ordinary conversation can use known evidence correctly.

The replacement arms must bypass the legacy planner and _run choreography. Otherwise the experiment tests an extra layer, not a replacement.

### 19.4 Complete authenticated journeys

The test path should include:

**authenticated turn → scoped resource → authority/tool dispatch → task execution → streamed answer → persisted result → history reload**

Use real engine interfaces and synthetic tenant/bank fixtures. Standalone library chats and browser demos are supporting tests only.

| Scenario family | Required observations |
|---|---|
| Research follow-ups | Broad synthesis, comparison, narrower questions and no unnecessary reacquisition of retained evidence |
| Corrections and side questions | Same-turn control plus question; stale revision rejected; useful side answer while work continues |
| Evidence integrity | Entity separation, exact versus starting prices, unsupported claims, visible gaps and source attribution |
| Partial results | Provider failure after useful acquisition; same useful answer and citations after reload |
| Isolation | Two tenants with overlapping identifiers; member/client/agent/grant boundaries; distinct configured backends |
| Revocation and retries | Revoke while queued or between attempts; forbidden fallback/helper model denied before network dispatch |
| Native host banking | One-time protected handoff; no balance/history in model context or chat; no replay rearming |
| Other integration paths | Verified tenant-channel turn, delegated bank AI and external mandate API tested separately |
| Uncertain effects | Crash after dispatch but before receipt; reconciliation without duplicate financial execution |
| Cancellation and recovery | Cancel during inference/browser action; ownership retained until cleanup is observed; restart and replay |
| Lifecycle | Retention/erasure behavior; replay cannot resurrect erased content or lose consumed budgets |

Where a product path is not yet implemented or independently qualified, label it a synthetic contract test or an outstanding gap. Do not imply native tenant adoption from a stubbed journey.

### 19.5 Browser comparison afterward

Once a conversational runtime passes, hold it fixed and compare browser substrates. This isolates:

- Acquisition success.
- Source quality.
- Browser-specific latency and token consumption.
- Network and credential boundaries.
- Process cleanup and crash recovery.

There is no demonstrated reason to combine these changes in the first experiment.

### 19.6 Product-relevant measurements

- **Usefulness:** did the answer satisfy the question with available evidence?
- **Correctness:** supported claims, accurate entity attribution, explicit gaps.
- **Latency:** first meaningful answer separately from acknowledgement; full completion and recovery time.
- **Cost:** all model/helper calls, tokens, cache usage and browser operations; actual cost only where pricing and billing data support it.
- **Recovery:** duplicate effects, lost answers, stale results, restart behavior and observed disposal.
- **Maintenance:** custom states and adapters, number of durable owners, private patches, import/build closure and the effort of a representative upstream upgrade.

Use independent human review of answers and a fixed rubric, with counterbalanced repeated runs. Report per-case results and ranges; do not turn a small experiment into an arbitrary universal score.

Additional measurement rules:

- HTTP 200 is not completed product success.
- “First event” must not be confused with first meaningful response.
- Count helper page rereads and source-capture work, not just native browser actions.
- Separate task success, useful partial answer and operational cleanup.
- Record billed cost as unknown where historical pricing or usage is incomplete.
- Treat forbidden disclosure/access/effects as hard failures rather than averaging them into a score.
- Record prompt and tool-schema differences rather than claiming perfect control where frameworks require changes.
- Use a small held-out set of approved public-source scenarios only after the necessary execution/budget authorization. No such live comparison was run in this research.

### 19.7 Falsification conditions

The recommendation is falsified if:

- Narrow fixes to the current runtime achieve equivalent usefulness and recovery with less maintenance.
- PydanticAI or Pi reproduces the same failures because the dominant problem is context/evidence design.
- Required controls demand widespread private SDK patches.
- Pi’s process boundary introduces more ordering and recovery complexity than it removes.
- A candidate cannot mediate hidden inference or dispatch attempts.
- OpenMaus or IronClaw demonstrates a materially cleaner implementation under the same controls.
- The replacement only succeeds by weakening authority, isolation, evidence or lifecycle requirements.

A failed SDK comparison would not automatically justify migrating the whole repository.

## 20. Independent challenge to the recommendation

The independent review raised these objections, which are incorporated into the recommendation:

1. **PydanticAI could optimize the wrong problem.** If command selection, prose, evidence and presentation remain one structured response, the same invalid-output failure mode can survive.
2. **Python convenience is not proof of architectural superiority.** Pi’s inspected loop is clearer and smaller; it can win if the bridge remains disciplined.
3. **“Keep Temporal and persistence” must not preserve the existing choreography.** Preserve ownership responsibilities and opaque-history constraints, while replacing coupled orchestration.
4. **A conversation-only trial needs preloaded evidence.** Otherwise acquisition failures obscure whether the new runtime can reason over existing sources.
5. **OpenMaus has the strongest relevant local browser evidence.** A cleaner SDK does not invalidate that evidence or establish superior browser performance.
6. **Pi’s bridge can erase its simplicity.** Event persistence, ordering, IDs, cancellation, packaging and crash recovery must be implemented and measured.
7. **Authority, exact effects, retention and evidence are irreducible product complexity.** They cannot be removed to obtain a better demo.
8. **Only two challengers should be implemented initially.** nanobot and IronClaw are substitutes if a static gate fails, not additional open-ended branches.
9. **Existing partial repairs deserve a fair baseline.** Shared history/evidence contract fixes must not be attributed to the new runtime.
10. **A wholesale migration needs affirmative evidence.** Failure of the current runtime does not establish that another application’s identity, policy and persistence are appropriate.

## 21. Historical evidence ledger

These are retained historical observations, not new tests performed for this assessment.

### 21.1 November 17 conversation campaign

Report located through the verification index and local .runtime/payme-thorough-20261117/review.json:

- 47 live turns across 11 conversations.
- All requests returned HTTP 200.
- 45 completed; 2 provider_invalid_output outcomes.
- Synthetic PayMe application context, payme-app, development environment.
- Railway development deployment, profile 8, real gpt-6.1-sol with low reasoning.
- Fingerprinted deployed increment over 92f0b32, not a clean blanket qualification of 68749d1.
- Corrections plus side conversation succeeded in tested cases.
- Broad follow-up and retry failed despite retained evidence.
- A narrower saved-example request succeeded without new research.
- A useful partial/fallback answer disappeared on history reload.
- The exact rejected model-output field was not retained, so the broad-follow-up root cause is unresolved.
- Recorded median full-response latency was approximately 8.81 seconds.
- One stream example had a first event around 0.93 seconds and full response around 6.46 seconds; this does not imply the first event was useful content.

### 21.2 Earlier research campaigns

- A November 12 campaign recorded nine completed conversations plus one partial, with eight failed research outcomes, one cancellation and zero verified research completions in that campaign.
- Later retained observations showed improvement, including six of seven useful cases, while evidence retention and test-harness limits remained concerns.
- Another ten-conversation/six-turn campaign recorded only one strict qualification; later quota exhaustion means not every failure is evidence of an orchestration defect.
- These campaigns were performed across revisions and conditions. Their counts must not be pooled into a current failure percentage.

### 21.3 OpenMaus standalone evidence at 263d9b79

Doctoralia:

- Minimal-instruction variant: 0/3 strict successes, approximately 42/39/31 seconds, 10/10/7 rounds and 9/9/6 actions.
- Explicit-instruction variant: 3/3 strict successes, approximately 64/56/55 seconds, 15/14/14 rounds and 14/13/13 calls.
- The first successful run recorded approximately 404,377 input tokens, 1,040 output tokens and 15 rounds.
- Reliable billed dollar cost was not established.

General browser campaign:

- 10 of 11 cases settled, which does not mean all assertions passed.
- 132 calls with usage records, approximately 2,079,067 input tokens and 7,204 output tokens.
- A dynamic-search assertion failed.
- Installed Chrome 157 failed in a tested path while pinned Chromium 153 worked.
- Screenshot count was zero in the six Doctoralia runs and in 74 recorded general steps; do not infer screenshot-based evidence from browser support alone.
- Synthetic typed form values were retained contrary to expectations.
- Two cancellation observations found no further recorded steps over ten seconds, which is weaker than proof of process termination.

An earlier Ideeo run recorded roughly 808 seconds, 57 model calls and 48 navigation actions with incomplete results. Different prompts, policies, budgets, environment and execution design prevent a valid speedup ratio against the OpenMaus runs.

### 21.4 Authenticated OpenMaus integration evidence

Retained verification entries include:

- Doctoralia runs around 121.63, 121.59 and 146.84 seconds.
- Corresponding model-request counts around 17, 14 and 18; action counts around 12, 9 and 13.
- These were successive revisions, not controlled repeated runs of an identical arm.
- Python research runs improved from approximately 62.5 to 61.92 seconds, with nine requests and three actions in the latter.
- Linux Python research with Temporal recorded approximately 91.61 seconds and nine requests.
- History reload after that journey caused zero additional model calls.
- Authenticated cancellation and cleanup were observed in retained integration evidence.
- Other default-backend behavior and independent human adoption gates remain separate.

### 21.5 Pending internalization checks

A relevant November 17 local session reported:

- 258 controlled tests.
- Five database skips.
- Simulated/local OpenAI behavior.
- No live browser/OpenAI end-to-end qualification for that pending increment.
- TypeScript errors still present.

These results support portions of the pending implementation. They do not establish successful minimal extraction, live browser behavior, clean build reproducibility or independent acceptance.

## 22. Development-history and code-inspection ledger

The October 27–November 17 local dev window contained 207 non-merge commits in the inspected query. Approximately 77 subjects referenced browser work and 75 had a literal fix prefix; minor differences from earlier tallies can arise from encoding/subject matching. These counts are descriptive, not architectural scores.

Relevant history included:

- 9533e75, November 1: engine enrollment work.
- aa8bc50, November 2: movement toward tenant API ownership.
- November 8–10: Browser Use and normal runtime changes.
- November 11–15: repeated repair work around research, evidence, controls and presentation.
- feae0d8, November 16: OpenMaus integration.
- 68749d1, November 17: conversation repair.

Some churn reflects deliberate ownership corrections, especially enrollment moving to tenant APIs. It should not all be classified as accidental orchestration complexity.

Approximate file touch counts in the reviewed window:

| File | Commits touching file in inspected history |
|---|---:|
| capabilities/assistant.py | 41 |
| capabilities/planning.py | 32 |
| capabilities/presentation.py | 35 |
| browser/public_tasks.py | 16 |
| browser/public_site.py | 28 |
| browser/openmaus.py | 1 committed |
| background/service.py | 9 |
| background/worker.py | 8 |

Additional code observations:

- capture_plan, around line 242, spans approximately 247 lines and combines capture, optional span/display repair and bounded recovery.
- compose_task_control_answer, around line 1628, spans approximately 150 lines.
- CapabilityPlanner.capture begins around line 879; its dynamic schema includes task/source handles and typed control reconstruction.
- public_progress_message, around line 619, spans approximately 458 lines.
- assessed_public_message, around line 1079, spans approximately 231 lines.
- presentation.message, around line 1325, spans approximately 410 lines.
- PublicResearchTasks.advance begins around line 1444 and spans approximately 362 lines.
- assessment_step begins around line 1190 and spans approximately 253 lines.
- _worker_step begins around line 1926 and spans approximately 248 lines.
- PublicResearchTasks.checkpoint merges page/URL/hash state, goal revisions and progress, then calls presentation and background persistence.
- dialogue_context, around line 1272, projects minimized authorized prose and structured evidence; previous answers are not treated as source evidence and banking data is excluded.
- It considers the latest 12 relevant items, with an approximate 24,000-character budget for prior prose in the inspected path.
- background_context similarly considers a bounded recent task set.
- OpenMausTasks.advance begins around line 299 in committed code and line 313 in the pending variant.

These line numbers describe the inspected revisions and may drift. Symbols and responsibilities are more durable references.

## 23. Upstream snapshot and source ledger

The following full hashes were recorded during research. A timestamped upstream HEAD is not proof that all supplementary moving-main files came from that exact commit.

| Repository | Recorded revision | Inspection qualification |
|---|---|---|
| CopilotKit/OpenBot | 7c9a4f7b3ed425df100e66e662f8546d20f0d3e8 | Main source/docs and deployment inspection; backend implementation absent from inspected checkout |
| openclaw/openclaw | f126fb81c22b3ebad5879f24731c742b1d0a024b | Moving-main application/core/browser/security inspection |
| NousResearch/hermes-agent | 5ebfa750c5d2963ce772f5ad1ec826900ed0807d | Moving-main loop/control/auxiliary/browser/security inspection |
| HKUDS/nanobot | 53a556585ed3b15727dc469bd9fd9dee643b009b | Moving-main runner/provider/tool/security inspection |
| nanocoai/nanoclaw | 2cb6926bb66bba9472089e67e4a26dba0663cca8 | Moving-main runner/container/security/build inspection |
| nearai/ironclaw | b0b999d96781516ee05e6ba961d6f3ead900da96 | Pinned manifests/model/dispatch/checkpoint files; supplementary moving-main platform source |
| earendil-works/pi | 635952742b0ea6ec17a9e229e531590460873727 | Pinned agent loop; supplementary moving-main agent/interfaces/package/durable docs |
| pydantic/pydantic-ai | 62e7b66c9f4da5c788eb360e49522a98e8fa0c86 | Pinned capabilities and Temporal durability; supplementary moving-main graph/tools/transports |
| langchain-ai/deepagents | 1a7d602a7ef6b54269bbb268e4bbc71f27ada0f9 | Pinned factory; supplementary moving-main middleware/backends |
| langchain-ai/langgraph | 02f2c2e6c992ffccce9e9129781fdd04f015c6fa | Pinned retry implementation; supplementary moving-main types and official persistence docs |
| OpenHands/software-agent-sdk | 06f643ca471eea73c662a76fef2e0b836a33c826 | Pinned agent/LLM; supplementary moving-main conversation/workspace/browser/credentials |
| Local OpenMausBot | 263d9b79b1164510718994d65dd678f266a61b3e | Local committed source and retained reports; untracked document distinguished |
| Local Ideeo | 68749d1 | Local committed dev plus separately inspected pending changes |

Most recorded upstream HEAD metadata corresponded to November 17, with LangGraph metadata on November 16. IronClaw’s recorded API metadata was older; this report does not characterize that hash as a November 17 release. No release qualification was inferred from a HEAD hash.

GitHub connector startup failures required fallback to public primary-source HTTP/web reads. No upstream code was executed.

### Canonical repository links and licensing entry points

- [OpenBot](https://github.com/CopilotKit/OpenBot) — MIT public template/application; Intelligence separate.
- [OpenClaw](https://github.com/openclaw/openclaw) — inspected root MIT license.
- [Hermes Agent](https://github.com/NousResearch/hermes-agent) — inspected root MIT license.
- [nanobot](https://github.com/HKUDS/nanobot) — inspected root MIT license.
- [NanoClaw](https://github.com/nanocoai/nanoclaw) — inspected root MIT license; former qwibitai URL redirects.
- [IronClaw](https://github.com/nearai/ironclaw) — inspected manifest licensing MIT OR Apache-2.0.
- [Pi](https://github.com/earendil-works/pi) — inspected root MIT license; former badlogic/pi-mono redirects.
- [PydanticAI](https://github.com/pydantic/pydantic-ai) — inspected root MIT license.
- [Deep Agents](https://github.com/langchain-ai/deepagents) — inspected root MIT license.
- [LangGraph](https://github.com/langchain-ai/langgraph) — inspected root MIT license.
- [OpenHands Software Agent SDK](https://github.com/OpenHands/software-agent-sdk) — inspected root MIT license.
- [OpenMausBot inspected upstream](https://github.com/milind-soni/OpenMausBot/tree/263d9b79b1164510718994d65dd678f266a61b3e) — Apache-2.0 core; enterprise terms separate.

## 24. Licensing, deployment and compliance implications

The main source-availability distinction is OpenBot: its public MIT application and separately licensed Intelligence/backend deployment do not currently provide the same independently rebuildable foundation as an inspected embeddable SDK.

OpenMaus has a different distinction: its core source is available under Apache-2.0, but enterprise terms and browser binary provenance remain separate concerns. NanoClaw and browser-enabled SDKs likewise combine open repository code with provider tools, downloaded binaries and browser distributions.

PydanticAI, Pi, nanobot, Deep Agents, LangGraph and OpenHands do not require adopting a proprietary hosted control plane for their basic inspected embedding paths. That does not exempt their dependencies or optional services from review. IronClaw’s selected crates are dual licensed but unpublished. No repository-wide open-source license was identified that would make Ideeo itself an externally reusable licensed upstream.

No candidate received a clean-build or deployment qualification in this research. Maintenance and reproducibility conclusions are based on source structure, manifests and documented dependencies—not successful rebuilds.

For a future implementation, the repository’s existing legal-register entries implicated by model/context, authority, browser and lifecycle changes are **LR-01–05, LR-12, LR-13 and LR-17**, with **LR-14** relevant to expanded external-agent mandate access.

These map to the existing register’s subjects:

- LR-01: personal data protection.
- LR-02: bank and financial secrecy.
- LR-03: third-party services, cloud and processing outside Mexico.
- LR-04: electronic channels and authentication.
- LR-05: information security and incident reporting.
- LR-12: electronic consent and record keeping.
- LR-13: access to third-party systems and site terms.
- LR-14: open finance and third-party access.
- LR-17: AI-specific regulation.

Relevant ISO/IEC 27001 control areas include access control, suppliers/cloud, legal/privacy, deletion, logging/monitoring and secure development: 5.15–5.18, 5.19–5.23, 5.31, 5.34, 8.10, 8.15–8.16 and 8.26–8.29.

Relevant ISO/IEC 42001 areas include impact assessment, lifecycle, data and third-party responsibilities: A.5.2–A.5.4, A.6.2.2–A.6.2.4, A.6.2.7–A.6.2.8, A.7–A.9 and A.10.3, subject to the repository’s applicable control mapping.

These are mappings to the repository’s stated obligations, not new legal conclusions or certification claims. Recorded counsel and contractual prerequisites remain pending where the register says so. Nothing in this report enables real-tenant model disclosure, a new vendor, cardholder processing or a new browser destination.

## 25. Evidence classification and outstanding uncertainties

### Inspected code supports

- The current orchestration spans tightly connected conversation, task, evidence and presentation responsibilities.
- A failed-task branch can hide persisted useful fallback content on reload.
- Existing tenant, authority, host-handoff and financial-operation seams are worth preserving as behaviors.
- Pi, PydanticAI and nanobot have actual embedding interfaces.
- IronClaw has a separable internal loop with explicit uncertainty-aware recovery.
- OpenClaw has a private internal core, not only a monolithic application.
- OpenBot’s inspected public deployment depends on backend images not rebuilt by that checkout.
- Browser cancellation and session separation have narrower meanings than physical termination and tenant isolation.

### Documented claims, not fully verified behavior

- OpenBot’s full organization/policy/audit/durable backend enforcement.
- Some platform deployment and sandbox coverage.
- Complete provider portability under Ideeo’s disclosure rules.
- Full transitive build reproducibility.
- Production behavior of combinations not exercised in retained evidence.

### Historical evidence supports

- Real authenticated journeys can fail despite browser success.
- Broad follow-ups and partial-answer reload had observed problems.
- OpenMaus can perform useful browser research under tested instructions.
- Certain integrated history-replay and cancellation/cleanup paths worked in retained tests.

### Untested hypotheses and proposals

- PydanticAI will reduce orchestration code enough to justify replacement.
- Pi’s clearer core will outweigh Node/Python integration cost.
- A canonical evidence projection will resolve broad follow-up failures beyond the specific known history bug.
- Removing redundant planning/presentation calls will improve cost and latency without reducing correctness.
- IronClaw or nanobot would outperform the first candidates under equivalent controls.
- A separately deployed runtime will improve isolation or operations enough to justify another service.

### Remaining limitations

- Local dev freshness against Concierge was not established.
- Supplementary upstream files were sometimes inspected on moving main.
- Session review was selective and relevant, not exhaustive; some files were locked.
- No clean upstream builds, dependency installations or live comparative runs were performed.
- No new human acceptance evidence was produced.
- No statistically valid general performance ranking or migration-time estimate is claimed.
- No entire application was qualified for hostile multi-tenant banking use.

## 26. Final investment decision

**Invest next in a clean conversational runtime replacement inside the existing engine, with PydanticAI core first and Pi as the independent challenger; shared fixes to evidence/history contracts; and explicit removal of the legacy orchestration from the new path. Keep OpenMaus as the controlled browser backend during that comparison.**

Do not invest next in migrating tenants, authority, banking effects, APIs and retention into OpenBot, OpenClaw, Hermes or another application. The inspected evidence does not show that those platforms would remove more complexity than they introduce.

The domain foundation is worth retaining because of the boundaries it expresses—not because of the effort already spent on it.

