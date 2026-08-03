const AUTH_KEY = "jj_admin_auth";

const DEMO_USERS = {
  admin: { password: "admin123", username: "System Admin", role: "ADMIN" },
  oliver: { password: "invest123", username: "oliver", role: "INVESTIGATOR" },
  maya: { password: "invest123", username: "maya", role: "INVESTIGATOR" },
  liam: { password: "invest123", username: "liam", role: "INVESTIGATOR" },
};

export function loginAsAdmin(username, password) {
  return loginWithCredentials(username, password);
}

export function loginWithCredentials(username, password) {
  const key = username.trim().toLowerCase();
  const user = DEMO_USERS[key];
  const isValid = Boolean(user) && user.password === password;
  if (!isValid) {
    return false;
  }

  localStorage.setItem(AUTH_KEY, JSON.stringify({
    username: user.username,
    role: user.role,
    loggedInAt: new Date().toISOString(),
  }));
  return true;
}

export function getSession() {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getSession());
}

export function hasRole(roles = []) {
  const session = getSession();
  if (!session?.role) {
    return false;
  }
  return roles.includes(session.role);
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}
