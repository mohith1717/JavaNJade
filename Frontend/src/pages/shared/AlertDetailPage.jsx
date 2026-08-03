import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchAuditTrail, fetchCaseByAlertId } from "../../services/dashboardService";
import { assignCase, investigateCase, resolveCase } from "../../services/caseService";
import { getSession } from "../../services/authService";

function toLabel(value) {
  const text = String(value || "").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function AlertDetailPage() {
  const { alertId } = useParams();
  const session = getSession();
  const isAdmin = session?.role === "ADMIN";
  const actor = session?.username || "system";

  const [record, setRecord] = useState(null);
  const [auditRows, setAuditRows] = useState([]);
  const [assignee, setAssignee] = useState("oliver");
  const [resolveAsClean, setResolveAsClean] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [error, setError] = useState("");

  const loadDetail = useCallback(() => {
    if (!alertId) {
      return Promise.resolve();
    }

    setIsLoading(true);
    setError("");

    return Promise.all([
      fetchCaseByAlertId(alertId),
      fetchAuditTrail("CASE", alertId),
    ])
      .then(([caseItem, audit]) => {
        setRecord(caseItem);
        setAuditRows(Array.isArray(audit) ? audit : []);
        if (caseItem?.assignedTo) {
          setAssignee(caseItem.assignedTo);
        }
      })
      .catch((loadErr) => {
        setError(loadErr?.message || "Unable to load alert details.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [alertId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const actionLabel = useMemo(() => {
    const status = String(record?.status || "").toUpperCase();
    if (status === "OPEN" && isAdmin) {
      return "Assign";
    }
    if (status === "ASSIGNED" && !isAdmin) {
      return "Investigate";
    }
    if (status === "INVESTIGATE" && !isAdmin) {
      return "Resolve";
    }
    return null;
  }, [record, isAdmin]);

  const runAction = async () => {
    if (!record || !actionLabel) {
      return;
    }

    setIsActing(true);
    setError("");

    try {
      if (actionLabel === "Assign") {
        await assignCase(record.alertId, {
          actor,
          assignee,
          notes: `Assigned by ${actor} from alert detail`,
          clean: false,
        });
      }

      if (actionLabel === "Investigate") {
        await investigateCase(record.alertId, {
          actor,
          assignee: record.assignedTo,
          notes: `Investigation started by ${actor}`,
          clean: false,
        });
      }

      if (actionLabel === "Resolve") {
        await resolveCase(record.alertId, {
          actor,
          assignee: record.assignedTo,
          notes: `Resolved by ${actor}`,
          clean: resolveAsClean,
        });
      }

      await loadDetail();
    } catch (actionErr) {
      setError(actionErr?.message || "Action failed. Please try again.");
    } finally {
      setIsActing(false);
    }
  };

  const backHref = isAdmin ? "/admin/alerts" : "/investigator/dashboard";

  return (
    <div className="dashboard-page">
      <header className="card page-card">
        <p className="mini-title">Alert Detail</p>
        <h2>{alertId}</h2>
        <p className="muted">Deep-dive case context and lifecycle actions for this alert.</p>
        <p>
          <Link to={backHref} className="table-link">Back to queue</Link>
        </p>
        {error ? <p className="error-text inline-error">{error}</p> : null}
      </header>

      {isLoading ? (
        <section className="card page-card">
          <p className="muted">Loading alert details...</p>
        </section>
      ) : record ? (
        <>
          <section className="stats-grid compact-stats">
            <article className="card stat-card">
              <p className="stat-title">Status</p>
              <h3 className="stat-value">{toLabel(record.status)}</h3>
              <p className="stat-change up">Current <span>lifecycle stage</span></p>
            </article>
            <article className="card stat-card">
              <p className="stat-title">Priority</p>
              <h3 className="stat-value">{toLabel(record.priority)}</h3>
              <p className="stat-change up">Risk score <span>{record.riskScore}</span></p>
            </article>
            <article className="card stat-card">
              <p className="stat-title">Assigned To</p>
              <h3 className="stat-value">{record.assignedTo || "unassigned"}</h3>
              <p className="stat-change down">Owner <span>for investigation</span></p>
            </article>
          </section>

          <section className="analytics-grid">
            <article className="card page-card">
              <div className="section-head">
                <h3>Case Overview</h3>
                <p>Primary alert context and identifiers</p>
              </div>
              <ul className="metric-list">
                <li><span>Alert ID</span><strong>{record.alertId}</strong></li>
                <li><span>Transaction ID</span><strong>{record.transactionId}</strong></li>
                <li><span>Reason</span><strong>{record.primaryReason || "-"}</strong></li>
                <li><span>Reopen Count</span><strong>{record.reopenCount}</strong></li>
              </ul>
            </article>

            <article className="card page-card">
              <div className="section-head">
                <h3>Workflow Action</h3>
                <p>Apply the next backend lifecycle step</p>
              </div>
              {isAdmin && String(record.status).toUpperCase() === "OPEN" ? (
                <label className="page-label">
                  Investigator
                  <select value={assignee} className="table-select" onChange={(event) => setAssignee(event.target.value)}>
                    <option value="oliver">oliver</option>
                    <option value="maya">maya</option>
                    <option value="liam">liam</option>
                  </select>
                </label>
              ) : null}

              {actionLabel ? (
                <>
                  {actionLabel === "Resolve" ? (
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={resolveAsClean}
                        onChange={(event) => setResolveAsClean(event.target.checked)}
                      />
                      Mark as clean outcome
                    </label>
                  ) : null}
                  <button type="button" className="primary-btn inline-btn" onClick={runAction} disabled={isActing}>
                    {isActing ? "Working..." : actionLabel}
                  </button>
                </>
              ) : (
                <p className="muted">No direct action available from this role at the current status.</p>
              )}
            </article>
          </section>

          <section className="card table-card">
            <div className="section-head">
              <h3>Audit Trail</h3>
              <p>Lifecycle and activity history for this alert</p>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Actor</th>
                    <th>Details</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {auditRows.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="empty-row">No audit events available.</td>
                    </tr>
                  ) : auditRows.map((row, index) => (
                    <tr key={`${row.eventType}-${row.createdAt}-${index}`}>
                      <td>{row.eventType}</td>
                      <td>{row.actor}</td>
                      <td>{row.details}</td>
                      <td>{new Date(row.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <section className="card page-card">
          <p className="muted">Alert not found.</p>
        </section>
      )}
    </div>
  );
}

export default AlertDetailPage;
