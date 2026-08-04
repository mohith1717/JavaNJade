import { PriorityBadge } from "../badges/PriorityBadge";
import { RiskBadge, type RiskLevel } from "../badges/RiskBadge";
import { StatusBadge } from "../badges/StatusBadge";
import type { AlertDetail } from "../../types/alert";

export function AlertOverview({ alert }: { alert: AlertDetail }) {
  return <article className="investigation-card alert-overview"><div className="card-heading"><div><p className="eyebrow">Alert overview</p><h2>{alert.primaryReason}</h2></div><div className="heading-badges"><PriorityBadge priority={alert.priority} /><StatusBadge status={alert.status} /></div></div><div className="risk-hero"><div><span>Risk score</span><strong>{alert.riskScore}</strong><RiskBadge level={riskLevel(alert.riskScore)} /></div><p>{alert.primaryReason}</p></div><dl className="detail-grid"><Detail label="Alert ID" value={alert.id} mono /><Detail label="Transaction ID" value={alert.transactionId} mono /><Detail label="Assigned analyst" value={alert.assignedTo || "Unassigned"} mono={Boolean(alert.assignedTo)} /><Detail label="Decision" value={alert.decision || "Pending"} /><Detail label="Created" value={formatDate(alert.createdAt)} /><Detail label="Last activity" value={formatDate(lastActivity(alert))} /></dl>{alert.resolutionNotes && <div className="resolution-note"><strong>Resolution notes</strong><p>{alert.resolutionNotes}</p></div>}</article>;
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) { return <div><dt>{label}</dt><dd className={mono ? "mono-value" : ""}>{value}</dd></div>; }
function riskLevel(score: number): RiskLevel { return score >= 80 ? "CRITICAL" : score >= 60 ? "HIGH" : score >= 30 ? "MEDIUM" : "LOW"; }
function lastActivity(alert: AlertDetail) { return alert.reopenedAt || alert.closedAt || alert.investigatingAt || alert.assignedAt || alert.createdAt; }
function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
