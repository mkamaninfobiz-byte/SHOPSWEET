import { useNavigate, useLocation } from 'react-router-dom';

const VARIANTS = {
  default:
    'border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50',
  glass: 'border-white/20 bg-white/10 text-white hover:bg-white/20',
  dark: 'border-slate-600 bg-slate-900/90 text-white hover:bg-slate-800',
  subtle: 'border-transparent bg-transparent text-slate-600 hover:bg-slate-100',
};

/**
 * Goes to previous route when React Router history allows; otherwise navigates to `to`.
 * On `/`, hidden unless there is prior in-app history (so landing page stays clean).
 */
const BackButton = ({
  to = '/',
  variant = 'default',
  className = '',
  children = 'Back',
  showOnHome = false,
}) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const idx = window.history.state?.idx;
  if (pathname === '/' && !showOnHome && (idx === undefined || idx === 0)) return null;

  const handleClick = () => {
    const idx = window.history.state?.idx;
    if (typeof idx === 'number' && idx > 0) navigate(-1);
    else navigate(to);
  };

  const base =
    'inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition';

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${base} ${VARIANTS[variant] || VARIANTS.default} ${className}`}
    >
      <span aria-hidden className="text-base leading-none">
        ←
      </span>
      {children}
    </button>
  );
};

export default BackButton;
