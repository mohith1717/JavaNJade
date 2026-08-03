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
import com.jadeguard.security.UserEntity;
import com.jadeguard.security.UserRepository;
import com.jadeguard.security.UserRole;
import com.jadeguard.transaction.TransactionRepository;
import com.jadeguard.transaction.TransactionRouteHopRepository;
import com.jadeguard.validation.TransactionValidationErrorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
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
@WithMockUser(username = "admin1", roles = "ADMIN")
class AlertApiIntegrationTests {

    private static final UUID ADMIN_ID = UUID.fromString(
            "10000000-0000-0000-0000-000000000001"
    );
    private static final UUID FRAUD_ID = UUID.fromString(
            "10000000-0000-0000-0000-000000000002"
    );
    private static final UUID RISK_ID = UUID.fromString(
            "10000000-0000-0000-0000-000000000003"
    );
    private static final UUID FRAUD_TWO_ID = UUID.fromString(
            "10000000-0000-0000-0000-000000000004"
    );
    private static final UUID DISABLED_FRAUD_ID = UUID.fromString(
            "10000000-0000-0000-0000-000000000005"
    );

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
    @Autowired private UserRepository userRepository;

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
        userRepository.deleteAll();
        saveUser(ADMIN_ID, "admin1", UserRole.ADMIN, true);
        saveUser(FRAUD_ID, "fraud1", UserRole.FRAUD_ANALYST, true);
        saveUser(RISK_ID, "risk1", UserRole.RISK_ANALYST, true);
        saveUser(FRAUD_TWO_ID, "fraud2", UserRole.FRAUD_ANALYST, true);
        saveUser(
                DISABLED_FRAUD_ID,
                "disabled-fraud",
                UserRole.FRAUD_ANALYST,
                false
        );
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
                {"assignedTo":"%s",
                 "reason":"Assigning the high-risk queue"}
                """.formatted(FRAUD_ID), "ASSIGNED", 1);
        performAction(alertId, "start-investigation", actionBody(
                "Review started"
        ), "INVESTIGATING", 2);
        performAction(alertId, "block", actionBody(
                "Confirmed suspicious route"
        ), "BLOCKED", 3);
        performAction(alertId, "close", actionBody(
                "Receiver blocked and case documented"
        ), "CLOSED", 4);
        performAction(alertId, "reopen", actionBody(
                "New high-priority evidence received"
        ), "OPEN", 5);

        mockMvc.perform(get("/api/alerts/{id}", alertId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andExpect(jsonPath("$.assignedTo").doesNotExist())
                .andExpect(jsonPath("$.decision").value("BLOCKED"))
                .andExpect(jsonPath("$.version").value(5))
                .andExpect(jsonPath("$.statusHistory.length()").value(6));

        mockMvc.perform(get("/api/alerts/{id}", alertId))
                .andExpect(jsonPath(
                        "$.statusHistory[1].changedBy"
                ).value(ADMIN_ID.toString()));

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
                        .content(actionBody("Skipping assignment")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message")
                        .value("Alert cannot move from OPEN to INVESTIGATING"));
    }

    @Test
    void assignmentRejectsInvalidOrIneligibleUsers() throws Exception {
        saveHighAmountRule(65);
        createTransaction("ALERT-INVALID-ASSIGNEE", 250000);
        UUID alertId = alertRepository.findAll().getFirst().getId();

        assignExpecting(alertId, "not-a-uuid", 400);
        assignExpecting(alertId, UUID.randomUUID().toString(), 400);
        assignExpecting(alertId, RISK_ID.toString(), 400);
        assignExpecting(alertId, DISABLED_FRAUD_ID.toString(), 400);
    }

    @Test
    @WithMockUser(username = "fraud2", roles = "FRAUD_ANALYST")
    void unassignedFraudAnalystCannotOperateAnotherAnalystsAlert()
            throws Exception {
        saveHighAmountRule(65);
        createTransaction("ALERT-OWNERSHIP-001", 250000);
        UUID alertId = alertRepository.findAll().getFirst().getId();

        mockMvc.perform(post("/api/alerts/{id}/assign", alertId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"assignedTo":"%s","reason":"Assign fraud1"}
                                """.formatted(FRAUD_ID)))
                .andExpect(status().isOk());

        mockMvc.perform(post(
                        "/api/alerts/{id}/start-investigation",
                        alertId
                ).contentType(MediaType.APPLICATION_JSON)
                        .content(actionBody("Attempting another queue")))
                .andExpect(status().isForbidden());
    }

    private void performAction(
            String alertId,
            String action,
            String body,
            String expectedStatus,
            int expectedVersion
    ) throws Exception {
        mockMvc.perform(post("/api/alerts/{id}/{action}", alertId, action)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(expectedStatus))
                .andExpect(jsonPath("$.version").value(expectedVersion));
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

    private String actionBody(String reason) {
        return """
                {"reason":"%s"}
                """.formatted(reason);
    }

    private void assignExpecting(UUID alertId, String assignedTo, int status)
            throws Exception {
        mockMvc.perform(post("/api/alerts/{id}/assign", alertId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"assignedTo":"%s","reason":"Test assignee"}
                                """.formatted(assignedTo)))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers
                        .status().is(status));
    }

    private void saveUser(
            UUID id,
            String username,
            UserRole role,
            boolean enabled
    ) {
        Instant now = Instant.now();
        userRepository.save(new UserEntity(
                id,
                username,
                username + "@test.local",
                "unused-test-password",
                username,
                role,
                enabled,
                now,
                now
        ));
    }
}
