require('dotenv').config();
require('./config/db');
const app = require('./app');
const { ensureProductsReady } = require('./utils/productModel');

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await ensureProductsReady();
    app.listen(PORT, () => {
      console.log(`ShopSweet backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message || error);
    process.exit(1);
  }
};

startServer();
