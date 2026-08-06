package com.jadeguard.security;

import java.util.UUID;

public record CurrentUserResponse(
        UUID id,
        String username,
        String email,
        String displayName,
        UserRole role
) {
    public static CurrentUserResponse from(UserEntity user) {
        return new CurrentUserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole()
        );
    }
}
