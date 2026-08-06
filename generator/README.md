# JadeGuard Transaction Generator

The generator creates authenticated, scenario-based transactions through the
same backend API used by other clients. It can populate dashboards, alert
queues, country flows, and reports with realistic development data.

## Setup

```bash
cd generator
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Start the backend before sending transactions. The development defaults are:

```text
JADEGUARD_API_URL=http://localhost:8080/api
JADEGUARD_GENERATOR_USERNAME=risk1
JADEGUARD_GENERATOR_PASSWORD=JadeGuardRisk1!
```

Override them with environment variables or `--api-url`, `--username`, and
`--password`. The documented credentials are for local development only.

## Commands

```bash
python generate.py --scenario normal --count 10
python generate.py --scenario domestic --count 5
python generate.py --scenario cross_border --count 10
python generate.py --scenario multi_currency --count 10
python generate.py --scenario high_amount --count 1
python generate.py --scenario high_risk_country --count 1
python generate.py --scenario high_risk_origin --count 2
python generate.py --scenario high_risk_intermediary --count 2
python generate.py --scenario compound_critical --count 1
python generate.py --scenario multiple_countries --count 1
python generate.py --scenario excessive_route --count 4
python generate.py --scenario rapid_transactions --count 6
python generate.py --scenario structuring --count 4
python generate.py --scenario blacklisted_account --count 1
python generate.py --scenario blacklisted_receiver --count 1
python generate.py --scenario invalid_transaction --count 6
python generate.py --scenario demo --count 22 --interval 0.25
python generate.py --scenario mixed --count 100 --interval 2
```

Preview payloads without authentication or network calls:

```bash
python generate.py --scenario mixed --count 5 --seed 42 --dry-run
```

## Scenario expectations

| Scenario | Expected behavior with default rules |
| --- | --- |
| `normal` | Valid, LOW, no alert |
| `domestic` | Valid INR route within India, normally LOW |
| `cross_border` | Rotates through realistic three-country routes |
| `multi_currency` | Rotates INR, USD, EUR, GBP and AED transactions |
| `high_amount` | High-amount contribution, normally MEDIUM |
| `high_risk_country` | High amount plus MM/KP route, HIGH and alert |
| `high_risk_origin` | MM/KP is the route origin |
| `high_risk_intermediary` | MM/KP appears as an intermediary hop |
| `compound_critical` | High amount + MM + five hops produces a 90-point CRITICAL alert |
| `multiple_countries` | Five hops trigger excessive-route rule |
| `excessive_route` | Rotates realistic five/six-hop international routes |
| `rapid_transactions` | Sixth same-sender transfer triggers rapid activity |
| `structuring` | Fourth INR 50,000 transfer reaches INR 200,000 |
| `blacklisted_account` | Uses `ACC-WATCHLIST-DEMO` plus a high amount; add the account through the Admin watchlist API first |
| `blacklisted_receiver` | Uses the demo watchlisted account as beneficiary |
| `invalid_transaction` | Rotates through six persisted validation failures |
| `demo` | Deterministic 22-case presentation dataset covering the full pipeline |
| `mixed` | Seedable random selection of all scenarios |

Routes now cover India, the UK, US, Canada, UAE, Germany, Netherlands, France,
Spain, Japan, Singapore, Australia, New Zealand, Brazil, Portugal, South
Africa, Kenya, Ireland, Hong Kong, Iceland, Norway, Sweden, Finland, Malaysia,
Thailand, Turkey, Myanmar and North Korea. Myanmar (`MM`) and North Korea
(`KP`) are the countries configured by the default route-watchlist rule.

`RECEIVED`, `VALIDATING`, `VALIDATED`, and `ASSESSING_RISK` are synchronous
processing stages. They are intentionally not left behind as permanent demo
records; successful requests commit as `ASSESSED`, while invalid requests
commit as `VALIDATION_FAILED`.

Results depend on the currently enabled and configured monitoring rules. Each
submitted transaction prints its external ID, HTTP and processing status,
validation result, risk score/level, and generated alert ID. A final summary
shows totals by outcome.
