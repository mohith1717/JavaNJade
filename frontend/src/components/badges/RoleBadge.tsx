import type { UserRole } from "../../auth/authTypes";
import { Badge } from "./Badge";
export function RoleBadge({ role }: { role: UserRole }) { return <Badge tone="role">{role.replace("_", " ")}</Badge>; }
