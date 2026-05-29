import { useEffect, useState } from 'react';
import { ChevronDown, Plus, Save, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { fetchFooterSettings, updateFooterSettings } from '../api/footer';

const FooterManagementPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchFooterSettings()
      .then(setData)
      .catch(() => setMessage({ type: 'error', text: 'Failed to load footer settings.' }))
      .finally(() => setLoading(false));
  }, []);

  const updateLink = (index, field, value) => {
    const quickLinks = [...(data.quickLinks || [])];
    quickLinks[index] = { ...quickLinks[index], [field]: value };
    setData({ ...data, quickLinks });
  };

  const addLink = () => {
    setData({
      ...data,
      quickLinks: [...(data.quickLinks || []), { label: '', to: '/' }],
    });
  };

  const removeLink = (index) => {
    setData({
      ...data,
      quickLinks: (data.quickLinks || []).filter((_, i) => i !== index),
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const updated = await updateFooterSettings(data);
      setData(updated);
      setMessage({ type: 'success', text: 'Footer saved successfully.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err?.error || 'Failed to save footer.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-red-600">Unable to load footer settings.</p>;
  }

  return (
    <div className="space-y-6">
      {message.text && (
        <div
          className={`flex items-center gap-3 rounded-lg p-4 ${
            message.type === 'success'
              ? 'border border-green-200 bg-green-50 text-green-800'
              : 'border border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {message.text}
        </div>
      )}

      <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between p-6 hover:bg-slate-50"
        >
          <div className="text-left">
            <h2 className="text-xl font-semibold text-slate-950">Footer</h2>
            <p className="mt-1 text-sm text-slate-500">Edit site-wide footer content and links.</p>
          </div>
          <ChevronDown className={`h-5 w-5 transition ${expanded ? 'rotate-180' : ''}`} />
        </button>

        {expanded && (
          <form onSubmit={handleSave} className="space-y-6 border-t border-slate-200 px-4 pb-6 pt-4 sm:px-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-950">Brand name</label>
                <input
                  type="text"
                  value={data.brandName}
                  onChange={(e) => setData({ ...data, brandName: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-950">Tagline</label>
                <input
                  type="text"
                  value={data.tagline}
                  onChange={(e) => setData({ ...data, tagline: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-950">Description</label>
              <textarea
                value={data.description}
                onChange={(e) => setData({ ...data, description: e.target.value })}
                rows={3}
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-950">Quick links</h3>
              <div className="mt-3 space-y-3">
                {(data.quickLinks || []).map((link, index) => (
                  <div key={index} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      placeholder="Label"
                      value={link.label}
                      onChange={(e) => updateLink(index, 'label', e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="/path"
                      value={link.to}
                      onChange={(e) => updateLink(index, 'to', e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="self-end rounded-lg p-2 text-red-600 hover:bg-red-50 sm:self-center"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addLink}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-orange-600"
              >
                <Plus className="h-4 w-4" />
                Add link
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-slate-950">Address</label>
                <input
                  type="text"
                  value={data.address}
                  onChange={(e) => setData({ ...data, address: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-950">Phone</label>
                <input
                  type="text"
                  value={data.phone}
                  onChange={(e) => setData({ ...data, phone: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-950">Email</label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-950">Copyright text</label>
                <input
                  type="text"
                  value={data.copyrightText}
                  onChange={(e) => setData({ ...data, copyrightText: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-950">Bottom tagline</label>
                <input
                  type="text"
                  value={data.bottomTagline}
                  onChange={(e) => setData({ ...data, bottomTagline: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FooterManagementPage;
