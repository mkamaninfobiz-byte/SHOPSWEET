import { useEffect, useMemo, useState } from 'react';
import { deleteOrder, fetchOrders, updateOrder } from '../api/orders';
import TableActionButtons from '../components/TableActionButtons';

const statusStyles = {
  Completed: 'bg-emerald-100 text-emerald-700',
  Delivered: 'bg-emerald-100 text-emerald-700',
  Processing: 'bg-amber-100 text-amber-700',
  Shipped: 'bg-sky-100 text-sky-700',
  Cancelled: 'bg-rose-100 text-rose-700',
  Pending: 'bg-orange-100 text-orange-700',
};

const paymentStyles = {
  Paid: 'bg-emerald-100 text-emerald-700',
  cod: 'bg-slate-100 text-slate-700',
  COD: 'bg-slate-100 text-slate-700',
  Refunded: 'bg-slate-100 text-slate-700',
};

const parseItems = (order) => {
  try {
    const raw = order.items;
    const items = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
};

const formatRupee = (amount) => {
  const value = Number(amount);
  if (Number.isNaN(value)) return '—';
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [editingOrder, setEditingOrder] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const data = await fetchOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setFetchError(err?.error || err?.message || 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const formatOrderDate = (order) => {
    const rawDate = order.created_at || order.date || order.updated_at;
    if (!rawDate) return { date: '—', time: '' };
    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) return { date: String(rawDate), time: '' };
    return {
      date: parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      time: parsed.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const formatDeliveryDate = (order) => {
    if (!order.date) return '—';
    const parsed = new Date(order.date);
    if (Number.isNaN(parsed.getTime())) return String(order.date);
    return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getProductSummary = (order) => {
    const items = parseItems(order);
    if (items.length === 0) return '—';
    return items
      .map((item) => {
        const qty = item.quantity || 1;
        const name = item.product_name || item.name || 'Product';
        return `${qty}× ${name}`;
      })
      .join(', ');
  };

  const getOrderAmount = (order) => {
    const total = order.total_amount ?? order.totalAmount ?? order.amount;
    if (total != null && total !== '') return formatRupee(total);
    const items = parseItems(order);
    const fromItems = items.reduce(
      (sum, item) => sum + (Number(item.unit_price) || 0) * (Number(item.quantity) || 1),
      0
    );
    if (fromItems > 0) {
      const delivery = Number(order.delivery_charges) || 0;
      const packaging = Number(order.packaging_charges) || 0;
      return formatRupee(fromItems + delivery + packaging);
    }
    return '—';
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === 'All Status' || (order.status || 'Pending') === statusFilter;
      if (!matchesStatus) return false;
      if (!query) return true;
      const items = parseItems(order);
      const productText = items.map((i) => i.product_name || '').join(' ');
      const haystack = [
        order.order_id,
        order.id,
        order.name,
        order.email,
        order.phone,
        order.city,
        order.state,
        order.address,
        productText,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [orders, search, statusFilter]);

  const openEditOrder = (order) => {
    setEditingOrder(order);
    setEditValues({
      name: order.name || '',
      email: order.email || '',
      phone: order.phone || '',
      address: order.address || '',
      city: order.city || '',
      state: order.state || '',
      pincode: order.pincode || '',
      status: order.status || 'Pending',
      payment_method: order.payment_method || 'cod',
      notes: order.notes || '',
    });
    setActionError('');
    setActionMessage('');
  };

  const handleSaveOrder = async (event) => {
    event.preventDefault();
    if (!editingOrder) return;
    setSaving(true);
    setActionError('');
    setActionMessage('');
    try {
      const updated = await updateOrder(editingOrder.id, editValues);
      setOrders((prev) => prev.map((o) => (o.id === editingOrder.id ? { ...o, ...updated } : o)));
      setEditingOrder(null);
      setActionMessage('Order updated successfully.');
    } catch (err) {
      setActionError(err?.error || err?.message || 'Unable to update order.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrder = async (order) => {
    const orderLabel = order.order_id || order.id;
    if (!window.confirm(`Delete order ${orderLabel}? This cannot be undone.`)) return;
    setActionError('');
    setActionMessage('');
    try {
      await deleteOrder(order.id);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      if (editingOrder?.id === order.id) setEditingOrder(null);
      setActionMessage('Order deleted successfully.');
    } catch (err) {
      setActionError(err?.error || err?.message || 'Unable to delete order.');
    }
  };

  const totalRevenue = useMemo(
    () =>
      orders.reduce((sum, order) => {
        const amount = Number(order.total_amount);
        return sum + (Number.isNaN(amount) ? 0 : amount);
      }, 0),
    [orders]
  );

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Orders</h1>
            <p className="mt-2 text-sm text-slate-500">
              All customer orders from the order form are saved here automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={loadOrders}
            className="rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Refresh Orders
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: 'Total Orders',
              value: orders.length.toString(),
              detail: 'From database',
              accent: 'bg-pink-100 text-pink-700',
              icon: '📦',
            },
            {
              label: 'Pending Orders',
              value: orders.filter((o) => !o.status || o.status === 'Pending').length.toString(),
              detail: 'Awaiting processing',
              accent: 'bg-amber-100 text-amber-700',
              icon: '⏳',
            },
            {
              label: 'Completed Orders',
              value: orders.filter((o) => o.status === 'Completed' || o.status === 'Delivered').length.toString(),
              detail: 'Successfully placed',
              accent: 'bg-emerald-100 text-emerald-700',
              icon: '✅',
            },
            {
              label: 'Total Revenue',
              value: formatRupee(totalRevenue),
              detail: 'From placed orders',
              accent: 'bg-sky-100 text-sky-700',
              icon: '₹',
            },
          ].map((stat) => (
            <div key={stat.label} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-3xl ${stat.accent}`}>
                <span>{stat.icon}</span>
              </div>
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">{stat.label}</p>
              <p className="mt-4 text-3xl font-semibold text-slate-950">{stat.value}</p>
              <p className="mt-2 text-sm text-slate-500">{stat.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_auto]">
            <div className="relative rounded-3xl border border-slate-200 bg-slate-50 px-5 py-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone, order id, city..."
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-700 outline-none"
            >
              <option>All Status</option>
              <option>Completed</option>
              <option>Pending</option>
              <option>Processing</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('All Status');
              }}
              className="rounded-3xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Reset
            </button>
          </div>
        </div>

        {(actionMessage || actionError) && (
          <div
            className={`mt-6 rounded-3xl border px-5 py-4 text-sm ${
              actionError
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            {actionError || actionMessage}
          </div>
        )}

        {editingOrder && (
          <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-950">
                Edit Order — {editingOrder.order_id || editingOrder.id}
              </h3>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleSaveOrder} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {['name', 'email', 'phone', 'address', 'city', 'state', 'pincode'].map((field) => (
                <label key={field} className="block text-sm text-slate-700">
                  <span className="font-medium capitalize">{field}</span>
                  <input
                    value={editValues[field] || ''}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, [field]: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-pink-500"
                  />
                </label>
              ))}
              <label className="block text-sm text-slate-700">
                <span className="font-medium">Status</span>
                <select
                  value={editValues.status || 'Pending'}
                  onChange={(e) => setEditValues((prev) => ({ ...prev, status: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-pink-500"
                >
                  {['Pending', 'Processing', 'Shipped', 'Delivered', 'Completed', 'Cancelled'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-slate-700">
                <span className="font-medium">Payment</span>
                <select
                  value={editValues.payment_method || 'cod'}
                  onChange={(e) => setEditValues((prev) => ({ ...prev, payment_method: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-pink-500"
                >
                  <option value="cod">COD</option>
                  <option value="paid">Paid</option>
                </select>
              </label>
              <label className="block text-sm text-slate-700 sm:col-span-2 lg:col-span-3">
                <span className="font-medium">Notes</span>
                <textarea
                  rows={2}
                  value={editValues.notes || ''}
                  onChange={(e) => setEditValues((prev) => ({ ...prev, notes: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-pink-500"
                />
              </label>
              <div className="flex gap-3 sm:col-span-2 lg:col-span-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-gradient-to-r from-pink-600 to-orange-500 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="rounded-[28px] bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-4 font-semibold text-slate-500">Order ID</th>
                <th className="px-4 py-4 font-semibold text-slate-500">Customer</th>
                <th className="px-4 py-4 font-semibold text-slate-500">Address</th>
                <th className="px-4 py-4 font-semibold text-slate-500">Products</th>
                <th className="px-4 py-4 font-semibold text-slate-500">Delivery</th>
                <th className="px-4 py-4 font-semibold text-slate-500">Placed On</th>
                <th className="px-4 py-4 font-semibold text-slate-500">Status</th>
                <th className="px-4 py-4 font-semibold text-slate-500">Amount</th>
                <th className="px-4 py-4 font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-sm text-slate-500">
                    Loading orders...
                  </td>
                </tr>
              ) : fetchError ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-sm text-rose-600">
                    {fetchError}
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-sm text-slate-500">
                    No orders found. Orders placed from the order page will appear here.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const { date, time } = formatOrderDate(order);
                  return (
                    <tr key={order.id} className="align-top hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-950">{order.order_id || order.id}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {(order.payment_method || 'cod').toUpperCase()}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-950">{order.name || '—'}</div>
                        <div className="mt-1 text-xs text-slate-500">{order.phone}</div>
                        {order.email && (
                          <div className="mt-0.5 text-xs text-slate-400">{order.email}</div>
                        )}
                      </td>
                      <td className="max-w-[200px] px-4 py-4">
                        <div className="text-slate-800">{order.address || '—'}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {[order.city, order.state, order.pincode].filter(Boolean).join(', ') || '—'}
                        </div>
                        {order.different_address ? (
                          <span className="mt-1 inline-block text-xs text-amber-600">Alt. address</span>
                        ) : null}
                      </td>
                      <td className="max-w-[180px] px-4 py-4">
                        <div className="font-medium text-slate-800">{getProductSummary(order)}</div>
                        {order.notes ? (
                          <div className="mt-1 line-clamp-2 text-xs text-slate-400" title={order.notes}>
                            Note: {order.notes}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">{formatDeliveryDate(order)}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">{date}</div>
                        {time && <div className="mt-1 text-xs text-slate-500">{time}</div>}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            statusStyles[order.status || 'Pending'] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {order.status || 'Pending'}
                        </span>
                        <span
                          className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            paymentStyles[order.payment_method || 'COD'] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {(order.payment_method || 'COD').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-semibold text-orange-600">
                        {getOrderAmount(order)}
                      </td>
                      <td className="px-4 py-4">
                        <TableActionButtons
                          onEdit={() => openEditOrder(order)}
                          onDelete={() => handleDeleteOrder(order)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-6 text-sm text-slate-500">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
