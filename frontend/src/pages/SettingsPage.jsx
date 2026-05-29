import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, User, Store, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { fetchSiteSettings, updateSiteSettings, uploadSiteLogo, getLogoUrl } from '../api/settings';
import { fetchProfile, updateProfile } from '../api/auth';
import {
  AdminPageHeader,
  AdminCard,
  AdminAlert,
  adminInputClass,
  adminLabelClass,
  adminPrimaryBtn,
  adminSecondaryBtn,
  adminStagger,
  adminItem,
} from '../components/admin/AdminPrimitives';

const SettingsPage = ({ user, onUserUpdate }) => {
  const [site, setSite] = useState({ brandName: 'ShopSweet', tagline: '', logoUrl: null });
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [profile, setProfile] = useState({ name: '', email: '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [savingSite, setSavingSite] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const [settings, profileRes] = await Promise.all([
          fetchSiteSettings(),
          fetchProfile().catch(() => null),
        ]);
        setSite(settings);
        setLogoPreview(getLogoUrl(settings.logoUrl) || '');
        const u = profileRes?.user || user;
        if (u) {
          setProfile((prev) => ({
            ...prev,
            name: u.name || '',
            email: u.email || '',
          }));
        }
      } catch {
        setMessage({ type: 'error', text: 'Failed to load settings.' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload a valid image file.' });
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setMessage({ type: '', text: '' });
  };

  const handleSaveSite = async (e) => {
    e.preventDefault();
    setSavingSite(true);
    setMessage({ type: '', text: '' });
    try {
      let logoUrl = site.logoUrl;
      if (logoFile) {
        const upload = await uploadSiteLogo(logoFile);
        logoUrl = upload.logoUrl;
        setLogoFile(null);
      }
      const updated = await updateSiteSettings({
        brandName: site.brandName.trim(),
        tagline: site.tagline.trim(),
        logoUrl,
      });
      setSite(updated);
      setLogoPreview(getLogoUrl(updated.logoUrl) || '');
      window.dispatchEvent(new CustomEvent('shopsweet:settings-updated', { detail: updated }));
      setMessage({ type: 'success', text: 'Website branding saved.' });
    } catch (err) {
      setMessage({ type: 'error', text: err?.error || 'Failed to save branding.' });
    } finally {
      setSavingSite(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setSavingProfile(true);
    setMessage({ type: '', text: '' });
    try {
      const data = await updateProfile({
        name: profile.name.trim(),
        email: profile.email.trim(),
        currentPassword: profile.currentPassword || undefined,
        newPassword: profile.newPassword || undefined,
      });
      if (data.token) localStorage.setItem('shopsweet_token', data.token);
      onUserUpdate?.(data.user);
      setProfile((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setMessage({ type: 'success', text: 'Admin profile updated.' });
    } catch (err) {
      setMessage({ type: 'error', text: err?.error || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
      </div>
    );
  }

  return (
    <motion.div variants={adminStagger} initial="hidden" animate="visible" className="space-y-6">
      <AdminPageHeader
        title="Settings"
        description="Upload your website logo and manage your admin account."
      />

      {message.text && (
        <AdminAlert type={message.type === 'success' ? 'success' : 'error'}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {message.text}
        </AdminAlert>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">Website branding</h2>
              <p className="text-sm text-slate-500">Logo appears in the site navbar</p>
            </div>
          </div>

          <form onSubmit={handleSaveSite} className="space-y-5">
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-6 sm:flex-row sm:items-start">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-24 w-24 rounded-2xl border border-white bg-white object-contain p-2 shadow-sm"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-orange-200 bg-white text-orange-400">
                  <ImageIcon className="h-10 w-10" />
                </div>
              )}
              <div className="text-center sm:text-left">
                <label className={`${adminSecondaryBtn} cursor-pointer`}>
                  <Upload className="h-4 w-4" />
                  Upload logo
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                </label>
                <p className="mt-2 text-xs text-slate-500">PNG, JPG or WEBP · max 2MB</p>
              </div>
            </div>

            <div>
              <label className={adminLabelClass}>Brand name</label>
              <input
                type="text"
                value={site.brandName}
                onChange={(e) => setSite({ ...site, brandName: e.target.value })}
                className={adminInputClass}
                required
              />
            </div>
            <div>
              <label className={adminLabelClass}>Tagline</label>
              <input
                type="text"
                value={site.tagline}
                onChange={(e) => setSite({ ...site, tagline: e.target.value })}
                className={adminInputClass}
                placeholder="Fresh mithai for every celebration"
              />
            </div>

            <button type="submit" disabled={savingSite} className={`${adminPrimaryBtn} disabled:opacity-50`}>
              <Save className="h-4 w-4" />
              {savingSite ? 'Saving...' : 'Save branding'}
            </button>
          </form>
        </AdminCard>

        <AdminCard>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">Admin profile</h2>
              <p className="text-sm text-slate-500">Update your name, email & password</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className={adminLabelClass}>Full name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className={adminInputClass}
                required
              />
            </div>
            <div>
              <label className={adminLabelClass}>Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className={adminInputClass}
                required
              />
            </div>
            <div className="border-t border-slate-100 pt-4">
              <p className="text-sm font-semibold text-slate-700">Change password</p>
              <p className="mt-1 text-xs text-slate-500">Leave blank to keep current password</p>
            </div>
            <div>
              <label className={adminLabelClass}>Current password</label>
              <input
                type="password"
                value={profile.currentPassword}
                onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })}
                className={adminInputClass}
                autoComplete="current-password"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={adminLabelClass}>New password</label>
                <input
                  type="password"
                  value={profile.newPassword}
                  onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
                  className={adminInputClass}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className={adminLabelClass}>Confirm password</label>
                <input
                  type="password"
                  value={profile.confirmPassword}
                  onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                  className={adminInputClass}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button type="submit" disabled={savingProfile} className={`${adminPrimaryBtn} disabled:opacity-50`}>
              <Save className="h-4 w-4" />
              {savingProfile ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        </AdminCard>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
