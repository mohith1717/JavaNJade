import unittest

import generate


class GeneratorScenarioTests(unittest.TestCase):
    def test_blacklisted_scenario_uses_demo_account_and_high_amount(self):
        generated = generate.transaction_for("blacklisted_account", "BATCH", 0)
        self.assertEqual("ACC-WATCHLIST-DEMO", generated.payload["senderAccountId"])
        self.assertEqual(250_000.00, generated.payload["amount"])


    def test_high_risk_country_creates_watchlist_route(self):
        generated = generate.transaction_for(
            "high_risk_country",
            "BATCH001",
            1,
        )
        self.assertEqual(generated.payload["amount"], 250_000.00)
        countries = [hop["countryCode"] for hop in generated.payload["route"]]
        self.assertTrue({"MM", "KP"}.intersection(countries))

    def test_multi_currency_rotates_supported_currency_and_geography(self):
        generated = [
            generate.transaction_for("multi_currency", "BATCH001", index)
            for index in range(5)
        ]
        self.assertEqual(
            {"INR", "USD", "EUR", "GBP", "AED"},
            {item.payload["currency"] for item in generated},
        )
        self.assertGreaterEqual(len({
            hop["countryCode"]
            for item in generated
            for hop in item.payload["route"]
        }), 8)

    def test_high_risk_origin_and_intermediary_place_watchlist_correctly(self):
        origin = generate.transaction_for("high_risk_origin", "BATCH001", 1)
        intermediary = generate.transaction_for(
            "high_risk_intermediary", "BATCH001", 1
        )
        self.assertIn(origin.payload["route"][0]["countryCode"], {"MM", "KP"})
        self.assertIn(
            intermediary.payload["route"][1]["countryCode"], {"MM", "KP"}
        )

    def test_excessive_routes_have_more_than_four_hops(self):
        generated = generate.transaction_for("excessive_route", "BATCH001", 1)
        self.assertGreater(len(generated.payload["route"]), 4)

    def test_compound_critical_combines_three_default_rule_signals(self):
        generated = generate.transaction_for(
            "compound_critical", "BATCH001", 1
        )
        countries = [hop["countryCode"] for hop in generated.payload["route"]]
        self.assertEqual(250_000.00, generated.payload["amount"])
        self.assertIn("MM", countries)
        self.assertGreater(len(countries), 4)

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
            for i in range(6)
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
        self.assertTrue(any(len(item.payload["route"]) == 1 for item in generated))

    def test_argument_validation(self):
        args = generate.parse_args([
            "--scenario", "normal", "--count", "3", "--interval", "0.5"
        ])
        self.assertEqual(args.count, 3)
        self.assertEqual(args.interval, 0.5)

    def test_demo_plan_contains_all_major_case_families(self):
        self.assertIn("normal", generate.DEMO_SCENARIOS)
        self.assertIn("high_risk_intermediary", generate.DEMO_SCENARIOS)
        self.assertIn("compound_critical", generate.DEMO_SCENARIOS)
        self.assertEqual(
            6,
            generate.DEMO_SCENARIOS.count("rapid_transactions"),
        )
        self.assertEqual(4, generate.DEMO_SCENARIOS.count("structuring"))
        self.assertIn("invalid_transaction", generate.DEMO_SCENARIOS)


if __name__ == "__main__":
    unittest.main()
