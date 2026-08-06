package com.jadeguard.rule;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Component;

@Component
public class RuleConfigurationValidator {

    private static final Set<String> ISO_COUNTRY_CODES = Set.copyOf(
            Arrays.asList(Locale.getISOCountries())
    );

    private static final Set<String> COUNTRY_MATCH_MODES = Set.of(
            "ANY_ROUTE_HOP",
            "ORIGIN_ONLY",
            "INTERMEDIARY_ONLY",
            "DESTINATION_ONLY"
    );

    private static final Set<String> STRUCTURING_GROUPS = Set.of(
            "SENDER",
            "SENDER_AND_RECEIVER",
            "RECEIVER"
    );

    public void validate(RuleRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        JsonNode parameters = request.parameters();

        if (!parameters.isObject()) {
            errors.put("parameters", "Parameters must be a JSON object");
            throw new RuleConfigurationException(errors);
        }

        switch (request.type()) {
            case HIGH_AMOUNT -> validateHighAmount(parameters, errors);
            case HIGH_RISK_COUNTRY ->
                    validateHighRiskCountry(parameters, errors);
            case EXCESSIVE_ROUTE_HOPS ->
                    positiveInteger(parameters, "maximumHops", 2, errors);
            case RAPID_TRANSACTIONS ->
                    validateRapidTransactions(parameters, errors);
            case STRUCTURING -> validateStructuring(parameters, errors);
            case BLACKLISTED_ACCOUNT -> { }
        }

        if (!errors.isEmpty()) {
            throw new RuleConfigurationException(errors);
        }
    }

    private void validateHighAmount(
            JsonNode parameters,
            Map<String, String> errors
    ) {
        currency(parameters, errors);
        positiveDecimal(parameters, "threshold", errors);
    }

    private void validateHighRiskCountry(
            JsonNode parameters,
            Map<String, String> errors
    ) {
        JsonNode countryCodes = parameters.get("countryCodes");
        if (countryCodes == null
                || !countryCodes.isArray()
                || countryCodes.isEmpty()) {
            errors.put(
                    "parameters.countryCodes",
                    "countryCodes must be a non-empty array"
            );
        } else {
            for (JsonNode countryCode : countryCodes) {
                String value = countryCode.isTextual()
                        ? countryCode.asText().toUpperCase(Locale.ROOT)
                        : "";
                if (!ISO_COUNTRY_CODES.contains(value)) {
                    errors.put(
                            "parameters.countryCodes",
                            "Every country must be a valid ISO alpha-2 code"
                    );
                    break;
                }
            }
        }

        JsonNode match = parameters.get("match");
        if (match != null
                && (!match.isTextual()
                || !COUNTRY_MATCH_MODES.contains(match.asText()))) {
            errors.put(
                    "parameters.match",
                    "match must be ANY_ROUTE_HOP, ORIGIN_ONLY, "
                            + "INTERMEDIARY_ONLY, or DESTINATION_ONLY"
            );
        }
    }

    private void validateRapidTransactions(
            JsonNode parameters,
            Map<String, String> errors
    ) {
        positiveInteger(parameters, "windowMinutes", 1, errors);
        positiveInteger(parameters, "maximumTransactions", 1, errors);
    }

    private void validateStructuring(
            JsonNode parameters,
            Map<String, String> errors
    ) {
        currency(parameters, errors);
        positiveInteger(parameters, "windowMinutes", 1, errors);
        positiveInteger(parameters, "minimumTransactionCount", 2, errors);
        positiveDecimal(parameters, "individualMaximum", errors);
        positiveDecimal(parameters, "combinedThreshold", errors);

        JsonNode individualMaximum = parameters.get("individualMaximum");
        JsonNode combinedThreshold = parameters.get("combinedThreshold");
        if (isPositiveNumber(individualMaximum)
                && isPositiveNumber(combinedThreshold)
                && combinedThreshold.decimalValue().compareTo(
                        individualMaximum.decimalValue()
                ) <= 0) {
            errors.put(
                    "parameters.combinedThreshold",
                    "combinedThreshold must exceed individualMaximum"
            );
        }

        JsonNode groupBy = parameters.get("groupBy");
        if (groupBy == null
                || !groupBy.isTextual()
                || !STRUCTURING_GROUPS.contains(groupBy.asText())) {
            errors.put(
                    "parameters.groupBy",
                    "groupBy must be SENDER, SENDER_AND_RECEIVER, or RECEIVER"
            );
        }
    }

    private void currency(
            JsonNode parameters,
            Map<String, String> errors
    ) {
        JsonNode currency = parameters.get("currency");
        if (currency == null
                || !currency.isTextual()
                || !currency.asText().matches("[A-Z]{3}")) {
            errors.put(
                    "parameters.currency",
                    "currency must contain three uppercase letters"
            );
        }
    }

    private void positiveInteger(
            JsonNode parameters,
            String field,
            int minimum,
            Map<String, String> errors
    ) {
        JsonNode value = parameters.get(field);
        if (value == null
                || !value.isIntegralNumber()
                || !value.canConvertToInt()
                || value.intValue() < minimum) {
            errors.put(
                    "parameters." + field,
                    field + " must be an integer greater than or equal to "
                            + minimum
            );
        }
    }

    private void positiveDecimal(
            JsonNode parameters,
            String field,
            Map<String, String> errors
    ) {
        JsonNode value = parameters.get(field);
        if (!isPositiveNumber(value)) {
            errors.put(
                    "parameters." + field,
                    field + " must be a positive number"
            );
        }
    }

    private boolean isPositiveNumber(JsonNode value) {
        return value != null
                && value.isNumber()
                && value.decimalValue().compareTo(BigDecimal.ZERO) > 0;
    }
}
