package com.jadeguard.risk;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;

import com.jadeguard.rule.MonitoringRuleEntity;
import com.jadeguard.rule.RuleType;
import com.jadeguard.transaction.ProcessingStatus;
import com.jadeguard.transaction.TransactionEntity;
import com.jadeguard.transaction.TransactionRepository;
import org.springframework.stereotype.Component;

@Component
public class StructuringRuleEvaluator implements RuleEvaluator {

    private final TransactionRepository transactionRepository;

    public StructuringRuleEvaluator(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @Override
    public RuleType supportedType() {
        return RuleType.STRUCTURING;
    }

    @Override
    public RuleEvaluationResult evaluate(
            MonitoringRuleEntity rule,
            RuleEvaluationContext context
    ) {
        var parameters = rule.getParameters();
        String currency = parameters.get("currency").asText();
        int windowMinutes = parameters.get("windowMinutes").asInt();
        int minimumCount = parameters.get("minimumTransactionCount").asInt();
        BigDecimal individualMaximum = parameters.get("individualMaximum")
                .decimalValue();
        BigDecimal combinedThreshold = parameters.get("combinedThreshold")
                .decimalValue();
        String groupBy = parameters.get("groupBy").asText();
        var current = context.transaction();

        List<TransactionEntity> matchingTransactions = transactionRepository
                .findByCurrencyAndOccurredAtBetween(
                        currency,
                        current.getOccurredAt().minus(
                                windowMinutes,
                                ChronoUnit.MINUTES
                        ),
                        current.getOccurredAt()
                ).stream()
                .filter(candidate -> isRiskEligible(candidate.getProcessingStatus()))
                .filter(candidate -> sameGroup(candidate, current, groupBy))
                .filter(candidate -> candidate.getAmount()
                        .compareTo(individualMaximum) <= 0)
                .toList();

        BigDecimal combinedAmount = matchingTransactions.stream()
                .map(TransactionEntity::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        boolean triggered = matchingTransactions.size() >= minimumCount
                && combinedAmount.compareTo(combinedThreshold) >= 0;

        return new RuleEvaluationResult(
                triggered,
                "Found " + matchingTransactions.size() + " matching "
                        + currency + " transactions totalling " + combinedAmount
                        + " in the configured " + windowMinutes
                        + "-minute window; required count is " + minimumCount
                        + " and combined threshold is " + combinedThreshold + "."
        );
    }

    private boolean sameGroup(
            TransactionEntity candidate,
            TransactionEntity current,
            String groupBy
    ) {
        return switch (groupBy) {
            case "SENDER" -> candidate.getSenderAccountId().equals(
                    current.getSenderAccountId()
            );
            case "RECEIVER" -> candidate.getReceiverAccountId().equals(
                    current.getReceiverAccountId()
            );
            case "SENDER_AND_RECEIVER" ->
                    candidate.getSenderAccountId().equals(
                            current.getSenderAccountId()
                    ) && candidate.getReceiverAccountId().equals(
                            current.getReceiverAccountId()
                    );
            default -> false;
        };
    }

    private boolean isRiskEligible(ProcessingStatus status) {
        return status == ProcessingStatus.VALIDATED
                || status == ProcessingStatus.ASSESSING_RISK
                || status == ProcessingStatus.ASSESSED
                || status == ProcessingStatus.REVIEW_REQUIRED
                || status == ProcessingStatus.APPROVED;
    }
}
