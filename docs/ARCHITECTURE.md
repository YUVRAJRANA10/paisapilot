# PaisaPilot Architecture

## Status

This document defines the Phase 2 target architecture. It does not mean that
the backend, MongoDB, authentication, scheduled jobs, or exports have been
implemented.

## System boundary

```text
React/Vite frontend
  -> application service interface
  -> selected data adapter
       -> demo adapter (local, deterministic, no network)
       -> Axios API adapter (real backend)
  -> Express API
       -> middleware: request ID, CORS, cookie auth, validation, errors
       -> controllers
       -> application services
       -> repositories
       -> MongoDB Atlas
```

The existing frontend remains the presentation layer. Pages should consume
application services and should not call Axios, `localStorage`, or MongoDB
directly. Demo mode and production mode must be selected deliberately through
configuration; demo records must never be sent to the backend.

## Responsibilities

### Frontend

- Render the existing dashboard, transactions, budgets, analytics, settings,
  login, and registration flows.
- Own transient UI state, filters, loading states, empty states, and display
  formatting.
- Validate user input for immediate feedback using the existing Zod schemas.
- Send domain requests through a shared service/data-adapter boundary.
- Treat server responses as authoritative for persisted data and reports.
- Store only non-sensitive UI preferences locally.

### Backend

- Authenticate users and establish a secure session cookie.
- Validate and authorize every request.
- Apply user ownership to every repository query.
- Persist transactions, categories, budgets, preferences, and recurring
  configuration in MongoDB.
- Calculate financial summaries through MongoDB aggregation pipelines.
- Generate recurring transactions, alerts, and exports in server-side jobs or
  request handlers.
- Return stable, chart-ready response contracts.

## Request flow

1. A page invokes an application service such as `getDashboardReport`.
2. The service factory selects the demo adapter or API adapter.
3. The API adapter calls the shared Axios client with `withCredentials: true`.
4. The browser sends the HttpOnly authentication cookie automatically.
5. Express assigns a request ID, applies CORS and cookie authentication, and
   validates route input.
6. The controller calls an application service; it never constructs MongoDB
   queries directly.
7. The repository scopes the query by the authenticated user ID.
8. The controller maps the result to the documented response envelope.
9. The frontend renders data or a clear loading, empty, validation, or API
   error state.

## Authentication

- Registration validates name, email, password, currency, and timezone.
- Passwords are hashed with Argon2id (bcrypt is an acceptable fallback only if
  Argon2id cannot be supported by the deployment).
- Login creates a short-lived access session represented by a Secure,
  HttpOnly, SameSite cookie.
- The cookie contains a signed JWT or an opaque session identifier; the client
  JavaScript cannot read it.
- Logout invalidates the session server-side when a session store is used and
  clears the cookie.
- `/api/auth/me` resolves the current user from the cookie.
- Protected routes reject missing, expired, malformed, or revoked credentials
  with the common `401` error shape.

The current demo adapter may continue returning a demo token internally. The
real API adapter must not persist production access or refresh tokens in
`localStorage`.

## Backend layers

```text
routes/
  URL and middleware composition only
controllers/
  HTTP parsing and response mapping
validators/
  Zod request schemas
services/
  business rules and transaction boundaries
repositories/
  Mongoose queries, indexes, and ownership filters
models/
  persistence schemas and indexes
reports/
  aggregation pipeline builders and response mappers
jobs/
  recurring processing and alert scheduling
```

Repositories receive `userId` from authenticated request context. No request
body or URL parameter may override that ownership value.

## Validation and error handling

The frontend validates for usability; the backend validates for trust. All
route params, query strings, cookies, and request bodies are validated on the
server. Unknown protected fields are rejected or stripped explicitly.

Every API error uses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "requestId": "req_123",
    "fields": {
      "amount": "Amount must be a positive integer in paise."
    }
  }
}
```

Expected classes are `400` validation, `401` authentication, `403`
authorization, `404` missing resource, `409` conflict, `429` rate limit, and
`500` unexpected server failure. Unexpected errors are logged with request ID
and stack trace only on the server; secrets and financial payloads are not
logged.

## Reporting and aggregation

The server is the single source of truth for persisted financial totals.
Report services build MongoDB pipelines using `$match`, `$group`, `$sum`,
`$sort`, `$project`, and `$facet` where appropriate. Pipelines always match
`userId` and a timezone-normalized date range before grouping.

The API returns integer paise for monetary fields. The frontend formats paise
into INR display values. It must not download the full transaction history to
recalculate a report.

## Budgets

Budgets are monthly records keyed by `userId`, `categoryId`, and `month` in the
user's configured IANA timezone. Report queries calculate actual spending for
the same month and category. Historical budget records are immutable in their
month identity even when a category name changes.

## Recurring transactions and alerts

`node-cron` may trigger a protected job endpoint or an in-process scheduler in
development. Production scheduling must use the selected host's cron facility
and retain execution logs. Each recurrence run uses a deterministic occurrence
key and a unique database constraint so retries are idempotent.

Budget alerts are generated from server-side comparisons after a report or
scheduled evaluation. Email delivery is isolated behind a notification
provider interface and is disabled unless provider configuration is present.

## Exports

The initial export is CSV because it is deterministic, testable, and does not
require a browser renderer. The export endpoint streams a file generated from a
server-side, user-scoped query. PDF remains a later implementation decision.

## Environments

- Development: Vite frontend, local Express server, local or Atlas development
  database, explicit CORS origin, verbose safe diagnostics.
- Test: isolated database or mocked repository, deterministic timezone, no
  external email delivery.
- Production: deployed frontend, HTTPS Express API, MongoDB Atlas, secure
  cookies, restricted CORS, secret manager/environment variables, scheduled
  job host, and retained health/job evidence.

## Security boundaries

- HTTPS is required in production.
- Cookies are `HttpOnly`, `Secure`, and `SameSite=Lax` or `Strict` where the
  deployment allows it.
- Explicit CORS allows only the configured frontend origin and credentials.
- Cookie-authenticated state-changing requests require CSRF protection.
- Passwords, JWT secrets, MongoDB URLs, and email credentials stay outside
  source control.
- Every resource query is scoped to the authenticated user.
- Mass assignment is prevented by allow-listed input mappings.
- Rate limiting and login attempt protection are required before production.
