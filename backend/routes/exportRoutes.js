// Export Routes
// ADMIN: Export room data and occupancy
// COORDINATOR: Export participant and allocation data

const express = require('express');
const router = express.Router();
const {
  exportRooms,
  exportRoomOccupancy,
  exportParticipants,
  exportPaidParticipants,
  exportUnpaidParticipants,
  exportAllocations
} = require('../controllers/exportController');
const { authenticate, authorizeAdmin, authorizeCoordinator } = require('../middleware/auth');

/**
 * @route   GET /api/export/rooms
 * @desc    Export all rooms to Excel (ADMIN only)
 * @access  Private (ADMIN)
 */
router.get('/rooms', authenticate, authorizeAdmin, exportRooms);

/**
 * @route   GET /api/export/room-occupancy
 * @desc    Export room occupancy details to Excel (ADMIN only)
 * @access  Private (ADMIN)
 */
router.get('/room-occupancy', authenticate, authorizeAdmin, exportRoomOccupancy);

/**
 * @route   GET /api/export/participants
 * @desc    Export all participants to Excel (COORDINATOR)
 * @access  Private (COORDINATOR)
 */
router.get('/participants', authenticate, authorizeCoordinator, exportParticipants);

/**
 * @route   GET /api/export/paid
 * @desc    Export paid participants to Excel (COORDINATOR)
 * @access  Private (COORDINATOR)
 */
router.get('/paid', authenticate, authorizeCoordinator, exportPaidParticipants);

/**
 * @route   GET /api/export/unpaid
 * @desc    Export unpaid participants to Excel (COORDINATOR)
 * @access  Private (COORDINATOR)
 */
router.get('/unpaid', authenticate, authorizeCoordinator, exportUnpaidParticipants);

/**
 * @route   GET /api/export/allocations
 * @desc    Export allocation list to Excel (COORDINATOR)
 * @access  Private (COORDINATOR)
 */
router.get('/allocations', authenticate, authorizeCoordinator, exportAllocations);

module.exports = router;
