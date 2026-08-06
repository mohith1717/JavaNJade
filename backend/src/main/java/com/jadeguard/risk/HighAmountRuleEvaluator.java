package com.jadeguard.risk;

import java.math.BigDecimal;

import com.jadeguard.rule.MonitoringRuleEntity;
import com.jadeguard.rule.RuleType;
import org.springframework.stereotype.Component;

@Component
public class HighAmountRuleEvaluator implements RuleEvaluator {

    @Override
    public RuleType supportedType() {
        return RuleType.HIGH_AMOUNT;
    }

    @Override
    public RuleEvaluationResult evaluate(
            MonitoringRuleEntity rule,
            RuleEvaluationContext context
    ) {
        String configuredCurrency = rule.getParameters()
                .get("currency").asText();
        BigDecimal threshold = rule.getParameters()
                .get("threshold").decimalValue();
        var transaction = context.transaction();
        boolean currencyMatches = configuredCurrency.equals(
                transaction.getCurrency()
        );
        boolean triggered = currencyMatches
                && transaction.getAmount().compareTo(threshold) > 0;

        String explanation = triggered
                ? "Transaction amount " + transaction.getCurrency() + " "
                        + transaction.getAmount() + " exceeded threshold "
                        + configuredCurrency + " " + threshold + "."
                : "Transaction amount or currency did not exceed the configured "
                        + configuredCurrency + " " + threshold + " threshold.";
        return new RuleEvaluationResult(triggered, explanation);
    }
}
