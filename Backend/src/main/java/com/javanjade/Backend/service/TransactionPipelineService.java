package com.javanjade.Backend.service;

import com.javanjade.Backend.dto.TransactionDecisionResponse;
import com.javanjade.Backend.dto.TransactionProcessRequest;
import com.javanjade.Backend.dto.TransactionViewResponse;
import com.javanjade.Backend.dto.TriggeredRuleDto;
import com.javanjade.Backend.model.FraudCase;
import com.javanjade.Backend.model.TransactionRecord;
import com.javanjade.Backend.model.TransactionStatus;
import com.javanjade.Backend.repository.TransactionRecordRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
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
        validationService.validate(request);

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
        if (decision == TransactionStatus.DENIED || evaluation.riskScore() >= 45) {
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

        @Transactional(readOnly = true)
        public List<TransactionViewResponse> listRecentTransactions() {
                return transactionRecordRepository.findAll().stream()
                                .sorted(Comparator.comparing(TransactionRecord::getCreatedAt).reversed())
                                .limit(200)
                                .map(this::toView)
                                .toList();
        }

        @Transactional(readOnly = true)
        public Optional<TransactionViewResponse> getTransaction(String transactionId) {
                return transactionRecordRepository.findByTid(transactionId).map(this::toView);
        }

        private TransactionViewResponse toView(TransactionRecord transaction) {
                return new TransactionViewResponse(
                                transaction.getTid(),
                                transaction.getAmount(),
                                transaction.getCurrency(),
                                transaction.getSenderAccountId(),
                                transaction.getReceiverAccountId(),
                                transaction.getSenderCountry(),
                                transaction.getReceiverCountry(),
                                transaction.getLocation(),
                                transaction.getDeviceId(),
                                transaction.getCreditScore(),
                                transaction.getStatus(),
                                transaction.getRiskScore(),
                                transaction.getPrimaryReason(),
                                transaction.getCreatedAt()
                );
        }
}
