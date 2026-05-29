const express = require('express');
const {
  fetchAbout,
  updateAbout,
  updateAboutValues,
  updateAboutWhyChoose,
  updateAboutTeam,
  updateAboutStats,
  uploadTeamPhoto,
} = require('../controllers/aboutController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const { teamPhotoUpload } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', fetchAbout);

// Admin routes
router.put('/', requireAuth, requireAdmin, updateAbout);
router.put('/values', requireAuth, requireAdmin, updateAboutValues);
router.put('/why-choose', requireAuth, requireAdmin, updateAboutWhyChoose);
router.put('/team', requireAuth, requireAdmin, updateAboutTeam);
router.post(
  '/team/upload',
  requireAuth,
  requireAdmin,
  teamPhotoUpload.single('photo'),
  uploadTeamPhoto
);
router.put('/stats', requireAuth, requireAdmin, updateAboutStats);

module.exports = router;
