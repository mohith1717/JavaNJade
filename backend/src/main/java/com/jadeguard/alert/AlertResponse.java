package com.jadeguard.alert;

import java.time.Instant;
import java.util.UUID;

public record AlertResponse(
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
        long version
) {
}
