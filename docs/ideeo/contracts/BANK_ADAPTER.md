> **Imported context ? Ideeo-IA-general ? 644f0a1.** Product requirements and confirmed boundaries inform IdeeoOrchestrator. Implementation, test results, deployment instructions and scoped authorizations describe the source candidate unless explicitly adopted here. Proposed decisions remain proposed. See the [applicability and source guide](../README.md).

# Bank port for the first balance slice

Multi-tenant backend selection is required engine behavior. [The minimum tenant contract](TENANT_BACKENDS.md) defines the actual ports, explicit registry/configuration and optional HTTP connector; bank-specific adapters translate each bank's existing API. The synthetic implementation below is a development adapter, not the platform's banking integration. Exact money and provenance apply to both synthetic and bank-backed results.

The port belongs to this shared engine. A tenant supplies an adapter mapping it to its bank API; the bank core retains its ledger and financial execution responsibilities. The existing `legacy-ideeo-IA` repository's `whatsbank/whatsbank/docs/reference/adapter-contract.md` informed this boundary: its balance port takes a bank user ID and returns numeric amount/currency. The new profile makes authorized account selection, exact decimals, and provenance explicit; it is not a claim of drop-in wire compatibility with the legacy TypeScript type.

For provisioned native clients, [HOST_BANKING.md](HOST_BANKING.md) defines the implemented engine-side navigation/input route, one-time consume and optional tenant-directory port. The engine uses current authority but does not fetch this path's bank results. Actual native screens and bank adoption remain separate.

## Responsibilities

The [2 November app/SDK decision](../decisions/010-app-host-banking-and-model-context.md) requires balance/history to be obtained and displayed once by the host's protected banking flow, outside chat/model context. The first-slice `BalanceResult` and replay contract below remain implemented development behavior for their existing profile; they do not establish that native flow. This does not remove bank adapters needed by other explicitly authorized engine/authority paths.

| Port | Contract |
| --- | --- |
| `Authority.accounts(principal)` | Current authorized account display choices for the verified membership and grant; no parent-balance disclosure to external agents |
| `Authority.authorize(principal, account_id)` | Revalidate current status, scope, grant/client/agent-account binding and membership/account ownership before the read; failure performs no bank call |
| `Bank.balance(principal, account_id)` | Return current available-to-spend money for that authorized account, with account, currency, observation time and provenance, or a typed safe failure |

The bank port receives trusted server context, not a user-supplied principal. A model may propose an account hint; deterministic code resolves it against authorized choices. The provider adapter has no reference to this bank port. A real adapter resolves bank credentials behind its secret boundary and must not forward an engine token to another audience.

## Data representation

`AccountChoice` has `account_id`, display `label`, and three-letter `currency`. References are bounded, opaque values scoped to tenant and membership; knowing one does not grant access. Display only authorized bank-provided references and masked labels where required by the tenant contract.

`BalanceResult` has `kind: balance`, `account`, `available_to_spend`, `observed_at`, and `provenance`. The initial synthetic profile uses MXN, exact decimal strings with two fractional digits, and internal decimal arithmetic. Never pass a binary float as an authoritative money value. Future currency/precision extensions require an explicit compatible money contract; this profile supplies no conversion or aggregation.

Confirm the bank field that represents available-to-spend money. A current ledger/posted balance, an agent's remaining allowance, points, and another account's balance are not interchangeable. The engine must not infer the mapping from a field named `balance` or reconstruct current money from memory.

Account choice obeys [PROJECT_CONTEXT.md](../product/PROJECT_CONTEXT.md): explicit authorized selection, then a usable saved preference, then clarification when multiple choices remain. An inaccessible saved preference triggers clarification. A single authorized account with no saved preference can be used. This does not change card funding order or grant additional resources.

## Controlled adapter and failure behavior

`SyntheticBank` reads isolated PostgreSQL fixtures. Rows are scoped by RLS, contain no real customer data, and always produce `provenance: synthetic`. Its unavailable fixture produces `bank_unavailable`; the engine supplies no invented or remembered amount. The Spanish renderer includes the account, exact money and currency and an explicit synthetic-data notice.

The workflow validates the returned schema before rendering, including a timezone-aware `observed_at`, the selected account reference, and agreement between account/money currency and the authorized account choice. A malformed or inconsistent result becomes `bank_invalid_output` with no balance disclosure. A bank timeout becomes retryable `bank_timeout`; it never becomes a successful zero balance. Zero is a valid amount when returned by the authorized bank source. Each new query reads the current source; an idempotent replay returns its original, timestamped observation rather than claiming a new read. No maximum bank-data age is selected by this synthetic profile.

The current port is read-only. It does not create accounts, change mandates, transfer funds, issue cards, or perform protected financial effects. Before adding effects, define operation IDs, idempotency, approvals, uncertain-outcome reconciliation, current atomic limit enforcement, and the bank's final execution checks under ADR-001.

For a real adapter, define bounded deadlines, errors, freshness, authentication/status outages, account-list behavior, field normalization, and provider-specific rate constraints. Run shared contract scenarios against the real sandbox as well as controlled fixtures. Synthetic conformance cannot establish bank connectivity, semantics, or production readiness.
