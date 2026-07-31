package com.javanjade.Backend.service;

import com.javanjade.Backend.dto.AuditEventResponse;
import com.javanjade.Backend.repository.AuditLogEventRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class AuditTrailQueryService {

    private static final String TRANSACTION_ENTITY_TYPE = "TRANSACTION";
    private static final String TRANSACTION_VALIDATION_FAILED = "TRANSACTION_VALIDATION_FAILED";

    private final AuditLogEventRepository auditLogEventRepository;

    public AuditTrailQueryService(AuditLogEventRepository auditLogEventRepository) {
        this.auditLogEventRepository = auditLogEventRepository;
    }

    public List<AuditEventResponse> getEntityTrail(String entityType, String entityId) {
        return auditLogEventRepository.findByEntityTypeAndEntityIdOrderByCreatedAtAsc(entityType, entityId).stream()
                .map(event -> new AuditEventResponse(
                        event.getEntityType(),
                        event.getEntityId(),
                        event.getAction(),
                        event.getActor(),
                        event.getDetails(),
                        event.getCreatedAt()
                ))
                .toList();
    }

    public List<AuditEventResponse> getTransactionValidationFailures() {
        return auditLogEventRepository
                .findByEntityTypeAndActionOrderByCreatedAtDesc(TRANSACTION_ENTITY_TYPE, TRANSACTION_VALIDATION_FAILED)
                .stream()
                .map(event -> new AuditEventResponse(
                        event.getEntityType(),
                        event.getEntityId(),
                        event.getAction(),
                        event.getActor(),
                        event.getDetails(),
                        event.getCreatedAt()
                ))
                .toList();
    }
}
