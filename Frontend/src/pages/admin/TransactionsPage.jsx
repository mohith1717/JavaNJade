import { useEffect, useState } from "react";
import { recentTransactions } from "../../data/dashboardMock";
import TransactionTable from "../../components/ui/TransactionTable";
import { fetchTransactions } from "../../services/transactionsService";

function TransactionsPage() {
  const [rows, setRows] = useState(recentTransactions);

  useEffect(() => {
    let isMounted = true;

    fetchTransactions()
      .then((items) => {
        if (!isMounted || !Array.isArray(items) || items.length === 0) {
          return;
        }

        const mapped = items.map((item) => ({
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
        // Keep mock table if backend is unavailable.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const highRisk = rows.filter((row) => Number(row.risk) >= 70).length;
  const blocked = rows.filter((row) => ["BLOCKED", "DENIED"].includes(String(row.status).toUpperCase())).length;

  return (
    <div className="dashboard-page">
      <header className="card page-card">
        <p className="mini-title">Transaction Operations</p>
        <h2>Transactions</h2>
        <p className="muted">Live transaction stream with risk and decision context</p>
      </header>

      <section className="stats-grid compact-stats">
        <article className="card stat-card">
          <p className="stat-title">Rows Loaded</p>
          <h3 className="stat-value">{rows.length}</h3>
          <p className="stat-change up">Live <span>or fallback snapshot</span></p>
        </article>
        <article className="card stat-card">
          <p className="stat-title">High Risk</p>
          <h3 className="stat-value">{highRisk}</h3>
          <p className="stat-change up">Score 70+ <span>needs close watch</span></p>
        </article>
        <article className="card stat-card">
          <p className="stat-title">Blocked</p>
          <h3 className="stat-value">{blocked}</h3>
          <p className="stat-change down">Decision final <span>auto-escalated</span></p>
        </article>
      </section>

      <TransactionTable rows={rows} />
    </div>
  );
}

export default TransactionsPage;
