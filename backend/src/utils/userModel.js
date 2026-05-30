const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const DB_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'admin@shopsweet.local';
const DB_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!';

const initUsersTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      phone VARCHAR(30),
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'Customer',
      address TEXT,
      status VARCHAR(50) DEFAULT 'active',
      last_login TIMESTAMP,
      deleted_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(sql);
};

const parseUserRow = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  passwordHash: row.password_hash,
  role: row.role || 'Customer',
  created_at: row.created_at,
  updated_at: row.updated_at,
  last_login: row.last_login,
  status: row.status,
  phone: row.phone,
  address: row.address,
  deleted_at: row.deleted_at,
});

const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  if (!result.rows || result.rows.length === 0) return null;
  return parseUserRow(result.rows[0]);
};

const findUserById = async (id) => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  if (!result.rows || result.rows.length === 0) return null;
  return parseUserRow(result.rows[0]);
};

const addUser = async ({ name, email, passwordHash, role, phone, address, status }) => {
  const result = await pool.query(
    'INSERT INTO users (name, email, password_hash, role, phone, address, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
    [name, email.toLowerCase(), passwordHash, role || 'Customer', phone, address, status]
  );
  return { id: result.rows[0].id, name, email: email.toLowerCase(), role: role || 'Customer' };
};

const updateUserById = async (id, { name, email, passwordHash }) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (name !== undefined) {
    fields.push(`name = $${index++}`);
    values.push(name);
  }
  if (email !== undefined) {
    fields.push(`email = $${index++}`);
    values.push(email.toLowerCase());
  }
  if (passwordHash !== undefined) {
    fields.push(`password_hash = $${index++}`);
    values.push(passwordHash);
  }

  if (fields.length === 0) {
    return findUserById(id);
  }

  values.push(id);
  await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${index}`, values);
  return findUserById(id);
};

const toPublicUser = (user) => {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

const ensureAdminUser = async () => {
  const existing = await findUserByEmail(DB_ADMIN_EMAIL);
  if (existing) {
    return existing;
  }

  const passwordHash = await bcrypt.hash(DB_ADMIN_PASSWORD, 10);
  const adminUser = {
    name: 'Admin',
    email: DB_ADMIN_EMAIL,
    passwordHash,
    role: 'Admin',
  };
  const newUser = await addUser(adminUser);
  console.log(`✅ Seeded default admin account: ${DB_ADMIN_EMAIL}`);
  return newUser;
  console.log(`✅ Seeded default admin account: ${DB_ADMIN_EMAIL}`);
  return adminUser;
};

const initialize = async () => {
  await initUsersTable();
  await ensureAdminUser();
};

module.exports = {
  findUserByEmail,
  findUserById,
  addUser,
  updateUserById,
  toPublicUser,
  ensureAdminUser,
  initialize,
};
