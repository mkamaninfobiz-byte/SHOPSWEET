import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  IndianRupee,
  Package,
  ShoppingBag,
  Users,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { fetchDashboardStats } from '../api/dashboard';
import {
  AdminPageHeader,
  AdminCard,
  AdminStatCard,
  adminStagger,
  adminItem,
} from '../components/admin/AdminPrimitives';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    Number(amount || 0)
  );

const statusTone = (status) => {
  const s = (status || '').toLowerCase();
  if (s.includes('deliver') || s.includes('complete')) return 'text-emerald-700 bg-emerald-50';
  if (s.includes('cancel')) return 'text-red-700 bg-red-50';
  if (s.includes('ship')) return 'text-sky-700 bg-sky-50';
  return 'text-amber-700 bg-amber-50';
};

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchDashboardStats();
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
      } catch (err) {
        setError(err?.error || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const quickActions = [
    { title: 'Products', description: 'Manage catalog & inventory', to: '/dashboard/products', color: 'bg-orange-500' },
    { title: 'Orders', description: 'Track and update orders', to: '/dashboard/orders', color: 'bg-amber-500' },
    { title: 'Customers', description: 'View buyer activity', to: '/dashboard/customers', color: 'bg-emerald-500' },
    { title: 'Settings', description: 'Logo & admin profile', to: '/dashboard/settings', color: 'bg-sky-500' },
  ];

  const statCards = stats
    ? [
        {
          title: 'Revenue',
          value: formatCurrency(stats.revenue),
          subtitle: 'From completed orders',
          accent: 'from-orange-500 to-amber-400',
          icon: IndianRupee,
        },
        {
          title: 'Orders',
          value: String(stats.orderCount),
          subtitle: 'Total in database',
          accent: 'from-emerald-500 to-teal-400',
          icon: ShoppingBag,
        },
        {
          title: 'Products',
          value: String(stats.productCount),
          subtitle: 'Active catalog items',
          accent: 'from-sky-500 to-cyan-400',
          icon: Package,
        },
        {
          title: 'Customers',
          value: String(stats.customerCount),
          subtitle: 'Unique order emails',
          accent: 'from-violet-500 to-purple-400',
          icon: Users,
        },
      ]
    : [];

  const statusEntries = stats?.statusCounts
    ? Object.entries(stats.statusCounts).slice(0, 6)
    : [];

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
      </div>
    );
  }

  return (
    <motion.div variants={adminStagger} initial="hidden" animate="visible" className="space-y-6 sm:space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description="Live metrics from your ShopSweet database — orders, products, and customers."
        action={
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
            <Sparkles className="h-3.5 w-3.5" />
            Database synced
          </span>
        }
      />

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      <motion.div variants={adminItem} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <AdminStatCard key={stat.title} {...stat} />
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <AdminCard className="lg:col-span-2">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Recent orders</h2>
              <p className="text-sm text-slate-500">Latest entries from your orders table</p>
            </div>
            <Link
              to="/dashboard/orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700"
            >
              View all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
              No orders yet. New bookings will appear here.
            </p>
          ) : (
            <ul className="space-y-3">
              {recentOrders.map((order, i) => (
                <motion.li
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-gradient-to-r from-white to-slate-50/80 px-4 py-3.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-950">{order.orderId}</p>
                      <p className="truncate text-sm text-slate-500">
                        {order.name} · {order.item}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusTone(order.status)}`}>
                      {order.status}
                    </span>
                    <p className="text-sm font-bold text-slate-950">{formatCurrency(order.amount)}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard>
          <h2 className="text-lg font-bold text-slate-950">Order status</h2>
          <p className="mt-1 text-sm text-slate-500">Breakdown from database</p>
          <ul className="mt-5 space-y-3">
            {statusEntries.length === 0 ? (
              <li className="text-sm text-slate-500">No status data yet.</li>
            ) : (
              statusEntries.map(([label, count]) => (
                <li
                  key={label}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                >
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                  <span className="text-lg font-bold text-slate-950">{count}</span>
                </li>
              ))
            )}
          </ul>
        </AdminCard>
      </div>

      <motion.div variants={adminItem} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.title} to={action.to} className="block">
            <AdminCard className="group h-full !p-4" hover>
              <div className="flex items-start gap-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${action.color} text-white shadow-md`}>
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-950">{action.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{action.description}</p>
                </div>
              </div>
            </AdminCard>
          </Link>
        ))}
      </motion.div>

      <AdminCard className="!p-4">
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Data loaded from MySQL
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            Use the search bar for products, orders & customers
          </span>
        </div>
      </AdminCard>
    </motion.div>
  );
};

export default DashboardPage;
