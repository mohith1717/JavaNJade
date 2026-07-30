package com.hsbc.tms.service;

import com.hsbc.tms.entity.Rule;
import com.hsbc.tms.entity.Transaction;
import com.hsbc.tms.enums.RuleStatus;
import com.hsbc.tms.repository.RuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RuleService {

    private final RuleRepository ruleRepository;

    public Rule createRule(Rule rule) {
        return ruleRepository.save(rule);
    }

    public List<Rule> fetchRules() {
        return ruleRepository.findAll();
    }

    public List<Rule> loadRules() {
        return fetchRules().stream()
                .filter(rule -> rule.getStatus() == RuleStatus.ACTIVE)
                .toList();
    }

    public Rule getRule(Long ruleId) {
        return getRuleById(ruleId);
    }

    public Rule updateRule(Long ruleId, Rule updatedRule) {
        Rule rule = getRuleById(ruleId);
        rule.setName(updatedRule.getName());
        rule.setDescription(updatedRule.getDescription());
        rule.setThresholdAmount(updatedRule.getThresholdAmount());
        rule.setStatus(updatedRule.getStatus());
        return ruleRepository.save(rule);
    }

    public void deleteRule(Long ruleId) {
        ruleRepository.delete(getRuleById(ruleId));
    }

    public List<Rule> evaluateRules(Transaction transaction) {
        if (transaction.getAmount() == null) {
            return List.of();
        }

        return loadRules().stream()
                .filter(rule -> rule.getThresholdAmount() != null)
                .filter(rule -> transaction.getAmount().compareTo(rule.getThresholdAmount()) >= 0)
                .toList();
    }

    private Rule getRuleById(Long ruleId) {
        return ruleRepository.findById(ruleId)
                .orElseThrow(() -> new IllegalArgumentException("Rule not found: " + ruleId));
    }
}
