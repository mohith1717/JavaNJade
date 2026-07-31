package com.javanjade.Backend.api;

import com.javanjade.Backend.dto.RuleUpsertRequest;
import com.javanjade.Backend.dto.RuleViewResponse;
import com.javanjade.Backend.model.RuleType;
import com.javanjade.Backend.service.RuleAdminService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/rules")
public class RuleAdminController {

    private final RuleAdminService ruleAdminService;

    public RuleAdminController(RuleAdminService ruleAdminService) {
        this.ruleAdminService = ruleAdminService;
    }

    @GetMapping
    public List<RuleViewResponse> list() {
        return ruleAdminService.listRules();
    }

    @PostMapping
    public RuleViewResponse upsert(@Valid @RequestBody RuleUpsertRequest request,
                                   @RequestParam(defaultValue = "admin") String actor) {
        return ruleAdminService.upsertRule(request, actor);
    }

    @PostMapping("/{type}/toggle")
    public RuleViewResponse toggle(@PathVariable RuleType type,
                                   @RequestParam boolean enabled,
                                   @RequestParam(defaultValue = "admin") String actor) {
        return ruleAdminService.toggleRule(type, enabled, actor);
    }
}
