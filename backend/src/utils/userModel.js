const bcrypt = require('bcryptjs');
const poolPromise = require('../config/db');

const DB_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'admin@shopsweet.local';
const DB_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!';

const getPool = async () => {
  const pool = await poolPromise;
  return pool;
};

const initUsersTable = async () => {
  const pool = await getPool();
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      roles TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  await pool.query(sql);
};

const parseUserRow = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  passwordHash: row.password_hash,
  roles: row.roles ? JSON.parse(row.roles) : ['User'],
  created_at: row.created_at,
});

const findUserByEmail = async (email) => {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
  if (!rows || rows.length === 0) return null;
  return parseUserRow(rows[0]);
};

const findUserById = async (id) => {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  if (!rows || rows.length === 0) return null;
  return parseUserRow(rows[0]);
};

const addUser = async ({ id, name, email, passwordHash, roles }) => {
  const pool = await getPool();
  await pool.query(
    'INSERT INTO users (id, name, email, password_hash, roles) VALUES (?, ?, ?, ?, ?)',
    [id, name, email.toLowerCase(), passwordHash, JSON.stringify(roles || ['User'])]
  );
  return { id, name, email: email.toLowerCase(), roles: roles || ['User'] };
};

const updateUserById = async (id, { name, email, passwordHash }) => {
  const pool = await getPool();
  const fields = [];
  const values = [];

  if (name !== undefined) {
    fields.push('name = ?');
    values.push(name);
  }
  if (email !== undefined) {
    fields.push('email = ?');
    values.push(email.toLowerCase());
  }
  if (passwordHash !== undefined) {
    fields.push('password_hash = ?');
    values.push(passwordHash);
  }

  if (fields.length === 0) {
    return findUserById(id);
  }

  values.push(id);
  await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  return findUserById(id);
};

const toPublicUser = (user) => {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles,
  };
};

const ensureAdminUser = async () => {
  const existing = await findUserByEmail(DB_ADMIN_EMAIL);
  if (existing) {
    return existing;
  }

  const passwordHash = await bcrypt.hash(DB_ADMIN_PASSWORD, 10);
  const adminUser = {
    id: `U-${Date.now()}`,
    name: 'Admin',
    email: DB_ADMIN_EMAIL,
    passwordHash,
    roles: ['Admin'],
  };
  await addUser(adminUser);
  console.log(`✅ Seeded default admin account: ${DB_ADMIN_EMAIL}`);
  return adminUser;
};

initUsersTable()
  .then(() => ensureAdminUser())
  .catch((error) => {
    console.error('Failed to initialize users table:', error.message || error);
  });

module.exports = {
  findUserByEmail,
  findUserById,
  addUser,
  updateUserById,
  toPublicUser,
  ensureAdminUser,
};
