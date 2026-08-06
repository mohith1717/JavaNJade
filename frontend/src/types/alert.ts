export type AlertStatus = "OPEN" | "ASSIGNED" | "INVESTIGATING" | "APPROVED" | "BLOCKED" | "ESCALATED" | "CLOSED";
export type AlertPriority = "HIGH" | "CRITICAL";

export type Alert = {
  id: string;
  transactionId: string;
  status: AlertStatus;
  priority: AlertPriority;
  primaryReason: string;
  riskScore: number;
  assignedTo: string | null;
  assignedAt: string | null;
  decision: "APPROVED" | "BLOCKED" | "ESCALATED" | null;
  resolutionNotes: string | null;
  createdAt: string;
  investigatingAt: string | null;
  closedAt: string | null;
  reopenedAt: string | null;
  version: number;
};

export type AlertHistory = {
  id: string;
  alertId: string;
  fromStatus: AlertStatus | null;
  toStatus: AlertStatus;
  reason: string | null;
  changedBy: string;
  changedAt: string;
};

export type AlertDetail = Alert & { statusHistory: AlertHistory[] };

export type AlertFilters = {
  status?: AlertStatus;
  priority?: AlertPriority;
  assignedTo?: string;
  transactionId?: string;
};
