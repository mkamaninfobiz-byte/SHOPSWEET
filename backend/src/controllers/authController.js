const bcrypt = require('bcryptjs');
const { signToken } = require('../utils/jwt');
const {
  findUserByEmail,
  findUserById,
  addUser,
  updateUserById,
  toPublicUser,
} = require('../utils/userModel');

const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide name, email, and password.' });
  }

  const userExists = await findUserByEmail(email);
  if (userExists) {
    return res.status(400).json({ error: 'Email already registered.' });
  }

  const normalizedRole = role === 'Admin' ? 'Admin' : 'Customer';
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    name,
    email,
    passwordHash,
    role: normalizedRole,
  };

  await addUser(user);

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  res.json({ token, user: toPublicUser(user) });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password.' });
  }

  const user = await findUserByEmail(email);
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  res.json({ token, user: toPublicUser(user) });
};

const getMe = async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  res.json({ user: toPublicUser(user) });
};

const updateProfile = async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body || {};
  const user = await findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (email && email.toLowerCase() !== user.email) {
    const existing = await findUserByEmail(email);
    if (existing && existing.id !== user.id) {
      return res.status(400).json({ error: 'Email is already in use.' });
    }
  }

  let passwordHash;
  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required to set a new password.' });
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }
    passwordHash = await bcrypt.hash(newPassword, 10);
  }

  const updated = await updateUserById(user.id, {
    name: name?.trim() || user.name,
    email: email?.trim() || user.email,
    passwordHash,
  });

  const token = signToken({ id: updated.id, email: updated.email, roles: updated.roles });
  res.json({ token, user: toPublicUser(updated) });
};

module.exports = { register, login, getMe, updateProfile };
