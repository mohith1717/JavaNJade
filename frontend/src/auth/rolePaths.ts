import type { UserRole } from "./authTypes";

export const ROLE_LANDING: Record<UserRole, string> = {
  FRAUD_ANALYST: "/alerts",
  RISK_ANALYST: "/dashboard",
  ADMIN: "/admin/rules",
};

export const landingFor = (role: UserRole) => ROLE_LANDING[role];
