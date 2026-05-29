import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { fetchFooterSettings } from '../api/footer';

const defaultFooter = {
  brandName: 'ShopSweet',
  tagline: 'Fresh mithai for every celebration',
  description:
    'Handcrafted sweets made with pure ingredients, elegant packaging, and the warmth of traditional Indian celebrations.',
  quickLinks: [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/about' },
    { label: 'Sweets', to: '/products' },
    { label: 'Order', to: '/order' },
    { label: 'Contact', to: '/contact' },
  ],
  address: '123 Sweet Street, Mumbai, Maharashtra 400001',
  phone: '+91 98765 43210',
  email: 'hello@shopsweet.com',
  copyrightText: 'ShopSweet. All rights reserved.',
  bottomTagline: 'Made with care for every celebration.',
};

const SiteFooter = () => {
  const [footer, setFooter] = useState(defaultFooter);

  useEffect(() => {
    fetchFooterSettings()
      .then(setFooter)
      .catch(() => setFooter(defaultFooter));
  }, []);

  const links = footer.quickLinks?.length ? footer.quickLinks : defaultFooter.quickLinks;

  return (
    <footer className="relative mt-16 border-t border-orange-100 bg-gradient-to-br from-orange-50/90 via-white to-sky-50 sm:mt-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.08),transparent_45%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 text-base font-bold text-white shadow-md shadow-cyan-500/20 sm:h-12 sm:w-12 sm:text-lg">
                SS
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-slate-950 sm:text-lg">{footer.brandName}</p>
                <p className="truncate text-xs text-slate-600 sm:text-sm">{footer.tagline}</p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600">{footer.description}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-600">Quick links</h3>
            <ul className="mt-4 space-y-2">
              {links.map((link) => (
                <li key={`${link.label}-${link.to}`}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-600 transition hover:text-orange-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-600">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                <span>{footer.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-orange-500" />
                <a
                  href={`tel:${(footer.phone || '').replace(/\s/g, '')}`}
                  className="break-all transition hover:text-orange-600"
                >
                  {footer.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-orange-500" />
                <a href={`mailto:${footer.email}`} className="break-all transition hover:text-orange-600">
                  {footer.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-orange-100/80 pt-6 text-center text-xs text-slate-500 sm:mt-12 sm:flex-row sm:gap-4 sm:pt-8 sm:text-left">
          <p>© {new Date().getFullYear()} {footer.copyrightText}</p>
          <p>{footer.bottomTagline}</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
