import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('autofix_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatically invalidate expired or revoked sessions and prompt re-authentication
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('autofix_token');
      localStorage.removeItem('autofix_user');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default api;
