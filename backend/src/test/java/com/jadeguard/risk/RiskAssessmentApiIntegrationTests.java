package com.jadeguard.risk;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.UUID;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jadeguard.rule.MonitoringRuleEntity;
import com.jadeguard.alert.AlertRepository;
import com.jadeguard.alert.AlertStatusHistoryRepository;
import com.jadeguard.audit.AuditEventRepository;
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
        "spring.datasource.url=jdbc:h2:mem:jadeguard-risk-test;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
class RiskAssessmentApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RuleEvaluationRepository evaluationRepository;

    @Autowired
    private MonitoringRuleRepository ruleRepository;

    @Autowired
    private TransactionValidationErrorRepository validationErrorRepository;

    @Autowired
    private TransactionRouteHopRepository routeHopRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private AlertStatusHistoryRepository alertHistoryRepository;

    @Autowired
    private AuditEventRepository auditEventRepository;

    @BeforeEach
    void resetDatabase() {
        auditEventRepository.deleteAll();
        alertHistoryRepository.deleteAll();
        alertRepository.deleteAll();
        evaluationRepository.deleteAll();
        validationErrorRepository.deleteAll();
        routeHopRepository.deleteAll();
        transactionRepository.deleteAll();
        ruleRepository.deleteAll();
    }

    @Test
    void validTransactionReceivesExplainableCappedRiskAssessment()
            throws Exception {
        saveRule("HIGH_AMOUNT_TEST", RuleType.HIGH_AMOUNT, 35,
                "{\"currency\":\"INR\",\"threshold\":200000}");
        saveRule("COUNTRY_TEST", RuleType.HIGH_RISK_COUNTRY, 40,
                "{\"countryCodes\":[\"MM\"],\"match\":\"ANY_ROUTE_HOP\"}");
        saveRule("HOPS_TEST", RuleType.EXCESSIVE_ROUTE_HOPS, 30,
                "{\"maximumHops\":2}");

        var created = mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validTransactionJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.processingStatus").value("ASSESSED"))
                .andExpect(jsonPath("$.riskScore").value(100))
                .andExpect(jsonPath("$.riskLevel").value("CRITICAL"))
                .andReturn();

        String transactionId = com.jayway.jsonpath.JsonPath.read(
                created.getResponse().getContentAsString(),
                "$.id"
        );

        mockMvc.perform(get(
                        "/api/transactions/{id}/risk-assessment",
                        transactionId
                ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.processingStatus").value("ASSESSED"))
                .andExpect(jsonPath("$.riskScore").value(100))
                .andExpect(jsonPath("$.riskLevel").value("CRITICAL"))
                .andExpect(jsonPath("$.evaluations.length()").value(3))
                .andExpect(jsonPath("$.evaluations[0].triggered").value(true))
                .andExpect(jsonPath("$.evaluations[0].scoreContribution")
                        .value(35))
                .andExpect(jsonPath("$.evaluations[1].explanation")
                        .value(org.hamcrest.Matchers.containsString("MM")))
                .andExpect(jsonPath("$.assessedAt").exists());
    }

    @Test
    void responseIncludesRulesThatDidNotTrigger() throws Exception {
        saveRule("HIGH_AMOUNT_TEST", RuleType.HIGH_AMOUNT, 35,
                "{\"currency\":\"INR\",\"threshold\":500000}");

        var created = mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validTransactionJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.riskScore").value(0))
                .andExpect(jsonPath("$.riskLevel").value("LOW"))
                .andReturn();
        String transactionId = com.jayway.jsonpath.JsonPath.read(
                created.getResponse().getContentAsString(),
                "$.id"
        );

        mockMvc.perform(get(
                        "/api/transactions/{id}/risk-assessment",
                        transactionId
                ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.evaluations.length()").value(1))
                .andExpect(jsonPath("$.evaluations[0].triggered").value(false))
                .andExpect(jsonPath("$.evaluations[0].scoreContribution")
                        .value(0));
    }

    @Test
    void temporalRulesUseEarlierEligibleTransactions() throws Exception {
        saveRule("RAPID_TEST", RuleType.RAPID_TRANSACTIONS, 25,
                "{\"windowMinutes\":10,\"maximumTransactions\":1}");
        saveRule("STRUCTURING_TEST", RuleType.STRUCTURING, 45,
                "{\"currency\":\"INR\",\"windowMinutes\":30,"
                        + "\"individualMaximum\":50000,"
                        + "\"combinedThreshold\":100000,"
                        + "\"minimumTransactionCount\":2,"
                        + "\"groupBy\":\"SENDER\"}");

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(transactionJson("RISK-TXN-001", 50000)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.riskScore").value(0));

        var second = mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(transactionJson("RISK-TXN-002", 50000)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.riskScore").value(70))
                .andExpect(jsonPath("$.riskLevel").value("HIGH"))
                .andReturn();
        String transactionId = com.jayway.jsonpath.JsonPath.read(
                second.getResponse().getContentAsString(),
                "$.id"
        );

        mockMvc.perform(get(
                        "/api/transactions/{id}/risk-assessment",
                        transactionId
                ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.evaluations.length()").value(2))
                .andExpect(jsonPath("$.evaluations[0].triggered").value(true))
                .andExpect(jsonPath("$.evaluations[1].triggered").value(true));
    }

    private void saveRule(
            String code,
            RuleType type,
            int weight,
            String parameters
    ) throws Exception {
        Instant now = Instant.now();
        ruleRepository.save(new MonitoringRuleEntity(
                UUID.randomUUID(),
                code,
                code,
                type,
                true,
                RuleSeverity.HIGH,
                weight,
                objectMapper.readTree(parameters),
                now,
                now
        ));
    }

    private String validTransactionJson() {
        return transactionJson("RISK-TXN-001", 250000);
    }

    private String transactionJson(String externalId, int amount) {
        return """
                {
                  "externalTransactionId": "%s",
                  "senderAccountId": "ACC-RISK-001",
                  "receiverAccountId": "ACC-RISK-002",
                  "amount": %d,
                  "currency": "INR",
                  "occurredAt": "2026-08-02T04:30:00Z",
                  "route": [
                    {"sequence": 1, "countryCode": "IN", "institution": "Origin Bank"},
                    {"sequence": 2, "countryCode": "MM", "institution": "Intermediary Bank"},
                    {"sequence": 3, "countryCode": "GB", "institution": "Destination Bank"}
                  ]
                }
                """.formatted(externalId, amount);
    }
}
