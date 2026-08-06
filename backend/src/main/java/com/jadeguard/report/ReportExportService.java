package com.jadeguard.report;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class ReportExportService {
    private final ReportingService reports;

    public ReportExportService(ReportingService reports) {
        this.reports = reports;
    }

    public byte[] csv(ReportExportType type, ReportFilters filters,
            ReportInterval interval) {
        if (type == ReportExportType.DASHBOARD_SUMMARY) {
            return dashboardCsv(filters, interval);
        }
        List<List<?>> rows = new ArrayList<>();
        switch (type) {
            case RISK_SUMMARY -> riskRows(rows, reports.riskSummary(filters));
            case ALERT_SUMMARY -> alertRows(rows, reports.alertSummary(filters));
            case RULE_EFFECTIVENESS -> {
                rows.add(List.of("ruleCode", "ruleName", "evaluationCount",
                        "triggerCount", "triggerRate", "totalScoreContribution"));
                reports.ruleEffectiveness(filters).forEach(item -> rows.add(List.of(
                        item.ruleCode(), item.ruleName(), item.evaluationCount(),
                        item.triggerCount(), item.triggerRate(),
                        item.totalScoreContribution())));
            }
            case COUNTRY_RISK -> {
                rows.add(List.of("countryCode", "transactionCount",
                        "highRiskTransactionCount", "alertCount",
                        "averageRiskScore"));
                reports.countryRisk(filters).forEach(item -> rows.add(List.of(
                        item.countryCode(), item.transactionCount(),
                        item.highRiskTransactionCount(), item.alertCount(),
                        item.averageRiskScore())));
            }
            case TRANSACTION_VOLUME -> {
                rows.add(List.of("periodStart", "transactionCount", "totalAmount"));
                reports.transactionVolume(filters, interval).forEach(item -> rows.add(
                        List.of(item.periodStart(), item.transactionCount(),
                                item.totalAmount())));
            }
            default -> throw new IllegalArgumentException("Unsupported CSV report type");
        }
        return encode(rows);
    }

    public byte[] pdf(ReportFilters filters, ReportInterval interval) {
        RiskSummaryResponse risk = reports.riskSummary(filters);
        AlertSummaryResponse alerts = reports.alertSummary(filters);
        List<CountryRiskResponse> countries = reports.countryRisk(filters);
        List<RuleEffectivenessResponse> rules = reports.ruleEffectiveness(filters);
        List<TransactionVolumeResponse> volume = reports.transactionVolume(filters, interval);
        List<String> lines = new ArrayList<>();
        lines.add("JADEGUARD - TRANSACTION MONITORING REPORT");
        lines.add("Generated at: " + Instant.now());
        lines.add("Filters: " + filterText(filters, interval));
        lines.add("");
        lines.add("RISK SUMMARY");
        lines.add("Transactions: " + risk.totalTransactions());
        lines.add("Average risk score: " + risk.averageRiskScore());
        lines.add("High-risk transactions: " + risk.highRiskTransactions());
        risk.riskDistribution().forEach((key, value) -> lines.add("  " + key + ": " + value));
        lines.add("");
        lines.add("ALERT SUMMARY");
        lines.add("Total alerts: " + alerts.totalAlerts());
        alerts.statusDistribution().forEach((key, value) -> lines.add("  Status " + key + ": " + value));
        alerts.priorityDistribution().forEach((key, value) -> lines.add("  Priority " + key + ": " + value));
        lines.add("");
        lines.add("COUNTRY RISK");
        countries.forEach(item -> lines.add(String.format("%s | transactions %d | high risk %d | alerts %d | average score %s",
                item.countryCode(), item.transactionCount(),
                item.highRiskTransactionCount(), item.alertCount(),
                item.averageRiskScore())));
        lines.add("");
        lines.add("RULE EFFECTIVENESS");
        rules.forEach(item -> lines.add(String.format("%s | evaluated %d | triggered %d | rate %s%% | score +%d",
                item.ruleCode(), item.evaluationCount(), item.triggerCount(),
                item.triggerRate(), item.totalScoreContribution())));
        lines.add("");
        lines.add("TRANSACTION VOLUME (" + (interval == null ? ReportInterval.HOUR : interval) + ")");
        volume.forEach(item -> lines.add(item.periodStart() + " | count "
                + item.transactionCount() + " | amount " + item.totalAmount()));
        return PdfReportWriter.write(lines);
    }

    private byte[] dashboardCsv(ReportFilters filters, ReportInterval interval) {
        List<List<?>> rows = new ArrayList<>();
        rows.add(List.of("section", "metric", "value"));
        RiskSummaryResponse risk = reports.riskSummary(filters);
        rows.add(List.of("RISK", "totalTransactions", risk.totalTransactions()));
        rows.add(List.of("RISK", "averageRiskScore", risk.averageRiskScore()));
        rows.add(List.of("RISK", "highRiskTransactions", risk.highRiskTransactions()));
        AlertSummaryResponse alerts = reports.alertSummary(filters);
        rows.add(List.of("ALERT", "totalAlerts", alerts.totalAlerts()));
        reports.transactionVolume(filters, interval).forEach(item -> rows.add(List.of(
                "VOLUME", item.periodStart(), item.transactionCount() + " / " + item.totalAmount())));
        return encode(rows);
    }

    private void riskRows(List<List<?>> rows, RiskSummaryResponse risk) {
        rows.add(List.of("metric", "value"));
        rows.add(List.of("totalTransactions", risk.totalTransactions()));
        rows.add(List.of("averageRiskScore", risk.averageRiskScore()));
        rows.add(List.of("highRiskTransactions", risk.highRiskTransactions()));
        risk.riskDistribution().forEach((key, value) -> rows.add(List.of("risk." + key, value)));
    }

    private void alertRows(List<List<?>> rows, AlertSummaryResponse alerts) {
        rows.add(List.of("metric", "value"));
        rows.add(List.of("totalAlerts", alerts.totalAlerts()));
        addMap(rows, "status", alerts.statusDistribution());
        addMap(rows, "priority", alerts.priorityDistribution());
        addMap(rows, "decision", alerts.decisionDistribution());
    }

    private void addMap(List<List<?>> rows, String prefix, Map<?, Long> values) {
        values.forEach((key, value) -> rows.add(List.of(prefix + "." + key, value)));
    }

    private byte[] encode(List<List<?>> rows) {
        StringBuilder csv = new StringBuilder();
        rows.forEach(row -> {
            for (int index = 0; index < row.size(); index++) {
                if (index > 0) csv.append(',');
                csv.append(escapeCsv(String.valueOf(row.get(index))));
            }
            csv.append("\r\n");
        });
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escapeCsv(String value) {
        return value.contains(",") || value.contains("\"") || value.contains("\n")
                ? "\"" + value.replace("\"", "\"\"") + "\"" : value;
    }

    private String filterText(ReportFilters filters, ReportInterval interval) {
        return "from=" + value(filters.from()) + ", to=" + value(filters.to())
                + ", currency=" + value(filters.currency()) + ", country="
                + value(filters.country()) + ", riskLevel="
                + value(filters.riskLevel()) + ", interval="
                + (interval == null ? ReportInterval.HOUR : interval);
    }

    private String value(Object value) {
        return value == null ? "ALL" : value.toString();
    }
}
