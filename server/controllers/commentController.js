const commentModel = require('../models/commentModel');

function formatComment(row) {
  return {
    id: row.id,
    userId: row.user_id,
    content: row.content,
    createdAt: row.created_at,
    author: row.display_name || row.email || 'Аноним',
    likes: Number(row.likes || 0),
    dislikes: Number(row.dislikes || 0)
  };
}

async function list(req, res) {
  try {
    const rows = await commentModel.getAllWithLikes();
    res.json(rows.map(formatComment));
  } catch (e) {
    console.error('Comments list error:', e);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
}

async function create(req, res) {
  const { content } = req.body || {};
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Comment content required' });
  }

  try {
    const row = await commentModel.create(req.currentUser.id, content.trim());
    const comment = formatComment({ ...row, likes: 0, dislikes: 0 });

    if (req.app.locals.broadcast) {
      req.app.locals.broadcast({ type: 'comment_new', data: comment });
    }

    res.json(comment);
  } catch (e) {
    console.error('Comment create error:', e);
    res.status(500).json({ error: 'Failed to create comment' });
  }
}

async function like(req, res) {
  const commentId = Number(req.params.id);
  const isLike = req.body?.isLike !== false;

  try {
    const counts = await commentModel.setLike(commentId, req.currentUser.id, isLike);
    const payload = {
      type: 'comment_like',
      data: {
        commentId,
        likes: Number(counts?.likes || 0),
        dislikes: Number(counts?.dislikes || 0)
      }
    };

    if (req.app.locals.broadcast) {
      req.app.locals.broadcast(payload);
    }

    res.json(payload.data);
  } catch (e) {
    console.error('Like error:', e);
    res.status(500).json({ error: 'Failed to update like' });
  }
}

module.exports = { list, create, like };
