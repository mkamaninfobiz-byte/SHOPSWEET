import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, ShoppingBag, Users, Loader2 } from 'lucide-react';
import { searchDashboard } from '../../api/dashboard';
import { getProductImageUrl } from '../../utils/productHelpers';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    Number(amount || 0)
  );

const AdminSearchBar = ({ className = '' }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ products: [], orders: [], customers: [] });
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ products: [], orders: [], customers: [] });
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchDashboard(query.trim());
        setResults(data);
        setOpen(true);
      } catch {
        setResults({ products: [], orders: [], customers: [] });
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const hasResults =
    results.products.length > 0 || results.orders.length > 0 || results.customers.length > 0;

  const go = (path) => {
    setOpen(false);
    setQuery('');
    navigate(path);
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value.trim()) setOpen(true);
        }}
        onFocus={() => query.trim() && setOpen(true)}
        placeholder="Search orders, products, customers..."
        className="w-full rounded-xl border border-slate-200/90 bg-white/90 py-2.5 pl-10 pr-10 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        autoComplete="off"
      />
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-orange-500" />
      )}

      <AnimatePresence>
        {open && query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[min(70vh,24rem)] overflow-y-auto rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            {!loading && !hasResults && (
              <p className="px-4 py-6 text-center text-sm text-slate-500">No results for &ldquo;{query}&rdquo;</p>
            )}

            {results.products.length > 0 && (
              <div className="border-b border-slate-100 p-2 dark:border-slate-800">
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Products</p>
                {results.products.map((product) => (
                  <button
                    key={product.id || product.sku}
                    type="button"
                    onClick={() => go(`/dashboard/products/${product.sku || product.id}`)}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-orange-50 dark:hover:bg-slate-800"
                  >
                    <img
                      src={getProductImageUrl(product)}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.category} · ₹{product.price}</p>
                    </div>
                    <Package className="h-4 w-4 shrink-0 text-orange-500" />
                  </button>
                ))}
              </div>
            )}

            {results.orders.length > 0 && (
              <div className="border-b border-slate-100 p-2 dark:border-slate-800">
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Orders</p>
                {results.orders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => go('/dashboard/orders')}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-orange-50 dark:hover:bg-slate-800"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {order.orderId}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {order.name} · {order.item}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {formatCurrency(order.amount)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {results.customers.length > 0 && (
              <div className="p-2">
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Customers</p>
                {results.customers.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => go('/dashboard/customers')}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-orange-50 dark:hover:bg-slate-800"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{customer.name}</p>
                      <p className="truncate text-xs text-slate-500">{customer.email}</p>
                    </div>
                    <span className="text-xs text-slate-500">{customer.orders} orders</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSearchBar;
