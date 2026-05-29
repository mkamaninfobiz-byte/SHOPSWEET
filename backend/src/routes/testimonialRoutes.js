const express = require('express');
const {
  fetchTestimonials,
  saveTestimonials,
  uploadTestimonialPhoto,
} = require('../controllers/testimonialController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const { testimonialPhotoUpload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', fetchTestimonials);
router.put('/', requireAuth, requireAdmin, saveTestimonials);
router.post(
  '/upload',
  requireAuth,
  requireAdmin,
  testimonialPhotoUpload.single('photo'),
  uploadTestimonialPhoto
);

module.exports = router;
