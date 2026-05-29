const express = require('express');
const {
  fetchSettings,
  updateSettings,
  uploadLogo,
} = require('../controllers/settingsController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const { logoUpload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', fetchSettings);
router.put('/', requireAuth, requireAdmin, updateSettings);
router.post('/logo', requireAuth, requireAdmin, logoUpload.single('logo'), uploadLogo);

module.exports = router;
