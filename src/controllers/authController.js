import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { signupSchema, loginSchema, patientSignupSchema } from '../utils/validation.js';

export const signup = async (req, res) => {
  try {
    const { error, value } = patientSignupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { name, email, password } = value;
    const role = 'Patient'; 

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

export const login = async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { email, password } = value;
    console.log('Looking for user:', email);

    const user = await User.findByEmail(email);
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', passwordMatch);
    
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Allow Patient to login
    if (!['PlatformAdmin', 'Patient'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only PlatformAdmin and Patient are allowed to login'
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
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const impersonate = async (req, res) => {
  try {
    const { targetEmail, targetRole } = req.body;
    if (!targetEmail || !targetRole) {
      return res.status(400).json({ success: false, message: 'targetEmail and targetRole are required' });
    }

    const requester = req.user;

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
};