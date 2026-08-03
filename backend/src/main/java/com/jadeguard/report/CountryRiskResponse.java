package com.jadeguard.report;

import java.math.BigDecimal;
public record CountryRiskResponse(String countryCode, long transactionCount,
        long highRiskTransactionCount, long alertCount,
        BigDecimal averageRiskScore) { }
