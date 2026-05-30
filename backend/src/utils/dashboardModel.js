const pool = require('../config/db');
const { getAllOrders } = require('./orderModel');

const parseItems = (raw) => {
  if (!raw) return [];
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const getDashboardStats = async () => {
  const productResult = await pool.query('SELECT COUNT(*) AS count FROM products');
  const productCount = Number(productResult.rows[0]?.count || 0);

  const orders = await getAllOrders();
  const orderCount = orders.length;

  let revenue = 0;
  const emailSet = new Set();
  const statusCounts = {};

  orders.forEach((order) => {
    const amount = Number(order.total_amount || 0);
    const status = (order.status || 'Pending').trim();
    statusCounts[status] = (statusCounts[status] || 0) + 1;

    if (order.email) emailSet.add(String(order.email).toLowerCase());
    if (['Completed', 'Delivered', 'completed', 'delivered'].includes(status)) {
      revenue += amount;
    }
  });

  return {
    revenue,
    orderCount,
    productCount,
    customerCount: emailSet.size,
    statusCounts,
  };
};

const getRecentOrders = async (limit = 5) => {
  const orders = await getAllOrders();
  return orders.slice(0, limit).map((order) => {
    const items = parseItems(order.items);
    const firstItem = items[0];
    const itemLabel =
      firstItem?.name || firstItem?.title || firstItem?.productName || 'Order items';
    return {
      id: order.id,
      orderId: order.order_id || order.id,
      name: order.name,
      email: order.email,
      item: itemLabel,
      status: order.status || 'Pending',
      amount: Number(order.total_amount || 0),
      date: order.created_at || order.date,
    };
  });
};

const searchDashboard = async (query, limit = 8) => {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return { products: [], orders: [], customers: [] };

  const like = `%${q}%`;

  const productResult = await pool.query(
    `SELECT id, sku, name, category, price, image_url FROM products
     WHERE LOWER(name) LIKE $1 OR LOWER(category) LIKE $2 OR LOWER(sku) LIKE $3
     ORDER BY name ASC LIMIT $4`,
    [like, like, like, limit]
  );

  const orders = await getAllOrders();
  const orderMatches = orders
    .filter((order) => {
      const items = parseItems(order.items);
      const itemText = items.map((i) => i?.name || i?.title || '').join(' ').toLowerCase();
      return (
        String(order.order_id || '').toLowerCase().includes(q) ||
        String(order.name || '').toLowerCase().includes(q) ||
        String(order.email || '').toLowerCase().includes(q) ||
        String(order.phone || '').toLowerCase().includes(q) ||
        itemText.includes(q)
      );
    })
    .slice(0, limit)
    .map((order) => {
      const items = parseItems(order.items);
      return {
        id: order.id,
        orderId: order.order_id || order.id,
        name: order.name,
        email: order.email,
        status: order.status,
        amount: Number(order.total_amount || 0),
        item: items[0]?.name || items[0]?.title || 'Order',
      };
    });

  const customerMap = new Map();
  orders.forEach((order) => {
    const email = String(order.email || '').toLowerCase();
    const name = String(order.name || '').toLowerCase();
    if (!email.includes(q) && !name.includes(q)) {
      return;
    }
    if (!customerMap.has(email)) {
      customerMap.set(email, {
        id: email,
        name: order.name,
        email: order.email,
        phone: order.phone,
        orders: 0,
      });
    }
    customerMap.get(email).orders += 1;
  });

  const customers = Array.from(customerMap.values()).slice(0, limit);

  return {
    products: productResult.rows.map((p) => ({
      id: p.id || p.sku,
      sku: p.sku,
      name: p.name,
      category: p.category,
      price: Number(p.price || 0),
      imageUrl: p.image_url,
    })),
    orders: orderMatches,
    customers,
  };
};

module.exports = { getDashboardStats, getRecentOrders, searchDashboard };
