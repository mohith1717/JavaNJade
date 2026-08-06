import { useEffect, useState, type FormEvent } from "react";
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
  const [analystsLoading, setAnalystsLoading] = useState(false);
  const [analystsError, setAnalystsError] = useState("");
  const actions = actionsFor(alert.status);

  useEffect(() => {
    if (selected !== "ASSIGN" || user.role !== "ADMIN") return;
    const controller = new AbortController();
    setAnalystsLoading(true);
    setAnalystsError("");
    getUsers({ role: "FRAUD_ANALYST", enabled: true }, controller.signal)
      .then((result) => {
        setAnalysts(result);
        setAssignee((current) => current || result[0]?.id || "");
      })
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) setAnalystsError(caught instanceof Error ? caught.message : "Unable to load Fraud Analysts.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setAnalystsLoading(false);
      });
    return () => controller.abort();
  }, [selected, user.role]);
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

  return <article className="investigation-card action-panel case-action-panel"><div className="case-control-header"><span className="control-shield">◇</span><div><p className="eyebrow">Case controls</p><h2>Analyst decision desk</h2></div></div><StatusFlow status={alert.status} /><p className="control-guidance">Select the next permitted lifecycle action. Every decision is recorded in the immutable audit trail.</p>{success && <div className="action-success" role="status">✓ {success}</div>}{error && <div className="background-error" role="alert">{error}</div>}{actions.length === 0 ? <p className="section-muted">No lifecycle action is available for the current status.</p> : <div className="action-buttons">{actions.map((action) => <button key={action} className={`action-button action-${action.toLowerCase()}`} onClick={() => { setSelected(action); setReason(""); }}><span>{actionSymbol(action)}</span><span>{labelFor(action, user.role === "FRAUD_ANALYST")}<small>{actionDescription(action)}</small></span></button>)}</div>}{selected && <form className="action-form" onSubmit={submit}><div className="action-form-heading"><strong>{labelFor(selected, user.role === "FRAUD_ANALYST")}</strong><button type="button" onClick={() => setSelected(null)} aria-label="Cancel action">×</button></div>{selected === "ASSIGN" && <AssigneeField user={user} assignee={assignee} analysts={analysts} loading={analystsLoading} error={analystsError} onChange={setAssignee} />}<label>Decision reason<textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explain the evidence supporting this action" minLength={3} required /></label><div className="action-form-buttons"><button type="button" className="clear-button" onClick={() => setSelected(null)}>Cancel</button><button type="submit" className="primary-button compact-button" disabled={busy || analystsLoading || !reason.trim() || (selected === "ASSIGN" && !assignee.trim())}>{busy ? "Saving…" : "Confirm action"}</button></div></form>}</article>;
}

function AssigneeField({ user, assignee, analysts, loading, error, onChange }: { user: AuthUser; assignee: string; analysts: ManagedUser[]; loading: boolean; error: string; onChange: (id: string) => void }) {
  if (user.role === "FRAUD_ANALYST") return <label>Assigned analyst<input value={`${user.displayName} (@${user.username})`} readOnly /><small>This alert will be assigned to your authenticated account.</small></label>;
  return <label>Fraud Analyst<select value={assignee} onChange={(event) => onChange(event.target.value)} disabled={loading} required><option value="">{loading ? "Loading enabled analysts…" : analysts.length ? "Select an analyst" : "No enabled Fraud Analysts"}</option>{analysts.map((analyst) => <option key={analyst.id} value={analyst.id}>{analyst.displayName} (@{analyst.username})</option>)}</select>{error ? <small className="field-error" role="alert">{error}</small> : <small>Choose an enabled Fraud Analyst. JadeGuard submits their user ID automatically.</small>}</label>;
}

function actionsFor(status: AlertStatus): AlertAction[] { switch (status) { case "OPEN": return ["ASSIGN"]; case "ASSIGNED": return ["START"]; case "INVESTIGATING": return ["APPROVE", "BLOCK", "ESCALATE"]; case "APPROVED": case "BLOCKED": case "ESCALATED": return ["CLOSE"]; case "CLOSED": return ["REOPEN"]; } }
function labelFor(action: AlertAction, self: boolean) { return ({ ASSIGN: self ? "Assign to me" : "Assign analyst", START: "Start investigation", APPROVE: "Approve transaction", BLOCK: "Block transaction", ESCALATE: "Escalate alert", CLOSE: "Close alert", REOPEN: "Reopen alert" })[action]; }
function actionSymbol(action: AlertAction) { return ({ ASSIGN: "→", START: "◎", APPROVE: "✓", BLOCK: "×", ESCALATE: "↑", CLOSE: "□", REOPEN: "↻" })[action]; }
function actionDescription(action: AlertAction) { return ({ ASSIGN: "Take ownership of this case", START: "Begin active evidence review", APPROVE: "Clear the monitored transaction", BLOCK: "Prevent transaction processing", ESCALATE: "Raise for enhanced review", CLOSE: "Complete this investigation", REOPEN: "Return eligible case to queue" })[action]; }
function StatusFlow({ status }: { status: AlertStatus }) { const stages = ["OPEN", "ASSIGNED", "INVESTIGATING", "DECISION", "CLOSED"]; const active = status === "APPROVED" || status === "BLOCKED" || status === "ESCALATED" ? "DECISION" : status; return <div className="case-lifecycle"><span>Lifecycle</span><div>{stages.map((stage) => <i className={stage === active ? "active" : ""} key={stage} title={stage} />)}</div><strong>{status.replaceAll("_", " ")}</strong></div>; }
