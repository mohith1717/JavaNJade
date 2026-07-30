# JadeGuard Backend

Spring Boot modular monolith. Business code is grouped by feature rather than
by one global controllers/services/repositories hierarchy.

## Run

Start MySQL from the repository root:

```bash
docker compose up -d mysql
```

The local JDBC connection uses port `3307`; Docker maps it to MySQL's internal
port `3306`.

Then:

```bash
cd backend
./mvnw spring-boot:run
```

- Health: <http://localhost:8080/api/v1/system/health>
- Actuator: <http://localhost:8080/actuator/health>
- Swagger UI: <http://localhost:8080/swagger-ui.html>

## Package responsibilities

| Package | Responsibility |
|---|---|
| `transaction` | Ingestion, validation coordination, history, and route hops |
| `validation` | Baseline viability checks |
| `rule` | Configurable rule definitions and evaluation strategies |
| `risk` | Risk aggregation and explainable score factors |
| `alert` | Alert creation, lifecycle, and analyst decisions |
| `audit` | Append-only user and system events |
| `dashboard` | Read-only operational summaries |
| `common` | Cross-cutting API/error configuration only |
