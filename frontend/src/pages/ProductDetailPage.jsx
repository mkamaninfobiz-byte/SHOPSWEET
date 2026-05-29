import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { fetchProductById } from '../api/products';

const sampleProducts = [
  { sku: 'CHOC-001', name: 'Luxury Chocolate Box', category: 'Sweets', inventory: 120, price: '$25.00', description: 'A premium collection of handcrafted chocolates.', supplier: 'Sweet Delight Co.', weight: '1.2kg' },
  { sku: 'CAND-024', name: 'Signature Candy Mix', category: 'Snacks', inventory: 44, price: '$14.50', description: 'A colorful selection of sweet and tangy candy favorites.', supplier: 'Candy Cloud Ltd.', weight: '750g' },
  { sku: 'GIFT-08', name: 'Seasonal Gift Bundle', category: 'Packages', inventory: 32, price: '$49.99', description: 'A festive gift bundle with sweets, snacks, and special packaging.', supplier: 'Holiday Sweets Inc.', weight: '2.5kg' },
];

const ProductDetailPage = () => {
  const { sku } = useParams();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const initialProduct = useMemo(() => {
    if (location.state?.product) return location.state.product;
    return sampleProducts.find((item) => item.sku === sku || item.id === sku);
  }, [sku, location.state]);

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      return;
    }

    const loadProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchProductById(sku);
        setProduct(data);
      } catch (err) {
        setError(err?.error || err?.message || 'Unable to load product details.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [initialProduct, sku]);

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Loading product details...</h2>
        <p className="mt-3 text-slate-500">Please wait while we fetch the product information.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Unable to load product</h2>
        <p className="mt-3 text-slate-500">{error}</p>
        <BackButton to="/dashboard/products" variant="default" className="mt-6">
          Back to products
        </BackButton>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Product not found</h2>
        <p className="mt-3 text-slate-500">The selected product could not be loaded.</p>
        <BackButton to="/dashboard/products" variant="default" className="mt-6">
          Back to products
        </BackButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">{product.name}</h2>
          <p className="mt-2 text-slate-500">SKU: {product.sku}</p>
        </div>
        <BackButton to="/dashboard/products" variant="default" className="rounded-3xl">
          Back to products
        </BackButton>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Product details</h3>
          <div className="mt-4 space-y-3 text-slate-600">
            <p><span className="font-semibold text-slate-900">Category:</span> {product.category}</p>
            <p><span className="font-semibold text-slate-900">Price:</span> {product.price}</p>
            <p><span className="font-semibold text-slate-900">Inventory:</span> {product.inventory}</p>
            <p><span className="font-semibold text-slate-900">Supplier:</span> {product.supplier}</p>
            <p><span className="font-semibold text-slate-900">Weight:</span> {product.weight}</p>
          </div>
        </div>
        <div className="lg:col-span-2 rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Description</h3>
          <p className="mt-4 text-slate-600">{product.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
