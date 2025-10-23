import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Invite from '../models/Invite.js';
import { generateToken } from '../utils/jwt.js';

class InviteController {
  // Validate invite token
  static async validateInvite(req, res) {
    try {
      const { token } = req.params;
      
      const invite = await Invite.findByToken(token);
      if (!invite) {
        return res.status(404).json({ error: 'Invalid or expired invite' });
      }

      res.json({
        email: invite.email,
        role: invite.role,
        expires_at: invite.expires_at
      });
    } catch (error) {
      console.error('Validate invite error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Accept invite and create account
  static async acceptInvite(req, res) {
    try {
      const { token } = req.params;
      const { name, password } = req.body;

      if (!name || !password) {
        return res.status(400).json({ error: 'Name and password are required' });
      }

      const invite = await Invite.findByToken(token);
      if (!invite) {
        return res.status(404).json({ error: 'Invalid or expired invite' });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(invite.email);
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists with this email' });
      }

      // Create user
      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = await User.create({
        name,
        email: invite.email,
        password: hashedPassword,
        role: invite.role
      });

      await Invite.markAsUsed(invite.id);

      // Generate token
      const authToken = generateToken({
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      });

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
          },
          token: authToken
        }
      });
    } catch (error) {
      console.error('Accept invite error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default InviteController;