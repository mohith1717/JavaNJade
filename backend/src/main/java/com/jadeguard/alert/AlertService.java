package com.jadeguard.alert;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jadeguard.audit.AuditEventEntity;
import com.jadeguard.audit.AuditEventRepository;
import com.jadeguard.risk.RuleEvaluationEntity;
import com.jadeguard.transaction.RiskLevel;
import com.jadeguard.transaction.TransactionEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AlertService {

    private static final String SYSTEM_ACTOR = "SYSTEM_RULE_ENGINE";

    private final AlertRepository alertRepository;
    private final AlertStatusHistoryRepository historyRepository;
    private final AuditEventRepository auditRepository;
    private final ObjectMapper objectMapper;

    public AlertService(
            AlertRepository alertRepository,
            AlertStatusHistoryRepository historyRepository,
            AuditEventRepository auditRepository,
            ObjectMapper objectMapper
    ) {
        this.alertRepository = alertRepository;
        this.historyRepository = historyRepository;
        this.auditRepository = auditRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void generateIfRequired(
            TransactionEntity transaction,
            List<RuleEvaluationEntity> evaluations
    ) {
        if (transaction.getRiskLevel() != RiskLevel.HIGH
                && transaction.getRiskLevel() != RiskLevel.CRITICAL) {
            return;
        }
        if (alertRepository.existsByTransactionId(transaction.getId())) {
            return;
        }

        Instant now = Instant.now();
        var alert = alertRepository.save(new AlertEntity(
                UUID.randomUUID(),
                transaction.getId(),
                AlertStatus.OPEN,
                AlertPriority.valueOf(transaction.getRiskLevel().name()),
                primaryReason(evaluations),
                transaction.getRiskScore(),
                now
        ));
        recordTransition(
                alert,
                null,
                AlertStatus.OPEN,
                "Automatically generated after risk assessment",
                SYSTEM_ACTOR,
                now
        );
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> getAlerts(
            AlertStatus status,
            AlertPriority priority,
            String assignedTo,
            UUID transactionId
    ) {
        return alertRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(alert -> status == null || alert.getStatus() == status)
                .filter(alert -> priority == null
                        || alert.getPriority() == priority)
                .filter(alert -> assignedTo == null
                        || assignedTo.equals(alert.getAssignedTo()))
                .filter(alert -> transactionId == null
                        || transactionId.equals(alert.getTransactionId()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AlertDetailResponse getAlert(UUID alertId) {
        AlertEntity alert = findAlert(alertId);
        return new AlertDetailResponse(
                alert.getId(),
                alert.getTransactionId(),
                alert.getStatus(),
                alert.getPriority(),
                alert.getPrimaryReason(),
                alert.getRiskScore(),
                alert.getAssignedTo(),
                alert.getAssignedAt(),
                alert.getDecision(),
                alert.getResolutionNotes(),
                alert.getCreatedAt(),
                alert.getInvestigatingAt(),
                alert.getClosedAt(),
                alert.getReopenedAt(),
                alert.getVersion(),
                historyRepository.findByAlertIdOrderByChangedAtAsc(alertId)
        );
    }

    @Transactional
    public AlertResponse assign(UUID alertId, AssignAlertRequest request) {
        AlertEntity alert = findAlert(alertId);
        requireStatus(alert, AlertStatus.OPEN);
        return transition(
                alert,
                AlertStatus.ASSIGNED,
                request.actorId(),
                request.reason(),
                () -> alert.assign(request.assignedTo(), Instant.now())
        );
    }

    @Transactional
    public AlertResponse startInvestigation(
            UUID alertId,
            AlertActionRequest request
    ) {
        AlertEntity alert = findAlert(alertId);
        requireStatus(alert, AlertStatus.ASSIGNED);
        requireAssignedAnalyst(alert, request.actorId());
        return transition(
                alert,
                AlertStatus.INVESTIGATING,
                request.actorId(),
                request.reason(),
                () -> alert.startInvestigation(Instant.now())
        );
    }

    @Transactional
    public AlertResponse approve(UUID alertId, AlertActionRequest request) {
        return decide(alertId, request, AlertDecision.APPROVED);
    }

    @Transactional
    public AlertResponse block(UUID alertId, AlertActionRequest request) {
        return decide(alertId, request, AlertDecision.BLOCKED);
    }

    @Transactional
    public AlertResponse escalate(UUID alertId, AlertActionRequest request) {
        return decide(alertId, request, AlertDecision.ESCALATED);
    }

    @Transactional
    public AlertResponse close(UUID alertId, AlertActionRequest request) {
        AlertEntity alert = findAlert(alertId);
        if (alert.getStatus() != AlertStatus.APPROVED
                && alert.getStatus() != AlertStatus.BLOCKED
                && alert.getStatus() != AlertStatus.ESCALATED) {
            throw invalidTransition(alert, "CLOSED");
        }
        requireAssignedAnalyst(alert, request.actorId());
        return transition(
                alert,
                AlertStatus.CLOSED,
                request.actorId(),
                request.reason(),
                () -> alert.close(request.reason(), Instant.now())
        );
    }

    @Transactional
    public AlertResponse reopen(UUID alertId, AlertActionRequest request) {
        AlertEntity alert = findAlert(alertId);
        requireStatus(alert, AlertStatus.CLOSED);
        if (alert.getPriority() != AlertPriority.HIGH
                && alert.getPriority() != AlertPriority.CRITICAL) {
            throw new InvalidAlertTransitionException(
                    "Only closed HIGH or CRITICAL alerts can be reopened"
            );
        }
        return transition(
                alert,
                AlertStatus.OPEN,
                request.actorId(),
                request.reason(),
                () -> alert.reopen(Instant.now())
        );
    }

    private AlertResponse decide(
            UUID alertId,
            AlertActionRequest request,
            AlertDecision decision
    ) {
        AlertEntity alert = findAlert(alertId);
        requireStatus(alert, AlertStatus.INVESTIGATING);
        requireAssignedAnalyst(alert, request.actorId());
        AlertStatus target = AlertStatus.valueOf(decision.name());
        return transition(
                alert,
                target,
                request.actorId(),
                request.reason(),
                () -> alert.decide(decision)
        );
    }

    private AlertResponse transition(
            AlertEntity alert,
            AlertStatus target,
            String actorId,
            String reason,
            Runnable change
    ) {
        AlertStatus previous = alert.getStatus();
        Instant changedAt = Instant.now();
        change.run();
        AlertEntity saved = alertRepository.save(alert);
        recordTransition(saved, previous, target, reason, actorId, changedAt);
        return toResponse(saved);
    }

    private void recordTransition(
            AlertEntity alert,
            AlertStatus from,
            AlertStatus to,
            String reason,
            String actorId,
            Instant changedAt
    ) {
        historyRepository.save(new AlertStatusHistoryEntity(
                UUID.randomUUID(),
                alert.getId(),
                from,
                to,
                reason,
                actorId,
                changedAt
        ));
        var details = objectMapper.createObjectNode();
        details.put("fromStatus", from == null ? null : from.name());
        details.put("toStatus", to.name());
        details.put("reason", reason);
        if (alert.getAssignedTo() != null) {
            details.put("assignedTo", alert.getAssignedTo());
        }
        auditRepository.save(new AuditEventEntity(
                UUID.randomUUID(),
                actorId,
                "ALERT_STATUS_CHANGED",
                "ALERT",
                alert.getId(),
                details,
                changedAt
        ));
    }

    private String primaryReason(List<RuleEvaluationEntity> evaluations) {
        String reason = evaluations.stream()
                .filter(RuleEvaluationEntity::isTriggered)
                .sorted(Comparator.comparingInt(
                        RuleEvaluationEntity::getScoreContribution
                ).reversed())
                .limit(2)
                .map(RuleEvaluationEntity::getExplanation)
                .reduce((first, second) -> first + " " + second)
                .orElse("Transaction exceeded the configured alert threshold.");
        return reason;
    }

    private AlertEntity findAlert(UUID alertId) {
        return alertRepository.findById(alertId)
                .orElseThrow(() -> new AlertNotFoundException(alertId));
    }

    private void requireStatus(AlertEntity alert, AlertStatus required) {
        if (alert.getStatus() != required) {
            throw invalidTransition(alert, required.name());
        }
    }

    private void requireAssignedAnalyst(AlertEntity alert, String actorId) {
        if (!actorId.equals(alert.getAssignedTo())) {
            throw new InvalidAlertTransitionException(
                    "Only assigned analyst " + alert.getAssignedTo()
                            + " can perform this action"
            );
        }
    }

    private InvalidAlertTransitionException invalidTransition(
            AlertEntity alert,
            String target
    ) {
        return new InvalidAlertTransitionException(
                "Alert cannot move from " + alert.getStatus() + " to " + target
        );
    }

    private AlertResponse toResponse(AlertEntity alert) {
        return new AlertResponse(
                alert.getId(),
                alert.getTransactionId(),
                alert.getStatus(),
                alert.getPriority(),
                alert.getPrimaryReason(),
                alert.getRiskScore(),
                alert.getAssignedTo(),
                alert.getAssignedAt(),
                alert.getDecision(),
                alert.getResolutionNotes(),
                alert.getCreatedAt(),
                alert.getInvestigatingAt(),
                alert.getClosedAt(),
                alert.getReopenedAt(),
                alert.getVersion()
        );
    }
}
