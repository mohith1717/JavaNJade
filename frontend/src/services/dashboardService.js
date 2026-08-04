import apiClient from './axiosConfig';

// ─── Dashboard Service ────────────────────────────────────────────────────────
// Backend controller: DashboardController.java
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch admin-level dashboard summary (counts, KPIs).
 * @returns {Promise<import('../types/dashboard').AdminDashboardResponse>}
 */
export const getAdminDashboard = () =>
  apiClient.get('/api/dashboard/admin').then((r) => r.data);

/**
 * Fetch fraud-investigator dashboard (assigned cases, workload).
 * @returns {Promise}
 */
export const getInvestigatorDashboard = () =>
  apiClient.get('/api/dashboard/investigator').then((r) => r.data);

/**
 * Fetch active alert summary for the alert widget.
 * @returns {Promise}
 */
export const getAlertDashboard = () =>
  apiClient.get('/api/dashboard/alerts').then((r) => r.data);
