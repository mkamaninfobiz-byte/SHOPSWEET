const poolPromise = require('../config/db');

const DEFAULT_SETTINGS = {
  brandName: 'ShopSweet',
  tagline: 'Fresh mithai for every celebration',
  logoUrl: null,
};

const getPool = async () => {
  const pool = await poolPromise;
  return pool;
};

const initSettingsTable = async () => {
  const pool = await getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id TINYINT PRIMARY KEY DEFAULT 1,
      brand_name VARCHAR(120) DEFAULT 'ShopSweet',
      tagline VARCHAR(255) DEFAULT 'Fresh mithai for every celebration',
      logo_url VARCHAR(500) DEFAULT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  const [rows] = await pool.query('SELECT id FROM site_settings WHERE id = 1');
  if (!rows.length) {
    await pool.query(
      'INSERT INTO site_settings (id, brand_name, tagline, logo_url) VALUES (1, ?, ?, NULL)',
      [DEFAULT_SETTINGS.brandName, DEFAULT_SETTINGS.tagline]
    );
  }
};

const getSiteSettings = async () => {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM site_settings WHERE id = 1 LIMIT 1');
  if (!rows.length) return { ...DEFAULT_SETTINGS };
  const row = rows[0];
  return {
    brandName: row.brand_name || DEFAULT_SETTINGS.brandName,
    tagline: row.tagline || DEFAULT_SETTINGS.tagline,
    logoUrl: row.logo_url || null,
  };
};

const saveSiteSettings = async ({ brandName, tagline, logoUrl }) => {
  const pool = await getPool();
  const current = await getSiteSettings();
  await pool.query(
    `UPDATE site_settings SET brand_name = ?, tagline = ?, logo_url = ? WHERE id = 1`,
    [
      brandName ?? current.brandName,
      tagline ?? current.tagline,
      logoUrl !== undefined ? logoUrl : current.logoUrl,
    ]
  );
  return getSiteSettings();
};

initSettingsTable().catch((err) => {
  console.error('Failed to initialize site_settings:', err.message || err);
});

module.exports = { getSiteSettings, saveSiteSettings, DEFAULT_SETTINGS };
