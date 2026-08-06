package com.jadeguard.report;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.jadeguard.alert.*;
import com.jadeguard.risk.RuleEvaluationEntity;
import com.jadeguard.risk.RuleEvaluationRepository;
import com.jadeguard.rule.MonitoringRuleRepository;
import com.jadeguard.transaction.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportingService {
    private final TransactionRepository transactions;
    private final TransactionRouteHopRepository routeHops;
    private final AlertRepository alerts;
    private final RuleEvaluationRepository evaluations;
    private final MonitoringRuleRepository rules;

    public ReportingService(TransactionRepository transactions,
            TransactionRouteHopRepository routeHops, AlertRepository alerts,
            RuleEvaluationRepository evaluations,
            MonitoringRuleRepository rules) {
        this.transactions = transactions;
        this.routeHops = routeHops;
        this.alerts = alerts;
        this.evaluations = evaluations;
        this.rules = rules;
    }

    @Transactional(readOnly = true)
    public RiskSummaryResponse riskSummary(ReportFilters filters) {
        List<TransactionEntity> selected = filteredTransactions(filters).stream()
                .filter(t -> t.getRiskScore() != null).toList();
        EnumMap<RiskLevel, Long> distribution = enumCounts(
                RiskLevel.class, selected, TransactionEntity::getRiskLevel,
                level -> level != RiskLevel.PENDING);
        BigDecimal average = selected.isEmpty() ? BigDecimal.ZERO
                : BigDecimal.valueOf(selected.stream()
                        .mapToInt(TransactionEntity::getRiskScore).average()
                        .orElse(0)).setScale(2, RoundingMode.HALF_UP);
        long high = selected.stream().filter(t -> t.getRiskLevel() == RiskLevel.HIGH
                || t.getRiskLevel() == RiskLevel.CRITICAL).count();
        return new RiskSummaryResponse(selected.size(), average, distribution, high);
    }

    @Transactional(readOnly = true)
    public AlertSummaryResponse alertSummary(ReportFilters filters) {
        Set<UUID> transactionIds = transactionIds(filteredTransactions(filters));
        List<AlertEntity> selected = alerts.findAll().stream()
                .filter(a -> transactionIds.contains(a.getTransactionId())).toList();
        return new AlertSummaryResponse(selected.size(),
                enumCounts(AlertStatus.class, selected, AlertEntity::getStatus, x -> true),
                enumCounts(AlertPriority.class, selected, AlertEntity::getPriority, x -> true),
                enumCounts(AlertDecision.class, selected, AlertEntity::getDecision, x -> true));
    }

    @Transactional(readOnly = true)
    public List<RuleEffectivenessResponse> ruleEffectiveness(
            ReportFilters filters) {
        Set<UUID> transactionIds = transactionIds(filteredTransactions(filters));
        Map<UUID, List<RuleEvaluationEntity>> byRule = evaluations.findAll().stream()
                .filter(e -> transactionIds.contains(e.getTransactionId()))
                .collect(Collectors.groupingBy(RuleEvaluationEntity::getRuleId));
        return rules.findAllByOrderByCreatedAtDesc().stream().map(rule -> {
            List<RuleEvaluationEntity> entries = byRule.getOrDefault(
                    rule.getId(), List.of());
            long triggers = entries.stream().filter(
                    RuleEvaluationEntity::isTriggered).count();
            BigDecimal rate = entries.isEmpty() ? BigDecimal.ZERO
                    : BigDecimal.valueOf(triggers * 100.0 / entries.size())
                            .setScale(2, RoundingMode.HALF_UP);
            long score = entries.stream().mapToLong(
                    RuleEvaluationEntity::getScoreContribution).sum();
            return new RuleEffectivenessResponse(rule.getCode(), rule.getName(),
                    entries.size(), triggers, rate, score);
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<CountryRiskResponse> countryRisk(ReportFilters filters) {
        Map<UUID, TransactionEntity> selected = filteredTransactions(filters).stream()
                .collect(Collectors.toMap(TransactionEntity::getId,
                        Function.identity()));
        Set<UUID> alerted = alerts.findAll().stream()
                .map(AlertEntity::getTransactionId).collect(Collectors.toSet());
        Map<String, Set<UUID>> idsByCountry = routeHops.findAll().stream()
                .filter(h -> selected.containsKey(h.getTransactionId()))
                .collect(Collectors.groupingBy(TransactionRouteHopEntity::getCountryCode,
                        Collectors.mapping(TransactionRouteHopEntity::getTransactionId,
                                Collectors.toSet())));
        return idsByCountry.entrySet().stream().sorted(Map.Entry.comparingByKey())
                .map(entry -> countryResponse(entry.getKey(), entry.getValue(),
                        selected, alerted)).toList();
    }

    @Transactional(readOnly = true)
    public List<TransactionVolumeResponse> transactionVolume(
            ReportFilters filters, ReportInterval interval) {
        ReportInterval safeInterval = interval == null ? ReportInterval.HOUR : interval;
        Map<Instant, List<TransactionEntity>> groups = filteredTransactions(filters)
                .stream().collect(Collectors.groupingBy(
                        t -> bucket(t.getOccurredAt(), safeInterval),
                        LinkedHashMap::new, Collectors.toList()));
        return groups.entrySet().stream().sorted(Map.Entry.comparingByKey())
                .map(e -> new TransactionVolumeResponse(e.getKey(), e.getValue().size(),
                        e.getValue().stream().map(TransactionEntity::getAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add)))
                .toList();
    }

    private List<TransactionEntity> filteredTransactions(ReportFilters input) {
        ReportFilters filters = validate(input);
        Set<UUID> countryTransactions = filters.country() == null ? null
                : routeHops.findAll().stream()
                        .filter(h -> h.getCountryCode().equals(filters.country()))
                        .map(TransactionRouteHopEntity::getTransactionId)
                        .collect(Collectors.toSet());
        return transactions.findAll().stream()
                .filter(t -> filters.from() == null
                        || !t.getOccurredAt().isBefore(filters.from()))
                .filter(t -> filters.to() == null
                        || t.getOccurredAt().isBefore(filters.to()))
                .filter(t -> filters.currency() == null
                        || t.getCurrency().equals(filters.currency()))
                .filter(t -> filters.riskLevel() == null
                        || t.getRiskLevel() == filters.riskLevel())
                .filter(t -> countryTransactions == null
                        || countryTransactions.contains(t.getId())).toList();
    }

    private ReportFilters validate(ReportFilters filters) {
        Map<String, String> errors = new LinkedHashMap<>();
        if (filters.from() != null && filters.to() != null
                && !filters.from().isBefore(filters.to())) {
            errors.put("to", "to must be later than from");
        }
        String currency = normalize(filters.currency());
        String country = normalize(filters.country());
        if (currency != null && !currency.matches("[A-Z]{3}")) {
            errors.put("currency", "currency must contain three letters");
        }
        if (country != null && (!country.matches("[A-Z]{2}")
                || !Set.copyOf(Arrays.asList(Locale.getISOCountries()))
                        .contains(country))) {
            errors.put("country", "country must be a valid ISO alpha-2 code");
        }
        if (!errors.isEmpty()) throw new InvalidReportFilterException(errors);
        return new ReportFilters(filters.from(), filters.to(), currency, country,
                filters.riskLevel());
    }

    private CountryRiskResponse countryResponse(String country, Set<UUID> ids,
            Map<UUID, TransactionEntity> selected, Set<UUID> alerted) {
        List<TransactionEntity> entries = ids.stream().map(selected::get).toList();
        List<TransactionEntity> assessed = entries.stream()
                .filter(t -> t.getRiskScore() != null).toList();
        long high = assessed.stream().filter(t -> t.getRiskLevel() == RiskLevel.HIGH
                || t.getRiskLevel() == RiskLevel.CRITICAL).count();
        long alertCount = ids.stream().filter(alerted::contains).count();
        BigDecimal average = assessed.isEmpty() ? BigDecimal.ZERO
                : BigDecimal.valueOf(assessed.stream()
                        .mapToInt(TransactionEntity::getRiskScore).average().orElse(0))
                        .setScale(2, RoundingMode.HALF_UP);
        return new CountryRiskResponse(country, ids.size(), high, alertCount, average);
    }

    private Instant bucket(Instant instant, ReportInterval interval) {
        if (interval == ReportInterval.HOUR) return instant.truncatedTo(ChronoUnit.HOURS);
        return instant.atZone(ZoneOffset.UTC).toLocalDate()
                .atStartOfDay(ZoneOffset.UTC).toInstant();
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null
                : value.trim().toUpperCase(Locale.ROOT);
    }

    private Set<UUID> transactionIds(List<TransactionEntity> entries) {
        return entries.stream().map(TransactionEntity::getId)
                .collect(Collectors.toSet());
    }

    private <E extends Enum<E>, T> EnumMap<E, Long> enumCounts(Class<E> type,
            List<T> values, Function<T, E> classifier,
            java.util.function.Predicate<E> include) {
        EnumMap<E, Long> result = new EnumMap<>(type);
        for (E value : type.getEnumConstants()) if (include.test(value)) {
            result.put(value, 0L);
        }
        for (T item : values) {
            E key = classifier.apply(item);
            if (key != null && include.test(key)) result.merge(key, 1L, Long::sum);
        }
        return result;
    }
}
