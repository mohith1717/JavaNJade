import axios from 'axios';

// ─── Axios base instance ──────────────────────────────────────────────────────
// Every service imports this instance — never raw axios.
// To point at a different backend URL: change VITE_API_BASE_URL in .env only.
// ─────────────────────────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — attach auth token when available ───────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — normalise errors ───────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Surface the backend ApiErrorResponse body if present
    const serverMessage = error.response?.data?.message;
    if (serverMessage) error.message = serverMessage;
    return Promise.reject(error);
  }
);

export default apiClient;
