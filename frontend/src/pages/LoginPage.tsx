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
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowIntro(false), 3000);
    return () => window.clearTimeout(timer);
  }, []);

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
    <main className="login-page login-experience">
      {showIntro && <div className="login-logo-intro" aria-label="JadeGuard is loading" role="status">
        <div className="intro-scan" />
        <div className="intro-logo"><span>JG</span><i /><i /><i /></div>
        <strong>JadeGuard</strong>
        <small>Transaction intelligence</small>
        <div className="intro-progress"><i /></div>
      </div>}
      <section className="brand-panel" aria-label="JadeGuard introduction">
        <div className="brand-lockup login-brand-lockup"><span className="brand-mark">JG</span><span>JadeGuard<small>Financial crime command center</small></span></div>
        <div className="brand-copy">
          <div className="login-live-status"><i /> Monitoring network online</div>
          <p className="eyebrow">Transaction intelligence</p>
          <h1>Every transfer<br />leaves a <span>trail.</span></h1>
          <p>Validate transactions, trace funds across borders and turn explainable risk into decisive action.</p>
        </div>
        <div className="login-intelligence-strip" aria-hidden="true">
          <div><span>01</span><strong>Validate</strong><small>Integrity checks</small></div>
          <i>→</i><div><span>02</span><strong>Assess</strong><small>Explainable risk</small></div>
          <i>→</i><div><span>03</span><strong>Investigate</strong><small>Analyst decision</small></div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <header className="login-card-header"><span className="login-access-icon">◇</span><div><p className="eyebrow">Secure analyst access</p><h2>Enter the command center</h2></div></header>
          <p className="muted">Use your authorized JadeGuard identity to continue.</p>
          {error && <div className="error-banner" role="alert">{error}</div>}
          <form onSubmit={handleSubmit}>
            <label><span>Username or email</span>
              <div className="login-input-shell"><i aria-hidden="true">@</i><input autoComplete="username" value={usernameOrEmail} onChange={(event) => setUsername(event.target.value)} placeholder="fraud1" required autoFocus={!showIntro} /></div>
            </label>
            <label><span>Password</span>
              <div className="password-field login-input-shell"><i aria-hidden="true">⌁</i>
                <input type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required />
                <button type="button" className="text-button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide" : "Show"}</button>
              </div>
            </label>
            <button className="primary-button login-submit" type="submit" disabled={submitting}>{submitting ? <><span className="button-spinner" />Signing in…</> : <><span>Enter JadeGuard</span><b>→</b></>}</button>
          </form>
          <div className="security-note"><span>◆</span><p><strong>Protected analyst session</strong><br />JWT authentication · role-based access · audited actions</p></div>
        </div>
        <p className="login-footer"><span /> JadeGuard internal monitoring platform</p>
      </section>
    </main>
  );
}
