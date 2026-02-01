// TODO: Implement room capacity management for Mahotsav events
// MongoDB Room Model for managing room allocation

const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  // Room number - unique identifier for each room
  roomNumber: {
    type: Number,
    required: [true, 'Room number is required'],
    unique: true,
    min: 1
  },
  
  // Gender restriction for this room - Boy or Girl only
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: {
      values: ['Boy', 'Girl'],
      message: '{VALUE} is not a valid gender. Use "Boy" or "Girl"'
    }
  },
  
  // Maximum capacity for this room
  totalCapacity: {
    type: Number,
    required: [true, 'Total capacity is required'],
    min: 1,
    default: 50
  },
  
  // Current number of occupied spots
  occupiedCount: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: function(value) {
        return value <= this.totalCapacity;
      },
      message: 'Occupied count cannot exceed total capacity'
    }
  },
  
  // GPS Location (optional)
  location: {
    latitude: {
      type: Number,
      default: null
    },
    longitude: {
      type: Number,
      default: null
    },
    address: {
      type: String,
      default: ''
    }
  }
  ,
  // Block and floor metadata (optional, used for display)
  block: {
    type: String,
    default: ''
  },
  floor: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Compound index for faster gender-based queries
roomSchema.index({ gender: 1, occupiedCount: 1 });

// Virtual property to check if room is full
roomSchema.virtual('isFull').get(function() {
  return this.occupiedCount >= this.totalCapacity;
});

// Virtual property to get available spots
roomSchema.virtual('availableSpots').get(function() {
  return this.totalCapacity - this.occupiedCount;
});

// Instance method to check availability
roomSchema.methods.hasCapacity = function() {
  return this.occupiedCount < this.totalCapacity;
};

// Instance method to increment occupied count
roomSchema.methods.incrementOccupied = function() {
  if (this.hasCapacity()) {
    this.occupiedCount += 1;
    return true;
  }
  return false;
};

// Static method to find available room by gender
roomSchema.statics.findAvailableByGender = async function(gender) {
  return this.findOne({
    gender: gender,
    $expr: { $lt: ['$occupiedCount', '$totalCapacity'] }
  }).sort({ roomNumber: 1 });
};

// Static method to find ALL available rooms by gender (for manual selection)
roomSchema.statics.findAllAvailableByGender = async function(gender) {
  return this.find({
    gender: gender,
    $expr: { $lt: ['$occupiedCount', '$totalCapacity'] }
  }).sort({ roomNumber: 1 });
};

// Ensure virtuals are included in JSON
roomSchema.set('toJSON', { virtuals: true });
roomSchema.set('toObject', { virtuals: true });

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
