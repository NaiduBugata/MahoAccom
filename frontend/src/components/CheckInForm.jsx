// TODO: Implement Mahotsav participant allocation logic
// React Check-in Form with conditional UI logic
// DOMAIN RULES: MHID is NOT generated - only CHECK and STORE

import { useState, useEffect } from 'react';
import { checkMHID, createParticipant, updatePayment, allocateRoom, searchExternalMHID } from '../services/api';
import { getAvailableRoomsByGender } from '../services/roomApi';
import './CheckInForm.css';

const CheckInForm = ({ onNavigateToAdmin }) => {
  // Form state
  const [mhid, setMhid] = useState('');
  const [luneenerId, setLuneenerId] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Boy');
  const [contactNumber, setContactNumber] = useState('');
  
  // Participant state
  const [participant, setParticipant] = useState(null);
  const [isExisting, setIsExisting] = useState(false);
  
  // Room selection state
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('');
  const [showRoomSelection, setShowRoomSelection] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const showMessage = (text, type) => {
    setMessage({ text, type });
  };

  /**
   * Search for participant by luncheon ID in external API
   * If found, auto-fill form fields
   */
  const handleSearchLuneenerId = async () => {
    if (!luneenerId.trim()) {
      showMessage('Please enter a luncheon ID', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await searchExternalMHID(luneenerId);
      
      if (response.success && response.data) {
        // Auto-fill the form with fetched data
        const externalData = response.data;
        
        // Extract name, gender, and contact if available
        if (externalData.name) {
          setName(externalData.name);
        }
        
        if (externalData.gender) {
          setGender(externalData.gender === 'F' || externalData.gender === 'Female' || externalData.gender === 'Girl' ? 'Girl' : 'Boy');
        }
        
        if (externalData.contactNumber || externalData.phone) {
          const phoneNumber = (externalData.contactNumber || externalData.phone).replace(/\D/g, '').slice(-10);
          setContactNumber(phoneNumber);
        }
        
        // Set the luncheon ID as the MHID if not already provided
        if (!mhid && externalData.id) {
          const idWithoutPrefix = externalData.id.replace(/MH26/, '');
          setMhid(idWithoutPrefix);
        }
        
        showMessage('✓ Data found and auto-filled! Please verify and proceed.', 'success');
      } else {
        showMessage('⚠️ Luncheon ID not found. Please enter details manually.', 'info');
      }
    } catch (error) {
      console.error('Error searching luncheon ID:', error);
      showMessage('Error searching database. Please enter details manually.', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if MHID exists and fetch participant data
   * DOMAIN RULE: Re-checking the same MHID must always return stored data
   */
  const handleCheckMHID = async () => {
    if (!mhid.trim() || mhid.length !== 6) {
      showMessage('Please enter 6 digits for MHID', 'error');
      return;
    }

    const fullMHID = 'MH26' + mhid;
    setLoading(true);
    try {
      const response = await checkMHID(fullMHID);
      
      if (response.success && response.data) {
        // MHID exists - show stored data
        setParticipant(response.data);
        setIsExisting(true);
        setName(response.data.name);
        setGender(response.data.gender);
        setContactNumber(response.data.contactNumber || '');
        showMessage('Participant found! Data loaded.', 'success');
      } else {
        // MHID doesn't exist
        setParticipant(null);
        setIsExisting(false);
        showMessage('MHID not found. You can create a new entry.', 'info');
      }
    } catch (error) {
      showMessage('Error checking MHID. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create new participant
   * DOMAIN RULE: If MHID does not exist → create with paymentStatus = "Unpaid" and no room
   */
  const handleCreateParticipant = async (e) => {
    e.preventDefault();
    
    console.log('Create Participant button clicked!');
    console.log('Form data:', { mhid, name, gender, contactNumber });
    
    if (!mhid.trim() || mhid.length !== 6 || !name.trim() || !gender || !contactNumber.trim()) {
      showMessage('Please fill all fields (MHID must be 6 digits)', 'error');
      return;
    }

    // Validate gender
    if (!['Boy', 'Girl'].includes(gender)) {
      showMessage('Gender must be either Boy or Girl', 'error');
      return;
    }

    // Sanitize inputs to prevent XSS
    const sanitize = (str) => str.replace(/<[^>]*>/g, '').trim();
    const fullMHID = 'MH26' + mhid;
    const sanitizedData = {
      mhid: fullMHID,
      name: sanitize(name),
      gender,
      contactNumber: sanitize(contactNumber)
    };

    // Validate contact number (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(sanitizedData.contactNumber)) {
      showMessage('Contact number must be exactly 10 digits', 'error');
      return;
    }

    setLoading(true);
    try {
      console.log('Calling createParticipant API...');
      const response = await createParticipant(sanitizedData);
      console.log('API Response:', response);
      
      if (response.success) {
        setParticipant(response.data);
        setIsExisting(true);
        showMessage(
          response.isExisting 
            ? 'Participant already exists!' 
            : 'Participant created successfully!', 
          'success'
        );
      } else {
        showMessage(response.message || 'Failed to create participant', 'error');
      }
    } catch (error) {
      console.error('Error creating participant:', error);
      showMessage('Error creating participant. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark payment as Paid
   * DOMAIN RULE: NO payment gateway - manual verification by admin/volunteer
   */
  const handleMarkPaid = async () => {
    if (!participant) {
      showMessage('No participant selected', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await updatePayment(participant.mhid, 'Paid');
      
      if (response.success) {
        setParticipant(response.data);
        showMessage('Payment verified and marked as Paid!', 'success');
      } else {
        showMessage(response.message || 'Failed to update payment', 'error');
      }
    } catch (error) {
      showMessage('Error updating payment. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load available rooms for manual selection
   */
  const handleLoadAvailableRooms = async () => {
    if (!participant) {
      showMessage('No participant selected', 'error');
      return;
    }

    setLoading(true);
    try {
      console.log('Loading available rooms for gender:', participant.gender);
      const response = await getAvailableRoomsByGender(participant.gender);
      console.log('Available rooms response:', response);
      
      if (response.success) {
        setAvailableRooms(response.data);
        setShowRoomSelection(true);
        if (response.data.length === 0) {
          showMessage(`No available rooms for ${participant.gender}. All rooms are full.`, 'error');
        } else {
          showMessage(`Found ${response.data.length} available rooms for ${participant.gender}`, 'success');
        }
      } else {
        showMessage(response.message || 'Failed to load available rooms', 'error');
      }
    } catch (error) {
      console.error('Error loading available rooms:', error);
      showMessage('Error loading available rooms. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Allocate room to participant (MANUAL SELECTION)
   * DOMAIN RULES:
   * 1. If room already allocated → SHOW the same room (never change)
   * 2. If payment is "Unpaid" → DO NOT allocate room
   * 3. Coordinator manually selects room from available rooms
   * 4. Boys and Girls MUST have separate rooms
   */
  const handleAllocateRoom = async () => {
    console.log('Allocate Room button clicked!');
    console.log('Participant:', participant);
    console.log('Selected Room Number:', selectedRoomNumber);
    
    if (!participant) {
      showMessage('No participant selected', 'error');
      return;
    }

    if (participant.paymentStatus !== 'Paid') {
      showMessage('Cannot allocate room. Payment must be marked as Paid first!', 'error');
      return;
    }

    if (!selectedRoomNumber) {
      showMessage('Please select a room number', 'error');
      return;
    }

    setLoading(true);
    try {
      console.log('Calling allocateRoom API with:', { mhid: participant.mhid, roomNumber: parseInt(selectedRoomNumber) });
      // Send roomNumber for manual allocation
      const response = await allocateRoom({ mhid: participant.mhid, roomNumber: parseInt(selectedRoomNumber) });
      console.log('Allocate Room API Response:', response);
      
      if (response.success) {
        setParticipant(response.data.participant);
        setShowRoomSelection(false);
        setSelectedRoomNumber('');
        setAvailableRooms([]);
        if (response.alreadyAllocated) {
          showMessage(`Already allocated to Room ${response.data.participant.roomNumber}`, 'info');
        } else {
          showMessage(
            `Room ${response.data.participant.roomNumber} allocated successfully! Resetting form in 3 seconds...`, 
            'success'
          );
        }
        
        // Auto-reset form after 3 seconds on successful allocation
        setTimeout(() => {
          handleReset();
          showMessage('Form reset. Ready for next participant.', 'info');
        }, 3000);
      } else {
        showMessage(response.message || 'Failed to allocate room', 'error');
      }
    } catch (error) {
      showMessage('Error allocating room. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset form
   */
  const handleReset = () => {
    setMhid(''); // Will store only the 6 digits
    setLuneenerId('');
    setName('');
    setGender('Boy');
    setContactNumber('');
    setParticipant(null);
    setIsExisting(false);
    setShowRoomSelection(false);
    setSelectedRoomNumber('');
    setAvailableRooms([]);
    setMessage({ text: '', type: '' });
  };

  return (
    <div className="checkin-container">
      <div className="checkin-card">
        <h1 className="title">Mahotsav Check-In System</h1>
        <p className="subtitle">Room Allocation & Participant Registration</p>
        
        {/* Message Display */}
        {message.text && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Two-column dashboard layout */}
        <div className="coordinator-dashboard">
          {/* LEFT PANEL: Input Form */}
          <div className="left-panel">
            <div className="panel-header">
              <h2>📝 Participant Entry</h2>
            </div>
            
            <form onSubmit={handleCreateParticipant} className="checkin-form">
          {/* Luncheon ID Search */}
          <div className="form-group">
            <label htmlFor="luneenerId">🔍 Search by Luncheon ID <span className="info-text">(Optional)</span></label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input
                type="text"
                id="luneenerId"
                value={luneenerId}
                onChange={(e) => setLuneenerId(e.target.value)}
                placeholder="e.g., MH26000266"
                disabled={loading}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={handleSearchLuneenerId}
                disabled={loading || !luneenerId.trim()}
                className="btn-check-inline"
                style={{
                  padding: '0.4rem 1rem',
                  fontSize: '0.85rem',
                  background: '#48bb78',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading || !luneenerId.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !luneenerId.trim() ? 0.6 : 1,
                  whiteSpace: 'nowrap'
                }}
              >
                {loading ? '...' : 'Search'}
              </button>
            </div>
          </div>

          {/* MHID Input */}
          <div className="form-group">
            <label htmlFor="mhid">MHID * <span className="info-text">(Format: MH26 + 6 digits)</span></label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ 
                padding: '12px 16px', 
                background: '#e2e8f0', 
                borderRadius: '8px 0 0 8px',
                fontWeight: 'bold',
                fontSize: '1rem',
                color: '#2d3748',
                border: '2px solid #cbd5e0',
                borderRight: 'none'
              }}>MH26</span>
              <input
                type="text"
                id="mhid"
                value={mhid}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setMhid(value);
                }}
                placeholder="000484"
                maxLength="6"
                disabled={loading}
                required
                style={{ paddingRight: '90px' }}
              />
              <button
                type="button"
                onClick={handleCheckMHID}
                disabled={loading || !mhid.trim()}
                className="btn-check-inline"
                style={{
                  position: 'absolute',
                  right: '5px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.85rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading || !mhid.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !mhid.trim() ? 0.6 : 1
                }}
              >
                {loading ? '...' : '🔍 Check'}
              </button>
            </div>
          </div>

          {/* Name Input */}
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                setName(value);
              }}
              placeholder="Enter full name"
              disabled={loading || isExisting}
              required
            />
          </div>

          {/* Contact Number Input */}
          <div className="form-group">
            <label htmlFor="contactNumber">Contact Number * <span className="info-text">(10 digits)</span></label>
            <input
              type="tel"
              id="contactNumber"
              value={contactNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setContactNumber(value);
              }}
              placeholder="Enter 10-digit contact number"
              maxLength="10"
              disabled={loading || isExisting}
              required
            />
          </div>

          {/* Gender Dropdown - Boys or Girls only */}
          <div className="form-group">
            <label htmlFor="gender">Gender * <span className="info-text">(Separate rooms for Boys & Girls)</span></label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              disabled={loading || isExisting}
              required
            >
              <option value="Boy">Boy</option>
              <option value="Girl">Girl</option>
            </select>
          </div>

          {/* Create Participant Button */}
          {!isExisting && (
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block"
              title="Create participant as Unpaid"
            >
              {loading ? 'Creating...' : 'Create Participant'}
            </button>
          )}

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="btn btn-secondary btn-block"
            style={{ marginTop: '0.5rem' }}
          >
            Reset Form
          </button>
        </form>
      </div>

      {/* RIGHT PANEL: Participant Details & Actions */}
      <div className="right-panel">
        {participant ? (
          <>
            {/* Participant Info Card */}
            <div className="participant-info-card">
              <h2>👤 Participant Details</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">MHID:</span>
                  <span className="info-value">{participant.mhid}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{participant.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Gender:</span>
                  <span className="info-value">{participant.gender}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Contact:</span>
                  <span className="info-value">{participant.contactNumber}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Payment:</span>
                  <span className={`status-badge status-${participant.paymentStatus.toLowerCase()}`}>
                    {participant.paymentStatus}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Allocation:</span>
                  <span className={`status-badge status-${participant.allocationStatus.toLowerCase().replace(' ', '-')}`}>
                    {participant.allocationStatus}
                  </span>
                </div>
                {participant.roomNumber && (
                  <div className="info-item highlight">
                    <span className="info-label">Room:</span>
                    <span className="info-value room-number">
                      {participant.roomNumber}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="action-buttons" style={{ marginTop: '1rem' }}>
                {participant.paymentStatus === 'Unpaid' && (
                  <button
                    type="button"
                    onClick={handleMarkPaid}
                    disabled={loading}
                    className="btn btn-warning btn-block"
                  >
                    {loading ? 'Updating...' : '💰 Mark as Paid'}
                  </button>
                )}

                {participant.allocationStatus !== 'Allocated' && participant.paymentStatus === 'Paid' && (
                  <button
                    type="button"
                    onClick={() => {
                      showMessage('Loading available rooms...', 'info');
                      handleLoadAvailableRooms();
                    }}
                    disabled={loading}
                    className="btn btn-info btn-block"
                    style={{ marginTop: '0.5rem' }}
                  >
                    {loading ? 'Loading...' : '🏢 View Available Rooms'}
                  </button>
                )}
              </div>
              </div>

            {/* Room Selection Interface */}
            {showRoomSelection && availableRooms.length > 0 && (
              <div className="room-selection-section" style={{ marginTop: '1.5rem' }}>
                <h3>🏢 Available Rooms for {participant.gender}</h3>
                <p className="info-text" style={{ marginBottom: '1rem' }}>Select a room to allocate</p>
                
                <div className="rooms-grid">
                  {availableRooms.map((room) => (
                    <div 
                      key={room.roomNumber}
                      className={`room-card ${selectedRoomNumber === room.roomNumber ? 'selected' : ''}`}
                      onClick={() => setSelectedRoomNumber(room.roomNumber)}
                    >
                      <div className="room-header">
                        <span className="room-number-large">Room {room.roomNumber}</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className={`gender-badge ${room.gender.toLowerCase()}`}>{room.gender}</span>
                          {room.block && <span className="room-block">{room.block}{room.floor ? ` • ${room.floor}` : ''}</span>}
                        </div>
                      </div>
                      <div className="room-capacity">
                        <div className="capacity-bar">
                          <div 
                            className="capacity-fill" 
                            style={{ width: `${(room.occupiedCount / room.totalCapacity) * 100}%` }}
                          />
                        </div>
                        <div className="capacity-text">
                          <span className="occupied">{room.occupiedCount}</span> / 
                          <span className="total">{room.totalCapacity}</span> occupied
                        </div>
                        <div className="available-text">
                          {room.totalCapacity - room.occupiedCount} spots available
                        </div>
                      </div>
                      {selectedRoomNumber === room.roomNumber && (
                        <div className="selected-indicator">✓ Selected</div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="button-group" style={{ marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={handleAllocateRoom}
                    disabled={loading || !selectedRoomNumber}
                    className="btn btn-success btn-block"
                  >
                    {loading ? 'Allocating...' : `✓ Allocate to Room ${selectedRoomNumber || '...'}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoomSelection(false);
                      setSelectedRoomNumber('');
                      setAvailableRooms([]);
                    }}
                    className="btn btn-secondary btn-block"
                    style={{ marginTop: '0.5rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Domain Rules */}
            <div className="rules-info" style={{ marginTop: '1.5rem' }}>
              <h3 style={{ color: '#2d3748', marginBottom: '0.75rem' }}>📋 Important Rules</h3>
              <ul style={{ color: '#2d3748' }}>
                <li style={{ color: '#2d3748' }}>✅ Payment verified manually</li>
                <li style={{ color: '#2d3748' }}>✅ Room allocation ONLY if payment is Paid</li>
                <li style={{ color: '#2d3748' }}>✅ Boy and Girl have separate rooms</li>
                <li style={{ color: '#2d3748' }}>✅ Once allocated, room NEVER changes</li>
              </ul>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <h3>👈 Enter participant details</h3>
            <p>Check existing MHID or create new participant to continue</p>
          </div>
        )}
      </div>
    </div>
      </div>
    </div>
  );
};

export default CheckInForm;
