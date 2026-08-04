import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { UserRole } from "./authTypes";

export function RoleRoute({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const { user } = useAuth();
  return user && allowedRoles.includes(user.role)
    ? <Outlet />
    : <Navigate to="/unauthorized" replace />;
}
