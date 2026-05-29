const { verifyToken } = require('../utils/jwt');

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token missing.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

const requireAdmin = (req, res, next) => {
  const roles = req.user?.roles || [];
  if (!roles.includes('Admin')) {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  return next();
};

module.exports = { requireAuth, requireAdmin };