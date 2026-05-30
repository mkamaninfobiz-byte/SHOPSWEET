import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createProduct, updateProduct } from '../api/products';
import { useProductCatalog } from '../hooks/useProductCatalog';
import {
  filterCatalogProducts,
  getProductImageUrl,
  getProductStatus,
  mapCatalogProduct,
} from '../utils/productHelpers';
import { gsap } from 'gsap';
import PageBackNav from '../components/PageBackNav';

const defaultSweetImage = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80';

const ProductsPage = ({ user, dashboardMode = false }) => {
  const isAdmin = user?.roles?.includes('Admin');
  const isPublic = !dashboardMode;
  const navigate = useNavigate();
  const { products, setProducts, loading, error, reload, hasProducts, isConnectionError } = useProductCatalog();
  const [formError, setFormError] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    subtitle: '',
    category: '',
    price: '',
    stock: '',
    image_url: '',
    description: '',
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editValues, setEditValues] = useState({
    name: '',
    subtitle: '',
    category: '',
    price: '',
    stock: '',
    image_url: '',
    description: '',
  });
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortBy, setSortBy] = useState('Newest');
  const [viewMode, setViewMode] = useState('grid');

  const statuses = ['All Status', 'Active', 'Low Stock', 'Out of Stock'];
  const sortOptions = ['Newest', 'Price: Low to High', 'Price: High to Low'];

  const handleChange = (field, value) => {
    setNewProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditChange = (field, value) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleViewProduct = (product) => {
    navigate(`/dashboard/products/${product.id}`, { state: { product } });
  };

  const handleOrderProduct = (product) => {
    if (!product?.id) return;
    navigate(`/order?product=${product.id}`);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditValues({
      name: product.name || '',
      subtitle: product.subtitle || '',
      category: product.category || '',
      price: String(product.price ?? ''),
      stock: String(product.stock ?? ''),
      image_url: product.image_url || '',
      description: product.description || '',
    });
    setIsAdding(false);
  };

  const handleDeleteProduct = (product) => {
    if (!product || !window.confirm(`Delete ${product.name}? This action cannot be undone.`)) return;
    setProducts((prev) => prev.filter((item) => item.id !== product.id));
    if (editingProduct?.id === product.id) setEditingProduct(null);
  };

  const handleUpdateProduct = async (event) => {
    event.preventDefault();
    if (!editingProduct) return;
    if (!editValues.name || !editValues.price) {
      setFormError('Name and price are required for update.');
      return;
    }

    try {
      console.log(`[UI] Updating product ${editingProduct.id}...`);
      const updatedProduct = await updateProduct(editingProduct.id, {
        name: editValues.name,
        category: editValues.category,
        price: Number(editValues.price),
        stock: Number(editValues.stock),
        image_url: editValues.image_url,
        description: editValues.description,
      });

      console.log(`[UI] Update successful, received response:`, updatedProduct);

      // Update local state with actual API response
      setProducts((prev) =>
        prev.map((item) =>
          item.id === editingProduct.id
            ? {
                ...item,
                ...updatedProduct,
                status: getProductStatus(updatedProduct),
              }
            : item
        )
      );

      setEditingProduct(null);
      setFormError('');
      console.log(`[UI] Product ${editingProduct.id} updated successfully`);
    } catch (error) {
      console.error(`[UI] Failed to update product:`, error);
      setFormError(`Failed to update product: ${error.message}`);
    }
  };

  const handleAddProduct = async (event) => {
    event.preventDefault();
    if (!isAdmin) {
      setFormError('Only admins can add products.');
      return;
    }
    if (!newProduct.name || !newProduct.price) {
      setFormError('Name and price are required.');
      return;
    }

    try {
      const created = await createProduct({
        ...newProduct,
        price: Number(newProduct.price),
        inventory: Number(newProduct.stock) || 0,
      });
      setProducts((prev) => [mapCatalogProduct(created), ...prev]);
      setNewProduct({ name: '', subtitle: '', category: '', price: '', stock: '', image_url: '', description: '' });
      setIsAdding(false);
      setFormError('');
    } catch (err) {
      setFormError(err.error || 'Unable to add product.');
    }
  };

  const visibleProducts = products;
  const categoryOptions = [
    'All Categories',
    ...Array.from(new Set(visibleProducts.map((item) => item.category).filter(Boolean))),
  ];
  const filteredProducts = filterCatalogProducts(visibleProducts, { query, categoryFilter, statusFilter });
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'Price: Low to High') return Number(a.price || 0) - Number(b.price || 0);
    if (sortBy === 'Price: High to Low') return Number(b.price || 0) - Number(a.price || 0);
    return 0;
  });

  const totalProducts = visibleProducts.length;
  const activeProducts = visibleProducts.filter((item) => getProductStatus(item) === 'Active').length;
  const categoryCount = new Set(visibleProducts.map((item) => item.category)).size;
  const avgPrice = totalProducts > 0 ? Math.round(visibleProducts.reduce((sum, item) => sum + Number(item.price || 0), 0) / totalProducts) : 0;

  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const taglineRef = useRef(null);

  useLayoutEffect(() => {
    if (isPublic) {
      gsap.fromTo(subtitleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
      gsap.fromTo(titleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' });
      gsap.fromTo(taglineRef.current, { color: '#dc2626' }, { color: '#f97316', duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }
  }, [isPublic]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      {isPublic ? (
        <div className="mx-auto max-w-7xl space-y-8 sm:space-y-10">
          <PageBackNav />
          {/* <section className="overflow-hidden rounded-[2rem] bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
            <div className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
              <div>
                <span ref={subtitleRef} className="inline-flex rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-orange-600">Sweet Collection</span>
                <h1 ref={titleRef} className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">ShopSweet sweets, fresh from our database.</h1>
                <p ref={taglineRef} className="mt-4 text-2xl font-semibold" style={{ color: '#dc2626' }}>Sweetness Every Celebration.</p>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Browse all available products directly from the backend inventory. Every sweet is customer-ready, curated for festivals, gifting, and celebrations.</p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link to="/order" className="inline-flex items-center justify-center rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:brightness-110">Order Now</Link>
                  <button onClick={() => document.getElementById('product-catalog')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100">View Catalog</button>
                </div>
              </div>
            </div>
          </section> */}

          <section id="product-catalog" className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-orange-600">All sweets</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">All Sweets</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Products</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">{totalProducts}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Categories</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">{categoryCount}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[minmax(240px,_1fr)_minmax(180px,_1fr)_minmax(180px,_1fr)_minmax(220px,_1fr)]">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sweets..."
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10"
              />
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10">
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <div className="grid gap-4 sm:grid-cols-2">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10">
                  {sortOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <div className="flex items-center justify-between gap-2 rounded-3xl border border-slate-200 bg-white p-1">
                  <button type="button" onClick={() => setViewMode('grid')} className={`flex h-11 w-11 items-center justify-center rounded-3xl transition ${viewMode === 'grid' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                    <span className="text-base font-semibold">▦</span>
                  </button>
                  <button type="button" onClick={() => setViewMode('list')} className={`flex h-11 w-11 items-center justify-center rounded-3xl transition ${viewMode === 'list' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                    <span className="text-base font-semibold">≡</span>
                  </button>
                </div>
              </div>
              <button onClick={() => { setQuery(''); setCategoryFilter('All Categories'); setStatusFilter('All Status'); setSortBy('Newest'); }} className="rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Reset</button>
            </div>

            {(error || formError) && (
              <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                <p>{error || formError}</p>
                {isConnectionError && (
                  <button
                    type="button"
                    onClick={reload}
                    className="mt-3 rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                  >
                    Retry connection
                  </button>
                )}
              </div>
            )}

            <div className={`grid gap-6 ${viewMode === 'list' ? 'grid-cols-1' : 'md:grid-cols-2 xl:grid-cols-4'}`}>
              {(loading ? Array.from({ length: 6 }) : sortedProducts).map((item, index) => {
                const badgeText = item?.discount ? `-${item.discount}%` : 'NEW';
                const badgeColor = item?.discount ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700';
                return (
                  <div
                    key={item?.id ?? index}
                    role="button"
                    tabIndex={0}
                    onClick={() => item && handleOrderProduct(item)}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && item) {
                        e.preventDefault();
                        handleOrderProduct(item);
                      }
                    }}
                    className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <div className="relative overflow-hidden bg-slate-100">
                      <div className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] shadow-sm ${badgeColor}`}>{badgeText}</div>
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition hover:bg-orange-50 hover:text-orange-600"
                        aria-label="Add to wishlist"
                      >
                        <span className="text-lg">♥</span>
                      </button>
                      <img src={item ? getProductImageUrl(item) : defaultSweetImage} alt={item?.name ?? 'Sweet'} className="h-[260px] w-full object-cover transition duration-700 group-hover:scale-105" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.32em] text-slate-500">{item?.category ?? 'Category'}</p>
                          <h3 className="mt-3 text-xl font-semibold text-slate-950">{item?.name ?? 'Loading...'}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                            <span className="text-amber-500">★</span>
                            {item?.rating ?? 4.5}
                          </span>
                          <span>({item?.reviews ?? 128})</span>
                        </div>
                        <p className="text-sm leading-6 text-slate-500">{item?.description || 'Premium sweet with rich flavor and handcrafted quality.'}</p>
                      </div>
                      <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
                        <div>
                          <p className="text-2xl font-semibold text-slate-950">₹{item ? Number(item.price || 0).toFixed(0) : '...'}</p>
                          {item?.old_price || item?.oldPrice ? (
                            <p className="text-sm text-slate-400 line-through">₹{item.old_price ?? item.oldPrice}</p>
                          ) : null}
                        </div>
                        <span className="inline-flex h-12 items-center justify-center rounded-3xl bg-orange-600 px-4 text-sm font-semibold text-white transition group-hover:brightness-110">
                          Order
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {!loading && !error && !hasProducts && (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-8 text-center text-slate-700">
                <p className="font-semibold">Catalog is empty</p>
                <p className="mt-2 text-sm">Add sweets from the admin panel, or wait a moment and refresh.</p>
                <button
                  type="button"
                  onClick={reload}
                  className="mt-4 rounded-full bg-orange-600 px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  Refresh catalog
                </button>
              </div>
            )}
            {!loading && !error && hasProducts && filteredProducts.length === 0 && (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-8 text-center text-slate-600">
                No sweets match your search or filters. Try resetting filters.
              </div>
            )}

            <div className="text-center text-sm text-slate-500">Showing {filteredProducts.length} of {visibleProducts.length} sweets</div>
          </section>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="rounded-[2rem] bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-slate-950">Products</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Manage your sweet inventory, add new products, and keep your store updated.</p>
              </div>
              <button onClick={() => setIsAdding((prev) => !prev)} className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-[#ff6b6b] to-[#f97316] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:brightness-110">
                + Add New Product
              </button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Total Products</p>
                <p className="mt-4 text-3xl font-semibold text-slate-950">{totalProducts}</p>
                <p className="mt-2 text-sm text-slate-500">All products in store</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Active Products</p>
                <p className="mt-4 text-3xl font-semibold text-slate-950">{activeProducts}</p>
                <p className="mt-2 text-sm text-slate-500">Currently available</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Categories</p>
                <p className="mt-4 text-3xl font-semibold text-slate-950">{categoryCount}</p>
                <p className="mt-2 text-sm text-slate-500">Product categories</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Avg. Price</p>
                <p className="mt-4 text-3xl font-semibold text-slate-950">₹{avgPrice}</p>
                <p className="mt-2 text-sm text-slate-500">Average product price</p>
              </div>
            </div>
          </div>

          {isAdding && (
            <div className="rounded-[2rem] bg-white p-8 shadow-sm">
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Add New Product</h2>
                  <p className="text-sm text-slate-500">Enter product details to publish it to your shop.</p>
                </div>
                <button onClick={() => setIsAdding(false)} className="text-sm font-semibold text-slate-500 transition hover:text-slate-900">Cancel</button>
              </div>
              <form onSubmit={handleAddProduct} className="grid gap-4 lg:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-700">
                  Product name
                  <input value={newProduct.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#ff6b6b]" />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Subtitle
                  <input value={newProduct.subtitle} onChange={(e) => handleChange('subtitle', e.target.value)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#ff6b6b]" />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Category
                  <input value={newProduct.category} onChange={(e) => handleChange('category', e.target.value)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#ff6b6b]" />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Price
                  <input type="number" value={newProduct.price} onChange={(e) => handleChange('price', e.target.value)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#ff6b6b]" />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Stock
                  <input type="number" value={newProduct.stock} onChange={(e) => handleChange('stock', e.target.value)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#ff6b6b]" />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Image URL
                  <input value={newProduct.image_url} onChange={(e) => handleChange('image_url', e.target.value)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#ff6b6b]" />
                </label>
                <div className="lg:col-span-2 grid gap-4 sm:grid-cols-[1fr_auto]">
                  <div className="space-y-2 text-sm text-slate-700">
                    Description
                    <textarea value={newProduct.description} onChange={(e) => handleChange('description', e.target.value)} rows={4} className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#ff6b6b]" />
                  </div>
                  <div className="flex items-end justify-end">
                    <button type="submit" className="rounded-3xl bg-gradient-to-r from-[#ff6b6b] to-[#f97316] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:brightness-110">Publish</button>
                  </div>
                </div>
              </form>
              {(error || formError) && <p className="mt-4 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error || formError}</p>}
            </div>
          )}

          {editingProduct && (
            <div className="rounded-[2rem] bg-white p-8 shadow-sm">
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Edit Product</h2>
                  <p className="text-sm text-slate-500">Update your product information and save changes.</p>
                </div>
                <button onClick={() => setEditingProduct(null)} className="text-sm font-semibold text-slate-500 transition hover:text-slate-900">Cancel</button>
              </div>
              <form onSubmit={handleUpdateProduct} className="grid gap-4 lg:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-700">
                  Product name
                  <input value={editValues.name} onChange={(e) => handleEditChange('name', e.target.value)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#ff6b6b]" />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Subtitle
                  <input value={editValues.subtitle} onChange={(e) => handleEditChange('subtitle', e.target.value)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#ff6b6b]" />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Category
                  <input value={editValues.category} onChange={(e) => handleEditChange('category', e.target.value)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#ff6b6b]" />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Price
                  <input type="number" value={editValues.price} onChange={(e) => handleEditChange('price', e.target.value)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#ff6b6b]" />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Stock
                  <input type="number" value={editValues.stock} onChange={(e) => handleEditChange('stock', e.target.value)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#ff6b6b]" />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Image URL
                  <input value={editValues.image_url} onChange={(e) => handleEditChange('image_url', e.target.value)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#ff6b6b]" />
                </label>
                <div className="lg:col-span-2 grid gap-4 sm:grid-cols-[1fr_auto]">
                  <div className="space-y-2 text-sm text-slate-700">
                    Description
                    <textarea value={editValues.description} onChange={(e) => handleEditChange('description', e.target.value)} rows={4} className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#ff6b6b]" />
                  </div>
                  <div className="flex items-end justify-end">
                    <button type="submit" className="rounded-3xl bg-gradient-to-r from-[#ff6b6b] to-[#f97316] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:brightness-110">Save changes</button>
                  </div>
                </div>
              </form>
              {(error || formError) && <p className="mt-4 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error || formError}</p>}
            </div>
          )}

          <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Product list</h2>
                <p className="text-sm text-slate-500">Search, filter, and manage your sweet products.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-[minmax(240px,_1fr)_minmax(180px,_1fr)_minmax(180px,_1fr)_auto] lg:w-full">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-900 outline-none focus:border-[#ff6b6b] focus:ring-4 focus:ring-[#ff6b6b]/10"
                />
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-900 outline-none focus:border-[#ff6b6b] focus:ring-4 focus:ring-[#ff6b6b]/10">
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-900 outline-none focus:border-[#ff6b6b] focus:ring-4 focus:ring-[#ff6b6b]/10">
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <div className="flex items-center gap-3 justify-end">
                  <button onClick={() => { setQuery(''); setCategoryFilter('All Categories'); setStatusFilter('All Status'); }} className="rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Reset</button>
                  <button className="rounded-3xl bg-gradient-to-r from-[#ff6b6b] to-[#f97316] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:brightness-110">Filter</button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-4"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#ff6b6b] focus:ring-[#ff6b6b]" /></th>
                    <th className="px-4 py-4 font-medium text-slate-500">Product</th>
                    <th className="px-4 py-4 font-medium text-slate-500">Category</th>
                    <th className="px-4 py-4 font-medium text-slate-500">Price</th>
                    <th className="px-4 py-4 font-medium text-slate-500">Stock</th>
                    <th className="px-4 py-4 font-medium text-slate-500">Status</th>
                    <th className="px-4 py-4 font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {(loading ? Array.from({ length: 5 }) : filteredProducts).map((item, index) => (
                    <tr key={item?.id ?? index} className="hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#ff6b6b] focus:ring-[#ff6b6b]" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-14 overflow-hidden rounded-3xl bg-slate-100">
                            <img src={item ? getProductImageUrl(item) : defaultSweetImage} alt={item?.name || 'product'} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{item?.name ?? 'Loading...'}</p>
                            <p className="text-xs text-slate-500">{item?.subtitle ?? 'Loading product details...'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-600">{item?.category ?? '...'}</span>
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-900">{item ? `₹${Number(item.price || 0).toFixed(0)}` : '...'}</td>
                      <td className="px-4 py-4 text-slate-600">{item?.stock != null ? `${item.stock} kg` : '...'}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item ? (getProductStatus(item) === 'Active' ? 'bg-emerald-100 text-emerald-700' : getProductStatus(item) === 'Low Stock' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700') : 'bg-slate-100 text-slate-500'}`}>
                          {item ? getProductStatus(item) : 'Loading'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => item && handleEditProduct(item)}
                            disabled={!item}
                            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => item && handleViewProduct(item)}
                            disabled={!item}
                            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            View
                          </button>
                          <button
                            onClick={() => item && handleDeleteProduct(item)}
                            disabled={!item}
                            className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">Showing {filteredProducts.length} of {visibleProducts.length} products</p>
              <div className="flex flex-wrap items-center gap-2">
                <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Prev</button>
                <button className="rounded-full border border-transparent bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20">1</button>
                <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">2</button>
                <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">3</button>
                <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Next</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
