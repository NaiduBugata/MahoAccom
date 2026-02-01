// Express routes for room management (Admin features)
// ROLE-BASED ACCESS CONTROL:
// - ADMIN can: create, update, delete rooms
// - COORDINATOR can: view rooms (read-only) for manual allocation

const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  getRoomStats,
  getRoomParticipants,
  getAvailableRoomsByGender,
  createRoom,
  updateRoomCapacity,
  deleteRoom
} = require('../controllers/roomController');
const { authenticate, authorizeAdmin, authorizeAdminOrCoordinator } = require('../middleware/auth');

/**
 * GET /api/rooms
 * Get all rooms with their current status
 * Access: Public
 */
router.get('/', getAllRooms);

/**
 * GET /api/rooms/stats
 * Get room statistics (Boys vs Girls, total capacity, occupied)
 * Access: Public
 */
router.get('/stats', getRoomStats);

/**
 * GET /api/rooms/available/:gender
 * Get available rooms by gender (for manual allocation)
 * Access: COORDINATOR (for manual room selection)
 */
router.get('/available/:gender', authenticate, authorizeAdminOrCoordinator, getAvailableRoomsByGender);

/**
 * GET /api/rooms/:roomNumber/participants
 * Get all participants allocated to a specific room
 * Access: Public
 */
router.get('/:roomNumber/participants', getRoomParticipants);

/**
 * POST /api/rooms
 * Create a new room
 * Body: { roomNumber: number, gender: string, totalCapacity: number, location: object }
 * Access: Public
 */
router.post('/', createRoom);

/**
 * PUT /api/rooms/:roomNumber/capacity
 * Update room capacity
 * Body: { totalCapacity: number }
 * Access: Public
 */
router.put('/:roomNumber/capacity', updateRoomCapacity);

/**
 * DELETE /api/rooms/:roomNumber
 * Delete a room (only if empty)
 * Access: Public
 */
router.delete('/:roomNumber', deleteRoom);

module.exports = router;
