import { useState, type FormEvent } from "react";
import type { AuthUser } from "../../auth/authTypes";
import type { AlertDetail, AlertStatus } from "../../types/alert";

export type AlertAction = "ASSIGN" | "START" | "APPROVE" | "BLOCK" | "ESCALATE" | "CLOSE" | "REOPEN";

export function AlertActionPanel({ alert, user, busy, error, success, onAction }: { alert: AlertDetail; user: AuthUser; busy: boolean; error: string; success: string; onAction: (action: AlertAction, reason: string, assignedTo?: string) => Promise<void> }) {
  const [selected, setSelected] = useState<AlertAction | null>(null);
  const [reason, setReason] = useState("");
  const [assignee, setAssignee] = useState(user.role === "FRAUD_ANALYST" ? user.id : "");
  const actions = actionsFor(alert.status);
  if (user.role === "RISK_ANALYST") return <article className="investigation-card read-only-card"><p className="eyebrow">Read-only access</p><h2>Risk Analyst view</h2><p>You can review evidence, risk explanations, fund flow and history. Lifecycle decisions require a Fraud Analyst or Administrator.</p></article>;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    try {
      await onAction(selected, reason.trim(), selected === "ASSIGN" ? assignee.trim() : undefined);
      setSelected(null); setReason("");
    } catch {
      // Keep the form open so the analyst can correct the reason or assignee.
    }
  }

  return <article className="investigation-card action-panel"><div className="card-heading"><div><p className="eyebrow">Case controls</p><h2>Available actions</h2></div><StatusFlow status={alert.status} /></div>{success && <div className="action-success" role="status">✓ {success}</div>}{error && <div className="background-error" role="alert">{error}</div>}{actions.length === 0 ? <p className="section-muted">No lifecycle action is available for the current status.</p> : <div className="action-buttons">{actions.map((action) => <button key={action} className={`action-button action-${action.toLowerCase()}`} onClick={() => { setSelected(action); setReason(""); }}>{labelFor(action, user.role === "FRAUD_ANALYST")}</button>)}</div>}{selected && <form className="action-form" onSubmit={submit}><div className="action-form-heading"><strong>{labelFor(selected, user.role === "FRAUD_ANALYST")}</strong><button type="button" onClick={() => setSelected(null)} aria-label="Cancel action">×</button></div>{selected === "ASSIGN" && <label>Fraud Analyst user ID<input value={assignee} onChange={(event) => setAssignee(event.target.value)} readOnly={user.role === "FRAUD_ANALYST"} required /><small>{user.role === "FRAUD_ANALYST" ? "This alert will be assigned to your authenticated account." : "Enter the UUID of an enabled Fraud Analyst."}</small></label>}<label>Reason<textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explain why this action is being taken" minLength={3} required /></label><div className="action-form-buttons"><button type="button" className="clear-button" onClick={() => setSelected(null)}>Cancel</button><button type="submit" className="primary-button compact-button" disabled={busy || !reason.trim() || (selected === "ASSIGN" && !assignee.trim())}>{busy ? "Saving…" : "Confirm action"}</button></div></form>}</article>;
}

function actionsFor(status: AlertStatus): AlertAction[] { switch (status) { case "OPEN": return ["ASSIGN"]; case "ASSIGNED": return ["START"]; case "INVESTIGATING": return ["APPROVE", "BLOCK", "ESCALATE"]; case "APPROVED": case "BLOCKED": case "ESCALATED": return ["CLOSE"]; case "CLOSED": return ["REOPEN"]; } }
function labelFor(action: AlertAction, self: boolean) { return ({ ASSIGN: self ? "Assign to me" : "Assign analyst", START: "Start investigation", APPROVE: "Approve transaction", BLOCK: "Block transaction", ESCALATE: "Escalate alert", CLOSE: "Close alert", REOPEN: "Reopen alert" })[action]; }
function StatusFlow({ status }: { status: AlertStatus }) { return <span className="current-status">Current: {status.replaceAll("_", " ")}</span>; }
