import type { Alert, AlertFilters } from "../types/alert";
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
  return apiRequest<Alert>(`/alerts/${encodeURIComponent(alertId)}`, { signal });
}
