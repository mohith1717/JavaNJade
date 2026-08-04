package com.jadeguard.security;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserPasswordRequest(
        @NotBlank @Size(max = 100)
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{10,}$",
                message = "newPassword must be at least 10 characters and include uppercase, lowercase, number, and special character")
        String newPassword,
        @NotBlank @Size(max = 500) String reason
) { }
