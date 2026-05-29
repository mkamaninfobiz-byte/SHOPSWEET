import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';
import { fetchSiteSettings, getLogoUrl } from '../api/settings';

export const SITE_NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Sweets', to: '/products' },
  { label: 'Poster', to: '/poster-generator' },
  { label: 'Contact', to: '/contact' },
  { label: 'Orders', to: '/order' },
];

const isLinkActive = (pathname, to) => {
  if (to === '/') return pathname === '/';
  return pathname === to || pathname.startsWith(`${to}/`);
};

const navItemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (index) => ({
    opacity: 1,
    x: 0,
    transition: { delay: index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  }),
  exit: { opacity: 0, x: -8, transition: { duration: 0.2 } },
};

const NavItem = ({ link, active, onNavigate }) => {
  const isHome = link.to === '/';

  return (
    <motion.div variants={navItemVariants} custom={0} className="relative">
      <Link
        to={link.to}
        onClick={onNavigate}
        className={`group relative block px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
          isHome ? '' : 'rounded-full'
        } ${active ? 'text-slate-950' : 'text-slate-600 hover:text-slate-900'}`}
      >
        {active && !isHome && (
          <motion.span
            layoutId="site-nav-active-pill"
            className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 shadow-sm ring-1 ring-orange-100/80"
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          />
        )}
        {active && isHome && (
          <motion.span
            layoutId="site-nav-home-active"
            className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500"
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          />
        )}
        <span className="relative z-10">{link.label}</span>
        {!active && (
          <span className="absolute bottom-1 left-4 right-4 h-px origin-left scale-x-0 bg-gradient-to-r from-orange-400 to-amber-400 transition-transform duration-300 group-hover:scale-x-100" />
        )}
      </Link>
    </motion.div>
  );
};

const SiteNavbar = () => {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [brand, setBrand] = useState({
    brandName: 'SHOPSWEET',
    tagline: 'Fresh mithai for every celebration',
    logoUrl: null,
  });

  useEffect(() => {
    fetchSiteSettings()
      .then((data) =>
        setBrand({
          brandName: (data.brandName || 'ShopSweet').toUpperCase(),
          tagline: data.tagline || 'Fresh mithai for every celebration',
          logoUrl: getLogoUrl(data.logoUrl),
        })
      )
      .catch(() => {});

    const onSettingsUpdate = (e) => {
      const data = e.detail;
      setBrand({
        brandName: (data.brandName || 'ShopSweet').toUpperCase(),
        tagline: data.tagline || 'Fresh mithai for every celebration',
        logoUrl: getLogoUrl(data.logoUrl),
      });
    };
    window.addEventListener('shopsweet:settings-updated', onSettingsUpdate);
    return () => window.removeEventListener('shopsweet:settings-updated', onSettingsUpdate);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="sticky top-0 z-50 w-full">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className={`relative w-full border-b backdrop-blur-xl transition-[box-shadow,background-color,padding] duration-500 ease-out ${
          scrolled
            ? 'border-slate-200/90 bg-white/95 py-3 shadow-[0_4px_24px_rgba(15,23,42,0.08)]'
            : 'border-white/80 bg-white/90 py-4'
        }`}
      >
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/50 to-transparent"
          animate={{ opacity: scrolled ? 1 : 0.6 }}
          transition={{ duration: 0.4 }}
        />

        <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="group flex min-w-0 items-center gap-3">
            {brand.logoUrl ? (
              <motion.img
                src={brand.logoUrl}
                alt={brand.brandName}
                whileHover={{ scale: 1.04 }}
                className="h-12 w-12 shrink-0 rounded-2xl border border-slate-100 bg-white object-contain p-1 shadow-sm"
              />
            ) : (
              <motion.div
                whileHover={{ scale: 1.06, rotate: -3 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 text-lg font-bold text-white shadow-lg shadow-cyan-400/30"
              >
                SS
              </motion.div>
            )}
            <div className="min-w-0">
              <p className="truncate text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-slate-400 transition-colors group-hover:text-orange-500 sm:text-xs">
                {brand.brandName}
              </p>
              <p className="truncate text-xs font-semibold text-slate-700 sm:text-sm">{brand.tagline}</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {SITE_NAV_LINKS.map((link) => (
              <NavItem
                key={link.to}
                link={link}
                active={isLinkActive(pathname, link.to)}
                onNavigate={closeMobile}
              />
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/order"
                className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-105 sm:inline-flex sm:px-5 sm:py-3"
              >
                Order Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            <motion.button
              type="button"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
              whileTap={{ scale: 0.92 }}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-800 shadow-sm transition-colors hover:border-orange-200 hover:bg-orange-50/50 lg:hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="close"
                    initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute"
                  >
                    <X className="h-5 w-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ opacity: 0, rotate: 90, scale: 0.8 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: -90, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute"
                  >
                    <Menu className="h-5 w-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[2px] lg:hidden"
              onClick={closeMobile}
            />
            <motion.nav
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              className="fixed left-0 right-0 top-[var(--site-nav-height,72px)] z-50 overflow-hidden border-b border-slate-200 bg-white/98 p-3 shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:hidden"
              aria-label="Mobile navigation"
            >
              <motion.ul
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
                }}
                className="flex flex-col gap-1"
              >
                {SITE_NAV_LINKS.map((link, index) => {
                  const active = isLinkActive(pathname, link.to);
                  const isHome = link.to === '/';
                  return (
                    <motion.li key={link.to} variants={navItemVariants} custom={index}>
                      <Link
                        to={link.to}
                        onClick={closeMobile}
                        className={`flex items-center justify-between px-4 py-3.5 text-sm font-semibold transition-colors ${
                          active && isHome
                            ? 'border-l-4 border-orange-500 bg-orange-50/50 text-slate-950'
                            : active
                              ? 'rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 text-slate-950 ring-1 ring-orange-100'
                              : 'rounded-2xl text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {link.label}
                        {active && (
                          <motion.span
                            layoutId="site-nav-mobile-dot"
                            className="h-2 w-2 rounded-full bg-orange-500"
                          />
                        )}
                      </Link>
                    </motion.li>
                  );
                })}
              </motion.ul>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.35 }}
                className="mt-2 border-t border-slate-100 pt-2"
              >
                <Link
                  to="/order"
                  onClick={closeMobile}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25"
                >
                  Order Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SiteNavbar;
