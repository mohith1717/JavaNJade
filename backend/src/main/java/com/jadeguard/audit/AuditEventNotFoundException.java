package com.jadeguard.audit;

import java.util.UUID;

public class AuditEventNotFoundException extends RuntimeException {

    public AuditEventNotFoundException(UUID auditEventId) {
        super("Audit event not found: " + auditEventId);
    }
}
