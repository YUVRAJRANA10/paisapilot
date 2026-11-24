# PaisaPilot Current Project State

Last updated: 2026-11-15

This is the working current-state reference for PaisaPilot. Read it before
starting a new implementation task and update it in the same milestone change
as the code. It supplements `PLAN.md` (product requirements) and
`progress.md` (historical milestone notes).

## Status at a glance

| Phase | Scope | Status |
|---|---|---|
| Phase 1 | React/Vite frontend stabilization and demo workflows | Complete |
| Phase 2 | Architecture, data model, API contract, decisions, test plan | Complete |
| Phase 3 | Express/Mongoose backend foundation and health checks | Complete |
| Phase 4 | JWT authentication in HttpOnly cookies | Implemented; hardening remains |
| Phase 5 | Categories and transaction persistence APIs | Implemented; live DB verification remains |
| Phase 6 | Reports, budgets, aggregation, and timezone correctness | Implemented |
| Phase 7 | Authenticated frontend integration and personalized onboarding | Implemented; E2E hardening remains |
| Phase 7.1 | Real-user shell cleanup and sidebar consistency | Implemented |
| Phase 7.2 | Onboarding persistence and transaction filter correctness | Implemented |
| Phase 7.3 | Authenticated CSV report export | Implemented |
| Phase 7.4 | Dashboard salary clarity, settings preferences, and navigation safety | Implemented |
| Phase 7.5 | MongoDB aggregation ObjectId and transaction category name fix | Implemented |
| Phase 8 | Recurring jobs, alerts, exports, and deployment | Planned |

The application is not yet a complete production finance product. Registration,
cookie authentication, onboarding, categories, transactions, reports, budgets,
and preferences now use the backend. Recurring transactions, exports, security
hardening, and end-to-end release validation remain.

## Repository architecture

```text
PaisaPilot/
├── src/                 # React/Vite frontend (JavaScript/JSX)
├── backend/             # Node/Express/Mongoose backend (JavaScript)
├── docs/                # Architecture, contracts, plans, revision/state docs
├── designs/             # Stitch design references
├── PLAN.md              # Product and assignment source of truth
├── progress.md          # Historical milestone log
└── package.json         # Root frontend and convenience scripts
```

### Frontend layers

```text
React pages/components
  -> Context/hooks and UI state
  -> realAdapter
  -> cookie-based fetch API client
  -> Express routes/services
```

### Backend layers

```text
HTTP request
  -> request context/CORS/body parsing/logging
  -> route
  -> validator
  -> authentication middleware
  -> service
  -> repository/model
  -> MongoDB
```

`backend/src/app.js` creates an importable Express app. `backend/src/server.js`
loads configuration, connects to MongoDB, and starts listening. This separation
is required for Supertest-based tests.

## Implemented frontend

### Entry, routing, and shared shell

- `src/main.jsx`: mounts React with `AuthProvider` and `DemoProvider`.
- `src/App.jsx`: React Router routes for dashboard, transactions, budgets,
  analytics, settings, login, register, and onboarding.
- `src/components/layout/PageLayout.jsx`: shared shell and sidebar state.
- `Sidebar.jsx` and `TopBar.jsx`: shared navigation and header.

### Current pages and behavior

- `Dashboard.jsx`: authenticated balance, income, expenses, savings rate,
  category spending, budgets, recent transactions, and charts.
- `Transactions.jsx`: authenticated search, filters, pagination, add, edit,
  delete, and refresh.
- `Budgets.jsx`: authenticated monthly budget summary and utilization.
- `Analytics.jsx`: authenticated income/expense/savings metrics and charts.
- `Settings.jsx`: backend-backed currency and timezone preferences.
- `Login.jsx`, `Register.jsx`, and `Onboarding.jsx`: cookie-authenticated
  account creation/login followed by initial categories and budgets.

### Frontend data and validation

- `src/services/demoData.js`: seeded October 2024 INR data; money is integer
  paise.
- `src/services/demoAdapter.jsx`: asynchronous in-memory auth, transaction,
  category, budget, and report behavior.
- `src/services/api.js`: native `fetch` client with `credentials: include`,
  backend error-envelope handling, paise normalization, and date/payment-mode
  conversion.
- `src/services/realAdapter.js`: page-facing adapter for authenticated API
  operations.
- `src/components/layout/PageLayout.jsx`, `Sidebar.jsx`, and `TopBar.jsx`:
  use the authenticated user rather than demo identity data; sidebar collapse
  and expand controls use directionally correct icons and real logout.
- `src/utils/validation.js`: Zod schemas for current frontend validation.
- `src/components/forms/TransactionForm.jsx`: controlled add/edit form with
  amount/date/category/payment validation.

Production pages no longer use the demo adapter. Financial data is read and
written through authenticated MongoDB-backed APIs. The legacy demo adapter
remains available only as unused presentation/test infrastructure.

## Implemented backend

### Runtime and configuration

- `backend/src/config/env.js`: Zod validation for runtime environment.
- `backend/src/config/index.js`: loads `.env` and exports validated config.
- `backend/src/server.js`: startup and graceful SIGINT/SIGTERM shutdown.
- `backend/src/db/mongoose.js`: Mongoose connect/disconnect lifecycle.
- `backend/.env.example`: safe local configuration template.
- `backend/.env`: local ignored configuration may exist; never commit it.

Required local values include `MONGODB_URI`, `JWT_SECRET` (at least 32
characters), and `CRON_SECRET` (at least 16 characters). Production requires
`COOKIE_SECURE=true`.

### Middleware and errors

- `requestContext.js`: request ID generation and `X-Request-Id` response.
- `requestLogger.js`: safe method/URL/status/duration logging.
- `errors.js`: `AppError`, not-found handling, malformed JSON handling, and
  centralized safe error responses.
- `app.js`: restricted configured-origin CORS with credentials and a 100 KB
  JSON body limit.

### Implemented routes

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Process liveness; does not require MongoDB |
| GET | `/api/ready` | Database readiness; returns `503` unless Mongoose is connected |
| POST | `/api/auth/register` | Validate, hash, create user, set JWT cookie |
| POST | `/api/auth/login` | Verify password, set JWT cookie |
| POST | `/api/auth/logout` | Clear the JWT cookie |
| GET | `/api/auth/me` | Verify cookie and return current public user |
| GET | `/api/categories` | List active system and user categories |
| POST | `/api/categories` | Create a user category |
| PUT | `/api/categories/:id` | Update a user category |
| DELETE | `/api/categories/:id` | Archive a user category |
| GET | `/api/transactions` | List user transactions with filters and pagination |
| POST | `/api/transactions` | Create a user transaction |
| PUT | `/api/transactions/:id` | Update a user transaction |
| DELETE | `/api/transactions/:id` | Delete a user transaction |
| GET | `/api/reports/summary` | Return monthly income, expense, balance, savings rate, and count |
| GET | `/api/reports/by-category` | Return user-scoped expense totals by category |
| GET | `/api/reports/monthly-trend` | Return timezone-aware monthly income and expense totals |
| GET | `/api/budgets?month=YYYY-MM` | Return monthly budgets with calculated usage |
| PUT | `/api/budgets/:categoryId` | Upsert a user-owned monthly category budget |

### Authentication files

- `backend/src/models/User.js`: Mongoose User model; normalized unique email,
  Argon2id hash field, currency, timezone, timestamps.
- `backend/src/validators/auth.js`: strict Zod registration/login schemas.
- `backend/src/services/authService.js`: user creation, password hashing,
  login verification, public user mapping, JWT creation.
- `backend/src/middleware/auth.js`: cookie extraction, JWT verification,
  issuer/audience checks, current-user lookup.
- `backend/src/routes/auth.js`: HTTP validation, cookie setting/clearing, and
  authentication route composition.
- `backend/src/utils/cookies.js`: cookie parsing and shared options.
- `backend/src/models/Category.js`: user-owned/system category schema and
  indexes; archived categories remain available for historical references.
- `backend/src/models/Transaction.js`: user-owned transaction schema with
  integer-paise amounts and `{ userId, date }` query index.
- `backend/src/validators/finance.js`: strict category, transaction, and
  pagination/filter validation.
- `backend/src/services/categoryService.js`: user-scoped category listing,
  creation, updates, and archive-only deletion.
- `backend/src/services/transactionService.js`: user-scoped transaction CRUD,
  category ownership checks, filtering, and pagination.
- `backend/src/routes/finance.js`: authenticated category and transaction
  routes.
- `backend/src/models/Budget.js`: monthly user/category budget model with a
  unique `(userId, categoryId, month)` index.
- `backend/src/services/budgetService.js`: budget upsert/list operations with
  transaction aggregation for usage and remaining amounts.
- `backend/src/validators/budgets.js`: strict month, category ID, and paise
  limit validation.
- `backend/src/routes/budgets.js`: authenticated budget endpoints.
- `backend/src/utils/timezone.js`: timezone-aware month and year boundaries.
- `backend/src/services/reportService.js`: user-scoped MongoDB aggregation
  for summary, category, and monthly trend reports.
- `backend/src/validators/reports.js`: strict report period validation.
- `backend/src/routes/reports.js`: authenticated report endpoints.

Authentication uses a 15-minute signed JWT in an HttpOnly cookie. The browser
JavaScript cannot read it. Logout clears the cookie, but stateless JWT
revocation/rotation is still a production-hardening task.

## Endpoints not implemented yet

These are documented contracts, not working routes:

```text
GET /api/reports/export
GET/POST/PUT/DELETE /api/recurring
POST /api/internal/jobs/recurring
```

## Financial and security rules

1. Store money as integer paise, never floating-point currency amounts.
2. Store transaction instants in UTC; use the user's IANA timezone for month
   boundaries.
3. Every future finance query must scope by authenticated `userId`.
4. Never trust a request-body `userId` for ownership.
5. Reports must use MongoDB aggregation pipelines, not full client-side totals.
6. Categories referenced by transactions should be archived rather than
   destroying historical meaning.
7. Recurring jobs must use deterministic occurrence keys and unique constraints
   for idempotency.
8. Production cookie-authenticated state-changing requests need CSRF
   protection, and login needs rate limiting.
9. API failures must not silently fall back from real data to demo data.

## Commands

Run from the repository root:

```powershell
npm install                    # root/frontend dependencies
npm --prefix backend install   # backend dependencies
npm run dev                    # frontend at http://localhost:5173
npm run dev:backend            # backend; requires backend/.env and MongoDB
npm run test:backend           # Vitest/Supertest backend tests
npm run build                  # frontend production build
git diff --check               # whitespace validation
```

Backend startup sequence:

```text
backend/.env -> Zod config -> create app -> MongoDB connect -> listen :5000
```

Health checks:

```text
GET http://localhost:5000/api/health
GET http://localhost:5000/api/ready
```

## Verification state

Latest verified frontend integration milestone:

- Backend tests: 16 passed.
- Frontend production build: passed.
- `git diff --check`: passed.
- Route tests verify authentication, finance routing, and report/budget
  validation.
- Registration includes monthly income and redirects to personalized
  category/budget onboarding.
- Authenticated pages use the real API adapter; JWTs are not stored in browser
  local storage.
- Local MongoDB smoke test verified aggregation totals, category grouping,
  monthly trend output, and Asia/Kolkata month boundaries with temporary data
  cleaned up afterward.
- Local MongoDB budget smoke test verified upsert, expense usage aggregation,
  remaining amount, utilization percentage, and cleanup.
- Live Atlas connectivity: not verified.
- Frontend-to-production-API integration: local build-validated; full browser
  registration/onboarding E2E remains.

## Next implementation order

### Phase 5: categories and transactions

1. Add CSV export and recurring transaction processing.
2. Add CSRF protection and login rate limiting before production deployment.

### Phase 6: reports and budgets

1. Add tests for zero-income savings rate and budget overages.

### Phase 7: automation and exports

1. Add recurring transaction configuration and idempotent jobs.
2. Add cron secret protection and deployment job evidence.
3. Add notification preferences and optional email provider.
4. Add CSV export; decide whether PDF belongs in the first release.

### Phase 8: integration and release

1. Add frontend/backend integration and browser flow tests.
2. Add CSRF/rate-limit/JWT hardening.
3. Persist onboarding completion and make setup idempotent.
4. Deploy frontend, backend, MongoDB Atlas, and scheduled jobs.

## Milestone workflow

For every meaningful implementation milestone:

1. Inspect status and current state.
2. Make a focused change.
3. Update this document and `progress.md`.
4. Run targeted tests, build, and `git diff --check`.
5. Inspect the diff and verify no secrets are included.
6. Create one meaningful commit with your configured Git identity only; do not
   add a Copilot co-author trailer.
7. Push the commit to `origin/main` unless the user explicitly says not to.
8. Report the commit hash, verification results, and remaining work.

This workflow preserves project history and keeps this document synchronized
with the actual repository.
