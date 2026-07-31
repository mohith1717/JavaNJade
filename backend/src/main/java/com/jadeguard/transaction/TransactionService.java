package com.jadeguard.transaction;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public TransactionEntity createTransaction(TransactionRequest request) {
        if (transactionRepository.existsByExternalTransactionId(
                request.externalTransactionId()
        )) {
            throw new DuplicateTransactionException(
                    request.externalTransactionId()
            );
        }

        var transaction = new TransactionEntity(
                UUID.randomUUID(),
                request.externalTransactionId(),
                request.senderAccountId(),
                request.receiverAccountId(),
                request.amount(),
                request.currency().toUpperCase(Locale.ROOT),
                request.occurredAt(),
                ProcessingStatus.RECEIVED,
                null,
                RiskLevel.PENDING,
                Instant.now()
        );

        return transactionRepository.save(transaction);
    }

    @Transactional(readOnly = true)
    public List<TransactionEntity> getAllTransactions() {
        return transactionRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public TransactionEntity getTransaction(UUID transactionId) {
        return transactionRepository.findById(transactionId)
                .orElseThrow(() -> new TransactionNotFoundException(
                        transactionId
                ));
    }
}
