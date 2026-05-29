import { useEffect, useState } from 'react';
import { getTestimonialPhotoUrl } from '../utils/testimonialHelpers';

const getInitials = (name) => {
  const parts = (name || 'Guest').trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0]?.[0] || 'S').toUpperCase();
};

const TestimonialAvatar = ({ item, className = 'h-16 w-16' }) => {
  const photoUrl = getTestimonialPhotoUrl(item);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [photoUrl]);

  const showPhoto = photoUrl && !failed;

  if (showPhoto) {
    return (
      <img
        key={photoUrl}
        src={photoUrl}
        alt={item.name || 'Customer'}
        loading="lazy"
        className={`shrink-0 rounded-full object-cover object-center border border-slate-200 ${className}`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700 border border-orange-200 ${className}`}
      aria-hidden
    >
      {getInitials(item.name)}
    </div>
  );
};

export default TestimonialAvatar;
