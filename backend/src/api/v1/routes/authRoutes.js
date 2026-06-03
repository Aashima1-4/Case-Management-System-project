const express = require('express');
const { register, login, getMe, getUsersByRole } = require('../controllers/authController');
const { protect } = require('../../../middleware/auth');
const { authorize } = require('../../../middleware/authorize');
const { ROLES } = require('../../../config/permissions');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize(ROLES.ADMIN, ROLES.ADMINISTRATION), getUsersByRole);

module.exports = router;
