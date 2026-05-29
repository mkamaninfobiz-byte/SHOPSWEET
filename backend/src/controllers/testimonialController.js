const { getTestimonials, updateTestimonials } = require('../utils/testimonialModel');

const fetchTestimonials = async (req, res, next) => {
  try {
    const data = await getTestimonials();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const saveTestimonials = async (req, res, next) => {
  try {
    const { sectionTitle, sectionSubtitle, items } = req.body;
    if (items !== undefined && !Array.isArray(items)) {
      return res.status(400).json({ error: 'items must be an array.' });
    }
    const normalized = (items || []).map((item, index) => ({
      id: item.id || `t-${Date.now()}-${index}`,
      name: (item.name || '').trim(),
      role: (item.role || '').trim(),
      quote: (item.quote || '').trim(),
      rating: Math.min(5, Math.max(1, Number(item.rating) || 5)),
      image_url:
        item.image_url ||
        item.imageUrl ||
        item.photo_url ||
        item.photoUrl ||
        item.photo ||
        item.image ||
        null,
    })).filter((item) => item.name && item.quote);

    const updated = await updateTestimonials({
      sectionTitle: sectionTitle?.trim(),
      sectionSubtitle: sectionSubtitle?.trim(),
      items: normalized,
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const uploadTestimonialPhoto = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please select an image file to upload.' });
  }
  const url = `/uploads/testimonials/${req.file.filename}`;
  return res.status(201).json({
    url,
    filename: req.file.filename,
    message: 'Testimonial photo uploaded successfully.',
  });
};

module.exports = { fetchTestimonials, saveTestimonials, uploadTestimonialPhoto };
