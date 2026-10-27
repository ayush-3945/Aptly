const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Supported Demo Credentials (Seeded, safe mock profiles for interviewers & reviewers)
const DEMO_USERS = {
  'candidate@aptly.ai': {
    _id: '64f8a1b2c3d4e5f6a7b8c9d0',
    name: 'Alex Morgan',
    email: 'candidate@aptly.ai',
    role: 'candidate',
  },
  'recruiter@aptly.ai': {
    _id: '64f8a1b2c3d4e5f6a7b8c9d1',
    name: 'Sarah Jenkins',
    email: 'recruiter@aptly.ai',
    role: 'recruiter',
  },
  'candidate@jobmatch.ai': {
    _id: '64f8a1b2c3d4e5f6a7b8c9d0',
    name: 'Alex Morgan',
    email: 'candidate@aptly.ai',
    role: 'candidate',
  },
  'recruiter@jobmatch.ai': {
    _id: '64f8a1b2c3d4e5f6a7b8c9d1',
    name: 'Sarah Jenkins',
    email: 'recruiter@aptly.ai',
    role: 'recruiter',
  },
};

// Generate JWT (7-day validity: balances blast-radius mitigation against user session retention)
const generateToken = (id, role = 'candidate', email = '') => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is missing.');
  }
  return jwt.sign({ id, role, email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields: name, email, password, and role' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: 'Database is currently offline. Please check MongoDB Atlas credentials in .env to create new accounts.',
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role, user.email),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    // 1. If DB is connected, verify with MongoDB
    if (isDbConnected) {
      try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
          return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role, user.email),
          });
        }
      } catch (dbErr) {
        console.warn('MongoDB query warning:', dbErr.message);
      }
    }

    // 2. Graceful fallback for 1-Click Demo Credentials
    if (DEMO_USERS[email]) {
      const demo = DEMO_USERS[email];
      if (password === 'password123' || !isDbConnected) {
        return res.json({
          _id: demo._id,
          name: demo.name,
          email: demo.email,
          role: demo.role,
          token: generateToken(demo._id, demo.role, demo.email),
        });
      }
    }

    if (!isDbConnected) {
      return res.status(503).json({
        message: 'Database is currently offline. Please check MongoDB Atlas credentials in .env, or use 1-click test credentials.',
      });
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { signup, login };
