import { useCallback, useEffect, useState } from 'react';
import { fetchProducts } from '../api/products';
import { getApiErrorMessage, mapCatalogProduct } from '../utils/productHelpers';

export const useProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchProducts();
        if (cancelled) return;
        setProducts(data.map(mapCatalogProduct));
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load products:', err);
        setProducts([]);
        setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return {
    products,
    setProducts,
    loading,
    error,
    reload,
    hasProducts: products.length > 0,
    isConnectionError: Boolean(error),
  };
};
