import { createTheme } from "@mui/material/styles";

// Design tokens
const NEON = {
  cyan:   "#00D4FF",
  purple: "#7B2FFF",
  green:  "#00FF88",
  pink:   "#FF3366",
  amber:  "#FFB800",
  orange: "#FF6B35",
};
const SIDEBAR = "#080D20";

const sharedTypography = {
  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
  h4: { fontWeight: 700, letterSpacing: "-0.5px" },
  h5: { fontWeight: 700, letterSpacing: "-0.3px" },
  h6: { fontWeight: 600 },
  subtitle1: { fontWeight: 500 },
  subtitle2: { fontWeight: 600 },
  body1: { fontSize: "0.875rem" },
  body2: { fontSize: "0.8125rem" },
  caption: { fontSize: "0.75rem", fontWeight: 500 },
  button: { fontWeight: 600, textTransform: "none", letterSpacing: "0.3px" },
};

const sharedShape = { borderRadius: 12 };

// Light theme
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary:    { main: "#1565C0", light: "#1976D2", dark: "#0D47A1", contrastText: "#fff" },
    secondary:  { main: "#0288D1", light: "#03A9F4", dark: "#01579B", contrastText: "#fff" },
    error:      { main: "#D32F2F" },
    warning:    { main: "#F57C00" },
    success:    { main: "#2E7D32" },
    background: { default: "#F0F4FA", paper: "#FFFFFF" },
    text:       { primary: "#0D1B2A", secondary: "#546E7A" },
    divider:    "rgba(0,0,0,0.08)",
    custom: {
      sidebar: SIDEBAR, sidebarText: "rgba(255,255,255,0.7)",
      sidebarActive: "#FFFFFF", sidebarHover: "rgba(255,255,255,0.08)",
      sidebarActiveBg: "rgba(255,255,255,0.12)", navbarBg: "#FFFFFF",
      neon: NEON,
      badge: {
        Critical: { bg: "#FFEBEE", color: "#C62828" },
        High:     { bg: "#FFF3E0", color: "#E65100" },
        Medium:   { bg: "#FFF8E1", color: "#F57C00" },
        Low:      { bg: "#E8F5E9", color: "#1B5E20" },
        APPROVED: { bg: "#E8F5E9", color: "#1B5E20" },
        FLAGGED:  { bg: "#FFF3E0", color: "#E65100" },
        BLOCKED:  { bg: "#FFEBEE", color: "#C62828" },
        REVIEW:   { bg: "#E3F2FD", color: "#0D47A1" },
      },
    },
  },
  typography: sharedTypography,
  shape: sharedShape,
  components: {
    MuiCard: { styleOverrides: { root: { borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08), 0 4px 20px rgba(0,0,0,0.04)", backgroundImage: "none" } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 8, paddingInline: 20 } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 6, fontWeight: 600, fontSize: "0.72rem" } } },
  },
});

// Dark neon theme
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary:    { main: NEON.cyan,   light: "#33DDFF", dark: "#0099BB", contrastText: "#000" },
    secondary:  { main: NEON.purple, light: "#9B5FFF", dark: "#5500CC", contrastText: "#fff" },
    error:      { main: NEON.pink,   light: "#FF6688" },
    warning:    { main: NEON.amber,  light: "#FFC933" },
    success:    { main: NEON.green,  light: "#33FF99" },
    background: { default: "#060B18", paper: "#0C1633" },
    text:       { primary: "#E8EDF5", secondary: "#7A90A8" },
    divider:    "rgba(0,212,255,0.1)",
    custom: {
      sidebar: SIDEBAR, sidebarText: "rgba(255,255,255,0.55)",
      sidebarActive: NEON.cyan, sidebarHover: "rgba(0,212,255,0.06)",
      sidebarActiveBg: "rgba(0,212,255,0.12)", navbarBg: "#0A1020",
      neon: NEON,
      badge: {
        Critical: { bg: "rgba(255,51,102,0.15)",  color: NEON.pink   },
        High:     { bg: "rgba(255,107,53,0.15)",  color: NEON.orange },
        Medium:   { bg: "rgba(255,184,0,0.15)",   color: NEON.amber  },
        Low:      { bg: "rgba(0,255,136,0.15)",   color: NEON.green  },
        APPROVED: { bg: "rgba(0,255,136,0.12)",   color: NEON.green  },
        FLAGGED:  { bg: "rgba(255,184,0,0.12)",   color: NEON.amber  },
        BLOCKED:  { bg: "rgba(255,51,102,0.12)",  color: NEON.pink   },
        REVIEW:   { bg: "rgba(0,212,255,0.12)",   color: NEON.cyan   },
      },
    },
  },
  typography: sharedTypography,
  shape: sharedShape,
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: "none",
          background: "linear-gradient(135deg, rgba(12,22,51,0.95) 0%, rgba(8,13,32,0.98) 100%)",
          border: "1px solid rgba(0,212,255,0.1)",
          backdropFilter: "blur(12px)",
          transition: "border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease",
          "&:hover": {
            borderColor: "rgba(0,212,255,0.35)",
            boxShadow: "0 0 24px rgba(0,212,255,0.12), 0 8px 32px rgba(0,0,0,0.4)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          background: "#0C1633",
          border: "1px solid rgba(0,212,255,0.08)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, paddingInline: 20 },
        containedPrimary: {
          background: "linear-gradient(135deg, #00D4FF, #0099DD)",
          color: "#000",
          boxShadow: "none",
          "&:hover": { boxShadow: "0 0 20px rgba(0,212,255,0.5)", background: "linear-gradient(135deg, #33DDFF, #00BBFF)" },
        },
      },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 6, fontWeight: 600, fontSize: "0.72rem" } } },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": { fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.8px", color: "rgba(0,212,255,0.7)", borderBottomColor: "rgba(0,212,255,0.15)" },
        },
      },
    },
    MuiTableCell: { styleOverrides: { root: { borderBottomColor: "rgba(0,212,255,0.06)" } } },
    MuiInputBase: { styleOverrides: { root: { fontSize: "0.875rem" } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,212,255,0.2)" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,212,255,0.5)" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#00D4FF" },
        },
      },
    },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: 4 } } },
  },
});
