import apiClient from './axiosConfig';

// ─── Alert Service ────────────────────────────────────────────────────────────
// Backend controller: (alert endpoints, to be confirmed)
// ─────────────────────────────────────────────────────────────────────────────

export const getAllAlerts = (params) =>
  apiClient.get('/api/alerts', { params }).then((r) => r.data);

export const getAlertById = (alertId) =>
  apiClient.get(`/api/alerts/${alertId}`).then((r) => r.data);

export const assignAlert = (alertId, analystId) =>
  apiClient.post(`/api/alerts/${alertId}/assign`, { analystId }).then((r) => r.data);
