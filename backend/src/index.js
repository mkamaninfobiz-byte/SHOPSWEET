require('dotenv').config();
const app = require('./app');
const { initDatabase } = require('./config/initDatabase');

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`ShopSweet backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message || error);
    process.exit(1);
  }
};

startServer();
