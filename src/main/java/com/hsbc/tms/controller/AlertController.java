package com.hsbc.tms.controller;

import com.hsbc.tms.entity.Alert;
import com.hsbc.tms.service.AlertService;
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
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @PostMapping
    public ResponseEntity<Alert> createAlert(@RequestBody Alert alert) {
        return ResponseEntity.status(HttpStatus.CREATED).body(alertService.createAlert(alert));
    }

    @GetMapping
    public List<Alert> fetchAlerts() {
        return alertService.fetchAlerts();
    }

    @GetMapping("/{alertId}")
    public Alert getAlert(@PathVariable Long alertId) {
        return alertService.getAlert(alertId);
    }

    @PutMapping("/{alertId}")
    public Alert updateAlert(@PathVariable Long alertId, @RequestBody Alert alert) {
        return alertService.updateAlert(alertId, alert);
    }

    @DeleteMapping("/{alertId}")
    public ResponseEntity<Void> deleteAlert(@PathVariable Long alertId) {
        alertService.deleteAlert(alertId);
        return ResponseEntity.noContent().build();
    }
}
