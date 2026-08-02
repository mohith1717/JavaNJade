package com.jadeguard.alert;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.UUID;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jadeguard.audit.AuditEventRepository;
import com.jadeguard.risk.RuleEvaluationRepository;
import com.jadeguard.rule.MonitoringRuleEntity;
import com.jadeguard.rule.MonitoringRuleRepository;
import com.jadeguard.rule.RuleSeverity;
import com.jadeguard.rule.RuleType;
import com.jadeguard.transaction.TransactionRepository;
import com.jadeguard.transaction.TransactionRouteHopRepository;
import com.jadeguard.validation.TransactionValidationErrorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:jadeguard-alert-test;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
class AlertApiIntegrationTests {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private AlertRepository alertRepository;
    @Autowired private AlertStatusHistoryRepository historyRepository;
    @Autowired private AuditEventRepository auditRepository;
    @Autowired private RuleEvaluationRepository evaluationRepository;
    @Autowired private TransactionValidationErrorRepository validationRepository;
    @Autowired private TransactionRouteHopRepository routeRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private MonitoringRuleRepository ruleRepository;

    @BeforeEach
    void resetDatabase() {
        auditRepository.deleteAll();
        historyRepository.deleteAll();
        alertRepository.deleteAll();
        evaluationRepository.deleteAll();
        validationRepository.deleteAll();
        routeRepository.deleteAll();
        transactionRepository.deleteAll();
        ruleRepository.deleteAll();
    }

    @Test
    void highRiskTransactionCreatesAlertAndSupportsFullLifecycle()
            throws Exception {
        saveHighAmountRule(65);
        createTransaction("ALERT-TXN-001", 250000);

        var listed = mockMvc.perform(get("/api/alerts")
                        .queryParam("status", "OPEN")
                        .queryParam("priority", "HIGH"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].riskScore").value(65))
                .andExpect(jsonPath("$[0].primaryReason").isNotEmpty())
                .andReturn();
        String alertId = com.jayway.jsonpath.JsonPath.read(
                listed.getResponse().getContentAsString(),
                "$[0].id"
        );

        performAction(alertId, "assign", """
                {"assignedTo":"analyst-1","actorId":"lead-1",
                 "reason":"Assigning the high-risk queue"}
                """, "ASSIGNED");
        performAction(alertId, "start-investigation", actionBody(
                "analyst-1", "Review started"
        ), "INVESTIGATING");
        performAction(alertId, "block", actionBody(
                "analyst-1", "Confirmed suspicious route"
        ), "BLOCKED");
        performAction(alertId, "close", actionBody(
                "analyst-1", "Receiver blocked and case documented"
        ), "CLOSED");
        performAction(alertId, "reopen", actionBody(
                "lead-1", "New high-priority evidence received"
        ), "OPEN");

        mockMvc.perform(get("/api/alerts/{id}", alertId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andExpect(jsonPath("$.assignedTo").doesNotExist())
                .andExpect(jsonPath("$.decision").value("BLOCKED"))
                .andExpect(jsonPath("$.statusHistory.length()").value(6));

        org.assertj.core.api.Assertions.assertThat(auditRepository.count())
                .isEqualTo(6);
    }

    @Test
    void lowRiskTransactionDoesNotCreateAlert() throws Exception {
        createTransaction("ALERT-LOW-001", 5000);

        mockMvc.perform(get("/api/alerts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void invalidLifecycleTransitionReturnsConflict() throws Exception {
        saveHighAmountRule(65);
        createTransaction("ALERT-TXN-INVALID-TRANSITION", 250000);
        UUID alertId = alertRepository.findAll().getFirst().getId();

        mockMvc.perform(post("/api/alerts/{id}/block", alertId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(actionBody("analyst-1", "Skipping assignment")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message")
                        .value("Alert cannot move from OPEN to INVESTIGATING"));
    }

    private void performAction(
            String alertId,
            String action,
            String body,
            String expectedStatus
    ) throws Exception {
        mockMvc.perform(post("/api/alerts/{id}/{action}", alertId, action)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(expectedStatus));
    }

    private void createTransaction(String externalId, int amount)
            throws Exception {
        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "externalTransactionId":"%s",
                                  "senderAccountId":"ACC-ALERT-001",
                                  "receiverAccountId":"ACC-ALERT-002",
                                  "amount":%d,
                                  "currency":"INR",
                                  "occurredAt":"2026-08-02T06:30:00Z",
                                  "route":[
                                    {"sequence":1,"countryCode":"IN","institution":"Origin Bank"},
                                    {"sequence":2,"countryCode":"GB","institution":"Destination Bank"}
                                  ]
                                }
                                """.formatted(externalId, amount)))
                .andExpect(status().isCreated());
    }

    private void saveHighAmountRule(int weight) throws Exception {
        Instant now = Instant.now();
        ruleRepository.save(new MonitoringRuleEntity(
                UUID.randomUUID(),
                "ALERT_HIGH_AMOUNT",
                "Alert high amount",
                RuleType.HIGH_AMOUNT,
                true,
                RuleSeverity.HIGH,
                weight,
                objectMapper.readTree(
                        "{\"currency\":\"INR\",\"threshold\":200000}"
                ),
                now,
                now
        ));
    }

    private String actionBody(String actorId, String reason) {
        return """
                {"actorId":"%s","reason":"%s"}
                """.formatted(actorId, reason);
    }
}
