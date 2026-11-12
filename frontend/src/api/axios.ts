import axios from 'axios';

const API_ORIGIN = 'https://localhost:7209';

const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
});

/** Transformă o cale de pe server (ex: /uploads/products/x.jpg) într-o adresă completă */
export function assetUrl(path: string): string {
  return `${API_ORIGIN}${path}`;
}

// Request interceptor: attach Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: 401 with existing token → clear session and redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
