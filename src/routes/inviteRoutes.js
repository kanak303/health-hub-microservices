const express = require('express');
const { validateInvite, acceptInvite } = require('../controllers/inviteController');

const router = express.Router();

// Validate invite token
router.get('/:token', validateInvite);

// Accept invite and create account
router.post('/:token/accept', acceptInvite);

module.exports = router;