package com.javanjade.Backend.service;

import com.javanjade.Backend.dto.RuleUpsertRequest;
import com.javanjade.Backend.dto.RuleViewResponse;
import com.javanjade.Backend.model.FraudRule;
import com.javanjade.Backend.model.RuleType;
import com.javanjade.Backend.repository.FraudRuleRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RuleAdminService {

    private final FraudRuleRepository fraudRuleRepository;
    private final AuditLogService auditLogService;

    public RuleAdminService(FraudRuleRepository fraudRuleRepository, AuditLogService auditLogService) {
        this.fraudRuleRepository = fraudRuleRepository;
        this.auditLogService = auditLogService;
    }

    public List<RuleViewResponse> listRules() {
        return fraudRuleRepository.findAll().stream().map(this::toView).toList();
    }

    @Transactional
    public RuleViewResponse upsertRule(RuleUpsertRequest request, String actor) {
        FraudRule rule = fraudRuleRepository.findByType(request.type()).orElseGet(FraudRule::new);
        boolean isCreate = rule.getId() == null;
        merge(rule, request);
        FraudRule saved = fraudRuleRepository.save(rule);

        auditLogService.append("RULE", String.valueOf(saved.getType()), isCreate ? "RULE_CREATED" : "RULE_UPDATED",
                actor, "enabled=" + saved.isEnabled() + ", riskWeight=" + saved.getRiskWeight());

        return toView(saved);
    }

    @Transactional
    public RuleViewResponse toggleRule(RuleType type, boolean enabled, String actor) {
        FraudRule rule = fraudRuleRepository.findByType(type)
                .orElseThrow(() -> new BusinessException("RULE_NOT_FOUND", "Rule not found: " + type,
                        HttpStatus.NOT_FOUND));
        rule.setEnabled(enabled);
        auditLogService.append("RULE", String.valueOf(rule.getType()), "RULE_TOGGLED", actor,
                "enabled=" + enabled);
        return toView(rule);
    }

    private void merge(FraudRule rule, RuleUpsertRequest request) {
        rule.setName(request.name());
        rule.setType(request.type());
        rule.setDescription(request.description());
        rule.setEnabled(request.enabled());
        rule.setRiskWeight(request.riskWeight());
        rule.setAmountThreshold(request.amountThreshold());
        rule.setIntThreshold(request.intThreshold());
        rule.setSecondaryIntThreshold(request.secondaryIntThreshold());
        rule.setStringThreshold(request.stringThreshold());
    }

    private RuleViewResponse toView(FraudRule rule) {
        return new RuleViewResponse(
                rule.getId(),
                rule.getName(),
                rule.getType(),
                rule.getDescription(),
                rule.isEnabled(),
                rule.getRiskWeight(),
                rule.getAmountThreshold(),
                rule.getIntThreshold(),
                rule.getSecondaryIntThreshold(),
                rule.getStringThreshold()
        );
    }
}
