package com.jadeguard.validation;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import com.jadeguard.transaction.RouteHopRequest;
import com.jadeguard.transaction.TransactionEntity;
import org.springframework.stereotype.Service;

@Service
public class TransactionValidationService {

    private static final Set<String> SUPPORTED_CURRENCIES = Set.of(
            "INR",
            "USD",
            "EUR",
            "GBP",
            "AED"
    );

    private static final Set<String> ISO_COUNTRY_CODES = Set.copyOf(
            Arrays.asList(Locale.getISOCountries())
    );

    public ValidationResult validate(
            TransactionEntity transaction,
            List<RouteHopRequest> route
    ) {
        List<ValidationError> errors = new ArrayList<>();

        validateCurrency(transaction, errors);
        validateAccounts(transaction, errors);
        validateRoute(route, errors);

        return ValidationResult.from(errors);
    }

    private void validateCurrency(
            TransactionEntity transaction,
            List<ValidationError> errors
    ) {
        if (!SUPPORTED_CURRENCIES.contains(transaction.getCurrency())) {
            errors.add(new ValidationError(
                    ValidationErrorCode.UNSUPPORTED_CURRENCY,
                    "currency",
                    "Currency " + transaction.getCurrency()
                            + " is not supported"
            ));
        }
    }

    private void validateAccounts(
            TransactionEntity transaction,
            List<ValidationError> errors
    ) {
        if (transaction.getSenderAccountId().equalsIgnoreCase(
                transaction.getReceiverAccountId()
        )) {
            errors.add(new ValidationError(
                    ValidationErrorCode.SAME_SENDER_AND_RECEIVER,
                    "receiverAccountId",
                    "Sender and receiver cannot be identical"
            ));
        }
    }

    private void validateRoute(
            List<RouteHopRequest> route,
            List<ValidationError> errors
    ) {
        if (route.size() < 2) {
            errors.add(new ValidationError(
                    ValidationErrorCode.ROUTE_REQUIRES_ORIGIN_AND_DESTINATION,
                    "route",
                    "Route must contain at least an origin and destination"
            ));
        }

        Set<Integer> sequences = new HashSet<>();
        boolean duplicateSequence = route.stream()
                .map(RouteHopRequest::sequence)
                .anyMatch(sequence -> !sequences.add(sequence));

        if (duplicateSequence) {
            errors.add(new ValidationError(
                    ValidationErrorCode.DUPLICATE_ROUTE_SEQUENCE,
                    "route",
                    "Route sequence numbers must be unique"
            ));
        }

        List<Integer> orderedSequences = route.stream()
                .map(RouteHopRequest::sequence)
                .distinct()
                .sorted()
                .toList();

        boolean continuousFromOne = orderedSequences.size() == route.size();
        for (int index = 0; index < orderedSequences.size(); index++) {
            if (orderedSequences.get(index) != index + 1) {
                continuousFromOne = false;
                break;
            }
        }

        if (!continuousFromOne && !duplicateSequence) {
            errors.add(new ValidationError(
                    ValidationErrorCode.INVALID_ROUTE_SEQUENCE,
                    "route",
                    "Route sequence must start at 1 and remain continuous"
            ));
        }

        route.stream()
                .filter(hop -> !ISO_COUNTRY_CODES.contains(
                        hop.countryCode().toUpperCase(Locale.ROOT)
                ))
                .forEach(hop -> errors.add(new ValidationError(
                        ValidationErrorCode.INVALID_COUNTRY_CODE,
                        "route[" + hop.sequence() + "].countryCode",
                        "Country code " + hop.countryCode()
                                + " is not a valid ISO alpha-2 code"
                )));
    }
}
