import api from './axiosConfig';

export const fetchDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export const searchDashboard = async (query) => {
  const response = await api.get('/dashboard/search', { params: { q: query } });
  return response.data;
};
