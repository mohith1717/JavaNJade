package com.jadeguard.security;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest(
        @NotBlank @Size(max = 100)
        @Pattern(regexp = "[A-Za-z][A-Za-z0-9._-]{2,99}") String username,
        @NotBlank @Email @Size(max = 200) String email,
        @NotBlank @Size(max = 200) String displayName,
        @NotBlank @Size(max = 500) String reason
) { }
