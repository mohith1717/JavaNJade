package com.jadeguard.security;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(UUID id, String username, String email,
        String displayName, UserRole role, boolean enabled,
        Instant createdAt, Instant updatedAt) {
    public static UserResponse from(UserEntity user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(),
                user.getDisplayName(), user.getRole(), user.isEnabled(),
                user.getCreatedAt(), user.getUpdatedAt());
    }
}
