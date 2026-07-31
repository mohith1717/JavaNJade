package com.jadeguard.transaction;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<TransactionEntity, UUID> {

    boolean existsByExternalTransactionId(String externalTransactionId);

    List<TransactionEntity> findAllByOrderByCreatedAtDesc();
}
