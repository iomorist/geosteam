const express = require('express');
const locationController = require('../controllers/locationController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/update', requireAuth, locationController.update);
router.get('/history', requireAuth, locationController.history);

module.exports = router;
