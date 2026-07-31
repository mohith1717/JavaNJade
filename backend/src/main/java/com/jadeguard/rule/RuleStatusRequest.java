package com.jadeguard.rule;

import jakarta.validation.constraints.NotNull;

public record RuleStatusRequest(
        @NotNull Boolean enabled
) {
}
