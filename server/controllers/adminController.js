const { db } = require('../db/database');
const { parsePagination } = require('../middleware/auth');

function logModerationAction(adminUserId, targetUserId, action, details) {
  db.run(
    `INSERT INTO moderation_logs (admin_user_id, target_user_id, action, details) VALUES (?, ?, ?, ?)`,
    [adminUserId, targetUserId || null, action, details ? JSON.stringify(details) : null]
  );
}

function listUsers(req, res) {
  const { page, pageSize, offset } = parsePagination(req.query, { page: 1, pageSize: 10, maxPageSize: 100 });
  const search = String(req.query.search || '').trim();
  const role = String(req.query.role || '').trim();
  const status = String(req.query.status || '').trim();

  const where = [];
  const params = [];

  if (search) {
    where.push(`(email LIKE ? OR display_name LIKE ? OR CAST(id AS TEXT) LIKE ?)`);
    const like = `%${search}%`;
    params.push(like, like, like);
  }
  if (role === 'user' || role === 'admin') {
    where.push(`role = ?`);
    params.push(role);
  }
  if (status === 'active') where.push(`is_active = 1`);
  else if (status === 'blocked') where.push(`is_active = 0`);

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  db.get(`SELECT COUNT(*) AS total FROM users ${whereSql}`, params, (countErr, countRow) => {
    if (countErr) return res.status(500).json({ error: 'Failed to fetch users' });
    const total = Number(countRow?.total || 0);

    db.all(
      `SELECT id, email, display_name, first_name, last_name, role, is_active, created_at
       FROM users ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset],
      (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch users' });
        res.json({
          users: rows.map((row) => ({
            id: row.id,
            email: row.email,
            displayName: row.display_name,
            firstName: row.first_name,
            lastName: row.last_name,
            role: row.role || 'user',
            isActive: !!row.is_active,
            createdAt: row.created_at
          })),
          pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
        });
      }
    );
  });
}

function updateUser(req, res) {
  const targetId = Number(req.params.id);
  const { role, isActive, displayName } = req.body || {};
  const updates = [];
  const params = [];

  if (role !== undefined) {
    if (role !== 'user' && role !== 'admin') return res.status(400).json({ error: 'Invalid role value' });
    updates.push('role = ?');
    params.push(role);
  }
  if (isActive !== undefined) {
    updates.push('is_active = ?');
    params.push(isActive ? 1 : 0);
  }
  if (displayName !== undefined) {
    updates.push('display_name = ?');
    params.push(displayName || null);
  }
  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

  if (targetId === req.currentUser.id && role === 'user') {
    return res.status(400).json({ error: 'Cannot demote current admin account' });
  }
  if (targetId === req.currentUser.id && isActive === false) {
    return res.status(400).json({ error: 'Cannot block current admin account' });
  }

  params.push(targetId);
  db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params, function (err) {
    if (err) return res.status(500).json({ error: 'Failed to update user' });
    logModerationAction(req.currentUser.id, targetId, 'user_update', { role, isActive, displayName });
    res.json({ success: true, changes: this.changes });
  });
}

function deleteUser(req, res) {
  const targetId = Number(req.params.id);
  if (targetId === req.currentUser.id) {
    return res.status(400).json({ error: 'Cannot delete current admin account' });
  }

  db.serialize(() => {
    db.run(`DELETE FROM location_records WHERE user_id = ?`, [String(targetId)]);
    db.run(`DELETE FROM country_stats WHERE user_id = ?`, [String(targetId)]);
    db.run(`DELETE FROM city_stats WHERE user_id = ?`, [String(targetId)]);
    db.run(`DELETE FROM users WHERE id = ?`, [targetId], function (err) {
      if (err) return res.status(500).json({ error: 'Failed to delete user' });
      logModerationAction(req.currentUser.id, targetId, 'user_delete', { deleted: this.changes > 0 });
      res.json({ success: true, changes: this.changes });
    });
  });
}

function listLogs(req, res) {
  const { page, pageSize, offset } = parsePagination(req.query, { page: 1, pageSize: 15, maxPageSize: 100 });
  const search = String(req.query.search || '').trim();
  const action = String(req.query.action || '').trim();

  const where = [];
  const params = [];
  if (search) {
    where.push(`(CAST(ml.admin_user_id AS TEXT) LIKE ? OR CAST(ml.target_user_id AS TEXT) LIKE ?
      OR au.email LIKE ? OR tu.email LIKE ? OR ml.action LIKE ?)`);
    const like = `%${search}%`;
    params.push(like, like, like, like, like);
  }
  if (action) {
    where.push(`ml.action = ?`);
    params.push(action);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  db.get(
    `SELECT COUNT(*) AS total FROM moderation_logs ml
     LEFT JOIN users au ON au.id = ml.admin_user_id
     LEFT JOIN users tu ON tu.id = ml.target_user_id ${whereSql}`,
    params,
    (countErr, countRow) => {
      if (countErr) return res.status(500).json({ error: 'Failed to fetch moderation logs' });
      const total = Number(countRow?.total || 0);

      db.all(
        `SELECT ml.id, ml.admin_user_id, ml.target_user_id, ml.action, ml.details, ml.created_at,
                au.email AS admin_email, tu.email AS target_email
         FROM moderation_logs ml
         LEFT JOIN users au ON au.id = ml.admin_user_id
         LEFT JOIN users tu ON tu.id = ml.target_user_id
         ${whereSql} ORDER BY ml.created_at DESC LIMIT ? OFFSET ?`,
        [...params, pageSize, offset],
        (err, rows) => {
          if (err) return res.status(500).json({ error: 'Failed to fetch moderation logs' });
          res.json({
            logs: rows.map((row) => ({
              id: row.id,
              adminUserId: row.admin_user_id,
              adminEmail: row.admin_email,
              targetUserId: row.target_user_id,
              targetEmail: row.target_email,
              action: row.action,
              details: row.details ? JSON.parse(row.details) : null,
              createdAt: row.created_at
            })),
            pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
          });
        }
      );
    }
  );
}

module.exports = { listUsers, updateUser, deleteUser, listLogs };
