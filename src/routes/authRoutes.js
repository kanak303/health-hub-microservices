const express = require('express');
const { signup, login, impersonate } = require('../controllers/authController');
const { authenticate, requireRoles } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/impersonate', authenticate, requireRoles('PlatformAdmin'), impersonate);

module.exports = router;