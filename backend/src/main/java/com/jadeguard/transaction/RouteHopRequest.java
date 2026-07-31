package com.jadeguard.transaction;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public record RouteHopRequest(
        @NotNull @Positive Integer sequence,
        @NotBlank @Pattern(regexp = "[A-Za-z]{2}") String countryCode,
        @NotBlank String institution
) {
}
