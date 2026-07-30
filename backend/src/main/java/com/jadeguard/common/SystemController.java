package com.jadeguard.common;

import java.time.Instant;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/system")
public class SystemController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
                "service", "jadeguard-backend",
                "status", "UP",
                "timestamp", Instant.now()
        );
    }
}
