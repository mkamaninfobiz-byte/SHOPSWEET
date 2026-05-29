import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shopsweet_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error?.response) {
      return Promise.reject({
        error: 'Cannot reach the server. Start the backend (npm run dev in /backend) and refresh.',
        message: error?.message || 'Network error',
      });
    }
    return Promise.reject(error.response.data || { error: error.message });
  }
);

export default api;
