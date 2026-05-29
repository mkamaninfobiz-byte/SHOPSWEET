const express = require('express');
const { createContact, getContacts, updateContact, removeContact } = require('../controllers/contactController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', createContact);
router.get('/', requireAuth, requireAdmin, getContacts);
router.put('/:id', requireAuth, requireAdmin, updateContact);
router.delete('/:id', requireAuth, requireAdmin, removeContact);

module.exports = router;
