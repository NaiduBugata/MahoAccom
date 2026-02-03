// Excel Export Controller
// ADMIN: Export room data
// COORDINATOR: Export participant and allocation data

const XLSX = require('xlsx');
const Room = require('../models/Room');
const Participant = require('../models/Participant');

/**
 * Export all rooms to Excel (ADMIN only)
 */
const exportRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    
    // Prepare data for Excel
    const data = rooms.map(room => ({
      'Room Number': room.roomNumber,
      'Gender': room.gender,
      'Total Capacity': room.totalCapacity,
      'Occupied': room.occupiedCount,
      'Available': room.totalCapacity - room.occupiedCount,
      'Occupancy %': ((room.occupiedCount / room.totalCapacity) * 100).toFixed(2),
      'Location Address': room.location?.address || '',
      'Latitude': room.location?.latitude || '',
      'Longitude': room.location?.longitude || ''
    }));
    
    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rooms');
    
    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Mahotsav_Rooms_${Date.now()}.xlsx`);
    return res.send(buffer);
  } catch (error) {
    console.error('Error in exportRooms:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while exporting rooms',
      error: error.message
    });
  }
};

/**
 * Export room occupancy details (ADMIN only)
 */
const exportRoomOccupancy = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    
    // Get all allocated participants
    const participants = await Participant.find({ 
      allocationStatus: 'Allocated' 
    }).sort({ roomNumber: 1, name: 1 });
    
    // Prepare data for Excel
    const data = participants.map(p => ({
      'Room Number': p.roomNumber || 'N/A',
      'MHID': p.mhid,
      'Name': p.name,
      'Gender': p.gender,
      'Contact': p.contactNumber,
      'Email': p.email,
      'Payment Status': p.paymentStatus,
      'Allocated By': p.allocatedBy || 'System',
      'Allocated At': p.updatedAt ? new Date(p.updatedAt).toLocaleString() : ''
    }));
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Add participants sheet
    const participantsSheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, participantsSheet, 'Occupancy');
    
    // Add summary sheet
    const summaryData = rooms.map(room => ({
      'Room Number': room.roomNumber,
      'Gender': room.gender,
      'Capacity': room.totalCapacity,
      'Occupied': room.occupiedCount,
      'Available': room.totalCapacity - room.occupiedCount,
      'Full': room.occupiedCount >= room.totalCapacity ? 'YES' : 'NO'
    }));
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Mahotsav_Room_Occupancy_${Date.now()}.xlsx`);
    return res.send(buffer);
  } catch (error) {
    console.error('Error in exportRoomOccupancy:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while exporting occupancy',
      error: error.message
    });
  }
};

/**
 * Export all participants (COORDINATOR)
 */
const exportParticipants = async (req, res) => {
  try {
    // Optional gender filter: Boy | Girl | Both
    const gender = (req.query.gender || '').trim();
    const filter = (gender === 'Boy' || gender === 'Girl') ? { gender } : {};
    const participants = await Participant.find(filter).sort({ createdAt: -1 });
    
    // Prepare data for Excel
    const data = participants.map(p => ({
      'MHID': p.mhid,
      'Name': p.name,
      'Gender': p.gender,
      'Contact Number': p.contactNumber,
      'Email': p.email,
      'Payment Status': p.paymentStatus,
      'Allocation Status': p.allocationStatus,
      'Room Number': p.roomNumber || 'Not Allocated',
      'Allocated By': p.allocatedBy || 'N/A',
      'Registered At': p.createdAt ? new Date(p.createdAt).toLocaleString() : ''
    }));
    
    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');
    
    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Send file
    const suffix = (gender === 'Boy' || gender === 'Girl') ? gender : 'All';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Mahotsav_Participants_${suffix}_${Date.now()}.xlsx`);
    return res.send(buffer);
  } catch (error) {
    console.error('Error in exportParticipants:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while exporting participants',
      error: error.message
    });
  }
};

/**
 * Export paid participants (COORDINATOR)
 */
const exportPaidParticipants = async (req, res) => {
  try {
    const participants = await Participant.find({ paymentStatus: 'Paid' }).sort({ name: 1 });
    
    // Prepare data for Excel
    const data = participants.map(p => ({
      'MHID': p.mhid,
      'Name': p.name,
      'Gender': p.gender,
      'Contact Number': p.contactNumber,
      'Email': p.email,
      'Allocation Status': p.allocationStatus,
      'Room Number': p.roomNumber || 'Not Allocated',
      'Allocated By': p.allocatedBy || 'N/A'
    }));
    
    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Paid Participants');
    
    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Mahotsav_Paid_Participants_${Date.now()}.xlsx`);
    return res.send(buffer);
  } catch (error) {
    console.error('Error in exportPaidParticipants:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while exporting paid participants',
      error: error.message
    });
  }
};

/**
 * Export unpaid participants (COORDINATOR)
 */
const exportUnpaidParticipants = async (req, res) => {
  try {
    const participants = await Participant.find({ paymentStatus: 'Unpaid' }).sort({ name: 1 });
    
    // Prepare data for Excel
    const data = participants.map(p => ({
      'MHID': p.mhid,
      'Name': p.name,
      'Gender': p.gender,
      'Contact Number': p.contactNumber,
      'Email': p.email,
      'Registered At': p.createdAt ? new Date(p.createdAt).toLocaleString() : ''
    }));
    
    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Unpaid Participants');
    
    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Mahotsav_Unpaid_Participants_${Date.now()}.xlsx`);
    return res.send(buffer);
  } catch (error) {
    console.error('Error in exportUnpaidParticipants:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while exporting unpaid participants',
      error: error.message
    });
  }
};

/**
 * Export allocation list (COORDINATOR)
 */
const exportAllocations = async (req, res) => {
  try {
    const participants = await Participant.find({ 
      allocationStatus: 'Allocated' 
    }).sort({ roomNumber: 1, name: 1 });
    
    // Prepare data for Excel
    const data = participants.map(p => ({
      'Room Number': p.roomNumber,
      'MHID': p.mhid,
      'Name': p.name,
      'Gender': p.gender,
      'Contact Number': p.contactNumber,
      'Email': p.email,
      'Payment Status': p.paymentStatus,
      'Allocated By': p.allocatedBy || 'System',
      'Allocated At': p.updatedAt ? new Date(p.updatedAt).toLocaleString() : ''
    }));
    
    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Allocations');
    
    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Mahotsav_Allocations_${Date.now()}.xlsx`);
    return res.send(buffer);
  } catch (error) {
    console.error('Error in exportAllocations:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while exporting allocations',
      error: error.message
    });
  }
};

module.exports = {
  exportRooms,
  exportRoomOccupancy,
  exportParticipants,
  exportPaidParticipants,
  exportUnpaidParticipants,
  exportAllocations
};
