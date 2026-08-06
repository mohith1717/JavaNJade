package com.jadeguard.watchlist;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record WatchlistedAccountRequest(
        @NotBlank @Size(max = 100)
        @Pattern(regexp = "^[A-Za-z0-9._-]+$") String accountId,
        @NotBlank @Size(max = 500) String reason
) { }
