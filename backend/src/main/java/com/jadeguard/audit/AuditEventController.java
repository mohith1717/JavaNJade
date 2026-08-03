package com.jadeguard.audit;

import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/audit-events")
public class AuditEventController {

    private final AuditEventService service;

    public AuditEventController(AuditEventService service) {
        this.service = service;
    }

    @GetMapping
    public AuditEventPageResponse getEvents(
            @RequestParam(required = false) String actorId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) UUID entityId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return AuditEventPageResponse.from(service.getEvents(
                actorId,
                action,
                entityType,
                entityId,
                page,
                size
        ));
    }

    @GetMapping("/{auditEventId}")
    public AuditEventResponse getEvent(@PathVariable UUID auditEventId) {
        return service.getEvent(auditEventId);
    }
}
