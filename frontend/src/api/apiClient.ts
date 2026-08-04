import { clearAccessToken, getAccessToken } from "../auth/tokenStorage";
import { ApiError } from "./ApiError";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/$/, "");

type ApiErrorBody = {
  message?: string;
  fieldErrors?: Record<string, string>;
};

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  options: { skipAuthRedirect?: boolean } = {},
): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError("JadeGuard backend is unavailable. Check that it is running on port 8080.", 0);
  }

  const body = await readBody(response);
  if (!response.ok) {
    const errorBody = (body || {}) as ApiErrorBody;
    if (!options.skipAuthRedirect && response.status === 401) {
      clearAccessToken();
      window.location.assign("/login?session=expired");
    } else if (!options.skipAuthRedirect && response.status === 403) {
      window.location.assign("/unauthorized");
    }
    throw new ApiError(errorBody.message || `Request failed with status ${response.status}`, response.status, errorBody.fieldErrors);
  }
  return body as T;
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  try { return JSON.parse(text); } catch { return text; }
}
