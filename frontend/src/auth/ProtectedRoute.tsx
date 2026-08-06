import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();
  if (isInitializing) return <FullPageLoader />;
  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

function FullPageLoader() {
  return <main className="status-page"><span className="spinner" /><p>Verifying secure session…</p></main>;
}
