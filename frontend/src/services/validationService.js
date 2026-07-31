// ─── Validation Service ───────────────────────────────────────────────────────
// Validation results are embedded in transaction detail responses.
// This service is a placeholder for any dedicated validation endpoints
// the backend team may add in future iterations.
// ─────────────────────────────────────────────────────────────────────────────

// import apiClient from './axiosConfig';

// export const getValidationResult = (transactionId) =>
//   apiClient.get(`/api/validations/${transactionId}`).then((r) => r.data);

// Stub — no dedicated endpoint yet; data arrives via transactionService.getTransactionById
const validationService = {};
export default validationService;
