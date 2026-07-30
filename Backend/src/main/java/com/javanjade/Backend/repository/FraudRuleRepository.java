package com.javanjade.Backend.repository;

import com.javanjade.Backend.model.FraudRule;
import com.javanjade.Backend.model.RuleType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FraudRuleRepository extends JpaRepository<FraudRule, Long> {
    Optional<FraudRule> findByType(RuleType type);
}
