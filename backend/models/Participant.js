// TODO: Implement Mahotsav participant allocation logic
// MongoDB Participant Model for Mahotsav check-in and allocation system

const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  // Unique Mahotsav ID - Primary identifier for each participant
  mhid: {
    type: String,
    required: [true, 'MHID is required'],
    unique: true,
    trim: true,
    uppercase: true
    // index removed - defined below to avoid duplication
  },
  
  // Participant name
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  
  // Gender for room allocation - Boy or Girl only
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: {
      values: ['Boy', 'Girl'],
      message: '{VALUE} is not a valid gender. Use "Boy" or "Girl"'
    }
  },
  
  // Contact number
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true
  },
  
  // Email address
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  
  // Payment status - manually updated by admin/volunteer
  paymentStatus: {
    type: String,
    enum: {
      values: ['Paid', 'Unpaid'],
      message: '{VALUE} is not a valid payment status'
    },
    default: 'Unpaid'
  },
  
  // Allocation status
  allocationStatus: {
    type: String,
    enum: {
      values: ['Allocated', 'Not Allocated'],
      message: '{VALUE} is not a valid allocation status'
    },
    default: 'Not Allocated'
  },
  
  // Room number - assigned during allocation (nullable)
  roomNumber: {
    type: Number,
    default: null
  },
  
  // Allocated by which coordinator
  allocatedBy: {
    type: String,
    default: null,
    trim: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Index for faster queries (mhid already has unique index, no need to duplicate)
participantSchema.index({ allocationStatus: 1 });
participantSchema.index({ paymentStatus: 1 });

// Pre-save hook to validate allocation logic
participantSchema.pre('save', function(next) {
  // If allocated, must have a room number
  if (this.allocationStatus === 'Allocated' && !this.roomNumber) {
    return next(new Error('Allocated participant must have a room number'));
  }
  
  // If not allocated, should not have a room number
  if (this.allocationStatus === 'Not Allocated' && this.roomNumber) {
    this.roomNumber = null;
  }
  
  next();
});

// Instance method to check if participant can be allocated
participantSchema.methods.canAllocate = function() {
  return this.paymentStatus === 'Paid' && this.allocationStatus === 'Not Allocated';
};

// Instance method to allocate room
participantSchema.methods.allocateRoom = function(roomNumber) {
  this.roomNumber = roomNumber;
  this.allocationStatus = 'Allocated';
};

const Participant = mongoose.model('Participant', participantSchema);

module.exports = Participant;
