package com.jadeguard.security;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UserRoleRequest(@NotNull UserRole role,
        @NotBlank @Size(max = 500) String reason) { }
