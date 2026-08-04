import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getAlerts } from "../api/alertsApi";
import { getFundFlow, getRiskAssessment, getTransaction, getTransactionRoute, getTransactionValidationErrors } from "../api/transactionsApi";
import { RiskBadge } from "../components/badges/RiskBadge";
import { StatusBadge } from "../components/badges/StatusBadge";
import { EmptyState } from "../components/feedback/EmptyState";
import { ErrorState } from "../components/feedback/ErrorState";
import { LoadingState } from "../components/feedback/LoadingState";
import { CountryFlow } from "../components/transactions/CountryFlow";
import { RiskBreakdown } from "../components/transactions/RiskBreakdown";
import { RouteHopList } from "../components/transactions/RouteHopList";
import { ValidationErrorList } from "../components/transactions/ValidationErrorList";
import type { Alert } from "../types/alert";
import type { FundFlow, RiskAssessment, Transaction, TransactionRouteHop, TransactionValidationError } from "../types/transaction";

export function TransactionDetailPage() {
  const { transactionId = "" } = useParams();
  const [transaction, setTransaction] = useState<Transaction | null>(null); const [route, setRoute] = useState<TransactionRouteHop[]>([]);
  const [validationErrors, setValidationErrors] = useState<TransactionValidationError[]>([]); const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [flow, setFlow] = useState<FundFlow | null>(null); const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false); const [fatalError, setFatalError] = useState("");
  const [sectionErrors, setSectionErrors] = useState<Record<string, string>>({});

  const load = useCallback(async (background = false) => {
    background ? setRefreshing(true) : setLoading(true);
    try {
      const item = await getTransaction(transactionId); setTransaction(item); setFatalError("");
      const requests: Promise<unknown>[] = [getTransactionRoute(item.id), getTransactionValidationErrors(item.id), getAlerts({ transactionId: item.id })];
      const assessed = item.processingStatus === "ASSESSED";
      if (assessed) requests.push(getRiskAssessment(item.id), getFundFlow(item.id));
      const results = await Promise.allSettled(requests); const errors: Record<string, string> = {};
      readResult(results[0], setRoute, "route", errors); readResult(results[1], setValidationErrors, "validation", errors);
      if (results[2].status === "fulfilled") setAlert((results[2].value as Alert[])[0] || null); else errors.alert = messageOf(results[2].reason);
      if (assessed) { readResult(results[3], setAssessment, "risk", errors); readResult(results[4], setFlow, "flow", errors); }
      else { setAssessment(null); setFlow(null); }
      setSectionErrors(errors);
    } catch (caught) { setFatalError(messageOf(caught)); }
    finally { setLoading(false); setRefreshing(false); }
  }, [transactionId]);
  useEffect(() => { void load(false); }, [load]);
  if (loading) return <LoadingState message="Loading complete transaction record…" />;
  if (fatalError || !transaction) return <ErrorState title="Unable to open transaction" message={fatalError || "Transaction was not found."} onRetry={() => void load(false)} />;
  const failed = transaction.processingStatus === "VALIDATION_FAILED";
  return <section className="transaction-detail-page"><div className="investigation-toolbar"><Link to="/transactions">← Transactions</Link><div><span>{refreshing ? "Refreshing record…" : "Read-only transaction record"}</span><button className="secondary-button" onClick={() => void load(true)} disabled={refreshing}>Refresh</button></div></div><TransactionHero transaction={transaction} />{alert && <article className="related-alert-banner"><div><span>Related alert</span><strong>{alert.priority} priority · {alert.status}</strong><p>{alert.primaryReason}</p></div><Link to={`/alerts/${alert.id}`}>Open investigation →</Link></article>}{sectionErrors.alert && <SectionError title="Related alert unavailable" message={sectionErrors.alert} />}{failed && <div className="validation-failed-banner"><strong>Risk assessment was not performed</strong><p>This transaction failed ingestion validation and did not enter the rule engine or alert workflow.</p></div>}<div className="transaction-detail-grid">{sectionErrors.route ? <SectionError title="Route unavailable" message={sectionErrors.route} /> : <RouteHopList route={route} />}{sectionErrors.validation ? <SectionError title="Validation result unavailable" message={sectionErrors.validation} /> : <ValidationErrorList errors={validationErrors} />}</div>{transaction.processingStatus === "ASSESSED" ? <>{sectionErrors.flow ? <SectionError title="Fund flow unavailable" message={sectionErrors.flow} /> : flow && <CountryFlow flow={flow} assessment={assessment} />}{sectionErrors.risk ? <SectionError title="Risk assessment unavailable" message={sectionErrors.risk} /> : assessment && <RiskBreakdown assessment={assessment} />}</> : !failed && <EmptyState compact title="Risk assessment pending" description={`The transaction is currently ${transaction.processingStatus.replaceAll("_", " ").toLowerCase()} and has not completed risk assessment.`} />}</section>;
}

function TransactionHero({ transaction }: { transaction: Transaction }) { return <article className="investigation-card transaction-hero"><div className="card-heading"><div><p className="eyebrow">Complete transaction record</p><h2>{transaction.externalTransactionId}</h2><code>{transaction.id}</code></div><div className="heading-badges"><StatusBadge status={transaction.processingStatus} /><RiskBadge level={transaction.riskLevel} /></div></div><div className="amount-display"><span>Transfer value</span><strong>{formatMoney(transaction.amount, transaction.currency)}</strong></div><dl className="detail-grid"><Detail label="Sender account" value={transaction.senderAccountId} /><Detail label="Receiver account" value={transaction.receiverAccountId} /><Detail label="Currency" value={transaction.currency} /><Detail label="Risk score" value={transaction.riskScore === null ? "Pending" : String(transaction.riskScore)} /><Detail label="Occurred at" value={formatDate(transaction.occurredAt)} /><Detail label="Recorded at" value={formatDate(transaction.createdAt)} /></dl></article>; }
function Detail({ label, value }: { label: string; value: string }) { return <div><dt>{label}</dt><dd className={label.includes("account") ? "mono-value" : ""}>{value}</dd></div>; }
function SectionError({ title, message }: { title: string; message: string }) { return <article className="investigation-card section-error"><span>!</span><div><strong>{title}</strong><p>{message}</p></div></article>; }
function readResult<T>(result: PromiseSettledResult<unknown>, setter: (value: T) => void, key: string, errors: Record<string, string>) { if (result.status === "fulfilled") setter(result.value as T); else errors[key] = messageOf(result.reason); }
function messageOf(caught: unknown) { return caught instanceof Error ? caught.message : "The requested data could not be loaded."; }
function formatMoney(amount: number, currency: string) { try { return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount); } catch { return `${currency} ${amount}`; } }
function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
