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
python generate.py --scenario high_amount --count 1
python generate.py --scenario high_risk_country --count 1
python generate.py --scenario multiple_countries --count 1
python generate.py --scenario rapid_transactions --count 6
python generate.py --scenario structuring --count 4
python generate.py --scenario invalid_transaction --count 4
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
| `high_amount` | High-amount contribution, normally MEDIUM |
| `high_risk_country` | High amount plus MM route, HIGH and alert |
| `multiple_countries` | Five hops trigger excessive-route rule |
| `rapid_transactions` | Sixth same-sender transfer triggers rapid activity |
| `structuring` | Fourth INR 50,000 transfer reaches INR 200,000 |
| `blacklisted_account` | Uses `ACC-WATCHLIST-DEMO` plus a high amount; add the account through the Admin watchlist API first |
| `invalid_transaction` | Rotates through four validation failures |
| `mixed` | Seedable random selection of all scenarios |

Results depend on the currently enabled and configured monitoring rules. Each
submitted transaction prints its external ID, HTTP and processing status,
validation result, risk score/level, and generated alert ID. A final summary
shows totals by outcome.
