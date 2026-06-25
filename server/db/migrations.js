const { run, get } = require('./database');

const MIGRATIONS = [
  {
    id: 1,
    name: 'create_migrations_table',
    up: async () => {
      await run(`CREATE TABLE IF NOT EXISTS schema_migrations (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
    }
  },
  {
    id: 2,
    name: 'create_users',
    up: async () => {
      await run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        display_name TEXT,
        first_name TEXT,
        last_name TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
    }
  },
  {
    id: 3,
    name: 'create_location_tables',
    up: async () => {
      await run(`CREATE TABLE IF NOT EXISTS location_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        country TEXT,
        city TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        duration INTEGER DEFAULT 0
      )`);
      await run(`CREATE TABLE IF NOT EXISTS country_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        country TEXT NOT NULL,
        total_time INTEGER DEFAULT 0,
        visit_count INTEGER DEFAULT 0,
        last_visit DATETIME,
        UNIQUE(user_id, country)
      )`);
      await run(`CREATE TABLE IF NOT EXISTS city_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        city TEXT NOT NULL,
        country TEXT NOT NULL,
        total_time INTEGER DEFAULT 0,
        visit_count INTEGER DEFAULT 0,
        last_visit DATETIME,
        UNIQUE(user_id, city)
      )`);
    }
  },
  {
    id: 4,
    name: 'create_moderation_logs',
    up: async () => {
      await run(`CREATE TABLE IF NOT EXISTS moderation_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_user_id INTEGER NOT NULL,
        target_user_id INTEGER,
        action TEXT NOT NULL,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
    }
  },
  {
    id: 5,
    name: 'create_feedback',
    up: async () => {
      await run(`CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        telegram_sent INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
    }
  },
  {
    id: 6,
    name: 'create_comments_likes',
    up: async () => {
      await run(`CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`);
      await run(`CREATE TABLE IF NOT EXISTS comment_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        comment_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        is_like INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(comment_id, user_id),
        FOREIGN KEY (comment_id) REFERENCES comments(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`);
    }
  },
  {
    id: 7,
    name: 'add_user_name_columns',
    up: async () => {
      try { await run(`ALTER TABLE users ADD COLUMN first_name TEXT`); } catch (_) {}
      try { await run(`ALTER TABLE users ADD COLUMN last_name TEXT`); } catch (_) {}
      try { await run(`ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'`); } catch (_) {}
      try { await run(`ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1`); } catch (_) {}
    }
  }
];

async function runMigrations() {
  await MIGRATIONS[0].up();

  for (const migration of MIGRATIONS) {
    const applied = await get(`SELECT id FROM schema_migrations WHERE name = ?`, [migration.name]);
    if (applied) continue;
    await migration.up();
    await run(`INSERT INTO schema_migrations (id, name) VALUES (?, ?)`, [migration.id, migration.name]);
    console.log(`Migration applied: ${migration.name}`);
  }

  const adminCount = await get(`SELECT COUNT(*) AS total FROM users WHERE role = 'admin'`);
  if (Number(adminCount?.total || 0) === 0) {
    const firstUser = await get(`SELECT id FROM users ORDER BY id ASC LIMIT 1`);
    if (firstUser?.id) {
      await run(`UPDATE users SET role = 'admin' WHERE id = ?`, [firstUser.id]);
    }
  }
}

module.exports = { runMigrations };
