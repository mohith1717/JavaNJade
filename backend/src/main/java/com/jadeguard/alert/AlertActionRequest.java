package com.jadeguard.alert;

import jakarta.validation.constraints.NotBlank;

public record AlertActionRequest(
        @NotBlank String reason
) {
}
