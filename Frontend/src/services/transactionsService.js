import { apiGet, apiPost } from "./apiClient";

export async function fetchTransactions() {
  return apiGet("/api/transactions");
}

export async function processTransaction(payload) {
  return apiPost("/api/transactions/process", payload);
}
