package com.jadeguard.rule;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MonitoringRuleService {

    private final MonitoringRuleRepository repository;
    private final RuleConfigurationValidator configurationValidator;

    public MonitoringRuleService(
            MonitoringRuleRepository repository,
            RuleConfigurationValidator configurationValidator
    ) {
        this.repository = repository;
        this.configurationValidator = configurationValidator;
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
        return RuleResponse.from(repository.save(rule));
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

        rule.replaceConfiguration(request, Instant.now());
        return RuleResponse.from(repository.save(rule));
    }

    @Transactional
    public RuleResponse changeStatus(
            UUID ruleId,
            RuleStatusRequest request
    ) {
        MonitoringRuleEntity rule = findRule(ruleId);
        rule.changeStatus(request.enabled(), Instant.now());
        return RuleResponse.from(repository.save(rule));
    }

    private MonitoringRuleEntity findRule(UUID ruleId) {
        return repository.findById(ruleId)
                .orElseThrow(() -> new RuleNotFoundException(ruleId));
    }
}
