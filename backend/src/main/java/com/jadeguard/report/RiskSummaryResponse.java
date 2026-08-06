package com.jadeguard.report;

import java.math.BigDecimal;
import java.util.Map;
import com.jadeguard.transaction.RiskLevel;

public record RiskSummaryResponse(long totalTransactions,
        BigDecimal averageRiskScore, Map<RiskLevel, Long> riskDistribution,
        long highRiskTransactions) { }
