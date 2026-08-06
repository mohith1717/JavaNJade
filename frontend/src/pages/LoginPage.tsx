import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { ApiError } from "../api/ApiError";
import { useAuth } from "../auth/AuthContext";
import { landingFor } from "../auth/rolePaths";
import { BrandLogo } from "../components/brand/BrandLogo";

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
    <main className="login-page login-experience login-command-gateway login-floating-split">
      {showIntro && <div className="login-logo-intro" aria-label="JadeGuard is loading" role="status">
        <div className="intro-scan" />
        <div className="intro-logo"><BrandLogo className="intro-brand-logo" /><i /><i /><i /></div>
        <strong>JadeGuard</strong>
        <small>Transaction intelligence</small>
        <div className="intro-progress"><i /></div>
      </div>}
      <section className="floating-brand-panel" aria-label="JadeGuard introduction">
        <div className="brand-lockup login-brand-lockup"><BrandLogo /><span>JadeGuard<small>Transaction intelligence</small></span></div>
        <div className="floating-content-stack">
          <div className="floating-brand-copy">
            <div className="gateway-kicker"><span>LIVE</span> Monitoring network operational</div>
            <h1>Every transfer<br />leaves a <span>trail.</span></h1>
            <p>Validate transactions, trace funds across borders and convert explainable risk into decisive, audited action.</p>
          </div>
          <div className="floating-lower-stack">
            <div className="floating-signal-grid">
              <div className="floating-signal signal-validation"><i>✓</i><span><strong>Validation</strong><small>Integrity checks online</small></span></div>
              <div className="floating-signal signal-route"><i>↝</i><span><strong>Fund flow</strong><small>Country route traced</small></span></div>
              <div className="floating-signal signal-risk"><i>!</i><span><strong>Risk engine</strong><small>Explainable scoring active</small></span></div>
            </div>
            <div className="floating-workflow" aria-hidden="true"><div><i>01</i><span><strong>Validate</strong><small>Transaction integrity</small></span></div><b>→</b><div><i>02</i><span><strong>Assess</strong><small>Rules and risk</small></span></div><b>→</b><div><i>03</i><span><strong>Investigate</strong><small>Audited action</small></span></div></div>
          </div>
        </div>
      </section>
      <section className="floating-access-panel" aria-label="JadeGuard sign in">
        <div className="access-panel-status"><i /> Secure identity gateway</div>
        <div className="login-card">
          <div className="gateway-card-mark"><BrandLogo /><span>IDENTITY CHECKPOINT</span></div>
          <header className="login-card-header"><div><p className="eyebrow">Secure platform access</p><h2>Sign in to JadeGuard</h2></div></header>
          <p className="muted">Your role and permitted workspace are applied automatically after authentication.</p>
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
            <button className="primary-button login-submit" type="submit" disabled={submitting}>{submitting ? <><span className="button-spinner" />Signing in…</> : <><span>Continue to workspace</span><b>→</b></>}</button>
          </form>
          <div className="security-note"><span>◆</span><p><strong>Protected user session</strong><br />JWT secured · role controlled · fully audited</p></div>
        </div>
        <div className="access-role-strip"><span>ADMIN</span><span>FRAUD ANALYST</span><span>RISK ANALYST</span></div>
        <p className="floating-login-footer"><i /> JadeGuard internal monitoring platform</p>
      </section>
    </main>
  );
}
