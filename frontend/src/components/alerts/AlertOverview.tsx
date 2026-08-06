import { PriorityBadge } from "../badges/PriorityBadge";
import type { CSSProperties } from "react";
import { RiskBadge, type RiskLevel } from "../badges/RiskBadge";
import { StatusBadge } from "../badges/StatusBadge";
import type { AlertDetail } from "../../types/alert";

export function AlertOverview({ alert }: { alert: AlertDetail }) {
  return <article className="investigation-card alert-overview case-overview">
    <div className="case-overview-copy">
      <div className="case-classification"><span>Automated detection</span><PriorityBadge priority={alert.priority} /><StatusBadge status={alert.status} /></div>
      <p className="eyebrow">Investigation brief</p>
      <h1>{alert.priority === "CRITICAL" ? "Critical transaction requires immediate review" : "Elevated transaction requires analyst review"}</h1>
      <div className="evidence-statement"><span>!</span><p><strong>Primary evidence</strong>{alert.primaryReason}</p></div>
    </div>
    <div className="case-risk-display">
      <div className="case-risk-ring" style={{ "--risk-progress": `${Math.min(alert.riskScore, 100) * 3.6}deg` } as CSSProperties}><div><span>Risk score</span><strong>{alert.riskScore}</strong><small>/ 100</small></div></div>
      <RiskBadge level={riskLevel(alert.riskScore)} />
      <small>Composite rules assessment</small>
    </div>
    <dl className="detail-grid case-detail-grid"><Detail label="Alert ID" value={alert.id} mono /><Detail label="Transaction ID" value={alert.transactionId} mono /><Detail label="Assigned analyst" value={alert.assignedTo || "Unassigned"} mono={Boolean(alert.assignedTo)} /><Detail label="Decision" value={alert.decision || "Pending"} /><Detail label="Created" value={formatDate(alert.createdAt)} /><Detail label="Last activity" value={formatDate(lastActivity(alert))} /></dl>
    {alert.resolutionNotes && <div className="resolution-note"><strong>Resolution notes</strong><p>{alert.resolutionNotes}</p></div>}
  </article>;
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) { return <div><dt>{label}</dt><dd className={mono ? "mono-value" : ""}>{value}</dd></div>; }
function riskLevel(score: number): RiskLevel { return score >= 80 ? "CRITICAL" : score >= 60 ? "HIGH" : score >= 30 ? "MEDIUM" : "LOW"; }
function lastActivity(alert: AlertDetail) { return alert.reopenedAt || alert.closedAt || alert.investigatingAt || alert.assignedAt || alert.createdAt; }
function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
