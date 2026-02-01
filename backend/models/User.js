// User Model for ADMIN and COORDINATOR roles
// STRICT ROLE-BASED ACCESS CONTROL

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  
  role: {
    type: String,
    enum: {
      values: ['ADMIN', 'COORDINATOR'],
      message: '{VALUE} is not a valid role. Use "ADMIN" or "COORDINATOR"'
    },
    required: [true, 'Role is required']
  },
  
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user is ADMIN
userSchema.methods.isAdmin = function() {
  return this.role === 'ADMIN';
};

// Method to check if user is COORDINATOR
userSchema.methods.isCoordinator = function() {
  return this.role === 'COORDINATOR';
};

const User = mongoose.model('User', userSchema);

module.exports = User;
