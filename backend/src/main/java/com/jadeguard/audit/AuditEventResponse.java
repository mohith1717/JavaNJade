package com.jadeguard.audit;

import java.time.Instant;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;

public record AuditEventResponse(
        UUID id,
        String actorId,
        String actorUsername,
        String action,
        String entityType,
        UUID entityId,
        JsonNode previousValue,
        JsonNode newValue,
        String reason,
        JsonNode details,
        Instant occurredAt
) {
    public static AuditEventResponse from(AuditEventEntity event) {
        return new AuditEventResponse(
                event.getId(),
                event.getActorId(),
                event.getActorUsername(),
                event.getAction(),
                event.getEntityType(),
                event.getEntityId(),
                event.getPreviousValue(),
                event.getNewValue(),
                event.getReason(),
                event.getDetails(),
                event.getOccurredAt()
        );
    }
}
