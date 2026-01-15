import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    console.log('=== AUTH DEBUG ===');
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);
    console.log('Authorization header exists:', !!req.headers.authorization);
    console.log('Token exists:', !!token);
    console.log('Token length:', token?.length || 0);
    if (token) {
      console.log('Token first 20 chars:', token.substring(0, 20) + '...');
    }
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);

    if (!token) {
      console.log('ERROR: No token provided');
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route - no token'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('JWT decoded successfully:', decoded);
      
      req.user = await User.findById(decoded.id).select('-password');
      console.log('User found:', !!req.user);
      console.log('User role:', req.user?.role);
      
      if (!req.user) {
        console.log('ERROR: User not found');
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!req.user.isActive) {
        console.log('ERROR: User not active');
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated'
        });
      }

      console.log('Authentication successful');
      next();
    } catch (error) {
      console.log('JWT verification error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route - invalid token'
      });
    }
  } catch (error) {
    console.log('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('=== AUTHORIZE DEBUG ===');
    console.log('Required roles:', roles);
    console.log('User role:', req.user?.role);
    console.log('User exists:', !!req.user);
    console.log('Role authorized:', roles.includes(req.user?.role));
    
    if (!roles.includes(req.user.role)) {
      console.log('ERROR: Role not authorized');
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    console.log('Authorization successful');
    next();
  };
};

// Convenience middleware for admin-only routes
export const admin = authorize('admin');
