package com.jadeguard.report;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jadeguard.alert.*;
import com.jadeguard.risk.*;
import com.jadeguard.rule.*;
import com.jadeguard.transaction.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:jadeguard-report-test;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.flyway.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
class ReportingApiIntegrationTests {
    @Autowired MockMvc mockMvc;
    @Autowired TransactionRepository transactions;
    @Autowired TransactionRouteHopRepository hops;
    @Autowired AlertRepository alerts;
    @Autowired RuleEvaluationRepository evaluations;
    @Autowired MonitoringRuleRepository rules;
    @Autowired ObjectMapper objectMapper;

    private UUID highTransactionId;

    @BeforeEach
    void seedReports() {
        alerts.deleteAll(); evaluations.deleteAll(); hops.deleteAll();
        rules.deleteAll(); transactions.deleteAll();
        Instant first = Instant.parse("2026-08-03T06:15:00Z");
        Instant second = Instant.parse("2026-08-03T07:30:00Z");
        UUID lowId = UUID.randomUUID();
        highTransactionId = UUID.randomUUID();
        transactions.save(transaction(lowId, "REPORT-LOW", "5000", "INR",
                first, 0, RiskLevel.LOW));
        transactions.save(transaction(highTransactionId, "REPORT-HIGH", "250000",
                "INR", second, 85, RiskLevel.CRITICAL));
        hops.save(new TransactionRouteHopEntity(UUID.randomUUID(), lowId, 1,
                "IN", "Origin"));
        hops.save(new TransactionRouteHopEntity(UUID.randomUUID(), lowId, 2,
                "GB", "Destination"));
        hops.save(new TransactionRouteHopEntity(UUID.randomUUID(),
                highTransactionId, 1, "IN", "Origin"));
        hops.save(new TransactionRouteHopEntity(UUID.randomUUID(),
                highTransactionId, 2, "MM", "Intermediary"));
        UUID ruleId = UUID.randomUUID();
        rules.save(new MonitoringRuleEntity(ruleId, "REPORT_RULE", "Report rule",
                RuleType.HIGH_AMOUNT, true, RuleSeverity.HIGH, 35,
                objectMapper.createObjectNode().put("currency", "INR")
                        .put("threshold", 200000), first, first));
        evaluations.save(new RuleEvaluationEntity(UUID.randomUUID(), lowId,
                ruleId, false, 0, "not triggered", first));
        evaluations.save(new RuleEvaluationEntity(UUID.randomUUID(),
                highTransactionId, ruleId, true, 35, "triggered", second));
        alerts.save(new AlertEntity(UUID.randomUUID(), highTransactionId,
                AlertStatus.OPEN, AlertPriority.CRITICAL, "High risk", 85, second));
    }

    @Test @WithMockUser(roles = "RISK_ANALYST")
    void reportsAggregateAndFilterExistingData() throws Exception {
        mockMvc.perform(get("/api/reports/risk-summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTransactions").value(2))
                .andExpect(jsonPath("$.riskDistribution.LOW").value(1))
                .andExpect(jsonPath("$.riskDistribution.CRITICAL").value(1))
                .andExpect(jsonPath("$.highRiskTransactions").value(1));
        mockMvc.perform(get("/api/reports/alert-summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAlerts").value(1))
                .andExpect(jsonPath("$.statusDistribution.OPEN").value(1));
        mockMvc.perform(get("/api/reports/rule-effectiveness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].evaluationCount").value(2))
                .andExpect(jsonPath("$[0].triggerCount").value(1))
                .andExpect(jsonPath("$[0].triggerRate").value(50.0));
        mockMvc.perform(get("/api/reports/country-risk")
                        .queryParam("country", "MM"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].countryCode").value("IN"))
                .andExpect(jsonPath("$[1].countryCode").value("MM"))
                .andExpect(jsonPath("$[1].transactionCount").value(1));
        mockMvc.perform(get("/api/reports/transaction-volume")
                        .queryParam("interval", "HOUR"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test @WithMockUser(roles = "FRAUD_ANALYST")
    void reportsRejectInvalidDateRange() throws Exception {
        mockMvc.perform(get("/api/reports/risk-summary")
                        .queryParam("from", "2026-08-04T00:00:00Z")
                        .queryParam("to", "2026-08-03T00:00:00Z"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.to")
                        .value("to must be later than from"));
    }

    @Test
    void reportsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/reports/risk-summary"))
                .andExpect(status().isUnauthorized());
    }

    private TransactionEntity transaction(UUID id, String externalId,
            String amount, String currency, Instant occurredAt, int score,
            RiskLevel level) {
        return new TransactionEntity(id, externalId, "SENDER-" + externalId,
                "RECEIVER-" + externalId, new BigDecimal(amount), currency,
                occurredAt, ProcessingStatus.ASSESSED, score, level, occurredAt);
    }
}
