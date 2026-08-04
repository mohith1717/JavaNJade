import type { RiskLevel } from "../components/badges/RiskBadge";

export type Transaction = {
  id: string;
  externalTransactionId: string;
  senderAccountId: string;
  receiverAccountId: string;
  amount: number;
  currency: string;
  occurredAt: string;
  processingStatus: string;
  riskScore: number | null;
  riskLevel: RiskLevel;
  createdAt: string;
};

export type RuleEvaluation = {
  evaluationId: string;
  ruleId: string;
  ruleCode: string;
  ruleName: string;
  ruleType: string;
  triggered: boolean;
  scoreContribution: number;
  explanation: string;
  evaluatedAt: string;
};

export type RiskAssessment = {
  transactionId: string;
  processingStatus: string;
  riskScore: number;
  riskLevel: RiskLevel;
  evaluations: RuleEvaluation[];
  assessedAt: string;
};

export type FundFlowHop = {
  id: string;
  sequence: number;
  hopType: "ORIGIN" | "INTERMEDIARY" | "DESTINATION";
  countryCode: string;
  countryName: string;
  institution: string | null;
};

export type FundFlow = {
  transactionId: string;
  externalTransactionId: string;
  amount: number;
  currency: string;
  processingStatus: string;
  riskScore: number;
  riskLevel: RiskLevel;
  originCountry: { countryCode: string; countryName: string };
  destinationCountry: { countryCode: string; countryName: string };
  totalHops: number;
  route: FundFlowHop[];
};
