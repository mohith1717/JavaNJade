import { apiRequest } from "./apiClient";
import type { AuthUser, LoginResponse } from "../auth/authTypes";

export function loginRequest(usernameOrEmail: string, password: string) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ usernameOrEmail, password }),
  }, { skipAuthRedirect: true });
}

export function currentUserRequest() {
  return apiRequest<AuthUser>("/auth/me");
}
