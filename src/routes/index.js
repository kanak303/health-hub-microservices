import express from 'express';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import inviteRoutes from './inviteRoutes.js';
import configRoutes from './configRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/invites', inviteRoutes);
router.use('/config', configRoutes);

export default router;