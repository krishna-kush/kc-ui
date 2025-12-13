import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log('[API] Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Set Content-Type to JSON by default, unless it's FormData
    if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    console.log('[API] Request:', config.method?.toUpperCase(), config.url, config.data);
    console.log('[API] Auth header:', config.headers.Authorization);
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for better error logging and auto-logout on 401
api.interceptors.response.use(
  (response) => {
    console.log('[API] Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('[API] Error Response:', error.response.status, error.response.data);
      
      const status = error.response.status;
      const message: string | undefined =
        (typeof error.response.data === 'string'
          ? error.response.data
          : error.response.data?.error) || undefined;

      // Auto-logout on 401 Unauthorized (token expired or invalid)
      // Also handle explicit user-not-found-ish errors by redirecting to auth
      if (
        status === 401 ||
        status === 403 ||
        status === 404 && message && /user not found/i.test(message)
      ) {
        const token = localStorage.getItem("token");
        if (token) {
          console.warn('[API] Token expired or invalid. Logging out...');
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          
          // Redirect to login page
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
            const reason = status === 404 ? 'user_not_found' : 'expired';
            window.location.href = `/auth?reason=${reason}`;
          }
        }
      }
    } else if (error.request) {
      console.error('[API] No Response:', error.request);
    } else {
      console.error('[API] Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Helper to get auth headers for fetch requests
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};
