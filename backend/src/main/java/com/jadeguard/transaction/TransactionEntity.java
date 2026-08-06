package com.jadeguard.transaction;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "transactions")
public class TransactionEntity {

    @Id
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID id;

    @Column(name = "external_transaction_id", nullable = false, unique = true)
    private String externalTransactionId;

    @Column(name = "sender_account_id", nullable = false)
    private String senderAccountId;

    @Column(name = "receiver_account_id", nullable = false)
    private String receiverAccountId;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    @JdbcTypeCode(SqlTypes.CHAR)
    private String currency;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    @Column(name = "processing_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ProcessingStatus processingStatus;

    @Column(name = "risk_score")
    private Integer riskScore;

    @Column(name = "risk_level", nullable = false)
    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected TransactionEntity() {
    }

    public TransactionEntity(
            UUID id,
            String externalTransactionId,
            String senderAccountId,
            String receiverAccountId,
            BigDecimal amount,
            String currency,
            Instant occurredAt,
            ProcessingStatus processingStatus,
            Integer riskScore,
            RiskLevel riskLevel,
            Instant createdAt
    ) {
        this.id = id;
        this.externalTransactionId = externalTransactionId;
        this.senderAccountId = senderAccountId;
        this.receiverAccountId = receiverAccountId;
        this.amount = amount;
        this.currency = currency;
        this.occurredAt = occurredAt;
        this.processingStatus = processingStatus;
        this.riskScore = riskScore;
        this.riskLevel = riskLevel;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public String getExternalTransactionId() { return externalTransactionId; }
    public String getSenderAccountId() { return senderAccountId; }
    public String getReceiverAccountId() { return receiverAccountId; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public Instant getOccurredAt() { return occurredAt; }
    public ProcessingStatus getProcessingStatus() { return processingStatus; }
    public Integer getRiskScore() { return riskScore; }
    public RiskLevel getRiskLevel() { return riskLevel; }
    public Instant getCreatedAt() { return createdAt; }

    public void markValidating() {
        processingStatus = ProcessingStatus.VALIDATING;
    }

    public void markValidated() {
        processingStatus = ProcessingStatus.VALIDATED;
    }

    public void markValidationFailed() {
        processingStatus = ProcessingStatus.VALIDATION_FAILED;
    }

    public void markAssessingRisk() {
        processingStatus = ProcessingStatus.ASSESSING_RISK;
    }

    public void markAssessed(int score, RiskLevel level) {
        riskScore = score;
        riskLevel = level;
        processingStatus = ProcessingStatus.ASSESSED;
    }
}
