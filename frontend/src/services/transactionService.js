import apiClient from './axiosConfig';
import {
  MOCK_TRANSACTIONS,
  getTransactionById as getMockById,
} from '../utils/transactionMockData';

// ─── Transaction Service ──────────────────────────────────────────────────────
// Backend controller: TransactionController.java
//
// Current backend state:
//   POST /api/transactions/process  → implemented
//   GET  /api/transactions          → not yet implemented (mock used)
//   GET  /api/transactions/:id      → not yet implemented (mock used)
//
// When the backend adds GET endpoints, set VITE_USE_MOCK_TRANSACTIONS=false in .env
// ─────────────────────────────────────────────────────────────────────────────

const USE_MOCK = import.meta.env.VITE_USE_MOCK_TRANSACTIONS !== 'false';
const delay    = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Submit a new transaction for processing through the pipeline.
 * Endpoint: POST /api/transactions/process  (backend implemented)
 * @param {object} data — matches TransactionProcessRequest DTO
 */
export const processTransaction = (data) =>
  apiClient.post('/api/transactions/process', data).then((r) => r.data);

/**
 * Fetch all transactions.
 * Endpoint: GET /api/transactions  (not yet implemented — using mock)
 */
export const getAllTransactions = async (params) => {
  if (USE_MOCK) {
    await delay(400);
    return MOCK_TRANSACTIONS;
  }
  return apiClient.get('/api/transactions', { params }).then((r) => r.data);
};

/**
 * Fetch full lifecycle detail for a single transaction.
 * Endpoint: GET /api/transactions/:tid  (not yet implemented — using mock)
 * @param {string} tid
 */
export const getTransactionById = async (tid) => {
  if (USE_MOCK) {
    await delay(300);
    const tx = getMockById(tid);
    if (!tx) throw new Error(`Transaction ${tid} not found`);
    return tx;
  }
  return apiClient.get(`/api/transactions/${tid}`).then((r) => r.data);
};
