import { Badge } from "./Badge";
export function PriorityBadge({ priority }: { priority: "HIGH" | "CRITICAL" }) { return <Badge tone={priority}>{priority} priority</Badge>; }
