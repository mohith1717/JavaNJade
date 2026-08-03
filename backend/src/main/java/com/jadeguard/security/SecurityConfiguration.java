package com.jadeguard.security;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jadeguard.common.ApiError;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfiguration {

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    DaoAuthenticationProvider authenticationProvider(
            UserService userService,
            PasswordEncoder passwordEncoder
    ) {
        var provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtFilter,
            ObjectMapper objectMapper
    ) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(
                        corsConfigurationSource()
                ))
                .sessionManagement(session -> session.sessionCreationPolicy(
                        SessionCreationPolicy.STATELESS
                ))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(
                                "/api/auth/login",
                                "/api",
                                "/api/health",
                                "/actuator/health",
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/error"
                        ).permitAll()
                        .requestMatchers("/api/auth/me").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/rules/**")
                        .hasAnyRole("RISK_ANALYST", "ADMIN")
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/rules/**"
                        ).hasRole("ADMIN")
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/rules/**"
                        ).hasRole("ADMIN")
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/rules/**"
                        ).hasRole("ADMIN")
                        .requestMatchers("/api/rules/**")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/alerts/**")
                        .hasAnyRole("FRAUD_ANALYST", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/alerts/**")
                        .hasAnyRole(
                                "FRAUD_ANALYST",
                                "RISK_ANALYST",
                                "ADMIN"
                        )
                        .requestMatchers("/api/audit-events/**")
                        .hasRole("ADMIN")
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/transactions/**"
                        ).hasAnyRole(
                                "FRAUD_ANALYST",
                                "RISK_ANALYST",
                                "ADMIN"
                        )
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/transactions/**"
                        ).hasAnyRole(
                                "FRAUD_ANALYST",
                                "RISK_ANALYST",
                                "ADMIN"
                        )
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/validation-errors/**"
                        ).hasAnyRole(
                                "FRAUD_ANALYST",
                                "RISK_ANALYST",
                                "ADMIN"
                        )
                        .anyRequest().authenticated()
                )
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint((request, response, exception) ->
                                writeError(
                                        objectMapper,
                                        response,
                                        401,
                                        "Unauthorized",
                                        "Authentication is required",
                                        request.getRequestURI()
                                ))
                        .accessDeniedHandler((request, response, exception) ->
                                writeError(
                                        objectMapper,
                                        response,
                                        403,
                                        "Forbidden",
                                        "You do not have permission for this action",
                                        request.getRequestURI()
                                ))
                )
                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                )
                .build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        var configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));
        configuration.setAllowedHeaders(List.of(
                "Authorization", "Content-Type"
        ));
        configuration.setAllowCredentials(true);

        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private void writeError(
            ObjectMapper objectMapper,
            HttpServletResponse response,
            int status,
            String error,
            String message,
            String path
    ) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), new ApiError(
                Instant.now(),
                status,
                error,
                message,
                path,
                Map.of()
        ));
    }
}
