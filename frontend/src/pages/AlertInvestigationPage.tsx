import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ApiError } from "../api/ApiError";
import { assignAlert, getAlert, getAlertHistory, transitionAlert } from "../api/alertsApi";
import { getFundFlow, getRiskAssessment, getTransaction } from "../api/transactionsApi";
import { useAuth } from "../auth/AuthContext";
import { AlertActionPanel, type AlertAction } from "../components/alerts/AlertActionPanel";
import { AlertHistoryTimeline } from "../components/alerts/AlertHistoryTimeline";
import { AlertOverview } from "../components/alerts/AlertOverview";
import { ErrorState } from "../components/feedback/ErrorState";
import { LoadingState } from "../components/feedback/LoadingState";
import { CountryFlow } from "../components/transactions/CountryFlow";
import { RiskBreakdown } from "../components/transactions/RiskBreakdown";
import { TransactionSummary } from "../components/transactions/TransactionSummary";
import type { AlertDetail, AlertHistory } from "../types/alert";
import type { FundFlow, RiskAssessment, Transaction } from "../types/transaction";

type SectionErrors = Partial<Record<"transaction" | "risk" | "flow" | "history", string>>;

export function AlertInvestigationPage() {
  const { alertId = "" } = useParams();
  const { user } = useAuth();
  const [alert, setAlert] = useState<AlertDetail | null>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [flow, setFlow] = useState<FundFlow | null>(null);
  const [history, setHistory] = useState<AlertHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fatalError, setFatalError] = useState("");
  const [sectionErrors, setSectionErrors] = useState<SectionErrors>({});
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const load = useCallback(async (background = false) => {
    background ? setRefreshing(true) : setLoading(true);
    try {
      const alertData = await getAlert(alertId);
      setAlert(alertData);
      setFatalError("");
      const results = await Promise.allSettled([
        getTransaction(alertData.transactionId),
        getRiskAssessment(alertData.transactionId),
        getFundFlow(alertData.transactionId),
        getAlertHistory(alertData.id),
      ]);
      const errors: SectionErrors = {};
      if (results[0].status === "fulfilled") setTransaction(results[0].value); else errors.transaction = messageOf(results[0].reason);
      if (results[1].status === "fulfilled") setAssessment(results[1].value); else errors.risk = messageOf(results[1].reason);
      if (results[2].status === "fulfilled") setFlow(results[2].value); else errors.flow = messageOf(results[2].reason);
      if (results[3].status === "fulfilled") setHistory(results[3].value); else { errors.history = messageOf(results[3].reason); setHistory(alertData.statusHistory || []); }
      setSectionErrors(errors);
    } catch (caught) {
      setFatalError(messageOf(caught));
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, [alertId]);

  useEffect(() => { void load(false); }, [load]);

  async function performAction(action: AlertAction, reason: string, assignedTo?: string) {
    if (!alert) return;
    setActionBusy(true); setActionError(""); setActionSuccess("");
    try {
      if (action === "ASSIGN") await assignAlert(alert.id, assignedTo || "", reason);
      else await transitionAlert(alert.id, actionEndpoint(action), reason);
      setActionSuccess(`${actionLabel(action)} completed successfully.`);
      await load(true);
    } catch (caught) {
      setActionError(messageOf(caught));
      throw caught;
    } finally {
      setActionBusy(false);
    }
  }

  if (loading) return <LoadingState message="Loading investigation evidence…" />;
  if (fatalError || !alert) return <ErrorState title="Unable to open alert" message={fatalError || "Alert was not found."} onRetry={() => void load(false)} />;

  return <section className="investigation-page case-workspace-page">
    <header className="case-toolbar">
      <div>
        <Link to="/alerts">← Alert queue</Link>
        <span className="case-reference">Case {alert.id.slice(0, 8).toUpperCase()}</span>
      </div>
      <div className="case-sync-state">
        <span className={refreshing ? "sync-pulse active" : "sync-pulse"} />
        <span>{refreshing ? "Refreshing evidence…" : "Evidence synchronized"}</span>
        <button className="secondary-button" onClick={() => void load(true)} disabled={refreshing}>Refresh case</button>
      </div>
    </header>
    <div className="case-workspace">
      <main className="case-evidence-column">
        <AlertOverview alert={alert} />
        <div className="case-section-heading"><span>01</span><div><p className="eyebrow">Evidence review</p><h2>Transaction and risk intelligence</h2></div></div>
        <div className="investigation-grid evidence-grid">
          {sectionErrors.transaction ? <SectionError title="Transaction unavailable" message={sectionErrors.transaction} /> : transaction && <TransactionSummary transaction={transaction} />}
          {sectionErrors.risk ? <SectionError title="Risk assessment unavailable" message={sectionErrors.risk} /> : assessment && <RiskBreakdown assessment={assessment} />}
        </div>
        <div className="case-section-heading"><span>02</span><div><p className="eyebrow">Geographic evidence</p><h2>Route-of-funds intelligence</h2></div></div>
        {sectionErrors.flow ? <SectionError title="Fund flow unavailable" message={sectionErrors.flow} /> : flow && <CountryFlow flow={flow} assessment={assessment} />}
        <div className="case-section-heading"><span>03</span><div><p className="eyebrow">Chain of custody</p><h2>Immutable case history</h2></div></div>
        {sectionErrors.history && <div className="background-error">History endpoint failed: {sectionErrors.history}. Showing embedded history when available.</div>}
        <AlertHistoryTimeline history={history} />
      </main>
      <aside className="case-control-rail">{user && <AlertActionPanel alert={alert} user={user} busy={actionBusy} error={actionError} success={actionSuccess} onAction={performAction} />}</aside>
    </div>
  </section>;
}

function SectionError({ title, message }: { title: string; message: string }) { return <article className="investigation-card section-error"><span>!</span><div><strong>{title}</strong><p>{message}</p></div></article>; }
function messageOf(error: unknown) { return error instanceof ApiError ? error.message : error instanceof Error ? error.message : "Unexpected request failure"; }
function actionEndpoint(action: Exclude<AlertAction, "ASSIGN">) { return ({ START: "start-investigation", APPROVE: "approve", BLOCK: "block", ESCALATE: "escalate", CLOSE: "close", REOPEN: "reopen" } as const)[action]; }
function actionLabel(action: AlertAction) { return action.replace("START", "START INVESTIGATION").replaceAll("_", " ").toLowerCase().replace(/^./, (letter) => letter.toUpperCase()); }
