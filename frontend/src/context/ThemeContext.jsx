import { createContext, useContext, useMemo, useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from '../theme/theme';

// ─── Context ─────────────────────────────────────────────────────────────────
const ThemeModeContext = createContext({
  mode: 'light',
  toggleTheme: () => {},
});

// ─── Hook ────────────────────────────────────────────────────────────────────
// eslint-disable-next-line react-refresh/only-export-components
export const useThemeMode = () => useContext(ThemeModeContext);

// ─── Provider ────────────────────────────────────────────────────────────────
export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    // Hydrate from localStorage; fall back to 'light'
    return localStorage.getItem('themeMode') ?? 'light';
  });

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', next);
      return next;
    });
  };

  const contextValue = useMemo(() => ({ mode, toggleTheme }), [mode]);

  const muiTheme = mode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <ThemeProvider theme={muiTheme}>
        {/* CssBaseline resets browser defaults and applies theme background */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
