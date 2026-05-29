import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';
import { login } from '../api/auth';

const LoginPage = ({ onLogin }) => {
  const [values, setValues] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyHeight = body.style.height;
    const prevHtmlHeight = html.style.height;
    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    body.style.height = '100dvh';
    html.style.height = '100dvh';
    html.classList.add('login-route');
    return () => {
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
      body.style.height = prevBodyHeight;
      html.style.height = prevHtmlHeight;
      html.classList.remove('login-route');
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(values);
      onLogin(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex h-[100dvh] max-h-[100dvh] w-full items-center justify-center overflow-hidden overscroll-none bg-gradient-to-br from-slate-50 via-white to-orange-50/40 p-3 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(251,146,60,0.08),transparent_42%),radial-gradient(circle_at_80%_85%,rgba(56,189,248,0.06),transparent_40%)]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex max-h-[calc(100dvh-2rem)] w-full max-w-[400px] flex-col"
      >
        <div className="flex max-h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          <div className="shrink-0 border-b border-slate-100 bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-5 text-center sm:px-6 sm:py-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-lg font-bold text-white ring-1 ring-white/30">
              SS
            </div>
            <h1 className="mt-3 text-xl font-bold text-white sm:text-2xl">Admin Sign In</h1>
            <p className="mt-1 text-xs text-orange-50 sm:text-sm">ShopSweet store control panel</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6"
          >
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Email</span>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={values.email}
                    onChange={(e) => setValues({ ...values, email: e.target.value })}
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="admin@shopsweet.local"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-950 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Password</span>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={values.password}
                    onChange={(e) => setValues({ ...values, password: e.target.value })}
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-950 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </label>

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition hover:brightness-105 disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign in to dashboard'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-orange-700">
                <Sparkles className="h-3 w-3" />
                Default admin
              </p>
              <p className="mt-1.5 break-all text-xs text-slate-600">
                <span className="font-semibold text-slate-800">admin@shopsweet.local</span>
                <span className="text-slate-300"> · </span>
                <span className="font-semibold text-slate-800">Admin123!</span>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
