import unittest

import generate


class GeneratorScenarioTests(unittest.TestCase):

    def test_high_risk_country_creates_watchlist_route(self):
        generated = generate.transaction_for(
            "high_risk_country",
            "BATCH001",
            1,
        )
        self.assertEqual(generated.payload["amount"], 250_000.00)
        self.assertIn(
            "MM",
            [hop["countryCode"] for hop in generated.payload["route"]],
        )

    def test_rapid_and_structuring_share_batch_senders(self):
        rapid_one = generate.transaction_for(
            "rapid_transactions", "BATCH001", 1
        )
        rapid_two = generate.transaction_for(
            "rapid_transactions", "BATCH001", 2
        )
        structured = generate.transaction_for(
            "structuring", "BATCH001", 1
        )
        self.assertEqual(
            rapid_one.payload["senderAccountId"],
            rapid_two.payload["senderAccountId"],
        )
        self.assertEqual(structured.payload["amount"], 50_000.00)

    def test_invalid_scenario_rotates_validation_failures(self):
        generated = [
            generate.transaction_for("invalid_transaction", "BATCH001", i)
            for i in range(1, 5)
        ]
        self.assertTrue(any(
            item.payload["senderAccountId"]
            == item.payload["receiverAccountId"]
            for item in generated
        ))
        self.assertTrue(any(
            item.payload["currency"] == "XYZ" for item in generated
        ))
        self.assertTrue(any(
            "ZZ" in [hop["countryCode"] for hop in item.payload["route"]]
            for item in generated
        ))

    def test_argument_validation(self):
        args = generate.parse_args([
            "--scenario", "normal", "--count", "3", "--interval", "0.5"
        ])
        self.assertEqual(args.count, 3)
        self.assertEqual(args.interval, 0.5)


if __name__ == "__main__":
    unittest.main()
