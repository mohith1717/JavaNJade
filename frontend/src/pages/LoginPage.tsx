import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { ApiError } from "../api/ApiError";
import { useAuth } from "../auth/AuthContext";
import { landingFor } from "../auth/rolePaths";

type LocationState = { from?: { pathname?: string; search?: string; hash?: string } };

export function LoginPage() {
  const { login, user, isInitializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [usernameOrEmail, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get("session") === "expired") {
      setError("Your session expired. Sign in again to continue.");
    }
  }, [searchParams]);

  if (!isInitializing && user) return <Navigate to={landingFor(user.role)} replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const authenticatedUser = await login(usernameOrEmail.trim(), password);
      const previous = (location.state as LocationState | null)?.from;
      const attempted = previous?.pathname
        ? `${previous.pathname}${previous.search || ""}${previous.hash || ""}`
        : undefined;
      navigate(attempted || landingFor(authenticatedUser.role), { replace: true });
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        setError("The username/email or password is incorrect.");
      } else if (caught instanceof ApiError) {
        setError(caught.message);
      } else {
        setError("Sign-in failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-hero" aria-label="JadeGuard introduction">
        <div className="login-brand-lockup">
          <span className="brand-mark" aria-hidden="true">JG</span>
          <span className="brand-text-wrap">
            <strong>JadeGuard</strong>
            <small>Transaction intelligence</small>
          </span>
        </div>
        <div className="login-hero-copy">
          <p className="eyebrow">Secure operations workspace</p>
          <h1>Investigate faster.<br />Decide clearly.<br /><span>Protect with precision.</span></h1>
          <p>Built for fraud and risk teams who need actionable intelligence with full audit confidence.</p>
        </div>
        <div className="hero-notes" aria-hidden="true">
          <article>
            <span>Realtime monitoring</span>
            <strong>24/7 active coverage</strong>
          </article>
          <article>
            <span>Analyst workflow</span>
            <strong>Prioritized and explainable</strong>
          </article>
          <article>
            <span>Audit posture</span>
            <strong>Policy-aligned decisions</strong>
          </article>
        </div>
        <div className="hero-product-sections" aria-label="Product highlights">
          <article className="hero-section-card">
            <p className="eyebrow">How teams use JadeGuard</p>
            <h2>One workspace for triage, investigation, and reporting.</h2>
            <p>Move from signal to decision with structured evidence, linked transactions, and role-aware workflows designed for production operations.</p>
          </article>
          <article className="hero-metric-grid" aria-hidden="true">
            <div><span>Mean triage time</span><strong>↓ 42%</strong></div>
            <div><span>Policy alignment</span><strong>99.6%</strong></div>
            <div><span>Case traceability</span><strong>Full audit</strong></div>
          </article>
          <article className="hero-section-card compact" aria-hidden="true">
            <p className="eyebrow">Platform principles</p>
            <ul>
              <li>Transparent risk scoring with explainable outcomes</li>
              <li>Queue-first operations with role-based routing</li>
              <li>Native controls for compliance and governance</li>
            </ul>
          </article>
        </div>
        <div className="hero-crystal-field" aria-hidden="true">
          <i className="crystal crystal-a" />
          <i className="crystal crystal-b" />
          <i className="crystal crystal-c" />
        </div>
      </section>

      <section className="login-panel">
        <div className="login-panel-sticky">
          <div className="login-card">
            <p className="eyebrow">Secure analyst access</p>
            <h2>Welcome back</h2>
            <p className="muted">Sign in with your JadeGuard development account.</p>
            {error && <div className="error-banner" role="alert">{error}</div>}
            <form onSubmit={handleSubmit}>
              <label>Username or email
                <input autoComplete="username" value={usernameOrEmail} onChange={(event) => setUsername(event.target.value)} placeholder="fraud1" required autoFocus />
              </label>
              <label>Password
                <div className="password-field">
                  <input type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required />
                  <button type="button" className="text-button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide" : "Show"}</button>
                </div>
              </label>
              <button className="primary-button" type="submit" disabled={submitting}>{submitting ? <><span className="button-spinner" />Signing in…</> : "Enter JadeGuard"}</button>
            </form>
            <div className="security-note"><span>◆</span><p><strong>JWT protected session</strong><br />Your password is never stored in this browser.</p></div>
          </div>
          <p className="login-footer">JadeGuard internal monitoring platform</p>
        </div>
      </section>
    </main>
  );
}
