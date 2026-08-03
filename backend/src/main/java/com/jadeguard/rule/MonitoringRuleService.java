package com.jadeguard.rule;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jadeguard.audit.AuditEventService;
import com.jadeguard.security.CurrentUserService;
import com.jadeguard.security.UserEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MonitoringRuleService {

    private final MonitoringRuleRepository repository;
    private final RuleConfigurationValidator configurationValidator;
    private final AuditEventService auditService;
    private final CurrentUserService currentUserService;
    private final ObjectMapper objectMapper;

    public MonitoringRuleService(
            MonitoringRuleRepository repository,
            RuleConfigurationValidator configurationValidator,
            AuditEventService auditService,
            CurrentUserService currentUserService,
            ObjectMapper objectMapper
    ) {
        this.repository = repository;
        this.configurationValidator = configurationValidator;
        this.auditService = auditService;
        this.currentUserService = currentUserService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public RuleResponse createRule(RuleRequest request) {
        configurationValidator.validate(request);
        if (repository.existsByCode(request.code())) {
            throw new DuplicateRuleCodeException(request.code());
        }

        Instant now = Instant.now();
        MonitoringRuleEntity rule = new MonitoringRuleEntity(
                UUID.randomUUID(),
                request.code(),
                request.name(),
                request.type(),
                request.enabled(),
                request.severity(),
                request.riskWeight(),
                request.parameters(),
                now,
                now
        );
        MonitoringRuleEntity saved = repository.save(rule);
        UserEntity actor = currentUserService.requireCurrentUser();
        auditService.recordUserEvent(
                actor,
                "RULE_CREATED",
                "RULE",
                saved.getId(),
                null,
                objectMapper.valueToTree(RuleResponse.from(saved)),
                reasonOrDefault(request.reason(), "Rule created")
        );
        return RuleResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<RuleResponse> getRules(RuleType type, Boolean enabled) {
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .filter(rule -> type == null || rule.getType() == type)
                .filter(rule -> enabled == null
                        || rule.isEnabled() == enabled)
                .map(RuleResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public RuleResponse getRule(UUID ruleId) {
        return RuleResponse.from(findRule(ruleId));
    }

    @Transactional
    public RuleResponse replaceRule(UUID ruleId, RuleRequest request) {
        configurationValidator.validate(request);
        MonitoringRuleEntity rule = findRule(ruleId);
        if (repository.existsByCodeAndIdNot(request.code(), ruleId)) {
            throw new DuplicateRuleCodeException(request.code());
        }

        var previousValue = objectMapper.valueToTree(RuleResponse.from(rule));
        rule.replaceConfiguration(request, Instant.now());
        MonitoringRuleEntity saved = repository.save(rule);
        auditService.recordUserEvent(
                currentUserService.requireCurrentUser(),
                "RULE_UPDATED",
                "RULE",
                saved.getId(),
                previousValue,
                objectMapper.valueToTree(RuleResponse.from(saved)),
                reasonOrDefault(request.reason(), "Rule configuration updated")
        );
        return RuleResponse.from(saved);
    }

    @Transactional
    public RuleResponse changeStatus(
            UUID ruleId,
            RuleStatusRequest request
    ) {
        MonitoringRuleEntity rule = findRule(ruleId);
        var previousValue = objectMapper.valueToTree(RuleResponse.from(rule));
        rule.changeStatus(request.enabled(), Instant.now());
        MonitoringRuleEntity saved = repository.save(rule);
        auditService.recordUserEvent(
                currentUserService.requireCurrentUser(),
                request.enabled() ? "RULE_ENABLED" : "RULE_DISABLED",
                "RULE",
                saved.getId(),
                previousValue,
                objectMapper.valueToTree(RuleResponse.from(saved)),
                request.reason()
        );
        return RuleResponse.from(saved);
    }

    private MonitoringRuleEntity findRule(UUID ruleId) {
        return repository.findById(ruleId)
                .orElseThrow(() -> new RuleNotFoundException(ruleId));
    }

    private String reasonOrDefault(String reason, String fallback) {
        return reason == null || reason.isBlank() ? fallback : reason;
    }
}
