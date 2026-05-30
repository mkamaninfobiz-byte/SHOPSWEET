import api from './axiosConfig';
import { resolveAssetUrl } from '../config/env';

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
  const response = await api.post('/settings/logo', formData);
  return response.data;
};

export const getLogoUrl = (logoUrl) => resolveAssetUrl(logoUrl);
