package com.javanjade.Backend.service;

import java.util.List;

public record EvaluationResult(
        int riskScore,
        String primaryReason,
        String explanation,
        List<TriggeredRule> triggeredRules
) {
}
