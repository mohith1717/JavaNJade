import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { moduleFor } from "./routeMetadata";

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const workspaceModule = moduleFor(location.pathname);
  useEffect(() => setMobileOpen(false), [location.pathname]);
  return <div className={`application-shell ${collapsed ? "sidebar-is-collapsed" : ""}`} data-module={workspaceModule}><Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} /><div className="shell-main"><Header sidebarCollapsed={collapsed} onToggleSidebar={() => setCollapsed((value) => !value)} onOpenMobile={() => setMobileOpen(true)} /><main className="shell-content"><Outlet /></main></div></div>;
}
