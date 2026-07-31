package com.jadeguard.validation;

public record ValidationError(
        ValidationErrorCode code,
        String field,
        String message
) {
}
