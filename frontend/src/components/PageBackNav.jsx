import { useLocation } from 'react-router-dom';
import BackButton from './BackButton';

const HIDDEN = new Set(['/', '/login', '/register']);

/**
 * Inline back control for page content (not fixed). Use below navbar or at top of main.
 */
const PageBackNav = ({ to, className = '' }) => {
  const { pathname } = useLocation();
  const isDashboard = pathname.startsWith('/dashboard');
  const fallback = to ?? (isDashboard ? '/dashboard' : '/');

  if (HIDDEN.has(pathname)) return null;
  if (/^\/dashboard\/products\/[^/]+$/.test(pathname)) return null;

  return (
    <div className={`mb-4 sm:mb-6 ${className}`}>
      <BackButton to={fallback} variant="default" />
    </div>
  );
};

export default PageBackNav;
