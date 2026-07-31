package com.javanjade.Backend.dto;

import com.javanjade.Backend.model.CasePriority;
import com.javanjade.Backend.model.CaseStatus;
import java.time.LocalDateTime;

public record CaseViewResponse(
        String alertId,
        String transactionId,
        int riskScore,
        String primaryReason,
        CasePriority priority,
        CaseStatus status,
        String assignedTo,
        int reopenCount,
        LocalDateTime slaDeadline,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
