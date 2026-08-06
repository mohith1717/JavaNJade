import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { currentUserRequest, loginRequest } from "../api/authApi";
import type { AuthUser } from "./authTypes";
import { clearAccessToken, getAccessToken, saveAccessToken } from "./tokenStorage";
import { tokenExpiresAt, tokenIsExpired } from "./jwtSession";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setInitializing] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setInitializing(false);
      return;
    }
    if (tokenIsExpired(token)) {
      clearAccessToken();
      setInitializing(false);
      return;
    }
    currentUserRequest()
      .then(setUser)
      .catch(() => {
        clearAccessToken();
        setUser(null);
      })
      .finally(() => setInitializing(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    const token = getAccessToken();
    const expiresAt = token ? tokenExpiresAt(token) : null;
    if (!expiresAt) return;
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      clearAccessToken(); setUser(null);
      window.location.assign("/login?session=expired");
      return;
    }
    const timer = window.setTimeout(() => {
      clearAccessToken(); setUser(null);
      window.location.assign("/login?session=expired");
    }, remaining);
    return () => window.clearTimeout(timer);
  }, [user]);

  const login = useCallback(async (usernameOrEmail: string, password: string) => {
    const response = await loginRequest(usernameOrEmail, password);
    saveAccessToken(response.accessToken);
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(() => {
    clearAccessToken();
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    isInitializing,
    login,
    logout,
  }), [user, isInitializing, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
