import type { RiskLevel } from "../components/badges/RiskBadge";

export type ReportFilters = { from?: string; to?: string; currency?: string; country?: string; riskLevel?: RiskLevel; interval?: "HOUR" | "DAY" };
export type RiskSummary = { totalTransactions: number; averageRiskScore: number; riskDistribution: Partial<Record<RiskLevel, number>>; highRiskTransactions: number };
export type AlertSummary = { totalAlerts: number; statusDistribution: Record<string, number>; priorityDistribution: Record<string, number>; decisionDistribution: Record<string, number> };
export type RuleEffectiveness = { ruleCode: string; ruleName: string; evaluationCount: number; triggerCount: number; triggerRate: number; totalScoreContribution: number };
export type CountryRisk = { countryCode: string; transactionCount: number; highRiskTransactionCount: number; alertCount: number; averageRiskScore: number };
export type TransactionVolume = { periodStart: string; transactionCount: number; totalAmount: number };
export type DashboardReports = { risk: RiskSummary; alerts: AlertSummary; rules: RuleEffectiveness[]; countries: CountryRisk[]; volume: TransactionVolume[] };
