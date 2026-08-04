const ROUTES: Record<string, { title: string; description: string }> = {
  "/dashboard": { title: "Operations dashboard", description: "Live transaction risk and monitoring overview" },
  "/transactions": { title: "Transactions", description: "Review processing status, risk and fund routes" },
  "/alerts": { title: "Alert queue", description: "Prioritize and investigate actionable alerts" },
  "/reports": { title: "Reports", description: "Explore risk, alert and rule effectiveness trends" },
  "/watchlisted-accounts": { title: "Watchlisted accounts", description: "Review accounts monitored by the risk engine" },
  "/admin/rules": { title: "Rule management", description: "Configure how JadeGuard identifies transaction risk" },
  "/admin/audit": { title: "Audit history", description: "Trace immutable user and system activity" },
};
export const metadataFor = (pathname: string) => pathname.startsWith("/alerts/")
  ? { title: "Alert investigation", description: "Review alert evidence and transaction risk" }
  : pathname.startsWith("/admin/rules/")
    ? { title: "Rule configuration", description: "Review and configure transaction risk logic" }
  : ROUTES[pathname] || { title: "JadeGuard", description: "Transaction monitoring workspace" };
