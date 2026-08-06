package com.jadeguard.audit;

import java.time.Instant;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jadeguard.security.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditEventService {

    private final AuditEventRepository repository;
    private final ObjectMapper objectMapper;

    public AuditEventService(
            AuditEventRepository repository,
            ObjectMapper objectMapper
    ) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void record(
            String actorId,
            String actorUsername,
            String action,
            String entityType,
            UUID entityId,
            JsonNode previousValue,
            JsonNode newValue,
            String reason,
            JsonNode details,
            Instant occurredAt
    ) {
        repository.save(new AuditEventEntity(
                UUID.randomUUID(),
                actorId,
                actorUsername,
                action,
                entityType,
                entityId,
                previousValue,
                newValue,
                reason,
                details == null ? objectMapper.createObjectNode() : details,
                occurredAt
        ));
    }

    @Transactional
    public void recordUserEvent(
            UserEntity actor,
            String action,
            String entityType,
            UUID entityId,
            JsonNode previousValue,
            JsonNode newValue,
            String reason
    ) {
        record(
                actor.getId().toString(),
                actor.getUsername(),
                action,
                entityType,
                entityId,
                previousValue,
                newValue,
                reason,
                objectMapper.createObjectNode(),
                Instant.now()
        );
    }

    @Transactional(readOnly = true)
    public Page<AuditEventResponse> getEvents(
            String actorId,
            String action,
            String entityType,
            UUID entityId,
            int page,
            int size
    ) {
        int safeSize = Math.min(Math.max(size, 1), 100);
        int safePage = Math.max(page, 0);
        Specification<AuditEventEntity> specification = Specification
                .where(equalsIfPresent("actorId", actorId))
                .and(equalsIfPresent("action", action))
                .and(equalsIfPresent("entityType", entityType))
                .and(equalsIfPresent("entityId", entityId));
        return repository.findAll(
                specification,
                PageRequest.of(
                        safePage,
                        safeSize,
                        Sort.by(Sort.Direction.DESC, "occurredAt")
                )
        ).map(AuditEventResponse::from);
    }

    @Transactional(readOnly = true)
    public AuditEventResponse getEvent(UUID auditEventId) {
        return repository.findById(auditEventId)
                .map(AuditEventResponse::from)
                .orElseThrow(() -> new AuditEventNotFoundException(
                        auditEventId
                ));
    }

    private <T> Specification<AuditEventEntity> equalsIfPresent(
            String field,
            T value
    ) {
        return value == null
                ? null
                : (root, query, builder) -> builder.equal(
                        root.get(field),
                        value
                );
    }
}
