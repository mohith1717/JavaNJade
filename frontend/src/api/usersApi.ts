import type { UserRole } from "../auth/authTypes";
import type { CreateUserPayload, ManagedUser, UserFilters } from "../types/user";
import { apiRequest } from "./apiClient";

export function getUsers(filters: UserFilters = {}, signal?: AbortSignal) { const params = new URLSearchParams(); Object.entries(filters).forEach(([key, value]) => { if (value !== undefined && value !== "") params.set(key, String(value)); }); return apiRequest<ManagedUser[]>(`/users${params.size ? `?${params}` : ""}`, { signal }); }
export const getUser = (id: string, signal?: AbortSignal) => apiRequest<ManagedUser>(`/users/${encodeURIComponent(id)}`, { signal });
export const createUser = (payload: CreateUserPayload) => apiRequest<ManagedUser>("/users", { method: "POST", body: JSON.stringify(payload) });
export const updateUser = (id: string, payload: { username: string; email: string; displayName: string; reason: string }) => apiRequest<ManagedUser>(`/users/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) });
export const updateUserStatus = (id: string, enabled: boolean, reason: string) => apiRequest<ManagedUser>(`/users/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ enabled, reason }) });
export const updateUserRole = (id: string, role: UserRole, reason: string) => apiRequest<ManagedUser>(`/users/${encodeURIComponent(id)}/role`, { method: "PATCH", body: JSON.stringify({ role, reason }) });
export const resetUserPassword = (id: string, newPassword: string, reason: string) => apiRequest<ManagedUser>(`/users/${encodeURIComponent(id)}/password`, { method: "PATCH", body: JSON.stringify({ newPassword, reason }) });
