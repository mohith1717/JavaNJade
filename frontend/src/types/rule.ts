export type RuleType = "HIGH_AMOUNT" | "HIGH_RISK_COUNTRY" | "EXCESSIVE_ROUTE_HOPS" | "RAPID_TRANSACTIONS" | "STRUCTURING" | "BLACKLISTED_ACCOUNT";
export type RuleSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type RuleParameters = Record<string, string | number | string[]>;

export type MonitoringRule = {
  id: string;
  code: string;
  name: string;
  type: RuleType;
  enabled: boolean;
  severity: RuleSeverity;
  riskWeight: number;
  parameters: RuleParameters;
  createdAt: string;
  updatedAt: string;
};

export type RulePayload = Omit<MonitoringRule, "id" | "createdAt" | "updatedAt"> & { reason: string };
export type RuleFilters = { type?: RuleType; enabled?: boolean };
