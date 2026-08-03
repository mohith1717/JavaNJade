import { apiGet } from "./apiClient";

export async function fetchAdminSummary() {
  return apiGet("/api/dashboard/summary");
}

export async function fetchFailureLogs() {
  return apiGet("/api/transactions/failures");
}

export async function fetchRules() {
  return apiGet("/api/admin/rules");
}

export async function fetchCases(status) {
  if (!status || status === "ALL") {
    return apiGet("/api/cases");
  }

  const params = new URLSearchParams({ status });
  return apiGet(`/api/cases?${params.toString()}`);
}

export async function fetchCaseByAlertId(alertId) {
  return apiGet(`/api/cases/${encodeURIComponent(alertId)}`);
}

export async function fetchAuditTrail(entityType, entityId) {
  const params = new URLSearchParams({ entityType, entityId });
  return apiGet(`/api/dashboard/audit-trail?${params.toString()}`);
}
