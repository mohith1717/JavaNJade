package com.jadeguard.rule;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MonitoringRuleRepository
        extends JpaRepository<MonitoringRuleEntity, UUID> {

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, UUID id);

    List<MonitoringRuleEntity> findAllByOrderByCreatedAtDesc();

    List<MonitoringRuleEntity> findByEnabledTrueOrderByCreatedAtAsc();
}
