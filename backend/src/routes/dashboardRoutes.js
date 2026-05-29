const express = require('express');
const { getStats, search } = require('../controllers/dashboardController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', requireAuth, requireAdmin, getStats);
router.get('/search', requireAuth, requireAdmin, search);

module.exports = router;
