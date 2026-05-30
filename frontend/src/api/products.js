import api from './axiosConfig';
import { normalizeProductList } from '../utils/productHelpers';

export const fetchProducts = async () => {
  const response = await api.get('/products');
  return normalizeProductList(response.data);
};

export const fetchProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (product) => {
  const response = await api.post('/products', product);
  return response.data;
};

export const updateProduct = async (id, product) => {
  const response = await api.put(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};
