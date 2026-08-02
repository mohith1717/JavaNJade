package com.jadeguard.risk;

import java.time.Instant;
import java.util.UUID;

import com.jadeguard.rule.RuleType;

public record RuleEvaluationResponse(
        UUID evaluationId,
        UUID ruleId,
        String ruleCode,
        String ruleName,
        RuleType ruleType,
        boolean triggered,
        int scoreContribution,
        String explanation,
        Instant evaluatedAt
) {
}
