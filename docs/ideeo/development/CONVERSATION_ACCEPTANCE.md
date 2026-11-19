# Conversation acceptance candidate

This candidate starts from product `8b3984055a6cd958b1afa1e7722ed9a60b6dba00` and PayMe `e55abc73e672ae7af44ce9f8e36e93e33a66eb0d`. The security inspection and tests below are implementer evidence, not independent review or human acceptance. Only invented content and disposable identities, databases and browser profiles are authorized.

## Review scope and findings

| Boundary | Inspection and challenge | Disposition |
| --- | --- | --- |
| Tenant and caller isolation | Seven-field caller binding, forced RLS, encryption AAD, current admission on reads and replay; second-tenant and channel denial | Retained; regression evidence required |
| Model disclosure | Explicit request marker plus current `inference:disclose` and `inference:invoke` before and after physical calls; model text cannot grant scopes | Retained; removed-guard mutation must fail |
| Provider response | The transport previously replaced the supplied message role with `assistant`, accepting a `user` response | Fixed by requiring `assistant`; isolated regression reproduced HTTP 200 instead of 503 before the fix |
| Publication and revocation | Private buffering, encrypted atomic turn/outbox commit, current conversation authority before HTTP publication; UI abort/generation checks | Retained; no claim of retroactive erasure or an atomic distributed authorization lock |
| Resource limits | Separate durable attempt transactions, fixed operation deadline, caller idempotency, tenant/day counters shared across processes | Four concurrent requests at 63/64 must produce one provider call and one committed turn |
| Model context | Versioned encrypted projections, matching profile, recent twenty-pair/7,000-byte suffix; public history excludes projection | Long-history and restart tests retain ordered context and complete visible history |
| Browser | Fresh tenant proof per operation, no browser storage of proof/transcript, escaped text, same-key lost-response retry, revocation and tenant switching | Scripted browser and live-model results recorded separately |
| Privacy screen | Known secrets, bounded text and recognizable sensitive patterns; model refusal assessed separately | Heuristic remains unsuitable as a general customer-data classifier; encoded, paraphrased and unrecognized sensitive content remain open risks |
| Accounting | Counts bound dispatches; provider usage may be unknown and monetary cost remains SQL NULL | No verified monetary spend cap or provider-bill reconciliation |

The fix does not change the system prompt, tool registry, model route, database schema, authority scopes or retention policy. Supplier/data-processing and protected host-banking restrictions continue to apply. Compliance impact remains synthetic-only evaluation; no new permission for personal, financial or cardholder data is established.

## Evaluation contract

The deterministic suite challenges wrong-role, incomplete, empty, malformed, oversized, redirected and timed-out provider replies; concurrent/replayed requests; current disclosure; encryption; cross-tenant isolation; context truncation; and process-shared quota consumption. A denied operation must have no unauthorized turn or provider effect, while attempted work remains consumed. This contract derives from the existing loop and storage contracts, not from model-generated expectations.

The live browser campaign uses the existing exact Luna evaluation profile with no automatic retries. Its disposable PayMe budget starts at 52 model and 62 tool attempts, leaving at most twelve model calls and two tools. The browser requests a short invented invitation, revises it, retries a dropped committed response without inference, reloads, uses the harmless color tool, and exercises revoked and foreign identity. Additional Spanish, French and English requests challenge claimed administrator authority, quoted hostile instructions, and fabricated tool authority. No actual credential is placed in a prompt. Responses are checked against explicit task constraints and refusal phrases; no judge model is called.

This is one small development campaign. Phrase-based graders are limited and do not establish universal refusal, factuality or privacy. Synthetic approved answer text may be retained as evidence; raw provider replies, private reasoning and credentials may not. Failures must remain recorded and must not be rerun until green without explanation.

## Acceptance and staging gates

| Gate | Owner/evidence needed | Current standing |
| --- | --- | --- |
| Developer verification | Exact source manifest, deterministic regressions, mutation sensitivity, browser/model observations, clean install and static checks | See the dated verification record |
| Independent adversarial review | A separate reviewer/model inspects the final revision and challenges the tests and findings | Pending; implementer review does not satisfy this |
| Different-human functional acceptance | Reviewer observes authentication, send/revise/tool/reload, failed-response retry, revoked session and foreign-tenant denial in an isolated environment | Pending |
| Remote CI | Dedicated `Ideeo isolated verification` workflow on the published candidate | Workflow prepared; no remote success inferred from local commands |
| Synthetic staging preparation | Named isolated destination, compatible protocol-3 reader, disposable tenant integration, managed secrets, restricted ingress, expiry/cleanup and rollback verification | Destination and operational qualification pending |
| Staging deployment | Approval of the exact revision, destination and synthetic-only configuration | No deployment authorized or performed |
| Real customer use | Tenant/provider legal and processing clearance, qualified source and consumers, production privacy, budgets, keys, retention, monitoring and recovery | Closed |

The new CI workflow installs the frozen lockfile and runs full UI/server typechecks, focused product checks, isolated product regressions, mutation tests and the UI build. It contains no live-model credential or call. Actual PayMe/browser integration additionally needs the explicitly selected sibling checkout and remains separately evidenced. CI uses PostgreSQL 16; local evidence identifies its actual PostgreSQL version and does not qualify the unexecuted Linux job. Existing upstream CI remains unchanged.

Rollback must retain a reader compatible with protocol-3 free-form envelopes. Disabling inference does not make older binaries capable of reading those records. No staging or customer database has been created by this work.
