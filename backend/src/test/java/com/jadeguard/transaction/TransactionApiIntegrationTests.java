package com.jadeguard.transaction;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:jadeguard-test;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
class TransactionApiIntegrationTests {

    private static final String VALID_TRANSACTION = """
            {
              "externalTransactionId": "TXN-TEST-001",
              "senderAccountId": "ACC-001",
              "receiverAccountId": "ACC-002",
              "amount": 5000,
              "currency": "inr",
              "occurredAt": "2026-07-31T08:30:00Z"
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TransactionRepository transactionRepository;

    @BeforeEach
    void clearTransactions() {
        transactionRepository.deleteAll();
    }

    @Test
    void createsListsAndRetrievesATransactionWithPendingRisk() throws Exception {
        var response = mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_TRANSACTION))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.externalTransactionId")
                        .value("TXN-TEST-001"))
                .andExpect(jsonPath("$.currency").value("INR"))
                .andExpect(jsonPath("$.processingStatus").value("RECEIVED"))
                .andExpect(jsonPath("$.riskScore").doesNotExist())
                .andExpect(jsonPath("$.riskLevel").value("PENDING"))
                .andReturn();

        String transactionId = com.jayway.jsonpath.JsonPath.read(
                response.getResponse().getContentAsString(),
                "$.id"
        );

        mockMvc.perform(get("/api/transactions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(transactionId));

        mockMvc.perform(get("/api/transactions/{id}", transactionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.externalTransactionId")
                        .value("TXN-TEST-001"));
    }

    @Test
    void returnsClearConflictErrorForDuplicateExternalId() throws Exception {
        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_TRANSACTION))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_TRANSACTION))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message")
                        .value("Transaction already exists: TXN-TEST-001"))
                .andExpect(jsonPath("$.path").value("/api/transactions"));
    }

    @Test
    void returnsFieldErrorsForInvalidTransaction() throws Exception {
        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "externalTransactionId": "",
                                  "senderAccountId": "ACC-001",
                                  "receiverAccountId": "ACC-002",
                                  "amount": 0,
                                  "currency": "RUPEES"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Request validation failed"))
                .andExpect(jsonPath("$.fieldErrors.externalTransactionId")
                        .exists())
                .andExpect(jsonPath("$.fieldErrors.amount").exists())
                .andExpect(jsonPath("$.fieldErrors.currency").exists())
                .andExpect(jsonPath("$.fieldErrors.occurredAt").exists());
    }

    @Test
    void returnsClearNotFoundErrorForUnknownTransaction() throws Exception {
        UUID unknownId = UUID.randomUUID();

        mockMvc.perform(get("/api/transactions/{id}", unknownId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message")
                        .value("Transaction not found: " + unknownId))
                .andExpect(jsonPath("$.path")
                        .value("/api/transactions/" + unknownId));
    }
}
