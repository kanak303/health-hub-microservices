import { verifyToken } from '../utils/jwt.js';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    console.log('Auth header:', authHeader);
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    console.log('Token:', token ? 'Present' : 'Missing');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Missing Authorization token' });
    }
    const decoded = verifyToken(token);
    console.log('Decoded token:', decoded);
    req.user = decoded;
    return next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token', error: error.message });
  }
};

export const requireRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
  }
  return next();
};


