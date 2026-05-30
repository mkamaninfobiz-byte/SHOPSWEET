import axios from 'axios';
import { API_URL } from '../config/env';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
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
        error: import.meta.env.PROD
          ? 'Cannot reach the server. Please try again in a moment.'
          : 'Cannot reach the server. Start the backend (npm run dev in /backend) and refresh.',
        message: error?.message || 'Network error',
      });
    }
    return Promise.reject(error.response.data || { error: error.message });
  }
);

export default api;
