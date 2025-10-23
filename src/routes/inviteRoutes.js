import express from 'express';
import InviteController from '../controllers/inviteController.js';

const router = express.Router();

// Validate invite token
router.get('/:token', InviteController.validateInvite);

// Accept invite and create account
router.post('/:token/accept', InviteController.acceptInvite);

export default router;