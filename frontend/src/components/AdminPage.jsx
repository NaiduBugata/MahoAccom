// Admin Page - Room Management Dashboard
import { useState, useEffect, useMemo } from 'react';
import { getAllRooms, getRoomStats, getRoomParticipants, createRoom, deleteRoom } from '../services/roomApi';
import { updateParticipant, exportParticipantsExcel } from '../services/api';
import './AdminPage.css';

const AdminPage = ({ onBackToCheckIn }) => {
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all'); // all, Boy, Girl
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomParticipants, setRoomParticipants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [exportGender, setExportGender] = useState('Both');
  const [exporting, setExporting] = useState(false);
  
  // Edit participant state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    contactNumber: '',
    paymentStatus: 'Unpaid',
    gender: 'Boy'
  });
  
  // New room form state
  const [newRoomData, setNewRoomData] = useState({
    block: '',
    floor: '',
    roomNumber: '',
    totalCapacity: 50,
    gender: 'Boy'
  });

  useEffect(() => {
    fetchData(false);
    // Auto-refresh every 30 seconds without blocking the UI
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async (silent = false) => {
    try {
      if (silent) setRefreshing(true); else setLoading(true);
      const [roomsResponse, statsResponse] = await Promise.all([
        getAllRooms(),
        getRoomStats()
      ]);

      if (roomsResponse.success) {
        setRooms(roomsResponse.data);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      setError('');
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      if (silent) setRefreshing(false); else setLoading(false);
    }
  };

  const handleViewParticipants = async (room) => {
    try {
      setSelectedRoom(room);
      setShowModal(true);
      const response = await getRoomParticipants(room.roomNumber);
      
      if (response.success) {
        setRoomParticipants(response.data.participants);
      }
    } catch (err) {
      console.error('Error fetching room participants:', err);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRoom(null);
    setRoomParticipants([]);
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await createRoom(newRoomData);
      
      if (response.success) {
        setError('');
        alert('Room added successfully!');
        setShowAddRoom(false);
        setNewRoomData({
          block: '',
          floor: '',
          roomNumber: '',
          totalCapacity: 50,
          gender: 'Boy'
        });
        fetchData();
      } else {
        setError(response.message || 'Failed to add room');
      }
    } catch (err) {
      setError('Failed to add room. Please try again.');
      console.error('Error adding room:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomNumber) => {
    if (!confirm(`Are you sure you want to delete Room ${roomNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await deleteRoom(roomNumber);
      
      if (response.success) {
        alert('Room deleted successfully!');
        fetchData();
      } else {
        alert(response.message || 'Failed to delete room');
      }
    } catch (err) {
      alert('Failed to delete room. Please try again.');
      console.error('Error deleting room:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportParticipants = async () => {
    try {
      setExporting(true);
      await exportParticipantsExcel(exportGender);
    } catch (err) {
      alert('Export failed. Please try again.');
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleEditParticipant = (participant) => {
    setEditingParticipant(participant);
    setEditFormData({
      name: participant.name,
      contactNumber: participant.contactNumber || '',
      paymentStatus: participant.paymentStatus,
      gender: participant.gender
    });
    setShowEditModal(true);
  };

  const handleSaveParticipant = async () => {
    try {
      setLoading(true);
      const response = await updateParticipant(editingParticipant.mhid, editFormData);
      
      if (response.success) {
        alert('Participant updated successfully!');
        setShowEditModal(false);
        setEditingParticipant(null);
        
        // Refresh participant list
        if (selectedRoom) {
          const participantsResponse = await getRoomParticipants(selectedRoom.roomNumber);
          if (participantsResponse.success) {
            setRoomParticipants(participantsResponse.data.participants);
          }
        }
      } else {
        alert(response.message || 'Failed to update participant');
      }
    } catch (err) {
      alert('Failed to update participant. Please try again.');
      console.error('Error updating participant:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingParticipant(null);
    setEditFormData({
      name: '',
      contactNumber: '',
      paymentStatus: 'Unpaid',
      gender: 'Boy'
    });
  };

  const filteredRooms = useMemo(() => {
    if (filter === 'all') return rooms;
    return rooms.filter(room => room.gender === filter);
  }, [rooms, filter]);

  const getCapacityPercentage = (room) => {
    return (room.occupiedCount / room.totalCapacity) * 100;
  };

  const getCapacityClass = (percentage) => {
    if (percentage >= 100) return 'full';
    if (percentage >= 80) return 'high';
    return '';
  };

  if (loading && !stats) {
    return (
      <div className="admin-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <h1>🏢 Room Management Dashboard</h1>
        <p>Monitor and manage room allocations for Mahotsav event</p>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Rooms Section - Moved to Top */}
      <div className="rooms-section">
        <div className="section-header">
          <h2>Rooms</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {refreshing && (
              <span style={{ fontSize: '0.9rem', color: '#718096' }}>Refreshing…</span>
            )}
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-btn boy ${filter === 'Boy' ? 'active' : ''}`}
                onClick={() => setFilter('Boy')}
              >
                Boy
              </button>
              <button
                className={`filter-btn girl ${filter === 'Girl' ? 'active' : ''}`}
                onClick={() => setFilter('Girl')}
              >
                Girl
              </button>
            </div>
            <button
              className="btn-add-room"
              onClick={() => setShowAddRoom(true)}
              style={{
                padding: '0.5rem 1rem',
                background: '#48bb78',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              ➕ Add New Room
            </button>
            {/* Export Participants */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                value={exportGender}
                onChange={(e) => setExportGender(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              >
                <option value="Both">Both</option>
                <option value="Boy">Boys</option>
                <option value="Girl">Girls</option>
              </select>
              <button
                onClick={handleExportParticipants}
                disabled={exporting}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#3182ce',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: exporting ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  opacity: exporting ? 0.7 : 1
                }}
              >
                {exporting ? 'Exporting...' : 'Export Participants (Excel)'}
              </button>
            </div>
          </div>
        </div>

        {filteredRooms.length === 0 ? (
          <div className="empty-state">
            <h3>No rooms found</h3>
            <p>No rooms match the selected filter.</p>
          </div>
        ) : (
          <div className="rooms-grid">
            {filteredRooms.map((room) => {
              const percentage = getCapacityPercentage(room);
              return (
                <div
                  key={room._id}
                  className={`room-card ${room.gender.toLowerCase()} ${room.isFull ? 'full' : ''}`}
                >
                  <div className="room-header">
                    <div className="room-number">Room {room.roomNumber}</div>
                    <span className={`room-gender ${room.gender.toLowerCase()}`}>
                      {room.gender}
                    </span>
                  </div>

                  <div className="capacity-bar">
                    <div
                      className={`capacity-fill ${getCapacityClass(percentage)}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  <div className="capacity-text">
                    {room.occupiedCount} / {room.totalCapacity} occupied
                    <br />
                    <small>{room.availableSpots} spots available</small>
                  </div>

                  <div className="room-actions">
                    <button
                      className="room-btn view"
                      onClick={() => handleViewParticipants(room)}
                    >
                      View Participants
                    </button>
                    {room.occupiedCount === 0 && (
                      <button
                        className="room-btn delete"
                        onClick={() => handleDeleteRoom(room.roomNumber)}
                        style={{ background: '#f56565' }}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Room Modal */}
      {showAddRoom && (
        <div className="modal-overlay" onClick={() => setShowAddRoom(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Add New Room</h2>
              <button className="close-btn" onClick={() => setShowAddRoom(false)}>×</button>
            </div>

            <form onSubmit={handleAddRoom}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '700', fontSize: '1rem', color: '#2d3748' }}>
                    🏢 Block Name *
                  </label>
                  <select
                    value={newRoomData.block}
                    onChange={(e) => setNewRoomData({ ...newRoomData, block: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                      transition: 'all 0.3s ease',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => e.target.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.5)'}
                    onBlur={(e) => e.target.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.3)'}
                  >
                    <option value="">Select Block</option>
                    <option value="A Block">A Block</option>
                    <option value="H Block">H Block</option>
                    <option value="N Block">N Block</option>
                    <option value="U Block">U Block</option>
                    <option value="P Block">P Block</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '700', fontSize: '1rem', color: '#2d3748' }}>
                    📶 Floor Number *
                  </label>
                  <input
                    type="text"
                    value={newRoomData.floor}
                    onChange={(e) => setNewRoomData({ ...newRoomData, floor: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.5)'}
                    onBlur={(e) => e.target.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.3)'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '700', fontSize: '1rem', color: '#2d3748' }}>
                    🚪 Room Number *
                  </label>
                  <input
                    type="text"
                    value={newRoomData.roomNumber}
                    onChange={(e) => setNewRoomData({ ...newRoomData, roomNumber: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.5)'}
                    onBlur={(e) => e.target.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.3)'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '700', fontSize: '1rem', color: '#2d3748' }}>
                    👥 Total Capacity *
                  </label>
                  <input
                    type="number"
                    value={newRoomData.totalCapacity}
                    onChange={(e) => setNewRoomData({ ...newRoomData, totalCapacity: e.target.value })}
                    required
                    min="1"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.5)'}
                    onBlur={(e) => e.target.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.3)'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '700', fontSize: '1rem', color: '#2d3748' }}>
                    ⚧ Select Gender *
                  </label>
                  <select
                    value={newRoomData.gender}
                    onChange={(e) => setNewRoomData({ ...newRoomData, gender: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.5)'}
                    onBlur={(e) => e.target.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.3)'}
                  >
                    <option value="Boy">Boy</option>
                    <option value="Girl">Girl</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: '#48bb78',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      opacity: loading ? 0.6 : 1
                    }}
                  >
                    {loading ? 'Adding...' : 'Add Room'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddRoom(false)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: '#718096',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statistics Overview - Moved to Bottom */}
      {stats && (
        <div style={{ marginTop: '2rem' }}>
          <div className="section-header" style={{ marginBottom: '1rem' }}>
            <h2>📊 Statistics Overview</h2>
          </div>
          <div className="stats-grid-3x2">
            <div className="stat-card">
              <div className="stat-label">Total Participants</div>
              <div className="stat-value">{stats.total.occupied}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Rooms</div>
              <div className="stat-value">{stats.total.rooms}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Capacity</div>
              <div className="stat-value">{stats.total.capacity}</div>
            </div>
            <div className="stat-card boy">
              <div className="stat-label">Boys Rooms</div>
              <div className="stat-value">{stats.boys.rooms}</div>
            </div>
            <div className="stat-card girl">
              <div className="stat-label">Girls Rooms</div>
              <div className="stat-value">{stats.girls.rooms}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Available Spots</div>
              <div className="stat-value">{stats.total.available}</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Room Participants */}
      {showModal && selectedRoom && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Room {selectedRoom.roomNumber} - Participants</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            <div>
              <p>
                <strong>Gender:</strong> {selectedRoom.gender} | 
                <strong> Capacity:</strong> {selectedRoom.totalCapacity} | 
                <strong> Occupied:</strong> {selectedRoom.occupiedCount}
              </p>
            </div>

            <div className="participants-list">
              {roomParticipants.length === 0 ? (
                <div className="empty-state">
                  <p>No participants allocated to this room yet.</p>
                </div>
              ) : (
                roomParticipants.map((participant) => (
                  <div key={participant._id} className="participant-item">
                    <div className="participant-info">
                      <strong>{participant.name}</strong>
                      <small>MHID: {participant.mhid}</small>
                      <small>Contact: {participant.contactNumber || 'N/A'}</small>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className="badge paid">{participant.paymentStatus}</span>
                      <button 
                        className="btn-edit" 
                        onClick={() => handleEditParticipant(participant)}
                        title="Edit participant details"
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Participant Modal */}
      {showEditModal && editingParticipant && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Participant - {editingParticipant.mhid}</h2>
              <button className="close-btn" onClick={handleCancelEdit}>×</button>
            </div>

            <div className="edit-form">
              <div className="form-group">
                <label htmlFor="edit-name">Name</label>
                <input
                  id="edit-name"
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Enter participant name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-contact">Contact Number</label>
                <input
                  id="edit-contact"
                  type="tel"
                  value={editFormData.contactNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, contactNumber: e.target.value })}
                  placeholder="Enter 10-digit contact number"
                  maxLength="10"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-gender">Gender</label>
                <select
                  id="edit-gender"
                  value={editFormData.gender}
                  onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                >
                  <option value="Boy">Boy</option>
                  <option value="Girl">Girl</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-payment">Payment Status</label>
                <select
                  id="edit-payment"
                  value={editFormData.paymentStatus}
                  onChange={(e) => setEditFormData({ ...editFormData, paymentStatus: e.target.value })}
                >
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>

              <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button 
                  className="btn-primary" 
                  onClick={handleSaveParticipant}
                  disabled={loading || !editFormData.name.trim()}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
