import { useState, useEffect } from 'react';
import { ChevronDown, Save, AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react';
import {
  fetchAboutContent,
  updateAboutContent,
  updateAboutCoreValues,
  updateAboutWhyChoose,
  updateAboutStats,
} from '../api/about';

const AboutManagementPage = ({ user }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [expandedSections, setExpandedSections] = useState({
    stats: true,
    general: false,
    values: false,
    whychoose: false,
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const data = await fetchAboutContent();
      // Normalize array-based sections to single-object structure for admin form
      const normalized = {
        ...data,
        stats: Array.isArray(data.stats)
          ? data.stats.map((item, index) => ({
              id: item.id || `stat-${index + 1}`,
              number: item.number || item.value || '',
              label: item.label || '',
            }))
          : [],
        whyChoose: Array.isArray(data.whyChoose) ? data.whyChoose[0] || { title: '', desc: '' } : data.whyChoose || { title: '', desc: '' },
        coreValues: Array.isArray(data.coreValues) ? data.coreValues[0] || { title: '', desc: '' } : data.coreValues || { title: '', desc: '' },
      };
      setContent(normalized);
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load content' });
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateStatField = (index, field, value) => {
    const updated = [...(content.stats || [])];
    updated[index] = { ...updated[index], [field]: value };
    setContent({ ...content, stats: updated });
  };

  const addStatRow = () => {
    const updated = [...(content.stats || [])];
    updated.push({ id: `stat-${Date.now()}`, number: '', label: '' });
    setContent({ ...content, stats: updated });
  };

  const removeStatRow = (index) => {
    const updated = (content.stats || []).filter((_, i) => i !== index);
    setContent({ ...content, stats: updated });
  };

  const handleStatsUpdate = async () => {
    setSaving(true);
    try {
      const payload = (content.stats || []).filter((item) => item.number?.trim() || item.label?.trim());
      if (payload.length === 0) {
        setMessage({ type: 'error', text: 'Add at least one stat with a number and label.' });
        setSaving(false);
        return;
      }
      const updated = await updateAboutStats(payload);
      setContent((prev) => ({
        ...prev,
        ...updated,
        stats: updated.stats,
        whyChoose: prev.whyChoose,
        coreValues: prev.coreValues,
      }));
      setMessage({ type: 'success', text: 'Homepage stats saved! They will show on Home and About pages.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.error || 'Failed to update stats' });
    } finally {
      setSaving(false);
    }
  };

  const handleGeneralUpdate = async () => {
    setSaving(true);
    try {
      const updated = await updateAboutContent(
        {
          heading: content.heading,
          tagline: content.tagline,
          story: content.story,
          commitment: content.commitment,
        },
        user.token
      );
      setContent(updated);
      setMessage({ type: 'success', text: 'General content updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.error || 'Failed to update' });
    } finally {
      setSaving(false);
    }
  };

  const handleValuesUpdate = async () => {
    setSaving(true);
    try {
      const server = await fetchAboutContent();
      const existing = Array.isArray(server.coreValues) ? server.coreValues : [];
      const item = content.coreValues || { title: '', desc: '' };
      if (!item.title?.trim() && !item.desc?.trim()) {
        setMessage({ type: 'error', text: 'Please enter a title or description before saving.' });
        setSaving(false);
        return;
      }
      const payload = [...existing, item];
      const updated = await updateAboutCoreValues(payload, user.token);
      // clear the local form so admin can add another
      setContent({ ...content, coreValues: { title: '', desc: '' } });
      setMessage({ type: 'success', text: 'Core value saved! You can add another.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.error || 'Failed to update' });
    } finally {
      setSaving(false);
    }
  };

  const handleWhyChooseUpdate = async () => {
    setSaving(true);
    try {
      // fetch current server state to append new entry
      const server = await fetchAboutContent();
      const existing = Array.isArray(server.whyChoose) ? server.whyChoose : [];
      // don't add empty items
      const item = content.whyChoose || { title: '', desc: '' };
      if (!item.title?.trim() && !item.desc?.trim()) {
        setMessage({ type: 'error', text: 'Please enter a title or description before saving.' });
        setSaving(false);
        return;
      }
      const payload = [...existing, item];
      const updated = await updateAboutWhyChoose(payload, user.token);
      // after successful save, reset the local form so admin can add another
      setContent({ ...content, whyChoose: { title: '', desc: '' } });
      setMessage({ type: 'success', text: 'Why Choose item saved! You can add another.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.error || 'Failed to update' });
    } finally {
      setSaving(false);
    }
  };

  const updateValueField = (field, value) => {
    const updated = { ...(content.coreValues || {}) };
    updated[field] = value;
    setContent({ ...content, coreValues: updated });
  };

  const updateWhyChooseField = (field, value) => {
    const updated = { ...(content.whyChoose || {}) };
    updated[field] = value;
    setContent({ ...content, whyChoose: updated });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center text-red-600">
        <p>Failed to load content</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message Alert */}
      {message.text && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Homepage Stats Section */}
      <div className="rounded-[1.75rem] border border-orange-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection('stats')}
          className="flex w-full items-center justify-between p-6 transition hover:bg-orange-50/50"
        >
          <div className="text-left">
            <h2 className="text-xl font-semibold text-slate-950">Homepage Stats</h2>
            <p className="mt-1 text-sm text-slate-500">
              Shown on the home page and about page (e.g. 20+ Years of Expertise).
            </p>
          </div>
          <ChevronDown
            className={`h-5 w-5 shrink-0 transition ${expandedSections.stats ? 'rotate-180' : ''}`}
          />
        </button>
        {expandedSections.stats && (
          <form
            className="space-y-6 border-t border-slate-200 px-6 pb-6 pt-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleStatsUpdate();
            }}
          >
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="w-12 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      #
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Value
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Label
                    </th>
                    <th className="w-16 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <span className="sr-only">Remove</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(content.stats || []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                        No stats yet. Click &quot;Add stat&quot; to create one.
                      </td>
                    </tr>
                  ) : (
                    (content.stats || []).map((stat, index) => (
                      <tr
                        key={stat.id || `stat-form-${index}`}
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <td className="px-4 py-3 font-medium text-slate-400">{index + 1}</td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={stat.number}
                            onChange={(e) => updateStatField(index, 'number', e.target.value)}
                            placeholder="e.g. 20+"
                            required
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 font-semibold text-orange-600 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={stat.label}
                            onChange={(e) => updateStatField(index, 'label', e.target.value)}
                            placeholder="e.g. Years of Expertise"
                            required
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => removeStatRow(index)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50"
                            aria-label="Remove stat"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {(content.stats || []).some((s) => s.number?.trim() || s.label?.trim()) && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Homepage preview
                </p>
                <div className="grid grid-cols-2 gap-3 rounded-xl border border-orange-100 bg-orange-50/30 p-4 md:grid-cols-4">
                  {(content.stats || [])
                    .filter((s) => s.number?.trim() || s.label?.trim())
                    .map((stat) => (
                      <div
                        key={stat.id}
                        className="rounded-xl border border-orange-100/70 bg-white px-3 py-4 text-center"
                      >
                        <p className="text-xl font-bold text-orange-600">{stat.number || '—'}</p>
                        <p className="mt-1 text-xs font-semibold uppercase text-slate-600">
                          {stat.label || 'Label'}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={addStatRow}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" />
                Add stat
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* General Content Section */}
      <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        <button
          onClick={() => toggleSection('general')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition"
        >
          <h2 className="text-xl font-semibold text-slate-950">General Content</h2>
          <ChevronDown
            className={`h-5 w-5 transition ${expandedSections.general ? 'rotate-180' : ''}`}
          />
        </button>
        {expandedSections.general && (
          <div className="space-y-4 px-6 pb-6 border-t border-slate-200">
            <div>
              <label className="block text-sm font-semibold text-slate-950 mb-2">Heading</label>
              <input
                type="text"
                value={content.heading}
                onChange={(e) => setContent({ ...content, heading: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-950 mb-2">Tagline</label>
              <input
                type="text"
                value={content.tagline}
                onChange={(e) => setContent({ ...content, tagline: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-950 mb-2">Story</label>
              <textarea
                value={content.story}
                onChange={(e) => setContent({ ...content, story: e.target.value })}
                rows="4"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-950 mb-2">Commitment</label>
              <textarea
                value={content.commitment}
                onChange={(e) => setContent({ ...content, commitment: e.target.value })}
                rows="4"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              onClick={handleGeneralUpdate}
              disabled={saving}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save General Content'}
            </button>
          </div>
        )}
      </div>

      {/* Core Values Section (single-object form) */}
      <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        <button
          onClick={() => toggleSection('values')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition"
        >
          <h2 className="text-xl font-semibold text-slate-950">Core Values</h2>
          <ChevronDown
            className={`h-5 w-5 transition ${expandedSections.values ? 'rotate-180' : ''}`}
          />
        </button>
        {expandedSections.values && (
          <div className="space-y-6 px-6 pb-6 border-t border-slate-200">
            <div className="grid gap-4 pb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-950">Title</label>
                  <input
                    type="text"
                    value={content.coreValues?.title || ''}
                    onChange={(e) => updateValueField('title', e.target.value)}
                    className="mt-2 w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-950">Description</label>
                  <input
                    type="text"
                    value={content.coreValues?.desc || ''}
                    onChange={(e) => updateValueField('desc', e.target.value)}
                    className="mt-2 w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
            <div>
                <button
                  onClick={handleValuesUpdate}
                  disabled={saving}
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
            </div>
          </div>
        )}
      </div>

      {/* Why Choose Section (single-object form) */}
      <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        <button
          onClick={() => toggleSection('whychoose')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition"
        >
          <h2 className="text-xl font-semibold text-slate-950">Why Choose Us</h2>
          <ChevronDown
            className={`h-5 w-5 transition ${expandedSections.whychoose ? 'rotate-180' : ''}`}
          />
        </button>
        {expandedSections.whychoose && (
          <div className="space-y-6 px-6 pb-6 border-t border-slate-200">
            <div className="grid gap-4 pb-6">
              <div>
                <label className="text-sm font-semibold text-slate-950">Title</label>
                <input
                  type="text"
                  value={content.whyChoose?.title || ''}
                  onChange={(e) => updateWhyChooseField('title', e.target.value)}
                  className="mt-2 w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-950">Description</label>
                <textarea
                  value={content.whyChoose?.desc || ''}
                  onChange={(e) => updateWhyChooseField('desc', e.target.value)}
                  rows="3"
                  className="mt-2 w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div>
                <button
                  onClick={handleWhyChooseUpdate}
                  disabled={saving}
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutManagementPage;
