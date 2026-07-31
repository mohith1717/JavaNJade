import { useLocation } from "react-router-dom";
import {
  AppBar, Toolbar, Box, IconButton, Typography,
  Tooltip, Avatar, Badge,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuRoundedIcon          from "@mui/icons-material/MenuRounded";
import LightModeRoundedIcon     from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon      from "@mui/icons-material/DarkModeRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import ShieldRoundedIcon        from "@mui/icons-material/ShieldRounded";
import { useThemeMode }         from "../../context/ThemeContext";
import { useAuth }              from "../../context/AuthContext";
import { NAV_ITEMS, NAVBAR_HEIGHT } from "../../config/navConfig";

const ALL_PAGES = [
  { path: "/",             label: "Dashboard"       },
  { path: "/transactions", label: "Transactions"    },
  { path: "/alerts",       label: "Alerts"          },
  { path: "/rules",        label: "Rule Engine"     },
  { path: "/reports",      label: "Reports"         },
  { path: "/cases",        label: "Case Management" },
  { path: "/settings",     label: "Settings"        },
];

function usePageTitle() {
  const location = useLocation();
  const match = ALL_PAGES.find((p) =>
    p.path === "/" ? location.pathname === "/" : location.pathname.startsWith(p.path)
  );
  return match?.label ?? "Dashboard";
}

export default function Navbar({ onMenuClick }) {
  const theme    = useTheme();
  const isDark   = theme.palette.mode === "dark";
  const { mode, toggleTheme } = useThemeMode();
  const { user } = useAuth();
  const pageTitle = usePageTitle();
  const c         = theme.palette.custom;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: c.navbarBg,
        borderBottom: `1px solid ${theme.palette.divider}`,
        height: NAVBAR_HEIGHT,
        zIndex: (t) => t.zIndex.drawer - 1,
        backdropFilter: "blur(12px)",
        boxShadow: isDark ? "0 1px 20px rgba(0,0,0,0.4)" : "0 1px 8px rgba(0,0,0,0.06)",
      }}
    >
      <Toolbar sx={{ height: NAVBAR_HEIGHT, px: { xs: 2, md: 3 }, gap: 1.5 }}>

        {/* Hamburger */}
        <IconButton
          onClick={onMenuClick}
          sx={{
            color: "text.secondary",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            p: 0.75,
            "&:hover": { color: "primary.main", borderColor: "primary.main", bgcolor: isDark ? "rgba(0,212,255,0.06)" : "action.hover" },
          }}
        >
          <MenuRoundedIcon fontSize="small" />
        </IconButton>

        {/* Brand mark + page title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
          <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 1 }}>
            <ShieldRoundedIcon sx={{ color: "primary.main", fontSize: 20 }} />
            <Typography sx={{ color: "primary.main", fontWeight: 800, fontSize: "0.85rem", letterSpacing: "-0.2px" }}>
              JavaNJade
            </Typography>
            <Box sx={{ width: 1, height: 18, bgcolor: "divider", mx: 0.5 }} />
          </Box>
          <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 700, fontSize: "1rem" }}>
            {pageTitle}
          </Typography>
        </Box>

        {/* Right controls */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>

          {/* Theme toggle */}
          <Tooltip title={mode === "dark" ? "Switch to Light" : "Switch to Dark"}>
            <IconButton onClick={toggleTheme}
              sx={{
                color: "text.secondary", borderRadius: 2, p: 0.75,
                border: `1px solid ${theme.palette.divider}`,
                "&:hover": { color: "primary.main", borderColor: "primary.main" },
              }}
            >
              {mode === "dark"
                ? <LightModeRoundedIcon sx={{ fontSize: 18 }} />
                : <DarkModeRoundedIcon  sx={{ fontSize: 18 }} />
              }
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Alerts & Notifications">
            <IconButton sx={{ color: "text.secondary", borderRadius: 2, p: 0.75, border: `1px solid ${theme.palette.divider}`, "&:hover": { color: "primary.main", borderColor: "primary.main" } }}>
              <Badge badgeContent={8} color="error" sx={{ "& .MuiBadge-badge": { fontSize: "0.62rem", minWidth: 15, height: 15 } }}>
                <NotificationsRoundedIcon sx={{ fontSize: 18 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User avatar */}
          <Tooltip title={user?.name ?? "Admin"}>
            <Avatar
              sx={{
                width: 32, height: 32, ml: 0.5,
                background: isDark ? "linear-gradient(135deg, #00D4FF, #0077AA)" : "linear-gradient(135deg, #1565C0, #0288D1)",
                fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
                boxShadow: isDark ? "0 0 12px rgba(0,212,255,0.35)" : "none",
              }}
            >
              {user?.name?.slice(0, 2).toUpperCase() ?? "AD"}
            </Avatar>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
