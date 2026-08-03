package com.jadeguard.report;

import java.time.Instant;
import com.jadeguard.transaction.RiskLevel;

public record ReportFilters(Instant from, Instant to, String currency,
        String country, RiskLevel riskLevel) { }
