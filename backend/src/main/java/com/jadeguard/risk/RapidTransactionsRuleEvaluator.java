package com.jadeguard.risk;

import java.time.temporal.ChronoUnit;

import com.jadeguard.rule.MonitoringRuleEntity;
import com.jadeguard.rule.RuleType;
import com.jadeguard.transaction.ProcessingStatus;
import com.jadeguard.transaction.TransactionRepository;
import org.springframework.stereotype.Component;

@Component
public class RapidTransactionsRuleEvaluator implements RuleEvaluator {

    private final TransactionRepository transactionRepository;

    public RapidTransactionsRuleEvaluator(
            TransactionRepository transactionRepository
    ) {
        this.transactionRepository = transactionRepository;
    }

    @Override
    public RuleType supportedType() {
        return RuleType.RAPID_TRANSACTIONS;
    }

    @Override
    public RuleEvaluationResult evaluate(
            MonitoringRuleEntity rule,
            RuleEvaluationContext context
    ) {
        int windowMinutes = rule.getParameters().get("windowMinutes").asInt();
        int maximum = rule.getParameters().get("maximumTransactions").asInt();
        var transaction = context.transaction();
        long count = transactionRepository
                .findBySenderAccountIdAndOccurredAtBetween(
                        transaction.getSenderAccountId(),
                        transaction.getOccurredAt().minus(
                                windowMinutes,
                                ChronoUnit.MINUTES
                        ),
                        transaction.getOccurredAt()
                ).stream()
                .filter(candidate -> isRiskEligible(
                        candidate.getProcessingStatus()
                ))
                .count();
        boolean triggered = count > maximum;
        return new RuleEvaluationResult(
                triggered,
                "Sender " + transaction.getSenderAccountId() + " had "
                        + count + " transactions in the configured "
                        + windowMinutes + "-minute window; maximum is "
                        + maximum + "."
        );
    }

    private boolean isRiskEligible(ProcessingStatus status) {
        return status == ProcessingStatus.VALIDATED
                || status == ProcessingStatus.ASSESSING_RISK
                || status == ProcessingStatus.ASSESSED
                || status == ProcessingStatus.REVIEW_REQUIRED
                || status == ProcessingStatus.APPROVED;
    }
}
