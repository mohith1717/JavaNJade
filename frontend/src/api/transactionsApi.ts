import type { FundFlow, RiskAssessment, Transaction } from "../types/transaction";
import { apiRequest } from "./apiClient";

export const getTransaction = (transactionId: string, signal?: AbortSignal) =>
  apiRequest<Transaction>(`/transactions/${encodeURIComponent(transactionId)}`, { signal });

export const getRiskAssessment = (transactionId: string, signal?: AbortSignal) =>
  apiRequest<RiskAssessment>(`/transactions/${encodeURIComponent(transactionId)}/risk-assessment`, { signal });

export const getFundFlow = (transactionId: string, signal?: AbortSignal) =>
  apiRequest<FundFlow>(`/transactions/${encodeURIComponent(transactionId)}/fund-flow`, { signal });
