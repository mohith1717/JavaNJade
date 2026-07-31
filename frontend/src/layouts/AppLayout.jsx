import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import { NAVBAR_HEIGHT } from "../config/navConfig";
import Sidebar from "../components/layout/Sidebar";
import Navbar  from "../components/layout/Navbar";

// AppLayout: Sidebar is a temporary overlay drawer.
// Opens via Navbar hamburger, auto-closes when any nav item is clicked.
export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Box component="div" sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

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
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
