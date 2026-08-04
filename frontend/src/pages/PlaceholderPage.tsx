import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  function signOut() { logout(); navigate("/login", { replace: true }); }
  return <main className="placeholder-page"><header className="app-header"><div className="brand-lockup"><span className="brand-mark small">JG</span><span>JadeGuard</span></div><div className="user-chip"><span>{user?.displayName}</span><b>{user?.role.replace("_", " ")}</b><button onClick={signOut}>Logout</button></div></header><section className="placeholder-card"><p className="eyebrow">Authenticated workspace</p><h1>{title}</h1><p>{description}</p><div className="access-confirmation"><span>✓</span><div><strong>Authentication successful</strong><p>The JWT, protected route and role authorization are working.</p></div></div></section></main>;
}
