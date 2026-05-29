const poolPromise = require('../config/db');

const getPool = async () => {
  const pool = await poolPromise;
  return pool;
};

const initContactsTable = async () => {
  const pool = await getPool();
  const sql = `
    CREATE TABLE IF NOT EXISTS contacts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(150) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      subject VARCHAR(255) NOT NULL DEFAULT 'General Inquiry',
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  await pool.query(sql);
};

const saveContact = async ({ name, email, phone, subject, message }) => {
  const pool = await getPool();
  const [result] = await pool.query(
    'INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone, subject, message]
  );
  const [rows] = await pool.query('SELECT id, name, email, phone, subject, message, created_at FROM contacts WHERE id = ?', [result.insertId]);
  return rows[0];
};

const getAllContacts = async () => {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT id, name, email, phone, subject, message, created_at FROM contacts ORDER BY created_at DESC');
  return rows;
};

const getContactById = async (id) => {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, name, email, phone, subject, message, created_at FROM contacts WHERE id = ?',
    [id]
  );
  return rows.length ? rows[0] : null;
};

const updateContactById = async (id, { name, email, phone, subject, message }) => {
  const pool = await getPool();
  const fields = [];
  const values = [];

  if (name !== undefined) {
    fields.push('name = ?');
    values.push(name);
  }
  if (email !== undefined) {
    fields.push('email = ?');
    values.push(email);
  }
  if (phone !== undefined) {
    fields.push('phone = ?');
    values.push(phone);
  }
  if (subject !== undefined) {
    fields.push('subject = ?');
    values.push(subject);
  }
  if (message !== undefined) {
    fields.push('message = ?');
    values.push(message);
  }

  if (fields.length === 0) {
    return getContactById(id);
  }

  values.push(id);
  await pool.query(`UPDATE contacts SET ${fields.join(', ')} WHERE id = ?`, values);
  return getContactById(id);
};

const deleteContactById = async (id) => {
  const pool = await getPool();
  const [result] = await pool.query('DELETE FROM contacts WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

initContactsTable().catch((error) => {
  console.error('Failed to initialize contacts table:', error.message || error);
});

module.exports = { saveContact, getAllContacts, getContactById, updateContactById, deleteContactById };
