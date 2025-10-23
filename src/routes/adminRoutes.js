import express from 'express';
import AdminController from '../controllers/adminController.js';
import { authenticate, requireRoles } from '../middleware/auth.js';

const router = express.Router();

// Send invite
router.post('/invites', authenticate, requireRoles('PlatformAdmin', 'ClinicAdmin'), AdminController.sendInvite);

router.post('/users', authenticate, requireRoles('PlatformAdmin', 'ClinicAdmin'), AdminController.createUser);

export default router;