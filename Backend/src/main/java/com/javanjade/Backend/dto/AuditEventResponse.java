package com.javanjade.Backend.dto;

import java.time.LocalDateTime;

public record AuditEventResponse(
        String entityType,
        String entityId,
        String action,
        String actor,
        String details,
        LocalDateTime createdAt
) {
}
