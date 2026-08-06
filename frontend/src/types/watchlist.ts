export type WatchlistedAccount = {
  id: string;
  accountId: string;
  reason: string;
  enabled: boolean;
  addedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type WatchlistFilters = { enabled?: boolean; accountId?: string };
