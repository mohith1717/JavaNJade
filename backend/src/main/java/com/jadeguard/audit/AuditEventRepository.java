package com.jadeguard.audit;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AuditEventRepository
        extends JpaRepository<AuditEventEntity, UUID>,
        JpaSpecificationExecutor<AuditEventEntity> {

    List<AuditEventEntity> findByEntityTypeAndEntityIdOrderByOccurredAtAsc(
            String entityType,
            UUID entityId
    );
}
