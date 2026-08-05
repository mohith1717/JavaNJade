import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./auth/ProtectedRoute";
import { RoleRoute } from "./auth/RoleRoute";
import { RoleLanding } from "./auth/RoleLanding";
import { AppShell } from "./components/layout/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { WelcomePage } from "./pages/WelcomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { AlertQueuePage } from "./pages/AlertQueuePage";
import { AlertInvestigationPage } from "./pages/AlertInvestigationPage";
import { TransactionDetailPage } from "./pages/TransactionDetailPage";
import { TransactionListPage } from "./pages/TransactionListPage";
import { DashboardPage } from "./pages/DashboardPage";
import { RuleDetailPage } from "./pages/RuleDetailPage";
import { RuleListPage } from "./pages/RuleListPage";
import { AuditDetailPage } from "./pages/AuditDetailPage";
import { AuditListPage } from "./pages/AuditListPage";
import { ReportsPage } from "./pages/ReportsPage";
import { UserDetailPage } from "./pages/UserDetailPage";
import { UserListPage } from "./pages/UserListPage";
import { WatchlistedAccountsPage } from "./pages/WatchlistedAccountsPage";

export function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<RoleLanding />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route element={<AppShell />}>
          <Route element={<RoleRoute allowedRoles={["FRAUD_ANALYST", "RISK_ANALYST", "ADMIN"]} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/alerts" element={<AlertQueuePage />} />
            <Route path="/alerts/:alertId" element={<AlertInvestigationPage />} />
            <Route path="/transactions/:transactionId" element={<TransactionDetailPage />} />
            <Route path="/transactions" element={<TransactionListPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/watchlisted-accounts" element={<WatchlistedAccountsPage />} />
          </Route>
          <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin/audit" element={<AuditListPage />} />
            <Route path="/admin/audit/:auditEventId" element={<AuditDetailPage />} />
            <Route path="/admin/rules/new" element={<RuleDetailPage />} />
            <Route path="/admin/users" element={<UserListPage />} />
            <Route path="/admin/users/new" element={<UserDetailPage />} />
            <Route path="/admin/users/:userId" element={<UserDetailPage />} />
          </Route>
          <Route element={<RoleRoute allowedRoles={["RISK_ANALYST", "ADMIN"]} />}>
            <Route path="/admin/rules" element={<RuleListPage />} />
            <Route path="/admin/rules/:ruleId" element={<RuleDetailPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="/not-found" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  );
}
