const { getFooterSettings, updateFooterSettings } = require('../utils/footerModel');

const fetchFooter = async (req, res, next) => {
  try {
    const data = await getFooterSettings();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const saveFooter = async (req, res, next) => {
  try {
    const {
      brandName,
      tagline,
      description,
      quickLinks,
      address,
      phone,
      email,
      copyrightText,
      bottomTagline,
    } = req.body;

    const links = Array.isArray(quickLinks)
      ? quickLinks
          .map((link) => ({
            label: (link.label || '').trim(),
            to: (link.to || '').trim(),
          }))
          .filter((link) => link.label && link.to)
      : undefined;

    const updated = await updateFooterSettings({
      brandName: brandName?.trim(),
      tagline: tagline?.trim(),
      description: description?.trim(),
      quickLinks: links,
      address: address?.trim(),
      phone: phone?.trim(),
      email: email?.trim(),
      copyrightText: copyrightText?.trim(),
      bottomTagline: bottomTagline?.trim(),
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = { fetchFooter, saveFooter };
