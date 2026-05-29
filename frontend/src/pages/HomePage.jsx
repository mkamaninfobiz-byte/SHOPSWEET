import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../api/products';
import { fetchTestimonials } from '../api/testimonials';
import { getApiErrorMessage, getProductImageUrl, normalizeProductList } from '../utils/productHelpers';
import { normalizeTestimonialList } from '../utils/testimonialHelpers';
import {
  ShoppingCart,
  ArrowRight,
  Sparkles,
  Heart,
  ShieldCheck,
  LayoutGrid,
  Star,
} from 'lucide-react';
import { getTestimonialPhotoUrl } from '../utils/testimonialHelpers';
import SiteNavbar from '../components/SiteNavbar';
import SiteFooter from '../components/SiteFooter';
import { AnimatedHeadline, FloatingOrb, Reveal } from '../components/AnimatedReveal';
import TestimonialAvatar from '../components/TestimonialAvatar';

const heroFeatures = [
  { label: 'Pure Ingredients', icon: Sparkles },
  { label: 'Hygienically Packed', icon: ShieldCheck },
  { label: 'Made with Love', icon: Heart },
];

const CATEGORY_ICON_MAP = {
  laddu: '🧡',
  laddus: '🧡',
  barfi: '✨',
  gulab: '❤️',
  jamun: '❤️',
  rasgulla: '🌕',
  dry: '🥜',
  fusion: '🌸',
  premium: '💎',
  traditional: '🪔',
  sweet: '🍬',
  kaju: '💎',
  motichur: '🌼',
};

const DEFAULT_CATEGORIES = [
  { label: 'Laddus', icon: '🧡' },
  { label: 'Gulab Jamun', icon: '❤️' },
  { label: 'Rasgulla', icon: '🌕' },
  { label: 'Dry Fruits', icon: '🥜' },
  { label: 'Fusion Sweets', icon: '🌸' },
];

const defaultCardImage = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80';

const sectionReveal = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const cardReveal = {
  hidden: { opacity: 0, y: 28, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const normalizeCategoryLabel = (label) => {
  const key = (label || '').trim().toLowerCase();
  if (key === 'primimum' || key === 'primumum' || key === 'primium') return 'Premium';
  return (label || 'Sweets').trim();
};

const getCategoryIcon = (label) => {
  const key = (label || '').toLowerCase();
  const match = Object.entries(CATEGORY_ICON_MAP).find(([part]) => key.includes(part));
  return match ? match[1] : '🍬';
};

const buildCategories = (products) => {
  const counts = new Map();
  products.forEach((product) => {
    const label = normalizeCategoryLabel(product.category || 'Sweets');
    const key = label.toLowerCase();
    if (!counts.has(key)) counts.set(key, { label, count: 0, icon: getCategoryIcon(label) });
    counts.get(key).count += 1;
  });

  if (counts.size > 0) {
    return Array.from(counts.values()).sort((a, b) => b.count - a.count);
  }

  return DEFAULT_CATEGORIES.map((item) => ({ ...item, count: 0 }));
};

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [testimonialItems, setTestimonialItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPageData = async () => {
      setLoading(true);
      setError('');
      try {
        const [productsData, testimonialData] = await Promise.all([
          fetchProducts(),
          fetchTestimonials().catch(() => null),
        ]);

        const list = normalizeProductList(productsData);
        setProducts(
          list.map((item) => ({
            id: item.id || item.sku || item.name,
            title: item.name,
            category: normalizeCategoryLabel(item.category || 'Sweet'),
            label: normalizeCategoryLabel(item.category || 'Special'),
            price: Number(item.price || 0).toFixed(0),
            rating: item.rating || 4.6,
            reviews: item.reviews || 0,
            image: getProductImageUrl(item) || defaultCardImage,
          }))
        );

        if (testimonialData?.items?.length) {
          setTestimonialItems(normalizeTestimonialList(testimonialData.items));
        }
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, []);

  const categories = useMemo(() => buildCategories(products), [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter(
      (p) =>
        normalizeCategoryLabel(p.category).toLowerCase() === activeCategory.toLowerCase()
    );
  }, [products, activeCategory]);

  const orderLink = (productId) => `/order?product=${encodeURIComponent(productId)}`;

  const testimonialAvatars = useMemo(
    () => testimonialItems.filter((t) => getTestimonialPhotoUrl(t) || t.name).slice(0, 4),
    [testimonialItems]
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-100 via-white to-orange-50 text-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(251,146,60,0.16),transparent_18%)]" />
      <FloatingOrb className="left-1/4 top-20 h-64 w-64 bg-cyan-200/20" />
      <FloatingOrb className="right-1/4 top-40 h-72 w-72 bg-orange-200/18" delay={2} />

      <SiteNavbar />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-4 pt-2 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={sectionReveal}
          className="relative px-2 pb-10 pt-14 sm:px-4 sm:pb-12 sm:pt-20 lg:pt-24"
        >
          <div className="relative space-y-8 text-center sm:space-y-10">
            <div className="mx-auto flex max-w-4xl flex-col items-center pt-2 sm:pt-4">
              <AnimatedHeadline
                className="w-full text-center"
                lines={[
                  {
                    text: 'Celebrate with Love & Purity',
                    className:
                      'bg-gradient-to-r from-orange-700 via-orange-500 to-amber-500 bg-clip-text font-remachine text-4xl font-extrabold text-transparent sm:text-5xl md:text-6xl lg:text-7xl',
                  },
                ]}
              />
            </div>

            <motion.ul
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              {heroFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.li
                    key={feature.label}
                    variants={cardReveal}
                    whileHover={{ y: -3, scale: 1.03 }}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 sm:text-sm"
                  >
                    <Icon className="h-4 w-4 text-orange-500" />
                    {feature.label}
                  </motion.li>
                );
              })}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row"
            >
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/order"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-105"
                >
                  Start your order
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/categories"
                  className="inline-flex items-center justify-center rounded-full border border-orange-200 bg-white px-6 py-4 text-sm font-semibold text-orange-700 transition hover:border-orange-300 hover:bg-orange-50"
                >
                  Browse categories
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Collections banner + all products */}
        <motion.section
          id="categories"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={sectionReveal}
          className="relative mt-12 scroll-mt-24 border-t border-slate-200 pt-10 sm:mt-14 sm:pt-12"
        >
          <div className="pb-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-xl">
                <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-orange-600">
                  <Sparkles className="h-3.5 w-3.5" />
                  ShopSweet catalog
                </p>
                <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
                  Explore Our{' '}
                  <span className="text-orange-600">Sweet Collections</span>
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                  Handpicked mithai by category — browse our full range and order your favourites in
                  seconds.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-end">
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
                  >
                    View Full Menu
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/categories"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-transparent px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-700"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    All categories
                  </Link>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {testimonialAvatars.length > 0 ? (
                      testimonialAvatars.map((item, idx) => {
                        const photo = getTestimonialPhotoUrl(item);
                        return photo ? (
                          <img
                            key={item.id || idx}
                            src={photo}
                            alt=""
                            className="h-8 w-8 rounded-full border-2 border-white object-cover"
                          />
                        ) : (
                          <span
                            key={item.id || idx}
                            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-orange-100 text-[10px] font-bold text-orange-700"
                          >
                            {(item.name || 'S')[0]}
                          </span>
                        );
                      })
                    ) : (
                      ['A', 'B', 'C', 'D'].map((letter) => (
                        <span
                          key={letter}
                          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-orange-100 text-[10px] font-bold text-orange-700"
                        >
                          {letter}
                        </span>
                      ))
                    )}
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      4.9 · Loved by{' '}
                      {testimonialItems.length > 0
                        ? `${Math.max(500, testimonialItems.length * 100)}+`
                        : '1000+'}
                      {' '}
                      customers
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`min-w-[7.5rem] shrink-0 rounded-xl border p-3.5 text-left transition ${
                  activeCategory === 'all'
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-slate-200 bg-white hover:border-orange-200'
                }`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-base">
                  🧁
                </span>
                <p className="mt-2.5 text-sm font-bold text-slate-900">All sweets</p>
                <p className="text-xs text-slate-500">
                  {products.length} product{products.length !== 1 ? 's' : ''}
                </p>
              </button>
              {categories.map((cat) => {
                const active = activeCategory.toLowerCase() === cat.label.toLowerCase();
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setActiveCategory(cat.label)}
                    className={`min-w-[7.5rem] shrink-0 rounded-xl border p-3.5 text-left transition ${
                      active
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-slate-200 bg-white hover:border-orange-200'
                    }`}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-base">
                      {cat.icon}
                    </span>
                    <p className="mt-2.5 text-sm font-bold capitalize text-slate-900">{cat.label}</p>
                    <p className="text-xs text-slate-500">
                      {cat.count} product{cat.count !== 1 ? 's' : ''}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

            <div id="products" className="relative scroll-mt-24 pt-6 sm:pt-8">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-600">
                    Our collection
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
                    {activeCategory === 'all' ? 'All products' : activeCategory}
                  </h3>
                </div>
                <p className="text-sm font-medium text-slate-500">
                  {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              </div>

              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse overflow-hidden rounded-2xl border border-slate-100 bg-slate-50"
                    >
                      <div className="aspect-[4/3] bg-slate-200" />
                      <div className="space-y-2 p-4">
                        <div className="h-4 w-3/4 rounded bg-slate-200" />
                        <div className="h-3 w-1/2 rounded bg-slate-200" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <motion.div
                  key={activeCategory}
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  {filteredProducts.map((product) => (
                    <motion.article
                      key={product.id}
                      variants={cardReveal}
                      whileHover={{ y: -5 }}
                      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-orange-300"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                        <img
                          src={product.image}
                          alt={product.title}
                          loading="lazy"
                          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = defaultCardImage;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/25 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                        <span className="absolute left-3 top-3 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-700">
                          {product.label}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <h3 className="line-clamp-2 font-bold capitalize leading-snug text-slate-950">
                          {product.title}
                        </h3>
                        <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                          {product.category}
                        </p>
                        <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                          <p className="text-base font-bold text-orange-600">₹{product.price}/kg</p>
                          <Link
                            to={orderLink(product.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-700"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            Order
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              ) : products.length > 0 ? (
                <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/30 p-10 text-center">
                  <p className="text-slate-600">No products in this category yet.</p>
                  <button
                    type="button"
                    onClick={() => setActiveCategory('all')}
                    className="mt-4 text-sm font-semibold text-orange-600 hover:underline"
                  >
                    View all products
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-600">
                  {error || 'No products found in the database.'}
                </div>
              )}
            </div>
        </motion.section>

        {/* Testimonials */}
        {testimonialItems.length > 0 && (
          <motion.section
            id="testimonials"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={sectionReveal}
            className="mt-12 scroll-mt-24 border-t border-slate-200 py-10 sm:py-12"
          >
            <Reveal className="mb-8 text-center sm:mb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
                Testimonials
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-slate-950 sm:text-4xl">
                What Our Customers Say
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                Real stories from celebrations made sweeter with ShopSweet.
              </p>
            </Reveal>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              className="grid gap-6 sm:grid-cols-2"
            >
              {testimonialItems.map((item, idx) => (
                <motion.blockquote
                  key={item.id || `t-${idx}`}
                  variants={cardReveal}
                  className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex items-center gap-4">
                    <TestimonialAvatar item={item} className="h-14 w-14" />
                    <footer>
                      <p className="font-semibold text-slate-950">{item.name}</p>
                      {item.role && (
                        <p className="text-xs font-medium text-orange-600">{item.role}</p>
                      )}
                    </footer>
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </motion.blockquote>
              ))}
            </motion.div>
          </motion.section>
        )}
      </div>

      <SiteFooter />
    </main>
  );
};

export default HomePage;
