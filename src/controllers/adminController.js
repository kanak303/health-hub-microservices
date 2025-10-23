import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../models/User.js';
import Invite from '../models/Invite.js';
import { signupSchema } from '../utils/validation.js';

class AdminController {
  //Send invite
  static async sendInvite(req, res) {
    try {
      const { email, role } = req.body;
      const requesterRole = req.user.role;

      // Role validation
      const allowedInvites = {
        'PlatformAdmin': ['ClinicAdmin'],
        'ClinicAdmin': ['Doctor']
      };

      if (!allowedInvites[requesterRole]?.includes(role)) {
        return res.status(403).json({ 
          error: `${requesterRole} can only invite: ${allowedInvites[requesterRole]?.join(', ') || 'none'}` 
        });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists with this email' });
      }

      // Check if active invite exists
      const existingInvite = await Invite.findByEmail(email);
      if (existingInvite) {
        return res.status(409).json({ error: 'Active invite already exists for this email' });
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const invite = await Invite.create({
        email,
        role,
        token,
        invited_by: req.user.id,
        expires_at: expiresAt
      });

      res.status(201).json({
        id: invite.id,
        email: invite.email,
        role: invite.role,
        inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invite/${token}`,
        expires_at: invite.expires_at
      });
    } catch (error) {
      console.error('Send invite error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Create users based on role hierarchy 
  static async createUser(req, res) {
    try {
      const { error, value } = signupSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { name, email, password, role } = value;
      const requesterRole = req.user.role;

      const allowedCreations = {
        'PlatformAdmin': ['ClinicAdmin'],
        'ClinicAdmin': ['Doctor']
      };

      if (!allowedCreations[requesterRole]?.includes(role)) {
        return res.status(403).json({ 
          error: `${requesterRole} can only create: ${allowedCreations[requesterRole]?.join(', ') || 'none'}` 
        });
      }

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = await User.create({ name, email, password: hashedPassword, role });

      res.status(201).json({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        created_at: newUser.created_at
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default AdminController;