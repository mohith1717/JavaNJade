import { useState } from "react";
import { initialTheme, saveTheme, type Theme } from "../../theme/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => initialTheme());
  const nextTheme = theme === "dark" ? "light" : "dark";

  function toggle() {
    setTheme(nextTheme);
    saveTheme(nextTheme);
  }

  return (
    <button className="theme-toggle" type="button" onClick={toggle} aria-label={`Switch to ${nextTheme} mode`} title={`Switch to ${nextTheme} mode`}>
      <span className="theme-toggle-track" aria-hidden="true">
        <i>{theme === "dark" ? "☾" : "☀"}</i>
      </span>
      <span className="theme-toggle-label">{theme === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}
