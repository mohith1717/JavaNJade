package com.javanjade.Backend.config;

import com.javanjade.Backend.model.BlacklistedAccount;
import com.javanjade.Backend.model.FraudRule;
import com.javanjade.Backend.model.RuleType;
import com.javanjade.Backend.repository.BlacklistedAccountRepository;
import com.javanjade.Backend.repository.FraudRuleRepository;
import java.math.BigDecimal;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataBootstrap {

    @Bean
    CommandLineRunner bootstrapRules(FraudRuleRepository fraudRuleRepository,
                                     BlacklistedAccountRepository blacklistedAccountRepository) {
        return args -> {
            ensureRule(fraudRuleRepository,
                    "High-value transfer",
                    RuleType.HIGH_VALUE_TRANSFER,
                    "Transaction amount > configured threshold",
                    true, 35,
                    new BigDecimal("200000"),
                    null, null, null);

            ensureRule(fraudRuleRepository,
                    "Blacklisted receiver",
                    RuleType.BLACKLISTED_RECEIVER,
                    "Receiver account flagged as blacklisted",
                    true, 50,
                    null,
                    null, null, null);

            ensureRule(fraudRuleRepository,
                    "High frequency",
                    RuleType.HIGH_FREQUENCY,
                    "High transaction count in short time window",
                    true, 25,
                    null,
                    2, 5, null);

            ensureRule(fraudRuleRepository,
                    "Cross-border origin",
                    RuleType.CROSS_BORDER_ORIGIN,
                    "Transfer originating from different country",
                    true, 20,
                    null,
                    null, null, null);

            ensureRule(fraudRuleRepository,
                    "Anomalous credit score",
                    RuleType.ANOMALOUS_CREDIT_SCORE,
                    "Credit score below normal threshold",
                    true, 15,
                    null,
                    600, null, null);

            ensureRule(fraudRuleRepository,
                    "Structuring / smurfing",
                    RuleType.STRUCTURING_SMURFING,
                    "Multiple smaller transactions in a short period",
                    true, 30,
                    new BigDecimal("50000"),
                    30, 4, null);

            ensureRule(fraudRuleRepository,
                    "Consecutive failures",
                    RuleType.CONSECUTIVE_FAILURES,
                    "Consecutive denied transactions detected",
                    true, 25,
                    null,
                    60, 3, null);

            if (!blacklistedAccountRepository.existsByAccountId("BLK-RECV-001")) {
                BlacklistedAccount account = new BlacklistedAccount();
                account.setAccountId("BLK-RECV-001");
                account.setReason("Known mule account");
                blacklistedAccountRepository.save(account);
            }
        };
    }

    private void ensureRule(FraudRuleRepository repository,
                            String name,
                            RuleType type,
                            String description,
                            boolean enabled,
                            int riskWeight,
                            BigDecimal amountThreshold,
                            Integer intThreshold,
                            Integer secondaryIntThreshold,
                            String stringThreshold) {
        repository.findByType(type).orElseGet(() -> {
            FraudRule rule = new FraudRule();
            rule.setName(name);
            rule.setType(type);
            rule.setDescription(description);
            rule.setEnabled(enabled);
            rule.setRiskWeight(riskWeight);
            rule.setAmountThreshold(amountThreshold);
            rule.setIntThreshold(intThreshold);
            rule.setSecondaryIntThreshold(secondaryIntThreshold);
            rule.setStringThreshold(stringThreshold);
            return repository.save(rule);
        });
    }
}
