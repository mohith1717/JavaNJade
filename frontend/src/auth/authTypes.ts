export type UserRole = "FRAUD_ANALYST" | "RISK_ANALYST" | "ADMIN";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: UserRole;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: AuthUser;
};
