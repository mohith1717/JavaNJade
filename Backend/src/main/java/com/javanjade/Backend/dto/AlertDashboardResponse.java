package com.javanjade.Backend.dto;

import com.javanjade.Backend.model.TransactionStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record AlertDashboardResponse(
        CaseViewResponse alertCase,
        AlertTransactionSnapshot transaction,
        List<AuditEventResponse> auditTrail
) {
    public record AlertTransactionSnapshot(
            String transactionId,
            BigDecimal amount,
            String currency,
            String senderAccountId,
            String receiverAccountId,
            String senderCountry,
            String receiverCountry,
            String location,
            String deviceId,
            Integer creditScore,
            TransactionStatus decision,
            Integer riskScore,
            String primaryReason,
            LocalDateTime createdAt
    ) {
    }
}
