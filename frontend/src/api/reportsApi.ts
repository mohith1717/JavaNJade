import type { AlertSummary, CountryRisk, DashboardReports, ReportFilters, RiskSummary, RuleEffectiveness, TransactionVolume } from "../types/report";
import { apiRequest } from "./apiClient";

export async function getDashboardReports(filters: ReportFilters, signal?: AbortSignal): Promise<DashboardReports> {
  const common = query(filters, false); const volume = query(filters, true);
  const [risk, alerts, rules, countries, transactionVolume] = await Promise.all([
    apiRequest<RiskSummary>(`/reports/risk-summary${common}`, { signal }),
    apiRequest<AlertSummary>(`/reports/alert-summary${common}`, { signal }),
    apiRequest<RuleEffectiveness[]>(`/reports/rule-effectiveness${common}`, { signal }),
    apiRequest<CountryRisk[]>(`/reports/country-risk${common}`, { signal }),
    apiRequest<TransactionVolume[]>(`/reports/transaction-volume${volume}`, { signal }),
  ]);
  return { risk, alerts, rules, countries, volume: transactionVolume };
}

function query(filters: ReportFilters, includeInterval: boolean) {
  const params = new URLSearchParams();
  if (filters.from) params.set("from", new Date(filters.from).toISOString());
  if (filters.to) params.set("to", new Date(filters.to).toISOString());
  if (filters.currency) params.set("currency", filters.currency.trim().toUpperCase());
  if (filters.country) params.set("country", filters.country.trim().toUpperCase());
  if (filters.riskLevel) params.set("riskLevel", filters.riskLevel);
  if (includeInterval && filters.interval) params.set("interval", filters.interval);
  return params.size ? `?${params.toString()}` : "";
}
