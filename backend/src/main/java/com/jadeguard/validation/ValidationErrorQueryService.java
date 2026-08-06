package com.jadeguard.validation;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ValidationErrorQueryService {

    private final TransactionValidationErrorRepository repository;

    public ValidationErrorQueryService(
            TransactionValidationErrorRepository repository
    ) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<TransactionValidationErrorEntity> getValidationErrors(
            UUID transactionId,
            ValidationErrorCode code
    ) {
        if (transactionId != null) {
            return repository
                    .findByTransactionIdOrderByCreatedAtAsc(transactionId)
                    .stream()
                    .filter(error -> code == null || error.getCode() == code)
                    .toList();
        }
        if (code != null) {
            return repository.findByCodeOrderByCreatedAtDesc(code);
        }
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public TransactionValidationErrorEntity getValidationError(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ValidationErrorNotFoundException(id));
    }
}
