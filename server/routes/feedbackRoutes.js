const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/', feedbackController.submit);
router.get('/', requireAuth, requireAdmin, feedbackController.list);

module.exports = router;
