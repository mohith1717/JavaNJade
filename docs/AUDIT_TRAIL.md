# Audit trail

Step 7.5 exposes an immutable, Admin-only audit log. Events store the actor's
user UUID and username snapshot, a specific action, entity information,
structured previous/new values, a reason, additional details, and a timestamp.

Recorded actions currently include:

```text
USER_LOGIN_SUCCEEDED
ALERT_CREATED
ALERT_ASSIGNED
ALERT_INVESTIGATION_STARTED
ALERT_APPROVED
ALERT_BLOCKED
ALERT_ESCALATED
ALERT_CLOSED
ALERT_REOPENED
RULE_CREATED
RULE_UPDATED
RULE_ENABLED
RULE_DISABLED
```

## Read API

```text
GET /api/audit-events
GET /api/audit-events/{auditEventId}
GET /api/audit-events?actorId={userId}
GET /api/audit-events?action=ALERT_BLOCKED
GET /api/audit-events?entityType=ALERT
GET /api/audit-events?entityId={entityId}
GET /api/audit-events?page=0&size=20
GET /api/alerts/{alertId}/history
```

Audit filters can be combined. Results are ordered newest first, page sizes are
limited to 100, and the response contains `content`, `page`, `size`,
`totalElements`, and `totalPages`.

The general audit API is restricted to `ADMIN`. Alert history is readable by
all three authenticated application roles. No audit POST, PUT, PATCH, or DELETE
endpoint exists.

Successful logins are recorded. Failed-login security events and user-management
events are deferred until the application has a security-event model and Admin
user-management API respectively. Passwords and JWTs are never audited.
