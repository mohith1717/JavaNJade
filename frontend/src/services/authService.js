import apiClient from './axiosConfig';

// ─── Auth Service ─────────────────────────────────────────────────────────────
// Backend integration points are marked. Until the auth endpoint is live,
// a mock implementation with realistic delays is used.
// Switch by setting VITE_USE_MOCK_AUTH=false in .env once backend is ready.
// ─────────────────────────────────────────────────────────────────────────────

const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH !== 'false';

// ── Mock credentials (dev only) ───────────────────────────────────────────────
const MOCK_USERS = [
  { id: 1, username: 'admin',   password: 'admin123',   name: 'System Admin',    role: 'ADMIN',          email: 'admin@javanjade.com'   },
  { id: 2, username: 'analyst', password: 'analyst123', name: 'Fraud Analyst',   role: 'FRAUD_ANALYST',  email: 'analyst@javanjade.com' },
];
const MOCK_OTP = '123456';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ── login ─────────────────────────────────────────────────────────────────────
export const login = async (username, password) => {
  if (USE_MOCK) {
    await delay(800);
    const user = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );
    if (!user) throw new Error('Invalid username or password.');
    const { password: _pw, ...safeUser } = user;
    return { user: safeUser, token: `mock-token-${safeUser.id}` };
  }
  // Real: POST /api/auth/login
  const { data } = await apiClient.post('/api/auth/login', { username, password });
  return data; // { user, token }
};

// ── sendOtp ───────────────────────────────────────────────────────────────────
export const sendOtp = async (email) => {
  if (USE_MOCK) {
    await delay(600);
    const exists = MOCK_USERS.some((u) => u.email === email);
    if (!exists) throw new Error('No account found with that email address.');
    return { message: 'OTP sent successfully.' };
  }
  const { data } = await apiClient.post('/api/auth/forgot-password/send-otp', { email });
  return data;
};

// ── verifyOtp ─────────────────────────────────────────────────────────────────
export const verifyOtp = async (email, otp) => {
  if (USE_MOCK) {
    await delay(700);
    if (otp !== MOCK_OTP) throw new Error('Incorrect OTP. Please try again.');
    return { message: 'OTP verified. You may now reset your password.' };
  }
  const { data } = await apiClient.post('/api/auth/forgot-password/verify-otp', { email, otp });
  return data;
};

// ── logout ────────────────────────────────────────────────────────────────────
export const logoutApi = async () => {
  if (USE_MOCK) {
    await delay(200);
    return;
  }
  await apiClient.post('/api/auth/logout');
};
