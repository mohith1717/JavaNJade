import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
// Wrap any route that requires authentication.
// Unauthenticated users are redirected to /login.
// ─────────────────────────────────────────────────────────────────────────────
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
