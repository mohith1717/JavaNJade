import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { NAVBAR_HEIGHT } from "../config/navConfig";
import Sidebar from "../components/layout/Sidebar";
import Navbar  from "../components/layout/Navbar";
import CommandPalette from "../components/common/CommandPalette";
import NotificationCenter from "../components/common/NotificationCenter";
import KeyboardShortcutsDialog from "../components/common/KeyboardShortcutsDialog";

// AppLayout: Sidebar is a temporary overlay drawer.
// Opens via Navbar hamburger, auto-closes when any nav item is clicked.
export default function AppLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (event.shiftKey && event.key === "?") {
        event.preventDefault();
        setShortcutsOpen(true);
      }
      if (event.key === "Escape") {
        setCommandPaletteOpen(false);
        setShortcutsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
      <NotificationCenter
        open={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
      />
      <KeyboardShortcutsDialog
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      <Box component="div" sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          onCommandPaletteOpen={() => setCommandPaletteOpen(true)}
          onNotificationCenterOpen={() => setNotificationCenterOpen(true)}
          onShortcutsOpen={() => setShortcutsOpen(true)}
        />

        <Box
          component="main"
          sx={{
            flex: 1,
            mt: `${NAVBAR_HEIGHT}px`,
            p: { xs: 2, sm: 3 },
            bgcolor: "background.default",
            minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
}
