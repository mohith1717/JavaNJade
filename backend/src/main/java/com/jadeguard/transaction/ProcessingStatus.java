package com.jadeguard.transaction;

public enum ProcessingStatus {
    RECEIVED,
    VALIDATING,
    VALIDATED,
    VALIDATION_FAILED,
    ASSESSING_RISK,
    ASSESSED,
    REVIEW_REQUIRED,
    APPROVED,
    FAILED
}
