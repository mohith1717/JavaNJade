import apiClient from './axiosConfig';

// ─── Case Management Service ──────────────────────────────────────────────────
// Backend controller: CaseManagementController.java
// ─────────────────────────────────────────────────────────────────────────────

export const getAllCases = (params) =>
  apiClient.get('/api/cases', { params }).then((r) => r.data);

export const getCaseById = (caseId) =>
  apiClient.get(`/api/cases/${caseId}`).then((r) => r.data);

/**
 * Perform an action on a case (escalate, resolve, close, reopen…).
 * @param {string} caseId
 * @param {object} actionRequest — matches CaseActionRequest DTO
 */
export const performCaseAction = (caseId, actionRequest) =>
  apiClient.post(`/api/cases/${caseId}/action`, actionRequest).then((r) => r.data);
