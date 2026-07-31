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
GET  http://localhost:8080/api/transactions/{transactionId}
POST http://localhost:8080/api/transactions
```

Use this JSON body for the POST request:

```json
{
  "externalTransactionId": "TXN-1001",
  "senderAccountId": "ACC-001",
  "receiverAccountId": "ACC-002",
  "amount": 5000,
  "currency": "INR",
  "occurredAt": "2026-07-30T08:30:00Z"
}
```

The POST response contains an `id`. Copy that value into the final GET URL,
without the `{}` characters.

Swagger also provides clickable API testing:

<http://localhost:8080/swagger-ui.html>
