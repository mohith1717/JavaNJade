package com.javanjade.Backend.dto;

import com.javanjade.Backend.model.RuleType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record RuleUpsertRequest(
        @NotBlank String name,
        @NotNull RuleType type,
        @NotBlank String description,
        boolean enabled,
        @Min(0) @Max(100) int riskWeight,
        BigDecimal amountThreshold,
        Integer intThreshold,
        Integer secondaryIntThreshold,
        String stringThreshold
) {
}
