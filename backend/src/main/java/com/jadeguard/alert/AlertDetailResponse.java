package com.jadeguard.alert;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AlertDetailResponse(
        UUID id,
        UUID transactionId,
        AlertStatus status,
        AlertPriority priority,
        String primaryReason,
        int riskScore,
        String assignedTo,
        Instant assignedAt,
        AlertDecision decision,
        String resolutionNotes,
        Instant createdAt,
        Instant investigatingAt,
        Instant closedAt,
        Instant reopenedAt,
        long version,
        List<AlertStatusHistoryEntity> statusHistory
) {
}
