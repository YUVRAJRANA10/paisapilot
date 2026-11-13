# PaisaPilot Current Project State

Last updated: 2026-11-13

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
| Phase 5 | Categories and transaction persistence APIs | Next |
| Phase 6 | Reports, budgets, aggregation, and timezone correctness | Planned |
| Phase 7 | Recurring jobs, alerts, and exports | Planned |
| Phase 8 | Frontend API adapter integration and deployment | Planned |

The application is not yet a complete production finance product. The
frontend demo is functional and the backend foundation/authentication slices
exist, but finance persistence, server-side reports, and frontend production
integration remain.

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
  -> demoAdapter today
  -> real Axios API adapter later
```

### Backend layers

```text
HTTP request
  -> request context/CORS/body parsing/logging
  -> route
  -> validator
  -> authentication middleware
  -> service
  -> repository/model (future finance slices)
  -> MongoDB
```

`backend/src/app.js` creates an importable Express app. `backend/src/server.js`
loads configuration, connects to MongoDB, and starts listening. This separation
is required for Supertest-based tests.

## Implemented frontend

### Entry, routing, and shared shell

- `src/main.jsx`: mounts React with `AuthProvider` and `DemoProvider`.
- `src/App.jsx`: React Router routes for dashboard, transactions, budgets,
  analytics, settings, login, and register.
- `src/components/layout/PageLayout.jsx`: shared shell and sidebar state.
- `Sidebar.jsx` and `TopBar.jsx`: shared navigation and header.

### Current pages and behavior

- `Dashboard.jsx`: balance, income, expenses, savings rate, category spending,
  budgets, recent transactions, and charts using demo reports.
- `Transactions.jsx`: search, type/category/date filters, add, edit, delete,
  confirmation, and refresh using the demo adapter.
- `Budgets.jsx`: budget summary and utilization using recalculated demo usage.
- `Analytics.jsx`: demo income/expense/savings metrics and charts.
- `Settings.jsx`: demo reset and persisted local preferences.
- `Login.jsx` and `Register.jsx`: currently demo-adapter-based flows.

### Frontend data and validation

- `src/services/demoData.js`: seeded October 2024 INR data; money is integer
  paise.
- `src/services/demoAdapter.jsx`: asynchronous in-memory auth, transaction,
  category, budget, and report behavior.
- `src/services/api.js`: early real API scaffold, not connected to pages and
  not yet aligned with the final cookie adapter.
- `src/utils/validation.js`: Zod schemas for current frontend validation.
- `src/components/forms/TransactionForm.jsx`: controlled add/edit form with
  amount/date/category/payment validation.

The current frontend does not persist financial data in MongoDB. Demo data is
not production user data and must never silently mix with API data.

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

Authentication uses a 15-minute signed JWT in an HttpOnly cookie. The browser
JavaScript cannot read it. Logout clears the cookie, but stateless JWT
revocation/rotation is still a production-hardening task.

## Endpoints not implemented yet

These are documented contracts, not working routes:

```text
GET/POST/PUT/DELETE /api/transactions
GET /api/reports/summary
GET /api/reports/by-category
GET /api/reports/monthly-trend
GET /api/reports/export
GET/PUT /api/budgets
GET/POST/PUT/DELETE /api/categories
GET/PATCH /api/user/preferences
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

Latest verified authentication milestone:

- Backend tests: 9 passed.
- Frontend production build: passed.
- Local MongoDB connectivity: previously verified.
- Live Atlas connectivity: not verified.
- Frontend-to-production-API integration: not implemented.

## Next implementation order

### Phase 5: categories and transactions

1. Add Category and Transaction Mongoose models and indexes.
2. Add authenticated repository/service boundaries.
3. Add category CRUD with archive safety.
4. Add transaction CRUD with ownership filtering.
5. Add pagination and date/type/category filters.
6. Add Supertest coverage for cross-user access and invalid amounts.

### Phase 6: reports and budgets

1. Add monthly Budget model.
2. Add timezone boundary utilities.
3. Add MongoDB summary/category/trend aggregation pipelines.
4. Add budget usage, remaining, and overspending responses.
5. Test paise totals, month boundaries, and zero-income savings rate.

### Phase 7: automation and exports

1. Add recurring transaction configuration and idempotent jobs.
2. Add cron secret protection and deployment job evidence.
3. Add notification preferences and optional email provider.
4. Add CSV export; decide whether PDF belongs in the first release.

### Phase 8: integration and release

1. Replace page-level demo calls with a shared service/data-adapter factory.
2. Add Axios `withCredentials` API adapter.
3. Ensure demo and real modes cannot mix.
4. Add frontend/backend integration tests.
5. Add CSRF/rate-limit/JWT hardening.
6. Deploy frontend, backend, MongoDB Atlas, and scheduled jobs.

## Milestone workflow

For every meaningful implementation milestone:

1. Inspect status and current state.
2. Make a focused change.
3. Update this document and `progress.md`.
4. Run targeted tests, build, and `git diff --check`.
5. Inspect the diff and verify no secrets are included.
6. Create one meaningful commit with the required Copilot co-author trailer.
7. Push the commit to `origin/main` unless the user explicitly says not to.
8. Report the commit hash, verification results, and remaining work.

This workflow preserves project history and keeps this document synchronized
with the actual repository.
