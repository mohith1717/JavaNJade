package com.jadeguard.report;

import java.math.BigDecimal;
public record RuleEffectivenessResponse(String ruleCode, String ruleName,
        long evaluationCount, long triggerCount, BigDecimal triggerRate,
        long totalScoreContribution) { }
