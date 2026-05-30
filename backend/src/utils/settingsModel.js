const pool = require('../config/db');

const DEFAULT_SETTINGS = {
  brandName: 'ShopSweet',
  tagline: 'Fresh mithai for every celebration',
  logoUrl: null,
};

const initSettingsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id SMALLINT PRIMARY KEY DEFAULT 1,
      brand_name VARCHAR(120) DEFAULT 'ShopSweet',
      tagline VARCHAR(255) DEFAULT 'Fresh mithai for every celebration',
      logo_url VARCHAR(500) DEFAULT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  const result = await pool.query('SELECT id FROM site_settings WHERE id = 1');
  if (!result.rows.length) {
    await pool.query(
      'INSERT INTO site_settings (id, brand_name, tagline, logo_url) VALUES (1, $1, $2, NULL)',
      [DEFAULT_SETTINGS.brandName, DEFAULT_SETTINGS.tagline]
    );
  }
};

const getSiteSettings = async () => {
  const result = await pool.query('SELECT * FROM site_settings WHERE id = 1 LIMIT 1');
  if (!result.rows.length) return { ...DEFAULT_SETTINGS };
  const row = result.rows[0];
  return {
    brandName: row.brand_name || DEFAULT_SETTINGS.brandName,
    tagline: row.tagline || DEFAULT_SETTINGS.tagline,
    logoUrl: row.logo_url || null,
  };
};

const saveSiteSettings = async ({ brandName, tagline, logoUrl }) => {
  const current = await getSiteSettings();
  await pool.query(
    `UPDATE site_settings SET brand_name = $1, tagline = $2, logo_url = $3, updated_at = CURRENT_TIMESTAMP WHERE id = 1`,
    [
      brandName ?? current.brandName,
      tagline ?? current.tagline,
      logoUrl !== undefined ? logoUrl : current.logoUrl,
    ]
  );
  return getSiteSettings();
};

const initialize = initSettingsTable;

module.exports = { getSiteSettings, saveSiteSettings, DEFAULT_SETTINGS, initialize };
