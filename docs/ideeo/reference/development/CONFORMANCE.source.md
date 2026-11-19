> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../../README.md).

# Consumer contract conformance

The [v1 contract](../../contracts/SHARED_INTERFACE.md) is implemented by the engine. Use these checks alongside the actual app/SDK build verification in IDE-169. Sprint 2 selects the new engine through IDE-176; IDE-165 and IDE-168 (the legacy integration and its verification) were canceled on 26 October. Historical legacy evidence does not demonstrate the selected integration.

## Automated HTTP check

These direct-read checks do not verify [ADR-010](../../decisions/010-app-host-banking-and-model-context.md). Native adoption additionally needs real host-event/session binding, protected single-display balance/history with no chat/model/API replay disclosure, separate original UI history and sanitized later inference, scoped contact resolution, and duplicate/cancel/error/uncertain-outcome handling. The event schema and host lifecycle are still pending; existing green HTTP tests cannot substitute for those acceptance cases.

`scripts/contract_conformance.py` uses the published HTTP interface and typed schemas. It does not import or call the engine service, database, model adapter or token issuer. It checks:

| Case | Required observation |
| --- | --- |
| C01–C03 | Missing/invalid credentials fail; the authenticated account listing includes the independently expected account. |
| C04–C07 | JSON balance matches known synthetic account/money, currency, provenance and display; stored read and identical replay preserve the task; conflicting key use fails. |
| C08–C09 | A second valid membership cannot read the first membership's task or events. |
| C10–C12 | SSE events correlate with their terminal task, preserve exact money, replay after a cursor, and replay the submission without a new task. Identical repeated events are deduplicated; conflicting duplicates fail. |
| C13–C16 | Reject client-supplied identity fields, malformed idempotency keys, unsupported response media types and unauthorized account references. |
| C17–C20 | Reject another membership's conversation, a missing idempotency key, credential-like message input and a negative event cursor. The conversation probe omits the first customer's account reference so account denial cannot mask conversation isolation. |

Every response is checked for the contract's media type, no-store cache policy and request correlation. Transport/schema/semantic failures stop the run, preserve prior case outcomes, list unexecuted cases and return a nonzero exit status. Reports contain case IDs and fixed diagnostic codes rather than credentials, account data, raw responses or upstream exception text. A timeout is an unknown upstream outcome, not permission to retry automatically.

Use synthetic data only. Prepare two **different valid customer memberships** through the integrating service's trusted development setup. Set `ENGINE_ACCESS_TOKEN` and `ENGINE_OTHER_ACCESS_TOKEN` in the runner's process environment; do not put credentials in arguments, URLs or reports. The runner does not mint credentials or infer identity from SDK fields. The second identity must not own the first identity's account/task.

Create a fixture from independently known source records using [the example](../../contracts/conformance-fixture.example.json). Do not derive expected money by copying the response under test. The example matches the engine's reserved `demo-bank` / `member-a` seed; use `member-b` for the second credential. No fixture, preference, grant or bank data is changed by this check.

```sh
uv run python scripts/contract_conformance.py --allow-inference --base-url http://127.0.0.1:8189 --fixture docs/contracts/conformance-fixture.example.json --output .runtime/http-conformance.json
```

The CLI accepts only an explicitly selected localhost synthetic-development service and verifies `/health/live` before sending credentials. Redirects and environment proxies are disabled. Running it against a real inference adapter submits **two new turns**, up to four inference attempts with the current route-plus-planner development profile; all other submissions are intentional replays/conflicts. Reserve that budget before invoking it. Replay checks expect the service to enforce idempotency; an implementation defect can violate that expectation, which is why disposable fixtures and bounded server budgets are required. No automatic retry or provider fallback occurs in the runner.

The API/PostgreSQL integration test invokes the same checker with controlled inference, instruments actual bank reads and asserts exactly two model calls/two authorized reads for the whole sequence. This proves the robust implementation's reference behavior without paid calls. It does not prove the legacy implementation or a native screen conforms.

## Local profile

Use the reserved matching API/database profile from [setup](../SOURCE_REFERENCES.md#source-8f929a906ccd). The checker defaults to localhost API 8189 and requires synthetic-development health mode. Current observations are linked from [verification](VERIFICATION.md); configured tenant-bank acceptance needs its own contract cases.

## App and SDK verification

### Reference streaming consumer

[`TurnConsumer`](../SOURCE_REFERENCES.md#source-465f88f40859) is a Python reference HTTP consumer,
independent of the engine service, issuer, database and model adapters. Its behavior
can be ported to the native SDK; this module is not a mobile SDK binary. Use the
[callable synthetic sandbox](../SOURCE_REFERENCES.md#source-bddde6a784dc) for local
integration, or configure an approved HTTPS gateway for an actual tenant environment.

For a per-user development credential and device-facing origin, use the
[private handoff and device-access commands](../SOURCE_REFERENCES.md#source-51d97e0428eb).
Its `session.access_token` goes only in the Authorization header; identity fields
are informational fixture bindings, never client-authored authority. Its contract
hashes and public sandbox preflight identify the selected development runtime.
The handoff checker sends no credential before preflight, rejects redirects and
validates normal TLS trust/hostname. HTTP origins are limited to literal loopback
or `localhost`; non-loopback device access uses HTTPS.
The handoff checker rejects clients with inherited authentication, credential
headers, cookies or query parameters before making a request. Its CLI supplies
a dedicated client. Check reports become non-passing before work begins, so an
interruption cannot leave an earlier success presented as the current attempt.

Refresh through the local operator issuer and replace the complete session when
its five-minute credential expires. Clear visible banking state and old cursors
on replacement/logout/user switch. Private handoffs are temporary test material,
not SDK initialization secrets or deployable app resources. Real tenant session
exchange remains governed by [the authentication profile](../../contracts/AUTH_PROFILE.md).

```python
import httpx
from ai_engine.consumer import ConsumerError, TurnConsumer
from ai_engine.contracts import TurnInput

async def send(access_token: str) -> None:
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8230", trust_env=False) as client:
        consumer = TurnConsumer(client)
        consumer.set_session(access_token)
        try:
            async for event in consumer.submit(TurnInput(message="saldo"), "one-logical-turn"):
                # Render progress; inspect event.task.status/result/error at termination.
                # Monetary values stay exact structured decimals, never parsed from prose.
                print(event.model_dump_json())
        except ConsumerError:
            # End loading and show failure. Do not infer success or retry automatically.
            raise
```

The consumer decodes incrementally across UTF-8 and CR/LF chunk boundaries. It
checks task IDs, event sequence/duplicates, terminal task/status consistency,
response/cache/correlation headers and bounded event/stream sizes. A failed or
interrupted task under HTTP 200 remains a task failure. Disconnects and truncated
submissions raise fixed diagnostic codes without response bodies or credentials;
no provider call or automatic submission retry occurs in the consumer.

Call `set_session(new_token)` or `set_session(None)` and clear visible customer
state whenever login, logout, renewal or user switching changes the session. This
invalidates pending/buffered results before their next yield. It does not remotely
cancel an accepted engine task. A fresh consumer/session may explicitly call
`replay(task_id, after=last_rendered_event_id)`; every request uses the current
credential, and the server rechecks access. Replay is a finite snapshot and may
be empty or still in progress. Cursor tracking remains local to the current
customer/task; do not transfer it or old banking content into a new user's UI.

Closing/canceling the async iterator closes its HTTP response. For an uncertain
submission, the application decides whether to read the known task, replay events,
or repeat the identical request with the same idempotency key after checking the
current session. A new key represents new work. Native loading/error rendering,
token storage, protected login and actual session-switch screens still need the
app/SDK tests in IDE-169.

An HTTP check cannot establish native loading/error/session-switch behavior. For IDE-169 A01–A12 record the exact app/SDK/backend revisions, test build, platform/device, trusted session mapping and observed screens/states. Exercise success, zero/decimals, offline delivery, bank/service denial, invalid/expired sessions, late responses after a user switch and duplicate/out-of-order responses against the new engine through the SDK. Verify that provider credentials never enter the client. Use the existing Linear criteria and its 26 October scope amendment as authority; this guide does not create another acceptance contract.

Correlate the selected app's visible result with the authorized source read; exercise unavailable/malformed bank results, precision, freshness, ownership/tenant denial and concurrent users. Clearly mark synthetic demonstrations. A field named `tokenSAML`, a phone string or a successful screen is not a verified tenant session mapping.

Native UI, bank-source, protected-read and no-secret assertions require actual app/backend evidence. Do not mark them passed because this checker passes against the robust engine. See [integration context](../../product/INTEGRATION_CONTEXT.md) for inspected consumer sources and [verification](VERIFICATION.md) for evidence and acceptance gaps.
