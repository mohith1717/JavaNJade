package com.javanjade.Backend.dto;

import com.javanjade.Backend.model.RuleType;
import java.math.BigDecimal;

public record RuleViewResponse(
        Long id,
        String name,
        RuleType type,
        String description,
        boolean enabled,
        int riskWeight,
        BigDecimal amountThreshold,
        Integer intThreshold,
        Integer secondaryIntThreshold,
        String stringThreshold
) {
}
