import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { currentUserRequest, loginRequest } from "../api/authApi";
import type { AuthUser } from "./authTypes";
import { clearAccessToken, getAccessToken, saveAccessToken } from "./tokenStorage";

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
    if (!getAccessToken()) {
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
