import { useEffect, useMemo, useState } from "react";
import { fetchFailureLogs } from "../../services/dashboardService";
import { getSession } from "../../services/authService";

const THEME_KEY = "jj_theme";

function Topbar() {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "light");
  const [now, setNow] = useState(new Date());
  const session = getSession();

  useEffect(() => {
    let isMounted = true;

    fetchFailureLogs()
      .then((rows) => {
        if (isMounted && Array.isArray(rows)) {
          setNotifications(rows);
        }
      })
      .catch(() => {
        if (isMounted) {
          setNotifications([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const initials = useMemo(() => {
    const label = session?.username || "Admin";
    return label
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((chunk) => chunk[0].toUpperCase())
      .join("");
  }, [session]);

  const currentTime = useMemo(
    () => now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    [now]
  );

  const currentDate = useMemo(
    () => now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }),
    [now]
  );

  const notificationCount = notifications.length;
  const visibleNotifications = notifications.slice(0, 6);
  const workspaceLabel = session?.role === "INVESTIGATOR" ? "Investigator Workspace" : "Admin Workspace";

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const formatMessage = (item) => {
    if (!item?.details) {
      return "Validation event captured";
    }

    const compact = item.details
      .replace("code=", "")
      .replace(", message=", " - ")
      .replace("TRANSACTION_VALIDATION_FAILED", "Validation Failed");
    return compact;
  };

  return (
    <header className="topbar card">
      <div className="topbar-left">
        <p className="mini-title">{workspaceLabel}</p>
        <p className="topbar-clock">{currentDate} • {currentTime}</p>
      </div>

      <div className="topbar-actions">
        <button
          type="button"
          className="icon-btn"
          title={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
          onClick={toggleTheme}
        >
          <span className="theme-icon" aria-hidden="true">{theme === "light" ? "🌙" : "☀️"}</span>
        </button>

        <div className="panel-wrap">
          <button
            type="button"
            className={`icon-btn ${notificationCount > 0 ? "has-alert" : ""}`}
            title="Notifications"
            onClick={() => {
              setShowProfile(false);
              setShowNotifications((prev) => !prev);
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="bell-icon">
              <path d="M12 2a6 6 0 0 0-6 6v3.56c0 .75-.2 1.48-.59 2.12L4 16h16l-1.41-2.32a4 4 0 0 1-.59-2.12V8a6 6 0 0 0-6-6Zm0 20a3 3 0 0 0 2.82-2H9.18A3 3 0 0 0 12 22Z" />
            </svg>
            {notificationCount > 0 ? <span className="badge">{notificationCount > 99 ? "99+" : notificationCount}</span> : null}
          </button>

          {showNotifications ? (
            <div className="panel notifications-panel">
              <div className="panel-head">
                <h4>Notifications</h4>
                <span>{notificationCount} total</span>
              </div>
              <ul>
                {visibleNotifications.length === 0 ? (
                  <li className="empty-row">No notifications yet.</li>
                ) : (
                  visibleNotifications.map((item, index) => (
                    <li key={`${item.entityId}-${item.createdAt}-${index}`}>
                      <p>{formatMessage(item)}</p>
                      <small>{item.entityId} • {new Date(item.createdAt).toLocaleString()}</small>
                    </li>
                  ))
                )}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="panel-wrap">
          <button
            type="button"
            className="avatar"
            title={session?.username || "Admin"}
            onClick={() => {
              setShowNotifications(false);
              setShowProfile((prev) => !prev);
            }}
          >
            {initials}
          </button>

          {showProfile ? (
            <div className="panel profile-panel">
              <h4>{session?.username || "System Admin"}</h4>
              <p>{session?.role || "ADMIN"}</p>
              <small>Signed in</small>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
