# PaisaPilot Test Plan

## Test layers

- Frontend unit tests: Vitest for formatters, validation, adapter behavior,
  filters, and report presentation.
- Backend unit tests: Vitest for services, validators, timezone boundaries,
  aggregation builders, and recurrence keys.
- Backend HTTP tests: Supertest against an isolated test app/database.
- Integration tests: frontend API adapter against the backend contract.
- Deployment smoke tests: health, authentication, protected route, report,
  and cron evidence in the deployed environment.

## Authentication

1. Register a valid user and verify a cookie is set without exposing a token
   to JavaScript.
2. Reject invalid email, short password, mismatched fields, and duplicate
   email.
3. Login with valid credentials and reject invalid credentials generically.
4. Verify `/auth/me` returns the current user and never `passwordHash`.
5. Verify expired, malformed, revoked, and missing cookies return `401`.
6. Verify logout clears/invalidate the session.
7. Verify cross-origin requests are restricted and state-changing requests
   without CSRF protection fail.

## Transactions

1. Create income and expense transactions with valid integer paise.
2. Reject zero, negative, decimal, unsafe-integer, malformed, and missing
   amounts.
3. Validate category ownership, type, payment mode, date, and note length.
4. Update and delete a user's transaction.
5. Verify a second user cannot read, update, or delete it.
6. Filter by inclusive date range, category, and type.
7. Verify stable page/limit pagination, total, and totalPages.
8. Verify empty results return a valid empty list envelope.
9. Verify date values near midnight and month boundaries use the configured
   timezone.

## Budgets and reports

1. Upsert a monthly category budget and reject invalid month/limit values.
2. Calculate usage from matching expense transactions only.
3. Verify over-budget and remaining values for exact, under, and over cases.
4. Verify historical months remain unchanged after later transactions.
5. Verify summary income, expense, balance, savings rate, and count.
6. Verify zero-income savings rate has the defined safe result.
7. Verify category totals include unbudgeted categories.
8. Verify monthly trend includes all requested months and uses server
   aggregation results.
9. Verify reports cannot access another user's data.
10. Verify India timezone boundary cases around `YYYY-MM-01T00:00`.

## Recurring processing

1. Create each supported frequency and validate interval/end conditions.
2. Run the job twice for the same scheduled occurrence and verify exactly one
   transaction is created.
3. Verify paused, ended, and future configurations are skipped correctly.
4. Verify the generated transaction preserves owner, category, amount, and
   occurrence date.
5. Reject cron requests with missing or incorrect secret headers.
6. Record job success, skipped records, failures, and retry-safe behavior.

## Categories and preferences

1. Create, update, list, and archive an owned category.
2. Prevent deletion of a category from destroying transaction history.
3. Reject duplicate active names for one user.
4. Verify preferences validate currency and IANA timezone.
5. Verify preferences and categories cannot be changed across users.

## Exports and frontend integration

1. Export a bounded report as CSV and verify headers, paise values, date
   boundaries, and user scoping.
2. Verify export of an empty range remains a valid CSV.
3. Verify the Axios adapter sends credentials and maps API errors.
4. Verify demo mode never makes network calls.
5. Verify production mode does not silently fall back to demo data.
6. Verify loading, empty, validation, expired-session, and server-error UI
   states on Dashboard, Transactions, Budgets, Analytics, and Settings.

## Completion evidence

The project is not considered backend-complete until focused Vitest tests,
Supertest integration tests, aggregation boundary tests, and deployment smoke
evidence pass in CI or an equivalent repeatable command.
