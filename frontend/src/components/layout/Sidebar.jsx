import { useLocation, NavLink, useNavigate } from "react-router-dom";
import {
  Box, Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, Typography, Divider, Tooltip, Badge, Avatar, Stack,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ShieldRoundedIcon  from "@mui/icons-material/ShieldRounded";
import LogoutRoundedIcon  from "@mui/icons-material/LogoutRounded";
import HomeRoundedIcon    from "@mui/icons-material/HomeRounded";
import { NAV_ITEMS, SIDEBAR_WIDTH } from "../../config/navConfig";
import { useAuth } from "../../context/AuthContext";

// --- Single nav item ----------------------------------------------------------
function NavItem({ item, onClose }) {
  const location = useLocation();
  const theme    = useTheme();
  const c        = theme.palette.custom;
  const isDark   = theme.palette.mode === "dark";

  const isActive = location.pathname.startsWith(item.path);
  const Icon     = item.icon;

  return (
    <ListItemButton
      component={NavLink}
      to={item.path}
      onClick={onClose}
      sx={{
        mx: 1.5, mb: 0.5,
        borderRadius: "12px",
        minHeight: 50,
        px: 2,
        position: "relative",
        color: isActive ? c.sidebarActive : c.sidebarText,
        bgcolor: isActive
          ? isDark ? "rgba(0,212,255,0.1)" : "rgba(255,255,255,0.12)"
          : "transparent",
        border: isActive
          ? isDark ? "1px solid rgba(0,212,255,0.25)" : "1px solid rgba(255,255,255,0.2)"
          : "1px solid transparent",
        transition: "all 0.22s ease",
        "&:hover": {
          bgcolor: isDark ? "rgba(0,212,255,0.06)" : "rgba(255,255,255,0.08)",
          color: c.sidebarActive,
          border: isDark ? "1px solid rgba(0,212,255,0.18)" : "1px solid rgba(255,255,255,0.15)",
          boxShadow: isDark ? "0 0 12px rgba(0,212,255,0.1)" : "none",
          transform: "translateX(3px)",
        },
        // Neon left accent for active item
        "&::before": isActive ? {
          content: '""',
          position: "absolute", left: 0, top: "20%", bottom: "20%",
          width: 3, borderRadius: "0 3px 3px 0",
          bgcolor: isDark ? "#00D4FF" : "#FFFFFF",
          boxShadow: isDark ? "0 0 8px #00D4FF" : "none",
        } : {},
      }}
    >
      <ListItemIcon sx={{ minWidth: 38, color: "inherit" }}>
        {item.badge ? (
          <Badge badgeContent={item.badge} color="error"
            sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", minWidth: 16, height: 16 } }}
          >
            <Icon fontSize="small" />
          </Badge>
        ) : <Icon fontSize="small" />}
      </ListItemIcon>
      <ListItemText
        primary={item.label}
        primaryTypographyProps={{
          fontSize: "0.875rem",
          fontWeight: isActive ? 600 : 400,
          letterSpacing: isActive ? "0.2px" : "normal",
        }}
      />
      {isActive && (
        <Box sx={{
          width: 6, height: 6, borderRadius: "50%",
          bgcolor: isDark ? "#00D4FF" : "#FFFFFF",
          boxShadow: isDark ? "0 0 6px #00D4FF" : "none",
          flexShrink: 0,
        }} />
      )}
    </ListItemButton>
  );
}

// --- Sidebar ------------------------------------------------------------------
export default function Sidebar({ open, onClose }) {
  const theme    = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const c        = theme.palette.custom;
  const isDark   = theme.palette.mode === "dark";

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login", { replace: true });
  };

  const handleHome = () => {
    navigate("/");
    onClose();
  };

  const content = (
    <Box sx={{
      width: SIDEBAR_WIDTH,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      bgcolor: c.sidebar,
      backgroundImage: isDark
        ? "linear-gradient(180deg, #080D20 0%, #060B18 100%)"
        : "linear-gradient(180deg, #0D1B2A 0%, #080D20 100%)",
      overflowX: "hidden",
    }}>

      {/* -- Brand header -- */}
      <Box sx={{
        px: 2.5, py: 2.5,
        display: "flex", alignItems: "center", gap: 1.5,
        borderBottom: isDark ? "1px solid rgba(0,212,255,0.08)" : "1px solid rgba(255,255,255,0.07)",
      }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: 2.5, flexShrink: 0,
          background: "linear-gradient(135deg, #00D4FF, #0077AA)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: isDark ? "0 0 16px rgba(0,212,255,0.4)" : "none",
        }}>
          <ShieldRoundedIcon sx={{ color: "#fff", fontSize: 22 }} />
        </Box>
        <Box>
          <Typography sx={{ color: "#FFFFFF", fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.2 }}>
            JavaNJade
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.65rem", letterSpacing: "1px", textTransform: "uppercase" }}>
            Transaction Monitor
          </Typography>
        </Box>
      </Box>

      {/* -- Home shortcut -- */}
      <Box sx={{ px: 2.5, pt: 2 }}>
        <ListItemButton
          onClick={handleHome}
          sx={{
            borderRadius: "12px", px: 2, py: 1,
            color: "rgba(255,255,255,0.55)",
            border: "1px solid transparent",
            transition: "all 0.2s",
            "&:hover": { bgcolor: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>
            <HomeRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Dashboard" primaryTypographyProps={{ fontSize: "0.875rem" }} />
        </ListItemButton>
      </Box>

      {/* -- Nav section label -- */}
      <Typography sx={{
        px: 3, pt: 2, pb: 0.75,
        fontSize: "0.65rem", fontWeight: 700, letterSpacing: "1.2px",
        textTransform: "uppercase", color: "rgba(255,255,255,0.25)",
      }}>
        Navigation
      </Typography>

      {/* -- Nav items -- */}
      <List sx={{ flex: 1, pt: 0.5, pb: 0 }}>
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.path} item={item} onClose={onClose} />
        ))}
      </List>

      {/* -- User section -- */}
      <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.06)", p: 2 }}>
        <Box sx={{
          display: "flex", alignItems: "center", gap: 1.5,
          p: 1.5, borderRadius: 2,
          bgcolor: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          mb: 1,
        }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: "0.8rem", fontWeight: 700 }}>
            {user?.name?.slice(0, 2).toUpperCase() ?? "AD"}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: "#E8EDF5", fontWeight: 600, display: "block", lineHeight: 1.3 }}>
              {user?.name ?? "Admin"}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.68rem", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email ?? "admin@javanjade.com"}
            </Typography>
          </Box>
        </Box>

        <ListItemButton onClick={handleLogout}
          sx={{
            borderRadius: 2, px: 2, py: 1, color: "rgba(255,100,100,0.7)",
            border: "1px solid transparent", transition: "all 0.2s",
            "&:hover": { bgcolor: "rgba(255,51,102,0.08)", color: "#FF3366", border: "1px solid rgba(255,51,102,0.2)" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: 500 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{ sx: { border: "none", boxShadow: isDark ? "4px 0 40px rgba(0,212,255,0.08)" : "4px 0 24px rgba(0,0,0,0.3)" } }}
    >
      {content}
    </Drawer>
  );
}
