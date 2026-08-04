import type { FundFlow, RiskAssessment, Transaction, TransactionRouteHop, TransactionValidationError } from "../types/transaction";
import { apiRequest } from "./apiClient";

export const getTransaction = (transactionId: string, signal?: AbortSignal) =>
  apiRequest<Transaction>(`/transactions/${encodeURIComponent(transactionId)}`, { signal });

export const getTransactions = (processingStatus?: string, signal?: AbortSignal) => {
  const query = processingStatus ? `?processingStatus=${encodeURIComponent(processingStatus)}` : "";
  return apiRequest<Transaction[]>(`/transactions${query}`, { signal });
};

export const getTransactionRoute = (transactionId: string, signal?: AbortSignal) =>
  apiRequest<TransactionRouteHop[]>(`/transactions/${encodeURIComponent(transactionId)}/route`, { signal });

export const getTransactionValidationErrors = (transactionId: string, signal?: AbortSignal) =>
  apiRequest<TransactionValidationError[]>(`/transactions/${encodeURIComponent(transactionId)}/validation-errors`, { signal });

export const getRiskAssessment = (transactionId: string, signal?: AbortSignal) =>
  apiRequest<RiskAssessment>(`/transactions/${encodeURIComponent(transactionId)}/risk-assessment`, { signal });

export const getFundFlow = (transactionId: string, signal?: AbortSignal) =>
  apiRequest<FundFlow>(`/transactions/${encodeURIComponent(transactionId)}/fund-flow`, { signal });
