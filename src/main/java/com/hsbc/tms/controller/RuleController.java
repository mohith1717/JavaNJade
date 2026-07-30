package com.hsbc.tms.controller;

import com.hsbc.tms.entity.Rule;
import com.hsbc.tms.entity.Transaction;
import com.hsbc.tms.service.RuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rules")
@RequiredArgsConstructor
public class RuleController {

    private final RuleService ruleService;

    @PostMapping
    public ResponseEntity<Rule> createRule(@RequestBody Rule rule) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ruleService.createRule(rule));
    }

    @GetMapping
    public List<Rule> fetchRules() {
        return ruleService.fetchRules();
    }

    @GetMapping("/{ruleId}")
    public Rule getRule(@PathVariable Long ruleId) {
        return ruleService.getRule(ruleId);
    }

    @PutMapping("/{ruleId}")
    public Rule updateRule(@PathVariable Long ruleId, @RequestBody Rule rule) {
        return ruleService.updateRule(ruleId, rule);
    }

    @DeleteMapping("/{ruleId}")
    public ResponseEntity<Void> deleteRule(@PathVariable Long ruleId) {
        ruleService.deleteRule(ruleId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/evaluate")
    public List<Rule> evaluateRules(@RequestBody Transaction transaction) {
        return ruleService.evaluateRules(transaction);
    }
}
