import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
// Wrap any route that requires authentication.
// Unauthenticated users are redirected to /login.
// ─────────────────────────────────────────────────────────────────────────────
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, hasRole } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!hasRole(allowedRoles)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
