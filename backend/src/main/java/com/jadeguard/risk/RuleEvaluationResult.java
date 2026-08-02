package com.jadeguard.risk;

public record RuleEvaluationResult(
        boolean triggered,
        String explanation
) {
}
