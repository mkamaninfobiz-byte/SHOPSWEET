import api from './axiosConfig';
import { normalizeProductList } from '../utils/productHelpers';

export const fetchProducts = async () => {
  console.log(`[Frontend] Fetching products from API...`);
  const response = await api.get('/products');
  console.log(`[Frontend] Received ${response.data.length || 0} products from API:`, response.data.slice(0, 2));
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
  console.log(`[Frontend] Updating product ${id} with data:`, {
    name: product.name ? `"${product.name.substring(0, 30)}..."` : 'not provided',
    category: product.category,
    price: product.price,
    image_url: product.image_url ? `"${product.image_url.substring(0, 50)}..."` : 'not provided',
    imageUrl: product.imageUrl ? `"${product.imageUrl.substring(0, 50)}..."` : 'not provided',
  });
  const response = await api.put(`/products/${id}`, product);
  console.log(`[Frontend] API response for product ${id}:`, {
    id: response.data.id,
    name: response.data.name,
    image_url: response.data.image_url ? `"${response.data.image_url.substring(0, 50)}..."` : 'null',
  });
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};
