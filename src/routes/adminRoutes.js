const express = require('express');
const { createUser, sendInvite } = require('../controllers/adminController');
const { authenticate, requireRoles } = require('../middleware/auth');

const router = express.Router();

// Send invite
router.post('/invites', authenticate, requireRoles('PlatformAdmin', 'ClinicAdmin'), sendInvite);

router.post('/users', authenticate, requireRoles('PlatformAdmin', 'ClinicAdmin'), createUser);

module.exports = router;