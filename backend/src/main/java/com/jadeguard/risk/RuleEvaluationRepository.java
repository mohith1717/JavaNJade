package com.jadeguard.risk;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RuleEvaluationRepository
        extends JpaRepository<RuleEvaluationEntity, UUID> {

    List<RuleEvaluationEntity> findByTransactionIdOrderByEvaluatedAtAsc(
            UUID transactionId
    );
}
