package com.jadeguard.watchlist;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "watchlisted_accounts")
public class WatchlistedAccountEntity {
    @Id @JdbcTypeCode(SqlTypes.CHAR)
    private UUID id;
    @Column(name = "account_id", nullable = false, unique = true)
    private String accountId;
    @Column(nullable = false, length = 500)
    private String reason;
    @Column(nullable = false)
    private boolean enabled;
    @Column(name = "added_by", nullable = false) @JdbcTypeCode(SqlTypes.CHAR)
    private UUID addedBy;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected WatchlistedAccountEntity() { }

    public WatchlistedAccountEntity(UUID id, String accountId, String reason,
            boolean enabled, UUID addedBy, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.accountId = accountId;
        this.reason = reason;
        this.enabled = enabled;
        this.addedBy = addedBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() { return id; }
    public String getAccountId() { return accountId; }
    public String getReason() { return reason; }
    public boolean isEnabled() { return enabled; }
    public UUID getAddedBy() { return addedBy; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void changeStatus(boolean value, Instant at) {
        enabled = value;
        updatedAt = at;
    }
}
