const { db } = require('../db/database');

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  db.get(
    `SELECT id, email, display_name, first_name, last_name, role, is_active FROM users WHERE id = ?`,
    [req.session.userId],
    (err, row) => {
      if (err) {
        console.error('Auth check error:', err);
        return res.status(500).json({ error: 'Auth check failed' });
      }
      if (!row) {
        req.session.destroy(() => {});
        return res.status(401).json({ error: 'Unauthorized' });
      }
      if (!row.is_active) {
        req.session.destroy(() => {});
        return res.status(403).json({ error: 'User is blocked' });
      }
      req.currentUser = row;
      next();
    }
  );
}

function requireAdmin(req, res, next) {
  if (!req.currentUser || req.currentUser.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

function parsePagination(query, defaults = { page: 1, pageSize: 10, maxPageSize: 100 }) {
  const page = Math.max(1, Number(query.page) || defaults.page);
  const pageSize = Math.min(defaults.maxPageSize, Math.max(1, Number(query.pageSize) || defaults.pageSize));
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

module.exports = { requireAuth, requireAdmin, parsePagination };
