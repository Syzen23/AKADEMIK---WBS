import axios from 'axios';

let resolvedBaseUrl = import.meta.env.VITE_API_URL || '/api';
if (
  resolvedBaseUrl.startsWith('http') &&
  !resolvedBaseUrl.endsWith('/api') &&
  !resolvedBaseUrl.endsWith('/api/')
) {
  resolvedBaseUrl = `${resolvedBaseUrl.replace(/\/$/, '')}/api`;
}

const api = axios.create({
  baseURL: resolvedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for unified error formatting
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.msg ||
      error.message ||
      'Terjadi kesalahan pada sistem.';
    return Promise.reject(new Error(message));
  }
);

export default api;
