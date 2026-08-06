package com.jadeguard.risk;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.jadeguard.transaction.ProcessingStatus;
import com.jadeguard.transaction.RiskLevel;

public record RiskAssessmentResponse(
        UUID transactionId,
        ProcessingStatus processingStatus,
        Integer riskScore,
        RiskLevel riskLevel,
        List<RuleEvaluationResponse> evaluations,
        Instant assessedAt
) {
}
