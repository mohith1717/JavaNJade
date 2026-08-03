# Authentication and roles

JadeGuard uses stateless JWT authentication and BCrypt password hashes. Obtain a
token through `POST /api/auth/login`, then send it on protected requests as:

```text
Authorization: Bearer {accessToken}
```

`GET /api/auth/me` returns the currently authenticated user's public profile.
Tokens expire after one hour by default. Configure a private secret of at least
32 bytes with `JADEGUARD_JWT_SECRET`; the value in `application.yml` is only a
local-development fallback and must not be used in a deployed environment.

## Development users

Flyway V8 creates three local demonstration accounts:

| Username | Email | Password | Role |
| --- | --- | --- | --- |
| `admin1` | `admin@jadeguard.local` | `JadeGuardAdmin1!` | `ADMIN` |
| `fraud1` | `fraud@jadeguard.local` | `JadeGuardFraud1!` | `FRAUD_ANALYST` |
| `risk1` | `risk@jadeguard.local` | `JadeGuardRisk1!` | `RISK_ANALYST` |

These credentials are intentionally documented for local development only.
Change or remove all seeded credentials before any shared deployment.

## Permissions

| API | FRAUD_ANALYST | RISK_ANALYST | ADMIN |
| --- | --- | --- | --- |
| Transaction and validation reads | Yes | Yes | Yes |
| Transaction ingestion | Yes | Yes | Yes |
| Alert reads | Yes | Yes | Yes |
| Alert lifecycle actions | Yes | No | Yes |
| Rule reads | No | Yes | Yes |
| Rule changes | No | No | Yes |
| Audit reads | No | No | Yes |

The concrete route policy is:

```text
PUBLIC
POST /api/auth/login
GET  /api, /api/health, /actuator/health, /swagger-ui/**, /v3/api-docs/**

AUTHENTICATED
GET  /api/auth/me

FRAUD_ANALYST, RISK_ANALYST, ADMIN
GET  /api/transactions/**
POST /api/transactions
GET  /api/validation-errors/**
GET  /api/alerts/**

FRAUD_ANALYST, ADMIN
POST /api/alerts/{alertId}/assign
POST /api/alerts/{alertId}/start-investigation
POST /api/alerts/{alertId}/approve
POST /api/alerts/{alertId}/block
POST /api/alerts/{alertId}/escalate
POST /api/alerts/{alertId}/close
POST /api/alerts/{alertId}/reopen

RISK_ANALYST, ADMIN
GET  /api/rules/**

ADMIN
POST  /api/rules/**
PUT   /api/rules/**
PATCH /api/rules/**
GET   /api/audit-events/**
```

Transaction ingestion is temporarily available to all three application roles
so the training generator can use an authenticated account. A dedicated
`TRANSACTION_INGESTOR` service identity can replace this policy in a later
deployment-focused step.

Public endpoints are limited to login, API discovery, health, Swagger, and
OpenAPI documentation. Missing authentication returns `401`; insufficient role
permissions return `403`.

Step 7.3 derives every alert-action actor from Spring Security and records the
authenticated user's UUID. Alert request bodies cannot supply `actorId`.
Immutable audit-query endpoints remain a following Step 7 task.
