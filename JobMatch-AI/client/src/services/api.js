import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Authorization Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle HTML fallback and 401 Unauthorized globally
api.interceptors.response.use(
  (response) => {
    // If the API endpoint returned an HTML document (e.g. Vercel SPA rewrite fallback), reject so client fallbacks engage
    if (
      typeof response.data === 'string' &&
      (response.data.trim().startsWith('<!doctype') || response.data.trim().startsWith('<html'))
    ) {
      const err = new Error('HTML document received from API endpoint');
      err.isHtmlFallback = true;
      return Promise.reject(err);
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to /login if not already on the login/signup page
      if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { api };
