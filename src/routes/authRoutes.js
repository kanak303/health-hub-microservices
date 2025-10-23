import express from 'express';
import { signup, login, impersonate } from '../controllers/authController.js';
import { authenticate, requireRoles } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/impersonate', authenticate, requireRoles('PlatformAdmin'), impersonate);

export default router;