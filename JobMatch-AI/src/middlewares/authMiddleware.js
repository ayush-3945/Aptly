const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const DEMO_USERS = {
  '64f8a1b2c3d4e5f6a7b8c9d0': {
    _id: '64f8a1b2c3d4e5f6a7b8c9d0',
    id: '64f8a1b2c3d4e5f6a7b8c9d0',
    name: 'Alex Morgan',
    email: 'candidate@jobmatch.ai',
    role: 'candidate',
  },
  '64f8a1b2c3d4e5f6a7b8c9d1': {
    _id: '64f8a1b2c3d4e5f6a7b8c9d1',
    id: '64f8a1b2c3d4e5f6a7b8c9d1',
    name: 'Sarah Jenkins',
    email: 'recruiter@jobmatch.ai',
    role: 'recruiter',
  },
};

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'Server misconfiguration: JWT_SECRET missing.' });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (mongoose.connection.readyState === 1) {
        try {
          req.user = await User.findById(decoded.id).select('-password');
        } catch (_dbErr) {
          // Graceful fallback to decoded payload
        }
      }

      if (!req.user) {
        if (DEMO_USERS[decoded.id]) {
          req.user = DEMO_USERS[decoded.id];
        } else {
          req.user = {
            _id: decoded.id,
            id: decoded.id,
            role: decoded.role || (decoded.id === '64f8a1b2c3d4e5f6a7b8c9d1' ? 'recruiter' : 'candidate'),
            email: decoded.email || '',
            name: decoded.name || 'User',
          };
        }
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const optionalProtect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      if (!process.env.JWT_SECRET) return next();
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (mongoose.connection.readyState === 1) {
        try {
          req.user = await User.findById(decoded.id).select('-password');
        } catch (_e) {}
      }
      if (!req.user) {
        req.user = DEMO_USERS[decoded.id] || {
          _id: decoded.id,
          id: decoded.id,
          role: decoded.role || 'candidate',
          email: decoded.email || '',
        };
      }
    } catch (_err) {
      // Non-blocking for optional auth
    }
  }
  next();
};

module.exports = { protect, optionalProtect };
