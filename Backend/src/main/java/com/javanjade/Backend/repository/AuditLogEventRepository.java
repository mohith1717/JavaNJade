package com.javanjade.Backend.repository;

import com.javanjade.Backend.model.AuditLogEvent;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogEventRepository extends JpaRepository<AuditLogEvent, Long> {
    List<AuditLogEvent> findByEntityTypeAndEntityIdOrderByCreatedAtAsc(String entityType, String entityId);
}
