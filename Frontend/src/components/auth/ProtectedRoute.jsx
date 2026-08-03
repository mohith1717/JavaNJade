import { Navigate } from "react-router-dom";
import { hasRole, isAuthenticated } from "../../services/authService";

function ProtectedRoute({ children, allowedRoles }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
