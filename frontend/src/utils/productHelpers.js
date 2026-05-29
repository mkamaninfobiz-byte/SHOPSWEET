const defaultSweetImage =
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80';

export const isValidImageUrl = (value) => {
  if (!value) return false;
  try {
    const url = new URL(String(value).trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const getProductImageUrl = (item) => {
  const imageUrl = String(item?.image_url || item?.image || item?.imageUrl || '').trim();
  if (!imageUrl) return defaultSweetImage;
  if (imageUrl.startsWith('/')) return imageUrl;
  if (isValidImageUrl(imageUrl)) return imageUrl;
  return defaultSweetImage;
};

export const getProductStatus = (item) => {
  if (item?.status) return item.status;
  const stock = Number(item?.stock ?? item?.inventory ?? 0);
  if (stock === 0) return 'Out of Stock';
  if (stock <= 40) return 'Low Stock';
  return 'Active';
};

/** Normalize API payloads that may be a raw array or wrapped object. */
export const normalizeProductList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const mapCatalogProduct = (item) => ({
  ...item,
  id: item.id ?? item.sku,
  name: item.name || 'Unnamed product',
  category: item.category || 'General',
  image_url: getProductImageUrl(item),
  subtitle: item.subtitle || item.description || 'Fresh & Delicious',
  stock: item.stock ?? item.inventory ?? 0,
  status: getProductStatus({ ...item, stock: item.stock ?? item.inventory ?? 0 }),
});

export const filterCatalogProducts = (products, { query = '', categoryFilter = 'All Categories', statusFilter = 'All Status' } = {}) => {
  const queryLower = query.trim().toLowerCase();
  return products.filter((item) => {
    const name = (item.name || '').toLowerCase();
    const category = (item.category || '').toLowerCase();
    const matchesQuery = !queryLower || name.includes(queryLower) || category.includes(queryLower);
    const matchesCategory = categoryFilter === 'All Categories' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'All Status' || getProductStatus(item) === statusFilter;
    return matchesQuery && matchesCategory && matchesStatus;
  });
};

export const getApiErrorMessage = (err) => {
  if (!err) return 'Unable to load products.';
  if (typeof err === 'string') return err;
  if (err.error) return String(err.error);
  if (err.message) return String(err.message);
  return 'Unable to connect to the server. Make sure the backend is running.';
};
