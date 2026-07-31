# JadeGuard Backend

## Start in three steps

### 1. Start MySQL

From the repository root:

```bash
docker compose up -d mysql
```

### 2. Start the backend

```bash
cd backend
./mvnw spring-boot:run
```

### 3. Test a GET request

Open this URL in Postman or a browser:

```text
http://localhost:8080/api
```

## Simple transaction API

```text
GET  http://localhost:8080/api/health
GET  http://localhost:8080/api/transactions
GET  http://localhost:8080/api/transactions?processingStatus=VALIDATION_FAILED
GET  http://localhost:8080/api/transactions/{transactionId}
GET  http://localhost:8080/api/transactions/{transactionId}/route
GET  http://localhost:8080/api/transactions/{transactionId}/fund-flow
GET  http://localhost:8080/api/transactions/{transactionId}/validation-errors
GET  http://localhost:8080/api/validation-errors
GET  http://localhost:8080/api/validation-errors/{validationErrorId}
POST http://localhost:8080/api/transactions
```

The validation-error list supports:

```text
GET /api/validation-errors?transactionId={transactionId}
GET /api/validation-errors?errorCode=UNSUPPORTED_CURRENCY
```

The read-only `fund-flow` endpoint prepares the stored route for frontend
visualization. It includes the transaction summary, origin and destination
country names, total hop count, and ordered `ORIGIN`, `INTERMEDIARY`, and
`DESTINATION` hops. The raw `route` endpoint remains available for inspecting
the persisted route records.

Use this JSON body for the POST request:

```json
{
  "externalTransactionId": "TXN-1001",
  "senderAccountId": "ACC-001",
  "receiverAccountId": "ACC-002",
  "amount": 5000,
  "currency": "INR",
  "occurredAt": "2026-07-30T08:30:00Z",
  "route": [
    {
      "sequence": 1,
      "countryCode": "IN",
      "institution": "Origin Bank"
    },
    {
      "sequence": 2,
      "countryCode": "GB",
      "institution": "Destination Bank"
    }
  ]
}
```

The POST response contains an `id`. Copy that value into the final GET URL,
without the `{}` characters.

New transactions have not been risk-assessed yet, so they start with:

```json
{
  "processingStatus": "VALIDATED",
  "riskScore": null,
  "riskLevel": "PENDING"
}
```

Valid transactions finish as `VALIDATED` and are ready for the Step 3 rule
engine. Business-invalid transactions remain stored as `VALIDATION_FAILED`,
with explanations available through their validation-error endpoint. Risk
values are assigned later by the rule and risk engines; clients cannot set them
in the POST request.

Errors use one consistent shape. For example, a duplicate external transaction
ID returns `409 Conflict`:

```json
{
  "timestamp": "2026-07-31T08:30:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "Transaction already exists: TXN-1001",
  "path": "/api/transactions",
  "fieldErrors": {}
}
```

Swagger also provides clickable API testing:

<http://localhost:8080/swagger-ui.html>

## Run backend tests

```bash
./mvnw test
```

The integration tests use an in-memory database and do not modify the Docker
MySQL database.
