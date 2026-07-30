package com.hsbc.tms.service;

import com.hsbc.tms.entity.Alert;
import com.hsbc.tms.enums.AlertStatus;
import com.hsbc.tms.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;

    public Alert createAlert(Alert alert) {
        if (alert.getStatus() == null) {
            alert.setStatus(AlertStatus.NEW);
        }
        if (alert.getCreatedAt() == null) {
            alert.setCreatedAt(LocalDateTime.now());
        }
        return alertRepository.save(alert);
    }

    public Alert updateAlert(Long alertId, Alert updatedAlert) {
        Alert alert = getAlertById(alertId);
        alert.setMessage(updatedAlert.getMessage());
        alert.setSeverity(updatedAlert.getSeverity());
        alert.setStatus(updatedAlert.getStatus());
        return alertRepository.save(alert);
    }

    public Alert getAlert(Long alertId) {
        return getAlertById(alertId);
    }

    public List<Alert> fetchAlerts() {
        return alertRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public void deleteAlert(Long alertId) {
        alertRepository.delete(getAlertById(alertId));
    }

    private Alert getAlertById(Long alertId) {
        return alertRepository.findById(alertId)
                .orElseThrow(() -> new IllegalArgumentException("Alert not found: " + alertId));
    }
}
