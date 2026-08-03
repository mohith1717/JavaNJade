package com.jadeguard.report;

import java.time.Instant;
import java.util.List;

import com.jadeguard.transaction.RiskLevel;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportingController {
    private final ReportingService service;
    public ReportingController(ReportingService service) { this.service = service; }

    @GetMapping("/risk-summary")
    public RiskSummaryResponse riskSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(required = false) String currency,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) RiskLevel riskLevel) {
        return service.riskSummary(filters(from, to, currency, country, riskLevel));
    }

    @GetMapping("/alert-summary")
    public AlertSummaryResponse alertSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(required = false) String currency,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) RiskLevel riskLevel) {
        return service.alertSummary(filters(from, to, currency, country, riskLevel));
    }

    @GetMapping("/rule-effectiveness")
    public List<RuleEffectivenessResponse> ruleEffectiveness(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(required = false) String currency,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) RiskLevel riskLevel) {
        return service.ruleEffectiveness(filters(from, to, currency, country, riskLevel));
    }

    @GetMapping("/country-risk")
    public List<CountryRiskResponse> countryRisk(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(required = false) String currency,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) RiskLevel riskLevel) {
        return service.countryRisk(filters(from, to, currency, country, riskLevel));
    }

    @GetMapping("/transaction-volume")
    public List<TransactionVolumeResponse> transactionVolume(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(required = false) String currency,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) RiskLevel riskLevel,
            @RequestParam(required = false, defaultValue = "HOUR") ReportInterval interval) {
        return service.transactionVolume(
                filters(from, to, currency, country, riskLevel), interval);
    }

    private ReportFilters filters(Instant from, Instant to, String currency,
            String country, RiskLevel riskLevel) {
        return new ReportFilters(from, to, currency, country, riskLevel);
    }
}
