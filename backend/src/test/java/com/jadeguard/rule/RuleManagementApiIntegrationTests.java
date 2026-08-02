package com.jadeguard.rule;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:jadeguard-rule-test;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
@WithMockUser(roles = "ADMIN")
class RuleManagementApiIntegrationTests {

    private static final String HIGH_AMOUNT_RULE = """
            {
              "code": "HIGH_AMOUNT_INR_TEST",
              "name": "High-value INR transfer",
              "type": "HIGH_AMOUNT",
              "enabled": true,
              "severity": "HIGH",
              "riskWeight": 35,
              "parameters": {
                "currency": "INR",
                "threshold": 200000
              }
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MonitoringRuleRepository repository;

    @BeforeEach
    void clearRules() {
        repository.deleteAll();
    }

    @Test
    void administratorCanCreateListAndReadRule() throws Exception {
        String ruleId = createAndReadId(HIGH_AMOUNT_RULE);

        mockMvc.perform(get("/api/rules")
                        .queryParam("type", "HIGH_AMOUNT")
                        .queryParam("enabled", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(ruleId))
                .andExpect(jsonPath("$[0].parameters.threshold")
                        .value(200000));

        mockMvc.perform(get("/api/rules/{id}", ruleId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code")
                        .value("HIGH_AMOUNT_INR_TEST"))
                .andExpect(jsonPath("$.type").value("HIGH_AMOUNT"));
    }

    @Test
    void administratorCanReplaceConfigurationAndDisableRule()
            throws Exception {
        String ruleId = createAndReadId(HIGH_AMOUNT_RULE);

        mockMvc.perform(put("/api/rules/{id}", ruleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "code": "HIGH_AMOUNT_INR_TEST",
                                  "name": "Updated INR threshold",
                                  "type": "HIGH_AMOUNT",
                                  "enabled": true,
                                  "severity": "CRITICAL",
                                  "riskWeight": 50,
                                  "parameters": {
                                    "currency": "INR",
                                    "threshold": 500000
                                  }
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name")
                        .value("Updated INR threshold"))
                .andExpect(jsonPath("$.severity").value("CRITICAL"))
                .andExpect(jsonPath("$.riskWeight").value(50))
                .andExpect(jsonPath("$.parameters.threshold")
                        .value(500000));

        mockMvc.perform(patch("/api/rules/{id}/status", ruleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "enabled": false
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false));
    }

    @Test
    void invalidTypeSpecificParametersReturnFieldErrors()
            throws Exception {
        mockMvc.perform(post("/api/rules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "code": "INVALID_AMOUNT_RULE",
                                  "name": "Invalid amount rule",
                                  "type": "HIGH_AMOUNT",
                                  "enabled": true,
                                  "severity": "HIGH",
                                  "riskWeight": 30,
                                  "parameters": {
                                    "currency": "inr",
                                    "threshold": -1
                                  }
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Rule configuration is invalid"))
                .andExpect(jsonPath(
                        "$.fieldErrors['parameters.currency']"
                ).exists())
                .andExpect(jsonPath(
                        "$.fieldErrors['parameters.threshold']"
                ).exists());
    }

    @Test
    void countryAndStructuringRuleConfigurationsAreSupported()
            throws Exception {
        createAndReadId("""
                {
                  "code": "ROUTE_COUNTRY_WATCHLIST",
                  "name": "Country anywhere in route",
                  "type": "HIGH_RISK_COUNTRY",
                  "enabled": true,
                  "severity": "HIGH",
                  "riskWeight": 40,
                  "parameters": {
                    "countryCodes": ["KP", "MM"],
                    "match": "ANY_ROUTE_HOP"
                  }
                }
                """);

        createAndReadId("""
                {
                  "code": "INR_STRUCTURING",
                  "name": "Possible split payments",
                  "type": "STRUCTURING",
                  "enabled": true,
                  "severity": "HIGH",
                  "riskWeight": 45,
                  "parameters": {
                    "currency": "INR",
                    "windowMinutes": 30,
                    "individualMaximum": 50000,
                    "combinedThreshold": 200000,
                    "minimumTransactionCount": 4,
                    "groupBy": "SENDER"
                  }
                }
                """);

        mockMvc.perform(get("/api/rules"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void duplicateRuleCodeReturnsConflict() throws Exception {
        createAndReadId(HIGH_AMOUNT_RULE);

        mockMvc.perform(post("/api/rules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(HIGH_AMOUNT_RULE))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(
                        "Monitoring rule code already exists: "
                                + "HIGH_AMOUNT_INR_TEST"
                ));
    }

    @Test
    void unknownRuleReturnsNotFound() throws Exception {
        UUID unknownId = UUID.randomUUID();

        mockMvc.perform(get("/api/rules/{id}", unknownId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value(
                        "Monitoring rule not found: " + unknownId
                ));
    }

    private String createAndReadId(String body) throws Exception {
        var result = mockMvc.perform(post("/api/rules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andReturn();

        return com.jayway.jsonpath.JsonPath.read(
                result.getResponse().getContentAsString(),
                "$.id"
        );
    }
}
