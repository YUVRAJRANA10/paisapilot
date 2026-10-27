# PaisaPilot Project Progress

Last reviewed: 2026-10-27

## Phase 2 architecture and contract milestone

Phase 2 documentation is complete. This milestone reviewed the current
frontend, demo adapter, API scaffold, validation schemas, product plan, and
original assignment requirements. No backend implementation or dependency
installation was performed.

### Created

- `docs/ARCHITECTURE.md`: frontend/backend boundary, adapter selection,
  service/repository layers, reporting, jobs, exports, environments, and
  security boundaries.
- `docs/DATA_MODEL.md`: user, transaction, category, monthly budget,
  preferences, recurrence, and notification models.
- `docs/API_CONTRACT.md`: authentication, transaction, report, budget,
  category, preference, recurring, health, and cron endpoint contracts.
- `docs/DECISIONS.md`: confirmed architecture decisions and unresolved
  deployment/product choices.
- `docs/TEST_PLAN.md`: Vitest, Supertest, integration, edge-case, and
  deployment validation plan.
- `.env.example`: safe placeholders for future frontend/backend configuration.

### Confirmed architectural decisions

- Money remains integer paise at the API and database boundary.
- MongoDB stores UTC instants; the user's IANA timezone defines month
  boundaries.
- Reports are server-side MongoDB aggregations and are the source of truth for
  persisted financial totals.
- Budgets are monthly `(userId, categoryId, month)` records whose usage is
  derived from transactions.
- Production authentication uses secure HttpOnly cookies, restricted CORS,
  and CSRF protection for state-changing requests.
- Demo and real API adapters remain separate; API failures must not silently
  return demo data.
- CSV is the initial export format; PDF remains open.

### Current implementation boundary

The frontend still uses `demoAdapter` in `AuthContext` and pages. The existing
Axios scaffold is not yet a production API adapter: it uses local-storage
token assumptions and is not declared as a current package dependency. This
was intentionally documented rather than changed during the architecture-only
milestone. No backend endpoint is claimed to work.

### Next milestone

Implement the backend foundation in a separate `backend/` application:
Express setup, environment validation, MongoDB connection, common errors,
secure authentication middleware, and a tested `/api/health` endpoint. Before
that work, resolve the open decisions in `docs/DECISIONS.md`, especially the
session strategy, deployment cron host, email provider, and export scope.

## Phase 1 stabilization update

Phase 1 frontend stabilization has now been completed at the implementation level. The work focused on verifying the existing UI and demo adapter rather than starting backend development.

### Phase 1 findings

- The demo transaction dataset is the source of truth for dashboard, analytics, and transaction calculations.
- October expense total is ₹15,374.
- Budgeted categories total ₹14,724 because Education contributes a valid additional ₹650 expense but has no budget record. This was a display omission, not an arithmetic error.
- The original dashboard and analytics report contract had been corrected earlier to use top-level report values.
- A recursive Recharts `BarChart` wrapper had caused maximum update depth warnings and `STATUS_STACK_OVERFLOW` browser crashes during navigation. The wrapper now aliases and renders the Recharts component correctly.
- The demo dataset intentionally represents October 2024. The add-transaction form now defaults to that same period instead of the machine's current date.

### Phase 1 changes in this pass

- Budget usage is recalculated from current demo transactions whenever budgets are loaded.
- Dashboard recent transactions are filtered to the selected report month.
- Dashboard displays all expense categories, including unbudgeted categories, so report totals are explainable.
- Transaction form now supports both add and edit modes.
- Transaction amount, category, payment mode, and date validation is enforced through the existing Zod validation module plus strict amount parsing.
- Transaction date-range filters were added alongside search, type, and category filters.
- Existing transactions can be edited or deleted with confirmation.
- Reset demo data now asks for confirmation before reloading.
- Demo-mode preference now respects the saved local setting instead of always evaluating to true.
- Currency and timezone settings are controlled and persisted in local storage. They do not perform currency conversion.

### Phase 1 files changed

- `src/services/demoAdapter.jsx`: dynamic budget usage, month filtering, category metadata on created transactions.
- `src/pages/Dashboard.jsx`: selected-month recent transactions and complete category display.
- `src/pages/Transactions.jsx`: date filters, edit/delete actions, and add/edit save flow.
- `src/components/forms/TransactionForm.jsx`: fixed demo-period default and validation/edit support.
- `src/context/DemoContext.jsx`: persisted demo-mode initialization and reset confirmation.
- `src/pages/Settings.jsx`: persisted preference controls.
- `progress.md`: this audit and verification record.

### Phase 1 verification

- `npm run build`: passed.
- `git diff --check`: passed.
- `npm run lint`: not available as a meaningful check because no ESLint configuration exists in the repository; ESLint exits before linting.
- No automated test script is defined in `package.json`.
- The local Vite server and primary routes were previously smoke-probed successfully.

### Remaining Phase 1 limitations

- Browser-level interaction tests have not been automated.
- The top-bar period buttons still represent UI state rather than a shared report-period query across every page.
- Budget creation and editing are not implemented.
- Currency selection persists a preference but intentionally does not convert INR values.
- Authentication routes and `ProtectedRoute` remain demo placeholders.
- The real Axios adapter is not connected to the pages.
- Backend persistence, MongoDB aggregation, scheduled jobs, alerts, and exports remain out of scope for Phase 1.

## Executive summary

PaisaPilot is currently a functional React/Vite frontend prototype for an Indian personal-finance tracker. The application has a coherent visual shell, seeded INR demo data, working client-side navigation, dashboard reporting, transaction search/filtering, transaction creation, budget visualization, analytics charts, and demo settings.

The project is feasible to evolve into a fully functional application. The current frontend already provides the principal screens and UI seams needed for a real backend. It is not yet a production application because authentication, persistence, user isolation, server-side reporting, scheduled recurring transactions, alerts, exports, and deployment are not implemented.

The safest next architecture is:

```text
PaisaPilot/
├── src/                 # Existing React/Vite frontend
├── public/
├── designs/
├── docs/
├── backend/             # Recommended future Node/Express/MongoDB service
├── package.json         # Frontend package manifest
└── progress.md
```

The backend should be added as a separate `backend/` application rather than mixed into the frontend source tree.

## What exists today

### Technology

- React 18 with JSX and JavaScript.
- Vite development and production build tooling.
- React Router 6.
- Tailwind CSS with a custom PaisaPilot design token configuration.
- Recharts for dashboard and analytics charts.
- Lucide React for icons.
- `date-fns` for date formatting and month utilities.
- Zod is installed for future validation work.
- Context providers for auth and demo-mode state.
- Axios API client scaffold exists, but Axios is not currently declared in `package.json` and the real backend is not connected.

### Application entry and routing

- `src/main.jsx` mounts the application with `AuthProvider` and `DemoProvider`.
- `src/App.jsx` defines routes for:
  - `/`
  - `/dashboard`
  - `/transactions`
  - `/budgets`
  - `/analytics`
  - `/settings`
  - `/login`
  - `/register`
- `PageLayout` provides the shared sidebar/top bar/content shell.
- The route tree currently renders the main application without enforcing authentication. `ProtectedRoute` is present but is still a placeholder.

### Current source structure

```text
src/
├── App.jsx
├── main.jsx
├── index.css
├── components/
│   ├── charts/
│   │   ├── BarChart.jsx
│   │   ├── DonutChart.jsx
│   │   └── Sparkline.jsx
│   ├── forms/
│   │   └── TransactionForm.jsx
│   ├── layout/
│   │   ├── PageLayout.jsx
│   │   ├── Sidebar.jsx
│   │   └── TopBar.jsx
│   └── ui/
│       ├── Badge.jsx
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── ChartWrapper.jsx
│       ├── Dropdown.jsx
│       ├── EmptyState.jsx
│       ├── ErrorAlert.jsx
│       ├── Input.jsx
│       ├── LoadingSkeleton.jsx
│       ├── Modal.jsx
│       ├── Select.jsx
│       ├── Table.jsx
│       └── Textarea.jsx
├── context/
│   ├── AuthContext.jsx
│   └── DemoContext.jsx
├── hooks/
│   └── index.js
├── pages/
│   ├── Dashboard.jsx
│   ├── Transactions.jsx
│   ├── Budgets.jsx
│   ├── Analytics.jsx
│   ├── Settings.jsx
│   └── auth/
│       ├── Login.jsx
│       └── Register.jsx
├── routes/
│   └── ProtectedRoute.jsx
├── services/
│   ├── api.js
│   ├── demoAdapter.jsx
│   ├── demoData.js
│   └── endpoints.js
├── styles/
│   └── theme.js
└── utils/
    ├── cn.js
    ├── constants.js
    ├── format.js
    └── validation.js
```

## What has been built

### Visual system and shell

- Dark cockpit-style sidebar based on the Stitch design references.
- Shared top navigation with search field, period controls, demo status, and user identity.
- Consistent light workbench background, cards, borders, typography, spacing, emerald primary color, and semantic income/expense colors.
- Lucide icons are used consistently instead of scattered emoji icons.
- Sidebar collapse state is owned by `PageLayout`.
- Demo identity is consistently shown as `Yuvraj`.
- Reusable buttons, cards, badges, tables, inputs, selects, modals, loading states, and empty states exist.

### Dashboard

- Monthly balance, income, expenses, and savings-rate cards.
- Sparkline for balance trend.
- Budget utilization cards.
- Cash-flow bar chart.
- Category-spending donut chart.
- Recent transaction table.
- Demo-mode disclosure.
- Add Transaction modal integration.
- Dashboard uses the fixed seeded demo month (`2024-10`) so the screen does not become empty as real-world time advances.

### Transactions

- Real demo transaction table.
- Search across notes, categories, payment methods, and account labels.
- Income/expense filter.
- Category filter.
- Clear filters action.
- INR amount formatting.
- Add Transaction modal with validation.
- New transactions are saved to the mutable demo adapter and refreshed in the table.

### Budgets

- Monthly budget cards based on demo data.
- Total allocated and total used summary.
- Overall utilization bar.
- Per-category utilization bars.
- Remaining amount and over-budget states.
- Semantic warning and success indicators.

### Analytics

- Income, expense, and savings-rate metric cards.
- Cash-flow trend chart.
- Expense-mix donut chart.
- Uses the same demo report contract as the dashboard.

### Settings

- Demo data reset action.
- Currency and timezone controls.
- Demo-mode toggle.
- Save feedback state.

### Demo data and service seam

- `demoAdapter` imitates asynchronous API calls.
- Demo transactions, categories, budgets, insights, and recurring records are represented in `demoData.js`.
- Money values are stored as integer paise in the demo data.
- `api.js` provides a future real HTTP adapter with matching method names.
- `endpoints.js` centralizes future endpoint paths.

This adapter boundary is the main reason a backend can be added without rewriting every page. Pages should eventually choose either the demo adapter or real API adapter through one service-selection layer rather than importing one implementation directly.

## Important bugs fixed so far

1. Dashboard initially requested the real current month while seeded records were from October 2024, producing empty results.
2. Dashboard report consumers expected a nested `summary` object that the adapter did not return.
3. Dashboard used `CardSubtitle` without importing it.
4. The custom `BarChart` component recursively rendered itself instead of the Recharts `BarChart`, causing maximum update depth errors and browser `STATUS_STACK_OVERFLOW` crashes during navigation and re-rendering.
5. Donut chart tooltip placement was corrected so the tooltip is a child of `PieChart`, not nested inside `Pie`.
6. Duplicate hamburger controls were removed from the top bar; the sidebar now owns collapse/expand behavior.
7. Invalid Tailwind `@apply` utilities were removed from the stylesheet so production builds succeed.
8. Demo identity references were normalized to `Yuvraj`.

## Current validation status

- `npm run build`: passing.
- Local Vite server smoke probe: passing with HTTP 200.
- `git diff --check`: passing.
- `npm run lint`: currently unavailable because the repository does not contain an ESLint configuration file. The script exists, but ESLint exits before linting.
- Browser extension messages such as `contentscript.js`, `MaxListenersExceededWarning`, and `ObjectMultiplex` are external browser-extension diagnostics, not application code.
- The Recharts recursion was an application-owned crash and has been fixed.

## Relationship to PLAN.md

### Progress against Phase 0 — Repository and project agreement

Partially complete:

- The project has a repository, `PLAN.md`, frontend package scripts, and a documented product direction.
- Product scope is still not fully approved as a team decision.
- Branch/PR conventions, team responsibilities, and meaningful commit history still need to be formalized.

### Progress against Phase 1 — Product flow and UI foundation

Partially complete:

- Main journeys are represented by routes and screens.
- Stitch exports were inspected and used as visual references.
- The navigation, dashboard, transaction, budget, analytics, and settings UI foundation exists.
- Responsive behavior and accessibility need a dedicated review.
- The primary target user and differentiating product problem remain open decisions.

### Progress against Phase 2 — Architecture and contracts

Partially complete:

- Frontend layers and demo service boundaries exist.
- The intended backend technology direction is documented in `PLAN.md`.
- Exact API contracts, database schemas, error format, ownership rules, timezone policy, and recurrence idempotency are not yet documented in dedicated files.
- `docs/API_CONTRACT.md`, `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, `docs/DECISIONS.md`, and `docs/TEST_PLAN.md` should be created before backend implementation.

### Progress against Phase 3 — Project scaffold and developer experience

Frontend portion is functional:

- Frontend install/build/dev scripts exist.
- Vite runs locally.
- The frontend production build passes.
- `.env.example`, formatting/lint configuration, backend scaffold, health endpoint, and full setup documentation are still missing.

### Progress against Phase 4 — Core backend

Not started:

- No MongoDB persistence.
- No production authentication.
- No server-side aggregation.
- No ownership enforcement.
- No real pagination query.
- No recurring scheduler.
- No alerts.
- No exports.

### Progress against Phase 5 — Frontend integration

Demo integration is partially complete:

- Screens and interactions work against the demo adapter.
- Real API integration has not started.
- Loading, empty, and error handling need a systematic pass once API contracts exist.

### Progress against Phase 6 — Verification and release

Not started:

- No backend integration tests.
- No financial boundary tests.
- No cross-user authorization tests.
- No end-to-end test plan or deployment evidence.

## Is a fully functional product feasible from this UI?

Yes. The current UI is a suitable foundation because:

1. The major product routes already exist.
2. Reusable UI primitives prevent backend work from being coupled to individual visual details.
3. The demo adapter already exposes method names that can map to real API methods.
4. INR/paise formatting and transaction/category/budget concepts are already represented.
5. The chart and table components already accept chart-ready and row-ready data.

However, a fully functional product requires more than connecting HTTP calls. The backend must become the authority for:

- Authentication and session/token lifecycle.
- User ownership and authorization.
- MongoDB persistence.
- Aggregated financial totals.
- Timezone-aware month boundaries.
- Recurrence execution and idempotency.
- Budget alert evaluation.
- CSV/PDF report generation.
- Validation and safe error contracts.

## Recommended backend plan

Create a separate backend application:

```text
backend/
├── package.json
├── .env.example
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── validators/
│   ├── reports/
│   ├── jobs/
│   └── utils/
└── tests/
```

Recommended backend sequence:

1. Write API, data-model, and authentication decisions.
2. Scaffold Express, configuration validation, health endpoint, and error middleware.
3. Add MongoDB/Mongoose models and indexes.
4. Implement registration, login, refresh/logout, and authenticated ownership middleware.
5. Implement categories and transaction CRUD.
6. Implement filtering, sorting, pagination, and date/timezone handling.
7. Implement MongoDB aggregation report endpoints.
8. Implement budgets and over-budget calculations.
9. Implement recurring transaction processing with idempotent occurrence keys.
10. Implement alert delivery behind explicit configuration.
11. Implement CSV first, then decide whether PDF is required for the first release.
12. Connect the frontend through a service adapter and preserve demo mode for presentations/tests.
13. Add integration, authorization, financial correctness, and end-to-end tests.
14. Deploy frontend, backend, database, and scheduled job with health/log evidence.

## Near-term frontend work before backend

1. Add a single service factory that selects `demoAdapter` or `api` from `VITE_DEMO_MODE`.
2. Make top-bar period controls change the active report period rather than only changing visual state.
3. Add a shared page header and shared loading/error/empty patterns.
4. Add transaction edit and delete flows.
5. Add budget creation/editing rather than read-only budget cards.
6. Add report export controls once the API contract is defined.
7. Implement real authentication route guards.
8. Add an ESLint configuration and fix all lint findings.
9. Add focused frontend tests for filtering, form validation, and report rendering.
10. Remove direct dynamic imports and clean up unused imports before backend integration.

## Decisions that must be made before backend coding

- MongoDB Atlas deployment target and local development strategy.
- JWT access-token and refresh-token storage strategy.
- Whether the frontend uses cookies, bearer tokens, or both.
- Canonical transaction date representation.
- User timezone policy and month-boundary implementation.
- API response envelope and error schema.
- Budget schema: category limit only or month-specific budget records.
- Recurrence model and idempotency key.
- Email provider and whether alerts are required in the first demonstration.
- CSV-only first release or CSV plus PDF.
- Whether the backend lives in this repository as `backend/` or in a separate repository.

## Definition of “fully functional”

PaisaPilot should not be called fully functional until all of these are true:

- A user can register, log in, log out, and access only their own data.
- Transactions and categories persist in MongoDB.
- Create, read, update, delete, filter, sort, and paginate behavior works through the API.
- Dashboard and analytics totals come from MongoDB aggregations.
- Money remains integer-safe at storage and API boundaries.
- Month reports respect the configured user timezone.
- Budgets calculate utilization from persisted transactions.
- Recurring transactions execute once per intended occurrence.
- Alerts and scheduled jobs are protected and observable.
- CSV/PDF exports return correct user-scoped data.
- Frontend loading, empty, validation, and API error states are usable.
- Automated tests cover financial correctness and authorization.
- Local setup and deployment steps are documented and reproducible.
