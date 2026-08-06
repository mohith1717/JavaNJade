import { Badge } from "./Badge";
const toneFor = (status: string) => status === "OPEN" ? "medium" : status === "INVESTIGATING" || status === "ASSIGNED" ? "info" : status === "BLOCKED" ? "critical" : status === "APPROVED" || status === "CLOSED" ? "low" : "pending";
export function StatusBadge({ status }: { status: string }) { return <Badge tone={toneFor(status)}>{status.replaceAll("_", " ")}</Badge>; }
