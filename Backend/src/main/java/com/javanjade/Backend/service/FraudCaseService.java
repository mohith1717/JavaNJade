package com.javanjade.Backend.service;

import com.javanjade.Backend.dto.CaseActionRequest;
import com.javanjade.Backend.dto.CaseViewResponse;
import com.javanjade.Backend.model.CasePriority;
import com.javanjade.Backend.model.CaseStatus;
import com.javanjade.Backend.model.FraudCase;
import com.javanjade.Backend.model.TransactionRecord;
import com.javanjade.Backend.repository.FraudCaseRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FraudCaseService {

    private final FraudCaseRepository fraudCaseRepository;
    private final AuditLogService auditLogService;

    public FraudCaseService(FraudCaseRepository fraudCaseRepository, AuditLogService auditLogService) {
        this.fraudCaseRepository = fraudCaseRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public FraudCase createCaseForTransaction(TransactionRecord transaction) {
        FraudCase fraudCase = new FraudCase();
        fraudCase.setAlertId("ALERT-" + transaction.getTid());
        fraudCase.setTransaction(transaction);
        fraudCase.setRiskScore(transaction.getRiskScore());
        fraudCase.setPrimaryReason(transaction.getPrimaryReason());
        CasePriority computedPriority = mapPriority(transaction.getRiskScore());
        if (isCrossCountryPayment(transaction)) {
            computedPriority = CasePriority.CRITICAL;
        }
        fraudCase.setPriority(computedPriority);
        fraudCase.setStatus(CaseStatus.OPEN);
        fraudCase.setSlaDeadline(defaultSlaByPriority(fraudCase.getPriority()));
        FraudCase saved = fraudCaseRepository.save(fraudCase);

        auditLogService.append("CASE", saved.getAlertId(), "CASE_CREATED", "system",
                "Case created for transaction=" + transaction.getTid()
                        + ", risk=" + transaction.getRiskScore());
        return saved;
    }

    public List<CaseViewResponse> listAll() {
        return fraudCaseRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<CaseViewResponse> listByStatus(CaseStatus status) {
        return fraudCaseRepository.findByStatusOrderByPriorityDescCreatedAtAsc(status).stream()
                .map(this::toResponse)
                .toList();
    }

    public CaseViewResponse getByAlertId(String alertId) {
        return toResponse(findCase(alertId));
    }

    public FraudCase getCaseEntityByAlertId(String alertId) {
        return findCase(alertId);
    }

    public List<CaseViewResponse> listByAssignee(String assignee) {
        return fraudCaseRepository.findByAssignedToOrderByPriorityDescCreatedAtAsc(assignee).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<CaseViewResponse> listOperationalQueue() {
        Set<CaseStatus> active = Set.of(CaseStatus.OPEN, CaseStatus.ASSIGNED, CaseStatus.INVESTIGATE);
        return fraudCaseRepository.findAll().stream()
                .filter(fraudCase -> active.contains(fraudCase.getStatus()))
                .sorted((left, right) -> {
                    int priorityCompare = right.getPriority().compareTo(left.getPriority());
                    if (priorityCompare != 0) {
                        return priorityCompare;
                    }
                    return left.getCreatedAt().compareTo(right.getCreatedAt());
                })
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CaseViewResponse assign(String alertId, CaseActionRequest request) {
        FraudCase fraudCase = findCase(alertId);
        if (fraudCase.getStatus() != CaseStatus.OPEN) {
            throw new BusinessException("INVALID_CASE_STATE",
                "Case must be OPEN before assignment",
                HttpStatus.BAD_REQUEST);
        }
        if (request.assignee() == null || request.assignee().isBlank()) {
            throw new BusinessException("ASSIGNEE_REQUIRED",
                "Assignee is required to assign a case",
                HttpStatus.BAD_REQUEST);
        }
        fraudCase.setAssignedTo(request.assignee());
        fraudCase.setStatus(CaseStatus.ASSIGNED);
        auditLogService.append("CASE", alertId, "CASE_ASSIGNED", request.actor(),
                "Assigned to=" + request.assignee() + ", notes=" + nullSafe(request.notes()));
        return toResponse(fraudCase);
    }

    @Transactional
    public CaseViewResponse investigate(String alertId, CaseActionRequest request) {
        FraudCase fraudCase = findCase(alertId);
        if (fraudCase.getStatus() != CaseStatus.ASSIGNED) {
            throw new BusinessException("INVALID_CASE_STATE",
                "Case must be ASSIGNED before investigation",
                HttpStatus.BAD_REQUEST);
        }
        enforceAssignedInvestigator(fraudCase, request.actor());
        fraudCase.setStatus(CaseStatus.INVESTIGATE);
        auditLogService.append("CASE", alertId, "CASE_INVESTIGATE", request.actor(),
                "Investigation started. notes=" + nullSafe(request.notes()));
        return toResponse(fraudCase);
    }

    @Transactional
    public CaseViewResponse resolve(String alertId, CaseActionRequest request) {
        FraudCase fraudCase = findCase(alertId);
        if (fraudCase.getStatus() != CaseStatus.INVESTIGATE) {
            throw new BusinessException("INVALID_CASE_STATE",
                    "Case must be in INVESTIGATE state before resolution",
                    HttpStatus.BAD_REQUEST);
        }
        enforceAssignedInvestigator(fraudCase, request.actor());
        fraudCase.setStatus(request.clean() ? CaseStatus.CLEAN : CaseStatus.RESOLVED);
        auditLogService.append("CASE", alertId, "CASE_RESOLVED", request.actor(),
                "Outcome=" + fraudCase.getStatus() + ", notes=" + nullSafe(request.notes()));
        return toResponse(fraudCase);
    }

    @Transactional
    public CaseViewResponse reopenHighPriority(String alertId, String actor, String reason) {
        FraudCase fraudCase = findCase(alertId);
        fraudCase.setStatus(CaseStatus.OPEN);
        fraudCase.setPriority(CasePriority.HIGH);
        fraudCase.setReopenCount(fraudCase.getReopenCount() + 1);
        fraudCase.setSlaDeadline(defaultSlaByPriority(CasePriority.HIGH));

        auditLogService.append("CASE", alertId, "CASE_REOPENED", actor,
                "Case reopened with HIGH priority. reason=" + nullSafe(reason));
        return toResponse(fraudCase);
    }

    private FraudCase findCase(String alertId) {
        return fraudCaseRepository.findByAlertId(alertId)
                .orElseThrow(() -> new BusinessException("CASE_NOT_FOUND",
                        "No case found for alertId=" + alertId,
                        HttpStatus.NOT_FOUND));
    }

    private CaseViewResponse toResponse(FraudCase fraudCase) {
        return new CaseViewResponse(
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
        );
    }

    private CasePriority mapPriority(int score) {
        if (score >= 85) {
            return CasePriority.CRITICAL;
        }
        if (score >= 65) {
            return CasePriority.HIGH;
        }
        if (score >= 35) {
            return CasePriority.MEDIUM;
        }
        return CasePriority.LOW;
    }

    private boolean isCrossCountryPayment(TransactionRecord transaction) {
        if (transaction.getSenderCountry() == null || transaction.getReceiverCountry() == null) {
            return false;
        }
        return !transaction.getSenderCountry().equalsIgnoreCase(transaction.getReceiverCountry());
    }

    private LocalDateTime defaultSlaByPriority(CasePriority priority) {
        LocalDateTime now = LocalDateTime.now();
        return switch (priority) {
            case CRITICAL -> now.plusHours(1);
            case HIGH -> now.plusHours(4);
            case MEDIUM -> now.plusHours(12);
            case LOW -> now.plusHours(24);
        };
    }

    private String nullSafe(String text) {
        return text == null ? "" : text;
    }

    private void enforceAssignedInvestigator(FraudCase fraudCase, String actor) {
        if (fraudCase.getAssignedTo() == null || fraudCase.getAssignedTo().isBlank()) {
            throw new BusinessException("CASE_NOT_ASSIGNED",
                    "Case is not assigned to any investigator",
                    HttpStatus.BAD_REQUEST);
        }
        if (!fraudCase.getAssignedTo().equalsIgnoreCase(actor)) {
            throw new BusinessException("ASSIGNEE_MISMATCH",
                    "Only the assigned investigator can perform this action",
                    HttpStatus.FORBIDDEN);
        }
    }
}
