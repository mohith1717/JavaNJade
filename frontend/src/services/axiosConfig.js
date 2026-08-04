import axios from 'axios';

// ─── Axios base instance ──────────────────────────────────────────────────────
// Every service imports this instance — never raw axios.
// To point at a different backend URL: change VITE_API_BASE_URL in .env only.
// ─────────────────────────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
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
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;

    if (serverMessage) {
      error.message = serverMessage;
    } else if (error.code === 'ECONNABORTED') {
      error.message = 'Request timed out. Please try again.';
    } else if (!error.response) {
      error.message = 'Network error. Unable to reach backend service.';
    } else if (status === 401) {
      error.message = 'Unauthorized request. Please sign in again.';
    } else if (status === 403) {
      error.message = 'You do not have permission to perform this action.';
    } else if (status === 404) {
      error.message = 'Requested resource was not found.';
    } else if (status >= 500) {
      error.message = 'Backend service error. Please try again later.';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
