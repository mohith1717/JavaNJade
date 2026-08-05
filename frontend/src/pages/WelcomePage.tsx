import { Link } from "react-router-dom";

export function WelcomePage() {
  return (
    <div className="welcome-page">
      {/* Navigation */}
      <nav className="welcome-nav">
        <div className="welcome-nav-brand">
          <span className="brand-mark small">JG</span>
          <span>JadeGuard</span>
        </div>
        <Link to="/login" className="primary-button welcome-nav-cta">Sign In</Link>
      </nav>

      {/* Hero Section */}
      <section className="welcome-hero">
        <div className="welcome-hero-bg" aria-hidden="true" />
        <div className="welcome-hero-content">
          <p className="eyebrow">AI-Powered Financial Intelligence</p>
          <h1>
            Guard Every<br />
            <span>Transaction.</span><br />
            In Real Time.
          </h1>
          <p className="welcome-hero-sub">
            JadeGuard delivers enterprise-grade fraud detection, risk scoring, and audit trails —
            built for the teams who need answers, not noise.
          </p>
          <div className="welcome-hero-actions">
            <Link to="/login" className="primary-button">Enter JadeGuard →</Link>
            <a href="#features" className="ghost-button">Explore Features</a>
          </div>
        </div>
        <div className="welcome-hero-stats" aria-label="Platform statistics">
          <div className="stat-card"><strong>99.7%</strong><span>Detection Rate</span></div>
          <div className="stat-card"><strong>&lt;50ms</strong><span>Avg. Score Time</span></div>
          <div className="stat-card"><strong>24/7</strong><span>Live Monitoring</span></div>
          <div className="stat-card"><strong>100%</strong><span>Audit Coverage</span></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="welcome-features" id="features">
        <p className="eyebrow" style={{ textAlign: "center" }}>Platform Capabilities</p>
        <h2 className="welcome-section-title">Everything you need to fight fraud</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Fraud Detection</h3>
            <p>Real-time transaction monitoring with a configurable rule engine. Flag suspicious activity the moment it happens.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Risk Assessment</h3>
            <p>Dynamic risk scoring across country flows, account patterns, and transaction velocity — fully explainable.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Audit Trail</h3>
            <p>Immutable logs for every analyst decision, rule change, and system event. Stay compliant with zero effort.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Alert Management</h3>
            <p>Prioritized alert queues with investigative workflows. Resolve cases faster with contextual data at your fingertips.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Advanced Reporting</h3>
            <p>Customizable dashboards and exportable reports for compliance teams, management, and regulators.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Role-Based Access</h3>
            <p>Granular permissions for Fraud Analysts, Risk Analysts, and Admins. The right access for the right people.</p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="welcome-cta-banner">
        <div className="welcome-cta-content">
          <h2>Ready to protect your transactions?</h2>
          <p>Sign in to your JadeGuard account and start monitoring activity in real time.</p>
          <Link to="/login" className="primary-button welcome-cta-btn">Sign In to JadeGuard</Link>
        </div>
        <div className="welcome-cta-signal" aria-hidden="true">
          <div className="signal-card">
            <div><span>LIVE MONITORING</span><strong>Protected</strong></div>
            <div className="signal-line"><i /><i /><i /><i /><i /><i /></div>
          </div>
        </div>
      </section>

      <footer className="welcome-footer">
        <span>© 2026 JadeGuard — Internal Monitoring Platform</span>
      </footer>
    </div>
  );
}
