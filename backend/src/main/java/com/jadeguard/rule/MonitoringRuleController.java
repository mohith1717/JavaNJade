package com.jadeguard.rule;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rules")
public class MonitoringRuleController {

    private final MonitoringRuleService ruleService;

    public MonitoringRuleController(MonitoringRuleService ruleService) {
        this.ruleService = ruleService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RuleResponse createRule(
            @Valid @RequestBody RuleRequest request
    ) {
        return ruleService.createRule(request);
    }

    @GetMapping
    public List<RuleResponse> getRules(
            @RequestParam(required = false) RuleType type,
            @RequestParam(required = false) Boolean enabled
    ) {
        return ruleService.getRules(type, enabled);
    }

    @GetMapping("/{ruleId}")
    public RuleResponse getRule(@PathVariable UUID ruleId) {
        return ruleService.getRule(ruleId);
    }

    @PutMapping("/{ruleId}")
    public RuleResponse replaceRule(
            @PathVariable UUID ruleId,
            @Valid @RequestBody RuleRequest request
    ) {
        return ruleService.replaceRule(ruleId, request);
    }

    @PatchMapping("/{ruleId}/status")
    public RuleResponse changeStatus(
            @PathVariable UUID ruleId,
            @Valid @RequestBody RuleStatusRequest request
    ) {
        return ruleService.changeStatus(ruleId, request);
    }
}
