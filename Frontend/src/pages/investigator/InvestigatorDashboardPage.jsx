import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchCases } from "../../services/dashboardService";
import { investigateCase, resolveCase } from "../../services/caseService";
import { getSession } from "../../services/authService";

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

function InvestigatorDashboardPage() {
  const session = getSession();
  const actor = session?.username || "investigator";
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [activeAlertId, setActiveAlertId] = useState(null);

  const loadCases = useCallback(() => {
    setIsLoading(true);
    setLoadError("");

    return fetchCases()
      .then((items) => {
        if (!Array.isArray(items)) {
          return;
        }

        const mapped = items
          .filter((item) => String(item.assignedTo || "").toLowerCase() === actor.toLowerCase())
          .map((item) => ({
            id: item.alertId,
            transactionId: item.transactionId,
            severity: toLabel(item.priority),
            status: toLabel(item.status),
            reason: item.primaryReason || "-",
            sla: formatSla(item.slaDeadline),
          }));

        setRows(mapped);
      })
      .catch((error) => {
        setLoadError(error?.message || "Unable to load investigator queue.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [actor]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  const inInvestigate = useMemo(
    () => rows.filter((row) => String(row.status).toUpperCase() === "INVESTIGATE").length,
    [rows]
  );

  const openAssigned = useMemo(
    () => rows.filter((row) => String(row.status).toUpperCase() === "ASSIGNED").length,
    [rows]
  );

  const runAction = async (row) => {
    const status = String(row.status).toUpperCase();
    if (!["ASSIGNED", "INVESTIGATE"].includes(status)) {
      return;
    }

    setActionError("");
    setActiveAlertId(row.id);

    try {
      if (status === "ASSIGNED") {
        await investigateCase(row.id, {
          actor,
          assignee: actor,
          notes: "Investigation started from investigator dashboard",
          clean: false,
        });
      }

      if (status === "INVESTIGATE") {
        await resolveCase(row.id, {
          actor,
          assignee: actor,
          notes: "Case resolved from investigator dashboard",
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

  return (
    <div className="dashboard-page">
      <header className="card page-card">
        <p className="mini-title">Investigator Workspace</p>
        <h2>My Alert Queue</h2>
        <p className="muted">Alerts assigned to {actor}. Start investigation, resolve findings, and track SLA targets.</p>
        {loadError ? <p className="error-text inline-error">{loadError}</p> : null}
        {actionError ? <p className="error-text inline-error">{actionError}</p> : null}
      </header>

      <section className="stats-grid compact-stats">
        <article className="card stat-card">
          <p className="stat-title">Assigned</p>
          <h3 className="stat-value">{openAssigned}</h3>
          <p className="stat-change up">Ready <span>to investigate</span></p>
        </article>
        <article className="card stat-card">
          <p className="stat-title">In Investigation</p>
          <h3 className="stat-value">{inInvestigate}</h3>
          <p className="stat-change up">Actively <span>in progress</span></p>
        </article>
        <article className="card stat-card">
          <p className="stat-title">Total Queue</p>
          <h3 className="stat-value">{rows.length}</h3>
          <p className="stat-change down">Live <span>from case service</span></p>
        </article>
      </section>

      <section className="card table-card">
        <div className="section-head">
          <h3>Assigned Alerts</h3>
          <p>{isLoading ? "Syncing queue..." : "Active alert queue"}</p>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Transaction</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Primary Reason</th>
                <th>SLA Remaining</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-row">No assigned alerts for this investigator.</td>
                </tr>
              ) : rows.map((row) => {
                const status = String(row.status).toUpperCase();
                const actionLabel = status === "ASSIGNED" ? "Investigate" : status === "INVESTIGATE" ? "Resolve" : null;

                return (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.transactionId}</td>
                    <td>{row.severity}</td>
                    <td><span className={`status-chip ${row.status.toLowerCase()}`}>{row.status}</span></td>
                    <td>{row.reason}</td>
                    <td>{row.sla}</td>
                    <td>
                      {actionLabel ? (
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => runAction(row)}
                          disabled={activeAlertId === row.id}
                        >
                          {activeAlertId === row.id ? "Working..." : actionLabel}
                        </button>
                      ) : (
                        <span className="muted">-</span>
                      )}
                    </td>
                    <td>
                      <Link to={`/investigator/alerts/${encodeURIComponent(row.id)}`} className="table-link">Open</Link>
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

export default InvestigatorDashboardPage;
