const bcrypt = require('bcrypt');
const User = require('../models/User');
const { signupSchema } = require('../utils/validation');

class AdminController {
  // Create users based on role
  static async createUser(req, res) {
    try {
      const { error, value } = signupSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { name, email, password, role } = value;
      const requesterRole = req.user.role;

      // Role validation
      const allowedCreations = {
        'PlatformAdmin': ['ClinicAdmin'],
        'ClinicAdmin': ['Doctor']
      };

      if (!allowedCreations[requesterRole]?.includes(role)) {
        return res.status(403).json({ 
          error: `${requesterRole} can only create: ${allowedCreations[requesterRole]?.join(', ') || 'none'}` 
        });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      // Create user
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

module.exports = AdminController;