// Authentication Routes
const express = require('express');
const router = express.Router();
const { login, getProfile, createUser } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   POST /api/auth/login
 * @desc    Login for ADMIN or COORDINATOR
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private (requires authentication)
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   POST /api/auth/register
 * @desc    Create new user (for initial setup only)
 * @access  Public (should be protected in production)
 */
router.post('/register', createUser);

module.exports = router;
