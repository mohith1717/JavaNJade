import apiClient from './axiosConfig';

// ─── Validation Service ───────────────────────────────────────────────────────
// Backend controller: com.jadeguard.validation.ValidationErrorController
// ─────────────────────────────────────────────────────────────────────────────

export const getAllValidationErrors = (params) =>
	apiClient.get('/api/validation-errors', { params }).then((r) => r.data);

export const getValidationErrorById = (validationErrorId) =>
	apiClient.get(`/api/validation-errors/${validationErrorId}`).then((r) => r.data);

const validationService = {
	getAllValidationErrors,
	getValidationErrorById,
};

export default validationService;
