package com.javanjade.Backend.dto;

import jakarta.validation.constraints.NotBlank;

public record CaseActionRequest(
        @NotBlank String actor,
        String assignee,
        String notes,
        boolean clean
) {
}
