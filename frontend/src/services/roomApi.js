// API service for room management

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
 * Get all rooms with their current status
 */
export const getAllRooms = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

/**
 * Get room statistics
 */
export const getRoomStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching room stats:', error);
    throw error;
  }
};

/**
 * Get participants in a specific room
 */
export const getRoomParticipants = async (roomNumber) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomNumber}/participants`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching room participants:', error);
    throw error;
  }
};

/**
 * Get available rooms by gender (for manual allocation)
 */
export const getAvailableRoomsByGender = async (gender) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/available/${gender}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    throw error;
  }
};

/**
 * Create a new room
 */
export const createRoom = async (roomData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(roomData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

/**
 * Delete a room
 */
export const deleteRoom = async (roomNumber) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomNumber}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
};

/**
 * Update room capacity
 */
export const updateRoomCapacity = async (roomNumber, totalCapacity) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomNumber}/capacity`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ totalCapacity }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating room capacity:', error);
    throw error;
  }
};

export default {
  getAllRooms,
  getRoomStats,
  getRoomParticipants,
  getAvailableRoomsByGender,
  createRoom,
  updateRoomCapacity,
  deleteRoom
};
