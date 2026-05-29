import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, LogOut } from 'lucide-react';
import { adminNavigation } from './admin/adminNavConfig';

const Sidebar = ({ isOpen, onClose, onLogout, user }) => {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <aside
        className={`admin-sidebar fixed inset-y-0 left-0 z-50 flex w-[min(100%,18.5rem)] flex-col border-r border-white/10 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative flex h-full flex-col overflow-hidden">
          <div className="pointer-events-none absolute inset-0 admin-sidebar-mesh" />
          <div className="relative flex flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-5">
            <div className="mb-8 flex items-center justify-between gap-3">
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex min-w-0 items-center gap-3"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-amber-400 to-orange-600 text-sm font-bold text-white shadow-lg shadow-orange-500/30">
                  SS
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-white">ShopSweet</h2>
                  <p className="truncate text-[10px] font-medium uppercase tracking-[0.2em] text-orange-200/90">
                    Admin Studio
                  </p>
                </div>
              </motion.div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-orange-200">
                <Sparkles className="h-4 w-4 shrink-0" />
                <p className="text-xs font-medium">Manage store, content & orders</p>
              </div>
              {user?.name && (
                <p className="mt-2 truncate text-sm font-semibold text-white">{user.name}</p>
              )}
              {user?.email && (
                <p className="truncate text-xs text-slate-400">{user.email}</p>
              )}
            </div>

            <nav className="flex-1 space-y-1">
              {adminNavigation.map((item, index) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end={item.path === '/dashboard'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 ${
                        isActive ? 'text-white' : 'text-slate-300 hover:bg-white/8 hover:text-white'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            layoutId="admin-nav-active"
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-3">
                          <Icon
                            className={`h-[1.125rem] w-[1.125rem] shrink-0 ${isActive ? 'text-white' : 'text-orange-300/90 group-hover:text-orange-200'}`}
                          />
                          <motion.span
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            {item.name}
                          </motion.span>
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            <div className="mt-6 border-t border-white/10 pt-5">
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-100"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
