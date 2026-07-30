package com.javanjade.Backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record TransactionProcessRequest(
        @NotBlank @Size(max = 64) String transactionId,
        @NotNull @DecimalMin("0.01") BigDecimal amount,
        @NotBlank @Size(max = 8) String currency,
        @NotBlank @Size(max = 64) String senderAccountId,
        @NotBlank @Size(max = 64) String receiverAccountId,
        @NotBlank @Size(max = 64) String senderCountry,
        @NotBlank @Size(max = 64) String receiverCountry,
        @NotBlank @Size(max = 128) String location,
        @NotBlank @Size(max = 128) String deviceId,
        Integer creditScore
) {
}
