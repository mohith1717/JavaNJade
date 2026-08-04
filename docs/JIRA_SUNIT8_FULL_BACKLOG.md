# JadeGuard Jira Backlog for `SUNIT8`

Project: JadeGuard / JavaNJade

Scope: Frontend, backend, authentication, dashboards, APIs, documentation, testing, performance, responsiveness, and deployment.

This backlog is based on the current repository structure, including the Spring Boot backend, React/Vite frontend, MySQL/Flyway setup, API services, dashboards, reports, and docs.

## Current State From the Codebase

### Completed work

- Authentication UI exists and is heavily refined in the frontend login flow.
- Core backend transaction, rule, validation, and common infrastructure packages exist.
- Dashboard, reports, transactions, rule engine, alerts, analytics, and case-management screens exist in the frontend.
- MySQL configuration, Flyway migrations, and local backend startup support are in place.
- Backend integration tests exist for transactions and rules.
- CORS and local API integration are already addressed.
- Project documentation exists for architecture, baseline scope, and rule management.

### Work in progress

- Alert experience still needs full lifecycle polish and analyst-grade usability.
- Admin dashboard and case-management workflows need completion.
- UI consistency, responsiveness, and motion polish still need final tuning.
- Reporting and analytics need more complete live-data behavior and edge-case handling.
- Deployment readiness and release documentation need final hardening.

### Remaining work

- Full case management workflow.
- Stronger risk and alert explanation layers.
- End-to-end regression and smoke coverage.
- Performance tuning for larger data sets.
- Deployment runbooks and release signoff structure.

## Suggested Sprint Structure

### Sprint 1: Platform Foundation

- Authentication
- Transaction Management
- Validation Engine
- Backend Integration

### Sprint 2: Risk and Operations

- Rule Engine
- Risk Scoring
- Alert Generation
- Case Management

### Sprint 3: Analyst Experience

- Dashboard & Analytics
- Reports
- UI/UX polish
- Responsiveness

### Sprint 4: Stabilization and Release

- Testing
- Performance
- Deployment
- Release notes and signoff

If the team wants only 3 sprints, combine Sprint 3 and Sprint 4 into one hardening sprint.

## Epic 1: Authentication

**Priority:** Highest
**State:** In Progress
**Goal:** Secure access, session handling, and role-based routing.

### Story: Login and session flow

- Summary: Implement login flow and session handling
- Description: Allow users to sign in, persist auth state, and redirect them to the correct landing page based on role.
- Acceptance Criteria:
  - Valid credentials sign the user in successfully.
  - Invalid credentials show a clear error message.
  - Successful login persists session state.
  - User lands on the correct role-specific page.
- Priority: Highest
- Story Points: 5
- Labels: auth, frontend, backend
- Suggested Assignee: Frontend Engineer + Backend Engineer
- Tasks:
  - Build the login screen and field validation.
  - Connect the login form to the auth API.
  - Route users to role-specific landing pages.
  - Handle invalid credentials and loading states.
- Subtasks:
  - Keep password visibility toggle behavior.
  - Preserve remember-me behavior.

### Story: Protected routes and logout

- Summary: Protect application pages and support logout
- Description: Prevent unauthenticated access to protected views and clear session data on logout.
- Acceptance Criteria:
  - Protected pages redirect to login when no session exists.
  - Logout clears local auth state.
  - Navigation does not expose protected routes to guests.
- Priority: High
- Story Points: 3
- Labels: auth, ui, security
- Suggested Assignee: Frontend Engineer
- Tasks:
  - Wrap protected routes in a reusable guard.
  - Add a logout action to the navigation.
  - Ensure session state resets cleanly.
- Subtasks:
  - Verify route redirects after refresh.

## Epic 2: Transaction Management

**Priority:** Highest
**State:** In Progress
**Goal:** Ingest, store, list, and inspect transactions end to end.

### Story: Transaction ingestion API

- Summary: Create transaction ingestion endpoint
- Description: Accept transaction payloads, validate the request, persist the transaction, and return a stable response.
- Acceptance Criteria:
  - Valid payloads are accepted and stored.
  - Invalid payloads return structured validation errors.
  - Response includes transaction identity and processing status.
- Priority: Highest
- Story Points: 8
- Labels: backend, transactions, api
- Suggested Assignee: Backend Engineer
- Tasks:
  - Implement request DTO and controller logic.
  - Persist transaction and route-hop data.
  - Return a normalized success envelope.
  - Handle duplicate transaction protection.
- Subtasks:
  - Validate currency and amount formats.
  - Validate route structure and sequence.

### Story: Transaction list and filters

- Summary: Add list and filter support for transactions
- Description: Provide operational filters for transaction review, investigation, and reporting.
- Acceptance Criteria:
  - Transactions can be listed reliably.
  - Filters work for common search and status fields.
  - Pagination remains stable.
- Priority: High
- Story Points: 5
- Labels: backend, transactions, reporting
- Suggested Assignee: Backend Engineer
- Tasks:
  - Add query parameters for search and status.
  - Return list data in a stable shape.
  - Support pagination metadata.
- Subtasks:
  - Confirm list queries perform well on seeded data.

### Story: Transaction detail view

- Summary: Expose transaction detail endpoint
- Description: Return transaction details, route hops, validation outcomes, and risk context in one payload.
- Acceptance Criteria:
  - Existing transactions return full detail payloads.
  - Missing transactions return a clean 404 response.
  - The response can power the frontend details page.
- Priority: High
- Story Points: 5
- Labels: backend, transactions, api
- Suggested Assignee: Backend Engineer
- Tasks:
  - Join transaction, route, and validation records.
  - Shape the detail response for the frontend.
  - Add not-found handling.
- Subtasks:
  - Keep response ordering stable for UI rendering.

## Epic 3: Validation Engine

**Priority:** Highest
**State:** In Progress
**Goal:** Validate incoming transaction data and store machine-readable error results.

### Story: Request validation rules

- Summary: Validate transaction request payloads
- Description: Enforce required fields, amount rules, currency format, and route integrity.
- Acceptance Criteria:
  - Missing fields are rejected.
  - Invalid amount or currency values are rejected.
  - Route rules are enforced consistently.
- Priority: Highest
- Story Points: 5
- Labels: validation, backend, api
- Suggested Assignee: Backend Engineer
- Tasks:
  - Add validation annotations and service checks.
  - Return structured validation errors.
  - Align validation with transaction ingestion.
- Subtasks:
  - Check localized error messaging.

### Story: Validation error persistence

- Summary: Persist validation failures for investigation
- Description: Store failed validation results so analysts can review them later.
- Acceptance Criteria:
  - Validation failures are stored.
  - Errors are linked to the source transaction.
  - Errors are queryable by API.
- Priority: High
- Story Points: 5
- Labels: validation, persistence, backend
- Suggested Assignee: Backend Engineer
- Tasks:
  - Create validation error entity and repository logic.
  - Add query endpoint for validation errors.
  - Attach error data to transaction lifecycle.
- Subtasks:
  - Verify records remain consistent under repeat submissions.

## Epic 4: Rule Engine

**Priority:** Highest
**State:** In Progress
**Goal:** Manage monitoring rules and support operator-controlled configuration.

### Story: Rule listing and retrieval

- Summary: Add monitoring rule query endpoints
- Description: Expose the monitoring rule catalog to the UI and operational consumers.
- Acceptance Criteria:
  - Rules can be listed.
  - Rule details are returned in a stable contract.
  - Disabled rules are represented clearly.
- Priority: High
- Story Points: 3
- Labels: rules, backend, api
- Suggested Assignee: Backend Engineer
- Tasks:
  - Implement rule list endpoint.
  - Implement rule detail response shape.
  - Include enabled/disabled state in responses.
- Subtasks:
  - Keep status values normalized.

### Story: Rule update workflow

- Summary: Update rule threshold, severity, and status
- Description: Allow controlled edits to rules without recreating them.
- Acceptance Criteria:
  - Threshold can be changed.
  - Severity can be changed.
  - Enable and disable actions work.
  - Invalid changes return a structured error.
- Priority: High
- Story Points: 5
- Labels: rules, backend, validation
- Suggested Assignee: Backend Engineer
- Tasks:
  - Add update request model and controller method.
  - Validate accepted rule state transitions.
  - Persist edits safely.
- Subtasks:
  - Prevent duplicate rule codes.

## Epic 5: Risk Scoring

**Priority:** Highest
**State:** To Do / In Progress
**Goal:** Calculate a useful risk score and explanation for each transaction.

### Story: Risk score calculation

- Summary: Calculate transaction risk score
- Description: Evaluate transaction and route attributes to produce a consistent risk score and level.
- Acceptance Criteria:
  - Risk score is computed consistently.
  - Risk level maps to the agreed thresholds.
  - Result is available for downstream alerting.
- Priority: Highest
- Story Points: 8
- Labels: risk, backend, engine
- Suggested Assignee: Backend Engineer
- Tasks:
  - Define score inputs and scoring rules.
  - Store score and level alongside transaction state.
  - Wire score output into alert generation.
- Subtasks:
  - Document score thresholds clearly.

### Story: Risk explanation data

- Summary: Provide score breakdown for investigators
- Description: Explain why a transaction received a given score so analysts can review it.
- Acceptance Criteria:
  - A breakdown is available in the API response.
  - Explanation is understandable to an analyst.
  - Output is stable for frontend use.
- Priority: High
- Story Points: 5
- Labels: risk, investigation, backend
- Suggested Assignee: Backend Engineer
- Tasks:
  - Define explanation payload model.
  - Attach score reasons to transaction detail.
  - Expose breakdown for the UI.
- Subtasks:
  - Avoid overly technical internal-only terms.

## Epic 6: Alert Generation

**Priority:** Highest
**State:** In Progress
**Goal:** Generate alerts from risk and validation outcomes and support analyst action.

### Story: Alert creation engine

- Summary: Create alerts from transaction outcomes
- Description: Generate alerts when transactions cross risk thresholds or fail critical validation checks.
- Acceptance Criteria:
  - Alerts are created for the correct triggers.
  - Severity is assigned consistently.
  - Alerts link back to the source transaction.
- Priority: Highest
- Story Points: 8
- Labels: alerts, risk, backend
- Suggested Assignee: Backend Engineer
- Tasks:
  - Implement alert creation rules.
  - Persist alert entities and history.
  - Associate alerts with transactions and scores.
- Subtasks:
  - Make alert creation idempotent where needed.

### Story: Alert lifecycle actions

- Summary: Manage alert status transitions
- Description: Support acknowledge, investigate, close, and dismiss actions with audit history.
- Acceptance Criteria:
  - Each transition is validated.
  - Invalid transitions are rejected.
  - History records the action taken.
- Priority: High
- Story Points: 5
- Labels: alerts, workflow, backend
- Suggested Assignee: Backend Engineer
- Tasks:
  - Add status transition endpoints.
  - Validate allowed lifecycle changes.
  - Persist action history.
- Subtasks:
  - Keep audit event timestamps in UTC.

### Story: Analyst alert review screen

- Summary: Build alert review UI
- Description: Give analysts a clean screen for reviewing alert details and taking action.
- Acceptance Criteria:
  - Alert details are visible.
  - Action buttons are available based on state.
  - Empty and loading states are handled.
- Priority: High
- Story Points: 5
- Labels: alerts, frontend, analyst
- Suggested Assignee: Frontend Engineer
- Tasks:
  - Build alert detail layout.
  - Connect actions to the API.
  - Show status and explanation data.
- Subtasks:
  - Ensure action feedback is obvious.

## Epic 7: Case Management

**Priority:** High
**State:** To Do / In Progress
**Goal:** Let fraud and risk analysts convert alerts into managed cases.

### Story: Case creation from alert

- Summary: Create a case from an alert
- Description: Let an analyst open a case from a notable alert and track the review process.
- Acceptance Criteria:
  - A case can be created from an alert.
  - The case stores references to the alert and transaction.
  - Case status can be updated.
- Priority: High
- Story Points: 5
- Labels: case-management, alerts, backend
- Suggested Assignee: Backend Engineer
- Tasks:
  - Add case entity and repository logic.
  - Link cases to alerts and transactions.
  - Expose case creation endpoint.
- Subtasks:
  - Keep case numbering stable.

### Story: Case detail workflow

- Summary: View and update case details
- Description: Provide a workspace for notes, resolution status, and investigation progress.
- Acceptance Criteria:
  - Case details are retrievable.
  - Notes can be updated.
  - Resolution state is visible.
- Priority: Medium
- Story Points: 3
- Labels: case-management, ui, backend
- Suggested Assignee: Full-Stack Engineer
- Tasks:
  - Add case detail API.
  - Build the case management page.
  - Support notes and resolution fields.
- Subtasks:
  - Keep the view readable on smaller screens.

## Epic 8: Dashboard and Analytics

**Priority:** High
**State:** In Progress
**Goal:** Give admin, fraud analyst, and risk analyst users a clear operational overview.

### Story: KPI summary dashboard

- Summary: Build KPI cards for operational overview
- Description: Show transaction counts, alert counts, high-risk counts, and key status information.
- Acceptance Criteria:
  - Cards load live data.
  - Loading and empty states are handled.
  - Metrics are role-appropriate.
- Priority: High
- Story Points: 5
- Labels: dashboard, frontend, analytics
- Suggested Assignee: Frontend Engineer
- Tasks:
  - Wire dashboard KPIs to API data.
  - Reuse animated metric components.
  - Handle empty and error states.
- Subtasks:
  - Keep numeric formatting consistent.

### Story: Trend and distribution charts

- Summary: Add analytics charts for trends and risk distribution
- Description: Visualize activity trends, severity splits, and geographic or operational patterns.
- Acceptance Criteria:
  - Charts display live data.
  - Charts remain readable on desktop.
  - Loading states are present.
- Priority: High
- Story Points: 5
- Labels: dashboard, analytics, frontend
- Suggested Assignee: Frontend Engineer
- Tasks:
  - Connect chart components to APIs.
  - Format chart legends and labels.
  - Improve chart fallback states.
- Subtasks:
  - Confirm chart behavior on empty datasets.

### Story: Admin dashboard view

- Summary: Complete the admin dashboard experience
- Description: Provide a concise administrative landing view with high-level controls and summary status.
- Acceptance Criteria:
  - Admin landing page is accessible.
  - Summary cards reflect admin-relevant data.
  - Layout is consistent with the rest of the app.
- Priority: Medium
- Story Points: 3
- Labels: admin, dashboard, frontend
- Suggested Assignee: Frontend Engineer
- Tasks:
  - Build admin-specific page content.
  - Connect summary widgets.
  - Align the page with the shared app layout.
- Subtasks:
  - Keep the page lightweight.

## Epic 9: Reports

**Priority:** High
**State:** In Progress
**Goal:** Provide exportable reports for operations and management.

### Story: Reports overview page

- Summary: Build reports landing view
- Description: Present report categories, summary metrics, and useful shortcuts for analysts.
- Acceptance Criteria:
  - Reports page loads successfully.
  - Summary widgets use live or seeded data.
  - The page is reachable from navigation.
- Priority: Medium
- Story Points: 3
- Labels: reports, frontend, analytics
- Suggested Assignee: Frontend Engineer
- Tasks:
  - Finalize the reports layout.
  - Hook report cards to the right datasets.
  - Improve navigation and empty states.
- Subtasks:
  - Keep the view consistent with dashboard styling.

### Story: Export reports

- Summary: Add CSV and PDF export support
- Description: Allow users to export transaction and rule-related views for offline review.
- Acceptance Criteria:
  - CSV export works.
  - PDF export works.
  - Exports handle empty data safely.
- Priority: Medium
- Story Points: 5
- Labels: reports, export, frontend
- Suggested Assignee: Frontend Engineer
- Tasks:
  - Wire export utilities into the reports page.
  - Add export actions for relevant views.
  - Validate file naming and download behavior.
- Subtasks:
  - Confirm exports work with seeded demo data.

## Epic 10: UI/UX

**Priority:** High
**State:** In Progress
**Goal:** Make the product feel polished, consistent, and efficient to operate.

### Story: Navigation and layout refinement

- Summary: Refine global layout and navigation
- Description: Improve sidebar, top bar, and page structure consistency across the product.
- Acceptance Criteria:
  - Layout is consistent across pages.
  - Navigation clearly shows the active area.
  - Desktop responsiveness is acceptable.
- Priority: High
- Story Points: 5
- Labels: ui, ux, frontend
- Suggested Assignee: Frontend Engineer
- Tasks:
  - Standardize page spacing and shell layout.
  - Improve sidebar and navbar behavior.
  - Make role-based navigation clearer.
- Subtasks:
  - Reduce layout shifts between routes.

### Story: Motion and interaction polish

- Summary: Add tasteful motion to key screens
- Description: Add purposeful animations for login, dashboard transitions, and loading states.
- Acceptance Criteria:
  - Motion improves clarity.
  - Animations do not cause layout shift issues.
  - Motion remains performant.
- Priority: Medium
- Story Points: 3
- Labels: ui, motion, frontend
- Suggested Assignee: Frontend Engineer
- Tasks:
  - Add motion to the login and dashboard views.
  - Keep loading states visually calm.
  - Standardize transitions across pages.
- Subtasks:
  - Avoid distracting or excessive animation.

### Story: Accessibility and visual consistency

- Summary: Improve accessibility and design consistency
- Description: Tighten color usage, spacing, contrast, and keyboard friendliness across screens.
- Acceptance Criteria:
  - Key screens meet basic accessibility expectations.
  - Typography and spacing are consistent.
  - Interactive elements are keyboard accessible.
- Priority: Medium
- Story Points: 3
- Labels: accessibility, ui, frontend
- Suggested Assignee: Frontend Engineer
- Tasks:
  - Review contrast and text hierarchy.
  - Improve keyboard and focus behavior.
  - Standardize component styling.
- Subtasks:
  - Check the login and dashboard screens first.

## Epic 11: Backend Integration

**Priority:** Highest
**State:** In Progress
**Goal:** Keep frontend and backend contracts aligned and stable.

### Story: Central API client behavior

- Summary: Standardize API client and error handling
- Description: Keep base paths, auth behavior, and error normalization consistent across all frontend services.
- Acceptance Criteria:
  - All frontend services use the shared client.
  - API errors are normalized.
  - Local development proxy behavior works.
- Priority: High
- Story Points: 3
- Labels: integration, frontend, api
- Suggested Assignee: Frontend Engineer
- Tasks:
  - Keep the shared axios client as the single integration point.
  - Normalize error handling across services.
  - Confirm local routing behavior.
- Subtasks:
  - Keep request configuration simple.

### Story: CORS and environment alignment

- Summary: Align backend and frontend local environments
- Description: Ensure local dev ports, backend origins, and frontend proxy settings work together cleanly.
- Acceptance Criteria:
  - Frontend can call backend locally.
  - CORS supports approved local origins.
  - Environment settings are documented.
- Priority: High
- Story Points: 3
- Labels: integration, backend, frontend
- Suggested Assignee: Full-Stack Engineer
- Tasks:
  - Document local run settings.
  - Keep backend CORS configuration current.
  - Verify frontend proxy support.
- Subtasks:
  - Ensure no hard-coded production-only assumptions.

## Epic 12: Testing

**Priority:** Highest
**State:** In Progress
**Goal:** Prove the system works and prevent regressions.

### Story: Backend integration tests

- Summary: Expand API integration coverage
- Description: Cover transaction, rule, and validation flows with realistic application wiring.
- Acceptance Criteria:
  - Happy paths are covered.
  - Validation and bad request envelopes are tested.
  - Tests run reliably in CI.
- Priority: Highest
- Story Points: 8
- Labels: testing, backend, integration
- Suggested Assignee: Backend Engineer / QA Engineer
- Tasks:
  - Add coverage for missing endpoints.
  - Cover malformed input and error envelopes.
  - Keep the tests deterministic.
- Subtasks:
  - Confirm tests work with the local MySQL setup.

### Story: Frontend smoke checks

- Summary: Add basic frontend smoke coverage
- Description: Validate login, routing, and main pages render with live or mocked data.
- Acceptance Criteria:
  - Core screens render successfully.
  - Critical interactions are covered.
  - Broken API states are visible.
- Priority: High
- Story Points: 5
- Labels: testing, frontend, qa
- Suggested Assignee: Frontend Engineer / QA Engineer
- Tasks:
  - Add smoke checks for key routes.
  - Validate login and logout flows.
  - Validate dashboard and reports render paths.
- Subtasks:
  - Add at least one failure-state check.

### Story: Regression and API contract testing

- Summary: Lock down API response contracts
- Description: Protect the main response structures so frontend integration does not break unexpectedly.
- Acceptance Criteria:
  - Response envelopes remain stable.
  - Breaking changes are caught early.
  - Regression checks run before release.
- Priority: High
- Story Points: 5
- Labels: testing, api, regression
- Suggested Assignee: QA Engineer
- Tasks:
  - Define contract assertions for key endpoints.
  - Add regression coverage for known bugs.
  - Include negative-path checks.
- Subtasks:
  - Keep expected payloads documented.

## Epic 13: Performance

**Priority:** Medium
**State:** To Do / In Progress
**Goal:** Keep the app responsive as data volume increases.

### Story: Frontend rendering performance

- Summary: Improve dashboard and list rendering performance
- Description: Reduce expensive UI re-renders and keep the main analytical screens responsive.
- Acceptance Criteria:
  - Large lists remain usable.
  - Charts and tables stay responsive.
  - Loading states feel smooth.
- Priority: Medium
- Story Points: 5
- Labels: performance, frontend, dashboard
- Suggested Assignee: Frontend Engineer
- Tasks:
  - Review list and chart rendering paths.
  - Avoid unnecessary recomputation.
  - Improve table and chart loading states.
- Subtasks:
  - Check behavior with larger seeded datasets.

### Story: Backend query performance

- Summary: Tune key API queries
- Description: Keep transaction, rule, and alert queries responsive on larger data volumes.
- Acceptance Criteria:
  - Main queries remain fast enough for UI use.
  - Slow queries are identified and improved.
  - Results remain correct after tuning.
- Priority: Medium
- Story Points: 5
- Labels: performance, backend, database
- Suggested Assignee: Backend Engineer
- Tasks:
  - Review transaction and alert query paths.
  - Add or validate useful indexes.
  - Confirm pagination behavior remains correct.
- Subtasks:
  - Measure query shape against seeded data.

## Epic 14: Deployment

**Priority:** High
**State:** To Do
**Goal:** Make the project reproducible and release-ready.

### Story: Local deployment baseline

- Summary: Stabilize local run steps
- Description: Make sure developers can start backend, frontend, and database consistently.
- Acceptance Criteria:
  - Setup instructions are accurate.
  - Required environment variables are documented.
  - Startup sequence is repeatable.
- Priority: High
- Story Points: 3
- Labels: deployment, docs, devex
- Suggested Assignee: DevOps / Full-Stack Engineer
- Tasks:
  - Document backend startup steps.
  - Document frontend startup steps.
  - Document database setup and credentials.
- Subtasks:
  - Verify Windows-based startup steps.

### Story: Release readiness checklist

- Summary: Define sprint signoff checklist
- Description: Make the release criteria explicit for each sprint and final deployment.
- Acceptance Criteria:
  - Checklist exists and is used during review.
  - Build, test, and runtime checks are captured.
  - Owners are clear.
- Priority: Medium
- Story Points: 2
- Labels: deployment, release, governance
- Suggested Assignee: Scrum Master
- Tasks:
  - Define release signoff criteria.
  - Add testing and verification checkpoints.
  - Record release owners and approvers.
- Subtasks:
  - Keep the checklist short and practical.

## Sprint 1 Release Notes Draft

### Release Title

Sprint 1 Foundation Release

### Summary

- Established the backend foundation for JadeGuard.
- Added transaction ingestion and validation work.
- Created the rule and alert scaffolding.
- Built the frontend shell for login, dashboards, transactions, reports, and analytics.
- Added baseline integration tests and local MySQL support.

### Highlights

- Transaction APIs support core ingestion and listing flows.
- Backend persistence uses MySQL with Flyway migrations.
- Frontend includes the main operator navigation and layout structure.
- Authentication and protected navigation are ready for continued hardening.

### Known Follow-Ups

- Expand alert lifecycle coverage.
- Complete case-management workflow.
- Deepen analytics and report exports.
- Strengthen end-to-end test coverage.
- Finalize deployment and release checklist.
