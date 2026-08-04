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
      <section className="brand-panel" aria-label="JadeGuard introduction">
        <div className="brand-lockup"><span className="brand-mark">JG</span><span>JadeGuard</span></div>
        <div className="brand-copy">
          <p className="eyebrow">Transaction intelligence</p>
          <h1>See the risk.<br />Trace the route.<br /><span>Act with confidence.</span></h1>
          <p>Explainable monitoring for transactions, country flows and analyst decisions.</p>
        </div>
        <div className="signal-card" aria-hidden="true">
          <div><span>LIVE MONITORING</span><strong>Protected</strong></div>
          <div className="signal-line"><i /><i /><i /><i /><i /><i /></div>
        </div>
      </section>

      <section className="login-panel">
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
      </section>
    </main>
  );
}
