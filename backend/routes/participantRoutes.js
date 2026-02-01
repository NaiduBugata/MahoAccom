// Express routes for Mahotsav participant management
// Maps HTTP endpoints to controller functions
// ROLE-BASED ACCESS CONTROL: COORDINATOR permissions

const express = require('express');
const router = express.Router();
const {
  checkMHID,
  createParticipant,
  updatePaymentStatus,
  allocateRoom,
  updateParticipant
} = require('../controllers/participantController');
const { authenticate, authorizeCoordinator } = require('../middleware/auth');

/**
 * GET /api/participants/check/:mhid
 * Check if participant with MHID exists
 * Params: { mhid: string }
 * Access: Public
 */
router.get('/check/:mhid', checkMHID);

/**
 * POST /api/participants/check
 * Check if participant with MHID exists (POST version for compatibility)
 * Body: { mhid: string }
 * Access: Public
 */
router.post('/check', checkMHID);

/**
 * POST /api/participants/create
 * Create a new participant
 * Body: { mhid: string, name: string, gender: string, contactNumber: string, email: string }
 * Access: Public
 */
router.post('/create', createParticipant);

/**
 * PUT /api/participants/payment
 * Update payment status manually (after verifying payment proof)
 * Body: { mhid: string, paymentStatus: "Paid" | "Unpaid" }
 * Access: Public
 */
router.put('/payment', updatePaymentStatus);

/**
 * POST /api/participants/allocate
 * Manually allocate room to participant (only if paid)
 * Body: { mhid: string, name, college, gender, mobile, email, paymentStatus, amountPaid }
 * Access: Public
 */
router.post('/allocate', allocateRoom);

/**
 * PUT /api/participants/:mhid
 * Update participant details (name, contact, payment status, gender)
 * Params: { mhid: string }
 * Body: { name?: string, contactNumber?: string, paymentStatus?: "Paid" | "Unpaid", gender?: "Boy" | "Girl" }
 * Access: Public
 */
router.put('/:mhid', updateParticipant);

module.exports = router;
