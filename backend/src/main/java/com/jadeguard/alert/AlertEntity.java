package com.jadeguard.alert;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "alerts")
public class AlertEntity {

    @Id
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID id;

    @Column(name = "transaction_id", nullable = false, unique = true)
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID transactionId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AlertStatus status;

    @Column(name = "severity", nullable = false)
    @Enumerated(EnumType.STRING)
    private AlertPriority priority;

    @Column(name = "primary_reason", nullable = false, columnDefinition = "TEXT")
    private String primaryReason;

    @Column(name = "risk_score", nullable = false)
    private int riskScore;

    @Column(name = "assigned_to")
    private String assignedTo;

    @Column(name = "assigned_at")
    private Instant assignedAt;

    @Column
    @Enumerated(EnumType.STRING)
    private AlertDecision decision;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "acknowledged_at")
    private Instant investigatingAt;

    @Column(name = "closed_at")
    private Instant closedAt;

    @Column(name = "reopened_at")
    private Instant reopenedAt;

    @Version
    @Column(nullable = false)
    private long version;

    protected AlertEntity() {
    }

    public AlertEntity(
            UUID id,
            UUID transactionId,
            AlertStatus status,
            AlertPriority priority,
            String primaryReason,
            int riskScore,
            Instant createdAt
    ) {
        this.id = id;
        this.transactionId = transactionId;
        this.status = status;
        this.priority = priority;
        this.primaryReason = primaryReason;
        this.riskScore = riskScore;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public UUID getTransactionId() { return transactionId; }
    public AlertStatus getStatus() { return status; }
    public AlertPriority getPriority() { return priority; }
    public String getPrimaryReason() { return primaryReason; }
    public int getRiskScore() { return riskScore; }
    public String getAssignedTo() { return assignedTo; }
    public Instant getAssignedAt() { return assignedAt; }
    public AlertDecision getDecision() { return decision; }
    public String getResolutionNotes() { return resolutionNotes; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getInvestigatingAt() { return investigatingAt; }
    public Instant getClosedAt() { return closedAt; }
    public Instant getReopenedAt() { return reopenedAt; }
    public long getVersion() { return version; }

    public void assign(String analystId, Instant changedAt) {
        assignedTo = analystId;
        assignedAt = changedAt;
        status = AlertStatus.ASSIGNED;
    }

    public void startInvestigation(Instant changedAt) {
        investigatingAt = changedAt;
        status = AlertStatus.INVESTIGATING;
    }

    public void decide(AlertDecision newDecision) {
        decision = newDecision;
        status = AlertStatus.valueOf(newDecision.name());
    }

    public void close(String notes, Instant changedAt) {
        resolutionNotes = notes;
        closedAt = changedAt;
        status = AlertStatus.CLOSED;
    }

    public void reopen(Instant changedAt) {
        assignedTo = null;
        assignedAt = null;
        investigatingAt = null;
        reopenedAt = changedAt;
        closedAt = null;
        status = AlertStatus.OPEN;
    }
}
