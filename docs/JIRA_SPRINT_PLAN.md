# JadeGuard Jira Sprint Plan

Project: JadeGuard

Target project: JadeGuard

Suggested sprint count: 3

This plan is based on the project baseline and the current implementation shape in the repo. It is written so the team can copy the items into Jira and create sprints quickly.

## Sprint 1: Foundation and Core Data Flow

Goal: Establish the backend contract, persistence, and the primary transaction ingestion flow.

Issues:
- Set up Spring Boot backend structure and package layout
- Configure MySQL, Flyway, and local environment defaults
- Create transaction ingestion API
- Implement transaction validation and persistence
- Add transaction route hop persistence
- Expose transaction list and detail endpoints
- Add baseline integration tests for transaction APIs

## Sprint 2: Rules, Risk, and Alert Operations

Goal: Deliver the rule management and alert lifecycle needed for the core compliance workflow.

Issues:
- Implement monitoring rules API
- Add rule update and status management
- Add duplicate rule and validation handling
- Implement alert listing and detail APIs
- Add alert acknowledge, investigate, close, and dismiss actions
- Add audit trail query endpoint
- Add integration tests for rules and alerts

## Sprint 3: Frontend Experience, Reporting, and Hardening

Goal: Finish the operator UI, reporting views, and polish for demo readiness.

Issues:
- Build role-aware dashboard experience
- Implement transaction list, details, and filters in frontend
- Implement alerts, analytics, reports, and settings pages
- Add login flow and protected routes
- Add exports for reports and operational views
- Add polished UI motion, layout, and navigation
- Clean up API connectivity, CORS, and error handling
- Run final end-to-end validation and demo data checks

## Optional Jira Setup Notes

- Create one Jira epic per sprint if you want a simple board structure.
- Use labels like `backend`, `frontend`, `testing`, `integration`, and `demo`.
- Keep each story small enough to finish within the sprint window.
- If you want stricter tracking, split the sprint issues into separate epics for `Transactions`, `Rules`, `Alerts`, and `Frontend UX`.

## Recommended Sprint Naming

- Sprint 1: Foundation and Core Data Flow
- Sprint 2: Rules and Alert Operations
- Sprint 3: Frontend, Reporting, and Hardening
