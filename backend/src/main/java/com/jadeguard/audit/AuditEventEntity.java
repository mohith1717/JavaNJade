package com.jadeguard.audit;

import java.time.Instant;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "audit_events")
public class AuditEventEntity {

    @Id
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID id;

    @Column(name = "actor_id", nullable = false)
    private String actorId;

    @Column(name = "actor_username", nullable = false, length = 100)
    private String actorUsername;

    @Column(nullable = false)
    private String action;

    @Column(name = "entity_type", nullable = false)
    private String entityType;

    @Column(name = "entity_id", nullable = false)
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID entityId;

    @Column(name = "previous_value", columnDefinition = "json")
    @JdbcTypeCode(SqlTypes.JSON)
    private JsonNode previousValue;

    @Column(name = "new_value", columnDefinition = "json")
    @JdbcTypeCode(SqlTypes.JSON)
    private JsonNode newValue;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(nullable = false, columnDefinition = "json")
    @JdbcTypeCode(SqlTypes.JSON)
    private JsonNode details;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    protected AuditEventEntity() {
    }

    public AuditEventEntity(
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
        this.id = id;
        this.actorId = actorId;
        this.actorUsername = actorUsername;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.previousValue = previousValue;
        this.newValue = newValue;
        this.reason = reason;
        this.details = details;
        this.occurredAt = occurredAt;
    }

    public UUID getId() { return id; }
    public String getActorId() { return actorId; }
    public String getActorUsername() { return actorUsername; }
    public String getAction() { return action; }
    public String getEntityType() { return entityType; }
    public UUID getEntityId() { return entityId; }
    public JsonNode getPreviousValue() { return previousValue; }
    public JsonNode getNewValue() { return newValue; }
    public String getReason() { return reason; }
    public JsonNode getDetails() { return details; }
    public Instant getOccurredAt() { return occurredAt; }
}
