const bcrypt = require('bcrypt');
const { run, get } = require('../db/database');

function sanitizeUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role || 'user',
    isActive: !!row.is_active
  };
}

async function createUser({ email, password, displayName, firstName, lastName }) {
  const passwordHash = await bcrypt.hash(String(password), 12);
  const countRow = await get(`SELECT COUNT(*) AS total FROM users`);
  const role = Number(countRow?.total || 0) === 0 ? 'admin' : 'user';

  const result = await run(
    `INSERT INTO users (email, password_hash, display_name, first_name, last_name, role, is_active)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [
      String(email).toLowerCase(),
      passwordHash,
      displayName || null,
      firstName || null,
      lastName || null,
      role
    ]
  );

  return {
    id: result.lastID,
    email: String(email).toLowerCase(),
    displayName: displayName || null,
    firstName: firstName || null,
    lastName: lastName || null,
    role,
    isActive: true,
    passwordHash
  };
}

async function findByEmail(email) {
  return get(`SELECT * FROM users WHERE email = ?`, [String(email).toLowerCase()]);
}

async function findById(id) {
  return get(
    `SELECT id, email, display_name, first_name, last_name, role, is_active, password_hash, created_at FROM users WHERE id = ?`,
    [id]
  );
}

async function verifyPassword(plain, hash) {
  return bcrypt.compare(String(plain), hash);
}

module.exports = { sanitizeUserRow, createUser, findByEmail, findById, verifyPassword };
