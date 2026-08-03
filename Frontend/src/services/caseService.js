import { apiPost } from "./apiClient";

export async function assignCase(alertId, payload) {
  return apiPost(`/api/cases/${encodeURIComponent(alertId)}/assign`, payload);
}

export async function investigateCase(alertId, payload) {
  return apiPost(`/api/cases/${encodeURIComponent(alertId)}/investigate`, payload);
}

export async function resolveCase(alertId, payload) {
  return apiPost(`/api/cases/${encodeURIComponent(alertId)}/resolve`, payload);
}
