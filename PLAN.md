# PaisaPilot — Product & Engineering Plan

> **Tagline:** Apne paison ke pilot khud baniye. ✈️
>
> **Current status:** Frontend implementation in progress — Milestone 1: Working Dashboard

This file is the project's persistent source of truth for the team and coding assistants. Read it before proposing or changing the architecture. Update it only when the team agrees to a decision. Do not treat ideas marked *proposed*, *open*, or *future* as confirmed requirements.

---

## 1. Project at a glance

**Working product name:** PaisaPilot  
**Project brief:** Project 04 — Personal Finance Tracker with Budgets & Reports  
**Course context:** Advanced Web Design Frameworks & Development (22CS402)  
**Product category:** Personal finance management  
**Initial build:** A secure web application for recording income and expenses, managing category budgets, and understanding finances through accurate reports.

### Product direction

PaisaPilot should feel like a useful product that someone could genuinely use—not a tutorial clone. Its initial version must faithfully satisfy the assigned college brief. Once that core works and is tested, the team can add carefully selected differentiators and more advanced backend capabilities.

The detailed differentiation and the exact user journey are **not finalized yet**. Do not invent or build extra features just because they sound impressive. First present ideas, explain the user problem and technical cost, and get team approval.

### Initial product hypothesis (not locked)

Help an individual understand where their money comes from, where it goes, how their spending compares with their budgets, and what they should pay attention to next.

The initial target audience, onboarding flow, visual identity beyond the working name/tagline, and the product's distinctive problem-solving flow still need team discussion.

### Product principles

1. **Correctness before decoration:** financial totals, date boundaries, ownership checks, and recurring jobs must be reliable.
2. **Private by design:** each user can access only their own financial data.
3. **Useful, not feature-heavy:** features must solve a clear user problem.
4. **Server-side financial reporting:** MongoDB aggregation pipelines are the source of summary/report calculations as required by the assignment.
5. **Transparent automation:** users should understand when a recurring transaction or notification will happen and should be able to review/manage its configuration.
6. **Build iteratively:** small reviewed changes, meaningful Git commits, and tested milestones.
7. **No fake integrations:** never claim to connect to a bank or external account unless a legitimate integration is implemented, tested, and clearly consented to by the user.

---

## 2. Assignment requirements — baseline we must preserve

The supplied `Project 04 - Personal Finance Tracker with Budgets & Reports.docx` is the original authority for the course requirements. The checklist below transcribes its main requirements into implementation work.

### Core features

- [ ] User accounts and authenticated access.
- [ ] Create, view, update, and delete income and expense transactions.
- [ ] Transaction fields include type, amount, category, date, payment mode, and optional notes; support recurrence where appropriate.
- [ ] User-owned categories, including a name and optional icon/colour.
- [ ] Dashboard summary: balance, monthly income, monthly expense, savings rate, and a trend/sparkline.
- [ ] Category-wise spending visualization (donut chart).
- [ ] Month-over-month income/expense visualization (bar chart).
- [ ] Monthly budgets per category with over-budget warnings and email alerts.
- [ ] Recurring transactions created automatically by a scheduled job (node-cron).
- [ ] Date-range, category, and type filters with a paginated transaction table.
- [ ] Monthly report export to CSV or PDF.

### Technical constraints (non-negotiable)

- [ ] All summary numbers must come from MongoDB aggregation pipelines (no client-side totalling of full datasets).
- [ ] Decimal/currency handling without floating-point errors (store amounts as integer paise).
- [ ] Compound index: `{ userId, date }` for transaction queries.
- [ ] Time-zone aware month boundaries (TZ env var on server).
- [ ] Scheduled jobs must run on live host (Render Cron, Railway Cron, or cron-job.org).
- [ ] Cron endpoint protected with secret header.

### Data models

- [ ] `User { name, email, passwordHash, currency, monthlyIncome, timezone }`
- [ ] `Transaction { userId, type, amount, categoryId, date, note, isRecurring, recurrence }`
- [ ] `Category { userId, name, icon, color, budgetLimit }`

### API endpoints (to be implemented in backend phase)

- [ ] `GET/POST/PUT/DELETE /api/transactions?from&to&type&category&page`
- [ ] `GET /api/reports/summary?month=` (totals, savings rate)
- [ ] `GET /api/reports/by-category?from&to=`
- [ ] `GET /api/reports/monthly-trend?year=`
- [ ] `GET/PUT /api/budgets/:categoryId`
- [ ] `GET /api/reports/export` (CSV/PDF)

### Stretch goals (not in first release)

- [ ] Bank statement import (CSV/PDF) with automatic category prediction.
- [ ] Redis caching for report endpoints with invalidation on new transactions.
- [ ] PDF report generator with Puppeteer or pdfkit emailed monthly.
- [ ] Goal-based savings tracking with projections.thly budget limits for categories.
- [ ] Overspending detection/warnings and email alerts.
- [ ] Scheduled recurring transactions.
- [ ] Transaction filters: date range, category, and transaction type.
- [ ] Paginated transaction table/list.
- [ ] Monthly report export to CSV or PDF.
- [ ] Responsive, usable frontend.
- [ ] Deployed frontend, backend, and database configuration.

### Mandatory backend / learning outcomes

- [ ] Use MongoDB aggregation pipelines for all dashboard/report summary numbers. Do not fetch the complete transaction dataset into Node.js or the frontend to total it.
- [ ] Demonstrate aggregation operators from the brief: `$match`, `$group`, `$sum`, `$sort`, `$project`, and `$facet` where each is appropriate.
- [ ] Handle month boundaries and time zones consistently.
- [ ] Use scheduled work for recurring transactions and budget alerts.
- [ ] Design predictable, chart-ready API response contracts.
- [ ] Choose a safe monetary representation; do not rely on ordinary JavaScript floating-point arithmetic for money.
- [ ] Add a compound index supporting user-specific date-range queries, based on the final schema and query patterns (the brief suggests `{ userId, date }`).
- [ ] Implement CSV/report export.
- [ ] Verify that scheduled jobs really run in the deployed environment; retain deployment logs/evidence for the demonstration/report.
- [ ] Test aggregation results for a month/time-zone boundary.

### Stretch goals from the assignment (not automatically part of the first release)

1. Bank statement import from CSV/PDF with automatic category prediction.
2. Redis caching for report endpoints, with correct invalidation when transactions change.
3. Monthly PDF generation (for example, with Puppeteer or pdfkit) and email delivery.
4. Goal-based savings tracking with projections.

We will prioritize the required features first. Add stretch goals only after estimating them, agreeing on scope, and updating the task plan.

---

## 3. Proposed technology baseline

The assignment recommends this stack. Treat the named technologies as the default unless the team records a reasoned decision to change one.

### Frontend

- React 18 with Vite
- Tailwind CSS
- Recharts for charts
- Axios for API calls
- date-fns for date utilities
- Redux Toolkit **or** Context for state management (choose based on the approved architecture; do not install both by default)

### Backend

- Node.js
- Express
- Mongoose
- MongoDB Atlas
- JWT-based authentication
- node-cron or a production-appropriate scheduled-job arrangement
- Nodemailer for email notifications
- json2csv (or a reviewed equivalent) for CSV exports
- A PDF solution to be selected when the export/report design is agreed

### Deployment direction

The assignment suggests Vercel for the frontend, Render for the backend, and MongoDB Atlas for the database. Scheduled work may need a hosting-provider cron job or an external scheduler calling a protected endpoint because some application instances sleep. Confirm current platform constraints when deployment begins; do not assume a free instance runs continuously.

### Decisions still required before scaffolding

Record the team's choices before generating the application structure:

- [ ] JavaScript versus TypeScript.
- [ ] Frontend state-management approach.
- [ ] Authentication/session storage and cookie/CORS strategy.
- [ ] Validation library and API error-response format.
- [ ] Money representation (for example integer paise versus MongoDB Decimal128), including conversion at API boundaries.
- [ ] Transaction date semantics and user reporting time zone.
- [ ] Budget model: budget as a category field versus a dedicated monthly Budget model. The schema must support monthly budgets clearly.
- [ ] Recurrence model and duplicate-prevention strategy.
- [ ] PDF generation approach.
- [ ] Initial deployment provider and scheduled-job approach.

Do not silently settle important decisions. Present a recommendation with trade-offs and wait for team approval where it changes the architecture or adds significant complexity.

---

## 4. Initial architecture direction

**Proposed repository shape — not to be generated until approved:**

```text
paisapilot/
├── client/                 # React + Vite frontend
├── server/                 # Express API and backend services
├── docs/
│   ├── ARCHITECTURE.md     # Approved architecture and diagrams
│   ├── API_CONTRACT.md     # Endpoint contracts and examples
│   ├── DATA_MODEL.md       # Collections, fields, indexes, invariants
│   ├── DECISIONS.md        # Accepted architectural/product decisions
│   └── TEST_PLAN.md        # Test scenarios and evidence
├── PLAN.md                 # This long-lived project source of truth
├── TASKS.md                # Current milestones and task status
├── README.md               # Setup, scripts, environment variables, run steps
├── .gitignore
└── .env.example            # Names/placeholders only; never real secrets
```

This is a suggested monorepo layout for one team working on frontend and backend together. The team may adjust it before scaffolding if there is a clear reason.

### Main backend responsibilities

- Authentication and user authorization.
- Transaction CRUD, filtering, sorting, and pagination.
- Category and monthly-budget management.
- MongoDB aggregation pipelines for summaries and charts.
- Recurring transaction scheduling and idempotency.
- Budget threshold detection and email notifications.
- CSV/PDF report generation.
- Request validation, error handling, logging, and security controls.

### Initial data entities to consider

The assignment names these models:

- **User:** `name`, `email`, `passwordHash`, `currency`, `monthlyIncome`.
- **Transaction:** `userId`, `type` (`income`/`expense`), `amount`, `categoryId`, `date`, `note`, `isRecurring`, `recurrence`; an index involving `userId` and `date` is suggested.
- **Category:** `userId`, `name`, `icon`, `color`, `budgetLimit`.

These are starter models, not a final schema. In particular, monthly budgets may need a separate model, and recurring rules may need a dedicated entity linked to generated transactions. Decide this before implementing APIs. Do not add fields or models without explaining their purpose.

### Security and data-isolation rules

- Every private API operation must derive the acting user from validated authentication, not trust a client-supplied `userId`.
- Every transaction/category/budget query and mutation must enforce ownership on the server.
- Hash passwords; never store plain-text passwords.
- Never commit `.env` files, tokens, SMTP credentials, database URIs, or other secrets.
- Provide `.env.example` with variable names and dummy placeholders only.
- Validate and constrain all client input, including IDs, dates, category ownership, amount, filters, and pagination.
- Use safe error responses; do not leak stack traces, secrets, or private data to clients.
- Configure CORS, security headers, and sensible request limits deliberately.
- Do not implement bank credential collection, OTP collection, scraping, or unofficial account access. Direct bank connectivity is out of initial scope unless the team later researches and approves a legitimate, consent-based provider/integration.

### Data correctness rules

- Decide one explicit monetary storage and API-boundary strategy; avoid floating-point money arithmetic.
- Define whether transaction `date` represents a date-only value or a timestamp. Apply that definition consistently.
- Define how a user's time zone determines monthly report boundaries. Do not assume the server's local time zone is the user's time zone.
- Use aggregation pipelines for reported totals and chart datasets.
- Use indexes aligned with actual filters and sort order; verify relevant queries rather than adding arbitrary indexes.
- Scheduled recurrence processing must be idempotent: retries or repeated scheduler calls must not create duplicate transactions for the same recurring occurrence.
- A protected job endpoint must not be publicly triggerable without a secret/authorization mechanism.
- Do not add Redis or caching until there is a clear correctness/invalidation plan and a measured need or approved learning objective.

---

## 5. API contract starting point

The assignment explicitly lists the following routes. Exact query parameters, payloads, response schemas, and error formats still need to be specified in `docs/API_CONTRACT.md` before implementation.

| Method | Route | Responsibility |
|---|---|---|
| GET | `/api/transactions?from=&to=&type=&category=&page=` | Filtered, paginated transaction list |
| POST | `/api/transactions` | Create a transaction |
| PUT | `/api/transactions/:id` | Update a transaction |
| DELETE | `/api/transactions/:id` | Delete a transaction |
| GET | `/api/reports/summary?month=` | Aggregated monthly totals and savings rate |
| GET | `/api/reports/by-category?from=&to=` | Aggregated category report |
| GET | `/api/reports/monthly-trend?year=` | Aggregated monthly trend |
| GET | `/api/budgets` | Retrieve budgets |
| PUT | `/api/budgets/:categoryId` | Update a category budget (confirm whether the route should evolve to identify a monthly budget explicitly) |
| GET | `/api/reports/export` | Export report data |

Likely additional routes (for example registration/login/logout, categories, recurrence configuration, notification preferences, and health checks) must be proposed and documented rather than silently invented.

### API contract expectations

For each endpoint, document:

- Purpose and authentication requirement.
- Query parameters, path parameters, and request body.
- Validation and authorization rules.
- Success status and response JSON shape.
- Error statuses and a predictable error structure.
- Pagination convention and date/time-zone semantics where applicable.
- Whether the response is aggregated by MongoDB or is a raw record list.

---

## 6. Product differentiation — intentionally open

Our goal is to make PaisaPilot useful and distinctive without drifting away from the assigned personal-finance problem.

Before choosing differentiating features, identify:

1. A specific user and real financial-management problem.
2. The current frustrating workflow and its limitation.
3. How PaisaPilot will improve that workflow.
4. Which data it needs and how it protects that data.
5. The measurable behavior/result that would demonstrate usefulness.
6. The implementation cost and effect on the core assignment.

Potential directions to evaluate later (ideas only, not approved features):

- Better onboarding and a quick path from first transaction to a useful monthly picture.
- Clear explanations of budget status and upcoming commitments.
- CSV statement import with preview, validation, and duplicate detection.
- Suggested transaction categories that users can review and correct.
- Goal-based savings tracking and projections.
- Scheduled monthly summaries and user-configurable alerts.
- Cash-flow projections based on recorded history and known recurring transactions.
- Additional account integrations only through legitimate services with explicit consent and appropriate security.

Do not call the product “AI-powered” or claim predictions/recommendations until that capability is genuinely implemented and tested. No external bank integration is part of the initial scope.

---

## 7. Development phases and exit criteria

Statuses begin as **NOT STARTED**. Update `TASKS.md` and this file as real work is completed; never mark work complete just because code was generated.

### Phase 0 — Repository and project agreement

- [ ] Create a GitHub repository and connect the local project folder.
- [ ] Add this `PLAN.md` and make the first meaningful commit.
- [ ] Agree on team members, responsibilities, and branch/PR conventions.
- [ ] Review this plan together; resolve initial scope and technical decisions.

**Exit criteria:** The team agrees on the product scope, major decisions, and development workflow. No application code is required yet.

### Phase 1 — Product flow and UI foundation

- [ ] Choose the initial target user and primary problem.
- [ ] Map the essential user journeys (account setup, first transaction, budget setup, dashboard, transaction filtering, report/export).
- [ ] Sketch low-fidelity wireframes before polishing visual design.
- [ ] Agree on navigation, main screens, loading/empty/error states, accessibility, and responsive behavior.
- [ ] Document which elements are required by the assignment and which are product-design choices.

**Exit criteria:** Approved user flows and basic screen/wireframe plan. Do not treat mock data as a completed backend.

### Phase 2 — Architecture and contracts

- [ ] Approve the repository structure and frontend/backend language choices.
- [ ] Approve auth/session approach, validation, errors, money representation, dates/time zones, and schemas.
- [ ] Define database models, ownership rules, indexes, and recurring-job idempotency.
- [ ] Define API request/response contracts and aggregation responsibilities.
- [ ] Define tests for financial correctness and user isolation.
- [ ] Update `docs/ARCHITECTURE.md`, `docs/API_CONTRACT.md`, `docs/DATA_MODEL.md`, `docs/DECISIONS.md`, and `docs/TEST_PLAN.md` as needed.

**Exit criteria:** Team-approved contracts and architecture exist before large-scale code generation.

### Phase 3 — Project scaffold and developer experience

- [ ] Create the frontend and backend structure.
- [ ] Add scripts, formatting/linting if agreed, `.gitignore`, and `.env.example`.
- [ ] Confirm the client and API can run locally.
- [ ] Add a health-check endpoint and basic error handling.
- [ ] Document exact setup/run commands in `README.md`.

**Exit criteria:** Every teammate can follow the README and run the skeleton locally.

### Phase 4 — Core backend, in safe increments

Suggested order (team may adjust):

1. Database connection and configuration validation.
2. Authentication and authorization tests.
3. Categories and transaction CRUD with validation and owner scoping.
4. Filtering, sorting, pagination, and indexes.
5. Money/date handling tests.
6. Aggregated summary endpoint.
7. Category and monthly-trend aggregation endpoints.
8. Monthly budgets and over-budget logic.
9. Recurring schedules and duplicate-safe job execution.
10. Email notifications.
11. CSV and PDF exports.

**Exit criteria:** Each endpoint is documented and tested; financial summaries come from MongoDB aggregation; cross-user access tests pass.

### Phase 5 — Frontend integration

- [ ] Connect real API data to the approved screens.
- [ ] Add usable forms, client validation, loading/empty/error states, and accessible feedback.
- [ ] Render charts only from API aggregation responses.
- [ ] Add filtering, pagination, budgets, report/export flows, and responsive layouts.
- [ ] Avoid calculating full-dataset financial summaries in the browser.

**Exit criteria:** Core user journeys work end-to-end with persisted data, not only hard-coded mock data.

### Phase 6 — Quality, deployment, and demonstration

- [ ] Test key flows, validation failures, ownership boundaries, and date/month edge cases.
- [ ] Verify correct monetary totals with known test data.
- [ ] Verify recurring job idempotency and capture production execution logs.
- [ ] Deploy using chosen providers and configure secrets through hosting settings.
- [ ] Separate development and production database configuration; consider production backups.
- [ ] Smoke-test live endpoints and report/export flows.
- [ ] Prepare a demo checklist and preserve genuine screenshots/log evidence for the report.

**Exit criteria:** A team member other than the original implementer can deploy/run the application using documented steps, and core functionality passes the agreed tests.

### Phase 7 — Approved differentiators / stretch goals

- [ ] Rank stretch goals by user value, feasibility, risk, and resume value.
- [ ] Select one or two after the core release is stable.
- [ ] Define acceptance criteria and tests before implementation.
- [ ] Update this plan and the task list before changing scope.

**Exit criteria:** Every extra feature has a defined user problem, acceptance criteria, tests, and documentation.

---

## 8. Team and Git workflow

The project is a team effort. Git history should show real, incremental collaboration and be understandable to a reviewer.

- Keep `main` in a working state as much as practical.
- Use short-lived feature branches for substantial changes, e.g. `feat/transaction-api` or `fix/month-boundary-report`.
- Use focused commits that describe actual changes, e.g. `docs: add PaisaPilot project plan` or `feat: add transaction validation`.
- Commit in logical increments; do not wait until the entire project is finished.
- Review teammates' changes and merge through pull requests where practical.
- Do not fabricate work, backdate commits, or split one completed change into misleading commits merely to create activity.
- Never commit `.env`, database URIs, API keys, JWT secrets, SMTP credentials, access tokens, personal financial data, or real user records.
- Put setup instructions and team-specific ownership in `README.md`/`TASKS.md` once agreed.

---

## 9. Coding-assistant protocol (Cline and other AI tools)

This section is an operating contract for coding agents. The plan is more authoritative than assumptions inferred from previous chats.

1. **Read first:** At the start of a task, read `PLAN.md`, `TASKS.md` if present, `README.md` if present, and the relevant docs/code. Summarize the relevant requirements before substantial work.
2. **Stay in scope:** Implement only the explicitly approved task. Do not add unrelated dependencies, features, refactors, or architecture changes without explaining why and obtaining approval.
3. **Plan before large edits:** For a multi-file feature, first propose the files to change, sequence, risks, and tests. Wait for approval when it changes scope or an unresolved architecture decision.
4. **Small increments:** Prefer reviewable changes over generating the entire application in one response.
5. **Don't invent completion:** Never claim a test, build, deployment, API, or feature works unless it was actually run/verified. Report commands run and their results honestly.
6. **Test the critical paths:** Add/run relevant tests for aggregation totals, ownership, date boundaries, recurrence duplicates, and validation when implementing those areas.
7. **Protect the workspace:** Before edits, inspect current files and `git status`. Never overwrite user work or run destructive commands without explicit approval. Do not reset/clean/delete the repository or force-push unless the user explicitly requests it.
8. **No secrets:** Never ask the user to paste private keys or credentials into source files or chat. Use environment variables and `.env.example` placeholders.
9. **Keep docs synchronized:** When an approved decision changes, update the relevant documentation and explain what changed. Record durable architectural decisions in `docs/DECISIONS.md` once that file exists.
10. **End each task with a handoff:** State files changed, behavior implemented, tests actually run and their outcomes, remaining risks, and the recommended next small task.
11. **Ask about ambiguity rather than silently inventing:** If a missing decision blocks work, present a recommended option and trade-offs. Do not proceed with a major irreversible choice on a guess.
12. **This file is not permission to build everything now:** During the current planning stage, analyze and propose only. Do not scaffold or generate application code until the team explicitly approves the architecture and next task.

---

## 10. Current state and immediate next actions

**Current state:** Name and tagline selected; project requirements reviewed; repository and implementation not yet set up.

**Selected brand:** PaisaPilot  
**Selected tagline:** Apne paison ke pilot khud baniye.

### Immediate sequence

1. Create the GitHub repository and connect the local folder.
2. Add this file as `PLAN.md` and commit it.
3. Open the folder in VS Code and confirm the correct repository is open.
4. Ask Cline to read and analyze this plan only; no application code yet.
5. Review its summary and architectural questions with the team.
6. Decide the initial product flow and UI direction.
7. Approve the architecture before scaffolding.

**Do not start with random component generation. The plan, user flow, API contracts, and data correctness rules should guide the implementation.**
