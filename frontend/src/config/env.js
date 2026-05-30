const PRODUCTION_BACKEND = 'https://shopsweet-o53e.onrender.com';

const trimSlash = (value) => String(value || '').replace(/\/$/, '');

/** Render backend origin (no trailing slash). */
export const BACKEND_URL = trimSlash(
  import.meta.env.VITE_BACKEND_URL ||
    (import.meta.env.PROD ? PRODUCTION_BACKEND : 'http://localhost:3002')
);

/** Axios base URL — must end with /api path segment. */
export const API_URL = trimSlash(
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? `${BACKEND_URL}/api` : '/api')
);

/**
 * Turn relative upload paths into absolute URLs in production.
 * In dev, /uploads is proxied by Vite to the local backend.
 */
export const resolveAssetUrl = (path) => {
  if (path == null || path === '') return null;
  const trimmed = String(path).trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;

  const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  if (import.meta.env.PROD || normalized.startsWith('/uploads')) {
    return `${BACKEND_URL}${normalized}`;
  }

  return normalized;
};
