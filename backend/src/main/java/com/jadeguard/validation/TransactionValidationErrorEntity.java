package com.jadeguard.validation;

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
@Table(name = "transaction_validation_errors")
public class TransactionValidationErrorEntity {

    @Id
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID id;

    @Column(name = "transaction_id", nullable = false)
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID transactionId;

    @Column(name = "error_code", nullable = false)
    @Enumerated(EnumType.STRING)
    private ValidationErrorCode code;

    @Column(name = "field_name", nullable = false)
    private String field;

    @Column(nullable = false)
    private String message;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected TransactionValidationErrorEntity() {
    }

    public TransactionValidationErrorEntity(
            UUID id,
            UUID transactionId,
            ValidationErrorCode code,
            String field,
            String message,
            Instant createdAt
    ) {
        this.id = id;
        this.transactionId = transactionId;
        this.code = code;
        this.field = field;
        this.message = message;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public UUID getTransactionId() { return transactionId; }
    public ValidationErrorCode getCode() { return code; }
    public String getField() { return field; }
    public String getMessage() { return message; }
    public Instant getCreatedAt() { return createdAt; }
}
