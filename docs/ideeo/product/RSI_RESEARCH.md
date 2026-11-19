> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Recursive self-improvement, portable skills and deferred interpreter execution

Research date: 22 October 2026; interpreter/skill direction reviewed 3 November 2026. Original repository baseline: local `dev`, `06dbae2`; later source review: `ad434a2`.

This note records the research and conclusions developed with Mateo about recursive self-improvement (RSI), Harness Zero, and LangChain interpreter skills. Mateo requested that these findings be saved on `dev`. The recommended experiment, runtime selection, budgets and acceptance criteria remain proposals; saving this note does not accept an ADR, authorize paid experiments or production promotion, or claim that RSI is implemented.

## Conclusion

The recommended starting point is **controlled evolution of versioned instruction skills**. An improvement agent proposes changes to instructions and reference material, tests candidates in isolation against approved tools, and submits evidence for independent verification and human-controlled release. A qualified version becomes the baseline for later improvement rounds.

The current direction uses portable guidance over ordinary typed, reviewed tools/adapters. Skills may explain how to use Playwright, browser-use or APIs and how to recognize and verify live states. Skill-bundled scripts, special module loading and interpreter execution are deferred. Their future value must be demonstrated against the existing tool path; an interpreter is not a prerequisite for useful skills or skill improvement.

Begin with synthetic, bounded work. Defer model-weight training and unrestricted agent-code evolution until skill-level improvement has demonstrated useful, repeatable gains on unseen scenarios. Later, test whether the improvement process can improve its own repair instructions or search strategy under independently fixed evaluation rules.

## Engine context and current baseline

The [project context](PROJECT_CONTEXT.md) defines one shared engine serving PayMe and other tenants. The brain proposes; the authority enforces identity, mandates, approvals and limits; bank/provider systems execute under their contracts. The bank core owns money and its ledger. A bank assistant delegating reasoning to our brain is a different integration from an external agent using the authority APIs under its own mandate.

The local `dev` baseline includes typed planning and capability capture, deterministic financial presentation, tenant backend ports, a separate Go/CEL authority service, encrypted scoped records, eval infrastructure, and Temporal/LangGraph background execution. It also includes a bounded, read-only public product-comparison executor. See the [coordination contract](../contracts/AGENT_COORDINATION.md), [background-task contract](../contracts/BACKGROUND_TASKS.md), [authority contract](../contracts/AUTHORITY.md) and [verification index](../reference/development/VERIFICATION.md) for actual behavior, recorded evidence and remaining gates.

The comparison executor obtains approved document observations, selects source-backed product facts, checks goal fit and can replan. It does not establish arbitrary authenticated browsing, checkout or durable financial effects. Earlier discussion described general browser execution as future work before this increment was inspected. The current bounded comparison capability is a useful baseline for the proposed experiment; broader browser autonomy still needs its own contracts and evidence.

The [ADR index](../decisions/README.md) distinguishes Proposed records from accepted decisions and scoped development authorization. This research does not change those statuses. No runtime tests, paid inference, training or banking operations were performed as part of this research/documentation task.

## What RSI means in this discussion

These mechanisms should be evaluated separately:

| Mechanism | Persistent change | Meaning for this engine |
| --- | --- | --- |
| In-task reflection or replanning | May have no effect on later tasks | Useful execution behavior, but insufficient evidence of learning. |
| Procedural memory and skill learning | Retained lessons or revised skill artifacts | A practical first target, with provenance, scope and lifecycle controls. |
| Prompt or harness optimization | Revised instructions, retrieval, orchestration or helper code | Can improve the agent system without changing model weights. |
| Model training/distillation | Revised weights or adapters | A later option requiring qualified data, training and deployment profiles. |
| Recursive improvement of the improver | Revised mechanism that proposes or selects improvements | A stronger claim requiring evidence that it produces better improvements on unseen improvement tasks. |

Terminology varies across papers. Repeating an optimization loop does not by itself demonstrate that the optimizer is becoming better at improving agents. An agent retaining experience also does not establish that the retained material improves future outcomes. [PAST-Bench](https://arxiv.org/abs/2608.04003) specifically evaluates experience reuse across fresh sessions and reports uneven, capability-dependent benefits.

The first proposed experiment is bounded system self-improvement. It makes no claim of indefinite capability growth or autonomous production self-modification.

## Research findings

### Harness Zero

[Harness Zero](https://arxiv.org/html/2609.24974v1) evolves a domain harness, adapts it into private reviewer guidance, and collects student trajectories in a fixed target action space. Before a student proposal executes, a reviewer passes or replaces it. Fine-tuning uses accepted trajectories; deployment removes the reviewer and evolved guidance while retaining the target harness.

The paper reports a macro-average of 23.3% for the base model under a minimal harness, 41.7% with the evolved harness, and 44.3% after distillation under the minimal harness. Its domains are spreadsheet manipulation, simulated application tasks and retrosynthesis, not banking qualification. It reports harmful interventions from weaker reviewers, additional collection overhead and incomplete transfer of some capabilities. Some alternative distillation signals degrade performance.

The transferable lesson is to express corrections through the tools and contracts available to the deployed student. These findings justify an experiment, not an expected performance increase for this engine.

Source inspection used repository revision `a4a6223241479c750fdab827c3a449bb1d41b99a`:

- [Review middleware](https://github.com/metaevo-ai/harness-zero/blob/a4a6223241479c750fdab827c3a449bb1d41b99a/src/harness_zero/student.py): after the replacement budget is exhausted, proposals pass without review. A reviewer therefore cannot replace our independent authority boundary.
- [Harness evolution workflow](https://github.com/metaevo-ai/harness-zero/blob/a4a6223241479c750fdab827c3a449bb1d41b99a/.agents/skills/student-harness-evolve/SKILL.md): later rounds focus on failed tasks and remove solved tasks from subsequent evaluation. Our promotion process must also rerun affected regressions.
- [SFT builder](https://github.com/metaevo-ai/harness-zero/blob/a4a6223241479c750fdab827c3a449bb1d41b99a/src/harness_zero/sft.py): builds training conversations from successful reviewed trials and identifies reviewer-perspective reasoning for masking. Successful collection alone is not evidence of safe, generalizable training data.

### Other relevant approaches

| Source | Finding relevant to the recommendation | Practical implication |
| --- | --- | --- |
| [Reflexion](https://arxiv.org/abs/2303.11366) | Uses linguistic feedback retained in episodic memory without weight updates. | Procedural lessons can be useful, but need correct attribution and evaluation. |
| [GEPA](https://arxiv.org/abs/2507.19457) | Reflects on execution trajectories to propose, test and combine prompt revisions. | A candidate method for improving skill instructions and task interpretation. |
| [Meta-Harness](https://arxiv.org/abs/2603.28052) | Searches harness code using prior candidates, scores and traces. | Supports later experiments on context selection and orchestration. Its coding experiment searches and evaluates on the same benchmark, so that result is not held-out generalization evidence. |
| [Promptbreeder](https://arxiv.org/abs/2309.16797) | Evolves task prompts and the mutation prompts used to improve them. | Provides a bounded route to studying improvement of the improver. |
| [STOP](https://arxiv.org/abs/2310.02304) | Uses an LLM-backed program to improve the program that generates improvements, with fixed model weights. | Shows system-level recursion; the authors distinguish it from full weight-level RSI. |
| [SICA](https://arxiv.org/abs/2504.15228) and [Darwin Godel Machine](https://arxiv.org/abs/2505.22954) | Demonstrate agent-code modification and selection across successive candidates. | Useful research references, with a wider editable surface and verification burden than the proposed first experiment. |
| [AIDE2](https://arxiv.org/abs/2609.26457) | Reports seven successive improvements in an eight-day research-agent run, with transfer to four held-out benchmarks. | Strengthens the case for bounded experiments; does not qualify banking behavior or establish indefinite compounding gains. |

### Evaluation integrity

[REUSE](https://arxiv.org/abs/2609.33180) studies adaptive overfitting when an improvement process repeatedly receives feedback from a finite benchmark. Its guarantees depend on its specified feedback and statistical protocol; they do not automatically apply to our pilot. Keep development feedback separate from protected acceptance evaluation, limit adaptive reuse, and preserve failed attempts.

[Reward Hacking Challenges Oversight of Autonomous Research Agents](https://arxiv.org/abs/2609.28614) documents systems satisfying reported metrics through evaluation exploits. Keep acceptance oracles, critical invariants and promotion rules outside the optimizer's writable scope. Independently recompute outcomes; model review alone is insufficient.

## Interpreter skills: assessment and upstream changes

LangChain's [29 May article](https://www.langchain.com/blog/interpreter-skills) proposes skills containing discovery instructions and executable TypeScript modules. The model selects a skill and inputs; code provides reusable procedures and can coordinate work. This makes procedural changes easier to review and test, while preserving agent discretion over when the procedure applies.

The useful transferable idea is a focused, versioned improvement artifact. Instructions can improve observation interpretation, tool selection and recovery while trusted tools implement deterministic operations. Neither packaging nor function invocation guarantees valid inputs, complete execution or safe effects; verification needs source-backed outcomes.

### The article's Python import API was subsequently removed

LangChain merged [PR 3843](https://github.com/langchain-ai/deepagents/pull/3843) on 10 June 2026, removing Python's `skills_backend` option and automatic `@/skills/...` module loading. The maintainer explained that special interpreter metadata conflicted with skills' portability, and suggested keeping scripts in ordinary skill directories and reading them into the interpreter. The removal is also visible in [commit 1159e504](https://github.com/langchain-ai/deepagents/commit/1159e504abaeec4f81d5e777ecde6a6cee641edb).

The current Python middleware and README inspected during this research still omit that loader. Historical package documentation describes the older API; it must not be treated as the current Python integration contract. This observation is specific to the inspected Python implementation, not a claim that every language implementation has identical support.

Current [skills documentation](https://docs.langchain.com/oss/python/deepagents/skills#execute-code-with-skills) still permits ordinary scripts in portable skill directories and describes sandbox execution. The separate [interpreter documentation](https://docs.langchain.com/oss/python/deepagents/interpreters) continues to describe a beta interpreter. Removing the special loader did not remove all code-capable skills or interpreters. Our deferral below is an engine design choice, not a claim that LangChain abandoned code execution.

### Why interpreter execution is deferred

On 3 November Mateo requested removing executable scripts from ADR-007. The current scope is instruction/reference skills over approved tools. The local source review at `ad434a2` found typed capability handlers and Temporal/LangGraph background execution, with no Deep Agents/QuickJS dependency or interpreter-skill loader in the source, tests or dependency manifests. This is source evidence, not runtime qualification.

- **Portability:** the article's Python import API was removed; we should not rebuild a custom loader around historical examples.
- **Unproven benefit:** this engine has no comparison showing that an interpreter improves task correctness, latency or cost over ordinary tools. Tested deterministic behavior can remain in reviewed adapters.
- **Authority and recovery:** interpreter-bridged calls require their own current authorization, metering and durable effect records. The documented per-tool approval limitation and snapshot behavior below add integration work to ordering and booking.
- **Scope:** usable provider guidance and general browser exploration can proceed without script bundles or a second execution mechanism. Instructions must still recognize live state and verify outcomes.

Reconsider only for a concrete workload, such as large read-only comparisons or tool batching, with a supported pinned runtime and an equal-budget comparison against ordinary tools. Require isolation, per-operation authority, bounded resource use, interruption/replay and outcome evidence before selecting it. No package, custom loader, interpreter experiment or paid run is authorized by this research. Future changes to trusted helper code follow ordinary software review; they are outside the initial instruction optimizer's writable surface.

### Runtime and integration implications

The [interpreter documentation](https://docs.langchain.com/oss/python/deepagents/interpreters) describes a constrained QuickJS runtime with explicit capability bridges. Programmatic tool calls do not receive normal per-call `interrupt_on` approval enforcement. Snapshots retain working state, do not undo external effects, and cannot restore every runtime object. The [current Python README](https://github.com/langchain-ai/deepagents/blob/main/libs/partners/quickjs/README.md) also documents a subagent bridge enabled when configured subagents exist, separately from the tool allowlist.

If interpreter execution is reconsidered, this engine requires:

- Every bridged operation must use trusted identity and current authority. Approval of one interpreter invocation is not approval of all effects attempted inside it.
- Meter calls, inference, delegation, concurrency and total task resources through host-owned counters. Per-evaluation limits alone do not bound a complete task.
- Bind runtime state to tenant, membership, caller, task and qualified skill version. Scope shared generic skills separately from tenant-specific facts and customer data.
- Keep secrets and protected executor-only values outside agent-programmable memory. Code can expose values through results, logs and errors even if intermediate values initially remain outside model context.
- Preserve exact decimal-string financial contracts and trusted host validation across the JavaScript/Python boundary. Type annotations do not enforce runtime domain rules.
- Keep Temporal responsible for durable scheduling and recovery, with protected application records owning necessary content and effect evidence. Reconstruct interpreter working state from approved checkpoints; preserve completed effects after interruption.
- Pin a running task's skill version. Loading a new release must not silently replace code midway through a durable operation.

These are proposed integration requirements derived from the existing engine contracts. They are not evidence that interpreter integration has been implemented or qualified.

## Proposed skill-evolution boundary

A skill package should identify instructions, references, approved tools and their contracts, required capabilities, version, provenance and verification evidence. Discovery, instruction loading and rollout mechanics need a concrete contract. Metadata never grants permissions; executable bundles remain deferred.

| Surface | Proposed treatment |
| --- | --- |
| Skill instructions and reference material | Editable by the improvement agent in isolated candidates. |
| Tool/adapter implementations | Ordinary reviewed software; outside the initial instruction optimizer's writable scope. |
| Development examples and diagnostics | Available under explicit data and experiment scope; generated cases are candidate evidence. |
| Acceptance expectations, held-out cases and promotion rules | Independently owned; unavailable for optimizer edits. |
| Authority, mandates, approvals, bank mappings and financial invariants | Enforced by trusted services outside the optimizer's writable scope. |
| Skill release and effective configuration | Immutable qualified bundle with review evidence and rollback. |
| Production promotion | Human-controlled under existing policy. |

Instruction skills guide a general agent loop using approved tools. Previously unseen sites and changed layouts still need observation, planning, recovery and applicable destination/authority qualification. Skills must not reduce the product to a closed list of scripted websites.

The improvement agent should have access only to its authorized candidate workspace, synthetic environments, permitted learning examples and fixed experiment budget. Runtime task agents should not edit the active released skill library. A candidate's generated tests can supplement independent verification but cannot define its own acceptance contract.

## Proposed first experiment

The discussion converged on a synthetic quote-comparison skill as the first concrete experiment, alongside the existing planner evaluations as affected regression coverage. The earlier prompt-only pilot remains a useful comparator. The current bounded comparison executor offers an integration baseline; its source-fact and authority controls remain trusted engine behavior.

The initial question is whether revised instructions produce repeatable gains on unseen scenarios with the same approved tool capabilities. Interpreter execution is excluded from this initial proposal.

Compare equivalent behavior under the same model, permitted tools, inputs and total resource budgets:

1. The baseline instructions and current reviewed tools.
2. Candidate instructions and references using the same tools and execution contracts.

A later, separately scoped execution comparison may assess a reviewed helper or interpreter against this baseline under the reconsideration conditions above.

Use controlled quote inputs and read-only synthetic sources. Scenarios should cover full versus advertised prices, delivery charges, unavailable/stale offers, missing information, item/variant mismatches, currencies without an approved conversion, corrections, malicious source content and partial results. Exercise Spanish selection/clarification when model interpretation is involved. Test cancellation, revocation, timeouts and restart/replay at any boundary the experiment actually crosses.

Freeze the baseline and dataset revisions before acceptance evaluation. Let the improvement process use development failures to produce a bounded set of candidates. Evaluate unseen scenario families as well as previously successful regressions. Keep model/runtime budgets matched so extra work is not misreported as a better procedure. Report repeats and uncertainty where variability matters, case-level failures, forbidden calls/disclosures, correctness, clarification quality, cost, latency and recovery.

Promotion first requires satisfying critical invariants. Quality and efficiency gains then follow previously approved thresholds and regression budgets. No numeric success target, campaign size, paid-call allowance or model/runtime choice is approved here. Use [AI development policy](../policies/AI_DEVELOPMENT.md), [independent testing ownership](../policies/TESTING_OWNERSHIP.md) and [production readiness](../policies/PRODUCTION_READINESS.md) rather than creating a competing release process.

The proposed experiment's output is one baseline instruction skill, candidate diffs, an independent comparison report and reproducible evidence. A negative result is useful: it may show that the baseline suffices, that the dataset is inadequate, or that changes do not generalize.

## Learning data and future progression

Operational retention is not permission to train on customer data. Start with synthetic examples. Any later learning store requires an authorized purpose, readers/writers, model-disclosure policy, tenant scope, protection, retention and deletion propagation under [data ownership and lifecycle](DATA_OWNERSHIP_AND_LIFECYCLE.md). Generic procedural lessons need review before sharing; customer facts, mandates and tenant policies do not become global skill knowledge.

After useful skill-level gains are demonstrated, consider broader browser procedures, retrieval and orchestration. To study stronger recursion, compare an improver that revises its own repair instructions or search strategy against its predecessor on unseen improvement tasks at equal budgets. Keep the evaluator, authority and release boundary independently owned.

Harness Zero becomes a later option when there is a proven harness and sufficient permitted reviewed trajectories. Test whether a fine-tunable model absorbs those procedures and reduces operating cost. Distillation does not remove the engine's authority, isolation, durable-state or evidence obligations.

Open decisions before implementation include the instruction-skill contract and loader, tenant/task isolation and version semantics, experiment model and budgets, independent datasets/oracles, promotion thresholds and any learning-data lifecycle additions. Interpreter or bundled-script execution needs a separate future scope and decision. Record consequential selections in the applicable contracts or a proposed ADR; this research note does not settle them incidentally.
