const jwt = require('jsonwebtoken');
const User = require('../models/auth');

// Auth middleware: verify JWT and attach user
const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user; // includes role
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Role middleware: restrict to host role only
const requireHost = (req, res, next) => {
  if (req.user.role !== 'host') {
    return res.status(403).json({ message: 'Access denied: Host only' });
  }
  next();
};

module.exports = { auth, requireHost };
