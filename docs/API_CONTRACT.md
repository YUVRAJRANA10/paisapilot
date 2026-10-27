# PaisaPilot REST API Contract

## Conventions

Base path: `/api`. JSON request and response bodies use camelCase. Dates are
ISO 8601 strings; monetary values are integer paise. Protected routes require
the secure session cookie and return `401` when it is absent or invalid.

Successful responses use resource-specific envelopes. Errors always use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "requestId": "req_123",
    "fields": { "amountPaise": "Must be positive." }
  }
}
```

List responses use `{ data, pagination }`, where pagination is
`{ page, limit, total, totalPages }`.

## Authentication

| Method | Path | Auth | Contract |
|---|---|---|---|
| POST | `/auth/register` | No | Body: `name`, `email`, `password`, `currency`, `timezone`. Returns `201 { user }` and sets cookie. |
| POST | `/auth/login` | No | Body: `email`, `password`. Returns `200 { user }` and sets cookie. |
| POST | `/auth/logout` | Yes | Clears/revokes cookie. Returns `204`. |
| GET | `/auth/me` | Yes | Returns `200 { user }` without password fields. |

Passwords are never returned. Duplicate email is `409`; invalid credentials
are a generic `401`.

## Transactions

| Method | Path | Auth | Contract |
|---|---|---|---|
| GET | `/transactions` | Yes | Query: `from`, `to`, `type`, `categoryId`, `page`, `limit`. Returns paginated transactions. |
| POST | `/transactions` | Yes | Body: `type`, `amountPaise`, `categoryId`, `date`, `paymentMode`, optional `note`, `isRecurring`, `recurrence`. Returns `201 { transaction }`. |
| PUT | `/transactions/:id` | Yes | Same allow-listed fields as create. Returns `200 { transaction }`. |
| DELETE | `/transactions/:id` | Yes | User-scoped delete. Returns `204`. |

Dates must be valid ISO values and amounts must be positive safe integers.
`categoryId` must belong to the user or a system category. Unknown fields are
rejected. Missing or foreign IDs behave as `404`, not as data disclosure.

## Reports

| Method | Path | Auth | Query | Response |
|---|---|---|---|---|
| GET | `/reports/summary` | Yes | `month=YYYY-MM` | `{ summary: { incomePaise, expensePaise, balancePaise, savingsRate, transactionCount } }` |
| GET | `/reports/by-category` | Yes | `from`, `to` | `{ categories: [{ categoryId, categoryName, totalPaise, count }] }` |
| GET | `/reports/monthly-trend` | Yes | `year=YYYY` | `{ months: [{ month, incomePaise, expensePaise, balancePaise }] }` |
| GET | `/reports/export` | Yes | `from`, `to`, `format=csv` | Streamed CSV with `Content-Disposition`; PDF is deferred. |

All report values come from user-scoped MongoDB aggregation pipelines. The
summary pipeline uses `$match` and `$facet` for totals/counts; category and
trend pipelines use `$group`, `$sum`, `$sort`, and `$project`.

## Budgets

| Method | Path | Auth | Contract |
|---|---|---|---|
| GET | `/budgets` | Yes | Query: `month=YYYY-MM`. Returns budgets with calculated `usedPaise`, `remainingPaise`, and `utilizationPercent`. |
| PUT | `/budgets/:categoryId` | Yes | Body: `month`, `limitPaise`. Upserts the user's monthly category budget. Returns `200 { budget }`. |

Budget identity is `(userId, categoryId, month)`. A missing category or invalid
month is `400/404`; a category belonging to another user is never accepted.

## Categories

| Method | Path | Auth | Contract |
|---|---|---|---|
| GET | `/categories` | Yes | Returns system and active user categories. |
| POST | `/categories` | Yes | Body: `name`, optional `icon`, `color`. Returns `201 { category }`. |
| PUT | `/categories/:id` | Yes | Updates allow-listed display fields. Returns `200 { category }`. |
| DELETE | `/categories/:id` | Yes | Archives categories referenced by transactions; returns `204`. |

## Preferences

| Method | Path | Auth | Contract |
|---|---|---|---|
| GET | `/user/preferences` | Yes | Returns currency, timezone, and report-period preferences. |
| PATCH | `/user/preferences` | Yes | Body contains allow-listed preference fields. Returns `200 { preferences }`. |

## Recurring transactions

| Method | Path | Auth | Contract |
|---|---|---|---|
| GET | `/recurring` | Yes | Returns the user's recurring configurations. |
| POST | `/recurring` | Yes | Creates a validated configuration; returns `201 { recurring }`. |
| PUT | `/recurring/:id` | Yes | Updates allow-listed configuration fields. |
| POST | `/recurring/:id/pause` | Yes | Pauses a configuration. |
| POST | `/recurring/:id/resume` | Yes | Resumes a configuration. |
| DELETE | `/recurring/:id` | Yes | Ends/removes the configuration. |

## Health and scheduled jobs

| Method | Path | Auth | Contract |
|---|---|---|---|
| GET | `/health` | No | Returns `{ status: "ok", service, version }`; does not expose secrets. |
| POST | `/internal/jobs/recurring` | Cron secret | Requires `X-Cron-Secret`; runs an idempotent recurring-transaction batch. |

The cron route is not user-authenticated. It requires a constant-time
comparison against a secret held in the environment and is additionally
restricted by deployment networking where available.

## Status and error rules

- `200`: successful read/update.
- `201`: created resource.
- `204`: successful delete/logout with no body.
- `400`: malformed or invalid request.
- `401`: missing/expired authentication.
- `403`: authenticated but forbidden operation.
- `404`: user-scoped resource not found.
- `409`: uniqueness or state conflict.
- `422`: semantically valid shape with unacceptable business value, if needed.
- `500`: unexpected server failure with a request ID.
