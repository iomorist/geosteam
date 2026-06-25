const express = require('express');
const commentController = require('../controllers/commentController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', commentController.list);
router.post('/', requireAuth, commentController.create);
router.post('/:id/like', requireAuth, commentController.like);
router.post('/:id/dislike', requireAuth, (req, res) => {
  req.body = { isLike: false };
  commentController.like(req, res);
});

module.exports = router;
