package com.jadeguard.report;

import java.util.Map;
import com.jadeguard.alert.AlertDecision;
import com.jadeguard.alert.AlertPriority;
import com.jadeguard.alert.AlertStatus;

public record AlertSummaryResponse(long totalAlerts,
        Map<AlertStatus, Long> statusDistribution,
        Map<AlertPriority, Long> priorityDistribution,
        Map<AlertDecision, Long> decisionDistribution) { }
