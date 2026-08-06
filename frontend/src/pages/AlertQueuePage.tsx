import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { ApiError } from "../api/ApiError";
import { getAlerts } from "../api/alertsApi";
import { useAuth } from "../auth/AuthContext";
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
const ALERTS_PER_PAGE = 10;
type Assignment = "ALL" | "MY_WORK" | "MY_ASSIGNED" | "UNASSIGNED" | "ASSIGNED" | "ANALYST";

export function AlertQueuePage() {
  const { user } = useAuth();
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
  const assignment = (params.get("assignment") || (user?.role === "FRAUD_ANALYST" ? "MY_WORK" : "ALL")) as Assignment;
  const transactionId = params.get("transactionId") || "";
  const assignedTo = params.get("assignedTo") || "";
  const requestedPage = Math.max(1, Number(params.get("page")) || 1);

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
      if (assignment === "MY_ASSIGNED" && user?.id) serverFilters.assignedTo = user.id;
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
  }, [status, priority, transactionId, assignment, assignedTo, user?.id]);

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
    .filter((alert) => assignment !== "MY_WORK" || !alert.assignedTo || alert.assignedTo === user?.id)
    .filter((alert) => assignment !== "MY_ASSIGNED" || alert.assignedTo === user?.id)
    .filter((alert) => assignment !== "UNASSIGNED" || !alert.assignedTo)
    .filter((alert) => assignment !== "ASSIGNED" || Boolean(alert.assignedTo))
    .slice(0, 100), [alerts, assignment, user?.id]);

  const totalPages = Math.max(1, Math.ceil(visibleAlerts.length / ALERTS_PER_PAGE));
  const page = Math.min(requestedPage, totalPages);
  const pageAlerts = visibleAlerts.slice((page - 1) * ALERTS_PER_PAGE, page * ALERTS_PER_PAGE);

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
    next.delete("page");
    setParams(next, { replace: true });
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const next = new URLSearchParams(params);
    transactionDraft.trim() ? next.set("transactionId", transactionDraft.trim()) : next.delete("transactionId");
    if (assignment === "ANALYST" && analystDraft.trim()) next.set("assignedTo", analystDraft.trim()); else next.delete("assignedTo");
    next.delete("page");
    setParams(next, { replace: true });
  }

  function movePage(nextPage: number) {
    const next = new URLSearchParams(params);
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);
    safePage === 1 ? next.delete("page") : next.set("page", String(safePage));
    setParams(next, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearFilters() {
    setTransactionDraft(""); setAnalystDraft(""); setParams({}, { replace: true });
  }

  if (initialLoading && alerts.length === 0) return <LoadingState message="Loading alert queue…" />;

  return <section className="alert-queue-page fraud-operations">
    <header className="alert-command-hero"><div><div className="alert-live-label"><span />Fraud operations live <small>Newest activity first</small></div><h2>Actionable risk,<br /><span>ready for review.</span></h2><p>Investigate explainable alerts, claim unassigned work and move every case through a controlled decision lifecycle.</p></div><div className="queue-health"><div className="queue-health-top"><span className={refreshing ? "queue-radar active" : "queue-radar"}><i /><b /></span><div><small>{refreshing ? "Synchronizing queue" : "Queue synchronized"}</small><strong>{lastUpdated ? lastUpdated.toLocaleTimeString() : "Awaiting data"}</strong></div></div><dl><div><dt>Critical</dt><dd>{summary.critical}</dd></div><div><dt>Unassigned</dt><dd>{summary.unassigned}</dd></div><div><dt>Investigating</dt><dd>{summary.investigating}</dd></div></dl><button className="secondary-button" onClick={() => void load(true)} disabled={refreshing}>{refreshing ? <InlineSpinner label="Refreshing" /> : "Refresh queue"}</button></div></header>

    <div className="queue-summary alert-workload-summary" aria-label="Current result summary"><QueueMetric icon="○" label="Open intake" count={summary.open} detail="Awaiting ownership" /><QueueMetric icon="→" label="Assigned" count={summary.assigned} detail="Claimed cases" /><QueueMetric icon="◎" label="Investigating" count={summary.investigating} detail="Active reviews" /><QueueMetric icon="!" label="Critical priority" count={summary.critical} detail="Immediate attention" critical /><QueueMetric icon="◇" label="Unassigned" count={summary.unassigned} detail="Available work" /></div>

    <form className="alert-filter-workbench" onSubmit={submitSearch}><div className="alert-filter-heading"><div><span>⌁</span><div><strong>Queue controls</strong><small>Filter by lifecycle, ownership or transaction</small></div></div><b>{visibleAlerts.length} visible cases</b></div><div className="alert-filters">
      <label>Status<select value={status} onChange={(event) => updateParam("status", event.target.value)}><option value="">All statuses</option>{STATUSES.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>Priority<select value={priority} onChange={(event) => updateParam("priority", event.target.value)}><option value="">All priorities</option>{PRIORITIES.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>Assignment<select value={assignment} onChange={(event) => updateParam("assignment", event.target.value)}>{user?.role === "FRAUD_ANALYST" && <><option value="MY_WORK">My work + unassigned</option><option value="MY_ASSIGNED">Assigned to me</option></>}<option value="ALL">All alerts</option><option value="UNASSIGNED">Unassigned</option><option value="ASSIGNED">All assigned</option><option value="ANALYST">Specific analyst</option></select></label>
      {assignment === "ANALYST" && <label>Analyst user ID<input value={analystDraft} onChange={(event) => setAnalystDraft(event.target.value)} placeholder="Analyst UUID" /></label>}
      <label className="transaction-filter">Transaction ID<input value={transactionDraft} onChange={(event) => setTransactionDraft(event.target.value)} placeholder="Exact transaction UUID" /></label>
      <div className="filter-actions"><button className="primary-button compact-button" type="submit">Apply search</button><button className="clear-button" type="button" onClick={clearFilters}>Clear</button></div>
    </div></form>

    {error && alerts.length === 0 ? <ErrorState message={error} onRetry={() => void load(false)} /> : <>{error && <div className="background-error" role="alert">Refresh failed: {error}. Existing results are still displayed.</div>}{visibleAlerts.length === 0 ? <EmptyState title="No alerts match these filters" description="Change or clear the filters, or wait for the next transaction assessment." /> : <><AlertTable alerts={pageAlerts} total={visibleAlerts.length} page={page} /><AlertPagination page={page} total={visibleAlerts.length} totalPages={totalPages} onPage={movePage} /></>}</>}
  </section>;
}

function AlertTable({ alerts, total, page }: { alerts: Alert[]; total: number; page: number }) {
  const first = (page - 1) * ALERTS_PER_PAGE + 1;
  const last = Math.min(page * ALERTS_PER_PAGE, total);
  return <div className="alert-table-card operational-queue"><div className="table-caption"><span>Showing {first}–{last} of {total} returned alerts</span><span><i className="live-pulse" />Live operational results</span></div><div className="alert-table-scroll"><table className="alert-table"><thead><tr><th>Priority</th><th>Status</th><th>Risk</th><th>Primary reason</th><th>Transaction</th><th>Case owner</th><th>Last activity</th><th aria-label="Actions" /></tr></thead><tbody>{alerts.map((alert) => <tr key={alert.id} className={`${alert.priority === "CRITICAL" ? "critical-alert-row" : "high-alert-row"} ${alert.assignedTo ? "" : "unassigned-alert-row"}`}><td data-label="Priority"><div className="priority-signal"><span className="priority-symbol">{alert.priority === "CRITICAL" ? "!!" : "!"}</span><div><PriorityBadge priority={alert.priority} /><small>{alert.priority === "CRITICAL" ? "Immediate review" : "Elevated review"}</small></div></div></td><td data-label="Status"><StatusBadge status={alert.status} /></td><td data-label="Risk"><div className="queue-risk"><RiskBadge level={riskLevel(alert.riskScore)} /><strong>{alert.riskScore}</strong><i><b style={{ width: `${Math.min(alert.riskScore, 100)}%` }} /></i></div></td><td data-label="Reason"><span className="reason-text" title={alert.primaryReason}>{alert.primaryReason}</span></td><td data-label="Transaction"><code>{shortId(alert.transactionId)}</code></td><td data-label="Assigned"><span className={alert.assignedTo ? "owner-chip" : "owner-chip unassigned"}><i>{alert.assignedTo ? "A" : "?"}</i><span>{alert.assignedTo ? shortId(alert.assignedTo) : "Claim required"}</span></span></td><td data-label="Last activity"><time dateTime={lastActivity(alert)}>{formatDate(lastActivity(alert))}</time></td><td><Link className="view-alert-link queue-open-case" to={`/alerts/${alert.id}`} aria-label={`Open alert ${alert.id}`}>Open case <span>→</span></Link></td></tr>)}</tbody></table></div></div>;
}

function AlertPagination({ page, total, totalPages, onPage }: { page: number; total: number; totalPages: number; onPage: (page: number) => void }) {
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1).filter((value) => value === 1 || value === totalPages || Math.abs(value - page) <= 1);
  return <nav className="alert-pagination" aria-label="Alert pages"><span><strong>{total}</strong> alerts · 10 per page</span><div><button type="button" onClick={() => onPage(1)} disabled={page === 1} aria-label="First page">«</button><button type="button" onClick={() => onPage(page - 1)} disabled={page === 1}>← Previous</button>{pageNumbers.map((value, index) => <span className="alert-page-number-group" key={value}>{index > 0 && value - pageNumbers[index - 1] > 1 && <i aria-hidden="true">…</i>}<button type="button" className={value === page ? "active" : ""} aria-current={value === page ? "page" : undefined} onClick={() => onPage(value)}>{value}</button></span>)}<button type="button" onClick={() => onPage(page + 1)} disabled={page === totalPages}>Next →</button><button type="button" onClick={() => onPage(totalPages)} disabled={page === totalPages} aria-label="Last page">»</button></div></nav>;
}

function QueueMetric({ icon, label, count, detail, critical = false }: { icon: string; label: string; count: number; detail: string; critical?: boolean }) { return <article className={critical ? "critical-metric" : ""}><span className="queue-metric-icon">{icon}</span><div><span>{label}</span><strong>{count}</strong><small>{detail}</small></div></article>; }

function riskLevel(score: number): RiskLevel { return score >= 80 ? "CRITICAL" : score >= 60 ? "HIGH" : score >= 30 ? "MEDIUM" : "LOW"; }
function lastActivity(alert: Alert) { return alert.reopenedAt || alert.closedAt || alert.investigatingAt || alert.assignedAt || alert.createdAt; }
function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function shortId(value: string) { return value.length > 16 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value; }
