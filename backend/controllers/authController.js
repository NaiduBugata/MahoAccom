// Authentication Controller
// Handle login for ADMIN and COORDINATOR roles

const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

/**
 * Login - ADMIN or COORDINATOR
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    // Find user
    const user = await User.findOne({ username: username.toLowerCase().trim() });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Contact administrator.'
      });
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = generateToken(user._id, user.role);
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        id: req.user._id,
        username: req.user.username,
        name: req.user.name,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Create a new user (ADMIN only - for setup)
 * This should be protected and used only for initial setup
 */
const createUser = async (req, res) => {
  try {
    const { username, password, role, name } = req.body;
    
    // Validate input
    if (!username || !password || !role || !name) {
      return res.status(400).json({
        success: false,
        message: 'Username, password, role, and name are required'
      });
    }
    
    // Validate role
    if (!['ADMIN', 'COORDINATOR'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either ADMIN or COORDINATOR'
      });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ username: username.toLowerCase().trim() });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }
    
    // Create user
    const newUser = new User({
      username: username.toLowerCase().trim(),
      password,
      role,
      name: name.trim()
    });
    
    await newUser.save();
    
    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: newUser._id,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Error in createUser:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error while creating user',
      error: error.message
    });
  }
};

module.exports = {
  login,
  getProfile,
  createUser
};
