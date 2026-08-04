import type { AuditEvent, AuditEventPage, AuditFilters } from "../types/audit";
import { apiRequest } from "./apiClient";

export function getAuditEvents(filters: AuditFilters, signal?: AbortSignal) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value !== undefined && value !== "") params.set(key, String(value)); });
  return apiRequest<AuditEventPage>(`/audit-events?${params}`, { signal });
}
export const getAuditEvent = (id: string, signal?: AbortSignal) => apiRequest<AuditEvent>(`/audit-events/${encodeURIComponent(id)}`, { signal });
