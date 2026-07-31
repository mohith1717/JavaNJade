package com.javanjade.Backend.service;

import com.javanjade.Backend.dto.AdminDashboardResponse;
import com.javanjade.Backend.dto.AlertDashboardResponse;
import com.javanjade.Backend.dto.AuditEventResponse;
import com.javanjade.Backend.dto.CaseViewResponse;
import com.javanjade.Backend.dto.DashboardSummaryResponse;
import com.javanjade.Backend.dto.FraudInvestigatorDashboardResponse;
import com.javanjade.Backend.model.CasePriority;
import com.javanjade.Backend.model.CaseStatus;
import com.javanjade.Backend.model.FraudCase;
import com.javanjade.Backend.repository.FraudCaseRepository;
import com.javanjade.Backend.repository.TransactionRecordRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final TransactionRecordRepository transactionRecordRepository;
    private final FraudCaseRepository fraudCaseRepository;
    private final FraudCaseService fraudCaseService;
    private final AuditTrailQueryService auditTrailQueryService;

    public DashboardService(TransactionRecordRepository transactionRecordRepository,
                            FraudCaseRepository fraudCaseRepository,
                            FraudCaseService fraudCaseService,
                            AuditTrailQueryService auditTrailQueryService) {
        this.transactionRecordRepository = transactionRecordRepository;
        this.fraudCaseRepository = fraudCaseRepository;
        this.fraudCaseService = fraudCaseService;
        this.auditTrailQueryService = auditTrailQueryService;
    }

    public DashboardSummaryResponse summaryLast24h() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        Double avgRisk = transactionRecordRepository.avgRiskSince(since);

        return new DashboardSummaryResponse(
                transactionRecordRepository.countByCreatedAtAfter(since),
                fraudCaseRepository.countByCreatedAtAfter(since),
                fraudCaseRepository.countByStatus(CaseStatus.OPEN),
                fraudCaseRepository.countByStatus(CaseStatus.ASSIGNED),
                fraudCaseRepository.countByStatus(CaseStatus.INVESTIGATE),
                fraudCaseRepository.countByStatus(CaseStatus.RESOLVED) + fraudCaseRepository.countByStatus(CaseStatus.CLEAN),
                fraudCaseRepository.countByPriority(CasePriority.CRITICAL),
                avgRisk == null ? 0.0 : avgRisk
        );
    }

    public AdminDashboardResponse adminSummaryLast24h() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        Double avgRisk = transactionRecordRepository.avgRiskSince(since);

        List<CaseViewResponse> topPriorityAlerts = fraudCaseService.listOperationalQueue().stream()
                .limit(10)
                .toList();

        return new AdminDashboardResponse(
                transactionRecordRepository.countByCreatedAtAfter(since),
                fraudCaseRepository.countByCreatedAtAfter(since),
                fraudCaseRepository.countByStatus(CaseStatus.OPEN),
                fraudCaseRepository.countByStatus(CaseStatus.INVESTIGATE),
                fraudCaseRepository.countByStatus(CaseStatus.RESOLVED) + fraudCaseRepository.countByStatus(CaseStatus.CLEAN),
                fraudCaseRepository.countByPriority(CasePriority.CRITICAL),
                avgRisk == null ? 0.0 : avgRisk,
                topPriorityAlerts
        );
    }

    public FraudInvestigatorDashboardResponse investigatorDashboard(String assignee) {
        List<CaseViewResponse> queue = (assignee == null || assignee.isBlank())
                ? fraudCaseService.listOperationalQueue()
                : fraudCaseService.listByAssignee(assignee);

        long assignedOpen = queue.stream().filter(item -> item.status() == CaseStatus.OPEN).count();
        long assignedInvestigate = queue.stream().filter(item -> item.status() == CaseStatus.INVESTIGATE).count();
        long criticalOpen = queue.stream()
                .filter(item -> item.status() == CaseStatus.OPEN || item.status() == CaseStatus.INVESTIGATE)
                .filter(item -> item.priority() == CasePriority.CRITICAL || item.priority() == CasePriority.HIGH)
                .count();

        return new FraudInvestigatorDashboardResponse(
                (assignee == null || assignee.isBlank()) ? "UNASSIGNED_VIEW" : assignee,
                assignedOpen,
                assignedInvestigate,
                queue.size(),
                criticalOpen,
                queue
        );
    }

    public AlertDashboardResponse alertDashboard(String alertId) {
        FraudCase fraudCase = fraudCaseService.getCaseEntityByAlertId(alertId);
        List<AuditEventResponse> trail = auditTrailQueryService.getEntityTrail("CASE", alertId);

        AlertDashboardResponse.AlertTransactionSnapshot snapshot = new AlertDashboardResponse.AlertTransactionSnapshot(
                fraudCase.getTransaction().getTid(),
                fraudCase.getTransaction().getAmount(),
                fraudCase.getTransaction().getCurrency(),
                fraudCase.getTransaction().getSenderAccountId(),
                fraudCase.getTransaction().getReceiverAccountId(),
                fraudCase.getTransaction().getSenderCountry(),
                fraudCase.getTransaction().getReceiverCountry(),
                fraudCase.getTransaction().getLocation(),
                fraudCase.getTransaction().getDeviceId(),
                fraudCase.getTransaction().getCreditScore(),
                fraudCase.getTransaction().getStatus(),
                fraudCase.getTransaction().getRiskScore(),
                fraudCase.getTransaction().getPrimaryReason(),
                fraudCase.getTransaction().getCreatedAt()
        );

        return new AlertDashboardResponse(
                new CaseViewResponse(
                        fraudCase.getAlertId(),
                        fraudCase.getTransaction().getTid(),
                        fraudCase.getRiskScore(),
                        fraudCase.getPrimaryReason(),
                        fraudCase.getPriority(),
                        fraudCase.getStatus(),
                        fraudCase.getAssignedTo(),
                        fraudCase.getReopenCount(),
                        fraudCase.getSlaDeadline(),
                        fraudCase.getCreatedAt(),
                        fraudCase.getUpdatedAt()
                ),
                snapshot,
                trail
        );
    }
}
