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
    const raw = localStorage.getItem('authUser')
      ?? sessionStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  const login = useCallback((userData, persist = true) => {
    const store = persist ? localStorage : sessionStorage;
    const otherStore = persist ? sessionStorage : localStorage;
    otherStore.removeItem('authUser');
    store.setItem('authUser', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authUser');
    sessionStorage.removeItem('authToken');
    setUser(null);
  }, []);

  const hasRole = useCallback((roles) => {
    if (!Array.isArray(roles) || roles.length === 0) return true;
    if (!user?.role) return false;
    return roles.includes(user.role);
  }, [user]);

  const value = useMemo(
    () => ({ user, login, logout, isAuthenticated: !!user, hasRole }),
    [user, login, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
