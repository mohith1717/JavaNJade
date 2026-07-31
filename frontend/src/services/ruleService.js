import apiClient from './axiosConfig';

// ─── Rule Admin Service ───────────────────────────────────────────────────────
// Backend controller: RuleAdminController.java
// ─────────────────────────────────────────────────────────────────────────────

export const getAllRules = (params) =>
  apiClient.get('/api/rules', { params }).then((r) => r.data);

export const getRuleById = (ruleId) =>
  apiClient.get(`/api/rules/${ruleId}`).then((r) => r.data);

/**
 * Create or update a rule.
 * @param {object} ruleData — matches RuleUpsertRequest DTO
 */
export const upsertRule = (ruleData) =>
  ruleData.id
    ? apiClient.put(`/api/rules/${ruleData.id}`, ruleData).then((r) => r.data)
    : apiClient.post('/api/rules', ruleData).then((r) => r.data);

export const deleteRule = (ruleId) =>
  apiClient.delete(`/api/rules/${ruleId}`).then((r) => r.data);
