package com.jadeguard.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:jadeguard-security-test;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "jadeguard.security.jwt-secret=security-test-secret-must-be-at-least-32-bytes"
})
@AutoConfigureMockMvc
class SecurityApiIntegrationTests {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @BeforeEach
    void seedUsers() {
        userRepository.deleteAll();
        saveUser("admin1", "admin@test.local", UserRole.ADMIN, true);
        saveUser(
                "fraud1",
                "fraud@test.local",
                UserRole.FRAUD_ANALYST,
                true
        );
        saveUser("risk1", "risk@test.local", UserRole.RISK_ANALYST, true);
        saveUser("disabled1", "disabled@test.local", UserRole.ADMIN, false);
    }

    @Test
    void healthIsPublicButOperationalApisRequireAuthentication()
            throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/transactions"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message")
                        .value("Authentication is required"));
    }

    @Test
    void loginReturnsJwtAndTokenCanReadCurrentUser() throws Exception {
        String token = login("admin1", "Password1!");

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin1"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void loginAcceptsEmailAndRejectsBadOrDisabledCredentials()
            throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(
                                "risk@test.local",
                                "Password1!"
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.role").value("RISK_ANALYST"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody("admin1", "wrong-password")))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody("disabled1", "Password1!")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rolesRestrictRulesAndAlertActions() throws Exception {
        String fraudToken = login("fraud1", "Password1!");
        String riskToken = login("risk1", "Password1!");

        mockMvc.perform(get("/api/alerts")
                        .header("Authorization", "Bearer " + fraudToken))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/rules")
                        .header("Authorization", "Bearer " + fraudToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/rules")
                        .header("Authorization", "Bearer " + riskToken))
                .andExpect(status().isOk());

        mockMvc.perform(post(
                        "/api/alerts/{id}/block",
                        UUID.randomUUID()
                ).header("Authorization", "Bearer " + riskToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"actorId":"risk1","reason":"Not allowed"}
                                """))
                .andExpect(status().isForbidden());
    }

    private String login(String usernameOrEmail, String password)
            throws Exception {
        var response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(usernameOrEmail, password)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value(3600))
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andReturn();
        return com.jayway.jsonpath.JsonPath.read(
                response.getResponse().getContentAsString(),
                "$.accessToken"
        );
    }

    private String loginBody(String usernameOrEmail, String password) {
        return """
                {"usernameOrEmail":"%s","password":"%s"}
                """.formatted(usernameOrEmail, password);
    }

    private void saveUser(
            String username,
            String email,
            UserRole role,
            boolean enabled
    ) {
        Instant now = Instant.now();
        userRepository.save(new UserEntity(
                UUID.randomUUID(),
                username,
                email,
                passwordEncoder.encode("Password1!"),
                username,
                role,
                enabled,
                now,
                now
        ));
    }
}
