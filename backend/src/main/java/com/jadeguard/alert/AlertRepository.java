package com.jadeguard.alert;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertRepository extends JpaRepository<AlertEntity, UUID> {

    boolean existsByTransactionId(UUID transactionId);

    Optional<AlertEntity> findByTransactionId(UUID transactionId);

    List<AlertEntity> findAllByOrderByCreatedAtDesc();
}
