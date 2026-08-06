import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { ApiError } from "../api/ApiError";
import { getAlerts } from "../api/alertsApi";
import { PriorityBadge } from "../components/badges/PriorityBadge";
import { RiskBadge, type RiskLevel } from "../components/badges/RiskBadge";
import { StatusBadge } from "../components/badges/StatusBadge";
import { EmptyState } from "../components/feedback/EmptyState";
import { ErrorState } from "../components/feedback/ErrorState";
import { InlineSpinner } from "../components/feedback/InlineSpinner";
import { LoadingState } from "../components/feedback/LoadingState";
import type { Alert, AlertFilters, AlertPriority, AlertStatus } from "../types/alert";

const STATUSES: AlertStatus[] = ["OPEN", "ASSIGNED", "INVESTIGATING", "APPROVED", "BLOCKED", "ESCALATED", "CLOSED"];
const PRIORITIES: AlertPriority[] = ["CRITICAL", "HIGH"];
type Assignment = "ALL" | "UNASSIGNED" | "ASSIGNED" | "ANALYST";

export function AlertQueuePage() {
  const [params, setParams] = useSearchParams();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [transactionDraft, setTransactionDraft] = useState(params.get("transactionId") || "");
  const [analystDraft, setAnalystDraft] = useState(params.get("assignedTo") || "");
  const requestInFlight = useRef(false);

  const status = (params.get("status") || "") as AlertStatus | "";
  const priority = (params.get("priority") || "") as AlertPriority | "";
  const assignment = (params.get("assignment") || "ALL") as Assignment;
  const transactionId = params.get("transactionId") || "";
  const assignedTo = params.get("assignedTo") || "";

  const load = useCallback(async (background = false) => {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    background ? setRefreshing(true) : setInitialLoading(true);
    try {
      const serverFilters: AlertFilters = {};
      if (status) serverFilters.status = status;
      if (priority) serverFilters.priority = priority;
      if (transactionId) serverFilters.transactionId = transactionId;
      if (assignment === "ANALYST" && assignedTo) serverFilters.assignedTo = assignedTo;
      const data = await getAlerts(serverFilters);
      setAlerts(data);
      setError("");
      setLastUpdated(new Date());
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : "Unable to load alerts.";
      setError(message);
    } finally {
      requestInFlight.current = false;
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [status, priority, transactionId, assignment, assignedTo]);

  useEffect(() => { void load(false); }, [load]);
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void load(true);
    }, 5000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void load(true);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { window.clearInterval(interval); document.removeEventListener("visibilitychange", onVisibility); };
  }, [load]);

  const visibleAlerts = useMemo(() => alerts
    .filter((alert) => assignment !== "UNASSIGNED" || !alert.assignedTo)
    .filter((alert) => assignment !== "ASSIGNED" || Boolean(alert.assignedTo))
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 100), [alerts, assignment]);

  const summary = useMemo(() => ({
    open: visibleAlerts.filter((alert) => alert.status === "OPEN").length,
    assigned: visibleAlerts.filter((alert) => alert.status === "ASSIGNED").length,
    investigating: visibleAlerts.filter((alert) => alert.status === "INVESTIGATING").length,
    critical: visibleAlerts.filter((alert) => alert.priority === "CRITICAL").length,
    unassigned: visibleAlerts.filter((alert) => !alert.assignedTo).length,
  }), [visibleAlerts]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    value && value !== "ALL" ? next.set(key, value) : next.delete(key);
    if (key === "assignment" && value !== "ANALYST") next.delete("assignedTo");
    setParams(next, { replace: true });
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const next = new URLSearchParams(params);
    transactionDraft.trim() ? next.set("transactionId", transactionDraft.trim()) : next.delete("transactionId");
    if (assignment === "ANALYST" && analystDraft.trim()) next.set("assignedTo", analystDraft.trim()); else next.delete("assignedTo");
    setParams(next, { replace: true });
  }

  function clearFilters() {
    setTransactionDraft(""); setAnalystDraft(""); setParams({}, { replace: true });
  }

  if (initialLoading && alerts.length === 0) return <LoadingState message="Loading alert queue…" />;

  return <section className="alert-queue-page fraud-operations">
    <header className="alert-command-hero"><div><div className="alert-live-label"><span />Fraud operations live <small>Priority-ordered queue</small></div><h2>Actionable risk,<br /><span>ready for review.</span></h2><p>Investigate explainable alerts, claim unassigned work and move every case through a controlled decision lifecycle.</p></div><div className="queue-health"><div className="queue-health-top"><span className={refreshing ? "queue-radar active" : "queue-radar"}><i /><b /></span><div><small>{refreshing ? "Synchronizing queue" : "Queue synchronized"}</small><strong>{lastUpdated ? lastUpdated.toLocaleTimeString() : "Awaiting data"}</strong></div></div><dl><div><dt>Critical</dt><dd>{summary.critical}</dd></div><div><dt>Unassigned</dt><dd>{summary.unassigned}</dd></div><div><dt>Investigating</dt><dd>{summary.investigating}</dd></div></dl><button className="secondary-button" onClick={() => void load(true)} disabled={refreshing}>{refreshing ? <InlineSpinner label="Refreshing" /> : "Refresh queue"}</button></div></header>

    <div className="queue-summary alert-workload-summary" aria-label="Current result summary"><QueueMetric icon="○" label="Open intake" count={summary.open} detail="Awaiting ownership" /><QueueMetric icon="→" label="Assigned" count={summary.assigned} detail="Claimed cases" /><QueueMetric icon="◎" label="Investigating" count={summary.investigating} detail="Active reviews" /><QueueMetric icon="!" label="Critical priority" count={summary.critical} detail="Immediate attention" critical /><QueueMetric icon="◇" label="Unassigned" count={summary.unassigned} detail="Available work" /></div>

    <form className="alert-filter-workbench" onSubmit={submitSearch}><div className="alert-filter-heading"><div><span>⌁</span><div><strong>Queue controls</strong><small>Filter by lifecycle, ownership or transaction</small></div></div><b>{visibleAlerts.length} visible cases</b></div><div className="alert-filters">
      <label>Status<select value={status} onChange={(event) => updateParam("status", event.target.value)}><option value="">All statuses</option>{STATUSES.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>Priority<select value={priority} onChange={(event) => updateParam("priority", event.target.value)}><option value="">All priorities</option>{PRIORITIES.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>Assignment<select value={assignment} onChange={(event) => updateParam("assignment", event.target.value)}><option value="ALL">All alerts</option><option value="UNASSIGNED">Unassigned</option><option value="ASSIGNED">Assigned</option><option value="ANALYST">Specific analyst</option></select></label>
      {assignment === "ANALYST" && <label>Analyst user ID<input value={analystDraft} onChange={(event) => setAnalystDraft(event.target.value)} placeholder="Analyst UUID" /></label>}
      <label className="transaction-filter">Transaction ID<input value={transactionDraft} onChange={(event) => setTransactionDraft(event.target.value)} placeholder="Exact transaction UUID" /></label>
      <div className="filter-actions"><button className="primary-button compact-button" type="submit">Apply search</button><button className="clear-button" type="button" onClick={clearFilters}>Clear</button></div>
    </div></form>

    {error && alerts.length === 0 ? <ErrorState message={error} onRetry={() => void load(false)} /> : <>{error && <div className="background-error" role="alert">Refresh failed: {error}. Existing results are still displayed.</div>}{visibleAlerts.length === 0 ? <EmptyState title="No alerts match these filters" description="Change or clear the filters, or wait for the next transaction assessment." /> : <AlertTable alerts={visibleAlerts} total={alerts.length} />}</>}
  </section>;
}

function AlertTable({ alerts, total }: { alerts: Alert[]; total: number }) {
  return <div className="alert-table-card operational-queue"><div className="table-caption"><span>Showing {alerts.length} of {total} returned alerts</span><span><i className="live-pulse" />Live operational results</span></div><div className="alert-table-scroll"><table className="alert-table"><thead><tr><th>Priority</th><th>Status</th><th>Risk</th><th>Primary reason</th><th>Transaction</th><th>Case owner</th><th>Last activity</th><th aria-label="Actions" /></tr></thead><tbody>{alerts.map((alert) => <tr key={alert.id} className={`${alert.priority === "CRITICAL" ? "critical-alert-row" : "high-alert-row"} ${alert.assignedTo ? "" : "unassigned-alert-row"}`}><td data-label="Priority"><div className="priority-signal"><span className="priority-symbol">{alert.priority === "CRITICAL" ? "!!" : "!"}</span><div><PriorityBadge priority={alert.priority} /><small>{alert.priority === "CRITICAL" ? "Immediate review" : "Elevated review"}</small></div></div></td><td data-label="Status"><StatusBadge status={alert.status} /></td><td data-label="Risk"><div className="queue-risk"><RiskBadge level={riskLevel(alert.riskScore)} /><strong>{alert.riskScore}</strong><i><b style={{ width: `${Math.min(alert.riskScore, 100)}%` }} /></i></div></td><td data-label="Reason"><span className="reason-text" title={alert.primaryReason}>{alert.primaryReason}</span></td><td data-label="Transaction"><code>{shortId(alert.transactionId)}</code></td><td data-label="Assigned"><span className={alert.assignedTo ? "owner-chip" : "owner-chip unassigned"}><i>{alert.assignedTo ? "A" : "?"}</i><span>{alert.assignedTo ? shortId(alert.assignedTo) : "Claim required"}</span></span></td><td data-label="Last activity"><time dateTime={lastActivity(alert)}>{formatDate(lastActivity(alert))}</time></td><td><Link className="view-alert-link queue-open-case" to={`/alerts/${alert.id}`} aria-label={`Open alert ${alert.id}`}>Open case <span>→</span></Link></td></tr>)}</tbody></table></div></div>;
}

function QueueMetric({ icon, label, count, detail, critical = false }: { icon: string; label: string; count: number; detail: string; critical?: boolean }) { return <article className={critical ? "critical-metric" : ""}><span className="queue-metric-icon">{icon}</span><div><span>{label}</span><strong>{count}</strong><small>{detail}</small></div></article>; }

function riskLevel(score: number): RiskLevel { return score >= 80 ? "CRITICAL" : score >= 60 ? "HIGH" : score >= 30 ? "MEDIUM" : "LOW"; }
function priorityRank(priority: AlertPriority) { return priority === "CRITICAL" ? 0 : 1; }
function lastActivity(alert: Alert) { return alert.reopenedAt || alert.closedAt || alert.investigatingAt || alert.assignedAt || alert.createdAt; }
function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function shortId(value: string) { return value.length > 16 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value; }
