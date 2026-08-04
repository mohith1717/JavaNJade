import type { UserRole } from "../auth/authTypes";

export type ManagedUser = { id: string; username: string; email: string; displayName: string; role: UserRole; enabled: boolean; createdAt: string; updatedAt: string };
export type UserFilters = { role?: UserRole; enabled?: boolean; search?: string };
export type CreateUserPayload = { username: string; email: string; displayName: string; password: string; role: UserRole; enabled: boolean; reason: string };
