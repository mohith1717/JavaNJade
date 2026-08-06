package com.jadeguard.risk;

import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import com.jadeguard.rule.MonitoringRuleEntity;
import com.jadeguard.rule.RuleType;
import com.jadeguard.transaction.TransactionRouteHopEntity;
import org.springframework.stereotype.Component;

@Component
public class HighRiskCountryRuleEvaluator implements RuleEvaluator {

    @Override
    public RuleType supportedType() {
        return RuleType.HIGH_RISK_COUNTRY;
    }

    @Override
    public RuleEvaluationResult evaluate(
            MonitoringRuleEntity rule,
            RuleEvaluationContext context
    ) {
        Set<String> configuredCountries = StreamSupport.stream(
                        rule.getParameters().get("countryCodes").spliterator(),
                        false
                )
                .map(node -> node.asText())
                .collect(Collectors.toSet());
        String matchMode = rule.getParameters().path("match")
                .asText("ANY_ROUTE_HOP");

        var eligibleHops = eligibleHops(context, matchMode);
        var matchedHop = eligibleHops.stream()
                .filter(hop -> configuredCountries.contains(
                        hop.getCountryCode()
                ))
                .findFirst();

        return matchedHop
                .map(hop -> new RuleEvaluationResult(
                        true,
                        "Country " + hop.getCountryCode()
                                + " matched the configured watchlist at route "
                                + "sequence " + hop.getSequence() + "."
                ))
                .orElseGet(() -> new RuleEvaluationResult(
                        false,
                        "No country in the configured " + matchMode
                                + " route scope matched the watchlist."
                ));
    }

    private java.util.List<TransactionRouteHopEntity> eligibleHops(
            RuleEvaluationContext context,
            String matchMode
    ) {
        var route = context.route();
        if (route.isEmpty() || "ANY_ROUTE_HOP".equals(matchMode)) {
            return route;
        }
        return switch (matchMode) {
            case "ORIGIN_ONLY" -> java.util.List.of(route.getFirst());
            case "DESTINATION_ONLY" -> java.util.List.of(route.getLast());
            case "INTERMEDIARY_ONLY" -> route.size() <= 2
                    ? java.util.List.of()
                    : route.subList(1, route.size() - 1);
            default -> route;
        };
    }
}
