# Conversation storage development contract

This candidate implements `ideeo-conversation-storage-1` over disposable PostgreSQL. It is an additive development protocol, not the imported full `/v2/turns` interface, a functioning assistant or a qualified SDK/WhatsApp consumer. Only the two synthetic input tokens below are accepted. The existing OpenMaus loop remains the foundation for the next controlled-inference milestone; no replacement conversational brain or model call is introduced here.

## Authority and ownership

Every request verifies the tenant-issued proof and obtains fresh [tenant admission](ADMISSION.md). Reading requires `conversation:read`; creation and append require both `conversation:read` and `conversation:write`. Both permissions must survive the intersection of signed token and current grant. PayMe additionally intersects current `NICO_SCOPES`. `history:read`, financial capabilities, a valid cookie or a successful `/v2/session` response do not grant transcript access.

The complete record scope is `{tenant_id, membership_id, client_id, agent_account_id, grant_id, channel, channel_binding_id}`. It comes only from verified identity and trusted client mapping. SDK has an empty binding identifier; WhatsApp requires the signed current generation. A different tenant, caller, grant or channel generation cannot inherit old conversations, even if other identifiers overlap. Renewed proof for the same complete scope can resume them. No scope, key or authority endpoint can be supplied in the request body.

Mutations recheck current admission immediately before commit and after commit before disclosure. History rechecks after loading and before disclosure. The checks are bounded snapshots, not a distributed lock on tenant authority: revocation after the final reply can affect the next request, but cannot retract already delivered content. Revocation during the final check suppresses disclosure even when the transaction has already committed. A later authorized retry returns that committed receipt. No permission is cached and no financial authorization is created.

The actual PayMe API at `4efeaf56d3e7f47248d76938f979b0d5a7d7b6cf` already supports explicit scope intersection, so its runtime/wire protocol required no change. The synthetic integration configures its actual signer, current tenant configuration and synthetic status source with these conversation permissions. Existing live configurations or sources are not asserted to grant them. Native A0 financial capabilities do not acquire conversation permissions by inference; unsupported native/hosted evidence still denies or returns unavailable. The paired API worktree's `docs/integrations/ideeo-admission.md` records this coordination.

## HTTP interface

Requests use one `Authorization: Bearer <tenant proof>`. Mutations require one `Idempotency-Key`: 1–100 ASCII letters, digits, dot, underscore, colon or hyphen. JSON bodies are limited to 4 KiB. No other body fields are accepted.

| Method and path | Request | Successful response fields |
| --- | --- | --- |
| `POST /v2/conversations` | `{}` | `conversation_id`, `created_at`, `expires_at` |
| `POST /v2/conversations/{uuid}/turns` | `{"message":"synthetic.hello"}` or `{"message":"synthetic.follow-up"}` | `turn_id`, `conversation_id`, `event_id`, `sequence`, `status`, `message`, `answer`, `created_at`, `expires_at` |
| `GET /v2/conversations/{uuid}/turns?after=0&limit=25` | No body | Conversation fields, `turns`, `next_after` |

All successful replies are HTTP 200 with `api_version` and a fresh `request_id`. Sequence starts at one and history is ordered ascending. `after` is an integer from 0 through 9999; `limit` is 1–50, default 25. `next_after` is the last returned sequence when more rows exist, otherwise null. There are at most 1,000 turns per conversation. History uses a repeatable-read database snapshot. UUIDs are lowercase, server generated and scoped; knowledge of an ID is not authority.

An answer is a fixed synthetic object, for example `{"kind":"synthetic_storage","text":"Synthetic greeting recorded."}`. Status is `completed` only after the transaction succeeds. These strings are fixture inputs/results; arbitrary user text, credentials, balances, transaction history, media, tools and model responses are not accepted by this development route.

Errors contain only `{error:{code},request_id}`. HTTP 401 is invalid proof, 403 denied admission/permission, 404 absent or foreign resource, 405 unsupported method, 409 concurrent work/idempotency conflict/conversation limit, 410 expired content, 422 invalid request, and 503 unavailable authority/storage. Responses use `no-store` and `nosniff`; 409 supplies `Retry-After: 1`. SQL exceptions, proof, key material, source responses and caller existence are not disclosed. The overall route deadline is 20 seconds. Authority deadlines remain as configured; PostgreSQL uses a two-second connect timeout, three-second statement timeout, 200 ms lock timeout and ten-second idle transaction timeout, with four connections per process.

## Idempotency, concurrency and publication

Creation and turn keys occupy separate namespaces within the full caller scope. Stored keys and input fingerprints are HMAC-SHA-256 values under a separate stable secret. A turn's fingerprint binds its conversation and message. Reusing a live key for changed input or another conversation returns 409; an identical authorized retry returns the same conversation/turn/event IDs and timestamps, with a new request ID.

Nonblocking PostgreSQL transaction advisory locks serialize a caller/key and each conversation. Contenders receive 409 and retry using the same key. Uniqueness constraints provide a second defense. Sequence allocation, the encrypted user message, encrypted answer and an outbox record commit in one transaction. Foreign keys include the complete scope and record relationship. A rollback or process death before commit leaves none of those changes. Failure after commit cannot undo the durable receipt; retry recovers it without appending another turn.

The outbox contains only scoped identifiers, sequence, kind `answer.committed` and timestamp. It carries no transcript, proof or credentials. This milestone publishes only the HTTP response after commit and fresh authorization. There is no stream, broker dispatcher, delivery acknowledgment, background execution, model attempt, lease recovery or claim of exactly-once network delivery. Asynchronous inference requires durable attempt/state/lease handling and authorized outbox delivery before integration. A disconnected/timed-out response may coincide with commit; clients resolve ambiguity by retrying the same key rather than inventing another operation.

## Encryption and database roles

`migrations/ideeo/001_conversations.sql` creates schema version 1, three tables with `ENABLE` and `FORCE ROW LEVEL SECURITY`, scoped policies and three roles:

| Role | Granted access |
| --- | --- |
| `ideeo_owner` | NOLOGIN schema/table/function owner; trusted maintenance policy |
| `ideeo_runtime` | Scoped SELECT/INSERT, and only the conversation `next_sequence` UPDATE column |
| `ideeo_maintenance` | EXECUTE of the fixed `purge_expired()` function; no transcript table reads |

Runtime cannot own schema/tables, bypass RLS, create objects, truncate, delete, alter ciphertext or assume an owner role. Startup rejects privileged roles, role membership, missing/disabled forced RLS, unexpected owners or broadened mutation/maintenance grants. Schema migrations are explicit; product startup never migrates. The migration runner requires the fixture bootstrap administrator. Login passwords and database CONNECT are provisioned separately by the disposable fixture.

Runtime uses transaction-local `ideeo.caller`, set by trusted application code; `USING` and `WITH CHECK` bind all seven fields. An unset scope sees no rows. This prevents omitted application filters and pool scope leakage; it does not make a stolen shared runtime database credential a tenant credential. The trusted process and database administrator remain within the security boundary. Startup is not a substitute for policy integrity review or production credential/network controls.

Messages and answers use AES-256-GCM with independent random 96-bit IVs. The authenticated data binds format version, key ID, all caller fields, conversation ID, turn ID, sequence, content expiry and user/answer field. Copying ciphertext between fields, resources or owners fails authentication. Clear ownership identifiers and timestamps remain queryable metadata; the data store is not anonymous. Raw transcript is never a model input in this milestone.

Each configured tenant needs a keyring of 1–10 canonical base64 32-byte keys including the configured active key. New writes use that key; reads use the envelope key ID. Rotation retains old keys until retained content and recovery requirements permit removal. Missing/wrong keys fail closed. The HMAC secret is separate and must remain stable through the replay window; changing it changes key lookup semantics and is not an automatic rotation procedure. Environment injection is a development mechanism, not production KMS or backup qualification.

## Configuration and lifecycle

Storage is optional in trusted product configuration. When omitted, conversation routes remain closed. When supplied, it has exactly these fields:

```json
{
  "mode": "synthetic",
  "databaseEnv": "IDEEO_STORAGE_DATABASE_URL",
  "keyringEnv": "IDEEO_STORAGE_KEYS",
  "fingerprintKeyEnv": "IDEEO_STORAGE_FINGERPRINT_KEY",
  "activeKeyId": "first",
  "contentTtlSeconds": 600,
  "replayTtlSeconds": 1200
}
```

The database URL must use `postgres://ideeo_runtime:<generated-password>@127.0.0.1:<explicit-port>/ideeo_fixture_<24-hex-digits>` with no query/hash. This validation is a destination restriction, not proof that a database is disposable: use the owned fixture, never rename or relabel a real database. The keyring environment value maps each configured tenant ID to its key-ID/base64-key map. Keys are supplied out of band, never included in config JSON or examples. Production and real-destination modes remain refused.

Content TTL is 1–86,400 seconds. Replay TTL is strictly greater and at most 604,800 seconds. Both deadlines are fixed when the conversation is created; appending or replaying does not extend them. Expired content cannot be read, appended or replayed (410). Maintenance clears both ciphertext columns after content expiry while retaining opaque receipts; after replay expiry it deletes the conversation and cascades turns/outbox. A reused key after deletion is a new request: deduplication is bounded by documented retention.

`pnpm ideeo:migrate` consumes `IDEEO_MIGRATION_DATABASE_URL` for the generated `fixture_admin`; `pnpm ideeo:purge` consumes `IDEEO_MAINTENANCE_DATABASE_URL` for `ideeo_maintenance`. Both accept only disposable loopback database names and report generic errors. Purge returns counts only. The runtime lacks maintenance credentials. A scheduler is not included; the fixture invokes purge explicitly. SQL NULL/deletion does not prove secure erasure from PostgreSQL WAL, disk, replicas or backups. Production retention policy, scheduling, key custody/erasure, backup recovery and disposal evidence remain separate gates.

## Evidence and remaining work

The [isolated storage recipe](../../verification/ideeo.md#encrypted-conversation-storage) runs the actual product entry with real PostgreSQL and generated credentials, plus the actual PayMe API with synthetic resources. The [verification record](../development/VERIFICATION.md#encrypted-conversation-storage--19-november-2026) records exact results and failures. These are developer implementation/integration checks. Independent review, different-human acceptance, actual SDK/device/Meta adoption and production approval remain pending. The next implementation increment is controlled use of the existing OpenMaus loop, followed by UI/reload integration.
