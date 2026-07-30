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
```

Remove `--dry-run` after the backend transaction endpoint is implemented.
