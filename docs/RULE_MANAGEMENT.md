# Rule management

Step 4 lets administrators configure monitoring rules without editing Java
source. It does not evaluate transactions or assign risk scores yet.

## Default rules

Flyway creates these shared defaults so every team member begins with the same
configuration:

| Code | Type | Initial configuration |
|---|---|---|
| `HIGH_AMOUNT_INR` | `HIGH_AMOUNT` | INR greater than 200,000 |
| `ROUTE_COUNTRY_WATCHLIST` | `HIGH_RISK_COUNTRY` | Configured country in any route hop |
| `EXCESSIVE_ROUTE_HOPS` | `EXCESSIVE_ROUTE_HOPS` | More than four hops |
| `RAPID_SENDER_ACTIVITY` | `RAPID_TRANSACTIONS` | More than five transactions in ten minutes |
| `INR_STRUCTURING` | `STRUCTURING` | Split-payment pattern within thirty minutes |

V5 inserts a default only when its code does not already exist, preserving an
administrator's existing configuration. The route-country list is illustrative
project configuration and must not be treated as a live legal sanctions source.

## Endpoints

```text
POST  /api/rules
GET   /api/rules
GET   /api/rules/{ruleId}
PUT   /api/rules/{ruleId}
PATCH /api/rules/{ruleId}/status
```

The list endpoint supports:

```text
GET /api/rules?type=HIGH_AMOUNT
GET /api/rules?enabled=true
GET /api/rules?type=HIGH_RISK_COUNTRY&enabled=true
```

Disable a rule without replacing its configuration:

```json
{
  "enabled": false
}
```

## Supported rule configurations

### High amount

```json
{
  "code": "HIGH_AMOUNT_INR",
  "name": "High-value INR transfer",
  "type": "HIGH_AMOUNT",
  "enabled": true,
  "severity": "HIGH",
  "riskWeight": 35,
  "parameters": {
    "currency": "INR",
    "threshold": 200000
  }
}
```

### Country anywhere in the route

```json
{
  "code": "ROUTE_COUNTRY_WATCHLIST",
  "name": "Configured country in payment route",
  "type": "HIGH_RISK_COUNTRY",
  "enabled": true,
  "severity": "HIGH",
  "riskWeight": 40,
  "parameters": {
    "countryCodes": ["KP", "MM"],
    "match": "ANY_ROUTE_HOP"
  }
}
```

`match` may be `ANY_ROUTE_HOP`, `ORIGIN_ONLY`, `INTERMEDIARY_ONLY`, or
`DESTINATION_ONLY`. The configured list is project data, not a claim that every
listed jurisdiction has the same legal classification.

### Excessive route hops

```json
{
  "code": "EXCESSIVE_ROUTE_HOPS",
  "name": "More than four route hops",
  "type": "EXCESSIVE_ROUTE_HOPS",
  "enabled": true,
  "severity": "MEDIUM",
  "riskWeight": 15,
  "parameters": {
    "maximumHops": 4
  }
}
```

### Rapid transactions

```json
{
  "code": "RAPID_SENDER_ACTIVITY",
  "name": "Too many sender transactions in ten minutes",
  "type": "RAPID_TRANSACTIONS",
  "enabled": true,
  "severity": "HIGH",
  "riskWeight": 25,
  "parameters": {
    "windowMinutes": 10,
    "maximumTransactions": 5
  }
}
```

### Basic structuring

```json
{
  "code": "INR_STRUCTURING",
  "name": "Possible split INR payments",
  "type": "STRUCTURING",
  "enabled": true,
  "severity": "HIGH",
  "riskWeight": 45,
  "parameters": {
    "currency": "INR",
    "windowMinutes": 30,
    "individualMaximum": 50000,
    "combinedThreshold": 200000,
    "minimumTransactionCount": 4,
    "groupBy": "SENDER"
  }
}
```

`groupBy` may be `SENDER`, `SENDER_AND_RECEIVER`, or `RECEIVER`.

## Risk evaluation

The rule engine loads enabled rules, selects the evaluator matching each
`type`, uses the stored `parameters`, and records both triggered and
non-triggered results. Only triggered rules contribute their configured weight.
The total is capped at 100 and mapped to `LOW` (0–29), `MEDIUM` (30–59), `HIGH`
(60–79), or `CRITICAL` (80–100).

Valid transactions move through `VALIDATED`, `ASSESSING_RISK`, and `ASSESSED`.
Use `GET /api/transactions/{transactionId}/risk-assessment` for the complete
score explanation. Disabling a rule prevents future evaluations; it does not
rewrite historical results.
