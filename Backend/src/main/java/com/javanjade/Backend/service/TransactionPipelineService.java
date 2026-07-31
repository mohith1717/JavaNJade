package com.javanjade.Backend.service;

import com.javanjade.Backend.dto.TransactionDecisionResponse;
import com.javanjade.Backend.dto.TransactionProcessRequest;
import com.javanjade.Backend.dto.TriggeredRuleDto;
import com.javanjade.Backend.model.FraudCase;
import com.javanjade.Backend.model.TransactionRecord;
import com.javanjade.Backend.model.TransactionStatus;
import com.javanjade.Backend.repository.TransactionRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TransactionPipelineService {

    private static final int DENY_THRESHOLD = 65;

    private final ValidationService validationService;
    private final RuleEngineService ruleEngineService;
    private final RiskEvaluationService riskEvaluationService;
    private final TransactionRecordRepository transactionRecordRepository;
    private final FraudCaseService fraudCaseService;
    private final AuditLogService auditLogService;

    public TransactionPipelineService(ValidationService validationService,
                                      RuleEngineService ruleEngineService,
                                      RiskEvaluationService riskEvaluationService,
                                      TransactionRecordRepository transactionRecordRepository,
                                      FraudCaseService fraudCaseService,
                                      AuditLogService auditLogService) {
        this.validationService = validationService;
        this.ruleEngineService = ruleEngineService;
        this.riskEvaluationService = riskEvaluationService;
        this.transactionRecordRepository = transactionRecordRepository;
        this.fraudCaseService = fraudCaseService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public TransactionDecisionResponse process(TransactionProcessRequest request) {
                try {
                        validationService.validate(request);
                } catch (BusinessException exception) {
                        auditLogService.append(
                                        "TRANSACTION",
                                        safeTransactionId(request.transactionId()),
                                        "TRANSACTION_VALIDATION_FAILED",
                                        "system",
                                        "code=" + exception.getCode() + ", message=" + exception.getMessage());
                        throw exception;
                }

        var triggeredRules = ruleEngineService.evaluate(request);
        var evaluation = riskEvaluationService.evaluate(triggeredRules);

        TransactionRecord transaction = new TransactionRecord();
        transaction.setTid(request.transactionId());
        transaction.setAmount(request.amount());
        transaction.setCurrency(request.currency().toUpperCase());
        transaction.setSenderAccountId(request.senderAccountId());
        transaction.setReceiverAccountId(request.receiverAccountId());
        transaction.setSenderCountry(request.senderCountry());
        transaction.setReceiverCountry(request.receiverCountry());
        transaction.setLocation(request.location());
        transaction.setDeviceId(request.deviceId());
        transaction.setCreditScore(request.creditScore());
        transaction.setRiskScore(evaluation.riskScore());
        transaction.setPrimaryReason(evaluation.primaryReason());

        TransactionStatus decision = evaluation.riskScore() >= DENY_THRESHOLD
                ? TransactionStatus.DENIED
                : TransactionStatus.APPROVED;
        transaction.setStatus(decision);

        TransactionRecord saved = transactionRecordRepository.save(transaction);

        auditLogService.append("TRANSACTION", saved.getTid(), "TRANSACTION_PROCESSED", "system",
                "decision=" + decision + ", riskScore=" + evaluation.riskScore()
                        + ", reason=" + evaluation.primaryReason());

                FraudCase fraudCase = null;
                if (decision == TransactionStatus.DENIED || evaluation.riskScore() >= 45 || isCrossCountry(request)) {
            fraudCase = fraudCaseService.createCaseForTransaction(saved);
        }

        return new TransactionDecisionResponse(
                saved.getTid(),
                decision,
                evaluation.riskScore(),
                evaluation.explanation(),
                evaluation.triggeredRules().stream()
                        .map(rule -> new TriggeredRuleDto(rule.ruleName(), rule.reason(), rule.riskWeight()))
                        .toList(),
                fraudCase != null ? fraudCase.getAlertId() : null,
                fraudCase != null ? fraudCase.getStatus() : null,
                fraudCase != null ? fraudCase.getPriority() : null
        );
    }

        private boolean isCrossCountry(TransactionProcessRequest request) {
                if (request.senderCountry() == null || request.receiverCountry() == null) {
                        return false;
                }
                return !request.senderCountry().equalsIgnoreCase(request.receiverCountry());
        }

        private String safeTransactionId(String transactionId) {
                if (transactionId == null || transactionId.isBlank()) {
                        return "UNKNOWN";
                }
                return transactionId;
        }
}
