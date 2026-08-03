import { NavLink, useNavigate } from "react-router-dom";
import { getSession, logout } from "../../services/authService";

function Sidebar() {
  const navigate = useNavigate();
  const session = getSession();
  const isInvestigator = session?.role === "INVESTIGATOR";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div>
        <h1 className="brand">JavaNJade</h1>
        <p className="brand-tag">Fraud Monitor Console</p>
      </div>

      <nav className="menu">
        {isInvestigator ? (
          <>
            <NavLink to="/investigator/dashboard" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>Dashboard</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>Dashboard</NavLink>
            <NavLink to="/admin/rule-engine" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>Rule Engine</NavLink>
            <NavLink to="/admin/cases" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>Case Management</NavLink>
            <NavLink to="/admin/transactions" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>Transactions</NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="admin-pill">{isInvestigator ? "Investigator" : "Admin"}</div>
        <button type="button" className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  );
}

export default Sidebar;
