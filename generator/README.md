# JadeGuard Transaction Generator

The generator owns test scenarios but communicates with the backend only through
the public transaction API.

```bash
cd generator
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

python generate.py normal --dry-run
python generate.py high_amount --dry-run
python generate.py unsupported_currency --dry-run
python generate.py same_account --dry-run
python generate.py invalid_country --dry-run
python generate.py invalid_route_sequence --dry-run
```

With the backend running, submit scenarios by removing `--dry-run`:

```bash
python generate.py normal
python generate.py high_amount
python generate.py unsupported_currency
python generate.py same_account
python generate.py invalid_country
python generate.py invalid_route_sequence
```

The generator sends transactions and their country routes to
`POST /api/transactions`.

- `normal` and `high_amount` finish as `VALIDATED` and are ready for the future
  rule engine. A high amount is a risk signal, not a validation failure.
- The other scenarios finish as `VALIDATION_FAILED`, and their explanations are
  available from the validation-error endpoints.
