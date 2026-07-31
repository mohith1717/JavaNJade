package com.javanjade.Backend.api;

import com.javanjade.Backend.dto.CaseActionRequest;
import com.javanjade.Backend.dto.CaseViewResponse;
import com.javanjade.Backend.model.CaseStatus;
import com.javanjade.Backend.service.FraudCaseService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cases")
public class CaseManagementController {

    private final FraudCaseService fraudCaseService;

    public CaseManagementController(FraudCaseService fraudCaseService) {
        this.fraudCaseService = fraudCaseService;
    }

    @GetMapping
    public List<CaseViewResponse> list(@RequestParam(required = false) CaseStatus status) {
        if (status == null) {
            return fraudCaseService.listAll();
        }
        return fraudCaseService.listByStatus(status);
    }

    @GetMapping("/{alertId}")
    public CaseViewResponse get(@PathVariable String alertId) {
        return fraudCaseService.getByAlertId(alertId);
    }

    @PostMapping("/{alertId}/assign")
    public CaseViewResponse assign(@PathVariable String alertId, @Valid @RequestBody CaseActionRequest request) {
        return fraudCaseService.assign(alertId, request);
    }

    @PostMapping("/{alertId}/investigate")
    public CaseViewResponse investigate(@PathVariable String alertId, @Valid @RequestBody CaseActionRequest request) {
        return fraudCaseService.investigate(alertId, request);
    }

    @PostMapping("/{alertId}/resolve")
    public CaseViewResponse resolve(@PathVariable String alertId, @Valid @RequestBody CaseActionRequest request) {
        return fraudCaseService.resolve(alertId, request);
    }

    @PostMapping("/{alertId}/reopen")
    public CaseViewResponse reopen(@PathVariable String alertId,
                                   @RequestParam String actor,
                                   @RequestParam(required = false) String reason) {
        return fraudCaseService.reopenHighPriority(alertId, actor, reason);
    }
}
