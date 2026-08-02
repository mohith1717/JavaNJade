package com.jadeguard.risk;

import java.util.UUID;

public class RiskAssessmentNotAvailableException extends RuntimeException {

    public RiskAssessmentNotAvailableException(UUID transactionId) {
        super("Risk assessment is not available for transaction: "
                + transactionId);
    }
}
