package com.javanjade.Backend.dto;

public record TriggeredRuleDto(
        String ruleName,
        String reason,
        int riskWeight
) {
}
