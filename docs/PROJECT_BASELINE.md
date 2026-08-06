# JadeGuard Project Baseline

Status: Proposed for team approval

This document is the team's initial working agreement. Keep the first version
small, merge it, and change this document through pull requests when the team
makes a different decision.

## 1. Technology stack

### Agreed starting stack

| Area | Technology | Reason |
|---|---|---|
| Backend | Java 21 and Spring Boot | Matches the Java project and supports REST, validation, persistence, and testing |
| Build | Maven with Maven Wrapper | Reproducible builds without requiring every developer to install the same Maven version |
| Database | MySQL 8.4 | Strong relational model, transactions, indexing, and reporting queries |
| Migrations | Flyway | Database changes are version-controlled and repeatable |
| Persistence | Spring Data JPA | Clear repository layer and fast delivery for the training project |
| API documentation | Springdoc OpenAPI/Swagger UI | Makes the API easy for the frontend team and instructors to inspect |
| Frontend | React, TypeScript, and Vite | Suitable for tables, filters, dashboards, and interactive investigation views |
| Styling | A small shared CSS/theme layer | Avoid spending the MVP phase choosing a large design system |
| Generator | Python 3 script using HTTP requests | Simple scenario-based generation independent of the backend |
| Local environment | Docker Compose for MySQL | Gives all developers the same local database setup |
| Testing | JUnit 5, Mockito, Spring Boot Test, and Testcontainers | Unit and database-backed integration testing |

### Architecture decision

Start as a modular monolith:

```text
Python Generator / React UI
             |
          REST API
             |
     Spring Boot Application
       |       |       |
 Transactions Rules  Alerts
             |
           MySQL
```

Do not introduce Kafka, RabbitMQ, microservices, machine learning, or WebSockets
for the first demo. They can be added after the synchronous end-to-end flow is
working.

Use feature-oriented packages inside the backend:

```text
com.jadeguard
├── transaction
├── validation
├── rule
├── risk
├── alert
├── audit
└── common
```

Within a feature, use Controller → Service → Repository:

- Controller handles HTTP, DTO conversion, and request validation.
- Service owns business logic and transaction boundaries.
- Repository only accesses persistent data.
- Controllers must not calculate risk scores or change alert states directly.

## 2. Basic API contract

Base path: `/api/v1`

All timestamps use ISO-8601 UTC, for example `2026-07-30T10:15:30Z`.
Money is sent as a decimal number plus a three-letter currency code. Never use
floating-point types for money in Java; use `BigDecimal`.

### MVP endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/transactions` | Ingest, validate, store, and evaluate a transaction |
| GET | `/api/v1/transactions` | List transactions with basic filters |
| GET | `/api/v1/transactions/{transactionId}` | View transaction, route, validation, and risk result |
| GET | `/api/v1/alerts` | List alerts filtered by status or severity |
| GET | `/api/v1/alerts/{alertId}` | View alert, transaction, score breakdown, and history |
| POST | `/api/v1/alerts/{alertId}/acknowledge` | Move an open alert to acknowledged |
| POST | `/api/v1/alerts/{alertId}/investigate` | Start investigation |
| POST | `/api/v1/alerts/{alertId}/close` | Close with resolution notes |
| POST | `/api/v1/alerts/{alertId}/dismiss` | Dismiss as a false positive/not actionable |
| GET | `/api/v1/rules` | List monitoring rules |
| PATCH | `/api/v1/rules/{ruleId}` | Change threshold, severity, weight, or enabled state |
| GET | `/api/v1/audit-events` | Query the append-only audit trail |

Approve, block, escalate, assignment, reopening, rule creation, and reporting are
the next milestone. They should not block the first working demo.

### Transaction request

```json
{
  "externalTransactionId": "TXN-10001",
  "senderAccountId": "ACC-001",
  "receiverAccountId": "ACC-900",
  "amount": 250000.00,
  "currency": "INR",
  "occurredAt": "2026-07-30T10:15:30Z",
  "route": [
    {
      "sequence": 1,
      "countryCode": "IN",
      "institution": "Origin Bank"
    },
    {
      "sequence": 2,
      "countryCode": "AE",
      "institution": "Intermediary Bank"
    },
    {
      "sequence": 3,
      "countryCode": "GB",
      "institution": "Destination Bank"
    }
  ]
}
```

### Successful ingestion response

Use `201 Created`.

```json
{
  "transactionId": "8d15c06e-3a92-4f57-bba0-f42a87a35e61",
  "externalTransactionId": "TXN-10001",
  "processingStatus": "REVIEW_REQUIRED",
  "risk": {
    "score": 35,
    "level": "MEDIUM",
    "factors": [
      {
        "ruleCode": "HIGH_AMOUNT",
        "contribution": 35,
        "explanation": "Amount INR 250000 exceeded the INR 200000 threshold"
      }
    ]
  },
  "alertId": "b4729b83-1d98-44d0-b73c-8dcfd1f63357"
}
```

### Error shape

Every API error uses one predictable format:

```json
{
  "code": "DUPLICATE_TRANSACTION",
  "message": "A transaction with external ID TXN-10001 already exists",
  "timestamp": "2026-07-30T10:15:31Z",
  "fieldErrors": []
}
```

### Initial filtering

Support these query parameters without designing a complex search language:

```text
GET /api/v1/transactions?accountId=ACC-001&riskLevel=HIGH&page=0&size=20
GET /api/v1/alerts?status=OPEN&severity=HIGH&page=0&size=20
```

## 3. Database entities

Keep the MVP schema limited to the entities below.

### `transactions`

- `id` UUID primary key
- `external_transaction_id` unique
- `sender_account_id`
- `receiver_account_id`
- `amount` decimal
- `currency`
- `occurred_at` UTC timestamp
- `processing_status`
- `risk_score`
- `risk_level`
- `created_at`

### `transaction_route_hops`

- `id` UUID primary key
- `transaction_id` foreign key
- `sequence_number`
- `country_code`
- `institution`

Add a unique constraint on `(transaction_id, sequence_number)`. This entity is
the source for the selected transaction's flow-of-funds map.

### `monitoring_rules`

- `id` UUID primary key
- `code` unique
- `name`
- `type`
- `enabled`
- `severity`
- `risk_weight`
- `parameters` JSON
- `created_at`
- `updated_at`

For the first demo, seed one `AMOUNT_THRESHOLD` rule. Keeping its parameters in
the database proves that it is configurable without building every rule type.

### `rule_evaluations`

- `id` UUID primary key
- `transaction_id` foreign key
- `rule_id` foreign key
- `triggered`
- `score_contribution`
- `explanation`
- `evaluated_at`

This table provides the explainable risk-score breakdown.

### `alerts`

- `id` UUID primary key
- `transaction_id` foreign key for the MVP
- `status`
- `severity`
- `primary_reason`
- `risk_score`
- `resolution_notes` nullable
- `created_at`
- `acknowledged_at` nullable
- `closed_at` nullable
- `version` for optimistic locking

The later model may allow an alert/case to contain multiple related
transactions. Do not add that complexity until the first demo works.

### `alert_status_history`

- `id` UUID primary key
- `alert_id` foreign key
- `from_status` nullable for creation
- `to_status`
- `reason` nullable
- `changed_by`
- `changed_at`

### `audit_events`

- `id` UUID primary key
- `actor_id`
- `action`
- `entity_type`
- `entity_id`
- `details` JSON
- `occurred_at`

Audit events are append-only. The application exposes no update or delete
operation for this table.

### Users in the MVP

The original brief assumes one operator, while the extended requirement asks
for user-based auditing. For the first demo, send a fixed demo actor such as
`analyst-01` from backend configuration. Add authentication and a `users` table
when multiple real roles are introduced. Do not pretend a client-supplied user
header is secure.

### Initial indexes

- Unique index on `transactions.external_transaction_id`
- Index on `transactions.sender_account_id`
- Index on `transactions.occurred_at`
- Composite index on `(sender_account_id, occurred_at)`
- Index on `(alerts.status, alerts.severity, alerts.created_at)`
- Index on `audit_events.actor_id`
- Index on `audit_events.occurred_at`

## 4. Alert lifecycle

### MVP states

```text
OPEN → ACKNOWLEDGED → INVESTIGATING → CLOSED
          |                 |
          └──→ DISMISSED ←──┘
```

### Allowed transitions

| From | To | Required information |
|---|---|---|
| New alert | OPEN | Generated by the rule engine |
| OPEN | ACKNOWLEDGED | Actor and timestamp |
| ACKNOWLEDGED | INVESTIGATING | Actor and timestamp |
| ACKNOWLEDGED | DISMISSED | Reason |
| INVESTIGATING | CLOSED | Resolution notes |
| INVESTIGATING | DISMISSED | Reason |

Any unlisted transition must return `409 Conflict`. Every successful transition
must append both an alert status-history record and an audit event in the same
database transaction.

### Next milestone

Add:

- Assignment
- Analyst decisions: `APPROVE`, `BLOCK`, and `ESCALATE`
- `ESCALATED` status
- Reopening only for a previously closed high-severity alert

Reopening must create a new history/audit entry; it must never erase the old
closure.

## 5. Git and pull-request conventions

### Branch model

- `main` must always contain demo-ready code.
- Use short-lived feature branches directly from the latest `main`.
- Do not create a long-lived `develop` branch for a three-person training
  project; it adds another merge boundary without providing much value.
- The existing remote `Backend` branch currently points to the initial commit.
  Do not use it as a permanent backend integration branch.

Branch names:

```text
feature/backend-skeleton
feature/transaction-ingestion
feature/amount-rule
feature/alert-queue-ui
fix/duplicate-transaction-check
docs/api-contract
```

Do not use developer names such as `mohith-branch`.

### Commit convention

Use concise imperative commits:

```text
feat: add transaction ingestion endpoint
feat: evaluate amount threshold rule
fix: reject duplicate external transaction IDs
test: cover invalid alert transitions
docs: document local database setup
```

### Pull-request rules

1. Pull the latest `main` before starting a branch.
2. Keep a PR focused on one feature or closely related change.
3. Do not commit secrets, IDE settings, generated build folders, or local
   database files.
4. At least one teammate reviews every PR.
5. CI must compile the application and run tests.
6. Include testing instructions and screenshots for UI changes.
7. Update API documentation and migrations in the same PR as the behavior.
8. Prefer squash merging so `main` has one clear commit per PR.
9. Delete the feature branch after merge.
10. Never force-push `main`.

### Ownership without silos

- Developer 1 initially leads transaction ingestion and the generator.
- Developer 2 initially leads rules and risk scoring.
- Developer 3 initially leads alert lifecycle and the analyst UI.
- Each feature owner implements the necessary controller, service, repository,
  tests, and UI instead of dividing work by technical layer.

## 6. Definition of the first demo

The first demo is complete only when this scenario works from a clean checkout:

1. Start MySQL and the backend using documented commands.
2. Open Swagger UI.
3. Run the Python generator's `high_amount` scenario.
4. The generator submits a transaction for INR 250,000.
5. The backend validates and stores the transaction and its country route.
6. The active INR 200,000 amount rule triggers.
7. The system stores the rule evaluation and explainable score contribution.
8. The system creates an `OPEN` alert.
9. The analyst UI lists the alert without manually inserting database data.
10. Opening the alert shows the transaction, risk explanation, and ordered
    country route.
11. The analyst acknowledges, investigates, and closes it with notes.
12. Refreshing the page preserves all state.
13. The alert timeline and audit trail show every action and actor.

### First-demo acceptance criteria

- A transaction below the threshold creates no alert.
- Submitting the same external transaction ID twice is rejected.
- Invalid alert transitions return `409 Conflict`.
- Money uses decimal-safe storage and calculations.
- All timestamps are UTC.
- Database schema is created only through migrations.
- Backend tests cover both triggering and non-triggering transactions.
- A clean `README` explains how another team member runs the demo.
- No Kafka, machine-learning model, full admin reporting, or customer portal is
  required for this milestone.

## 7. First team session agenda

Timebox the meeting to 60 minutes:

1. **10 minutes:** Confirm or amend the proposed stack.
2. **15 minutes:** Walk through the API request, response, and error format.
3. **15 minutes:** Review the MVP entities and alert state transitions.
4. **10 minutes:** Confirm branch, review, and merge conventions.
5. **10 minutes:** Assign the first three implementation tickets.

Record disagreements as explicit decisions in this document. End the session
with these three initial tickets:

1. Scaffold Spring Boot, MySQL, Flyway, Swagger, and CI.
2. Scaffold React and render a static alert queue from a typed mock response.
3. Create the Python generator with normal and high-amount scenarios.

Merge the skeletons before the team starts implementing larger features.
