import { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import TableActionButtons from '../components/TableActionButtons';

const defaultCustomers = [
  { id: 'cust-1', name: 'Mia Torres', email: 'mia@example.com', segment: 'VIP', orders: 18 },
  { id: 'cust-2', name: 'Kevin Lee', email: 'kevin@example.com', segment: 'Loyal', orders: 12 },
  { id: 'cust-3', name: 'Alina Smith', email: 'alina@example.com', segment: 'New', orders: 2 },
];

const normalizeCustomers = (list) =>
  (list || []).map((customer, index) => ({
    ...customer,
    id: customer.id || `cust-${Date.now()}-${index}`,
  }));

const CustomersPage = () => {
  const [customers, setCustomers] = useState(() => {
    const stored = localStorage.getItem('shopsweet_customers');
    const parsed = stored ? JSON.parse(stored) : defaultCustomers;
    return normalizeCustomers(parsed);
  });
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', segment: 'New', orders: 0 });
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editValues, setEditValues] = useState({ name: '', email: '', segment: 'New', orders: 0 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    localStorage.setItem('shopsweet_customers', JSON.stringify(customers));
  }, [customers]);

  const handleChange = (field, value) => {
    setNewCustomer((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditChange = (field, value) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddCustomer = () => {
    if (!newCustomer.name.trim() || !newCustomer.email.trim()) {
      setError('Name and email are required.');
      setSuccess('');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newCustomer.email)) {
      setError('Please enter a valid email address.');
      setSuccess('');
      return;
    }

    const customerToAdd = {
      id: `cust-${Date.now()}`,
      name: newCustomer.name.trim(),
      email: newCustomer.email.trim(),
      segment: newCustomer.segment,
      orders: Number(newCustomer.orders) || 0,
    };

    setCustomers((prev) => [customerToAdd, ...prev]);
    setNewCustomer({ name: '', email: '', segment: 'New', orders: 0 });
    setError('');
    setSuccess('Customer added successfully.');
  };

  const openEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setEditValues({
      name: customer.name || '',
      email: customer.email || '',
      segment: customer.segment || 'New',
      orders: customer.orders ?? 0,
    });
    setError('');
    setSuccess('');
  };

  const handleSaveCustomer = () => {
    if (!editingCustomer) return;
    if (!editValues.name.trim() || !editValues.email.trim()) {
      setError('Name and email are required.');
      return;
    }

    setCustomers((prev) =>
      prev.map((item) =>
        item.id === editingCustomer.id
          ? {
              ...item,
              name: editValues.name.trim(),
              email: editValues.email.trim(),
              segment: editValues.segment,
              orders: Number(editValues.orders) || 0,
            }
          : item
      )
    );
    setEditingCustomer(null);
    setSuccess('Customer updated successfully.');
    setError('');
  };

  const handleDeleteCustomer = (customer) => {
    if (!window.confirm(`Delete customer ${customer.name}? This cannot be undone.`)) return;
    setCustomers((prev) => prev.filter((item) => item.id !== customer.id));
    if (editingCustomer?.id === customer.id) setEditingCustomer(null);
    setSuccess('Customer deleted successfully.');
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Add new customer</h3>
            <p className="mt-1 text-sm text-slate-500">Create a new customer profile for your CRM.</p>
          </div>
          <button
            type="button"
            onClick={handleAddCustomer}
            className="inline-flex shrink-0 items-center justify-center rounded-3xl bg-pink-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-600"
          >
            Add Customer
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input
              value={newCustomer.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Customer name"
              className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-500"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={newCustomer.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-500"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Segment</label>
            <select
              value={newCustomer.segment}
              onChange={(e) => handleChange('segment', e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-500"
            >
              <option value="New">New</option>
              <option value="Loyal">Loyal</option>
              <option value="VIP">VIP</option>
              <option value="At-risk">At-risk</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Orders</label>
            <input
              type="number"
              min="0"
              value={newCustomer.orders}
              onChange={(e) => handleChange('orders', e.target.value)}
              placeholder="0"
              className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-500"
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {success && <p className="mt-4 text-sm text-emerald-600">{success}</p>}
      </div>

      {editingCustomer && (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Edit Customer — {editingCustomer.name}</h3>
            <button
              type="button"
              onClick={() => setEditingCustomer(null)}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <input
              value={editValues.name}
              onChange={(e) => handleEditChange('name', e.target.value)}
              placeholder="Name"
              className="rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-pink-500"
            />
            <input
              type="email"
              value={editValues.email}
              onChange={(e) => handleEditChange('email', e.target.value)}
              placeholder="Email"
              className="rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-pink-500"
            />
            <select
              value={editValues.segment}
              onChange={(e) => handleEditChange('segment', e.target.value)}
              className="rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-pink-500"
            >
              <option value="New">New</option>
              <option value="Loyal">Loyal</option>
              <option value="VIP">VIP</option>
              <option value="At-risk">At-risk</option>
            </select>
            <input
              type="number"
              min="0"
              value={editValues.orders}
              onChange={(e) => handleEditChange('orders', e.target.value)}
              className="rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-pink-500"
            />
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleSaveCustomer}
              className="rounded-2xl bg-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-pink-600"
            >
              Save changes
            </button>
            <button
              type="button"
              onClick={() => setEditingCustomer(null)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <DataTable
        title="Customer profiles"
        rowKey="id"
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'segment', label: 'Segment' },
          { key: 'orders', label: 'Orders' },
        ]}
        rows={customers}
        renderActions={(customer) => (
          <TableActionButtons
            onEdit={() => openEditCustomer(customer)}
            onDelete={() => handleDeleteCustomer(customer)}
          />
        )}
      />
    </div>
  );
};

export default CustomersPage;
