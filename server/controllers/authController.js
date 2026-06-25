const userModel = require('../models/userModel');

async function register(req, res) {
  const { email, password, displayName, firstName, lastName } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  try {
    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = await userModel.createUser({ email, password, displayName, firstName, lastName });
    req.session.userId = user.id;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive
      },
      passwordEncrypted: true,
      hashPreview: user.passwordHash.substring(0, 20) + '...'
    });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ error: 'Failed to create user' });
  }
}

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  try {
    const row = await userModel.findByEmail(email);
    if (!row) return res.status(401).json({ error: 'Invalid credentials' });
    if (!row.is_active) return res.status(403).json({ error: 'User is blocked' });

    const ok = await userModel.verifyPassword(password, row.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    req.session.userId = row.id;
    res.json({ user: userModel.sanitizeUserRow(row) });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Failed to login' });
  }
}

function logout(req, res) {
  if (!req.session) return res.json({ success: true });
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.json({ success: true });
  });
}

async function me(req, res) {
  const userId = req.session?.userId;
  if (!userId) return res.json({ user: null });

  try {
    const row = await userModel.findById(userId);
    res.json({ user: userModel.sanitizeUserRow(row) });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

async function demoPasswordHash(req, res) {
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: 'Password required' });

  const bcrypt = require('bcrypt');
  const hash = await bcrypt.hash(String(password), 12);
  res.json({
    plain: '***hidden***',
    hash,
    algorithm: 'bcrypt',
    rounds: 12,
    note: 'Пароли в БД хранятся только в виде хеша (Лаб. 5)'
  });
}

module.exports = { register, login, logout, me, demoPasswordHash };
