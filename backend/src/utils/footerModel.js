const pool = require('../config/db');

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

const parseRow = (row) => {
  if (!row) return { ...defaultFooter };
  return {
    brandName: row.brand_name || defaultFooter.brandName,
    tagline: row.tagline || defaultFooter.tagline,
    description: row.description || defaultFooter.description,
    quickLinks: parseJsonArray(row.quick_links, defaultFooter.quickLinks),
    address: row.address || defaultFooter.address,
    phone: row.phone || defaultFooter.phone,
    email: row.email || defaultFooter.email,
    copyrightText: row.copyright_text || defaultFooter.copyrightText,
    bottomTagline: row.bottom_tagline || defaultFooter.bottomTagline,
  };
};

const ensureRow = async () => {
  const result = await pool.query('SELECT id FROM footer_settings LIMIT 1');
  if (!result.rows.length) {
    await pool.query(
      `INSERT INTO footer_settings (
        brand_name, tagline, description, quick_links, address, phone, email, copyright_text, bottom_tagline
      ) VALUES ($1, $2, $3, $4::json, $5, $6, $7, $8, $9)`,
      [
        defaultFooter.brandName,
        defaultFooter.tagline,
        defaultFooter.description,
        JSON.stringify(defaultFooter.quickLinks),
        defaultFooter.address,
        defaultFooter.phone,
        defaultFooter.email,
        defaultFooter.copyrightText,
        defaultFooter.bottomTagline,
      ]
    );
  }
};

const initFooterTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS footer_settings (
      id SERIAL PRIMARY KEY,
      brand_name VARCHAR(120),
      tagline VARCHAR(255),
      description TEXT,
      quick_links JSON,
      address VARCHAR(500),
      phone VARCHAR(50),
      email VARCHAR(150),
      copyright_text VARCHAR(255),
      bottom_tagline VARCHAR(255),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await ensureRow();
};

const getFooterSettings = async () => {
  await initFooterTable();
  const result = await pool.query('SELECT * FROM footer_settings LIMIT 1');
  return parseRow(result.rows[0]);
};

const updateFooterSettings = async (updates) => {
  await initFooterTable();
  const fields = [];
  const values = [];
  let index = 1;

  const map = {
    brandName: 'brand_name',
    tagline: 'tagline',
    description: 'description',
    address: 'address',
    phone: 'phone',
    email: 'email',
    copyrightText: 'copyright_text',
    bottomTagline: 'bottom_tagline',
  };

  Object.entries(map).forEach(([key, col]) => {
    if (updates[key] !== undefined) {
      fields.push(`${col} = $${index++}`);
      values.push(updates[key]);
    }
  });

  if (updates.quickLinks !== undefined) {
    fields.push(`quick_links = $${index++}::json`);
    values.push(JSON.stringify(updates.quickLinks));
  }

  if (fields.length) {
    await pool.query(
      `UPDATE footer_settings SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = 1`,
      values
    );
  }

  return getFooterSettings();
};

const initialize = initFooterTable;

module.exports = { getFooterSettings, updateFooterSettings, initialize };
