package com.javanjade.Backend.dto;

import java.util.List;

public record FraudInvestigatorDashboardResponse(
        String investigator,
        long assignedOpenCases,
        long assignedInvestigateCases,
        long totalAssignedCases,
        long criticalOpenCases,
        List<CaseViewResponse> queue
) {
}
