import { useEffect, useMemo, useState } from "react";
import { dashboardSummary, recentTransactions } from "../../data/dashboardMock";
import StatCard from "../../components/ui/StatCard";
import RecentTransactionsTable from "../../components/ui/RecentTransactionsTable";
import { fetchAdminSummary } from "../../services/dashboardService";
import { fetchTransactions } from "../../services/transactionsService";

function AdminDashboardPage() {
  const [summary, setSummary] = useState(dashboardSummary);
  const [rows, setRows] = useState(recentTransactions);

  useEffect(() => {
    let isMounted = true;

    fetchAdminSummary()
      .then((data) => {
        if (!isMounted || !data) {
          return;
        }

        setSummary((prev) => ({
          ...prev,
          stats: [
            { label: "Total Transactions", value: String(data.totalTransactionsLast24h ?? 0), change: "", trend: "up", note: "last 24h" },
            { label: "High Risk Transactions", value: String(data.criticalCases ?? 0), change: "", trend: "up", note: "critical cases" },
            { label: "Open Alerts", value: String(data.openCases ?? 0), change: "", trend: "down", note: "currently open" },
            {
              label: "Active Cases",
              value: String((data.openCases ?? 0) + (data.investigateCases ?? 0)),
              change: "",
              trend: "up",
              note: "open + investigate",
            },
          ],
        }));
      })
      .catch(() => {
        // Keep mock summary if backend is unavailable.
      });

    fetchTransactions()
      .then((items) => {
        if (!isMounted || !Array.isArray(items) || items.length === 0) {
          return;
        }

        const mapped = items.slice(0, 10).map((item) => ({
          id: item.transactionId,
          account: item.senderAccountId,
          merchant: item.receiverAccountId,
          amount: `${item.currency} ${item.amount}`,
          risk: item.riskScore,
          status: item.decision,
          time: item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--",
        }));

        setRows(mapped);
      })
      .catch(() => {
        // Keep mock transactions if backend is unavailable.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const greeting = useMemo(() => summary.greeting || "Good afternoon, System Admin", [summary.greeting]);
  const avgRisk = useMemo(() => {
    if (!rows.length) {
      return 0;
    }
    const total = rows.reduce((sum, row) => sum + Number(row.risk || 0), 0);
    return Math.round((total / rows.length) * 10) / 10;
  }, [rows]);

  const blockedCount = useMemo(
    () => rows.filter((row) => ["BLOCKED", "DENIED"].includes(String(row.status).toUpperCase())).length,
    [rows]
  );

  return (
    <div className="dashboard-page">
      <header className="dashboard-header card">
        <div>
          <p className="mini-title">Dashboard</p>
          <h2>{greeting} <span aria-hidden="true">👋</span></h2>
          <p className="muted">{summary.dateText}</p>
        </div>
        <div className="health-pill">{summary.status}</div>
      </header>

      <section className="stats-grid">
        {summary.stats.map((item) => (
          <StatCard key={item.label} title={item.label} value={item.value} change={item.change} trend={item.trend} note={item.note} />
        ))}
      </section>

      <section className="insights-grid">
        <article className="card insight-card">
          <p className="mini-title">Average Risk Score</p>
          <h3>{avgRisk}</h3>
          <div className="progress-track">
            <span className="progress-fill" style={{ width: `${Math.min(100, avgRisk)}%` }} />
          </div>
        </article>

        <article className="card insight-card">
          <p className="mini-title">Blocked Transactions</p>
          <h3>{blockedCount}</h3>
          <p className="muted">Across latest incoming activity</p>
        </article>

        <article className="card insight-card">
          <p className="mini-title">Workflow Health</p>
          <h3>{summary.status}</h3>
          <p className="muted">Monitors queue pressure and case handling cadence</p>
        </article>
      </section>

      <section className="analytics-grid">
        <article className="card">
          <div className="section-head">
            <h3>Transaction Volume Trend</h3>
            <p>Transactions and flagged activity over selected period</p>
          </div>
          <div className="placeholder-chart">00:00 - 20:00 trend line view</div>
        </article>

        <article className="card">
          <div className="section-head">
            <h3>Risk Distribution</h3>
            <p>Breakdown by risk level</p>
          </div>
          <ul className="metric-list">
            {summary.riskDistribution.map((item) => (
              <li key={item.level}>
                <span>{item.level}</span>
                <span>{item.percent}% ({item.count})</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="card">
          <div className="section-head">
            <h3>Risk by Location</h3>
            <p>Top originating countries by risk level</p>
          </div>
          <ul className="metric-list">
            {summary.locationRisk.map((item) => (
              <li key={item.country}>
                <span>{item.country}</span>
                <span>H {item.high} / M {item.medium} / L {item.low}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="card">
          <div className="section-head">
            <h3>Alert Severity Breakdown</h3>
            <p>Active alerts grouped by severity level</p>
          </div>
          <ul className="metric-list">
            {summary.alertSeverity.map((item) => (
              <li key={item.level}>
                <span>{item.level}</span>
                <span>{item.count}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <RecentTransactionsTable rows={rows} />
    </div>
  );
}

export default AdminDashboardPage;
