import { useState } from 'react';
import { motion } from 'framer-motion';

export const adminPageVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -12, transition: { duration: 0.28 } },
};

export const adminStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

export const adminItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export const AdminPageTransition = ({ children, className = '' }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    exit="exit"
    variants={adminPageVariants}
    className={className}
  >
    {children}
  </motion.div>
);

export const AdminPageHeader = ({ title, description, action }) => (
  <motion.div
    variants={adminItem}
    className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between"
  >
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-600">Admin</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">{description}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </motion.div>
);

export const AdminCard = ({
  children,
  className = '',
  hover = true,
  padding = 'p-5 sm:p-6',
  as: Component = motion.div,
  ...props
}) => (
  <Component
    variants={adminItem}
    whileHover={hover ? { y: -3, transition: { duration: 0.2 } } : undefined}
    className={`admin-card rounded-2xl border border-white/80 bg-white/90 shadow-[0_8px_32px_rgba(15,23,42,0.06)] backdrop-blur-md ${padding} ${className}`}
    {...props}
  >
    {children}
  </Component>
);

export const AdminStatCard = ({ title, value, subtitle, accent = 'from-orange-500 to-amber-400', icon: Icon }) => (
  <AdminCard className="relative overflow-hidden">
    <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-2xl`} />
    {Icon && (
      <div className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50/90 text-orange-600 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
    )}
    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</p>
    <p className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">{value}</p>
    {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
    <div className={`mt-5 h-1.5 rounded-full bg-gradient-to-r ${accent}`} />
  </AdminCard>
);

export const AdminSection = ({ title, description, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <AdminCard hover={false} padding="p-0" className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-orange-50/40 sm:px-6"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-slate-400">
          ▼
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <div className="border-t border-slate-100 px-5 pb-6 pt-5 sm:px-6">{children}</div>
      </motion.div>
    </AdminCard>
  );
};

export const AdminAlert = ({ type = 'success', children }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
      type === 'success'
        ? 'border border-emerald-200/80 bg-emerald-50 text-emerald-800'
        : 'border border-red-200/80 bg-red-50 text-red-800'
    }`}
  >
    {children}
  </motion.div>
);

export const adminInputClass =
  'mt-1.5 w-full rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100';

export const adminLabelClass = 'text-sm font-semibold text-slate-700';

export const adminPrimaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-105 disabled:opacity-50';

export const adminSecondaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50/50';
