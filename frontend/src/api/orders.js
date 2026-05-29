import api from './axiosConfig';

export const fetchOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const updateOrder = async (id, payload) => {
  const response = await api.put(`/orders/${id}`, payload);
  return response.data;
};

export const deleteOrder = async (id) => {
  const response = await api.delete(`/orders/${id}`);
  return response.data;
};
