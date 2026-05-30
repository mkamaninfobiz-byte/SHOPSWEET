const { verifyConnection } = require('./db');

const INITIALIZERS = [
  { name: 'products', run: () => require('../utils/productModel').ensureProductsReady() },
  { name: 'users', run: () => require('../utils/userModel').initialize() },
  { name: 'orders', run: () => require('../utils/orderModel').initialize() },
  { name: 'contacts', run: () => require('../utils/contactModel').initialize() },
  { name: 'about', run: () => require('../utils/aboutModel').initialize() },
  { name: 'site_settings', run: () => require('../utils/settingsModel').initialize() },
  { name: 'footer_settings', run: () => require('../utils/footerModel').initialize() },
  { name: 'testimonial_settings', run: () => require('../utils/testimonialModel').initialize() },
];

const initDatabase = async () => {
  await verifyConnection();

  for (const step of INITIALIZERS) {
    try {
      await step.run();
    } catch (err) {
      console.error(`Failed to initialize ${step.name}:`, err.message || err);
      throw err;
    }
  }

  console.log('✅ All database tables ready');
};

module.exports = { initDatabase };
