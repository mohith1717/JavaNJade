import { apiRequest } from "./apiClient";
import type { WatchlistedAccount, WatchlistFilters } from "../types/watchlist";

export function getWatchlistedAccounts(filters: WatchlistFilters = {}) {
  const params = new URLSearchParams();
  if (filters.enabled !== undefined) params.set("enabled", String(filters.enabled));
  if (filters.accountId?.trim()) params.set("accountId", filters.accountId.trim());
  return apiRequest<WatchlistedAccount[]>(`/watchlisted-accounts${params.size ? `?${params}` : ""}`);
}

export function createWatchlistedAccount(accountId: string, reason: string) {
  return apiRequest<WatchlistedAccount>("/watchlisted-accounts", {
    method: "POST",
    body: JSON.stringify({ accountId, reason }),
  });
}

export function updateWatchlistedAccountStatus(id: string, enabled: boolean, reason: string) {
  return apiRequest<WatchlistedAccount>(`/watchlisted-accounts/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ enabled, reason }),
  });
}
