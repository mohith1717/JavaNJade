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

const STATUSES = ["RECEIVED", "VALIDATING", "VALIDATED", "VALIDATION_FAILED", "ASSESSING_RISK", "ASSESSED"];
const RISKS = ["PENDING", "LOW", "MEDIUM", "HIGH", "CRITICAL"];

export function TransactionListPage() {
  const [params, setParams] = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(""); const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const inFlight = useRef(false);
  const search = params.get("search") || ""; const status = params.get("status") || "";
  const risk = params.get("risk") || ""; const currency = params.get("currency") || "";

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
  const update = (key: string, value: string) => { const next = new URLSearchParams(params); value ? next.set(key, value) : next.delete(key); setParams(next, { replace: true }); };
  const clear = () => setParams({}, { replace: true });

  if (loading && transactions.length === 0) return <LoadingState message="Loading transactions…" />;
  return <section className="transaction-list-page"><div className="queue-toolbar"><div><p className="eyebrow">Transaction monitoring</p><h2>Transaction activity</h2><p>Search, validate and trace every monitored transfer.</p></div><div className="refresh-block">{refreshing && <InlineSpinner label="Refreshing" />}<span>Last updated<br /><strong>{lastUpdated ? lastUpdated.toLocaleTimeString() : "Not yet"}</strong></span><button className="secondary-button" onClick={() => void load(true)} disabled={refreshing}>Refresh now</button></div></div><div className="transaction-summary-strip"><article><span>Returned</span><strong>{transactions.length}</strong></article><article><span>Visible</span><strong>{visible.length}</strong></article><article><span>Validation failed</span><strong>{visible.filter((item) => item.processingStatus === "VALIDATION_FAILED").length}</strong></article><article><span>High / critical</span><strong>{visible.filter((item) => item.riskLevel === "HIGH" || item.riskLevel === "CRITICAL").length}</strong></article></div><div className="alert-filters transaction-list-filters"><label className="transaction-search">Search<input value={search} onChange={(event) => update("search", event.target.value)} placeholder="Transaction or account ID" /></label><label>Processing status<select value={status} onChange={(event) => update("status", event.target.value)}><option value="">All statuses</option>{STATUSES.map((value) => <option key={value}>{value}</option>)}</select></label><label>Risk level<select value={risk} onChange={(event) => update("risk", event.target.value)}><option value="">All risks</option>{RISKS.map((value) => <option key={value}>{value}</option>)}</select></label><label>Currency<select value={currency} onChange={(event) => update("currency", event.target.value)}><option value="">All currencies</option>{currencies.map((value) => <option key={value}>{value}</option>)}</select></label><button className="clear-button" type="button" onClick={clear}>Clear filters</button></div>{error && transactions.length === 0 ? <ErrorState message={error} onRetry={() => void load(false)} /> : <>{error && <div className="background-error">Refresh failed: {error}. Existing results remain visible.</div>}{visible.length === 0 ? <EmptyState title="No transactions match" description="Change or clear the current filters." /> : <TransactionTable transactions={visible} />}</>}</section>;
}

function TransactionTable({ transactions }: { transactions: Transaction[] }) { return <div className="alert-table-card"><div className="table-caption"><span>{transactions.length} transactions</span><span>Newest first</span></div><div className="alert-table-scroll"><table className="alert-table transaction-table"><thead><tr><th>Transaction</th><th>Accounts</th><th>Amount</th><th>Status</th><th>Risk</th><th>Occurred</th><th /></tr></thead><tbody>{transactions.map((item) => <tr key={item.id}><td data-label="Transaction"><strong>{item.externalTransactionId}</strong><code>{shortId(item.id)}</code></td><td data-label="Accounts"><span className="account-route">{shortId(item.senderAccountId)} <b>→</b> {shortId(item.receiverAccountId)}</span></td><td data-label="Amount"><strong>{formatMoney(item.amount, item.currency)}</strong></td><td data-label="Status"><StatusBadge status={item.processingStatus} /></td><td data-label="Risk"><RiskBadge level={item.riskLevel} />{item.riskScore !== null && <strong className="risk-number">{item.riskScore}</strong>}</td><td data-label="Occurred"><time dateTime={item.occurredAt}>{formatDate(item.occurredAt)}</time></td><td><Link className="view-alert-link" to={`/transactions/${item.id}`}>View details →</Link></td></tr>)}</tbody></table></div></div>; }
function formatMoney(amount: number, currency: string) { try { return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount); } catch { return `${currency} ${amount}`; } }
function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function shortId(value: string) { return value.length > 18 ? `${value.slice(0, 9)}…${value.slice(-5)}` : value; }
