export type AppRole = 'ADMIN' | 'FRAUD_ANALYST' | 'RISK_ANALYST';

export const ROLES: Record<Uppercase<AppRole>, AppRole> = {
  ADMIN: 'ADMIN',
  FRAUD_ANALYST: 'FRAUD_ANALYST',
  RISK_ANALYST: 'RISK_ANALYST',
};

export const ROLE_LABELS: Record<AppRole, string> = {
  [ROLES.ADMIN]: 'System Admin',
  [ROLES.FRAUD_ANALYST]: 'Fraud Analyst',
  [ROLES.RISK_ANALYST]: 'Risk Analyst',
};
