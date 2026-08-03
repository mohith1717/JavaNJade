package com.jadeguard.audit;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.UUID;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:jadeguard-audit-test;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
@WithMockUser(username = "admin1", roles = "ADMIN")
class AuditEventApiIntegrationTests {

    private static final String ADMIN_ID =
            "10000000-0000-0000-0000-000000000001";
    private static final String FRAUD_ID =
            "10000000-0000-0000-0000-000000000002";

    @Autowired private MockMvc mockMvc;
    @Autowired private AuditEventRepository repository;
    @Autowired private ObjectMapper objectMapper;

    private UUID alertId;
    private UUID blockedEventId;

    @BeforeEach
    void seedEvents() {
        repository.deleteAll();
        alertId = UUID.randomUUID();
        blockedEventId = saveEvent(
                FRAUD_ID,
                "fraud1",
                "ALERT_BLOCKED",
                "ALERT",
                alertId,
                "INVESTIGATING",
                "BLOCKED",
                "Confirmed suspicious transaction",
                Instant.parse("2026-08-03T06:00:00Z")
        );
        saveEvent(
                ADMIN_ID,
                "admin1",
                "RULE_UPDATED",
                "RULE",
                UUID.randomUUID(),
                "OLD",
                "NEW",
                "Threshold review",
                Instant.parse("2026-08-03T06:01:00Z")
        );
        saveEvent(
                ADMIN_ID,
                "admin1",
                "USER_LOGIN_SUCCEEDED",
                "USER",
                UUID.fromString(ADMIN_ID),
                null,
                "AUTHENTICATED",
                "User authenticated successfully",
                Instant.parse("2026-08-03T06:02:00Z")
        );
    }

    @Test
    void adminCanPageFilterAndReadIndividualAuditEvents() throws Exception {
        mockMvc.perform(get("/api/audit-events")
                        .queryParam("page", "0")
                        .queryParam("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.totalElements").value(3))
                .andExpect(jsonPath("$.content[0].action")
                        .value("USER_LOGIN_SUCCEEDED"));

        mockMvc.perform(get("/api/audit-events")
                        .queryParam("actorId", FRAUD_ID)
                        .queryParam("action", "ALERT_BLOCKED")
                        .queryParam("entityType", "ALERT")
                        .queryParam("entityId", alertId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].actorUsername")
                        .value("fraud1"))
                .andExpect(jsonPath("$.content[0].previousValue.status")
                        .value("INVESTIGATING"))
                .andExpect(jsonPath("$.content[0].newValue.status")
                        .value("BLOCKED"));

        mockMvc.perform(get(
                        "/api/audit-events/{id}",
                        blockedEventId
                )).andExpect(status().isOk())
                .andExpect(jsonPath("$.reason")
                        .value("Confirmed suspicious transaction"));
    }

    @Test
    @WithMockUser(username = "risk1", roles = "RISK_ANALYST")
    void nonAdminCannotReadAuditEvents() throws Exception {
        mockMvc.perform(get("/api/audit-events"))
                .andExpect(status().isForbidden());
    }

    @Test
    void auditApiDoesNotExposeMutationMethods() throws Exception {
        mockMvc.perform(post("/api/audit-events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isMethodNotAllowed());
        mockMvc.perform(put("/api/audit-events/{id}", blockedEventId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isMethodNotAllowed());
        mockMvc.perform(patch("/api/audit-events/{id}", blockedEventId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isMethodNotAllowed());
        mockMvc.perform(delete("/api/audit-events/{id}", blockedEventId))
                .andExpect(status().isMethodNotAllowed());
    }

    private UUID saveEvent(
            String actorId,
            String actorUsername,
            String action,
            String entityType,
            UUID entityId,
            String previousStatus,
            String newStatus,
            String reason,
            Instant occurredAt
    ) {
        UUID id = UUID.randomUUID();
        var previousValue = previousStatus == null
                ? null
                : objectMapper.createObjectNode().put(
                        "status",
                        previousStatus
                );
        var newValue = objectMapper.createObjectNode().put(
                "status",
                newStatus
        );
        repository.save(new AuditEventEntity(
                id,
                actorId,
                actorUsername,
                action,
                entityType,
                entityId,
                previousValue,
                newValue,
                reason,
                objectMapper.createObjectNode(),
                occurredAt
        ));
        return id;
    }
}
