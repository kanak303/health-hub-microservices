const bcrypt = require('bcrypt');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { signupSchema, loginSchema } = require('../utils/validation');

const signup = async (req, res) => {
  try {
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { name, email, password, role } = value;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        },
        token
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  signup,
  login: async (req, res) => {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const { email, password } = value;

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Restrict login to PlatformAdmin only
      if (user.role !== 'PlatformAdmin') {
        return res.status(403).json({
          success: false,
          message: 'Only PlatformAdmin is allowed to login'
        });
      }

      const token = generateToken({ id: user.id, email: user.email, role: user.role });

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },
  impersonate: async (req, res) => {
    try {
      const { targetEmail, targetRole } = req.body;
      if (!targetEmail || !targetRole) {
        return res.status(400).json({ success: false, message: 'targetEmail and targetRole are required' });
      }

      const requester = req.user; // set by auth middleware

      // Only PlatformAdmin can impersonate ClinicAdmin
      if (requester.role !== 'PlatformAdmin' || targetRole !== 'ClinicAdmin') {
        return res.status(403).json({ success: false, message: 'Forbidden: only PlatformAdmin can impersonate ClinicAdmin' });
      }

      const targetUser = await User.findByEmail(targetEmail);
      if (!targetUser || targetUser.role !== targetRole) {
        return res.status(404).json({ success: false, message: 'Target user not found with requested role' });
      }

      const token = generateToken({ id: targetUser.id, email: targetUser.email, role: targetUser.role, impersonatedBy: requester.id });

      return res.json({
        success: true,
        message: 'Impersonation token issued',
        data: {
          user: {
            id: targetUser.id,
            name: targetUser.name,
            email: targetUser.email,
            role: targetUser.role
          },
          token
        }
      });
    } catch (error) {
      console.error('Impersonate error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};