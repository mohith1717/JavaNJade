import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getUsers } from "../../api/usersApi";
import type { AuthUser } from "../../auth/authTypes";
import type { AlertDetail, AlertStatus } from "../../types/alert";
import type { ManagedUser } from "../../types/user";

export type AlertAction = "ASSIGN" | "START" | "APPROVE" | "BLOCK" | "ESCALATE" | "CLOSE" | "REOPEN";

export function AlertActionPanel({ alert, user, busy, error, success, onAction }: { alert: AlertDetail; user: AuthUser; busy: boolean; error: string; success: string; onAction: (action: AlertAction, reason: string, assignedTo?: string) => Promise<void> }) {
  const [selected, setSelected] = useState<AlertAction | null>(null);
  const [reason, setReason] = useState("");
  const [assignee, setAssignee] = useState(user.role === "FRAUD_ANALYST" ? user.id : "");
  const [analysts, setAnalysts] = useState<ManagedUser[]>([]);
  const [loadingAnalysts, setLoadingAnalysts] = useState(false);
  const [analystError, setAnalystError] = useState("");
  const actions = actionsFor(alert.status);
  const availableFraudAnalysts = useMemo(() => analysts.filter((entry) => entry.role === "FRAUD_ANALYST"), [analysts]);
  const uuidReference = useMemo(() => analysts.filter((entry) => entry.role === "FRAUD_ANALYST" || entry.role === "RISK_ANALYST"), [analysts]);

  useEffect(() => {
    if (user.role === "RISK_ANALYST") return;
    setLoadingAnalysts(true);
    getUsers({ enabled: true })
      .then((response) => {
        setAnalysts(response);
        setAnalystError("");
      })
      .catch(() => setAnalystError("Unable to load analyst UUID reference."))
      .finally(() => setLoadingAnalysts(false));
  }, [user.role]);

  if (user.role === "RISK_ANALYST") return <article className="investigation-card read-only-card"><div className="read-only-icon">⌾</div><p className="eyebrow">Read-only access</p><h2>Risk Analyst review</h2><p>You can review evidence, risk explanations, fund flow and history. Lifecycle decisions require a Fraud Analyst or Administrator.</p><div className="permission-note">Decision controls are intentionally hidden for this role.</div></article>;

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

  return <article className="investigation-card action-panel case-action-panel"><div className="case-control-header"><span className="control-shield">◇</span><div><p className="eyebrow">Case controls</p><h2>Analyst decision desk</h2></div></div><StatusFlow status={alert.status} /><p className="control-guidance">Select the next permitted lifecycle action. Every decision is recorded in the immutable audit trail.</p>{success && <div className="action-success" role="status">✓ {success}</div>}{error && <div className="background-error" role="alert">{error}</div>}{actions.length === 0 ? <p className="section-muted">No lifecycle action is available for the current status.</p> : <div className="action-buttons">{actions.map((action) => <button key={action} className={`action-button action-${action.toLowerCase()}`} onClick={() => { setSelected(action); setReason(""); }}><span>{actionSymbol(action)}</span><span>{labelFor(action, user.role === "FRAUD_ANALYST")}<small>{actionDescription(action)}</small></span></button>)}</div>}{selected && <form className="action-form" onSubmit={submit}><div className="action-form-heading"><strong>{labelFor(selected, user.role === "FRAUD_ANALYST")}</strong><button type="button" onClick={() => setSelected(null)} aria-label="Cancel action">×</button></div>{selected === "ASSIGN" && <><label>Fraud Analyst user ID<input value={assignee} onChange={(event) => setAssignee(event.target.value)} readOnly={user.role === "FRAUD_ANALYST"} required /><small>{user.role === "FRAUD_ANALYST" ? "This alert will be assigned to your authenticated account." : "Pick an enabled Fraud Analyst or paste UUID directly."}</small></label>{user.role !== "FRAUD_ANALYST" && <label>Select fraud analyst<select value={assignee} onChange={(event) => setAssignee(event.target.value)} disabled={loadingAnalysts}><option value="">Select an analyst…</option>{availableFraudAnalysts.map((entry) => <option key={entry.id} value={entry.id}>{entry.displayName} ({entry.username})</option>)}</select></label>}{analystError && <small className="analyst-uuid-error">{analystError}</small>}{uuidReference.length > 0 && <div className="analyst-uuid-reference"><span>Analyst UUID reference</span><ul>{uuidReference.map((entry) => <li key={entry.id}><div><strong>{entry.displayName}</strong><small>{entry.role.replaceAll("_", " ")} · {entry.username}</small></div><code>{entry.id}</code><button type="button" onClick={() => setAssignee(entry.id)}>Use</button></li>)}</ul></div>}</>}
<label>Decision reason<textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explain the evidence supporting this action" minLength={3} required /></label><div className="action-form-buttons"><button type="button" className="clear-button" onClick={() => setSelected(null)}>Cancel</button><button type="submit" className="primary-button compact-button" disabled={busy || !reason.trim() || (selected === "ASSIGN" && !assignee.trim())}>{busy ? "Saving…" : "Confirm action"}</button></div></form>}</article>;
}

function actionsFor(status: AlertStatus): AlertAction[] { switch (status) { case "OPEN": return ["ASSIGN"]; case "ASSIGNED": return ["START"]; case "INVESTIGATING": return ["APPROVE", "BLOCK", "ESCALATE"]; case "APPROVED": case "BLOCKED": case "ESCALATED": return ["CLOSE"]; case "CLOSED": return ["REOPEN"]; } }
function labelFor(action: AlertAction, self: boolean) { return ({ ASSIGN: self ? "Assign to me" : "Assign analyst", START: "Start investigation", APPROVE: "Approve transaction", BLOCK: "Block transaction", ESCALATE: "Escalate alert", CLOSE: "Close alert", REOPEN: "Reopen alert" })[action]; }
function actionSymbol(action: AlertAction) { return ({ ASSIGN: "→", START: "◎", APPROVE: "✓", BLOCK: "×", ESCALATE: "↑", CLOSE: "□", REOPEN: "↻" })[action]; }
function actionDescription(action: AlertAction) { return ({ ASSIGN: "Take ownership of this case", START: "Begin active evidence review", APPROVE: "Clear the monitored transaction", BLOCK: "Prevent transaction processing", ESCALATE: "Raise for enhanced review", CLOSE: "Complete this investigation", REOPEN: "Return eligible case to queue" })[action]; }
function StatusFlow({ status }: { status: AlertStatus }) { const stages = ["OPEN", "ASSIGNED", "INVESTIGATING", "DECISION", "CLOSED"]; const active = status === "APPROVED" || status === "BLOCKED" || status === "ESCALATED" ? "DECISION" : status; return <div className="case-lifecycle"><span>Lifecycle</span><div>{stages.map((stage) => <i className={stage === active ? "active" : ""} key={stage} title={stage} />)}</div><strong>{status.replaceAll("_", " ")}</strong></div>; }
