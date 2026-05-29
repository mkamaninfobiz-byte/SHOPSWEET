const express = require('express');
const { createPublicOrder, fetchOrders, updateOrder, removeOrder } = require('../controllers/orderController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', requireAuth, requireAdmin, fetchOrders);
router.put('/:id', requireAuth, requireAdmin, updateOrder);
router.delete('/:id', requireAuth, requireAdmin, removeOrder);
router.post('/public', createPublicOrder);

module.exports = router;
