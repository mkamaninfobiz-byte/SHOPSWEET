const pool = require('../config/db');

const defaultAboutContent = {
  heading: 'Pure. Authentic. Celebration',
  tagline: 'Handcrafted mithai that tells a story of tradition, love, and excellence.',
  story: 'ShopSweet was born from a simple belief: that every celebration deserves sweets made with genuine care, premium ingredients, and an unwavering commitment to excellence. What started as a passion for traditional mithai-making has evolved into a modern sweet house that honors heritage while embracing innovation.',
  commitment: 'We promise to never compromise on quality. Every sweet is crafted with the finest ingredients, packaged with elegance, and delivered with reliability. Your satisfaction isn\'t just our goal—it\'s our obsession.',
  coreValues: [
    {
      id: 'value-1',
      icon: 'Sparkles',
      title: 'Premium Quality',
      desc: 'Handpicked finest ingredients, zero compromises on taste or freshness.',
    },
    {
      id: 'value-2',
      icon: 'Heart',
      title: 'Authentic Tradition',
      desc: 'Heritage recipes passed down through generations, crafted with love.',
    },
    {
      id: 'value-3',
      icon: 'ShieldCheck',
      title: 'Purity Assured',
      desc: 'No artificial colors, preservatives, or fillers—purely natural goodness.',
    },
  ],
  whyChoose: [
    {
      id: 'why-1',
      icon: '🎁',
      title: 'Elegantly Packaged',
      desc: 'Gift-ready boxes designed to make every celebration unforgettable.',
    },
    {
      id: 'why-2',
      icon: '⚡',
      title: 'Reliable Delivery',
      desc: 'On-time, safe delivery to your doorstep—every single time.',
    },
    {
      id: 'why-3',
      icon: '👨‍🍳',
      title: 'Handcrafted Daily',
      desc: 'Small batches, meticulous craftsmanship, premium consistency.',
    },
    {
      id: 'why-4',
      icon: '🌟',
      title: 'Celebration Ready',
      desc: 'Perfect for weddings, festivals, corporate gifting, and sweet moments.',
    },
  ],
  stats: [
    { id: 'stat-1', number: '20+', label: 'Years of Expertise' },
    { id: 'stat-2', number: '50+', label: 'Signature Recipes' },
    { id: 'stat-3', number: '5000+', label: 'Happy Celebrations' },
    { id: 'stat-4', number: '100%', label: 'Customer Satisfaction' },
  ],
  team: [
    {
      id: 'team-1',
      name: 'Ananya Kapoor',
      role: 'Head Chef & Founder',
      desc: 'Visionary baker with 20+ years of experience in traditional mithai-making.',
    },
    {
      id: 'team-2',
      name: 'Rohan Mehta',
      role: 'Brand Director',
      desc: 'Strategic leader bringing ShopSweet\'s premium vision to modern markets.',
    },
    {
      id: 'team-3',
      name: 'Priya Singh',
      role: 'Operations Lead',
      desc: 'Ensures every order meets our exacting standards for quality and elegance.',
    },
  ],
};

const parseJsonArray = (value, fallback = []) => {
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

const parseAboutRow = (row) => {
  if (!row) {
    return {
      ...defaultAboutContent,
      coreValues: defaultAboutContent.coreValues,
      whyChoose: defaultAboutContent.whyChoose,
      stats: defaultAboutContent.stats,
      team: defaultAboutContent.team,
    };
  }

  return {
    id: row.id,
    heading: row.heading || defaultAboutContent.heading,
    tagline: row.tagline || defaultAboutContent.tagline,
    story: row.story || defaultAboutContent.story,
    commitment: row.commitment || defaultAboutContent.commitment,
    coreValues: parseJsonArray(row.core_values, defaultAboutContent.coreValues),
    whyChoose: parseJsonArray(row.why_choose, defaultAboutContent.whyChoose),
    stats: parseJsonArray(row.stats, defaultAboutContent.stats),
    team: parseJsonArray(row.team, defaultAboutContent.team),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
};

const ensureAboutRow = async () => {
  const result = await pool.query('SELECT id FROM about LIMIT 1');
  if (result.rows.length === 0) {
    await pool.query(
      `INSERT INTO about (heading, tagline, story, commitment, core_values, why_choose, stats, team)
       VALUES ($1, $2, $3, $4, $5::json, $6::json, $7::json, $8::json)`,
      [
        defaultAboutContent.heading,
        defaultAboutContent.tagline,
        defaultAboutContent.story,
        defaultAboutContent.commitment,
        JSON.stringify(defaultAboutContent.coreValues),
        JSON.stringify(defaultAboutContent.whyChoose),
        JSON.stringify(defaultAboutContent.stats),
        JSON.stringify(defaultAboutContent.team),
      ]
    );
  }
};

const initAboutTable = async () => {
  const createSql = `
    CREATE TABLE IF NOT EXISTS about (
      id SERIAL PRIMARY KEY,
      heading VARCHAR(255),
      tagline VARCHAR(255),
      story TEXT,
      commitment TEXT,
      core_values JSON,
      why_choose JSON,
      stats JSON,
      team JSON,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(createSql);
  await ensureAboutRow();
};

const getAboutContent = async () => {
  await ensureAboutRow();
  const result = await pool.query('SELECT * FROM about LIMIT 1');
  return parseAboutRow(result.rows[0]);
};

const updateAboutContent = async (updates) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (updates.heading !== undefined) {
    fields.push(`heading = $${index++}`);
    values.push(updates.heading);
  }
  if (updates.tagline !== undefined) {
    fields.push(`tagline = $${index++}`);
    values.push(updates.tagline);
  }
  if (updates.story !== undefined) {
    fields.push(`story = $${index++}`);
    values.push(updates.story);
  }
  if (updates.commitment !== undefined) {
    fields.push(`commitment = $${index++}`);
    values.push(updates.commitment);
  }

  if (fields.length === 0) {
    throw new Error('No valid fields provided to update.');
  }

  const sql = `UPDATE about SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = 1`;
  await pool.query(sql, values);
  return getAboutContent();
};

const updateCoreValues = async (values) => {
  await pool.query(
    'UPDATE about SET core_values = $1::json, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
    [JSON.stringify(values)]
  );
  return getAboutContent();
};

const updateWhyChoose = async (items) => {
  await pool.query(
    'UPDATE about SET why_choose = $1::json, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
    [JSON.stringify(items)]
  );
  return getAboutContent();
};

const updateTeam = async (members) => {
  const normalized = (members || []).map((member, index) => ({
    id: member.id || `team-${index + 1}`,
    name: String(member.name || '').trim(),
    role: String(member.role || '').trim(),
    desc: String(member.desc || member.description || '').trim(),
    image_url: member.image_url || member.imageUrl || null,
  }));
  await pool.query(
    'UPDATE about SET team = $1::json, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
    [JSON.stringify(normalized)]
  );
  return getAboutContent();
};

const updateStats = async (stats) => {
  const normalized = (stats || []).map((item, index) => ({
    id: item.id || `stat-${index + 1}`,
    number: String(item.number ?? item.value ?? '').trim(),
    label: String(item.label ?? '').trim(),
  }));
  await pool.query(
    'UPDATE about SET stats = $1::json, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
    [JSON.stringify(normalized)]
  );
  return getAboutContent();
};

initAboutTable().catch((error) => {
  console.error('Failed to initialize about table:', error.message || error);
});

module.exports = {
  getAboutContent,
  updateAboutContent,
  updateCoreValues,
  updateWhyChoose,
  updateTeam,
  updateStats,
};
