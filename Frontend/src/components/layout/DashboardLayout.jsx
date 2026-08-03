import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function DashboardLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content-shell">
        <Topbar />
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
