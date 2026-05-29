const poolPromise = require('../config/db');

const defaultTestimonials = {
  sectionTitle: 'What Our Customers Say',
  sectionSubtitle: 'Real stories from celebrations made sweeter with ShopSweet.',
  items: [
    {
      id: 't-1',
      name: 'Priya Sharma',
      role: 'Wedding Client',
      quote: 'The mithai was fresh, beautifully packed, and delivered right on time for our function.',
      rating: 5,
    },
    {
      id: 't-2',
      name: 'Rahul Mehta',
      role: 'Corporate Gifting',
      quote: 'Premium quality sweets and elegant packaging — our team loved every box.',
      rating: 5,
    },
  ],
};

const parseJsonArray = (value, fallback = []) => {
  if (value == null || value === '') return fallback;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
};

const normalizeItemImageUrl = (item) => {
  if (!item || typeof item !== 'object') return item;
  const raw =
    item.image_url ??
    item.imageUrl ??
    item.photo_url ??
    item.photoUrl ??
    item.photo ??
    item.image ??
    null;
  let image_url = null;
  if (typeof raw === 'string' && raw.trim()) {
    const trimmed = raw.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      image_url = trimmed;
    } else if (trimmed.startsWith('/uploads/') || trimmed.startsWith('/')) {
      image_url = trimmed;
    } else if (trimmed.startsWith('uploads/')) {
      image_url = `/${trimmed}`;
    } else {
      image_url = `/uploads/testimonials/${trimmed.replace(/^\/+/, '')}`;
    }
  }
  return { ...item, image_url };
};

const parseRow = (row) => {
  if (!row) return { ...defaultTestimonials };
  const items = parseJsonArray(row.items, defaultTestimonials.items).map(normalizeItemImageUrl);
  return {
    sectionTitle: row.section_title || defaultTestimonials.sectionTitle,
    sectionSubtitle: row.section_subtitle || defaultTestimonials.sectionSubtitle,
    items,
  };
};

const getPool = async () => poolPromise;

const ensureRow = async () => {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT id FROM testimonial_settings LIMIT 1');
  if (!rows.length) {
    await pool.query(
      'INSERT INTO testimonial_settings (section_title, section_subtitle, items) VALUES (?, ?, ?)',
      [
        defaultTestimonials.sectionTitle,
        defaultTestimonials.sectionSubtitle,
        JSON.stringify(defaultTestimonials.items),
      ]
    );
  }
};

const initTestimonialTable = async () => {
  const pool = await getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS testimonial_settings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      section_title VARCHAR(255),
      section_subtitle TEXT,
      items JSON,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  await ensureRow();
};

const getTestimonials = async () => {
  await initTestimonialTable();
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM testimonial_settings LIMIT 1');
  return parseRow(rows[0]);
};

const updateTestimonials = async ({ sectionTitle, sectionSubtitle, items }) => {
  await initTestimonialTable();
  const pool = await getPool();
  await pool.query(
    `UPDATE testimonial_settings SET
      section_title = COALESCE(?, section_title),
      section_subtitle = COALESCE(?, section_subtitle),
      items = COALESCE(?, items),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = 1`,
    [
      sectionTitle ?? null,
      sectionSubtitle ?? null,
      items != null ? JSON.stringify(items) : null,
    ]
  );
  return getTestimonials();
};

initTestimonialTable().catch((err) => {
  console.error('Failed to initialize testimonial_settings:', err.message || err);
});

module.exports = { getTestimonials, updateTestimonials };
