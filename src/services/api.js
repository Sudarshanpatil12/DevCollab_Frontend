import axios from 'axios';

const envApiBase =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  '';

// Trim trailing slashes so '/api/*' joins correctly.
const API_BASE = envApiBase
  ? envApiBase.replace(/\/+$/, '')
  : (typeof window !== 'undefined' ? window.location.origin : '');

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

export default api;
