package com.jadeguard.transaction;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A transaction with this external ID already exists"
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
                "RECEIVED",
                0,
                "LOW",
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
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Transaction not found"
                ));
    }
}
