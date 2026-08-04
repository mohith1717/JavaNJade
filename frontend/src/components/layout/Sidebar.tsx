import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { NavigationIcon } from "./NavigationIcon";
import { navigationFor } from "./navigation";

export function Sidebar({ collapsed, mobileOpen, onClose }: { collapsed: boolean; mobileOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  if (!user) return null;
  return <><button className={`sidebar-backdrop ${mobileOpen ? "visible" : ""}`} aria-label="Close navigation" onClick={onClose} /><aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}><div className="sidebar-brand"><span className="brand-mark small">JG</span><span className="brand-text">JadeGuard<small>Monitoring</small></span></div><nav aria-label="Primary navigation">{navigationFor(user.role).map((item) => <NavLink key={item.path} to={item.path} onClick={onClose} title={collapsed ? item.label : undefined} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}><NavigationIcon name={item.icon} /><span>{item.label}</span></NavLink>)}</nav><div className="sidebar-foot"><span className="live-dot" /><span>Monitoring active</span></div></aside></>;
}
