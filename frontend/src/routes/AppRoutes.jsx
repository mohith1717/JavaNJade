import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout          from "../layouts/AppLayout";
import ProtectedRoute     from "../components/common/ProtectedRoute";
import Login              from "../pages/auth/Login";
import AdminDashboard     from "../pages/admin/AdminDashboard";
import Transactions       from "../pages/Transactions";
import TransactionDetails from "../pages/TransactionDetails";
import Alerts             from "../pages/Alerts";
import CaseManagement     from "../pages/CaseManagement";
import RuleEngine         from "../pages/RuleEngine";
import Reports            from "../pages/Reports";
import Analytics          from "../pages/Analytics";
import Settings           from "../pages/Settings";

// --- AppRoutes ----------------------------------------------------------------
// Public routes: /login
// Protected routes: everything else, nested under AppLayout shell
// -----------------------------------------------------------------------------
export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected shell */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index                   element={<AdminDashboard />}     />
        <Route path="transactions"     element={<Transactions />}       />
        <Route path="transactions/:id" element={<TransactionDetails />} />
        <Route path="alerts"           element={<Alerts />}             />
        <Route path="cases"            element={<CaseManagement />}     />
        <Route path="rules"            element={<RuleEngine />}         />
        <Route path="reports"          element={<Reports />}            />
        <Route path="analytics"        element={<Analytics />}          />
        <Route path="settings"         element={<Settings />}           />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
