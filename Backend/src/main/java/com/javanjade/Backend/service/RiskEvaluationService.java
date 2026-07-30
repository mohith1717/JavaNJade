package com.javanjade.Backend.service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class RiskEvaluationService {

    public EvaluationResult evaluate(List<TriggeredRule> triggeredRules) {
        int score = Math.min(100, triggeredRules.stream().mapToInt(TriggeredRule::riskWeight).sum());

        String primaryReason = triggeredRules.stream()
                .max(Comparator.comparingInt(TriggeredRule::riskWeight))
                .map(TriggeredRule::reason)
                .orElse("No suspicious signals observed");

        String explanation = buildExplanation(score, triggeredRules);

        return new EvaluationResult(score, primaryReason, explanation, triggeredRules);
    }

    private String buildExplanation(int score, List<TriggeredRule> triggeredRules) {
        if (triggeredRules.isEmpty()) {
            return "Risk score is low (0) because no configured fraud rule was triggered for this transaction.";
        }

        String ruleSummary = triggeredRules.stream()
                .map(rule -> rule.ruleName() + "(" + rule.riskWeight() + ")")
                .collect(Collectors.joining(", "));

        return "Risk score is " + score + " due to the following triggered indicators: " + ruleSummary
                + ". The strongest contributor is: "
                + triggeredRules.stream()
                .max(Comparator.comparingInt(TriggeredRule::riskWeight))
                .map(TriggeredRule::reason)
                .orElse("N/A")
                + ".";
    }
}
