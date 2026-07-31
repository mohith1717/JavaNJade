package com.jadeguard.transaction;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record TransactionRequest(
        @NotBlank String externalTransactionId,
        @NotBlank String senderAccountId,
        @NotBlank String receiverAccountId,
        @NotNull @DecimalMin("0.01") BigDecimal amount,
        @NotBlank @Pattern(regexp = "[A-Za-z]{3}") String currency,
        @NotNull Instant occurredAt,
        @NotEmpty List<@Valid RouteHopRequest> route
) {
}
