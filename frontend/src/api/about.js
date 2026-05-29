import api from './axiosConfig';
import { normalizeAboutContent } from '../utils/aboutContent';

export const fetchAboutContent = async () => {
  try {
    const response = await api.get('/about');
    return normalizeAboutContent(response.data);
  } catch (error) {
    const apiError = error.response?.data;
    if (apiError?.error) {
      throw new Error(apiError.error);
    }
    throw new Error(error.message || 'Failed to fetch about content');
  }
};

export const updateAboutContent = async (updates, token) => {
  try {
    const response = await api.put('/about', updates);
    return normalizeAboutContent(response.data);
  } catch (error) {
    throw error.response?.data || { error: 'Failed to update about content' };
  }
};

export const updateAboutCoreValues = async (coreValues, token) => {
  try {
    // backend expects an array; accept single-object form and wrap if necessary
    const payload = Array.isArray(coreValues) ? coreValues : [coreValues];
    const response = await api.put('/about/values', { coreValues: payload });
    return normalizeAboutContent(response.data);
  } catch (error) {
    throw error.response?.data || { error: 'Failed to update core values' };
  }
};

export const updateAboutWhyChoose = async (whyChoose, token) => {
  try {
    // backend expects an array; accept single-object form and wrap if necessary
    const payload = Array.isArray(whyChoose) ? whyChoose : [whyChoose];
    const response = await api.put('/about/why-choose', { whyChoose: payload });
    return normalizeAboutContent(response.data);
  } catch (error) {
    throw error.response?.data || { error: 'Failed to update why choose' };
  }
};

export const updateAboutTeam = async (team, token) => {
  try {
    const response = await api.put('/about/team', { team });
    return normalizeAboutContent(response.data);
  } catch (error) {
    throw error.response?.data || { error: 'Failed to update team' };
  }
};

export const uploadTeamPhoto = async (file) => {
  try {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await api.post('/about/team/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error || { error: 'Failed to upload team photo' };
  }
};

export const updateAboutStats = async (stats) => {
  try {
    const payload = Array.isArray(stats) ? stats : [];
    const response = await api.put('/about/stats', { stats: payload });
    return normalizeAboutContent(response.data);
  } catch (error) {
    throw error.response?.data || { error: 'Failed to update stats' };
  }
};
