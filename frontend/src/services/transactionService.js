import apiClient from './axiosConfig';

// ─── Transaction Service ──────────────────────────────────────────────────────
// Backend controller: com.jadeguard.transaction.TransactionController
// ─────────────────────────────────────────────────────────────────────────────

export const createTransaction = (data) =>
  apiClient.post('/api/transactions', data).then((r) => r.data);

export const getAllTransactions = (params) =>
  apiClient.get('/api/transactions', { params }).then((r) => r.data);

export const getTransactionById = (transactionId) =>
  apiClient.get(`/api/transactions/${transactionId}`).then((r) => r.data);

export const getTransactionRoute = (transactionId) =>
  apiClient.get(`/api/transactions/${transactionId}/route`).then((r) => r.data);

export const getTransactionFundFlow = (transactionId) =>
  apiClient.get(`/api/transactions/${transactionId}/fund-flow`).then((r) => r.data);

export const getTransactionValidationErrors = (transactionId) =>
  apiClient.get(`/api/transactions/${transactionId}/validation-errors`).then((r) => r.data);
