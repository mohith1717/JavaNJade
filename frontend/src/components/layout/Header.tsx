import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { RoleBadge } from "../badges/RoleBadge";
import { metadataFor, moduleFor } from "./routeMetadata";

export function Header({ sidebarCollapsed, onToggleSidebar, onOpenMobile }: { sidebarCollapsed: boolean; onToggleSidebar: () => void; onOpenMobile: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const metadata = metadataFor(pathname);
  const workspaceModule = moduleFor(pathname);
  const initials = user?.displayName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  function signOut() { logout(); navigate("/login", { replace: true }); }
  return <header className="shell-header"><div className="header-left"><button className="icon-button desktop-toggle" onClick={onToggleSidebar} aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}><span /><span /><span /></button><button className="icon-button mobile-toggle" onClick={onOpenMobile} aria-label="Open navigation"><span /><span /><span /></button><span className="module-marker" aria-hidden="true" /><div><div className="header-title-row"><h1>{metadata.title}</h1><span className="module-label">{workspaceModule}</span></div><p>{metadata.description}</p></div></div><div className="header-actions"><div className="api-status" title="Frontend session active"><span />Secure session</div><div className="user-summary"><div className="avatar" aria-hidden="true">{initials}</div><div className="user-copy"><strong>{user?.displayName}</strong><RoleBadge role={user?.role || "RISK_ANALYST"} /></div></div><button className="logout-button" onClick={signOut}>Sign out</button></div></header>;
}
