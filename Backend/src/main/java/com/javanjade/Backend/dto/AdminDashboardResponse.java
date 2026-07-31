package com.javanjade.Backend.dto;

import java.util.List;

public record AdminDashboardResponse(
        long totalTransactionsLast24h,
        long totalAlertsLast24h,
        long openCases,
        long investigateCases,
        long resolvedCases,
        long criticalCases,
        double avgRiskScoreLast24h,
        List<CaseViewResponse> topPriorityAlerts
) {
}
