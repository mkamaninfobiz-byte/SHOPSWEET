import api from './axiosConfig';

export const fetchTestimonials = async () => {
  const response = await api.get('/testimonials');
  return response.data;
};

export const updateTestimonials = async (payload) => {
  const response = await api.put('/testimonials', payload);
  return response.data;
};

export const uploadTestimonialPhoto = async (file) => {
  const formData = new FormData();
  formData.append('photo', file);
  const response = await api.post('/testimonials/upload', formData);
  return response.data;
};
