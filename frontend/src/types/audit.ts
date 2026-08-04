export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export type AuditEvent = { id: string; actorId: string; actorUsername: string; action: string; entityType: string; entityId: string; previousValue: JsonValue; newValue: JsonValue; reason: string | null; details: JsonValue; occurredAt: string };
export type AuditEventPage = { content: AuditEvent[]; page: number; size: number; totalElements: number; totalPages: number };
export type AuditFilters = { actorId?: string; action?: string; entityType?: string; entityId?: string; page?: number; size?: number };
