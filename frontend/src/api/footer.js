import api from './axiosConfig';

export const fetchFooterSettings = async () => {
  const response = await api.get('/footer');
  return response.data;
};

export const updateFooterSettings = async (payload) => {
  const response = await api.put('/footer', payload);
  return response.data;
};
