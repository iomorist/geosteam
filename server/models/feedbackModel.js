const { run, get, all } = require('../db/database');

async function create({ name, email, message, telegramSent }) {
  const result = await run(
    `INSERT INTO feedback (name, email, message, telegram_sent) VALUES (?, ?, ?, ?)`,
    [name, email, message, telegramSent ? 1 : 0]
  );
  return { id: result.lastID, name, email, message, telegramSent };
}

async function getAll(limit = 50) {
  return all(`SELECT * FROM feedback ORDER BY created_at DESC LIMIT ?`, [limit]);
}

module.exports = { create, getAll };
