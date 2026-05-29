import api from './axiosConfig';

export const fetchSiteSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

export const updateSiteSettings = async (payload) => {
  const response = await api.put('/settings', payload);
  return response.data;
};

export const uploadSiteLogo = async (file) => {
  const formData = new FormData();
  formData.append('logo', file);
  const response = await api.post('/settings/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getLogoUrl = (logoUrl) => {
  if (!logoUrl || typeof logoUrl !== 'string') return null;
  const trimmed = logoUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};
