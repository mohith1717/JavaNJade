import { createContext, useContext, useMemo, useState, useCallback } from 'react';

// ─── Auth Context ─────────────────────────────────────────────────────────────
// Stores the authenticated user and exposes login / logout actions.
// Components call useAuth() — never inspect localStorage directly.
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

// ── Helper — hydrate from localStorage ───────────────────────────────────────
function getStoredUser() {
  try {
    const raw = localStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  const login = useCallback((userData) => {
    localStorage.setItem('authUser', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout, isAuthenticated: !!user }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
