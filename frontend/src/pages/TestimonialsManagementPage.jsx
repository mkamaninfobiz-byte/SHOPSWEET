import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save, Trash2, AlertCircle, CheckCircle, Pencil } from 'lucide-react';
import { fetchTestimonials, updateTestimonials, uploadTestimonialPhoto } from '../api/testimonials';
import { getTestimonialPhotoUrl, normalizeTestimonialList } from '../utils/testimonialHelpers';
import {
  AdminPageHeader,
  AdminSection,
  AdminAlert,
  adminInputClass,
  adminLabelClass,
  adminPrimaryBtn,
  adminSecondaryBtn,
  adminStagger,
} from '../components/admin/AdminPrimitives';

const emptyForm = () => ({
  name: '',
  role: '',
  quote: '',
  photoFile: null,
  photoPreview: '',
  imageUrl: '',
});

const TestimonialsManagementPage = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchTestimonials();
        setItems(normalizeTestimonialList(res.items));
      } catch {
        setMessage({ type: 'error', text: 'Failed to load testimonials.' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const revokePreview = (preview) => {
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
  };

  const resetForm = () => {
    revokePreview(form.photoPreview);
    setForm(emptyForm());
    setEditingId(null);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select a valid image (JPG, PNG, WEBP).' });
      return;
    }
    revokePreview(form.photoPreview);
    setForm((prev) => ({
      ...prev,
      photoFile: file,
      photoPreview: URL.createObjectURL(file),
    }));
    setMessage({ type: '', text: '' });
  };

  const handleAddOrUpdateLocal = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.quote.trim()) {
      setMessage({ type: 'error', text: 'Name and quote are required.' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      let imageUrl = form.imageUrl || '';
      if (form.photoFile) {
        const upload = await uploadTestimonialPhoto(form.photoFile);
        imageUrl = upload.url;
      }

      const existing = editingId ? items.find((i) => i.id === editingId) : null;
      const payload = {
        id: editingId || `t-${Date.now()}`,
        name: form.name.trim(),
        role: form.role.trim(),
        quote: form.quote.trim(),
        image_url: imageUrl || existing?.image_url || null,
      };

      if (editingId) {
        setItems((prev) => prev.map((item) => (item.id === editingId ? payload : item)));
        setMessage({ type: 'success', text: 'Testimonial updated in list. Click Save to publish.' });
      } else {
        setItems((prev) => [...prev, payload]);
        setMessage({ type: 'success', text: 'Testimonial added to list. Click Save to publish.' });
      }
      resetForm();
      setTimeout(() => setMessage({ type: '', text: '' }), 2500);
    } catch (err) {
      setMessage({ type: 'error', text: err?.error || 'Failed to upload photo or save item.' });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (item) => {
    revokePreview(form.photoPreview);
    setEditingId(item.id);
    setForm({
      name: item.name || '',
      role: item.role || '',
      quote: item.quote || '',
      photoFile: null,
      photoPreview: getTestimonialPhotoUrl(item) || '',
      imageUrl: item.image_url || item.imageUrl || '',
    });
    setMessage({ type: '', text: '' });
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this testimonial from the list?')) return;
    const nextItems = items.filter((item) => item.id !== id);
    try {
      const updated = await updateTestimonials({ items: nextItems });
      setItems(normalizeTestimonialList(updated.items));
      if (editingId === id) resetForm();
      setMessage({ type: 'success', text: 'Testimonial removed.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 2500);
    } catch (err) {
      setMessage({ type: 'error', text: err?.error || 'Failed to remove testimonial.' });
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const updated = await updateTestimonials({ items });
      setItems(normalizeTestimonialList(updated.items));
      resetForm();
      setMessage({ type: 'success', text: 'Testimonials saved to database.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err?.error || 'Failed to save testimonials.' });
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

  return (
    <motion.div variants={adminStagger} initial="hidden" animate="visible" className="space-y-6">
      <AdminPageHeader
        title="Testimonials"
        description="Manage customer quotes and photos shown on the homepage."
      />

      {message.text && (
        <AdminAlert type={message.type === 'success' ? 'success' : 'error'}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
          {message.text}
        </AdminAlert>
      )}

      <AdminSection title="Testimonial library" description="Add, edit, and publish customer stories.">
          <div className="space-y-8">
            {items.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Saved testimonials ({items.length})
                </h3>
                <ul className="mt-3 space-y-3">
                  {items.map((item) => {
                    const photo = getTestimonialPhotoUrl(item);
                    return (
                      <li
                        key={item.id}
                        className="admin-card flex gap-4 rounded-xl border border-slate-100 bg-white/80 p-4"
                      >
                        {photo ? (
                          <img
                            src={photo}
                            alt={item.name}
                            className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-orange-100"
                          />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs text-orange-600">
                            No photo
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-950">{item.name}</p>
                          {item.role && (
                            <p className="text-xs font-medium text-orange-600">{item.role}</p>
                          )}
                          <p className="mt-2 line-clamp-2 text-sm text-slate-600">&ldquo;{item.quote}&rdquo;</p>
                        </div>
                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(item.id)}
                            className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="rounded-2xl border border-orange-100/80 bg-gradient-to-br from-orange-50/80 to-white p-5 sm:p-6">
              <h3 className="text-base font-semibold text-slate-950">
                {editingId ? 'Edit testimonial' : 'Add testimonial'}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Upload a customer photo — it appears at the top of the testimonial card on the home page.
              </p>

              <form onSubmit={handleAddOrUpdateLocal} className="mt-5 space-y-4">
                <div className="grid gap-6 lg:grid-cols-[140px_1fr]">
                  <div>
                    <label className={adminLabelClass}>Photo</label>
                    <div className="mt-2 flex flex-col items-center gap-3">
                      {form.photoPreview ? (
                        <img
                          src={form.photoPreview}
                          alt="Preview"
                          className="h-28 w-28 rounded-full object-cover ring-4 ring-orange-100"
                        />
                      ) : (
                        <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-orange-200 bg-white text-sm text-orange-600">
                          No photo
                        </div>
                      )}
                      <label className={`${adminSecondaryBtn} cursor-pointer text-xs`}>
                        Upload image
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={adminLabelClass}>Name *</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => handleFormChange('name', e.target.value)}
                          required
                          className={adminInputClass}
                        />
                      </div>
                      <div>
                        <label className={adminLabelClass}>Role / occasion</label>
                        <input
                          type="text"
                          value={form.role}
                          onChange={(e) => handleFormChange('role', e.target.value)}
                          placeholder="Wedding Client"
                          className={adminInputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={adminLabelClass}>Quote *</label>
                      <textarea
                        value={form.quote}
                        onChange={(e) => handleFormChange('quote', e.target.value)}
                        required
                        rows={4}
                        className={adminInputClass}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={uploading}
                    className={`${adminSecondaryBtn} disabled:opacity-50`}
                  >
                    <Plus className="h-4 w-4" />
                    {uploading ? 'Uploading...' : editingId ? 'Update in list' : 'Add to list'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className={adminSecondaryBtn}
                    >
                      Cancel edit
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={saving}
                className={`${adminPrimaryBtn} disabled:opacity-50`}
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
      </AdminSection>
    </motion.div>
  );
};

export default TestimonialsManagementPage;
