# Alert management

Step 6 creates one alert automatically when a successfully assessed transaction
has `HIGH` or `CRITICAL` risk. `LOW` and `MEDIUM` transactions do not create an
alert in the current MVP policy.

## Lifecycle

```text
OPEN -> ASSIGNED -> INVESTIGATING -> APPROVED | BLOCKED | ESCALATED
                                      -> CLOSED -> OPEN (eligible reopen)
```

An alert must follow this order. Invalid transitions return `409 Conflict`.
Only the assigned analyst can start an investigation, decide, and close it.
Closed `HIGH` and `CRITICAL` alerts can be reopened with a reason; reopening
clears the assignment but preserves the earlier decision and complete history.

Until authentication is added, action bodies explicitly supply `actorId`. This
value is stored in both `alert_status_history` and `audit_events`.

## Read endpoints

```text
GET /api/alerts
GET /api/alerts/{alertId}
GET /api/alerts?status=OPEN
GET /api/alerts?priority=CRITICAL
GET /api/alerts?assignedTo=analyst-1
GET /api/alerts?transactionId={transactionId}
```

Filters can be combined. Alert detail includes the ordered status history.

## Actions

Assign an open alert:

```text
POST /api/alerts/{alertId}/assign
```

```json
{
  "assignedTo": "analyst-1",
  "actorId": "team-lead-1",
  "reason": "Assigning the high-risk queue"
}
```

Start investigation:

```text
POST /api/alerts/{alertId}/start-investigation
```

Decision and lifecycle endpoints:

```text
POST /api/alerts/{alertId}/approve
POST /api/alerts/{alertId}/block
POST /api/alerts/{alertId}/escalate
POST /api/alerts/{alertId}/close
POST /api/alerts/{alertId}/reopen
```

These actions use:

```json
{
  "actorId": "analyst-1",
  "reason": "Readable justification for this action"
}
```

## Persistence guarantees

- A transaction can have at most one alert.
- Optimistic locking protects concurrent alert changes.
- Every status transition creates history and audit records.
- Alert creation and risk assessment are committed in one database transaction.
