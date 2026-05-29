import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Bell, Sun, Moon, ExternalLink } from 'lucide-react';
import AdminSearchBar from './admin/AdminSearchBar';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import PageBackNav from './PageBackNav';
import { AdminPageTransition } from './admin/AdminPrimitives';
import { getAdminPageTitle } from './admin/adminNavConfig';

const Layout = ({ user, onLogout }) => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('shopsweet_dark') === 'true');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const showBack = pathname !== '/dashboard';
  const pageTitle = getAdminPageTitle(pathname);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('shopsweet_dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div
      className={`admin-shell min-h-screen ${
        darkMode ? 'admin-shell-dark text-slate-100' : 'text-slate-900'
      }`}
    >
      <div className="pointer-events-none fixed inset-0 admin-page-bg" aria-hidden />
      <div className="relative lg:flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
          user={user}
        />

        <div className="flex min-h-screen flex-1 flex-col lg:ml-[18.5rem]">
          <motion.header
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="sticky top-0 z-30 border-b border-white/60 bg-white/75 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setSidebarOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-600 lg:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </motion.button>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-orange-600">
                    Control center
                  </p>
                  <h1 className="truncate text-lg font-bold text-slate-950 sm:text-xl dark:text-white">
                    {pageTitle}
                  </h1>
                </div>
              </div>

              <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-2.5">
                <AdminSearchBar className="order-3 hidden w-full max-w-xs lg:order-none lg:block xl:max-w-sm" />
                <div className="order-3 w-full lg:hidden">
                  <AdminSearchBar />
                </div>
                <Link
                  to="/"
                  target="_blank"
                  rel="noreferrer"
                  className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-orange-200 hover:text-orange-600 sm:inline-flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                >
                  View site
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setDarkMode((prev) => !prev)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-700 shadow-sm transition hover:border-orange-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  aria-label="Toggle theme"
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">
                    3
                  </span>
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleLogout}
                  className="rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-orange-500/25 sm:text-sm"
                >
                  Logout
                </motion.button>
              </div>
            </div>
          </motion.header>

          <main className="relative flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            {showBack && <PageBackNav className="mb-4 sm:mb-5" />}
            <AnimatePresence mode="wait">
              <AdminPageTransition key={pathname} className="w-full">
                <Outlet />
              </AdminPageTransition>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
