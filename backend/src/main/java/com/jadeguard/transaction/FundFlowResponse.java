package com.jadeguard.transaction;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record FundFlowResponse(
        UUID transactionId,
        String externalTransactionId,
        BigDecimal amount,
        String currency,
        ProcessingStatus processingStatus,
        Integer riskScore,
        RiskLevel riskLevel,
        CountrySummary originCountry,
        CountrySummary destinationCountry,
        int totalHops,
        List<FundFlowHopResponse> route
) {
}
