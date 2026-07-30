package com.javanjade.Backend.dto;

public record DashboardSummaryResponse(
        long totalTransactionsLast24h,
        long totalAlertsLast24h,
        long openCases,
        long assignedCases,
        long investigateCases,
        long resolvedCases,
        long criticalCases,
        double avgRiskScoreLast24h
) {
}
