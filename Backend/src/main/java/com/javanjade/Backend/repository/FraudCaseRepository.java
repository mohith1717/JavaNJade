package com.javanjade.Backend.repository;

import com.javanjade.Backend.model.CasePriority;
import com.javanjade.Backend.model.CaseStatus;
import com.javanjade.Backend.model.FraudCase;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FraudCaseRepository extends JpaRepository<FraudCase, Long> {
    Optional<FraudCase> findByAlertId(String alertId);

    List<FraudCase> findByStatusOrderByPriorityDescCreatedAtAsc(CaseStatus status);

    List<FraudCase> findByAssignedToOrderByPriorityDescCreatedAtAsc(String assignedTo);

    long countByStatus(CaseStatus status);

    long countByPriority(CasePriority priority);

    long countByCreatedAtAfter(LocalDateTime after);
}
