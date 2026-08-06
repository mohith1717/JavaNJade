import type { Alert, AlertDetail, AlertFilters, AlertHistory } from "../types/alert";
import { apiRequest } from "./apiClient";

export function getAlerts(filters: AlertFilters = {}, signal?: AbortSignal) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.size ? `?${params.toString()}` : "";
  return apiRequest<Alert[]>(`/alerts${query}`, { signal });
}

export function getAlert(alertId: string, signal?: AbortSignal) {
  return apiRequest<AlertDetail>(`/alerts/${encodeURIComponent(alertId)}`, { signal });
}

export function getAlertHistory(alertId: string, signal?: AbortSignal) {
  return apiRequest<AlertHistory[]>(`/alerts/${encodeURIComponent(alertId)}/history`, { signal });
}

export function assignAlert(alertId: string, assignedTo: string, reason: string) {
  return alertAction(alertId, "assign", { assignedTo, reason });
}

export function transitionAlert(alertId: string, action: "start-investigation" | "approve" | "block" | "escalate" | "close" | "reopen", reason: string) {
  return alertAction(alertId, action, { reason });
}

function alertAction(alertId: string, action: string, body: object) {
  return apiRequest<Alert>(`/alerts/${encodeURIComponent(alertId)}/${action}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
