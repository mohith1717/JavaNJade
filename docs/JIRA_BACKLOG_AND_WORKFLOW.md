# JadeGuard Jira Backlog and Workflow Guide

Project: JadeGuard / JavaNJade

Purpose: Turn the current Spring Boot, MySQL, and React/Vite codebase into a professional Jira backlog with clear epics, stories, task fields, sprint structure, and Git workflow rules.

This guide is written for a team operating like an enterprise delivery squad: clear ownership, small slices, review discipline, and release-ready increments.

## 1. Project Scope Summary

JadeGuard is a transaction monitoring and fraud detection platform with:

- Spring Boot backend
- MySQL persistence and Flyway migrations
- React/Vite frontend
- Transaction ingestion, validation, rules, risk scoring, alerts, and reporting
- Authentication and role-based navigation
- Integration, UI, and testing work across the full stack

Current repo shape suggests the work naturally breaks into backend platform, domain flows, frontend experience, and hardening/release tasks.

## 2. Epic Structure

Use these epics in Jira.

### EPIC 1: Authentication

Objective: Secure access to the application and route users based on role.

#### Story A1: Login and session flow

- Summary: Implement login flow and authenticated session handling
- Description: Allow users to sign in, keep session state, and redirect to the correct landing page after login.
- Acceptance Criteria:
  - User can log in with valid credentials
  - Invalid credentials show a clear error message
  - Successful login persists auth state
  - User is redirected to the correct role landing page
- Priority: High
- Story Points: 5
- Labels: auth, frontend, backend
- Suggested Assignee: Frontend Engineer + Backend Engineer

#### Story A2: Protected routes and logout

- Summary: Protect application routes and support logout
- Description: Restrict authenticated pages and provide a clear logout path that clears local session state.
- Acceptance Criteria:
  - Unauthenticated users cannot access protected views
  - Logout clears auth data
  - Protected route redirects to login when needed
- Priority: High
- Story Points: 3
- Labels: auth, ui, security
- Suggested Assignee: Frontend Engineer

### EPIC 2: Transaction Management

Objective: Ingest, store, list, and inspect transactions end to end.

#### Story T1: Transaction ingestion API

- Summary: Create transaction ingestion endpoint
- Description: Accept transaction payloads, validate required fields, persist them, and return a stable response envelope.
- Acceptance Criteria:
  - API accepts valid transaction payloads
  - Invalid payloads return structured validation errors
  - Transaction is persisted successfully
  - API response includes identifier and processing status
- Priority: Highest
- Story Points: 8
- Labels: backend, transactions, api
- Suggested Assignee: Backend Engineer

#### Story T2: Transaction list and filters

- Summary: Add transaction listing with filters
- Description: Support list views and query filters for transaction operations and investigation.
- Acceptance Criteria:
  - API supports list retrieval
  - Filters work for at least date, status, and search fields
  - Pagination is consistent
- Priority: High
- Story Points: 5
- Labels: backend, transactions, reporting
- Suggested Assignee: Backend Engineer

#### Story T3: Transaction detail view

- Summary: Expose transaction detail endpoint
- Description: Return transaction details, route hops, validation outcomes, and risk context in one payload.
- Acceptance Criteria:
  - Endpoint returns all required transaction details
  - Missing transactions return a 404 envelope
  - Response is consumable by frontend detail screen
- Priority: High
- Story Points: 5
- Labels: backend, transactions, api
- Suggested Assignee: Backend Engineer

### EPIC 3: Validation Engine

Objective: Validate incoming transaction data and surface machine-readable errors.

#### Story V1: Input validation rules

- Summary: Validate transaction request payloads
- Description: Enforce mandatory fields, amount rules, currency rules, and route structure.
- Acceptance Criteria:
  - Missing required fields are rejected
  - Invalid amount and currency values are rejected
  - Route structure validation works consistently
- Priority: Highest
- Story Points: 5
- Labels: validation, backend, api
- Suggested Assignee: Backend Engineer

#### Story V2: Validation error persistence

- Summary: Persist validation errors for failed submissions
- Description: Store validation failures so investigators can review them later.
- Acceptance Criteria:
  - Validation failures are stored
  - Errors can be queried for an existing transaction
  - Error records are linked to the original transaction
- Priority: High
- Story Points: 5
- Labels: validation, persistence, backend
- Suggested Assignee: Backend Engineer

### EPIC 4: Rule Engine

Objective: Manage monitoring rules and make them editable by operators.

#### Story R1: Rule listing and retrieval

- Summary: Add monitoring rule query endpoints
- Description: Expose the active monitoring rule catalog to the UI and operational APIs.
- Acceptance Criteria:
  - Rules can be listed
  - Rule details are returned in a stable contract
  - Disabled rules are represented clearly
- Priority: High
- Story Points: 3
- Labels: rules, backend, api
- Suggested Assignee: Backend Engineer

#### Story R2: Rule update workflow

- Summary: Update rule threshold, severity, and status
- Description: Allow controlled updates to rule configuration without recreating the rule.
- Acceptance Criteria:
  - Threshold can be updated
  - Severity can be updated
  - Enabled/disabled state can be updated
  - Invalid updates return a structured error
- Priority: High
- Story Points: 5
- Labels: rules, backend, validation
- Suggested Assignee: Backend Engineer

#### Story R3: Rule configuration validation

- Summary: Enforce rule configuration constraints
- Description: Guard against duplicate codes, invalid ranges, and unsupported types.
- Acceptance Criteria:
  - Duplicate rule codes are rejected
  - Invalid configuration is rejected with a clear envelope
  - Validation messages are actionable
- Priority: High
- Story Points: 5
- Labels: rules, validation, backend
- Suggested Assignee: Backend Engineer

### EPIC 5: Risk Scoring

Objective: Produce risk scores and severity context for each transaction.

#### Story K1: Risk score calculation

- Summary: Calculate transaction risk score
- Description: Evaluate transaction attributes and route context to produce a risk score and level.
- Acceptance Criteria:
  - Risk score is computed consistently
  - Risk level maps to defined thresholds
  - Score is stored with the transaction or related record
- Priority: Highest
- Story Points: 8
- Labels: risk, backend, engine
- Suggested Assignee: Backend Engineer

#### Story K2: Risk explanation data

- Summary: Provide score breakdown for investigation
- Description: Expose why a transaction received a given score so analysts can review it.
- Acceptance Criteria:
  - Breakdown is returned in API response or related detail payload
  - Explanation is understandable to an investigator
  - Output is stable for frontend use
- Priority: High
- Story Points: 5
- Labels: risk, investigation, backend
- Suggested Assignee: Backend Engineer

### EPIC 6: Alert Generation

Objective: Generate alerts for risky or invalid transactions and track lifecycle changes.

#### Story L1: Alert creation rule

- Summary: Create alerts from risk and validation outcomes
- Description: Generate alerts when transactions cross risk thresholds or fail critical validation checks.
- Acceptance Criteria:
  - Alerts are created for matching triggers
  - Alert severity is assigned correctly
  - Alert links back to the source transaction
- Priority: Highest
- Story Points: 8
- Labels: alerts, backend, risk
- Suggested Assignee: Backend Engineer

#### Story L2: Alert status lifecycle

- Summary: Manage alert state transitions
- Description: Support acknowledge, investigate, close, and dismiss actions.
- Acceptance Criteria:
  - Each transition is validated
  - Invalid status changes are rejected
  - Audit history is updated for each action
- Priority: High
- Story Points: 5
- Labels: alerts, workflow, backend
- Suggested Assignee: Backend Engineer

### EPIC 7: Case Management

Objective: Provide investigator workflow for alert handling and follow-up.

#### Story C1: Case creation from alert

- Summary: Convert alert into a case
- Description: Allow analysts to open a case from a notable alert and track its handling.
- Acceptance Criteria:
  - Case can be created from an alert
  - Case stores references to the alert and transaction
  - Case status can be updated
- Priority: Medium
- Story Points: 5
- Labels: case-management, alerts, backend
- Suggested Assignee: Backend Engineer

#### Story C2: Case detail workflow

- Summary: View and update case details
- Description: Give analysts a place to document resolution notes and investigation progress.
- Acceptance Criteria:
  - Case detail is retrievable
  - Notes can be stored
  - Resolution state is visible
- Priority: Medium
- Story Points: 3
- Labels: case-management, ui, backend
- Suggested Assignee: Full-Stack Engineer

### EPIC 8: Dashboard and Analytics

Objective: Give operations users a visual overview of activity, alerts, and risk.

#### Story D1: KPI dashboard cards

- Summary: Add KPI cards for operational summary
- Description: Show total transactions, alert volume, high-risk items, and key status counts.
- Acceptance Criteria:
  - Metrics load from live data
  - Cards update responsively
  - Empty states are handled cleanly
- Priority: High
- Story Points: 5
- Labels: dashboard, frontend, analytics
- Suggested Assignee: Frontend Engineer

#### Story D2: Trend and distribution charts

- Summary: Add analytics charts for transaction trends and risk distribution
- Description: Visualize volumes, severity splits, and other decision-making signals.
- Acceptance Criteria:
  - Charts display live data
  - Chart interactions remain readable on desktop
  - Loading and empty states are present
- Priority: High
- Story Points: 5
- Labels: dashboard, analytics, frontend
- Suggested Assignee: Frontend Engineer

### EPIC 9: Reports

Objective: Provide exportable reporting views for operations and management.

#### Story P1: Reports overview page

- Summary: Build reports landing view
- Description: Present key operational report types and summary metrics.
- Acceptance Criteria:
  - Reports page loads successfully
  - Summary widgets use live data
  - Page is accessible from navigation
- Priority: Medium
- Story Points: 3
- Labels: reports, frontend, analytics
- Suggested Assignee: Frontend Engineer

#### Story P2: Export reports

- Summary: Add CSV and PDF exports
- Description: Enable users to export transaction and rule-related views for offline review.
- Acceptance Criteria:
  - CSV export works
  - PDF export works
  - Export actions handle empty data safely
- Priority: Medium
- Story Points: 5
- Labels: reports, export, frontend
- Suggested Assignee: Frontend Engineer

### EPIC 10: UI/UX

Objective: Make the product feel professional, consistent, and easy to operate.

#### Story U1: Navigation and layout refinement

- Summary: Refine global layout and navigation
- Description: Improve sidebar, top bar, and page structure consistency across the product.
- Acceptance Criteria:
  - Layout is consistent across pages
  - Navigation highlights the active area
  - Responsive behavior is acceptable on common desktop sizes
- Priority: High
- Story Points: 5
- Labels: ui, ux, frontend
- Suggested Assignee: Frontend Engineer

#### Story U2: Motion and interaction polish

- Summary: Add tasteful motion to key screens
- Description: Add small, purposeful animations for login, dashboard transitions, and loading states.
- Acceptance Criteria:
  - Motion improves clarity rather than distracting
  - No animation causes layout shift issues
  - Motion remains performant
- Priority: Medium
- Story Points: 3
- Labels: ui, motion, frontend
- Suggested Assignee: Frontend Engineer

### EPIC 11: Backend Integration

Objective: Keep frontend and backend contracts aligned and stable.

#### Story B1: Central API client behavior

- Summary: Standardize API client and error handling
- Description: Keep request base paths, auth headers, and error normalization consistent across the frontend.
- Acceptance Criteria:
  - All services use a shared client
  - API errors are normalized
  - Local development proxy behavior works
- Priority: High
- Story Points: 3
- Labels: integration, frontend, api
- Suggested Assignee: Frontend Engineer

#### Story B2: CORS and environment alignment

- Summary: Align backend and frontend environments for local development
- Description: Ensure local dev ports, API base URLs, and CORS policy work together without manual hacks.
- Acceptance Criteria:
  - Frontend can call backend locally
  - CORS policy supports approved local origins
  - Environment settings are documented
- Priority: High
- Story Points: 3
- Labels: integration, backend, frontend
- Suggested Assignee: Full-Stack Engineer

### EPIC 12: Testing

Objective: Prove the system works and prevent regressions.

#### Story TST1: Backend integration tests

- Summary: Add integration coverage for APIs
- Description: Cover transaction, rule, and alert flows with real application wiring.
- Acceptance Criteria:
  - Tests cover primary API happy paths
  - Validation and bad request envelopes are tested
  - Tests run reliably in CI
- Priority: Highest
- Story Points: 8
- Labels: testing, backend, integration
- Suggested Assignee: Backend Engineer / QA Engineer

#### Story TST2: Frontend smoke tests

- Summary: Add basic frontend smoke coverage
- Description: Validate login, routing, and main pages render with live or mocked data.
- Acceptance Criteria:
  - Core screens render successfully
  - Critical interactions are covered
  - Broken API states are visible
- Priority: High
- Story Points: 5
- Labels: testing, frontend, qa
- Suggested Assignee: Frontend Engineer / QA Engineer

### EPIC 13: Deployment

Objective: Package the product for reliable local and release execution.

#### Story DEP1: Local deployment baseline

- Summary: Document and stabilize local run steps
- Description: Make sure developers can start backend, frontend, and database consistently.
- Acceptance Criteria:
  - Setup instructions are accurate
  - Required env vars are documented
  - Local startup sequence is repeatable
- Priority: Medium
- Story Points: 3
- Labels: deployment, docs, devex
- Suggested Assignee: DevOps / Full-Stack Engineer

#### Story DEP2: Release readiness checklist

- Summary: Add release checklist for sprint signoff
- Description: Define what must be true before a sprint is accepted as release-ready.
- Acceptance Criteria:
  - Checklist exists and is used during review
  - Build, test, and runtime checks are captured
  - Owners are clear
- Priority: Medium
- Story Points: 2
- Labels: deployment, release, governance
- Suggested Assignee: Scrum Master

## 3. Suggested Sprint Structure

Recommended structure for a complete project of this size:

### Sprint 1: Platform Foundation

- Authentication
- Transaction ingestion and persistence
- Validation engine baseline
- Backend integration plumbing

### Sprint 2: Risk and Operations

- Rule engine
- Risk scoring
- Alert generation
- Case management baseline
- Backend integration hardening

### Sprint 3: Operator Experience

- Dashboard and analytics
- Reports
- UI/UX polish
- Frontend integration with live backend
- Testing uplift for core journeys

### Sprint 4: Stabilization and Release

- Deployment docs and runbooks
- End-to-end testing
- Bug fixing and performance cleanup
- Release notes and signoff

If the team wants a shorter plan, combine Sprint 3 and Sprint 4 into one hardening sprint.

## 4. Jira Field Standards

Use these conventions for every issue.

### Summary format

- Start with a verb
- Keep it short and specific
- Include the Jira key when referencing in chat or Git

Examples:

- Create Admin Dashboard
- Integrate Transaction API
- Add Risk Score Chart
- Connect Reports Page
- Improve Login UI

### Description format

Include:

- Why the work exists
- What the user or system should do
- Notes on API or UI dependencies

### Acceptance criteria format

Use observable outcomes only:

- Given/When/Then style is preferred
- Include positive and negative cases
- Keep criteria testable

### Priority guidance

- Highest: blocks core flow or release readiness
- High: important for sprint delivery
- Medium: valuable but not release-blocking
- Low: polish or non-critical follow-up

### Story point guidance

- 1: very small
- 2-3: small
- 5: medium
- 8: large but sprintable
- 13: should usually be split

## 5. Git and Jira Best Practices

### Branch naming

Use one Jira issue per branch.

Recommended patterns:

- feature/SUNIT8-1-dashboard
- feature/SUNIT8-18-rule-engine
- bugfix/SUNIT8-26-login
- chore/SUNIT8-40-ci-update

### Commit message format

Use the Jira key first, then a short imperative summary.

Examples:

- SUNIT8-12 Create Admin Dashboard
- SUNIT8-15 Integrate Transaction API
- SUNIT8-18 Add Risk Score Chart
- SUNIT8-22 Connect Reports Page
- SUNIT8-30 Improve Login UI

Rules:

- One commit should usually map to one Jira issue
- Keep commits small and reviewable
- Use present tense and action verbs

### Pull request naming

Use:

- [SUNIT8-12] Create Admin Dashboard
- [SUNIT8-15] Integrate Transaction API
- [SUNIT8-22] Connect Reports Page

### Merge strategy

Recommended enterprise flow:

1. Feature branch from `main` or `develop`
2. Commit with Jira key
3. Open PR against integration branch if the team uses one
4. Require review and build validation
5. Squash merge for clean history unless the team prefers rebase

## 6. Git to Jira Mapping

Suggested mapping rules:

- Jira Story = one feature branch
- Jira Task/Sub-task = one or more commits
- Jira Epic = a group of related stories
- Bugfix = linked to the failing issue and resolved in a dedicated branch

Example mapping:

- Jira: `SUNIT8-12 Create Admin Dashboard`
- Branch: `feature/SUNIT8-12-dashboard`
- Commits:
  - `SUNIT8-12 Add dashboard shell`
  - `SUNIT8-12 Wire KPI cards`
  - `SUNIT8-12 Connect live metrics`
- Pull Request: `[SUNIT8-12] Create Admin Dashboard`

## 7. Recommended Jira Status Flow

Use the following board columns:

- To Do: ready but not started
- In Progress: actively being worked on
- Code Review: PR opened and awaiting review
- Testing: merged to test environment or under QA verification
- Done: accepted, tested, and release-ready

Operational rules:

- A story should enter Code Review only after local validation is complete
- Testing should mean actual verification, not just code merged
- Done requires acceptance criteria met and no open blocking defects

## 8. Sprint 1 Release Notes Draft

Release Name: Sprint 1 Foundation Release

Summary:

- Established the backend foundation for JadeGuard
- Added transaction ingestion and core validation work
- Created initial rule and alert scaffolding
- Connected frontend structure for login, dashboard, and operational views
- Added baseline integration test coverage and local development alignment

Highlights:

- Transaction APIs now support core ingestion and listing flows
- Backend persistence uses MySQL with Flyway migrations
- Frontend includes the main operator navigation and layout structure
- Authentication and protected navigation are ready for continued hardening

Known Follow-Ups:

- Expand alert lifecycle coverage
- Deepen analytics and report exports
- Strengthen end-to-end test coverage
- Finalize deployment and release checklist

## 9. Recommended Ownership Model

- Backend Engineer: APIs, persistence, validation, rules, alerts
- Frontend Engineer: login, layout, dashboard, reports, UI polish
- Full-Stack Engineer: API alignment and integration fixes
- QA Engineer: integration tests and regression checks
- Scrum Master: sprint structure, Jira hygiene, release coordination
- DevOps / Platform: local runbook and deployment readiness

## 10. Operating Notes for Jira Setup

- Create the epics first
- Create 2-4 stories per epic to start, then split if needed
- Keep one sprint goal per sprint
- Link stories to the relevant epic immediately
- Add labels consistently so reporting stays clean
- Use the same Jira key in Git branches and commits
