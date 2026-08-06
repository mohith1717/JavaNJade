import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { BrandLogo } from "../brand/BrandLogo";
import { NavigationIcon } from "./NavigationIcon";
import { navigationFor } from "./navigation";

export function Sidebar({ collapsed, mobileOpen, onClose }: { collapsed: boolean; mobileOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  if (!user) return null;
  return <><button className={`sidebar-backdrop ${mobileOpen ? "visible" : ""}`} aria-label="Close navigation" onClick={onClose} /><aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}><div className="sidebar-brand"><BrandLogo className="small" /><span className="brand-text">JadeGuard<small>Transaction intelligence</small></span></div><div className="nav-section-label">Workspace</div><nav aria-label="Primary navigation">{navigationFor(user.role).map((item) => <NavLink key={item.path} to={item.path} onClick={onClose} title={collapsed ? item.label : undefined} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}><NavigationIcon name={item.icon} /><span>{item.label}</span><i className="nav-active-dot" /></NavLink>)}</nav><div className="sidebar-user-context"><span>{user.displayName}</span><small>{user.role.replaceAll("_", " ")}</small></div><div className="sidebar-foot"><span className="live-dot" /><span>Monitoring active</span></div></aside></>;
}
