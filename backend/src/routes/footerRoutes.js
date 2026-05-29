const express = require('express');
const { fetchFooter, saveFooter } = require('../controllers/footerController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', fetchFooter);
router.put('/', requireAuth, requireAdmin, saveFooter);

module.exports = router;
