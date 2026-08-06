package com.jadeguard.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.UUID;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jadeguard.audit.AuditEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:jadeguard-user-management-test;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.flyway.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
class UserManagementApiIntegrationTests {
    @Autowired MockMvc mockMvc;
    @Autowired UserRepository users;
    @Autowired AuditEventRepository audits;
    @Autowired PasswordEncoder passwords;
    @Autowired ObjectMapper objectMapper;

    private UUID adminId;

    @BeforeEach
    void seedAdmin() {
        audits.deleteAll(); users.deleteAll();
        adminId = UUID.randomUUID(); Instant now = Instant.now();
        users.save(new UserEntity(adminId, "admin-manager",
                "manager@jadeguard.local", passwords.encode("ManagerPass1!"),
                "Admin Manager", UserRole.ADMIN, true, now, now));
    }

    @Test @WithMockUser(username = "admin-manager", roles = "ADMIN")
    void adminManagesUsersWithoutExposingPasswordsAndActionsAreAudited()
            throws Exception {
        String created = mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"fraud2","email":"fraud2@jadeguard.local",
                                "displayName":"Fraud Analyst Two","password":"DevelopmentPass2!",
                                "role":"FRAUD_ANALYST","enabled":true,
                                "reason":"Adding investigation capacity"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.username").value("fraud2"))
                .andReturn().getResponse().getContentAsString();
        String id = objectMapper.readTree(created).get("id").asText();

        mockMvc.perform(get("/api/users").queryParam("role", "FRAUD_ANALYST")
                        .queryParam("enabled", "true").queryParam("search", "fraud2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(id));
        mockMvc.perform(get("/api/users/{id}", id)).andExpect(status().isOk())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
        mockMvc.perform(put("/api/users/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"fraud2","email":"fraud.two@jadeguard.local",
                                "displayName":"Fraud Analyst 2","reason":"Correcting profile"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("Fraud Analyst 2"));
        mockMvc.perform(patch("/api/users/{id}/role", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"RISK_ANALYST\",\"reason\":\"Role transfer\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("RISK_ANALYST"));
        mockMvc.perform(patch("/api/users/{id}/password", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"newPassword\":\"UpdatedPass2!\",\"reason\":\"Admin reset\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
        mockMvc.perform(patch("/api/users/{id}/status", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"enabled\":false,\"reason\":\"Temporary leave\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false));

        org.assertj.core.api.Assertions.assertThat(audits.findAll())
                .extracting(event -> event.getAction())
                .contains("USER_CREATED", "USER_UPDATED", "USER_ROLE_CHANGED",
                        "USER_PASSWORD_RESET", "USER_DISABLED");
    }

    @Test @WithMockUser(username = "admin-manager", roles = "ADMIN")
    void duplicateUsersAndUnsafeSelfChangesAreRejected() throws Exception {
        mockMvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"ADMIN-MANAGER","email":"other@jadeguard.local",
                                "displayName":"Duplicate","password":"DuplicatePass1!",
                                "role":"ADMIN","enabled":true,"reason":"Duplicate test"}
                                """))
                .andExpect(status().isConflict());
        mockMvc.perform(patch("/api/users/{id}/status", adminId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"enabled\":false,\"reason\":\"Unsafe\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message")
                        .value("You cannot disable your own account"));
        mockMvc.perform(patch("/api/users/{id}/role", adminId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"RISK_ANALYST\",\"reason\":\"Unsafe\"}"))
                .andExpect(status().isConflict());
    }

    @Test @WithMockUser(username = "risk1", roles = "RISK_ANALYST")
    void nonAdminCannotAccessUserManagement() throws Exception {
        mockMvc.perform(get("/api/users")).andExpect(status().isForbidden());
        mockMvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON)
                .content("{}")).andExpect(status().isForbidden());
    }
}
