import { useEffect, useMemo, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeModeProvider } from "./context/ThemeContext";
import { AuthProvider }      from "./context/AuthContext";
import AppRoutes             from "./routes/AppRoutes";
import SplashScreen          from "./components/common/SplashScreen";

// Provider order:
//   BrowserRouter       -> routing context
//   AuthProvider        -> user / login / logout state
//   ThemeModeProvider   -> MUI ThemeProvider + CssBaseline + mode toggle
//   AppRoutes           -> route tree
export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }), []);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeModeProvider>
            <AppRoutes />
          </ThemeModeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
