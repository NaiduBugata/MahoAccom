# Mahotsav Check-in System - Production Deployment Guide

## 🚀 Deployment Status
- **Frontend:** Vercel - https://accom-new.vercel.app
- **Backend:** Render - https://newaccom.onrender.com

## ✅ Production Ready Checklist

### Backend (Render)
1. ✅ Environment variables configured
2. ✅ CORS setup for Vercel frontend
3. ✅ MongoDB connection
4. ✅ Health check endpoint: `/api/health`
5. ✅ Error handling
6. ✅ Security headers
7. ✅ Rate limiting on auth

### Frontend (Vercel)
1. ✅ Environment variables set
2. ✅ Backend API URL configured
3. ✅ Build optimization
4. ✅ SPA routing configuration

## 📋 Deployment Steps

### Backend Deployment (Render)
1. Push code to GitHub
2. Go to Render dashboard
3. Create new Web Service
4. Connect GitHub repository
5. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     - `NODE_ENV=production`
     - `PORT=5000`
     - `MONGODB_URI=<your-mongodb-uri>`
     - `JWT_SECRET=<your-secret>`
     - `FRONTEND_URL=https://accom-new.vercel.app`
6. Deploy

### Frontend Deployment (Vercel)
1. Push code to GitHub
2. Go to Vercel dashboard
3. Import project from GitHub
4. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variables:**
     - `VITE_API_BASE_URL=https://newaccom.onrender.com/api`
     - `VITE_NODE_ENV=production`
5. Deploy

## 🔧 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://...
NODE_ENV=production
JWT_SECRET=your_secret_key
FRONTEND_URL=https://accom-new.vercel.app
```

### Frontend (.env)
```
VITE_API_BASE_URL=https://newaccom.onrender.com/api
VITE_NODE_ENV=production
```

## 🧪 Testing After Deployment
1. Check backend health: https://newaccom.onrender.com/api/health
2. Test frontend: https://accom-new.vercel.app
3. Verify CORS by checking browser console
4. Test login functionality
5. Test participant check-in flow

## 🔒 Security Features
- CORS restricted to specific origins
- Rate limiting on login endpoint (5 attempts per 15 minutes)
- JWT authentication
- Security headers (XSS, clickjacking protection)
- Request size limits to prevent DOS
- Password hashing with bcrypt

## 📊 API Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/participants/check` - Check MHID
- `POST /api/participants/create` - Create participant
- `PUT /api/participants/payment` - Update payment
- `POST /api/participants/allocate` - Allocate room
- `GET /api/rooms` - Get all rooms
- `GET /api/export/participants` - Export participants to Excel

## 🛠️ Local Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## 📝 Notes
- Render free tier may sleep after 15 minutes of inactivity
- First request after sleep may take 30-60 seconds
- MongoDB Atlas has IP whitelist - ensure 0.0.0.0/0 for cloud deployment
- Vercel automatically handles HTTPS
- Frontend .env is committed for Vercel build-time variables

## 🚨 Troubleshooting

### CORS Error
- Verify `FRONTEND_URL` is set correctly on Render
- Check browser console for actual frontend URL
- Ensure no trailing slash in URLs

### Network Error
- Check backend is running: https://newaccom.onrender.com/api/health
- Verify environment variables on both platforms
- Check MongoDB connection string is correct

### Build Failures
- Ensure Node version compatibility (v18+)
- Check all dependencies are in package.json
- Verify build commands are correct
