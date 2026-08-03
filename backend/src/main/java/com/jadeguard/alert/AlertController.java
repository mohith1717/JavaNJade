package com.jadeguard.alert;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import com.jadeguard.security.CurrentUserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;
    private final CurrentUserService currentUserService;

    public AlertController(
            AlertService alertService,
            CurrentUserService currentUserService
    ) {
        this.alertService = alertService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<AlertResponse> getAlerts(
            @RequestParam(required = false) AlertStatus status,
            @RequestParam(required = false) AlertPriority priority,
            @RequestParam(required = false) String assignedTo,
            @RequestParam(required = false) UUID transactionId
    ) {
        return alertService.getAlerts(
                status,
                priority,
                assignedTo,
                transactionId
        );
    }

    @GetMapping("/{alertId}")
    public AlertDetailResponse getAlert(@PathVariable UUID alertId) {
        return alertService.getAlert(alertId);
    }

    @PostMapping("/{alertId}/assign")
    public AlertResponse assign(
            @PathVariable UUID alertId,
            @Valid @RequestBody AssignAlertRequest request
    ) {
        return alertService.assign(
                alertId,
                request,
                currentUserService.requireCurrentUser()
        );
    }

    @PostMapping("/{alertId}/start-investigation")
    public AlertResponse startInvestigation(
            @PathVariable UUID alertId,
            @Valid @RequestBody AlertActionRequest request
    ) {
        return alertService.startInvestigation(
                alertId,
                request,
                currentUserService.requireCurrentUser()
        );
    }

    @PostMapping("/{alertId}/approve")
    public AlertResponse approve(
            @PathVariable UUID alertId,
            @Valid @RequestBody AlertActionRequest request
    ) {
        return alertService.approve(
                alertId,
                request,
                currentUserService.requireCurrentUser()
        );
    }

    @PostMapping("/{alertId}/block")
    public AlertResponse block(
            @PathVariable UUID alertId,
            @Valid @RequestBody AlertActionRequest request
    ) {
        return alertService.block(
                alertId,
                request,
                currentUserService.requireCurrentUser()
        );
    }

    @PostMapping("/{alertId}/escalate")
    public AlertResponse escalate(
            @PathVariable UUID alertId,
            @Valid @RequestBody AlertActionRequest request
    ) {
        return alertService.escalate(
                alertId,
                request,
                currentUserService.requireCurrentUser()
        );
    }

    @PostMapping("/{alertId}/close")
    public AlertResponse close(
            @PathVariable UUID alertId,
            @Valid @RequestBody AlertActionRequest request
    ) {
        return alertService.close(
                alertId,
                request,
                currentUserService.requireCurrentUser()
        );
    }

    @PostMapping("/{alertId}/reopen")
    public AlertResponse reopen(
            @PathVariable UUID alertId,
            @Valid @RequestBody AlertActionRequest request
    ) {
        return alertService.reopen(
                alertId,
                request,
                currentUserService.requireCurrentUser()
        );
    }
}
