package com.jadeguard.alert;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "alert_status_history")
public class AlertStatusHistoryEntity {

    @Id
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID id;

    @Column(name = "alert_id", nullable = false)
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID alertId;

    @Column(name = "from_status")
    @Enumerated(EnumType.STRING)
    private AlertStatus fromStatus;

    @Column(name = "to_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private AlertStatus toStatus;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "changed_by", nullable = false)
    private String changedBy;

    @Column(name = "changed_at", nullable = false)
    private Instant changedAt;

    protected AlertStatusHistoryEntity() {
    }

    public AlertStatusHistoryEntity(
            UUID id,
            UUID alertId,
            AlertStatus fromStatus,
            AlertStatus toStatus,
            String reason,
            String changedBy,
            Instant changedAt
    ) {
        this.id = id;
        this.alertId = alertId;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.reason = reason;
        this.changedBy = changedBy;
        this.changedAt = changedAt;
    }

    public UUID getId() { return id; }
    public UUID getAlertId() { return alertId; }
    public AlertStatus getFromStatus() { return fromStatus; }
    public AlertStatus getToStatus() { return toStatus; }
    public String getReason() { return reason; }
    public String getChangedBy() { return changedBy; }
    public Instant getChangedAt() { return changedAt; }
}
