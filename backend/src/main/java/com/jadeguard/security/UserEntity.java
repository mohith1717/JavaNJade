package com.jadeguard.security;

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
@Table(name = "users")
public class UserEntity {

    @Id
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(nullable = false, unique = true, length = 200)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UserRole role;

    @Column(nullable = false)
    private boolean enabled;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected UserEntity() {
    }

    public UserEntity(
            UUID id,
            String username,
            String email,
            String passwordHash,
            String displayName,
            UserRole role,
            boolean enabled,
            Instant createdAt,
            Instant updatedAt
    ) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.displayName = displayName;
        this.role = role;
        this.enabled = enabled;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getDisplayName() { return displayName; }
    public UserRole getRole() { return role; }
    public boolean isEnabled() { return enabled; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void updateProfile(String username, String email,
            String displayName, Instant updatedAt) {
        this.username = username;
        this.email = email;
        this.displayName = displayName;
        this.updatedAt = updatedAt;
    }

    public void changeStatus(boolean enabled, Instant updatedAt) {
        this.enabled = enabled;
        this.updatedAt = updatedAt;
    }

    public void changeRole(UserRole role, Instant updatedAt) {
        this.role = role;
        this.updatedAt = updatedAt;
    }

    public void changePassword(String passwordHash, Instant updatedAt) {
        this.passwordHash = passwordHash;
        this.updatedAt = updatedAt;
    }
}
