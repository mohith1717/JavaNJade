import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSession, loginWithCredentials } from "../../services/authService";

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    setError("");

    const ok = loginWithCredentials(form.username, form.password);
    if (!ok) {
      setError("Invalid credentials. Try admin/admin123 or oliver/maya/liam with invest123");
      return;
    }

    const session = getSession();
    if (session?.role === "INVESTIGATOR") {
      navigate("/investigator/dashboard");
      return;
    }
    navigate("/admin/dashboard");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>JavaNJade</h1>
        <p className="login-sub">Fraud Ops Access</p>

        <form onSubmit={onSubmit}>
          <label>
            Username
            <input name="username" value={form.username} onChange={onChange} placeholder="admin" />
          </label>
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={onChange} placeholder="admin123" />
          </label>

          {error ? <p className="error-text">{error}</p> : null}

          <button type="submit" className="primary-btn">Login</button>
          <p className="muted">Admin: admin / admin123 | Investigators: oliver, maya, liam / invest123</p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
