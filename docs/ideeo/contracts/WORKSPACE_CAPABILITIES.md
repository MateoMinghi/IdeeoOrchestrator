# Authenticated workspace capabilities

The user selected isolated customer VMs for production and disposable local workspaces for development. Local fixtures exercise the product/executor boundary without a VM service or Docker daemon. They do not prove OS or hypervisor isolation. Production workspace provisioning, authenticated VM transport and capability parity remain incomplete.

## Implemented development boundary

Trusted free-form configuration can register capability routes, each bound to the complete tenant, client, membership, agent, grant, channel and channel-binding scope. A route pins its tool names, schemas, permission strings, credential environment variable and exact loopback executor endpoint. Model text and customer requests cannot select endpoints, modules or credentials. There is no ambient personal-host tool discovery.

The existing OpenMaus loop receives directly listed tools for small catalogs; the inherited `searchesCatalog` policy selects `search_tools`, `describe_tool` and `call_tool` for large catalogs. Only tools matching the admitted caller and permissions enter either view. Current disclosure and exact tool permissions are checked before dispatch and after completion. Directory operations consume tool reservations too. `GET /v2/conversations/capabilities` exposes family counts for the authenticated caller, not a grant of execution authority.

The executor authenticates the product, checks the full caller scope, schema, deadline and attempt identifier, and requires a durable claim before executing an owned handler. A supplied OpenMaus session can be adapted with pinned schemas and its approval requirements preserved through an explicit authorization callback. This adapter does not instantiate every upstream tool family.

Migration `003_capability_execution.sql` advances the database schema to 3 and records a durable execution owner before external work. A new execution cannot repeat that operation after a failed answer commit or process restart. An uncertain outcome is withheld and not automatically retried; reconciliation and compensation remain unimplemented. A committed answer still replays through the existing scoped encrypted store without repeating effects.

Migration `004_workspace_budget.sql` advances the database schema to 4. The trusted service selects a workspace profile only when the caller has registered, permission-matched tools: eight model attempts, seven tool reservations and sixty seconds per operation. Conversations without those tools retain three model attempts, two tool reservations and fifteen seconds. The database pins the profile and deadline to the operation; retries cannot upgrade them or refund debits. Both profiles share the original sixty-four-model/sixty-four-tool tenant/day ceiling. Each physical model and executor call remains bounded to eight seconds. Workspace HTTP responses have a sixty-five-second ceiling and the React append client waits at most seventy seconds; ordinary client operations retain thirty seconds. These remain synchronous bounded workflows, not general long-running jobs.

Workspace replies may contain up to four tool calls plus screened user-visible text. Every schema is validated before any call in the batch executes. OpenMaus executes them sequentially, with current permission, durable execution claim and budget checks per call. Tool-call IDs retain upstream duplicate rejection. Only exact validated tool messages may re-enter model context; reasoning fields and arbitrary transcripts remain excluded. The original single-tool free-form profile is unchanged. Gemini's transport explicitly requests automatic tool selection; it does not force a browser or any particular action.

## Disclosure and local implementations

Tool text retains the synthetic-content screen. Only tightly constrained `.invalid` destinations are admitted as invented test observations; real customer destinations are not qualified. Tool screenshots are limited to two bounded validated PNG/JPEG/WebP data images. Sending them to the model additionally requires current `inference:disclose:images` before and after physical model dispatch. Tool access alone does not grant image disclosure. Image parts are transient turn context and are not added to encrypted chat history.

The local browser fixture uses OpenMaus's Chrome/CDP engine with a fresh profile, an owned site and an egress gate permitting only that site. Six browser tools are registered. This is real browser execution against a fake booking service, not a live booking or qualification of the agent-browser CLI.

The file adapter uses the four inherited OpenMaus host file tools with workspace-relative paths. Absolute paths, parent traversal and existing symbolic links are refused. The temporary file root is separate from executor receipts and browser profiles. This wrapper is not an OS sandbox: hostile concurrent filesystem changes, hard-link confinement and arbitrary customer processes require separate isolation qualification. Never mount the user's home or real customer files in this local fixture.

## Remaining coverage

Browser/file integration is a tested increment, not full capability parity. Computer control, connected apps/email, data, agents/delegation, memory, automation, skills, research, image generation, voice, meetings, hosting, devices and workspace settings still need concrete workspace composition and individual authorization/lifecycle tests. The source inventory is discovery evidence only. Production VMs, external credentials, approval interaction, long workflows, real-model tool semantics, React capability UX, independent review and human acceptance remain open.

See the [local recipe](../../verification/ideeo.md#local-workspace-capabilities) and [verification record](../development/VERIFICATION.md#local-workspace-capabilities--19-november-2026).
