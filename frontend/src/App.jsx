import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import CheckInForm from './components/CheckInForm';
import AdminPage from './components/AdminPage';
import './App.css';

function App() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mahoaccom.onrender.com/api';
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('main');

  // Check if user is already logged in and validate token
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        
        // Validate token by making a test API call
        fetch(`${API_BASE_URL}/participants/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(res => {
          if (res.status === 401) {
            // Token expired or invalid
            console.log('Session expired. Please login again.');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
            setCurrentPage('main');
          } else {
            // Token valid, restore session
            setUser(userData);
            // Set current page based on user role
            if (userData.role === 'ADMIN') {
              setCurrentPage('admin');
            } else if (userData.role === 'COORDINATOR') {
              setCurrentPage('checkin');
            }
          }
        })
        .catch(err => {
          console.error('Error validating session:', err);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        });
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    // Navigate to appropriate page based on role
    if (userData.role === 'ADMIN') {
      setCurrentPage('admin');
    } else if (userData.role === 'COORDINATOR') {
      setCurrentPage('checkin');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('main');
  };

  // If not logged in, show login page
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <div className="app-header">
        <div className="user-info">
          {currentPage === 'admin' && (
            <button onClick={() => setCurrentPage('checkin')} className="back-btn">
              ← Back to Check-In
            </button>
          )}
          <span className="user-role">{user.role}</span>
          {currentPage !== 'admin' && <span className="user-name">{user.name}</span>}
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      {currentPage === 'checkin' ? (
        <CheckInForm 
          user={user}
          onNavigateToAdmin={() => setCurrentPage('admin')} 
        />
      ) : (
        <AdminPage 
          user={user}
          onBackToCheckIn={() => setCurrentPage('checkin')} 
        />
      )}
    </div>
  );
}

export default App;
