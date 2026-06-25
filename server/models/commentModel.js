const { run, get, all } = require('../db/database');

async function getAllWithLikes() {
  return all(`
    SELECT
      c.id,
      c.user_id,
      c.content,
      c.created_at,
      u.display_name,
      u.email,
      COALESCE(SUM(CASE WHEN cl.is_like = 1 THEN 1 ELSE 0 END), 0) AS likes,
      COALESCE(SUM(CASE WHEN cl.is_like = 0 THEN 1 ELSE 0 END), 0) AS dislikes
    FROM comments c
    LEFT JOIN users u ON u.id = c.user_id
    LEFT JOIN comment_likes cl ON cl.comment_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at DESC
    LIMIT 100
  `);
}

async function create(userId, content) {
  const result = await run(
    `INSERT INTO comments (user_id, content) VALUES (?, ?)`,
    [userId, content]
  );
  return get(`
    SELECT c.id, c.user_id, c.content, c.created_at, u.display_name, u.email
    FROM comments c LEFT JOIN users u ON u.id = c.user_id WHERE c.id = ?
  `, [result.lastID]);
}

async function setLike(commentId, userId, isLike) {
  await run(
    `INSERT INTO comment_likes (comment_id, user_id, is_like) VALUES (?, ?, ?)
     ON CONFLICT(comment_id, user_id) DO UPDATE SET is_like = excluded.is_like`,
    [commentId, userId, isLike ? 1 : 0]
  );
  return get(`
    SELECT
      c.id,
      COALESCE(SUM(CASE WHEN cl.is_like = 1 THEN 1 ELSE 0 END), 0) AS likes,
      COALESCE(SUM(CASE WHEN cl.is_like = 0 THEN 1 ELSE 0 END), 0) AS dislikes
    FROM comments c
    LEFT JOIN comment_likes cl ON cl.comment_id = c.id
    WHERE c.id = ?
    GROUP BY c.id
  `, [commentId]);
}

module.exports = { getAllWithLikes, create, setLike };
