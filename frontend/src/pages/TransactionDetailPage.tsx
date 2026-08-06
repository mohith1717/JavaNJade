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
  return <section className="transaction-detail-page transaction-dossier"><header className="dossier-toolbar"><div><Link to="/transactions">← Transaction monitor</Link><span>Dossier {transaction.id.slice(0, 8).toUpperCase()}</span></div><div><i className={refreshing ? "active" : ""} /><span>{refreshing ? "Refreshing record…" : "Read-only verified record"}</span><button className="secondary-button" onClick={() => void load(true)} disabled={refreshing}>Refresh dossier</button></div></header><TransactionHero transaction={transaction} /><ProcessingLifecycle status={transaction.processingStatus} />{alert && <article className="related-alert-banner dossier-alert"><span className="alert-link-icon">!</span><div><span>Related monitoring alert</span><strong>{alert.priority} priority · {alert.status}</strong><p>{alert.primaryReason}</p></div><Link to={`/alerts/${alert.id}`}>Open investigation →</Link></article>}{sectionErrors.alert && <SectionError title="Related alert unavailable" message={sectionErrors.alert} />}{failed && <div className="validation-failed-banner dossier-failure"><span>!</span><div><strong>Transaction rejected during validation</strong><p>Risk assessment was not performed because this record did not enter the rule engine or alert workflow.</p></div></div>}<SectionHeading number="01" eyebrow="Ingestion evidence" title="Route and validation controls" /><div className="transaction-detail-grid dossier-evidence-grid">{sectionErrors.route ? <SectionError title="Route unavailable" message={sectionErrors.route} /> : <RouteHopList route={route} />}{sectionErrors.validation ? <SectionError title="Validation result unavailable" message={sectionErrors.validation} /> : <ValidationErrorList errors={validationErrors} />}</div>{transaction.processingStatus === "ASSESSED" ? <><SectionHeading number="02" eyebrow="Geographic intelligence" title="Country fund-flow visualization" />{sectionErrors.flow ? <SectionError title="Fund flow unavailable" message={sectionErrors.flow} /> : flow && <CountryFlow flow={flow} assessment={assessment} />}<SectionHeading number="03" eyebrow="Explainable decisioning" title="Rule-contribution assessment" />{sectionErrors.risk ? <SectionError title="Risk assessment unavailable" message={sectionErrors.risk} /> : assessment && <RiskBreakdown assessment={assessment} />}</> : !failed && <div className="dossier-pending"><span>…</span><EmptyState compact title="Risk assessment pending" description={`The transaction is currently ${transaction.processingStatus.replaceAll("_", " ").toLowerCase()} and has not completed risk assessment.`} /></div>}</section>;
}

function TransactionHero({ transaction }: { transaction: Transaction }) { return <article className="investigation-card transaction-hero dossier-hero"><div className="dossier-identity"><div><p className="eyebrow">Transaction dossier</p><h1>{transaction.externalTransactionId}</h1><code>{transaction.id}</code></div><div className="heading-badges"><StatusBadge status={transaction.processingStatus} /><RiskBadge level={transaction.riskLevel} /></div></div><div className="dossier-value"><span>Monitored transfer value</span><strong>{formatMoney(transaction.amount, transaction.currency)}</strong><small>{transaction.currency} · recorded {formatDate(transaction.createdAt)}</small></div><div className="account-transfer"><div><span>Originating account</span><strong>{transaction.senderAccountId}</strong></div><b>→<small>Funds transfer</small></b><div><span>Beneficiary account</span><strong>{transaction.receiverAccountId}</strong></div></div><dl className="detail-grid dossier-metadata"><Detail label="Currency" value={transaction.currency} /><Detail label="Risk score" value={transaction.riskScore === null ? "Pending assessment" : `${transaction.riskScore} / 100`} /><Detail label="Occurred at" value={formatDate(transaction.occurredAt)} /><Detail label="Processing status" value={transaction.processingStatus.replaceAll("_", " ")} /></dl></article>; }
function ProcessingLifecycle({ status }: { status: string }) { const stages = ["RECEIVED", "VALIDATING", "VALIDATED", "ASSESSING_RISK", "ASSESSED"]; const failed = status === "VALIDATION_FAILED"; const activeIndex = failed ? 1 : Math.max(0, stages.indexOf(status)); return <article className={`processing-lifecycle ${failed ? "lifecycle-failed" : ""}`}><header><div><p className="eyebrow">Processing lifecycle</p><strong>{failed ? "Validation failed" : `${activeIndex + 1} of ${stages.length} stages reached`}</strong></div><span>{failed ? "Rejected branch" : "Automated pipeline"}</span></header><ol>{stages.map((stage, index) => <li className={index < activeIndex ? "complete" : index === activeIndex ? failed ? "failed" : "current" : "future"} key={stage}><i>{index < activeIndex ? "✓" : index === activeIndex && failed ? "!" : index + 1}</i><span>{stage.replaceAll("_", " ")}</span></li>)}</ol></article>; }
function SectionHeading({ number, eyebrow, title }: { number: string; eyebrow: string; title: string }) { return <div className="dossier-section-heading"><span>{number}</span><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div></div>; }
function Detail({ label, value }: { label: string; value: string }) { return <div><dt>{label}</dt><dd className={label.includes("account") ? "mono-value" : ""}>{value}</dd></div>; }
function SectionError({ title, message }: { title: string; message: string }) { return <article className="investigation-card section-error"><span>!</span><div><strong>{title}</strong><p>{message}</p></div></article>; }
function readResult<T>(result: PromiseSettledResult<unknown>, setter: (value: T) => void, key: string, errors: Record<string, string>) { if (result.status === "fulfilled") setter(result.value as T); else errors[key] = messageOf(result.reason); }
function messageOf(caught: unknown) { return caught instanceof Error ? caught.message : "The requested data could not be loaded."; }
function formatMoney(amount: number, currency: string) { try { return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount); } catch { return `${currency} ${amount}`; } }
function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
