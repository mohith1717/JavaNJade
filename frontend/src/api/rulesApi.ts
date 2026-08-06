import type { MonitoringRule, RuleFilters, RulePayload } from "../types/rule";
import { apiRequest } from "./apiClient";

export function getRules(filters: RuleFilters = {}, signal?: AbortSignal) {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.enabled !== undefined) params.set("enabled", String(filters.enabled));
  return apiRequest<MonitoringRule[]>(`/rules${params.size ? `?${params}` : ""}`, { signal });
}
export const getRule = (id: string, signal?: AbortSignal) => apiRequest<MonitoringRule>(`/rules/${encodeURIComponent(id)}`, { signal });
export const createRule = (payload: RulePayload) => apiRequest<MonitoringRule>("/rules", { method: "POST", body: JSON.stringify(payload) });
export const updateRule = (id: string, payload: RulePayload) => apiRequest<MonitoringRule>(`/rules/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) });
export const updateRuleStatus = (id: string, enabled: boolean, reason: string) => apiRequest<MonitoringRule>(`/rules/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ enabled, reason }) });
