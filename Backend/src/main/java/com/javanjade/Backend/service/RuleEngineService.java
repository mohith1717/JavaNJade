package com.javanjade.Backend.service;

import com.javanjade.Backend.dto.TransactionProcessRequest;
import com.javanjade.Backend.model.FraudRule;
import com.javanjade.Backend.model.RuleType;
import com.javanjade.Backend.repository.FraudRuleRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class RuleEngineService {

    private final FraudRuleRepository fraudRuleRepository;
    private final ValidationService validationService;

    public RuleEngineService(FraudRuleRepository fraudRuleRepository, ValidationService validationService) {
        this.fraudRuleRepository = fraudRuleRepository;
        this.validationService = validationService;
    }

    public List<TriggeredRule> evaluate(TransactionProcessRequest request) {
        List<TriggeredRule> triggered = new ArrayList<>();
        List<FraudRule> rules = fraudRuleRepository.findAll().stream().filter(FraudRule::isEnabled).toList();

        for (FraudRule rule : rules) {
            switch (rule.getType()) {
                case HIGH_VALUE_TRANSFER -> evaluateHighValue(rule, request, triggered);
                case BLACKLISTED_RECEIVER -> evaluateBlacklistedReceiver(rule, request, triggered);
                case HIGH_FREQUENCY -> evaluateHighFrequency(rule, request, triggered);
                case CROSS_BORDER_ORIGIN -> evaluateCrossBorder(rule, request, triggered);
                case ANOMALOUS_CREDIT_SCORE -> evaluateCreditScore(rule, request, triggered);
                case STRUCTURING_SMURFING -> evaluateStructuring(rule, request, triggered);
                case CONSECUTIVE_FAILURES -> evaluateConsecutiveFailures(rule, request, triggered);
            }
        }

        return triggered;
    }

    private void evaluateHighValue(FraudRule rule, TransactionProcessRequest request, List<TriggeredRule> triggered) {
        BigDecimal threshold = rule.getAmountThreshold() == null ? new BigDecimal("200000") : rule.getAmountThreshold();
        if (request.amount().compareTo(threshold) > 0) {
            triggered.add(new TriggeredRule(rule.getName(),
                    "Amount " + request.amount() + " exceeds threshold " + threshold,
                    rule.getRiskWeight()));
        }
    }

    private void evaluateBlacklistedReceiver(FraudRule rule, TransactionProcessRequest request, List<TriggeredRule> triggered) {
        if (validationService.isReceiverBlacklisted(request.receiverAccountId())) {
            triggered.add(new TriggeredRule(rule.getName(),
                    "Receiver account is blacklisted",
                    rule.getRiskWeight()));
        }
    }

    private void evaluateHighFrequency(FraudRule rule, TransactionProcessRequest request, List<TriggeredRule> triggered) {
        int windowMinutes = rule.getIntThreshold() == null ? 2 : rule.getIntThreshold();
        int frequencyThreshold = rule.getSecondaryIntThreshold() == null ? 5 : rule.getSecondaryIntThreshold();
        long recentCount = validationService.countRecentTransactionsForSender(request.senderAccountId(), windowMinutes);
        if (recentCount >= frequencyThreshold) {
            triggered.add(new TriggeredRule(rule.getName(),
                    "High frequency detected: " + recentCount + " txns in " + windowMinutes + " minutes",
                    rule.getRiskWeight()));
        }
    }

    private void evaluateCrossBorder(FraudRule rule, TransactionProcessRequest request, List<TriggeredRule> triggered) {
        if (!request.senderCountry().equalsIgnoreCase(request.receiverCountry())) {
            triggered.add(new TriggeredRule(rule.getName(),
                    "Cross-border transfer from " + request.senderCountry() + " to " + request.receiverCountry(),
                    rule.getRiskWeight()));
        }
    }

    private void evaluateCreditScore(FraudRule rule, TransactionProcessRequest request, List<TriggeredRule> triggered) {
        int threshold = rule.getIntThreshold() == null ? 600 : rule.getIntThreshold();
        Integer creditScore = request.creditScore();
        if (creditScore != null && creditScore < threshold) {
            triggered.add(new TriggeredRule(rule.getName(),
                    "Credit score " + creditScore + " below threshold " + threshold,
                    rule.getRiskWeight()));
        }
    }

    private void evaluateStructuring(FraudRule rule, TransactionProcessRequest request, List<TriggeredRule> triggered) {
        BigDecimal smallTxnThreshold = rule.getAmountThreshold() == null ? new BigDecimal("50000") : rule.getAmountThreshold();
        int windowMinutes = rule.getIntThreshold() == null ? 30 : rule.getIntThreshold();
        int countThreshold = rule.getSecondaryIntThreshold() == null ? 4 : rule.getSecondaryIntThreshold();
        long smallTxnCount = validationService.countRecentPotentialStructuring(
                request.senderAccountId(), smallTxnThreshold, windowMinutes);

        if (request.amount().compareTo(smallTxnThreshold) <= 0 && smallTxnCount >= countThreshold) {
            triggered.add(new TriggeredRule(rule.getName(),
                    "Potential structuring: " + smallTxnCount + " small txns in " + windowMinutes + " minutes",
                    rule.getRiskWeight()));
        }
    }

    private void evaluateConsecutiveFailures(FraudRule rule, TransactionProcessRequest request, List<TriggeredRule> triggered) {
        int windowMinutes = rule.getIntThreshold() == null ? 60 : rule.getIntThreshold();
        int threshold = rule.getSecondaryIntThreshold() == null ? 3 : rule.getSecondaryIntThreshold();
        long deniedCount = validationService.countRecentDeniedForSender(request.senderAccountId(), windowMinutes);
        if (deniedCount >= threshold) {
            triggered.add(new TriggeredRule(rule.getName(),
                    "Consecutive failures: " + deniedCount + " denied txns in " + windowMinutes + " minutes",
                    rule.getRiskWeight()));
        }
    }
}
