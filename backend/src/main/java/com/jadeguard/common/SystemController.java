package com.jadeguard.common;

import java.time.Instant;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SystemController {

    @GetMapping
    public Map<String, Object> apiHome() {
        return Map.of(
                "name", "JadeGuard API",
                "status", "UP",
                "transactions", "/api/transactions",
                "validationErrors", "/api/validation-errors",
                "health", "/api/health"
        );
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
                "service", "jadeguard-backend",
                "status", "UP",
                "timestamp", Instant.now()
        );
    }
}
