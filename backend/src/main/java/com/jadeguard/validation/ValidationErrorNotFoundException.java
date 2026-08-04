package com.jadeguard.validation;

import java.util.UUID;

public class ValidationErrorNotFoundException extends RuntimeException {

    public ValidationErrorNotFoundException(UUID validationErrorId) {
        super("Validation error not found: " + validationErrorId);
    }
}
