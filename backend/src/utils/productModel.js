const pool = require('../config/db');

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

const initProductsTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      sku VARCHAR(50) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
      inventory INTEGER NOT NULL DEFAULT 0,
      description TEXT,
      image_url VARCHAR(511) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(sql);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR(511) DEFAULT NULL`);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
};

const seedDefaultProductsIfEmpty = async () => {
  const result = await pool.query('SELECT COUNT(*) AS count FROM products');
  const count = Number(result.rows[0]?.count || 0);
  if (count > 0) return count;

  for (const product of DEFAULT_PRODUCTS) {
    await pool.query(
      'INSERT INTO products (sku, name, category, price, inventory, description, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7)',
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
  const result = await pool.query(
    'SELECT id, sku, name, category, price, inventory, description, image_url, updated_at FROM products ORDER BY created_at DESC'
  );
  return result.rows;
};

const getProductById = async (id) => {
  await ensureProductsReady();
  const result = await pool.query(
    'SELECT id, sku, name, category, price, inventory, description, image_url, updated_at FROM products WHERE id = $1',
    [id]
  );
  return result.rows.length ? result.rows[0] : null;
};

const updateProductById = async (id, { name, category, price, inventory, description, imageUrl }) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (name !== undefined) {
    fields.push(`name = $${index++}`);
    values.push(name);
  }
  if (category !== undefined) {
    fields.push(`category = $${index++}`);
    values.push(category);
  }
  if (price !== undefined) {
    fields.push(`price = $${index++}`);
    values.push(parseFloat(price) || 0);
  }
  if (inventory !== undefined) {
    fields.push(`inventory = $${index++}`);
    values.push(parseInt(inventory, 10) || 0);
  }
  if (description !== undefined) {
    fields.push(`description = $${index++}`);
    values.push(description || null);
  }
  if (imageUrl !== undefined) {
    fields.push(`image_url = $${index++}`);
    values.push(imageUrl || null);
  }

  if (fields.length === 0) {
    return getProductById(id);
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  await pool.query(`UPDATE products SET ${fields.join(', ')} WHERE id = $${index}`, values);
  return getProductById(id);
};

const deleteProductById = async (id) => {
  const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
  return result.rowCount > 0;
};

const addProduct = async ({ name, category, price, inventory, description, imageUrl }) => {
  const sku = `PRD-${Date.now()}`;
  const result = await pool.query(
    `INSERT INTO products (sku, name, category, price, inventory, description, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, sku, name, category, price, inventory, description, image_url, updated_at`,
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
  return result.rows[0];
};

module.exports = {
  ensureProductsReady,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  addProduct,
};
