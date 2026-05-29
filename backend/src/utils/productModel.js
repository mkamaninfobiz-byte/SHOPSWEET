const poolPromise = require('../config/db');

const DEFAULT_PRODUCTS = [
  {
    sku: 'PRD-MOTICHOOR',
    name: 'Motichoor Ladoo',
    category: 'Traditional',
    price: 450,
    inventory: 50,
    description: '500g — classic motichoor ladoo',
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e304d0e?auto=format&fit=crop&w=900&q=80',
  },
  {
    sku: 'PRD-KAJU',
    name: 'Kaju Katli',
    category: 'Premium',
    price: 899,
    inventory: 30,
    description: 'Rich cashew fudge, 500g box',
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
  },
  {
    sku: 'PRD-GULAB',
    name: 'Gulab Jamun',
    category: 'Traditional',
    price: 199,
    inventory: 40,
    description: 'Soft syrup-soaked gulab jamun',
    image_url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=900&q=80',
  },
  {
    sku: 'PRD-BARFI',
    name: 'Milk Barfi',
    category: 'Traditional',
    price: 299,
    inventory: 35,
    description: 'Creamy milk barfi, 500g',
    image_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=80',
  },
];

const getPool = async () => {
  const pool = await poolPromise;
  return pool;
};

const initProductsTable = async () => {
  const pool = await getPool();
  const sql = `
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sku VARCHAR(50) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      inventory INT NOT NULL DEFAULT 0,
      description TEXT,
      image_url VARCHAR(511) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  await pool.query(sql);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR(511) DEFAULT NULL`);
};

const seedDefaultProductsIfEmpty = async () => {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM products');
  const count = Number(rows[0]?.count || 0);
  if (count > 0) return count;

  for (const product of DEFAULT_PRODUCTS) {
    await pool.query(
      'INSERT INTO products (sku, name, category, price, inventory, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        product.sku,
        product.name,
        product.category,
        product.price,
        product.inventory,
        product.description,
        product.image_url,
      ]
    );
  }

  console.log(`✅ Seeded ${DEFAULT_PRODUCTS.length} default products (catalog was empty)`);
  return DEFAULT_PRODUCTS.length;
};

const ensureProductsReady = async () => {
  await initProductsTable();
  await seedDefaultProductsIfEmpty();
};

const getAllProducts = async () => {
  await ensureProductsReady();
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, sku, name, category, price, inventory, description, image_url FROM products ORDER BY created_at DESC'
  );
  return rows;
};

const getProductById = async (id) => {
  await ensureProductsReady();
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, sku, name, category, price, inventory, description, image_url FROM products WHERE id = ?',
    [id]
  );
  return rows.length ? rows[0] : null;
};

const updateProductById = async (id, { name, category, price, inventory, description, imageUrl }) => {
  const pool = await getPool();
  const fields = [];
  const values = [];

  if (name !== undefined) {
    fields.push('name = ?');
    values.push(name);
  }
  if (category !== undefined) {
    fields.push('category = ?');
    values.push(category);
  }
  if (price !== undefined) {
    fields.push('price = ?');
    values.push(parseFloat(price) || 0);
  }
  if (inventory !== undefined) {
    fields.push('inventory = ?');
    values.push(parseInt(inventory, 10) || 0);
  }
  if (description !== undefined) {
    fields.push('description = ?');
    values.push(description || null);
  }
  if (imageUrl !== undefined) {
    fields.push('image_url = ?');
    values.push(imageUrl || null);
  }

  if (fields.length === 0) {
    return getProductById(id);
  }

  values.push(id);
  await pool.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
  return getProductById(id);
};

const deleteProductById = async (id) => {
  const pool = await getPool();
  const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

const addProduct = async ({ name, category, price, inventory, description, imageUrl }) => {
  const pool = await getPool();
  const sku = `PRD-${Date.now()}`;
  const [result] = await pool.query(
    'INSERT INTO products (sku, name, category, price, inventory, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      sku,
      name,
      category || 'General',
      parseFloat(price) || 0,
      parseInt(inventory, 10) || 0,
      description || null,
      imageUrl || null,
    ]
  );
  const [rows] = await pool.query(
    'SELECT id, sku, name, category, price, inventory, description, image_url FROM products WHERE id = ?',
    [result.insertId]
  );
  return rows[0];
};

ensureProductsReady().catch((error) => {
  console.error('Failed to prepare products catalog:', error.message || error);
});

module.exports = {
  ensureProductsReady,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  addProduct,
};
