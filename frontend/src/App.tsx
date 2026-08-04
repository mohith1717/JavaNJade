import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./auth/ProtectedRoute";
import { RoleRoute } from "./auth/RoleRoute";
import { RoleLanding } from "./auth/RoleLanding";
import { AppShell } from "./components/layout/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<RoleLanding />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route element={<AppShell />}>
          <Route element={<RoleRoute allowedRoles={["FRAUD_ANALYST", "RISK_ANALYST", "ADMIN"]} />}>
            <Route path="/dashboard" element={<PlaceholderPage title="Operations dashboard" description="Live monitoring and reporting will be implemented in Step 9.6." />} />
            <Route path="/alerts" element={<PlaceholderPage title="Alert queue" description="The analyst alert queue will be implemented in Step 9.3." />} />
            <Route path="/transactions" element={<PlaceholderPage title="Transactions" description="Transaction search and fund-flow details will be implemented in Step 9.5." />} />
            <Route path="/reports" element={<PlaceholderPage title="Reports" description="Risk, alert, rule and country reports will be visualized in Step 9.8." />} />
            <Route path="/watchlisted-accounts" element={<PlaceholderPage title="Watchlisted accounts" description="Account-watchlist visibility and administration will be implemented with the Admin tools." />} />
          </Route>
          <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin/rules" element={<PlaceholderPage title="Rule management" description="Rule configuration will be implemented in Step 9.7." />} />
            <Route path="/admin/audit" element={<PlaceholderPage title="Audit history" description="Immutable audit exploration will be implemented in Step 9.8." />} />
          </Route>
        </Route>
      </Route>
      <Route path="/not-found" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  );
}
