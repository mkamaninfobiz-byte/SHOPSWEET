import { useLocation } from 'react-router-dom';
import BackButton from './BackButton';

/**
 * Fixed back control for routes that need it. Hidden on home, login, register, and product detail.
 */
const HIDDEN_PATHS = new Set(['/', '/login', '/register']);

const GlobalBackButton = () => {
  const { pathname } = useLocation();
  const isDashboard = pathname.startsWith('/dashboard');
  const isProductDetail = /^\/dashboard\/products\/[^/]+$/.test(pathname);
  const fallbackTo = isDashboard ? '/dashboard' : '/';

  if (HIDDEN_PATHS.has(pathname) || isProductDetail) {
    return null;
  }

  return (
    <div
      className={`fixed z-[55] ${
        isDashboard ? 'left-4 top-[5.25rem] sm:left-8 lg:left-[calc(18rem+1.5rem)]' : 'left-4 top-[4.75rem] sm:left-6'
      }`}
    >
      <BackButton to={fallbackTo} variant="default" />
    </div>
  );
};

export default GlobalBackButton;
