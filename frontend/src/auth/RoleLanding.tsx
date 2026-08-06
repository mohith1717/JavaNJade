import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { landingFor } from "./rolePaths";

export function RoleLanding() {
  const { user } = useAuth();
  return user ? <Navigate to={landingFor(user.role)} replace /> : null;
}
