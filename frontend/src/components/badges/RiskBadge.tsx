import { Badge } from "./Badge";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "PENDING";
export function RiskBadge({ level }: { level: RiskLevel }) { return <Badge tone={level}>{level}</Badge>; }
