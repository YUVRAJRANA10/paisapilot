# PaisaPilot Architecture Decisions

## Confirmed

### ADR-001: Store money as integer paise

All persisted and API amounts are positive integer paise. This matches the
existing frontend representation and prevents binary floating-point rounding.
Formatting occurs only at the UI boundary.

### ADR-002: Use UTC instants with user-local month boundaries

Transactions are stored as UTC dates. The user's IANA timezone determines the
start and end instants for a month or date range. The server, not the browser,
owns this conversion for reports.

### ADR-003: Use secure HttpOnly cookie authentication

The production API will use a short-lived JWT or opaque session in a Secure,
HttpOnly cookie. JavaScript will not read authentication tokens. Refresh,
logout, revocation, and CSRF behavior belong to the server.

### ADR-004: Restrict CORS and send credentials explicitly

The API allows only the configured frontend origin and sets credentials
support. The Axios adapter uses `withCredentials: true`; wildcard origins are
not allowed. State-changing cookie requests require CSRF protection.

### ADR-005: Hash passwords with Argon2id

Argon2id is the preferred password hash. Password hashes are never serialized
to API responses or logs.

### ADR-006: Model budgets per user, category, and month

Monthly budgets are separate records with a unique
`(userId, categoryId, month)` key. Usage is calculated from transactions,
avoiding stale denormalized totals and preserving history.

### ADR-007: Support system and user categories

System categories provide a useful default experience; user categories support
personalization. Referenced categories are archived rather than deleted.

### ADR-008: Use cursor-compatible page/limit contracts initially

The first API contract uses `page` and `limit` because it matches the current
frontend adapter. The repository must cap `limit`. A cursor can be introduced
later without changing ownership or filtering rules.

### ADR-009: Use stable response envelopes

Resource responses use named envelopes and list responses include explicit
pagination. Errors include a machine-readable code and request ID.

### ADR-010: Separate demo and production data adapters

The demo adapter remains deterministic and network-free. A service factory
selects it only when explicitly configured. Production mode cannot silently
fall back to demo data after an API error.

### ADR-011: Make recurring processing idempotent

Each generated occurrence has a deterministic key and a unique constraint.
Retries therefore cannot create duplicate transactions.

### ADR-012: Start exports with CSV

CSV is the first export format because it is deterministic, streamable, and
easy to verify. PDF is deferred until the report layout and rendering runtime
are approved.

### ADR-013: Keep email behind a provider boundary

Email alerts are opt-in and disabled without provider configuration. The
application service creates a notification intent; a provider adapter handles
delivery and retry policy.

## Open decisions

- Whether production sessions should use stateless JWT cookies or a server-side
  session store with rotating identifiers.
- Which deployment host will run the protected cron job.
- Which email provider and sender domain will be approved.
- Whether PDF export is required for the first release or remains CSV-only.
- Whether budget alerts are a required baseline feature or a post-baseline
  enhancement, because the plan labels some alert behavior as stretch scope.
- Whether to retain a refresh endpoint at all when using a server-side session
  cookie.
- Exact rate-limit thresholds and retention policy for audit/security logs.
