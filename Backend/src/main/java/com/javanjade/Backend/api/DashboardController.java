package com.javanjade.Backend.api;

import com.javanjade.Backend.dto.AuditEventResponse;
import com.javanjade.Backend.dto.DashboardSummaryResponse;
import com.javanjade.Backend.service.AuditTrailQueryService;
import com.javanjade.Backend.service.DashboardService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.javanjade.Backend.dto.AdminDashboardResponse;
import com.javanjade.Backend.dto.AlertDashboardResponse;
import com.javanjade.Backend.dto.FraudInvestigatorDashboardResponse;

@RestController
@RequestMapping({"/api/dashboard", "/api/dasboard"})
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

    @GetMapping("/admin")
    public AdminDashboardResponse adminDashboard() {
        return dashboardService.adminSummaryLast24h();
    }

    @GetMapping("/investigator")
    public FraudInvestigatorDashboardResponse investigatorDashboard(
            @RequestParam(value = "assignee", required = false) String assignee) {
        return dashboardService.investigatorDashboard(assignee);
    }

    @GetMapping("/alerts/{alertId}")
    public AlertDashboardResponse alertDashboard(@PathVariable String alertId) {
        return dashboardService.alertDashboard(alertId);
    }

    @GetMapping("/alerts")
    public AlertDashboardResponse alertDashboardByQuery(@RequestParam String alertId) {
        return dashboardService.alertDashboard(alertId);
    }

    @GetMapping("/audit-trail")
    public List<AuditEventResponse> auditTrail(@RequestParam String entityType,
                                               @RequestParam String entityId) {
        return auditTrailQueryService.getEntityTrail(entityType, entityId);
    }
}
