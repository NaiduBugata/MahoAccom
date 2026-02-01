// TODO: Implement API service for Mahotsav check-in system
// Reusable API service for communicating with backend using fetch

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || 'https://mahoaccom.onrender.com/api';
const API_BASE_URL = RAW_BASE.endsWith('/api') ? RAW_BASE : `${RAW_BASE}/api`;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Check if MHID exists in database
 * @param {string} mhid - Mahotsav ID
 * @returns {Promise} - Response with participant data or null
 */
export const checkMHID = async (mhid) => {
  try {
    const response = await fetch(`${API_BASE_URL}/participants/check`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ mhid }),
    });

    const data = await response.json();
    // 404 is expected when participant doesn't exist - not an error
    return data;
  } catch (error) {
    console.error('Error checking MHID:', error);
    throw error;
  }
};

/**
 * Create a new participant
 * @param {Object} participantData - { mhid, name, gender }
 * @returns {Promise} - Response with created participant
 */
export const createParticipant = async (participantData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/participants/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(participantData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating participant:', error);
    throw error;
  }
};

/**
 * Update payment status manually
 * @param {string} mhid - Mahotsav ID
 * @param {string} paymentStatus - "Paid" or "Unpaid"
 * @returns {Promise} - Response with updated participant
 */
export const updatePayment = async (mhid, paymentStatus) => {
  try {
    const response = await fetch(`${API_BASE_URL}/participants/payment`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ mhid, paymentStatus }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
};

/**
 * Allocate room to participant
 * @param {Object} allocationData - Can be just { mhid } or full participant data
 * @returns {Promise} - Response with allocation details
 */
export const allocateRoom = async (allocationData) => {
  try {
    // Support both string (mhid only) and object (full data) formats
    const body = typeof allocationData === 'string' 
      ? { mhid: allocationData }
      : allocationData;

    const response = await fetch(`${API_BASE_URL}/participants/allocate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error allocating room:', error);
    throw error;
  }
};

/**
 * Update participant details
 * @param {string} mhid - Mahotsav ID
 * @param {Object} updates - { name, contactNumber, paymentStatus, gender }
 * @returns {Promise} - Response with updated participant
 */
export const updateParticipant = async (mhid, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/participants/${mhid}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating participant:', error);
    throw error;
  }
};

export default {
  checkMHID,
  createParticipant,
  updatePayment,
  allocateRoom,
  updateParticipant,
};
