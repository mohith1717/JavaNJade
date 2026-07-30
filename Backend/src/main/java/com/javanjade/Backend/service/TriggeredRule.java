package com.javanjade.Backend.service;

public record TriggeredRule(
        String ruleName,
        String reason,
        int riskWeight
) {
}
