import axios from 'axios';
import api from './axiosConfig';
import { normalizeProductList } from '../utils/productHelpers';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getDirectApiBase = () => {
  const backend = import.meta.env.VITE_BACKEND_URL;
  if (!backend) return null;
  return `${String(backend).replace(/\/$/, '')}/api`;
};

const requestProducts = async (client) => {
  const response = await client.get('/products');
  return normalizeProductList(response.data);
};

/** Try primary API client, then direct backend URL if proxy/relative path fails. */
const fetchProductsWithFallback = async () => {
  const errors = [];

  try {
    return await requestProducts(api);
  } catch (primaryError) {
    errors.push(primaryError);
  }

  const directBase = getDirectApiBase();
  const primaryBase = api.defaults.baseURL || '';

  if (directBase && directBase !== primaryBase) {
    try {
      const directClient = axios.create({
        baseURL: directBase,
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      return await requestProducts(directClient);
    } catch (fallbackError) {
      errors.push(fallbackError);
    }
  }

  throw errors[errors.length - 1];
};

export const fetchProducts = async ({ retries = 2 } = {}) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fetchProductsWithFallback();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await sleep(400 * (attempt + 1));
      }
    }
  }

  throw lastError;
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
