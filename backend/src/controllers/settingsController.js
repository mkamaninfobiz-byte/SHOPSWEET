const { getSiteSettings, saveSiteSettings } = require('../utils/settingsModel');

const fetchSettings = async (req, res) => {
  const settings = await getSiteSettings();
  res.json(settings);
};

const updateSettings = async (req, res) => {
  const { brandName, tagline, logoUrl } = req.body || {};
  const settings = await saveSiteSettings({ brandName, tagline, logoUrl });
  res.json(settings);
};

const uploadLogo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No logo file uploaded.' });
  }
  const logoUrl = `/uploads/logo/${req.file.filename}`;
  const settings = await saveSiteSettings({ logoUrl });
  res.json({ logoUrl, settings });
};

module.exports = { fetchSettings, updateSettings, uploadLogo };
