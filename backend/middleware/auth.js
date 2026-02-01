// Authentication and Authorization Middleware
// STRICT ROLE-BASED ACCESS CONTROL

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'mahotsav-secret-key-change-in-production';

/**
 * Authenticate user from JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication. Please login again.'
      });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please login again.'
    });
  }
};

/**
 * Authorize ADMIN only
 * ADMIN PERMISSIONS:
 * - Add, edit, delete rooms
 * - Manage room capacity
 * - View all room data
 * - Export room data to Excel
 */
const authorizeAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. ADMIN role required.'
    });
  }
  next();
};

/**
 * Authorize COORDINATOR only
 * COORDINATOR PERMISSIONS:
 * - Check MHID
 * - Create participant entry
 * - Update payment status
 * - Manually allocate rooms
 * - View available rooms (read-only)
 * - Export participant data to Excel
 */
const authorizeCoordinator = (req, res, next) => {
  if (!req.user || !req.user.isCoordinator()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. COORDINATOR role required.'
    });
  }
  next();
};

/**
 * Authorize ADMIN or COORDINATOR
 * For endpoints accessible to both roles
 */
const authorizeAdminOrCoordinator = (req, res, next) => {
  if (!req.user || (!req.user.isAdmin() && !req.user.isCoordinator())) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. ADMIN or COORDINATOR role required.'
    });
  }
  next();
};

/**
 * Generate JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = {
  authenticate,
  authorizeAdmin,
  authorizeCoordinator,
  authorizeAdminOrCoordinator,
  generateToken,
  JWT_SECRET
};
