import axios from 'axios';

const BACKEND_FALLBACK = 'https://dev-collab-backend-two.vercel.app';

const envApiBase =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  '';

const isPlaceholderUrl = /backend-url\.vercel\.app/i.test(envApiBase);
const isLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

const resolvedBase = envApiBase && !isPlaceholderUrl
  ? envApiBase
  : (isLocalhost
      ? (typeof window !== 'undefined' ? window.location.origin : '')
      : BACKEND_FALLBACK);

// Trim trailing slashes so '/api/*' joins correctly.
const API_BASE = resolvedBase.replace(/\/+$/, '');

if (isPlaceholderUrl) {
  console.warn('Ignoring placeholder backend URL. Set VITE_API_URL to your real backend URL.');
}

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});
 
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('devcollab_token');
    if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  } catch {
    // ignore (e.g., during SSR)
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('devcollab_token');
      localStorage.removeItem('devcollab_user');
      window.dispatchEvent(new Event('storage'));
    }
    return Promise.reject(err);
  }
);

export const auth = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
};

export const projects = {
  list: () => api.get('/api/projects'),
  get: (id) => api.get(`/api/projects/${id}`),
  create: (data) => api.post('/api/projects', data),
  update: (id, data) => api.put(`/api/projects/${id}`, data),
  delete: (id) => api.delete(`/api/projects/${id}`),
  addMember: (id, email) => api.post(`/api/projects/${id}/members`, { email }),
};

export const tasks = {
  byProject: (projectId) => api.get(`/api/tasks/project/${projectId}`),
  create: (data) => api.post('/api/tasks', data),
  update: (id, data) => api.put(`/api/tasks/${id}`, data),
  delete: (id) => api.delete(`/api/tasks/${id}`),
};

export const messages = {
  byProject: (projectId) => api.get(`/api/messages/project/${projectId}`),
  create: (projectId, message) => api.post(`/api/messages/project/${projectId}`, { message }),
};

export function getApiErrorMessage(err, fallbackMessage) {
  const payload = err?.response?.data;
  const value = payload?.error ?? payload?.message;
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && typeof value.message === 'string') return value.message;
  if (typeof err?.message === 'string' && err.message) return err.message;
  return fallbackMessage;
}

export default api;
