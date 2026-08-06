package com.jadeguard.watchlist;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record WatchlistedAccountStatusRequest(
        @NotNull Boolean enabled,
        @NotBlank @Size(max = 500) String reason
) { }
