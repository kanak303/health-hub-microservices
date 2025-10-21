const express = require('express');
const { createUser } = require('../controllers/adminController');
const { authenticate, requireRoles } = require('../middleware/auth');

const router = express.Router();

// POST /v1/admin/users 
router.post('/users', authenticate, requireRoles('PlatformAdmin', 'ClinicAdmin'), createUser);

module.exports = router;