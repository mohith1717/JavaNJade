package com.jadeguard.validation;

import java.util.List;

public record ValidationResult(
        boolean valid,
        List<ValidationError> errors
) {
    public static ValidationResult from(List<ValidationError> errors) {
        return new ValidationResult(errors.isEmpty(), List.copyOf(errors));
    }
}
