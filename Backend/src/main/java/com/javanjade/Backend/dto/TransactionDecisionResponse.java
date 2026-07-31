package com.javanjade.Backend.dto;

import com.javanjade.Backend.model.CasePriority;
import com.javanjade.Backend.model.CaseStatus;
import com.javanjade.Backend.model.TransactionStatus;
import java.util.List;

public record TransactionDecisionResponse(
        String transactionId,
        TransactionStatus decision,
        int riskScore,
        String explanation,
        List<TriggeredRuleDto> triggeredRules,
        String alertId,
        CaseStatus caseStatus,
        CasePriority severity
) {
}
