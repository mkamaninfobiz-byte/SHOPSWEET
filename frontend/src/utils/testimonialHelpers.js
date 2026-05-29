/** Resolve stored paths to browser-loadable URLs (Vite proxies /uploads to backend). */
export const resolveTestimonialPhotoPath = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/uploads/')) return trimmed;
  if (trimmed.startsWith('/')) return trimmed;
  if (trimmed.startsWith('uploads/')) return `/${trimmed}`;
  return `/uploads/testimonials/${trimmed.replace(/^\/+/, '')}`;
};

export const normalizeTestimonialItem = (item) => {
  if (!item || typeof item !== 'object') return item;
  const raw =
    item.image_url ??
    item.imageUrl ??
    item.photo_url ??
    item.photoUrl ??
    item.photo ??
    item.image ??
    null;
  const image_url = resolveTestimonialPhotoPath(
    typeof raw === 'string' ? raw : raw != null ? String(raw) : ''
  );
  return { ...item, image_url };
};

export const normalizeTestimonialList = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map(normalizeTestimonialItem);
};

export const getTestimonialPhotoUrl = (item) => {
  const normalized = normalizeTestimonialItem(item);
  return normalized?.image_url || null;
};
