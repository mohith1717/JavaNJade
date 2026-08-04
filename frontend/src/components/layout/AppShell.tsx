import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setMobileOpen(false), [location.pathname]);
  return <div className={`application-shell ${collapsed ? "sidebar-is-collapsed" : ""}`}><Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} /><div className="shell-main"><Header sidebarCollapsed={collapsed} onToggleSidebar={() => setCollapsed((value) => !value)} onOpenMobile={() => setMobileOpen(true)} /><main className="shell-content"><Outlet /></main></div></div>;
}
