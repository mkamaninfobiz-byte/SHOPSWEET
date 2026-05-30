const { verifyToken } = require('../utils/jwt');
const { findUserById } = require('../utils/userModel');

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

const requireAdmin = async (req, res, next) => {
  console.log('JWT User:', req.user);
  // Fetch database user for comparison/debugging
  let user = null;
  try {
    if (req.user && req.user.id) {
      user = await findUserById(req.user.id);
    }
  } catch (err) {
    console.error('Error fetching user from DB in requireAdmin:', err);
  }
  console.log('Database User:', user);

  // Check the role from the decoded JWT payload
  const jwtRole = req.user?.role;
  if (jwtRole !== 'Admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  return next();
};

module.exports = { requireAuth, requireAdmin };