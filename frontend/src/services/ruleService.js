import apiClient from './axiosConfig';

// ─── Rule Admin Service ───────────────────────────────────────────────────────
// Backend controller: com.jadeguard.rule.MonitoringRuleController
// ─────────────────────────────────────────────────────────────────────────────

export const getAllRules = (params) =>
  apiClient.get('/api/rules', { params }).then((r) => r.data);

export const getRuleById = (ruleId) =>
  apiClient.get(`/api/rules/${ruleId}`).then((r) => r.data);

export const createRule = (ruleData) =>
  apiClient.post('/api/rules', ruleData).then((r) => r.data);

export const updateRule = (ruleId, ruleData) =>
  apiClient.put(`/api/rules/${ruleId}`, ruleData).then((r) => r.data);

export const changeRuleStatus = (ruleId, enabled) =>
  apiClient.patch(`/api/rules/${ruleId}/status`, { enabled }).then((r) => r.data);
