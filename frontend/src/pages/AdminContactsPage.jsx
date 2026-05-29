import { useState, useEffect } from 'react';
import { deleteContact, fetchContacts, updateContact } from '../api/contact';
import TableActionButtons from '../components/TableActionButtons';

const AdminContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('');
  const [editingContact, setEditingContact] = useState(null);
  const [editValues, setEditValues] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [saving, setSaving] = useState(false);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchContacts();
      setContacts(data.contacts || []);
    } catch (err) {
      setError(err?.error || err?.message || 'Failed to load contacts.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(filter.toLowerCase()) ||
      contact.email.toLowerCase().includes(filter.toLowerCase()) ||
      contact.subject.toLowerCase().includes(filter.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openEditContact = (contact) => {
    setEditingContact(contact);
    setEditValues({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      subject: contact.subject || '',
      message: contact.message || '',
    });
    setError('');
    setSuccess('');
  };

  const handleSaveContact = async (event) => {
    event.preventDefault();
    if (!editingContact) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await updateContact(editingContact.id, editValues);
      setContacts((prev) => prev.map((c) => (c.id === editingContact.id ? { ...c, ...updated } : c)));
      setEditingContact(null);
      setSuccess('Contact updated successfully.');
    } catch (err) {
      setError(err?.error || err?.message || 'Unable to update contact.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = async (contact) => {
    if (!window.confirm(`Delete message from ${contact.name}? This cannot be undone.`)) return;
    setError('');
    setSuccess('');
    try {
      await deleteContact(contact.id);
      setContacts((prev) => prev.filter((c) => c.id !== contact.id));
      if (editingContact?.id === contact.id) setEditingContact(null);
      setSuccess('Contact deleted successfully.');
    } catch (err) {
      setError(err?.error || err?.message || 'Unable to delete contact.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-950">Contact Messages</h1>
            <p className="mt-2 text-slate-600">View and manage all contact form submissions.</p>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Total Messages</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{contacts.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Unique Senders</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {new Set(contacts.map((c) => c.email)).size}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Today&apos;s Messages</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {
                contacts.filter((c) => {
                  const contactDate = new Date(c.created_at).toDateString();
                  return contactDate === new Date().toDateString();
                }).length
              }
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Popular Subject</p>
            <p className="mt-2 truncate text-lg font-bold text-slate-950">
              {contacts.length > 0
                ? Object.entries(
                    contacts.reduce((acc, c) => {
                      acc[c.subject] = (acc[c.subject] || 0) + 1;
                      return acc;
                    }, {})
                  ).sort((a, b) => b[1] - a[1])[0]?.[0]
                : '-'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="text-2xl font-bold text-slate-950">All Messages</h2>
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 sm:w-64"
            />
          </div>

          {error && <p className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</p>}
          {success && <p className="mb-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">{success}</p>}

          {editingContact && (
            <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-950">Edit Contact — {editingContact.name}</h3>
                <button
                  type="button"
                  onClick={() => setEditingContact(null)}
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
              </div>
              <form onSubmit={handleSaveContact} className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm text-slate-700">
                  Name
                  <input
                    required
                    value={editValues.name}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, name: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-pink-400"
                  />
                </label>
                <label className="block text-sm text-slate-700">
                  Email
                  <input
                    required
                    type="email"
                    value={editValues.email}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, email: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-pink-400"
                  />
                </label>
                <label className="block text-sm text-slate-700">
                  Phone
                  <input
                    required
                    value={editValues.phone}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, phone: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-pink-400"
                  />
                </label>
                <label className="block text-sm text-slate-700">
                  Subject
                  <input
                    value={editValues.subject}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, subject: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-pink-400"
                  />
                </label>
                <label className="block text-sm text-slate-700 sm:col-span-2">
                  Message
                  <textarea
                    required
                    rows={4}
                    value={editValues.message}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, message: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-pink-400"
                  />
                </label>
                <div className="flex gap-3 sm:col-span-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-2xl bg-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-pink-600 disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingContact(null)}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center">
              <p className="text-slate-600">Loading contacts...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-600">No contacts found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Subject</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Message</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-4 font-medium text-slate-900">{contact.name}</td>
                      <td className="px-4 py-4 text-slate-600">
                        <a href={`mailto:${contact.email}`} className="text-pink-600 hover:underline">
                          {contact.email}
                        </a>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{contact.phone}</td>
                      <td className="px-4 py-4">
                        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                          {contact.subject}
                        </span>
                      </td>
                      <td className="max-w-xs truncate px-4 py-4 text-slate-600">{contact.message}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                        {formatDate(contact.created_at)}
                      </td>
                      <td className="px-4 py-4">
                        <TableActionButtons
                          onEdit={() => openEditContact(contact)}
                          onDelete={() => handleDeleteContact(contact)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-sm text-slate-600">
                Showing {filteredContacts.length} of {contacts.length} contacts
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContactsPage;
