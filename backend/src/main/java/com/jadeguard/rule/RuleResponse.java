package com.jadeguard.rule;

import java.time.Instant;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;

public record RuleResponse(
        UUID id,
        String code,
        String name,
        RuleType type,
        boolean enabled,
        RuleSeverity severity,
        int riskWeight,
        JsonNode parameters,
        Instant createdAt,
        Instant updatedAt
) {
    public static RuleResponse from(MonitoringRuleEntity rule) {
        return new RuleResponse(
                rule.getId(),
                rule.getCode(),
                rule.getName(),
                rule.getType(),
                rule.isEnabled(),
                rule.getSeverity(),
                rule.getRiskWeight(),
                rule.getParameters(),
                rule.getCreatedAt(),
                rule.getUpdatedAt()
        );
    }
}
