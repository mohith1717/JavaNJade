package com.javanjade.Backend.service;

import com.javanjade.Backend.model.AuditLogEvent;
import com.javanjade.Backend.repository.AuditLogEventRepository;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    private final AuditLogEventRepository auditLogEventRepository;

    public AuditLogService(AuditLogEventRepository auditLogEventRepository) {
        this.auditLogEventRepository = auditLogEventRepository;
    }

    public void append(String entityType, String entityId, String action, String actor, String details) {
        AuditLogEvent event = new AuditLogEvent();
        event.setEntityType(entityType);
        event.setEntityId(entityId);
        event.setAction(action);
        event.setActor(actor);
        event.setDetails(details == null ? "" : details);
        auditLogEventRepository.save(event);
    }
}
