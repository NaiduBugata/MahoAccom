# Mahotsav Check-in and Room Allocation System

A production-ready MERN stack application for managing college Mahotsav participant check-in and room allocation with MongoDB Atlas cloud database.

## 🌟 Features

- ✅ **Participant Management**: MHID-based check-in system
- ✅ **Two-Column Dashboard**: Modern UI with form on left, details on right
- ✅ **Payment Tracking**: Manual payment status verification
- ✅ **Room Allocation**: Gender-based automatic room assignment
- ✅ **Admin Dashboard**: View rooms, participants, and edit details
- ✅ **Role-Based Access**: Admin and Coordinator roles
- ✅ **Cloud Database**: MongoDB Atlas for scalability

## 🚀 Tech Stack

- **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose)
- **Frontend**: React 18, Vite 5
- **Authentication**: JWT with role-based access control
- **Styling**: CSS with modern gradients and responsive design

## 📦 Quick Start

### 1. Clone and Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# Backend configuration
cd backend
cp .env.example .env
# Edit .env with your MongoDB Atlas credentials
```

**Required Environment Variables** (backend/.env):
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mahotsav
NODE_ENV=production
JWT_SECRET=your_secret_key_here
```

### 3. Initialize Database

```bash
cd backend

# Create admin and coordinator users
node createUsers.js

# Seed rooms (optional)
node seedRooms.js

# Seed sample participants (optional)
node seedParticipants.js
```

**Default Credentials:**
- **Admin**: Username: `AdminAccomodation`, Password: `Accomahotsav2K26`
- **Coordinator**: Username: `AccomCoordinator`, Password: `AccomCoord@2026`

### 4. Start Development Servers

```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Start frontend
cd frontend
npm run dev
```

**Application URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🏭 Production Deployment

### Option 1: Using Start Script (Windows)

```bash
# Double-click or run:
start-production.bat
```

### Option 2: Manual Production Build

```bash
# Build frontend for production
cd frontend
npm run build

# Serve frontend build (use nginx, Apache, or Node static server)

# Start backend in production mode
cd backend
npm install --production
node server.js
```

### Environment Variables for Production

Update `backend/.env`:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://your_production_cluster
JWT_SECRET=strong_random_secret_key
PORT=5000
```

## 📋 Core Business Rules

1. **MHID System**: Participants come with existing MHID (format: MH26 + 6 digits)
2. **Payment Verification**: Manual status update after payment proof verification
3. **Allocation Rules**:
   - Only PAID participants can be allocated rooms
   - Gender-based room separation (Boys/Girls)
   - Once allocated, room assignment is permanent
4. **Data Integrity**: Re-checking MHID returns consistent stored data

## 🎯 User Flows

### Coordinator Workflow
1. Enter participant MHID → Check if exists
2. If new → Create participant (auto status: Unpaid)
3. Mark as Paid after verifying payment
4. View available rooms by gender
5. Allocate room to participant

### Admin Workflow
1. Login to admin dashboard
2. View all rooms and statistics
3. View participants in each room
4. Edit participant details (name, contact, payment status)
5. Export data to Excel

## 🗂️ Project Structure

```
mahotsav-checkin/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Login & auth logic
│   │   ├── participantController.js
│   │   ├── roomController.js
│   │   └── exportController.js
│   ├── middleware/
│   │   └── auth.js              # JWT verification
│   ├── models/
│   │   ├── User.js              # Admin/Coordinator
│   │   ├── Participant.js       # Check-in data
│   │   └── Room.js              # Room management
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── participantRoutes.js
│   │   ├── roomRoutes.js
│   │   └── exportRoutes.js
│   ├── createUsers.js           # User seeding script
│   ├── seedRooms.js            # Room seeding script
│   ├── seedParticipants.js     # Sample data script
│   └── server.js               # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginPage.jsx    # Authentication
│   │   │   ├── CheckInForm.jsx  # Coordinator dashboard
│   │   │   └── AdminPage.jsx    # Admin dashboard
│   │   ├── services/
│   │   │   ├── api.js          # Participant API calls
│   │   │   └── roomApi.js      # Room API calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── index.html
│
├── .gitignore
├── README.md
└── start-production.bat         # Production start script
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login (returns JWT)

### Participants
- `POST /api/participants/check` - Check if MHID exists
- `POST /api/participants/create` - Create new participant
- `PUT /api/participants/payment` - Update payment status
- `POST /api/participants/allocate` - Allocate room
- `PUT /api/participants/:mhid` - Update participant details (Admin)

### Rooms
- `GET /api/rooms/stats` - Get room statistics
- `GET /api/rooms/available/:gender` - Get available rooms by gender
- `GET /api/rooms/participants/:roomNumber` - Get room participants
- `POST /api/rooms/create` - Create new room (Admin)
- `DELETE /api/rooms/:roomNumber` - Delete room (Admin)

### Export
- `GET /api/export/participants` - Export participants to Excel

## 🎨 Features Highlights

### Two-Column Coordinator Dashboard
- **Left Panel**: Participant entry form (sticky)
- **Right Panel**: Details, actions, room selection

### Admin Dashboard
- View all rooms with capacity tracking
- Click to see room participants
- Edit participant details inline
- Export data to Excel
- Room statistics overview

### Security Features
- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- CORS protection
- Request validation

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if MongoDB Atlas connection string is correct
# Verify .env file exists in backend folder
# Check if port 5000 is available
```

### Frontend can't connect to backend
```bash
# Ensure backend is running on port 5000
# Check CORS configuration in server.js
# Verify API base URL in frontend/src/services/api.js
```

### Database connection issues
```bash
# Verify MongoDB Atlas credentials
# Check network access in Atlas dashboard
# Ensure IP is whitelisted in Atlas
```

## 📝 License

MIT License - Feel free to use for your college events!

## 🤝 Contributing

This is a production-ready system for Mahotsav 2026. For issues or improvements, please document changes clearly.

---

**Built with ❤️ for Mahotsav 2026**
