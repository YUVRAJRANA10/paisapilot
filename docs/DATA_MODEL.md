# PaisaPilot Data Model

## Conventions

- MongoDB uses ObjectId identifiers.
- Monetary values are integer paise: `₹850.75` is `85075`.
- API and database monetary fields are JSON/MongoDB integers, never binary
  floating-point currency values.
- Transaction instants are stored as UTC BSON dates.
- A user's IANA timezone (for example, `Asia/Kolkata`) defines month and
  date-range boundaries. The server converts local boundaries to UTC before
  querying.
- All documents include `createdAt` and `updatedAt` timestamps.
- Every user-owned document contains `userId`; repositories always filter on it.

## User

```text
User {
  _id: ObjectId
  name: string, required, 2-50 characters
  email: string, required, normalized lowercase, unique
  passwordHash: string, required, never returned
  currency: string, required, ISO 4217, default INR
  monthlyIncomePaise: integer, optional, >= 0
  timezone: string, required, valid IANA timezone
  createdAt: Date
  updatedAt: Date
}
```

Indexes: unique normalized email. Query pattern: authentication by email and
current-user lookup by `_id`.

## Transaction

```text
Transaction {
  _id: ObjectId
  userId: ObjectId, required, ref User
  type: "income" | "expense", required
  amountPaise: integer, required, > 0
  categoryId: ObjectId, required, ref Category
  date: Date, required
  paymentMode: string, required, bounded enum/string
  note: string, optional, max 500
  isRecurring: boolean, required, default false
  recurrenceId: ObjectId, optional, ref RecurringTransaction
  occurrenceKey: string, optional
  status: "settled" | "pending" | "cancelled", default settled
  createdAt: Date
  updatedAt: Date
}
```

Indexes: `{ userId: 1, date: -1 }`, `{ userId: 1, categoryId: 1, date: -1 }`,
and unique `{ userId: 1, occurrenceKey: 1 }` when `occurrenceKey` exists.
Queries always include `userId` and date bounds. A category must belong to the
same user or be an approved system category.

## Category

```text
Category {
  _id: ObjectId
  userId: ObjectId, required for custom categories
  systemKey: string, optional for predefined categories
  name: string, required, 1-50 characters
  icon: string, optional
  color: string, optional #RRGGBB
  archivedAt: Date, optional
  createdAt: Date
  updatedAt: Date
}
```

The first release supports predefined system categories and user-created
categories. Categories are archived rather than deleted when transactions
reference them. Unique names are enforced per user among active categories.

## Budget

```text
Budget {
  _id: ObjectId
  userId: ObjectId, required, ref User
  categoryId: ObjectId, required, ref Category
  month: string, required, YYYY-MM in user's timezone
  limitPaise: integer, required, > 0
  createdAt: Date
  updatedAt: Date
}
```

Unique index: `{ userId: 1, categoryId: 1, month: 1 }`. Actual usage is
derived from transactions for the same user, category, and month; it is not a
stored mutable total. This preserves historical months and prevents stale
budget usage after edits or deletes.

## User preferences

Preferences are embedded in `User` initially to keep ownership simple:

```text
preferences: {
  currency: string
  timezone: string
  weekStartsOn: integer, optional
  defaultReportPeriod: "current_month" | "last_30_days", optional
}
```

If notification preferences grow independently, they can be extracted to a
user-owned `NotificationPreference` document without changing transaction
ownership.

## Recurring transaction configuration

```text
RecurringTransaction {
  _id: ObjectId
  userId: ObjectId, required
  type: "income" | "expense", required
  amountPaise: integer, required, > 0
  categoryId: ObjectId, required
  paymentMode: string, required
  note: string, optional
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  interval: integer, required, >= 1
  startDate: Date, required
  endDate: Date, optional
  nextRunAt: Date, required
  status: "active" | "paused" | "ended"
  createdAt: Date
  updatedAt: Date
}
```

The job computes an occurrence key from recurrence ID and scheduled local
date, inserts the transaction once, and advances `nextRunAt`. A unique index
on the occurrence key makes retries safe.

## Notification preferences

```text
NotificationPreference {
  _id: ObjectId
  userId: ObjectId, unique, ref User
  budgetAlertEnabled: boolean, default false
  alertThresholdPercent: integer, default 80, 1-100
  email: string, optional
  createdAt: Date
  updatedAt: Date
}
```

Email delivery is opt-in and requires a configured provider. No notification
is sent merely because a preference document exists.

## Ownership and deletion rules

The authenticated user ID comes from the session, never from a body field.
Every repository method accepts that user ID explicitly. Updates use
allow-listed fields. Transaction deletion is a hard delete only for the first
release; referenced categories and recurring configurations are archived or
paused to preserve report meaning.
