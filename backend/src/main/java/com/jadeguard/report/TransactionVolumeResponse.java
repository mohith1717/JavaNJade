package com.jadeguard.report;

import java.math.BigDecimal;
import java.time.Instant;
public record TransactionVolumeResponse(Instant periodStart,
        long transactionCount, BigDecimal totalAmount) { }
