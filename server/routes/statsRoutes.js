const express = require('express');
const locationController = require('../controllers/locationController');
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/countries', requireAuth, locationController.countries);
router.get('/cities', requireAuth, locationController.cities);
router.get('/admin/users', requireAuth, requireAdmin, adminController.listUsers);
router.patch('/admin/users/:id', requireAuth, requireAdmin, adminController.updateUser);
router.delete('/admin/users/:id', requireAuth, requireAdmin, adminController.deleteUser);
router.get('/admin/logs', requireAuth, requireAdmin, adminController.listLogs);

module.exports = router;
