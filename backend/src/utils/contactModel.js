const pool = require('../config/db');

const initContactsTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(150) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      subject VARCHAR(255) NOT NULL DEFAULT 'General Inquiry',
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(sql);
};

const saveContact = async ({ name, email, phone, subject, message }) => {
  const result = await pool.query(
    `INSERT INTO contacts (name, email, phone, subject, message)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, phone, subject, message, created_at`,
    [name, email, phone, subject, message]
  );
  return result.rows[0];
};

const getAllContacts = async () => {
  const result = await pool.query(
    'SELECT id, name, email, phone, subject, message, created_at FROM contacts ORDER BY created_at DESC'
  );
  return result.rows;
};

const getContactById = async (id) => {
  const result = await pool.query(
    'SELECT id, name, email, phone, subject, message, created_at FROM contacts WHERE id = $1',
    [id]
  );
  return result.rows.length ? result.rows[0] : null;
};

const updateContactById = async (id, { name, email, phone, subject, message }) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (name !== undefined) {
    fields.push(`name = $${index++}`);
    values.push(name);
  }
  if (email !== undefined) {
    fields.push(`email = $${index++}`);
    values.push(email);
  }
  if (phone !== undefined) {
    fields.push(`phone = $${index++}`);
    values.push(phone);
  }
  if (subject !== undefined) {
    fields.push(`subject = $${index++}`);
    values.push(subject);
  }
  if (message !== undefined) {
    fields.push(`message = $${index++}`);
    values.push(message);
  }

  if (fields.length === 0) {
    return getContactById(id);
  }

  values.push(id);
  await pool.query(`UPDATE contacts SET ${fields.join(', ')} WHERE id = $${index}`, values);
  return getContactById(id);
};

const deleteContactById = async (id) => {
  const result = await pool.query('DELETE FROM contacts WHERE id = $1', [id]);
  return result.rowCount > 0;
};

initContactsTable().catch((error) => {
  console.error('Failed to initialize contacts table:', error.message || error);
});

module.exports = { saveContact, getAllContacts, getContactById, updateContactById, deleteContactById };
