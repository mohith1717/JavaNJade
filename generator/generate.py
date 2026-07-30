#!/usr/bin/env python3
"""Scenario-based transaction generator for the JadeGuard ingestion API."""

import argparse
import os
import sys
from datetime import datetime, timezone
from uuid import uuid4

import requests


SCENARIOS = {
    "normal": {
        "amount": 5_000.00,
        "receiverAccountId": "ACC-900",
    },
    "high_amount": {
        "amount": 250_000.00,
        "receiverAccountId": "ACC-901",
    },
}


def transaction_for(scenario_name: str) -> dict:
    scenario = SCENARIOS[scenario_name]
    return {
        "externalTransactionId": f"TXN-{uuid4().hex[:12].upper()}",
        "senderAccountId": "ACC-001",
        "receiverAccountId": scenario["receiverAccountId"],
        "amount": scenario["amount"],
        "currency": "INR",
        "occurredAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "route": [
            {
                "sequence": 1,
                "countryCode": "IN",
                "institution": "Origin Bank",
            },
            {
                "sequence": 2,
                "countryCode": "AE",
                "institution": "Intermediary Bank",
            },
            {
                "sequence": 3,
                "countryCode": "GB",
                "institution": "Destination Bank",
            },
        ],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("scenario", choices=SCENARIOS, help="Scenario to submit")
    parser.add_argument(
        "--api-url",
        default=os.getenv("JADEGUARD_API_URL", "http://localhost:8080/api/v1"),
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the generated transaction without sending it",
    )
    args = parser.parse_args()

    transaction = transaction_for(args.scenario)
    if args.dry_run:
        print(transaction)
        return 0

    try:
        response = requests.post(
            f"{args.api_url}/transactions",
            json=transaction,
            timeout=10,
        )
        response.raise_for_status()
    except requests.RequestException as error:
        print(f"Transaction submission failed: {error}", file=sys.stderr)
        return 1

    print(response.json())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
