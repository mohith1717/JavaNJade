#!/usr/bin/env python3
"""Generate authenticated JadeGuard transaction scenarios."""

import argparse
import json
import os
import random
import sys
import time
from collections import Counter
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

import requests


SCENARIOS = (
    "normal",
    "domestic",
    "cross_border",
    "multi_currency",
    "high_amount",
    "high_risk_country",
    "high_risk_origin",
    "high_risk_intermediary",
    "compound_critical",
    "multiple_countries",
    "excessive_route",
    "rapid_transactions",
    "structuring",
    "blacklisted_account",
    "blacklisted_receiver",
    "invalid_transaction",
    "demo",
    "mixed",
)

INVALID_VARIANTS = (
    "same_account",
    "unsupported_currency",
    "invalid_country",
    "invalid_route_sequence",
    "duplicate_route_sequence",
    "missing_destination",
)

MIXED_SCENARIOS = tuple(
    scenario for scenario in SCENARIOS if scenario not in {"demo", "mixed"}
)

DEMO_SCENARIOS = (
    "normal",
    "domestic",
    "cross_border",
    "multi_currency",
    "high_amount",
    "high_risk_origin",
    "high_risk_intermediary",
    "compound_critical",
    "excessive_route",
    "rapid_transactions",
    "rapid_transactions",
    "rapid_transactions",
    "rapid_transactions",
    "rapid_transactions",
    "rapid_transactions",
    "structuring",
    "structuring",
    "structuring",
    "structuring",
    "blacklisted_account",
    "blacklisted_receiver",
    "invalid_transaction",
)

NORMAL_ROUTES = (
    ("IN", "GB"),
    ("US", "CA"),
    ("DE", "NL"),
    ("FR", "ES"),
    ("JP", "SG"),
    ("AU", "NZ"),
    ("BR", "PT"),
    ("ZA", "KE"),
)

CROSS_BORDER_ROUTES = (
    ("IN", "AE", "GB"),
    ("US", "IE", "DE"),
    ("SG", "HK", "JP"),
    ("BR", "US", "CA"),
    ("ZA", "KE", "AE"),
    ("AU", "SG", "IN"),
)

SUPPORTED_CURRENCY_CASES = (
    ("INR", ("IN", "AE", "GB"), 18_500.00),
    ("USD", ("US", "CA"), 7_250.00),
    ("EUR", ("DE", "NL", "FR"), 6_800.00),
    ("GBP", ("GB", "IE"), 5_900.00),
    ("AED", ("AE", "IN"), 21_000.00),
)

HIGH_RISK_ROUTES = (
    ("IN", "AE", "MM", "GB"),
    ("US", "SG", "KP", "JP"),
    ("DE", "TR", "MM", "AE"),
    ("AU", "SG", "KP", "IN"),
)

EXCESSIVE_ROUTES = (
    ("IN", "AE", "TR", "DE", "GB"),
    ("US", "CA", "IS", "NO", "SE", "FI"),
    ("BR", "PT", "ES", "FR", "NL", "DE"),
    ("AU", "SG", "MY", "TH", "IN", "AE"),
)


@dataclass(frozen=True)
class GeneratedTransaction:
    scenario: str
    payload: dict[str, Any]


@dataclass
class GenerationSummary:
    requested: int = 0
    created: int = 0
    validation_failed: int = 0
    alerts_created: int = 0
    http_failures: int = 0
    risk_levels: Counter[str] = None

    def __post_init__(self) -> None:
        if self.risk_levels is None:
            self.risk_levels = Counter()


def route(*countries: str) -> list[dict[str, Any]]:
    return [
        {
            "sequence": index,
            "countryCode": country,
            "institution": f"{country} Scenario Bank {index}",
        }
        for index, country in enumerate(countries, start=1)
    ]


def transaction_for(
    scenario_name: str,
    batch_id: str,
    index: int,
) -> GeneratedTransaction:
    selected = scenario_name
    invalid_variant = None
    if selected == "invalid_transaction":
        invalid_variant = INVALID_VARIANTS[index % len(INVALID_VARIANTS)]

    sender = f"ACC-{batch_id}-{index:04d}"
    receiver = f"ACC-DEST-{batch_id}-{index:04d}"
    amount = 5_000.00
    currency = "INR"
    transaction_route = route(*NORMAL_ROUTES[index % len(NORMAL_ROUTES)])

    if selected == "domestic":
        transaction_route = route("IN", "IN")
        amount = 12_500.00
    elif selected == "cross_border":
        transaction_route = route(
            *CROSS_BORDER_ROUTES[index % len(CROSS_BORDER_ROUTES)]
        )
    elif selected == "multi_currency":
        currency, selected_route, amount = SUPPORTED_CURRENCY_CASES[
            index % len(SUPPORTED_CURRENCY_CASES)
        ]
        transaction_route = route(*selected_route)
    elif selected == "high_amount":
        amount = 250_000.00
    elif selected == "high_risk_country":
        # Amount plus watchlist country produces a HIGH score and an alert
        # with the current default rules.
        amount = 250_000.00
        transaction_route = route(
            *HIGH_RISK_ROUTES[index % len(HIGH_RISK_ROUTES)]
        )
    elif selected == "high_risk_origin":
        amount = 250_000.00
        transaction_route = route(
            "MM" if index % 2 else "KP", "SG", "IN"
        )
    elif selected == "high_risk_intermediary":
        amount = 250_000.00
        transaction_route = route(
            "IN", "MM" if index % 2 else "KP", "AE", "GB"
        )
    elif selected == "compound_critical":
        # High amount (35) + watched country (40) + excessive hops (15) = 90.
        amount = 250_000.00
        transaction_route = route("IN", "AE", "MM", "DE", "GB")
    elif selected == "multiple_countries":
        transaction_route = route("IN", "AE", "DE", "FR", "GB")
    elif selected == "excessive_route":
        transaction_route = route(
            *EXCESSIVE_ROUTES[index % len(EXCESSIVE_ROUTES)]
        )
    elif selected == "rapid_transactions":
        sender = f"ACC-RAPID-{batch_id}"
    elif selected == "structuring":
        sender = f"ACC-STRUCT-{batch_id}"
        amount = 50_000.00
    elif selected == "blacklisted_account":
        sender = "ACC-WATCHLIST-DEMO"
        amount = 250_000.00
    elif selected == "blacklisted_receiver":
        receiver = "ACC-WATCHLIST-DEMO"
        amount = 75_000.00
    elif invalid_variant == "same_account":
        receiver = sender
    elif invalid_variant == "unsupported_currency":
        currency = "XYZ"
    elif invalid_variant == "invalid_country":
        transaction_route = route("IN", "ZZ")
    elif invalid_variant == "invalid_route_sequence":
        transaction_route = [
            {
                "sequence": 1,
                "countryCode": "IN",
                "institution": "Origin Bank",
            },
            {
                "sequence": 3,
                "countryCode": "GB",
                "institution": "Destination Bank",
            },
        ]
    elif invalid_variant == "duplicate_route_sequence":
        transaction_route = [
            {
                "sequence": 1,
                "countryCode": "IN",
                "institution": "Origin Bank",
            },
            {
                "sequence": 1,
                "countryCode": "AE",
                "institution": "Duplicate Sequence Bank",
            },
        ]
    elif invalid_variant == "missing_destination":
        transaction_route = route("IN")

    external_id = f"TXN-{batch_id}-{index:04d}-{uuid4().hex[:6].upper()}"
    payload = {
        "externalTransactionId": external_id,
        "senderAccountId": sender,
        "receiverAccountId": receiver,
        "amount": amount,
        "currency": currency,
        "occurredAt": datetime.now(timezone.utc)
        .isoformat()
        .replace("+00:00", "Z"),
        "route": transaction_route,
    }
    display_scenario = (
        f"invalid_transaction/{invalid_variant}"
        if invalid_variant
        else selected
    )
    return GeneratedTransaction(display_scenario, payload)


class JadeGuardClient:
    def __init__(
        self,
        api_url: str,
        username: str,
        password: str,
        timeout: float = 10,
    ) -> None:
        self.api_url = api_url.rstrip("/")
        self.username = username
        self.password = password
        self.timeout = timeout
        self.session = requests.Session()

    def login(self) -> None:
        response = self.session.post(
            f"{self.api_url}/auth/login",
            json={
                "usernameOrEmail": self.username,
                "password": self.password,
            },
            timeout=self.timeout,
        )
        response.raise_for_status()
        access_token = response.json()["accessToken"]
        self.session.headers.update(
            {"Authorization": f"Bearer {access_token}"}
        )

    def submit(self, payload: dict[str, Any]) -> requests.Response:
        return self.session.post(
            f"{self.api_url}/transactions",
            json=payload,
            timeout=self.timeout,
        )

    def alert_id_for(self, transaction_id: str) -> str | None:
        response = self.session.get(
            f"{self.api_url}/alerts",
            params={"transactionId": transaction_id},
            timeout=self.timeout,
        )
        response.raise_for_status()
        alerts = response.json()
        return alerts[0]["id"] if alerts else None


def print_result(
    generated: GeneratedTransaction,
    http_status: int,
    response_body: dict[str, Any] | None,
    alert_id: str | None,
) -> None:
    payload = generated.payload
    print(f"Scenario: {generated.scenario}")
    print(f"External transaction ID: {payload['externalTransactionId']}")
    print("Route: " + " → ".join(
        hop["countryCode"] for hop in payload["route"]
    ))
    print(f"HTTP status: {http_status}")
    if response_body is None or http_status >= 400:
        print("Validation status: UNKNOWN")
        print("Risk score: null")
        print("Risk level: UNKNOWN")
        if response_body and response_body.get("message"):
            print(f"API error: {response_body['message']}")
    else:
        processing_status = response_body.get("processingStatus", "UNKNOWN")
        validation_status = (
            "VALIDATION_FAILED"
            if processing_status == "VALIDATION_FAILED"
            else "VALIDATED"
        )
        risk_score = response_body.get("riskScore")
        print(f"Processing status: {processing_status}")
        print(f"Validation status: {validation_status}")
        print(f"Risk score: {risk_score if risk_score is not None else 'null'}")
        print(f"Risk level: {response_body.get('riskLevel', 'UNKNOWN')}")
    print(f"Generated alert ID: {alert_id or 'none'}")
    print("-" * 60)


def print_summary(summary: GenerationSummary) -> None:
    print("Generation complete")
    print(f"Requested: {summary.requested}")
    print(f"Created: {summary.created}")
    print(f"Validation failed: {summary.validation_failed}")
    for risk_level in ("PENDING", "LOW", "MEDIUM", "HIGH", "CRITICAL"):
        print(f"{risk_level}: {summary.risk_levels[risk_level]}")
    print(f"Alerts created: {summary.alerts_created}")
    print(f"HTTP failures: {summary.http_failures}")


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scenario", required=True, choices=SCENARIOS)
    parser.add_argument("--count", type=int, default=1)
    parser.add_argument("--interval", type=float, default=0)
    parser.add_argument("--seed", type=int)
    parser.add_argument(
        "--api-url",
        default=os.getenv(
            "JADEGUARD_API_URL",
            "http://localhost:8080/api",
        ),
    )
    parser.add_argument(
        "--username",
        default=os.getenv("JADEGUARD_GENERATOR_USERNAME", "risk1"),
    )
    parser.add_argument(
        "--password",
        default=os.getenv(
            "JADEGUARD_GENERATOR_PASSWORD",
            "JadeGuardRisk1!",
        ),
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print payloads without logging in or sending requests",
    )
    args = parser.parse_args(argv)
    if args.count < 1:
        parser.error("--count must be at least 1")
    if args.interval < 0:
        parser.error("--interval cannot be negative")
    return args


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    random_generator = random.Random(args.seed)
    batch_id = uuid4().hex[:8].upper()
    generated_transactions = []
    for index in range(1, args.count + 1):
        selected = args.scenario
        if selected == "mixed":
            selected = random_generator.choice(MIXED_SCENARIOS)
        elif selected == "demo":
            selected = DEMO_SCENARIOS[(index - 1) % len(DEMO_SCENARIOS)]
        generated_transactions.append(
            transaction_for(selected, batch_id, index)
        )

    if args.scenario == "rapid_transactions" and args.count < 6:
        print(
            "Note: use --count 6 or more to trigger the default rapid rule.",
            file=sys.stderr,
        )
    if args.scenario == "structuring" and args.count < 4:
        print(
            "Note: use --count 4 or more to trigger the default structuring rule.",
            file=sys.stderr,
        )

    if args.dry_run:
        for generated in generated_transactions:
            print(json.dumps(generated.payload, indent=2))
        return 0

    client = JadeGuardClient(
        args.api_url,
        args.username,
        args.password,
    )
    try:
        client.login()
    except (requests.RequestException, KeyError, ValueError) as error:
        print(f"Generator login failed: {error}", file=sys.stderr)
        return 1

    summary = GenerationSummary(requested=args.count)
    for index, generated in enumerate(generated_transactions, start=1):
        response_body = None
        alert_id = None
        try:
            response = client.submit(generated.payload)
            try:
                response_body = response.json()
            except ValueError:
                response_body = None

            if response.ok and response_body is not None:
                summary.created += 1
                processing_status = response_body.get("processingStatus")
                risk_level = response_body.get("riskLevel", "UNKNOWN")
                summary.risk_levels[risk_level] += 1
                if processing_status == "VALIDATION_FAILED":
                    summary.validation_failed += 1
                transaction_id = response_body.get("id")
                if transaction_id:
                    try:
                        alert_id = client.alert_id_for(transaction_id)
                        if alert_id:
                            summary.alerts_created += 1
                    except requests.RequestException as error:
                        summary.http_failures += 1
                        print(
                            f"Alert lookup failed: {error}",
                            file=sys.stderr,
                        )
            else:
                summary.http_failures += 1
            print_result(
                generated,
                response.status_code,
                response_body,
                alert_id,
            )
        except requests.RequestException as error:
            summary.http_failures += 1
            print_result(generated, 0, None, None)
            print(f"Request failed: {error}", file=sys.stderr)

        if args.interval and index < args.count:
            time.sleep(args.interval)

    print_summary(summary)
    return 0 if summary.http_failures == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
