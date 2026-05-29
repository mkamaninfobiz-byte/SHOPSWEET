import api from './axiosConfig';

export const login = async ({ email, password }) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('shopsweet_token', response.data.token);
  }
  return response.data;
};

export const register = async (payload) => {
  const response = await api.post('/auth/register', payload);
  if (response.data.token) {
    localStorage.setItem('shopsweet_token', response.data.token);
  }
  return response.data;
};

export const fetchProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfile = async (payload) => {
  const response = await api.put('/auth/profile', payload);
  if (response.data.token) {
    localStorage.setItem('shopsweet_token', response.data.token);
  }
  return response.data;
};
