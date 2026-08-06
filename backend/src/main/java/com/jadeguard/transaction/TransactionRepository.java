package com.jadeguard.transaction;

import java.util.List;
import java.time.Instant;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<TransactionEntity, UUID> {

    boolean existsByExternalTransactionId(String externalTransactionId);

    List<TransactionEntity> findAllByOrderByOccurredAtDesc();

    List<TransactionEntity>
            findByProcessingStatusOrderByOccurredAtDesc(
                    ProcessingStatus processingStatus
            );

    List<TransactionEntity> findByCurrencyAndOccurredAtBetween(
            String currency,
            Instant from,
            Instant to
    );

    List<TransactionEntity> findBySenderAccountIdAndOccurredAtBetween(
            String senderAccountId,
            Instant from,
            Instant to
    );
}
