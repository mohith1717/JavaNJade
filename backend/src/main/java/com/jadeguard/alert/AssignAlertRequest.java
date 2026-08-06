package com.jadeguard.alert;

import jakarta.validation.constraints.NotBlank;

public record AssignAlertRequest(
        @NotBlank String assignedTo,
        @NotBlank String reason
) {
}
