import { Navigate, createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import DashboardLayout from "../components/layout/DashboardLayout";
import LoginPage from "../pages/auth/LoginPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import RuleEnginePage from "../pages/admin/RuleEnginePage";
import CaseManagementPage from "../pages/admin/CaseManagementPage";
import TransactionsPage from "../pages/admin/TransactionsPage";
import InvestigatorDashboardPage from "../pages/investigator/InvestigatorDashboardPage";
import AlertDetailPage from "../pages/shared/AlertDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "", element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <AdminDashboardPage /> },
      { path: "rule-engine", element: <RuleEnginePage /> },
      { path: "cases", element: <CaseManagementPage /> },
      { path: "alerts", element: <Navigate to="/admin/cases" replace /> },
      { path: "alerts/:alertId", element: <AlertDetailPage /> },
      { path: "transactions", element: <TransactionsPage /> },
    ],
  },
  {
    path: "/investigator",
    element: (
      <ProtectedRoute allowedRoles={["INVESTIGATOR"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "", element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <InvestigatorDashboardPage /> },
      { path: "alerts/:alertId", element: <AlertDetailPage /> },
    ],
  },
]);
