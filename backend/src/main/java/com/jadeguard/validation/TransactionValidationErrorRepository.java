package com.jadeguard.validation;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionValidationErrorRepository
        extends JpaRepository<TransactionValidationErrorEntity, UUID> {

    List<TransactionValidationErrorEntity>
            findByTransactionIdOrderByCreatedAtAsc(UUID transactionId);

    List<TransactionValidationErrorEntity>
            findByCodeOrderByCreatedAtDesc(ValidationErrorCode code);

    List<TransactionValidationErrorEntity> findAllByOrderByCreatedAtDesc();
}
