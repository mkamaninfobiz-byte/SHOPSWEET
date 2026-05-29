import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import SiteNavbar from '../components/SiteNavbar';
import SiteFooter from '../components/SiteFooter';
import { fetchProducts } from '../api/products';
import { getProductImageUrl, normalizeProductList } from '../utils/productHelpers';

const CATEGORY_ICON_MAP = {
  laddu: '🧡',
  gulab: '❤️',
  jamun: '❤️',
  rasgulla: '🌕',
  dry: '🥜',
  fusion: '🌸',
  premium: '💎',
  traditional: '🪔',
  barfi: '✨',
  kaju: '💎',
  sweet: '🍬',
};

const getCategoryIcon = (label) => {
  const key = (label || '').toLowerCase();
  const match = Object.entries(CATEGORY_ICON_MAP).find(([part]) => key.includes(part));
  return match ? match[1] : '🍬';
};

const buildCategories = (products) => {
  const counts = new Map();
  products.forEach((product) => {
    const label = (product.category || 'Sweets').trim();
    const key = label.toLowerCase();
    if (!counts.has(key)) {
      counts.set(key, { label, count: 0, icon: getCategoryIcon(label) });
    }
    counts.get(key).count += 1;
  });
  return Array.from(counts.values()).sort((a, b) => b.count - a.count);
};

const sectionReveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const CategoriesPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeSlug = searchParams.get('cat') || 'all';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchProducts()
      .then((data) => {
        const list = normalizeProductList(data).map((item) => ({
          id: item.id || item.sku,
          name: item.name,
          category: item.category || 'Sweets',
          price: Number(item.price || 0).toFixed(0),
          image: getProductImageUrl(item),
        }));
        setProducts(list);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => buildCategories(products), [products]);

  const activeCategory =
    activeSlug === 'all'
      ? 'all'
      : categories.find((c) => c.label.toLowerCase() === activeSlug.toLowerCase())?.label || 'all';

  const filtered =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());

  const selectCategory = (label) => {
    if (label === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ cat: label.toLowerCase() });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-sky-50/40 text-slate-950">
      <SiteNavbar />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionReveal}
        className="relative overflow-hidden border-b border-slate-200 bg-white py-12 sm:py-16"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(251,146,60,0.12),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.08),transparent_40%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-orange-600">Collections</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-slate-950 sm:text-4xl md:text-5xl">
            Browse Sweet Categories
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            Explore handcrafted mithai by collection. Select a category to view matching treats.
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5"
          >
            View full menu
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.button
            type="button"
            layout
            onClick={() => selectCategory('all')}
            whileHover={{ y: -4 }}
            className={`rounded-2xl border p-5 text-left transition-all sm:col-span-2 lg:col-span-1 ${
              activeCategory === 'all'
                ? 'border-orange-300 bg-gradient-to-br from-orange-600 to-amber-500 text-white shadow-xl'
                : 'border-slate-200 bg-white hover:border-orange-200 hover:shadow-md'
            }`}
          >
            <span className="text-2xl">🍬</span>
            <p className="mt-3 text-lg font-bold">All sweets</p>
            <p className={`mt-1 text-sm ${activeCategory === 'all' ? 'text-orange-50' : 'text-slate-500'}`}>
              {products.length} items
            </p>
          </motion.button>

          {categories.map((cat) => (
            <motion.button
              key={cat.label}
              type="button"
              layout
              onClick={() => selectCategory(cat.label)}
              whileHover={{ y: -4 }}
              className={`rounded-2xl border p-5 text-left transition-all ${
                activeCategory.toLowerCase() === cat.label.toLowerCase()
                  ? 'border-orange-300 bg-white shadow-lg ring-2 ring-orange-200'
                  : 'border-slate-200 bg-white hover:border-orange-200 hover:shadow-md'
              }`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-xl">
                {cat.icon}
              </span>
              <p className="mt-3 font-semibold capitalize text-slate-950">{cat.label}</p>
              <p className="mt-1 text-xs text-slate-500">
                {cat.count} product{cat.count !== 1 ? 's' : ''}
              </p>
            </motion.button>
          ))}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-12"
        >
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
              {activeCategory === 'all' ? 'All products' : activeCategory}
            </h2>
            <p className="text-sm text-slate-500">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-200" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((product, idx) => (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="group overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:border-orange-200 hover:shadow-lg"
                >
                  <div className="relative aspect-[5/4] overflow-hidden bg-slate-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-600">
                      {product.category}
                    </p>
                    <h3 className="mt-1 font-semibold capitalize text-slate-950">{product.name}</h3>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-950">₹{product.price}/kg</p>
                      <button
                        type="button"
                        onClick={() => navigate(`/order?product=${encodeURIComponent(product.id)}`)}
                        className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                      >
                        Order →
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-orange-400" />
              <p className="mt-3 text-slate-600">No products in this category yet.</p>
              <button
                type="button"
                onClick={() => selectCategory('all')}
                className="mt-4 text-sm font-semibold text-orange-600 hover:underline"
              >
                View all categories
              </button>
            </div>
          )}
        </motion.section>
      </div>

      <SiteFooter />
    </main>
  );
};

export default CategoriesPage;
