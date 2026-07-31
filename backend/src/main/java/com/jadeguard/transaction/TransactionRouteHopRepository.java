package com.jadeguard.transaction;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRouteHopRepository
        extends JpaRepository<TransactionRouteHopEntity, UUID> {

    List<TransactionRouteHopEntity>
            findByTransactionIdOrderBySequenceAsc(UUID transactionId);
}
