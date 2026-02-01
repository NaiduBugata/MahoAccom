// Room management controller for Admin dashboard
// Handles room queries and statistics

const Room = require('../models/Room');
const Participant = require('../models/Participant');

/**
 * Get all rooms with their current status
 */
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    
    return res.status(200).json({
      success: true,
      message: 'Rooms fetched successfully',
      data: rooms
    });
  } catch (error) {
    console.error('Error in getAllRooms:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching rooms',
      error: error.message
    });
  }
};

/**
 * Get rooms statistics (Boys vs Girls, total capacity, occupied)
 */
const getRoomStats = async (req, res) => {
  try {
    const rooms = await Room.find();
    
      // Normalize gender values to singular form used in Room model: 'Boy' / 'Girl'
      const boysRooms = rooms.filter(r => r.gender === 'Boy');
      const girlsRooms = rooms.filter(r => r.gender === 'Girl');
    
    const stats = {
      total: {
        rooms: rooms.length,
        capacity: rooms.reduce((acc, r) => acc + r.totalCapacity, 0),
        occupied: rooms.reduce((acc, r) => acc + r.occupiedCount, 0),
        available: rooms.reduce((acc, r) => acc + r.availableSpots, 0)
      },
      boys: {
        rooms: boysRooms.length,
        capacity: boysRooms.reduce((acc, r) => acc + r.totalCapacity, 0),
        occupied: boysRooms.reduce((acc, r) => acc + r.occupiedCount, 0),
        available: boysRooms.reduce((acc, r) => acc + r.availableSpots, 0)
      },
      girls: {
        rooms: girlsRooms.length,
        capacity: girlsRooms.reduce((acc, r) => acc + r.totalCapacity, 0),
        occupied: girlsRooms.reduce((acc, r) => acc + r.occupiedCount, 0),
        available: girlsRooms.reduce((acc, r) => acc + r.availableSpots, 0)
      }
    };
    
    return res.status(200).json({
      success: true,
      message: 'Room statistics fetched successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error in getRoomStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching room stats',
      error: error.message
    });
  }
};

/**
 * Get participants allocated to a specific room
 */
const getRoomParticipants = async (req, res) => {
  try {
    const { roomNumber } = req.params;
    
    if (!roomNumber) {
      return res.status(400).json({
        success: false,
        message: 'Room number is required'
      });
    }
    
    const room = await Room.findOne({ roomNumber: parseInt(roomNumber) });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    const participants = await Participant.find({ 
      roomNumber: parseInt(roomNumber),
      allocationStatus: 'Allocated'
    }).select('mhid name gender paymentStatus allocationStatus createdAt');
    
    return res.status(200).json({
      success: true,
      message: 'Room participants fetched successfully',
      data: {
        room: room,
        participants: participants,
        count: participants.length
      }
    });
  } catch (error) {
    console.error('Error in getRoomParticipants:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching room participants',
      error: error.message
    });
  }
};

/**
 * Create a new room (Admin only)
 */
const createRoom = async (req, res) => {
  try {
    const { roomNumber, gender, totalCapacity, location } = req.body;
    
    if (!roomNumber || !gender || !totalCapacity) {
      return res.status(400).json({
        success: false,
        message: 'Room number, gender, and total capacity are required'
      });
    }
    // Accept either singular or plural forms from clients and normalize to model values
    const normalizedGender = typeof gender === 'string'
      ? (gender.toLowerCase().startsWith('boy') ? 'Boy' : (gender.toLowerCase().startsWith('girl') ? 'Girl' : null))
      : null;

    if (!normalizedGender) {
      return res.status(400).json({
        success: false,
        message: 'Gender must be either "Boy" or "Girl"'
      });
    }
    
    const existingRoom = await Room.findOne({ roomNumber: parseInt(roomNumber) });
    
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: 'Room with this number already exists'
      });
    }
    
    const newRoom = new Room({
      roomNumber: parseInt(roomNumber),
      gender: normalizedGender,
      totalCapacity: parseInt(totalCapacity),
      occupiedCount: 0,
      location: location || {}
    });
    
    await newRoom.save();
    
    return res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: newRoom
    });
  } catch (error) {
    console.error('Error in createRoom:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating room',
      error: error.message
    });
  }
};

/**
 * Delete a room (Admin only)
 * Can only delete if room is empty
 */
const deleteRoom = async (req, res) => {
  try {
    const { roomNumber } = req.params;
    
    const room = await Room.findOne({ roomNumber: parseInt(roomNumber) });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    if (room.occupiedCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete room with ${room.occupiedCount} occupied spots. Please reallocate participants first.`
      });
    }
    
    await Room.deleteOne({ roomNumber: parseInt(roomNumber) });
    
    return res.status(200).json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteRoom:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting room',
      error: error.message
    });
  }
};

/**
 * Update room capacity (Admin only)
 */
const updateRoomCapacity = async (req, res) => {
  try {
    const { roomNumber } = req.params;
    const { totalCapacity } = req.body;
    
    if (!totalCapacity || totalCapacity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid total capacity is required'
      });
    }
    
    const room = await Room.findOne({ roomNumber: parseInt(roomNumber) });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    if (parseInt(totalCapacity) < room.occupiedCount) {
      return res.status(400).json({
        success: false,
        message: `Cannot reduce capacity below current occupied count (${room.occupiedCount})`
      });
    }
    
    room.totalCapacity = parseInt(totalCapacity);
    await room.save();
    
    return res.status(200).json({
      success: true,
      message: 'Room capacity updated successfully',
      data: room
    });
  } catch (error) {
    console.error('Error in updateRoomCapacity:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating room capacity',
      error: error.message
    });
  }
};

/**
 * Get available rooms by gender (for manual allocation by coordinator)
 * Returns list of rooms with available spots for the specified gender
 */
const getAvailableRoomsByGender = async (req, res) => {
  try {
    const { gender } = req.params;
    
    if (!gender) {
      return res.status(400).json({
        success: false,
        message: 'Valid gender is required'
      });
    }

    const normalized = typeof gender === 'string'
      ? (gender.toLowerCase().startsWith('boy') ? 'Boy' : (gender.toLowerCase().startsWith('girl') ? 'Girl' : null))
      : null;

    if (!normalized) {
      return res.status(400).json({
        success: false,
        message: 'Valid gender (Boy or Girl) is required'
      });
    }

    const availableRooms = await Room.findAllAvailableByGender(normalized);
    
    return res.status(200).json({
      success: true,
      message: `Available rooms for ${gender} fetched successfully`,
      data: availableRooms,
      count: availableRooms.length
    });
  } catch (error) {
    console.error('Error in getAvailableRoomsByGender:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching available rooms',
      error: error.message
    });
  }
};

module.exports = {
  getAllRooms,
  getRoomStats,
  getRoomParticipants,
  getAvailableRoomsByGender,
  createRoom,
  updateRoomCapacity,
  deleteRoom
};
