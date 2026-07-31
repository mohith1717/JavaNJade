import { BrowserRouter } from "react-router-dom";
import { ThemeModeProvider } from "./context/ThemeContext";
import { AuthProvider }      from "./context/AuthContext";
import AppRoutes             from "./routes/AppRoutes";

// Provider order:
//   BrowserRouter       -> routing context
//   AuthProvider        -> user / login / logout state
//   ThemeModeProvider   -> MUI ThemeProvider + CssBaseline + mode toggle
//   AppRoutes           -> route tree
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeModeProvider>
          <AppRoutes />
        </ThemeModeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
