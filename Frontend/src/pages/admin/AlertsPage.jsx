import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCases } from "../../services/dashboardService";
import { assignCase, investigateCase, resolveCase } from "../../services/caseService";
import { getSession } from "../../services/authService";

const INVESTIGATORS = ["oliver", "maya", "liam"];

const fallbackAlertRows = [
  { id: "AL-2201", transactionId: "TXN-9921", owner: "oliver", severity: "Critical", status: "Open", sla: "15m" },
  { id: "AL-2200", transactionId: "TXN-9918", owner: "maya", severity: "High", status: "Assigned", sla: "42m" },
  { id: "AL-2199", transactionId: "TXN-9916", owner: "liam", severity: "High", status: "Investigate", sla: "1h 05m" },
  { id: "AL-2198", transactionId: "TXN-9914", owner: "oliver", severity: "Medium", status: "Resolved", sla: "2h 10m" },
  { id: "AL-2197", transactionId: "TXN-9912", owner: "maya", severity: "Critical", status: "Open", sla: "11m" },
];

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

function AlertsPage() {
  const session = getSession();
  const [alerts, setAlerts] = useState(fallbackAlertRows);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [activeAlertId, setActiveAlertId] = useState(null);
  const [assignees, setAssignees] = useState({});

  const loadCases = useCallback(() => {
    setIsLoading(true);
    setLoadError("");

    return fetchCases()
      .then((items) => {
        if (!Array.isArray(items)) {
          return;
        }

        const mapped = items.map((item) => ({
          id: item.alertId,
          transactionId: item.transactionId,
          owner: item.assignedTo || "unassigned",
          severity: String(item.priority || "MEDIUM").charAt(0) + String(item.priority || "MEDIUM").slice(1).toLowerCase(),
          status: String(item.status || "OPEN").charAt(0) + String(item.status || "OPEN").slice(1).toLowerCase(),
          sla: formatSla(item.slaDeadline),
        }));

        setAlerts(mapped);
        setAssignees((prev) => {
          const next = { ...prev };
          for (const alert of mapped) {
            if (!next[alert.id]) {
              next[alert.id] = INVESTIGATORS[0];
            }
          }
          return next;
        });
      })
      .catch((error) => {
        setLoadError(error?.message || "Unable to load live alerts. Showing fallback snapshot.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  const getActionForStatus = (status) => {
    const normalized = String(status).toUpperCase();
    if (normalized === "OPEN") {
      return "Assign";
    }
    if (normalized === "ASSIGNED" && session?.role === "INVESTIGATOR") {
      return "Investigate";
    }
    if (normalized === "INVESTIGATE" && session?.role === "INVESTIGATOR") {
      return "Resolve";
    }
    return null;
  };

  const runAction = async (row) => {
    const action = getActionForStatus(row.status);
    if (!action) {
      return;
    }

    setActionError("");
    setActiveAlertId(row.id);
    const actor = session?.username || "admin";

    try {
      if (action === "Assign") {
        const selectedAssignee = assignees[row.id] || INVESTIGATORS[0];
        await assignCase(row.id, {
          actor,
          assignee: selectedAssignee,
          notes: `Assigned by ${actor} from alerts dashboard`,
          clean: false,
        });
      } else if (action === "Investigate") {
        await investigateCase(row.id, {
          actor,
          assignee: row.owner,
          notes: "Investigation started from alerts dashboard",
          clean: false,
        });
      } else if (action === "Resolve") {
        await resolveCase(row.id, {
          actor,
          assignee: row.owner,
          notes: "Resolved from alerts dashboard",
          clean: false,
        });
      }

      await loadCases();
    } catch (error) {
      setActionError(error?.message || "Action failed. Please try again.");
    } finally {
      setActiveAlertId(null);
    }
  };

  const openAlerts = useMemo(
    () => alerts.filter((alert) => String(alert.status).toUpperCase() === "OPEN").length,
    [alerts]
  );
  const criticalQueue = useMemo(
    () => alerts.filter((alert) => String(alert.severity).toUpperCase() === "CRITICAL").length,
    [alerts]
  );
  const investigateCount = useMemo(
    () => alerts.filter((alert) => String(alert.status).toUpperCase() === "INVESTIGATE").length,
    [alerts]
  );

  const statusCounts = useMemo(() => {
    const map = new Map();
    for (const alert of alerts) {
      const key = String(alert.status).toUpperCase();
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [alerts]);

  const ownerCounts = useMemo(() => {
    const map = new Map();
    for (const alert of alerts) {
      const owner = String(alert.owner || "unassigned").toLowerCase();
      map.set(owner, (map.get(owner) || 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [alerts]);

  return (
    <div className="dashboard-page">
      <header className="card page-card">
        <p className="mini-title">Case Management</p>
        <h2>Alerts</h2>
        <p className="muted">Prioritize fraud alerts, keep SLA targets, and move cases through assign, investigate, and resolve.</p>
        {loadError ? <p className="error-text inline-error">{loadError}</p> : null}
        {actionError ? <p className="error-text inline-error">{actionError}</p> : null}
      </header>

      <section className="stats-grid compact-stats">
        <article className="card stat-card">
          <p className="stat-title">Open Alerts</p>
          <h3 className="stat-value">{openAlerts}</h3>
          <p className="stat-change down">Live <span>from case queue</span></p>
        </article>
        <article className="card stat-card">
          <p className="stat-title">Critical Queue</p>
          <h3 className="stat-value">{criticalQueue}</h3>
          <p className="stat-change up">Priority <span>requires fastest handling</span></p>
        </article>
        <article className="card stat-card">
          <p className="stat-title">Investigations Active</p>
          <h3 className="stat-value">{investigateCount}</h3>
          <p className="stat-change up">Current <span>investigation stage</span></p>
        </article>
      </section>

      <section className="analytics-grid">
        <article className="card page-card">
          <div className="section-head">
            <h3>Status Breakdown</h3>
            <p>Current lifecycle distribution</p>
          </div>
          <ul className="metric-list">
            <li><span>Open</span><strong>{statusCounts.get("OPEN") || 0}</strong></li>
            <li><span>Assigned</span><strong>{statusCounts.get("ASSIGNED") || 0}</strong></li>
            <li><span>Investigate</span><strong>{statusCounts.get("INVESTIGATE") || 0}</strong></li>
            <li><span>Resolved</span><strong>{statusCounts.get("RESOLVED") || 0}</strong></li>
          </ul>
        </article>

        <article className="card page-card">
          <div className="section-head">
            <h3>Investigator Load</h3>
            <p>Case allocation snapshot</p>
          </div>
          <ul className="metric-list">
            {ownerCounts.map(([owner, count]) => (
              <li key={owner}>
                <span>{owner}</span>
                <strong>{count} alerts</strong>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="card table-card">
        <div className="section-head">
          <h3>Priority Alerts</h3>
          <p>
            Most time-sensitive alerts in the current queue
            {isLoading ? " (syncing...)" : ""}
          </p>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Transaction</th>
                <th>Owner</th>
                <th>Severity</th>
                <th>Status</th>
                <th>SLA Remaining</th>
                <th>Assignee</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.transactionId}</td>
                  <td>{row.owner}</td>
                  <td>{row.severity}</td>
                  <td><span className={`status-chip ${row.status.toLowerCase()}`}>{row.status}</span></td>
                  <td>{row.sla}</td>
                  <td>
                    {String(row.status).toUpperCase() === "OPEN" && session?.role === "ADMIN" ? (
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
                    {getActionForStatus(row.status) ? (
                      <button
                        type="button"
                        className="table-action-btn"
                        onClick={() => runAction(row)}
                        disabled={activeAlertId === row.id}
                      >
                        {activeAlertId === row.id ? "Working..." : getActionForStatus(row.status)}
                      </button>
                    ) : (
                      <span className="muted">-</span>
                    )}
                  </td>
                  <td>
                    <Link to={`/admin/alerts/${encodeURIComponent(row.id)}`} className="table-link">Open</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AlertsPage;
