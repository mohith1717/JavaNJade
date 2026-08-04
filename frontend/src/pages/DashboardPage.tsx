import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { ApiError } from "../api/ApiError";
import { getDashboardReports } from "../api/reportsApi";
import { DistributionChart } from "../components/dashboard/DistributionChart";
import { RankedBars } from "../components/dashboard/RankedBars";
import { VolumeChart } from "../components/dashboard/VolumeChart";
import { ErrorState } from "../components/feedback/ErrorState";
import { InlineSpinner } from "../components/feedback/InlineSpinner";
import { LoadingState } from "../components/feedback/LoadingState";
import type { RiskLevel } from "../components/badges/RiskBadge";
import type { DashboardReports, ReportFilters } from "../types/report";

const RISK_COLORS: Record<string, string> = { LOW: "#28c779", MEDIUM: "#f1b744", HIGH: "#ff8758", CRITICAL: "#ff5d78", PENDING: "#837b8a" };
const PRIORITY_COLORS: Record<string, string> = { HIGH: "#ff8758", CRITICAL: "#ff5d78" };

export function DashboardPage() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<DashboardReports | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const inFlight = useRef(false);
  const filters = filtersFrom(params);
  const activeFilters = countActiveFilters(filters);

  const load = useCallback(async (background = false) => {
    if (inFlight.current) return;
    inFlight.current = true;
    background ? setRefreshing(true) : setLoading(true);
    try {
      setData(await getDashboardReports(filters));
      setError("");
      setLastUpdated(new Date());
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to load dashboard reports.");
    } finally {
      inFlight.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [params.toString()]);

  useEffect(() => { void load(false); }, [load]);
  useEffect(() => {
    const poll = () => { if (document.visibilityState === "visible") void load(true); };
    const timer = window.setInterval(poll, 5000);
    document.addEventListener("visibilitychange", poll);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", poll); };
  }, [load]);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next, { replace: true });
  };

  if (loading && !data) return <LoadingState message="Building operations command center…" />;
  if (!data) return <ErrorState title="Dashboard unavailable" message={error || "Reporting data could not be loaded."} onRetry={() => void load(false)} />;

  const active = Object.entries(data.alerts.statusDistribution).filter(([status]) => status !== "CLOSED").reduce((sum, [, value]) => sum + value, 0);
  const open = data.alerts.statusDistribution.OPEN || 0;
  const critical = data.alerts.priorityDistribution.CRITICAL || 0;
  const amount = data.volume.reduce((sum, item) => sum + Number(item.totalAmount), 0);
  const riskItems = Object.entries(data.risk.riskDistribution).map(([label, value]) => ({ label, value, color: RISK_COLORS[label] || "#837b8a" }));
  const priorityItems = Object.entries(data.alerts.priorityDistribution).map(([label, value]) => ({ label, value, color: PRIORITY_COLORS[label] || "#a969ed" }));
  const countries = [...data.countries].sort((a, b) => b.averageRiskScore - a.averageRiskScore).slice(0, 7).map((item) => ({ key: item.countryCode, label: item.countryCode, value: Number(item.averageRiskScore), detail: `${item.transactionCount} transactions · ${item.alertCount} alerts` }));
  const rules = [...data.rules].sort((a, b) => b.triggerRate - a.triggerRate).slice(0, 7).map((item) => ({ key: item.ruleCode, label: item.ruleName, value: Number(item.triggerRate), detail: `${item.triggerCount}/${item.evaluationCount} triggered · +${item.totalScoreContribution} points` }));

  return <section className="operations-dashboard command-center">
    <header className="command-hero">
      <div className="command-hero-copy"><div className="live-ribbon"><span className="live-pulse" />Live intelligence <small>5 second refresh</small></div><h2>Risk operations<br /><span>command center</span></h2><p>One operational view of transaction activity, emerging risk, alert workload and detection performance.</p></div>
      <div className="command-status-panel"><div className="command-status-top"><span className={refreshing ? "refresh-orbit active" : "refresh-orbit"}><i /></span><div><small>{refreshing ? "Synchronizing" : "Systems synchronized"}</small><strong>{lastUpdated ? lastUpdated.toLocaleTimeString() : "Awaiting first refresh"}</strong></div></div><dl><div><dt>Active filters</dt><dd>{activeFilters}</dd></div><div><dt>Active alerts</dt><dd>{active}</dd></div><div><dt>Critical</dt><dd>{critical}</dd></div></dl><button className="secondary-button" onClick={() => void load(true)} disabled={refreshing}>{refreshing ? <><InlineSpinner label="Refreshing" /></> : "Refresh intelligence"}</button></div>
    </header>

    <DashboardFilters params={params} active={activeFilters} update={update} clear={() => setParams({}, { replace: true })} />
    {error && <div className="background-error">Live refresh failed: {error}. The last successful intelligence snapshot remains visible.</div>}

    <div className="dashboard-kpis command-kpis">
      <Kpi icon="↗" label="Monitored transactions" value={data.risk.totalTransactions} detail={`${data.risk.highRiskTransactions} high-risk transfers`} tone="purple" progress={ratio(data.risk.highRiskTransactions, data.risk.totalTransactions)} />
      <Kpi icon="◇" label="Value under monitoring" value={compactMoney(amount, filters.currency)} detail={`${data.volume.length} reporting periods`} tone="green" progress={72} />
      <Kpi icon="◎" label="Average risk exposure" value={Number(data.risk.averageRiskScore).toFixed(1)} detail="Across assessed transactions" tone="orange" progress={Math.min(Number(data.risk.averageRiskScore), 100)} />
      <Kpi icon="!" label="Open alert workload" value={open} detail={`${active} alerts require attention`} tone="red" progress={ratio(open, Math.max(active, 1))} />
    </div>

    <div className="dashboard-section-heading"><div><span>01</span><div><p className="eyebrow">Live activity</p><h3>Transaction and risk pulse</h3></div></div><small>Updated from the reporting APIs</small></div>
    <div className="dashboard-primary command-primary"><VolumeChart data={data.volume} /><DistributionChart eyebrow="Assessed portfolio" title="Risk distribution" centerValue={data.risk.totalTransactions} items={riskItems} /></div>

    <div className="dashboard-section-heading"><div><span>02</span><div><p className="eyebrow">Detection intelligence</p><h3>Alert, geography and rule signals</h3></div></div><small>Ranked by current exposure</small></div>
    <div className="dashboard-secondary command-secondary"><DistributionChart eyebrow="Analyst workload" title="Alert priority" centerValue={data.alerts.totalAlerts} items={priorityItems} /><RankedBars eyebrow="Route intelligence" title="Highest-risk countries" items={countries} empty="No country-risk data" /><RankedBars eyebrow="Rule engine" title="Most effective rules" items={rules} empty="No rule evaluations" /></div>
  </section>;
}

function DashboardFilters({ params, active, update, clear }: { params: URLSearchParams; active: number; update: (key: string, value: string) => void; clear: () => void }) {
  return <section className="dashboard-filter-panel"><div className="filter-panel-title"><span>⌁</span><div><strong>Intelligence scope</strong><small>{active ? `${active} active filters` : "All monitoring data"}</small></div></div><div className="alert-filters dashboard-filters"><label>From<input type="datetime-local" value={params.get("from") || ""} onChange={(event) => update("from", event.target.value)} /></label><label>To<input type="datetime-local" value={params.get("to") || ""} onChange={(event) => update("to", event.target.value)} /></label><label>Currency<input maxLength={3} value={params.get("currency") || ""} onChange={(event) => update("currency", event.target.value.toUpperCase())} placeholder="INR" /></label><label>Country<input maxLength={2} value={params.get("country") || ""} onChange={(event) => update("country", event.target.value.toUpperCase())} placeholder="IN" /></label><label>Risk<select value={params.get("riskLevel") || ""} onChange={(event) => update("riskLevel", event.target.value)}><option value="">All risks</option>{["PENDING", "LOW", "MEDIUM", "HIGH", "CRITICAL"].map((risk) => <option key={risk}>{risk}</option>)}</select></label><label>Interval<select value={params.get("interval") || "HOUR"} onChange={(event) => update("interval", event.target.value)}><option>HOUR</option><option>DAY</option></select></label><button className="clear-button" onClick={clear} disabled={!active}>Reset scope</button></div></section>;
}

function Kpi({ icon, label, value, detail, tone, progress }: { icon: string; label: string; value: string | number; detail: string; tone: string; progress: number }) {
  return <article className={`dashboard-kpi kpi-${tone}`}><div className="kpi-heading"><span className="kpi-icon">{icon}</span><span>{label}</span></div><strong>{value}</strong><small>{detail}</small><i className="kpi-meter"><b style={{ width: `${Math.max(4, Math.min(progress, 100))}%` }} /></i></article>;
}

function ratio(value: number, total: number) { return total ? value / total * 100 : 0; }
function countActiveFilters(filters: ReportFilters) { return [filters.from, filters.to, filters.currency, filters.country, filters.riskLevel, filters.interval && filters.interval !== "HOUR" ? filters.interval : undefined].filter(Boolean).length; }
function filtersFrom(params: URLSearchParams): ReportFilters { return { from: params.get("from") || undefined, to: params.get("to") || undefined, currency: params.get("currency") || undefined, country: params.get("country") || undefined, riskLevel: (params.get("riskLevel") || undefined) as RiskLevel | undefined, interval: (params.get("interval") || "HOUR") as "HOUR" | "DAY" }; }
function compactMoney(value: number, currency?: string) { if (!currency) return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(value); try { return new Intl.NumberFormat(undefined, { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 }).format(value); } catch { return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(value); } }
