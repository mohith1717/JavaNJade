package com.jadeguard.audit;

import java.util.List;

import org.springframework.data.domain.Page;

public record AuditEventPageResponse(
        List<AuditEventResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
    public static AuditEventPageResponse from(
            Page<AuditEventResponse> events
    ) {
        return new AuditEventPageResponse(
                events.getContent(),
                events.getNumber(),
                events.getSize(),
                events.getTotalElements(),
                events.getTotalPages()
        );
    }
}
