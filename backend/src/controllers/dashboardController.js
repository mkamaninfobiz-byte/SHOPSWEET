const { getDashboardStats, getRecentOrders, searchDashboard } = require('../utils/dashboardModel');

const getStats = async (req, res) => {
  const stats = await getDashboardStats();
  const recentOrders = await getRecentOrders(5);
  res.json({ stats, recentOrders });
};

const search = async (req, res) => {
  const q = req.query.q || '';
  const results = await searchDashboard(q, 8);
  res.json(results);
};

module.exports = { getStats, search };
