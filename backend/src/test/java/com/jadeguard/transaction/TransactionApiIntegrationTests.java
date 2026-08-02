package com.jadeguard.transaction;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.jadeguard.validation.TransactionValidationErrorRepository;
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
              "occurredAt": "2026-07-31T08:30:00Z",
              "route": [
                {
                  "sequence": 2,
                  "countryCode": "GB",
                  "institution": "Destination Bank"
                },
                {
                  "sequence": 1,
                  "countryCode": "IN",
                  "institution": "Origin Bank"
                }
              ]
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private TransactionRouteHopRepository routeHopRepository;

    @Autowired
    private TransactionValidationErrorRepository validationErrorRepository;

    @BeforeEach
    void clearTransactions() {
        validationErrorRepository.deleteAll();
        routeHopRepository.deleteAll();
        transactionRepository.deleteAll();
    }

    @Test
    void validTransactionIsStoredWithOrderedRouteAndAssessedRisk()
            throws Exception {
        var response = mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_TRANSACTION))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.externalTransactionId")
                        .value("TXN-TEST-001"))
                .andExpect(jsonPath("$.currency").value("INR"))
                .andExpect(jsonPath("$.processingStatus").value("ASSESSED"))
                .andExpect(jsonPath("$.riskScore").value(0))
                .andExpect(jsonPath("$.riskLevel").value("LOW"))
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

        mockMvc.perform(get(
                        "/api/transactions/{id}/route",
                        transactionId
                ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sequence").value(1))
                .andExpect(jsonPath("$[0].countryCode").value("IN"))
                .andExpect(jsonPath("$[1].sequence").value(2))
                .andExpect(jsonPath("$[1].countryCode").value("GB"));

        mockMvc.perform(get(
                        "/api/transactions/{id}/validation-errors",
                        transactionId
                ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
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
                .andExpect(jsonPath("$.fieldErrors.occurredAt").exists())
                .andExpect(jsonPath("$.fieldErrors.route").exists());
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

    @Test
    void unsupportedCurrencyAndSameAccountAreStoredWithExplanations()
            throws Exception {
        String body = """
                {
                  "externalTransactionId": "TXN-INVALID-001",
                  "senderAccountId": "ACC-001",
                  "receiverAccountId": "ACC-001",
                  "amount": 5000,
                  "currency": "XYZ",
                  "occurredAt": "2026-07-31T08:30:00Z",
                  "route": [
                    {
                      "sequence": 1,
                      "countryCode": "IN",
                      "institution": "Origin Bank"
                    },
                    {
                      "sequence": 2,
                      "countryCode": "GB",
                      "institution": "Destination Bank"
                    }
                  ]
                }
                """;

        String transactionId = createAndReadId(body);

        mockMvc.perform(get(
                        "/api/transactions/{id}/validation-errors",
                        transactionId
                ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[?(@.code == 'UNSUPPORTED_CURRENCY')]")
                        .exists())
                .andExpect(jsonPath(
                        "$[?(@.code == 'SAME_SENDER_AND_RECEIVER')]"
                ).exists())
                .andExpect(jsonPath("$[0].id").exists());

        mockMvc.perform(get("/api/transactions")
                        .queryParam(
                                "processingStatus",
                                "VALIDATION_FAILED"
                        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(transactionId));

        mockMvc.perform(get("/api/validation-errors")
                        .queryParam(
                                "errorCode",
                                "UNSUPPORTED_CURRENCY"
                        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].transactionId")
                        .value(transactionId))
                .andExpect(jsonPath("$[0].id").exists());
    }

    @Test
    void invalidCountryIsStoredAsValidationFailure() throws Exception {
        String transactionId = createAndReadId("""
                {
                  "externalTransactionId": "TXN-COUNTRY-001",
                  "senderAccountId": "ACC-001",
                  "receiverAccountId": "ACC-002",
                  "amount": 5000,
                  "currency": "INR",
                  "occurredAt": "2026-07-31T08:30:00Z",
                  "route": [
                    {
                      "sequence": 1,
                      "countryCode": "IN",
                      "institution": "Origin Bank"
                    },
                    {
                      "sequence": 2,
                      "countryCode": "ZZ",
                      "institution": "Unknown Bank"
                    }
                  ]
                }
                """);

        mockMvc.perform(get("/api/transactions/{id}", transactionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.processingStatus")
                        .value("VALIDATION_FAILED"));

        mockMvc.perform(get(
                        "/api/transactions/{id}/validation-errors",
                        transactionId
                ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code")
                        .value("INVALID_COUNTRY_CODE"));
    }

    @Test
    void discontinuousRouteIsStoredAsValidationFailure() throws Exception {
        String transactionId = createAndReadId("""
                {
                  "externalTransactionId": "TXN-SEQUENCE-001",
                  "senderAccountId": "ACC-001",
                  "receiverAccountId": "ACC-002",
                  "amount": 5000,
                  "currency": "INR",
                  "occurredAt": "2026-07-31T08:30:00Z",
                  "route": [
                    {
                      "sequence": 1,
                      "countryCode": "IN",
                      "institution": "Origin Bank"
                    },
                    {
                      "sequence": 3,
                      "countryCode": "GB",
                      "institution": "Destination Bank"
                    }
                  ]
                }
                """);

        mockMvc.perform(get(
                        "/api/transactions/{id}/validation-errors",
                        transactionId
                ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code")
                        .value("INVALID_ROUTE_SEQUENCE"));
    }

    @Test
    void duplicateRouteSequenceStoresFailureWithoutInvalidRouteRows()
            throws Exception {
        String transactionId = createAndReadId("""
                {
                  "externalTransactionId": "TXN-SEQUENCE-002",
                  "senderAccountId": "ACC-001",
                  "receiverAccountId": "ACC-002",
                  "amount": 5000,
                  "currency": "INR",
                  "occurredAt": "2026-07-31T08:30:00Z",
                  "route": [
                    {
                      "sequence": 1,
                      "countryCode": "IN",
                      "institution": "Origin Bank"
                    },
                    {
                      "sequence": 1,
                      "countryCode": "GB",
                      "institution": "Destination Bank"
                    }
                  ]
                }
                """);

        mockMvc.perform(get(
                        "/api/transactions/{id}/validation-errors",
                        transactionId
                ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code")
                        .value("DUPLICATE_ROUTE_SEQUENCE"));

        mockMvc.perform(get(
                        "/api/transactions/{id}/route",
                        transactionId
                ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void highValueTransactionIsAssessedAfterValidation() throws Exception {
        String transactionId = createAndReadId(
                VALID_TRANSACTION
                        .replace("TXN-TEST-001", "TXN-HIGH-001")
                        .replace("5000", "250000")
        );

        mockMvc.perform(get("/api/transactions/{id}", transactionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.processingStatus")
                        .value("ASSESSED"))
                .andExpect(jsonPath("$.riskScore").value(0))
                .andExpect(jsonPath("$.riskLevel").value("LOW"));
    }

    @Test
    void fundFlowReturnsVisualizationReadyCountryJourney()
            throws Exception {
        String transactionId = createAndReadId("""
                {
                  "externalTransactionId": "TXN-FLOW-001",
                  "senderAccountId": "ACC-001",
                  "receiverAccountId": "ACC-002",
                  "amount": 250000,
                  "currency": "INR",
                  "occurredAt": "2026-07-31T08:30:00Z",
                  "route": [
                    {
                      "sequence": 1,
                      "countryCode": "IN",
                      "institution": "Origin Bank"
                    },
                    {
                      "sequence": 2,
                      "countryCode": "AE",
                      "institution": "Intermediary Bank"
                    },
                    {
                      "sequence": 3,
                      "countryCode": "GB",
                      "institution": "Destination Bank"
                    }
                  ]
                }
                """);

        mockMvc.perform(get(
                        "/api/transactions/{id}/fund-flow",
                        transactionId
                ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transactionId")
                        .value(transactionId))
                .andExpect(jsonPath("$.externalTransactionId")
                        .value("TXN-FLOW-001"))
                .andExpect(jsonPath("$.amount").value(250000))
                .andExpect(jsonPath("$.currency").value("INR"))
                .andExpect(jsonPath("$.processingStatus")
                        .value("ASSESSED"))
                .andExpect(jsonPath("$.riskScore").value(0))
                .andExpect(jsonPath("$.riskLevel").value("LOW"))
                .andExpect(jsonPath("$.originCountry.countryCode")
                        .value("IN"))
                .andExpect(jsonPath("$.originCountry.countryName")
                        .value("India"))
                .andExpect(jsonPath("$.destinationCountry.countryCode")
                        .value("GB"))
                .andExpect(jsonPath("$.destinationCountry.countryName")
                        .value("United Kingdom"))
                .andExpect(jsonPath("$.totalHops").value(3))
                .andExpect(jsonPath("$.route[0].hopType")
                        .value("ORIGIN"))
                .andExpect(jsonPath("$.route[1].hopType")
                        .value("INTERMEDIARY"))
                .andExpect(jsonPath("$.route[1].countryName")
                        .value("United Arab Emirates"))
                .andExpect(jsonPath("$.route[2].hopType")
                        .value("DESTINATION"))
                .andExpect(jsonPath("$.route[2].institution")
                        .value("Destination Bank"));
    }

    @Test
    void fundFlowHandlesLegacyTransactionWithoutRoute()
            throws Exception {
        UUID transactionId = UUID.randomUUID();
        transactionRepository.save(new TransactionEntity(
                transactionId,
                "TXN-LEGACY-001",
                "ACC-001",
                "ACC-002",
                new BigDecimal("1000.00"),
                "INR",
                Instant.parse("2026-07-31T08:30:00Z"),
                ProcessingStatus.RECEIVED,
                null,
                RiskLevel.PENDING,
                Instant.now()
        ));

        mockMvc.perform(get(
                        "/api/transactions/{id}/fund-flow",
                        transactionId
                ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transactionId")
                        .value(transactionId.toString()))
                .andExpect(jsonPath("$.totalHops").value(0))
                .andExpect(jsonPath("$.originCountry").doesNotExist())
                .andExpect(jsonPath("$.destinationCountry").doesNotExist())
                .andExpect(jsonPath("$.route").isEmpty());
    }

    private String createAndReadId(String body) throws Exception {
        var response = mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();

        return com.jayway.jsonpath.JsonPath.read(
                response.getResponse().getContentAsString(),
                "$.id"
        );
    }
}
