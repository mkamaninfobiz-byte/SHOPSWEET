const multer = require('multer');
const path = require('path');
const fs = require('fs');

const teamUploadDir = path.join(__dirname, '../../uploads/team');
const testimonialUploadDir = path.join(__dirname, '../../uploads/testimonials');
const logoUploadDir = path.join(__dirname, '../../uploads/logo');
fs.mkdirSync(teamUploadDir, { recursive: true });
fs.mkdirSync(testimonialUploadDir, { recursive: true });
fs.mkdirSync(logoUploadDir, { recursive: true });

const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new Error('Only JPG, PNG, WEBP or GIF images are allowed.'), false);
};

const teamPhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, teamUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg';
    cb(null, `team-${Date.now()}${safeExt}`);
  },
});

const teamPhotoUpload = multer({
  storage: teamPhotoStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const testimonialPhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, testimonialUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg';
    cb(null, `testimonial-${Date.now()}${safeExt}`);
  },
});

const testimonialPhotoUpload = multer({
  storage: testimonialPhotoStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, logoUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(ext) ? ext : '.png';
    cb(null, `logo-${Date.now()}${safeExt}`);
  },
});

const logoUpload = multer({
  storage: logoStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

module.exports = { teamPhotoUpload, testimonialPhotoUpload, logoUpload };
