import api from './axiosConfig';

export const sendContactMessage = async (data) => {
  const response = await api.post('/contact', data);
  return response.data;
};

export const fetchContacts = async () => {
  const response = await api.get('/contact');
  return response.data;
};

export const updateContact = async (id, data) => {
  const response = await api.put(`/contact/${id}`, data);
  return response.data;
};

export const deleteContact = async (id) => {
  const response = await api.delete(`/contact/${id}`);
  return response.data;
};
