package com.javanjade.Backend.api;

import com.javanjade.Backend.dto.AuditEventResponse;
import com.javanjade.Backend.dto.DashboardSummaryResponse;
import com.javanjade.Backend.service.AuditTrailQueryService;
import com.javanjade.Backend.service.DashboardService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final AuditTrailQueryService auditTrailQueryService;

    public DashboardController(DashboardService dashboardService, AuditTrailQueryService auditTrailQueryService) {
        this.dashboardService = dashboardService;
        this.auditTrailQueryService = auditTrailQueryService;
    }

    @GetMapping("/summary")
    public DashboardSummaryResponse summary() {
        return dashboardService.summaryLast24h();
    }

    @GetMapping("/audit-trail")
    public List<AuditEventResponse> auditTrail(@RequestParam String entityType,
                                               @RequestParam String entityId) {
        return auditTrailQueryService.getEntityTrail(entityType, entityId);
    }
}
