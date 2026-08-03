import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchCases } from "../../services/dashboardService";
import { assignCase } from "../../services/caseService";
import { getSession } from "../../services/authService";
import { processTransaction } from "../../services/transactionsService";

const INVESTIGATORS = ["oliver", "maya", "liam"];
const STATUS_TABS = ["ALL", "OPEN", "ASSIGNED", "INVESTIGATE", "RESOLVED", "CLEAN"];

function formatSla(deadline) {
  if (!deadline) {
    return "n/a";
  }

  const diffMs = new Date(deadline).getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const minutes = Math.floor(absMs / 60_000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const label = hours > 0 ? `${hours}h ${String(mins).padStart(2, "0")}m` : `${mins}m`;
  return diffMs >= 0 ? label : `Overdue ${label}`;
}

function toLabel(value) {
  const text = String(value || "").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function CaseManagementPage() {
  const session = getSession();
  const actor = session?.username || "admin";

  const [statusTab, setStatusTab] = useState("ALL");
  const [investigatorFilter, setInvestigatorFilter] = useState("ALL");
  const [rows, setRows] = useState([]);
  const [assignees, setAssignees] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [activeAlertId, setActiveAlertId] = useState(null);
  const [txResult, setTxResult] = useState(null);
  const [txError, setTxError] = useState("");
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);
  const [txForm, setTxForm] = useState({
    transactionId: `TXN-${Date.now()}`,
    amount: "250000",
    currency: "USD",
    senderAccountId: "ACC-SENDER-1001",
    receiverAccountId: "BLK-RECV-001",
    senderCountry: "US",
    receiverCountry: "NG",
    location: "New York",
    deviceId: "DEV-001",
    creditScore: "520",
  });

  const loadCases = useCallback((status = statusTab) => {
    setIsLoading(true);
    setLoadError("");

    return fetchCases(status)
      .then((items) => {
        if (!Array.isArray(items)) {
          setRows([]);
          return;
        }

        const mapped = items.map((item) => ({
          id: item.alertId,
          transactionId: item.transactionId,
          owner: item.assignedTo || "unassigned",
          severity: toLabel(item.priority),
          status: toLabel(item.status),
          reason: item.primaryReason || "-",
          riskScore: item.riskScore,
          sla: formatSla(item.slaDeadline),
        }));

        setRows(mapped);
        setAssignees((prev) => {
          const next = { ...prev };
          for (const row of mapped) {
            if (!next[row.id]) {
              next[row.id] = INVESTIGATORS[0];
            }
          }
          return next;
        });
      })
      .catch((error) => {
        setLoadError(error?.message || "Unable to load case queue.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [statusTab]);

  useEffect(() => {
    loadCases(statusTab);
  }, [statusTab, loadCases]);

  const visibleRows = useMemo(() => {
    if (investigatorFilter === "ALL") {
      return rows;
    }
    return rows.filter((row) => String(row.owner).toLowerCase() === investigatorFilter.toLowerCase());
  }, [rows, investigatorFilter]);

  const counts = useMemo(() => {
    const map = new Map();
    for (const row of rows) {
      const key = String(row.status).toUpperCase();
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [rows]);

  const runAssign = async (row) => {
    setActionError("");
    setActiveAlertId(row.id);

    try {
      await assignCase(row.id, {
        actor,
        assignee: assignees[row.id] || INVESTIGATORS[0],
        notes: `Assigned by ${actor} from case management`,
        clean: false,
      });
      await loadCases(statusTab);
    } catch (error) {
      setActionError(error?.message || "Assignment failed. Please try again.");
    } finally {
      setActiveAlertId(null);
    }
  };

  const submitTransaction = async (event) => {
    event.preventDefault();
    setTxError("");
    setTxResult(null);
    setIsSubmittingTx(true);

    try {
      const payload = {
        ...txForm,
        amount: Number(txForm.amount),
        creditScore: txForm.creditScore ? Number(txForm.creditScore) : null,
      };
      const result = await processTransaction(payload);
      setTxResult(result);
      await loadCases("ALL");
      setStatusTab("ALL");
      setTxForm((prev) => ({ ...prev, transactionId: `TXN-${Date.now()}` }));
    } catch (error) {
      setTxError(error?.message || "Transaction processing failed.");
    } finally {
      setIsSubmittingTx(false);
    }
  };

  return (
    <div className="dashboard-page">
      <header className="card page-card">
        <p className="mini-title">Admin Operations</p>
        <h2>Case Management</h2>
        <p className="muted">Track all alerts through open, assigned, investigate, resolved, and clean states.</p>
        {loadError ? <p className="error-text inline-error">{loadError}</p> : null}
        {actionError ? <p className="error-text inline-error">{actionError}</p> : null}
      </header>

      <section className="stats-grid compact-stats">
        <article className="card stat-card">
          <p className="stat-title">Open</p>
          <h3 className="stat-value">{counts.get("OPEN") || 0}</h3>
          <p className="stat-change up">Needs <span>assignment</span></p>
        </article>
        <article className="card stat-card">
          <p className="stat-title">Investigate</p>
          <h3 className="stat-value">{counts.get("INVESTIGATE") || 0}</h3>
          <p className="stat-change up">Active <span>investigation</span></p>
        </article>
        <article className="card stat-card">
          <p className="stat-title">Resolved + Clean</p>
          <h3 className="stat-value">{(counts.get("RESOLVED") || 0) + (counts.get("CLEAN") || 0)}</h3>
          <p className="stat-change down">Completed <span>workflow outcomes</span></p>
        </article>
      </section>

      <section className="card page-card">
        <div className="section-head">
          <h3>Create Transaction</h3>
          <p>Use this form to generate real backend transactions that can trigger alerts and cases.</p>
        </div>
        <form className="tx-form-grid" onSubmit={submitTransaction}>
          <label className="page-label">
            Transaction ID
            <input
              value={txForm.transactionId}
              onChange={(event) => setTxForm((prev) => ({ ...prev, transactionId: event.target.value }))}
              required
            />
          </label>
          <label className="page-label">
            Amount
            <input
              type="number"
              step="0.01"
              value={txForm.amount}
              onChange={(event) => setTxForm((prev) => ({ ...prev, amount: event.target.value }))}
              required
            />
          </label>
          <label className="page-label">
            Currency
            <input
              value={txForm.currency}
              onChange={(event) => setTxForm((prev) => ({ ...prev, currency: event.target.value }))}
              required
            />
          </label>
          <label className="page-label">
            Sender Account
            <input
              value={txForm.senderAccountId}
              onChange={(event) => setTxForm((prev) => ({ ...prev, senderAccountId: event.target.value }))}
              required
            />
          </label>
          <label className="page-label">
            Receiver Account
            <input
              value={txForm.receiverAccountId}
              onChange={(event) => setTxForm((prev) => ({ ...prev, receiverAccountId: event.target.value }))}
              required
            />
          </label>
          <label className="page-label">
            Sender Country
            <input
              value={txForm.senderCountry}
              onChange={(event) => setTxForm((prev) => ({ ...prev, senderCountry: event.target.value }))}
              required
            />
          </label>
          <label className="page-label">
            Receiver Country
            <input
              value={txForm.receiverCountry}
              onChange={(event) => setTxForm((prev) => ({ ...prev, receiverCountry: event.target.value }))}
              required
            />
          </label>
          <label className="page-label">
            Location
            <input
              value={txForm.location}
              onChange={(event) => setTxForm((prev) => ({ ...prev, location: event.target.value }))}
              required
            />
          </label>
          <label className="page-label">
            Device ID
            <input
              value={txForm.deviceId}
              onChange={(event) => setTxForm((prev) => ({ ...prev, deviceId: event.target.value }))}
              required
            />
          </label>
          <label className="page-label">
            Credit Score
            <input
              type="number"
              value={txForm.creditScore}
              onChange={(event) => setTxForm((prev) => ({ ...prev, creditScore: event.target.value }))}
            />
          </label>
          <div>
            <button type="submit" className="primary-btn" disabled={isSubmittingTx}>
              {isSubmittingTx ? "Processing..." : "Process Transaction"}
            </button>
          </div>
        </form>
        {txError ? <p className="error-text inline-error">{txError}</p> : null}
        {txResult ? (
          <p className="muted">
            Decision: {txResult.decision} | Risk: {txResult.riskScore} | Alert: {txResult.alertId || "No case created"}
          </p>
        ) : null}
      </section>

      <section className="card page-card">
        <div className="tab-row">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`tab-btn ${statusTab === tab ? "active" : ""}`}
              onClick={() => setStatusTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="filters-row">
          <label className="page-label inline-label">
            Investigator
            <select
              className="table-select"
              value={investigatorFilter}
              onChange={(event) => setInvestigatorFilter(event.target.value)}
            >
              <option value="ALL">ALL</option>
              {INVESTIGATORS.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
              <option value="unassigned">unassigned</option>
            </select>
          </label>
          <p className="muted">{isLoading ? "Syncing cases..." : `${visibleRows.length} cases visible`}</p>
        </div>
      </section>

      <section className="card table-card">
        <div className="section-head">
          <h3>Cases</h3>
          <p>Admin assignment and drill-down controls</p>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Transaction</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Risk</th>
                <th>Reason</th>
                <th>SLA</th>
                <th>Assignee</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan="10" className="empty-row">No cases for the selected filters.</td>
                </tr>
              ) : visibleRows.map((row) => {
                const isOpen = String(row.status).toUpperCase() === "OPEN";
                return (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.transactionId}</td>
                    <td>{row.severity}</td>
                    <td><span className={`status-chip ${row.status.toLowerCase()}`}>{row.status}</span></td>
                    <td>{row.riskScore}</td>
                    <td>{row.reason}</td>
                    <td>{row.sla}</td>
                    <td>
                      {isOpen ? (
                        <select
                          className="table-select"
                          value={assignees[row.id] || INVESTIGATORS[0]}
                          onChange={(event) => {
                            const value = event.target.value;
                            setAssignees((prev) => ({ ...prev, [row.id]: value }));
                          }}
                          disabled={activeAlertId === row.id}
                        >
                          {INVESTIGATORS.map((name) => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                      ) : (
                        <span>{row.owner}</span>
                      )}
                    </td>
                    <td>
                      {isOpen ? (
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => runAssign(row)}
                          disabled={activeAlertId === row.id}
                        >
                          {activeAlertId === row.id ? "Working..." : "Assign"}
                        </button>
                      ) : (
                        <span className="muted">-</span>
                      )}
                    </td>
                    <td>
                      <Link to={`/admin/alerts/${encodeURIComponent(row.id)}`} className="table-link">Open</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default CaseManagementPage;
