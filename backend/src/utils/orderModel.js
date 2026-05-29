const poolPromise = require('../config/db');

const getPool = async () => {
  const pool = await poolPromise;
  return pool;
};

const initOrdersTable = async () => {
  const pool = await getPool();
  const sql = `
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(50) PRIMARY KEY,
      order_id VARCHAR(50) NOT NULL UNIQUE,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(150) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      address VARCHAR(255) DEFAULT NULL,
      city VARCHAR(100) DEFAULT NULL,
      state VARCHAR(100) DEFAULT NULL,
      pincode VARCHAR(20) DEFAULT NULL,
      different_address TINYINT(1) DEFAULT 0,
      shipping_address TEXT,
      items TEXT NOT NULL,
      payment_method VARCHAR(50) NOT NULL,
      subtotal DECIMAL(10,2) DEFAULT 0.00,
      delivery_charges DECIMAL(10,2) DEFAULT 0.00,
      packaging_charges DECIMAL(10,2) DEFAULT 0.00,
      total_amount DECIMAL(10,2) DEFAULT 0.00,
      status VARCHAR(50) DEFAULT 'Pending',
      date DATETIME DEFAULT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  await pool.query(sql);

  const migrations = [
    'ALTER TABLE orders ADD COLUMN IF NOT EXISTS address VARCHAR(255) DEFAULT NULL',
    'ALTER TABLE orders ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT NULL',
    'ALTER TABLE orders ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT NULL',
    'ALTER TABLE orders ADD COLUMN IF NOT EXISTS pincode VARCHAR(20) DEFAULT NULL',
    'ALTER TABLE orders ADD COLUMN IF NOT EXISTS different_address TINYINT(1) DEFAULT 0',
    'ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0.00',
    'ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_charges DECIMAL(10,2) DEFAULT 0.00',
    'ALTER TABLE orders ADD COLUMN IF NOT EXISTS packaging_charges DECIMAL(10,2) DEFAULT 0.00',
    'ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0.00',
    'ALTER TABLE orders ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT \'Pending\'',
  ];

  for (const migration of migrations) {
    await pool.query(migration);
  }
};

const addOrder = async ({
  id,
  orderId,
  name,
  email,
  phone,
  address,
  city,
  state,
  pincode,
  differentAddress,
  shippingAddress,
  items,
  paymentMethod,
  subtotal,
  deliveryCharges,
  packagingCharges,
  totalAmount,
  status,
  date,
  notes,
}) => {
  const pool = await getPool();
  await pool.query(
    `INSERT INTO orders (
      id, order_id, name, email, phone, address, city, state, pincode,
      different_address, shipping_address, items, payment_method,
      subtotal, delivery_charges, packaging_charges, total_amount, status, date, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      orderId,
      name,
      email,
      phone,
      address || null,
      city || null,
      state || null,
      pincode || null,
      differentAddress ? 1 : 0,
      JSON.stringify(shippingAddress || {}),
      JSON.stringify(items || []),
      paymentMethod || 'cod',
      subtotal ?? 0,
      deliveryCharges ?? 0,
      packagingCharges ?? 0,
      totalAmount ?? 0,
      status || 'Pending',
      date || null,
      notes || null,
    ]
  );
  const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
  return rows[0];
};

const getAllOrders = async () => {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
  return rows;
};

const getOrderById = async (id) => {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? OR order_id = ?', [id, id]);
  return rows.length ? rows[0] : null;
};

const updateOrderById = async (id, updates) => {
  const pool = await getPool();
  const fields = [];
  const values = [];

  const allowed = {
    name: 'name',
    email: 'email',
    phone: 'phone',
    address: 'address',
    city: 'city',
    state: 'state',
    pincode: 'pincode',
    status: 'status',
    paymentMethod: 'payment_method',
    payment_method: 'payment_method',
    notes: 'notes',
    date: 'date',
    totalAmount: 'total_amount',
    total_amount: 'total_amount',
  };

  Object.entries(allowed).forEach(([key, column]) => {
    if (updates[key] !== undefined) {
      fields.push(`${column} = ?`);
      values.push(updates[key]);
    }
  });

  if (fields.length === 0) {
    return getOrderById(id);
  }

  values.push(id, id);
  await pool.query(`UPDATE orders SET ${fields.join(', ')} WHERE id = ? OR order_id = ?`, values);
  return getOrderById(id);
};

const deleteOrderById = async (id) => {
  const pool = await getPool();
  const [result] = await pool.query('DELETE FROM orders WHERE id = ? OR order_id = ?', [id, id]);
  return result.affectedRows > 0;
};

initOrdersTable().catch((error) => {
  console.error('Failed to initialize orders table:', error.message || error);
});

module.exports = { addOrder, getAllOrders, getOrderById, updateOrderById, deleteOrderById };
