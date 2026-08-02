package com.jadeguard.risk;

import java.time.Instant;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.jadeguard.rule.MonitoringRuleEntity;
import com.jadeguard.rule.MonitoringRuleRepository;
import com.jadeguard.rule.RuleType;
import com.jadeguard.transaction.ProcessingStatus;
import com.jadeguard.transaction.RiskLevel;
import com.jadeguard.transaction.TransactionEntity;
import com.jadeguard.transaction.TransactionNotFoundException;
import com.jadeguard.transaction.TransactionRepository;
import com.jadeguard.transaction.TransactionRouteHopRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RiskAssessmentService {

    private final TransactionRepository transactionRepository;
    private final TransactionRouteHopRepository routeHopRepository;
    private final MonitoringRuleRepository ruleRepository;
    private final RuleEvaluationRepository evaluationRepository;
    private final Map<RuleType, RuleEvaluator> evaluators;

    public RiskAssessmentService(
            TransactionRepository transactionRepository,
            TransactionRouteHopRepository routeHopRepository,
            MonitoringRuleRepository ruleRepository,
            RuleEvaluationRepository evaluationRepository,
            List<RuleEvaluator> evaluators
    ) {
        this.transactionRepository = transactionRepository;
        this.routeHopRepository = routeHopRepository;
        this.ruleRepository = ruleRepository;
        this.evaluationRepository = evaluationRepository;
        this.evaluators = evaluators.stream().collect(Collectors.toMap(
                RuleEvaluator::supportedType,
                Function.identity(),
                (first, second) -> {
                    throw new IllegalStateException(
                            "Multiple evaluators registered for "
                                    + first.supportedType()
                    );
                },
                () -> new EnumMap<>(RuleType.class)
        ));
    }

    @Transactional
    public TransactionEntity assess(TransactionEntity transaction) {
        if (transaction.getProcessingStatus() != ProcessingStatus.VALIDATED) {
            throw new IllegalStateException(
                    "Only validated transactions can be risk assessed"
            );
        }

        transaction.markAssessingRisk();
        transactionRepository.saveAndFlush(transaction);

        var route = routeHopRepository
                .findByTransactionIdOrderBySequenceAsc(transaction.getId());
        var context = new RuleEvaluationContext(transaction, route);
        Instant evaluatedAt = Instant.now();
        List<RuleEvaluationEntity> evaluations = ruleRepository
                .findByEnabledTrueOrderByCreatedAtAsc().stream()
                .map(rule -> evaluateRule(rule, context, evaluatedAt))
                .toList();
        evaluationRepository.saveAll(evaluations);

        int score = Math.min(
                100,
                evaluations.stream()
                        .mapToInt(RuleEvaluationEntity::getScoreContribution)
                        .sum()
        );
        transaction.markAssessed(score, riskLevel(score));
        return transactionRepository.save(transaction);
    }

    @Transactional(readOnly = true)
    public RiskAssessmentResponse getAssessment(UUID transactionId) {
        TransactionEntity transaction = transactionRepository
                .findById(transactionId)
                .orElseThrow(() -> new TransactionNotFoundException(
                        transactionId
                ));
        if (transaction.getProcessingStatus() != ProcessingStatus.ASSESSED) {
            throw new RiskAssessmentNotAvailableException(transactionId);
        }

        List<RuleEvaluationEntity> evaluations = evaluationRepository
                .findByTransactionIdOrderByEvaluatedAtAsc(transactionId);
        Map<UUID, MonitoringRuleEntity> rulesById = ruleRepository
                .findAllById(evaluations.stream()
                        .map(RuleEvaluationEntity::getRuleId)
                        .toList())
                .stream()
                .collect(Collectors.toMap(
                        MonitoringRuleEntity::getId,
                        Function.identity()
                ));

        List<RuleEvaluationResponse> responses = evaluations.stream()
                .map(evaluation -> toResponse(
                        evaluation,
                        rulesById.get(evaluation.getRuleId())
                ))
                .toList();
        Instant assessedAt = evaluations.stream()
                .map(RuleEvaluationEntity::getEvaluatedAt)
                .max(Instant::compareTo)
                .orElse(transaction.getCreatedAt());

        return new RiskAssessmentResponse(
                transaction.getId(),
                transaction.getProcessingStatus(),
                transaction.getRiskScore(),
                transaction.getRiskLevel(),
                responses,
                assessedAt
        );
    }

    private RuleEvaluationEntity evaluateRule(
            MonitoringRuleEntity rule,
            RuleEvaluationContext context,
            Instant evaluatedAt
    ) {
        RuleEvaluator evaluator = evaluators.get(rule.getType());
        if (evaluator == null) {
            throw new IllegalStateException(
                    "No evaluator registered for rule type " + rule.getType()
            );
        }
        RuleEvaluationResult result = evaluator.evaluate(rule, context);
        return new RuleEvaluationEntity(
                UUID.randomUUID(),
                context.transaction().getId(),
                rule.getId(),
                result.triggered(),
                result.triggered() ? rule.getRiskWeight() : 0,
                result.explanation(),
                evaluatedAt
        );
    }

    private RuleEvaluationResponse toResponse(
            RuleEvaluationEntity evaluation,
            MonitoringRuleEntity rule
    ) {
        if (rule == null) {
            throw new IllegalStateException(
                    "Rule configuration is missing for evaluation "
                            + evaluation.getId()
            );
        }
        return new RuleEvaluationResponse(
                evaluation.getId(),
                rule.getId(),
                rule.getCode(),
                rule.getName(),
                rule.getType(),
                evaluation.isTriggered(),
                evaluation.getScoreContribution(),
                evaluation.getExplanation(),
                evaluation.getEvaluatedAt()
        );
    }

    private RiskLevel riskLevel(int score) {
        if (score >= 80) {
            return RiskLevel.CRITICAL;
        }
        if (score >= 60) {
            return RiskLevel.HIGH;
        }
        if (score >= 30) {
            return RiskLevel.MEDIUM;
        }
        return RiskLevel.LOW;
    }
}
