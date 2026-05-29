const defaultStats = [
  { id: 'stat-1', number: '20+', label: 'Years of Expertise' },
  { id: 'stat-2', number: '50+', label: 'Signature Recipes' },
  { id: 'stat-3', number: '5000+', label: 'Happy Celebrations' },
  { id: 'stat-4', number: '100%', label: 'Customer Satisfaction' },
];

const defaultCoreValues = [
  { id: 'value-1', icon: 'Sparkles', title: 'Premium Quality', desc: 'Handpicked finest ingredients.' },
  { id: 'value-2', icon: 'Heart', title: 'Authentic Tradition', desc: 'Heritage recipes crafted with love.' },
  { id: 'value-3', icon: 'ShieldCheck', title: 'Purity Assured', desc: 'Purely natural goodness.' },
];

const defaultWhyChoose = [
  { id: 'why-1', icon: '🎁', title: 'Elegantly Packaged', desc: 'Gift-ready boxes for every celebration.' },
  { id: 'why-2', icon: '⚡', title: 'Reliable Delivery', desc: 'On-time delivery every single time.' },
];

const defaultTeam = [
  { id: 'team-1', name: 'Ananya Kapoor', role: 'Head Chef & Founder', desc: 'Visionary baker with 20+ years of experience.' },
];

export const ensureArray = (value, fallback = []) => {
  if (value == null || value === '') return fallback;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') return Object.values(parsed);
      return fallback;
    } catch {
      return fallback;
    }
  }
  if (typeof value === 'object') {
    const values = Object.values(value);
    if (values.length > 0 && values.every((item) => item && typeof item === 'object')) {
      return values;
    }
    return fallback;
  }
  return fallback;
};

export const mapStatsForDisplay = (stats) =>
  ensureArray(stats).map((item, index) => ({
    id: item.id || `stat-${index + 1}`,
    value: item.number ?? item.value ?? '',
    label: item.label ?? '',
  }));

export const normalizeAboutContent = (raw) => {
  if (!raw) return null;

  return {
    ...raw,
    heading: raw.heading || 'Pure. Authentic. Celebration',
    tagline: raw.tagline || '',
    story: raw.story || '',
    commitment: raw.commitment || '',
    stats: ensureArray(raw.stats, defaultStats).map((item, index) => ({
      id: item.id || `stat-${index + 1}`,
      number: item.number ?? item.value ?? '',
      label: item.label ?? '',
    })),
    coreValues: ensureArray(raw.coreValues ?? raw.core_values, defaultCoreValues),
    whyChoose: ensureArray(raw.whyChoose ?? raw.why_choose, defaultWhyChoose),
    team: ensureArray(raw.team, defaultTeam).map((item, index) => ({
      id: item.id || `team-${index + 1}`,
      name: item.name || '',
      role: item.role || '',
      desc: item.desc || item.description || '',
      image_url: item.image_url || item.imageUrl || '',
    })),
  };
};

export const getTeamPhotoUrl = (member) => {
  const url = member?.image_url || member?.imageUrl;
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};
