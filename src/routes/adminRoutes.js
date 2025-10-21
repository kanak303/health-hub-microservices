const express = require('express');
const { createInvite, getInvites, revokeInvite } = require('../controllers/adminController');
const { authenticate, requireRoles } = require('../middleware/auth');

const router = express.Router();

// POST /v1/admin/invites - Create new invite
router.post('/invites', authenticate, requireRoles('PlatformAdmin'), createInvite);

// GET /v1/admin/invites - List all invites  
router.get('/invites', authenticate, requireRoles('PlatformAdmin'), getInvites);

// PATCH /v1/admin/invites/:id/revoke - Revoke specific invite
router.patch('/invites/:id/revoke', authenticate, requireRoles('PlatformAdmin'), revokeInvite);

module.exports = router;

