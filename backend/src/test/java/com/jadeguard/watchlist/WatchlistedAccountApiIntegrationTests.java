package com.jadeguard.watchlist;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.UUID;

import com.jadeguard.audit.AuditEventRepository;
import com.jadeguard.security.UserEntity;
import com.jadeguard.security.UserRepository;
import com.jadeguard.security.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:jadeguard-watchlist-test;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.flyway.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
class WatchlistedAccountApiIntegrationTests {
    @Autowired MockMvc mockMvc;
    @Autowired WatchlistedAccountRepository repository;
    @Autowired UserRepository userRepository;
    @Autowired AuditEventRepository auditRepository;

    @BeforeEach
    void seedAdmin() {
        auditRepository.deleteAll();
        repository.deleteAll();
        userRepository.deleteAll();
        Instant now = Instant.now();
        userRepository.save(new UserEntity(
                UUID.fromString("10000000-0000-0000-0000-000000000001"),
                "admin1", "admin@test.local", "unused", "Administrator",
                UserRole.ADMIN, true, now, now));
    }

    @Test @WithMockUser(username = "admin1", roles = "ADMIN")
    void adminCanCreateFilterAndDisableEntryWithAudit() throws Exception {
        String body = mockMvc.perform(post("/api/watchlisted-accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"accountId":"ACC-WATCHLIST-DEMO",
                                 "reason":"Confirmed mule account"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.addedBy")
                        .value("10000000-0000-0000-0000-000000000001"))
                .andReturn().getResponse().getContentAsString();
        String id = new com.fasterxml.jackson.databind.ObjectMapper()
                .readTree(body).get("id").asText();

        mockMvc.perform(get("/api/watchlisted-accounts")
                        .queryParam("enabled", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].accountId")
                        .value("ACC-WATCHLIST-DEMO"));
        mockMvc.perform(patch("/api/watchlisted-accounts/{id}/status", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"enabled":false,"reason":"Review completed"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false));
        org.assertj.core.api.Assertions.assertThat(auditRepository.count())
                .isEqualTo(2);
    }

    @Test @WithMockUser(username = "risk1", roles = "RISK_ANALYST")
    void riskAnalystCanReadButCannotCreate() throws Exception {
        mockMvc.perform(get("/api/watchlisted-accounts"))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/watchlisted-accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"accountId":"ACC-1","reason":"test"}
                                """))
                .andExpect(status().isForbidden());
    }
}
