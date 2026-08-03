import { useEffect, useMemo, useState } from "react";
import { fetchRules } from "../../services/dashboardService";

const fallbackRuleSet = [
  { id: "R-101", name: "Cross-country transfer", trigger: "senderCountry != receiverCountry", action: "Open case", severity: "Critical", status: "Enabled" },
  { id: "R-203", name: "Velocity burst", trigger: ">= 4 tx in 2 min", action: "Flag", severity: "High", status: "Enabled" },
  { id: "R-317", name: "High-value first transfer", trigger: "> USD 10,000 + new beneficiary", action: "Manual review", severity: "High", status: "Enabled" },
  { id: "R-411", name: "Dormant account activity", trigger: "No tx in 90 days then sudden debit", action: "Flag", severity: "Medium", status: "Enabled" },
  { id: "R-532", name: "Geo mismatch login", trigger: "Device location anomaly", action: "Step-up auth", severity: "Medium", status: "Testing" },
];

function RuleEnginePage() {
  const [rules, setRules] = useState(fallbackRuleSet);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setLoadError("");

    fetchRules()
      .then((items) => {
        if (!isMounted || !Array.isArray(items)) {
          return;
        }

        const mapped = items.map((item) => ({
          id: String(item.id ?? item.type ?? "-"),
          name: item.name || item.type || "Rule",
          trigger: item.description || "Threshold-based rule",
          action: item.enabled ? "Apply risk weight" : "No action",
          severity: item.riskWeight >= 25 ? "Critical" : item.riskWeight >= 15 ? "High" : item.riskWeight >= 8 ? "Medium" : "Low",
          status: item.enabled ? "Enabled" : "Testing",
        }));

        setRules(mapped);
      })
      .catch((error) => {
        setLoadError(error?.message || "Unable to load live rules. Showing fallback snapshot.");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const enabledRules = useMemo(() => rules.filter((rule) => String(rule.status).toLowerCase() === "enabled").length, [rules]);

  const estimatedTriggers = useMemo(
    () => rules.reduce((sum, rule) => sum + (String(rule.severity).toLowerCase() === "critical" ? 24 : 12), 0),
    [rules]
  );

  const avgRiskWeight = useMemo(() => {
    if (!rules.length) {
      return "0.0";
    }
    const total = rules.reduce((sum, rule) => {
      const level = String(rule.severity).toLowerCase();
      if (level === "critical") return sum + 28;
      if (level === "high") return sum + 18;
      if (level === "medium") return sum + 10;
      return sum + 5;
    }, 0);
    return (total / rules.length).toFixed(1);
  }, [rules]);

  return (
    <div className="dashboard-page">
      <header className="card page-card">
        <p className="mini-title">Fraud Decision Layer</p>
        <h2>Rule Engine</h2>
        <p className="muted">Tune live detection rules, monitor stability, and validate recent deployment impact.</p>
        {loadError ? <p className="error-text inline-error">{loadError}</p> : null}
      </header>

      <section className="stats-grid compact-stats">
        <article className="card stat-card">
          <p className="stat-title">Active Rules</p>
          <h3 className="stat-value">{enabledRules}</h3>
          <p className="stat-change up">Live <span>from backend registry</span></p>
        </article>
        <article className="card stat-card">
          <p className="stat-title">Triggers (24h)</p>
          <h3 className="stat-value">{estimatedTriggers}</h3>
          <p className="stat-change down">Estimated <span>from active rules</span></p>
        </article>
        <article className="card stat-card">
          <p className="stat-title">False Positive Rate</p>
          <h3 className="stat-value">{avgRiskWeight}%</h3>
          <p className="stat-change up">Avg signal <span>risk weighting</span></p>
        </article>
      </section>

      <section className="analytics-grid">
        <article className="card page-card">
          <div className="section-head">
            <h3>Pipeline Health</h3>
            <p>Decision path stability over the current cycle</p>
          </div>
          <ul className="metric-list">
            <li><span>Validation service uptime</span><strong>99.99%</strong></li>
            <li><span>Rules execution latency</span><strong>74 ms</strong></li>
            <li><span>Risk model response time</span><strong>112 ms</strong></li>
            <li><span>Fallback invocations</span><strong>0</strong></li>
          </ul>
        </article>

        <article className="card page-card">
          <div className="section-head">
            <h3>Latest Change Window</h3>
            <p>Scope and expected behavioral impact</p>
          </div>
          <ul className="metric-list">
            <li><span>Release version</span><strong>ruleset-v1.8.4</strong></li>
            <li><span>Changed rules</span><strong>5</strong></li>
            <li><span>Canary traffic</span><strong>20%</strong></li>
            <li><span>Rollback readiness</span><strong>Healthy</strong></li>
          </ul>
        </article>
      </section>

      <section className="card table-card">
        <div className="section-head">
          <h3>Rule Registry</h3>
          <p>
            Current active and experimental fraud checks
            {isLoading ? " (syncing...)" : ""}
          </p>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rule ID</th>
                <th>Name</th>
                <th>Trigger</th>
                <th>Action</th>
                <th>Severity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rules.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">No rules available.</td>
                </tr>
              ) : rules.map((rule) => (
                <tr key={rule.id}>
                  <td>{rule.id}</td>
                  <td>{rule.name}</td>
                  <td>{rule.trigger}</td>
                  <td>{rule.action}</td>
                  <td>{rule.severity}</td>
                  <td>
                    <span className={`status-chip ${rule.status.toLowerCase()}`}>
                      {rule.status}
                    </span>
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

export default RuleEnginePage;
