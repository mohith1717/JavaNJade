import type { UserRole } from "../../auth/authTypes";

export type NavigationItem = {
  label: string;
  path: string;
  icon: string;
  roles: UserRole[];
};

const ALL: UserRole[] = ["FRAUD_ANALYST", "RISK_ANALYST", "ADMIN"];

export const NAVIGATION: NavigationItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: "grid", roles: ALL },
  { label: "Transactions", path: "/transactions", icon: "transfer", roles: ALL },
  { label: "Alert queue", path: "/alerts", icon: "alert", roles: ALL },
  { label: "Reports", path: "/reports", icon: "chart", roles: ALL },
  { label: "Watchlisted accounts", path: "/watchlisted-accounts", icon: "shield", roles: ALL },
  { label: "Rules", path: "/admin/rules", icon: "rules", roles: ["RISK_ANALYST", "ADMIN"] },
  { label: "Audit history", path: "/admin/audit", icon: "audit", roles: ["ADMIN"] },
];

export const navigationFor = (role: UserRole) => NAVIGATION.filter((item) => item.roles.includes(role));
