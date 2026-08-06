import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { ApiError } from "../api/ApiError";
import { getTransactions } from "../api/transactionsApi";
import { RiskBadge } from "../components/badges/RiskBadge";
import { StatusBadge } from "../components/badges/StatusBadge";
import { EmptyState } from "../components/feedback/EmptyState";
import { ErrorState } from "../components/feedback/ErrorState";
import { InlineSpinner } from "../components/feedback/InlineSpinner";
import { LoadingState } from "../components/feedback/LoadingState";
import type { Transaction } from "../types/transaction";

// The backend completes validation and risk assessment synchronously. Only
// committed outcomes belong in the ledger filter; intermediate states are
// represented by the processing meter instead of misleading empty filters.
const STATUSES = ["ASSESSED", "VALIDATION_FAILED", "REVIEW_REQUIRED", "APPROVED", "FAILED"];
const RISKS = ["PENDING", "LOW", "MEDIUM", "HIGH", "CRITICAL"];

export function TransactionListPage() {
  const [params, setParams] = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(""); const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const inFlight = useRef(false);
  const search = params.get("search") || ""; const status = params.get("status") || "";
  const risk = params.get("risk") || ""; const currency = params.get("currency") || "";
  const requestedPage = Math.max(1, Number(params.get("page") || 1));
  const pageSize = [10, 20, 50].includes(Number(params.get("pageSize"))) ? Number(params.get("pageSize")) : 10;

  const load = useCallback(async (background = false) => {
    if (inFlight.current) return; inFlight.current = true; background ? setRefreshing(true) : setLoading(true);
    try { setTransactions(await getTransactions(status || undefined)); setError(""); setLastUpdated(new Date()); }
    catch (caught) { setError(caught instanceof ApiError ? caught.message : "Unable to load transactions."); }
    finally { inFlight.current = false; setLoading(false); setRefreshing(false); }
  }, [status]);

  useEffect(() => { void load(false); }, [load]);
  useEffect(() => { const timer = window.setInterval(() => { if (document.visibilityState === "visible") void load(true); }, 5000); return () => window.clearInterval(timer); }, [load]);

  const currencies = useMemo(() => [...new Set(transactions.map((item) => item.currency))].sort(), [transactions]);
  const visible = useMemo(() => transactions.filter((item) => !risk || item.riskLevel === risk).filter((item) => !currency || item.currency === currency).filter((item) => { const query = search.trim().toLowerCase(); return !query || [item.externalTransactionId, item.senderAccountId, item.receiverAccountId, item.id].some((value) => value.toLowerCase().includes(query)); }).sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt)), [transactions, search, risk, currency]);
  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const pageTransactions = visible.slice((page - 1) * pageSize, page * pageSize);
  const update = (key: string, value: string) => { const next = new URLSearchParams(params); value ? next.set(key, value) : next.delete(key); next.delete("page"); setParams(next, { replace: true }); };
  const movePage = (nextPage: number) => { const next = new URLSearchParams(params); nextPage > 1 ? next.set("page", String(nextPage)) : next.delete("page"); setParams(next, { replace: true }); };
  const changePageSize = (value: number) => { const next = new URLSearchParams(params); next.set("pageSize", String(value)); next.delete("page"); setParams(next, { replace: true }); };
  const clear = () => setParams({}, { replace: true });

  if (loading && transactions.length === 0) return <LoadingState message="Loading transactions…" />;
  const failedCount = visible.filter((item) => item.processingStatus === "VALIDATION_FAILED").length;
  const assessedCount = visible.filter((item) => item.processingStatus === "ASSESSED").length;
  const elevatedCount = visible.filter((item) => item.riskLevel === "HIGH" || item.riskLevel === "CRITICAL").length;
  return <section className="transaction-list-page transaction-operations">
    <header className="transaction-command-hero"><div className="transaction-hero-copy"><div className="transaction-live-label"><i /> Live ingestion monitor</div><h2>Transaction <span>control room.</span></h2><p>Follow every transfer from ingestion and validation through explainable risk assessment.</p></div><div className="ingestion-monitor"><header><div className={refreshing ? "ingestion-orbit active" : "ingestion-orbit"}><i /></div><div><small>Monitoring status</small><strong>{refreshing ? "Synchronizing ledger" : "Live feed connected"}</strong></div></header><dl><div><dt>Records</dt><dd>{transactions.length}</dd></div><div><dt>Exceptions</dt><dd>{failedCount}</dd></div><div><dt>Elevated</dt><dd>{elevatedCount}</dd></div></dl><span>Last synchronized <strong>{lastUpdated ? lastUpdated.toLocaleTimeString() : "Not yet"}</strong></span><button className="secondary-button" onClick={() => void load(true)} disabled={refreshing}>{refreshing ? <InlineSpinner label="Refreshing" /> : "Refresh monitor"}</button></div></header>
    <div className="transaction-summary-strip monitoring-summary"><MonitorMetric icon="◎" label="Returned" value={transactions.length} detail="API records" /><MonitorMetric icon="↳" label="Visible" value={visible.length} detail="After filters" /><MonitorMetric icon="!" label="Validation failed" value={failedCount} detail="Rejected at ingestion" tone="failed" /><MonitorMetric icon="✓" label="Assessed" value={assessedCount} detail="Scored by rules" tone="pending" /><MonitorMetric icon="▲" label="High / critical" value={elevatedCount} detail="Requires attention" tone="elevated" /></div>
    <section className="transaction-filter-workbench"><header><span>⌕</span><div><strong>Monitoring filters</strong><small>Search committed transaction outcomes · validation and assessment stages complete synchronously</small></div></header><div className="alert-filters transaction-list-filters"><label className="transaction-search">Search<input value={search} onChange={(event) => update("search", event.target.value)} placeholder="Transaction or account ID" /></label><label>Processing status<select value={status} onChange={(event) => update("status", event.target.value)}><option value="">All outcomes</option>{STATUSES.map((value) => <option key={value}>{value}</option>)}</select></label><label>Risk level<select value={risk} onChange={(event) => update("risk", event.target.value)}><option value="">All risks</option>{RISKS.map((value) => <option key={value}>{value}</option>)}</select></label><label>Currency<select value={currency} onChange={(event) => update("currency", event.target.value)}><option value="">All currencies</option>{currencies.map((value) => <option key={value}>{value}</option>)}</select></label><button className="clear-button" type="button" onClick={clear}>Clear filters</button></div></section>
    {error && transactions.length === 0 ? <ErrorState message={error} onRetry={() => void load(false)} /> : <>{error && <div className="background-error">Refresh failed: {error}. Existing results remain visible.</div>}{visible.length === 0 ? <EmptyState title="No transactions match" description="Change or clear the current filters." /> : <><TransactionTable transactions={pageTransactions} total={visible.length} page={page} pageSize={pageSize} /><TransactionPagination page={page} pageSize={pageSize} total={visible.length} totalPages={totalPages} onPage={movePage} onPageSize={changePageSize} /></>}</>}
  </section>;
}

function MonitorMetric({ icon, label, value, detail, tone = "" }: { icon: string; label: string; value: number; detail: string; tone?: string }) { return <article className={tone ? `monitor-${tone}` : ""}><span className="monitor-icon">{icon}</span><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></article>; }
function TransactionTable({ transactions, total, page, pageSize }: { transactions: Transaction[]; total: number; page: number; pageSize: number }) { const first = (page - 1) * pageSize + 1; const last = Math.min(page * pageSize, total); return <div className="alert-table-card transaction-ledger"><div className="table-caption"><span>Showing {first}–{last} of {total} monitored transactions</span><span>Live ledger · newest first</span></div><div className="alert-table-scroll"><table className="alert-table transaction-table"><thead><tr><th>Transaction</th><th>Account route</th><th>Transfer value</th><th>Processing</th><th>Risk intelligence</th><th>Occurred</th><th /></tr></thead><tbody>{transactions.map((item) => <tr className={transactionRowClass(item)} key={item.id}><td data-label="Transaction"><span className="transaction-state-symbol">{stateSymbol(item)}</span><div><strong>{item.externalTransactionId}</strong><code>{shortId(item.id)}</code></div></td><td data-label="Accounts"><span className="account-route"><span>{shortId(item.senderAccountId)}</span><b>→</b><span>{shortId(item.receiverAccountId)}</span></span></td><td data-label="Amount"><strong className="ledger-amount">{formatMoney(item.amount, item.currency)}</strong><small>{item.currency} transfer</small></td><td data-label="Status"><StatusBadge status={item.processingStatus} /><ProcessingMeter status={item.processingStatus} /></td><td data-label="Risk"><div className="ledger-risk"><RiskBadge level={item.riskLevel} /><strong>{item.riskScore === null ? "—" : item.riskScore}</strong><i><b style={{ width: `${item.riskScore || 0}%` }} /></i></div></td><td data-label="Occurred"><time dateTime={item.occurredAt}>{formatDate(item.occurredAt)}</time></td><td><Link className="view-alert-link transaction-open-record" to={`/transactions/${item.id}`}>Open dossier →</Link></td></tr>)}</tbody></table></div></div>; }
function TransactionPagination({ page, pageSize, total, totalPages, onPage, onPageSize }: { page: number; pageSize: number; total: number; totalPages: number; onPage: (page: number) => void; onPageSize: (size: number) => void }) { return <nav className="transaction-pagination" aria-label="Transaction pages"><div><span>Rows per page</span><select aria-label="Transactions per page" value={pageSize} onChange={(event) => onPageSize(Number(event.target.value))}><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select><span>{total} total</span></div><div><button type="button" onClick={() => onPage(1)} disabled={page === 1} aria-label="First page">«</button><button type="button" onClick={() => onPage(page - 1)} disabled={page === 1}>← Previous</button><span>Page <strong>{page}</strong> of <strong>{totalPages}</strong></span><button type="button" onClick={() => onPage(page + 1)} disabled={page === totalPages}>Next →</button><button type="button" onClick={() => onPage(totalPages)} disabled={page === totalPages} aria-label="Last page">»</button></div></nav>; }
function ProcessingMeter({ status }: { status: string }) { const progress = ({ RECEIVED: 15, VALIDATING: 32, VALIDATED: 55, ASSESSING_RISK: 76, ASSESSED: 100, VALIDATION_FAILED: 100 } as Record<string, number>)[status] || 0; return <span className={`processing-meter ${status === "VALIDATION_FAILED" ? "failed" : ""}`}><i style={{ width: `${progress}%` }} /></span>; }
function transactionRowClass(item: Transaction) { if (item.processingStatus === "VALIDATION_FAILED") return "transaction-row validation-failure-row"; if (item.riskLevel === "CRITICAL" || item.riskLevel === "HIGH") return "transaction-row elevated-risk-row"; if (item.riskLevel === "PENDING") return "transaction-row pending-risk-row"; return "transaction-row low-risk-row"; }
function stateSymbol(item: Transaction) { return item.processingStatus === "VALIDATION_FAILED" ? "!" : item.riskLevel === "HIGH" || item.riskLevel === "CRITICAL" ? "▲" : item.riskLevel === "PENDING" ? "…" : "✓"; }
function formatMoney(amount: number, currency: string) { try { return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount); } catch { return `${currency} ${amount}`; } }
function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function shortId(value: string) { return value.length > 18 ? `${value.slice(0, 9)}…${value.slice(-5)}` : value; }
