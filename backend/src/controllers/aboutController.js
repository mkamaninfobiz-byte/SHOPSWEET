const {
  getAboutContent,
  updateAboutContent,
  updateCoreValues,
  updateWhyChoose,
  updateTeam,
  updateStats,
} = require('../utils/aboutModel');

const fetchAbout = async (req, res, next) => {
  try {
    const content = await getAboutContent();
    res.json(content);
  } catch (error) {
    next(error);
  }
};

const updateAbout = async (req, res, next) => {
  try {
    const { heading, tagline, story, commitment } = req.body;

    if (!heading && !tagline && !story && !commitment) {
      return res.status(400).json({ error: 'At least one field must be provided.' });
    }

    const updates = {};
    if (heading) updates.heading = heading;
    if (tagline) updates.tagline = tagline;
    if (story) updates.story = story;
    if (commitment) updates.commitment = commitment;

    const updated = await updateAboutContent(updates);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const updateAboutValues = async (req, res, next) => {
  try {
    const { coreValues } = req.body;

    if (!coreValues || !Array.isArray(coreValues)) {
      return res.status(400).json({ error: 'coreValues array is required.' });
    }

    const updated = await updateCoreValues(coreValues);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const updateAboutWhyChoose = async (req, res, next) => {
  try {
    const { whyChoose } = req.body;

    if (!whyChoose || !Array.isArray(whyChoose)) {
      return res.status(400).json({ error: 'whyChoose array is required.' });
    }

    const updated = await updateWhyChoose(whyChoose);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const updateAboutTeam = async (req, res, next) => {
  try {
    const { team } = req.body;

    if (!team || !Array.isArray(team)) {
      return res.status(400).json({ error: 'team array is required.' });
    }

    const valid = team.filter((member) => member?.name?.trim());
    if (valid.length === 0) {
      return res.status(400).json({ error: 'At least one team member with a name is required.' });
    }

    const updated = await updateTeam(valid);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const uploadTeamPhoto = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please select an image file to upload.' });
  }
  const url = `/uploads/team/${req.file.filename}`;
  return res.status(201).json({
    url,
    filename: req.file.filename,
    message: 'Team photo uploaded successfully.',
  });
};

const updateAboutStats = async (req, res, next) => {
  try {
    const { stats } = req.body;

    if (!stats || !Array.isArray(stats)) {
      return res.status(400).json({ error: 'stats array is required.' });
    }

    const valid = stats.filter((item) => item?.number?.trim() || item?.label?.trim());
    if (valid.length === 0) {
      return res.status(400).json({ error: 'Add at least one stat with a number or label.' });
    }

    const updated = await updateStats(valid);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  fetchAbout,
  updateAbout,
  updateAboutValues,
  updateAboutWhyChoose,
  updateAboutTeam,
  updateAboutStats,
  uploadTeamPhoto,
};
