package com.jadeguard.security;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserCreateRequest(
        @NotBlank @Size(max = 100)
        @Pattern(regexp = "[A-Za-z][A-Za-z0-9._-]{2,99}") String username,
        @NotBlank @Email @Size(max = 200) String email,
        @NotBlank @Size(max = 200) String displayName,
        @NotBlank @Size(max = 100)
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{10,}$",
                message = "password must be at least 10 characters and include uppercase, lowercase, number, and special character")
        String password,
        @NotNull UserRole role,
        @NotNull Boolean enabled,
        @NotBlank @Size(max = 500) String reason
) { }
