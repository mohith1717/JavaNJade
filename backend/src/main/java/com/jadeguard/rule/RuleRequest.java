package com.jadeguard.rule;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RuleRequest(
        @NotBlank
        @Size(max = 100)
        @Pattern(regexp = "[A-Z][A-Z0-9_]{2,99}")
        String code,

        @NotBlank
        @Size(max = 200)
        String name,

        @NotNull RuleType type,
        @NotNull Boolean enabled,
        @NotNull RuleSeverity severity,
        @NotNull @Min(0) @Max(100) Integer riskWeight,
        @NotNull JsonNode parameters
) {
}
