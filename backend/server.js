// Mahotsav Check-in and Allocation System - Backend Server
// Production-quality Express server with MongoDB

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const participantRoutes = require('./routes/participantRoutes');
const roomRoutes = require('./routes/roomRoutes');
const exportRoutes = require('./routes/exportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security Middleware
// 1. CORS - Restrict to specific origin in production
const allowedOrigins = (process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',') 
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:4173'])
  .map(o => o.trim().replace(/\/$/, ''));

if (process.env.NODE_ENV === 'production') {
  console.log('🔐 CORS allowed origins:', allowedOrigins);
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests
    if (!origin) return callback(null, true);

    // Temporary override to allow all origins
    if (process.env.ALLOW_ALL_ORIGINS === 'true') return callback(null, true);

    const normalized = origin.replace(/\/$/, '');
    const isAllowed = allowedOrigins.includes(normalized)
      || process.env.NODE_ENV === 'development'
      || (process.env.ALLOW_VERCEL_PREVIEWS === 'true' && /\.vercel\.app$/i.test(new URL(normalized).host));

    if (isAllowed) return callback(null, true);
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ CORS blocked origin:', normalized);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// 2. Body parser with size limits to prevent DOS attacks
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));

// 3. Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// 4. Rate limiting for auth endpoints
const loginAttempts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

app.use('/api/auth/login', (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!loginAttempts.has(ip)) {
    loginAttempts.set(ip, []);
  }
  
  const attempts = loginAttempts.get(ip).filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (attempts.length >= MAX_ATTEMPTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again later.'
    });
  }
  
  attempts.push(now);
  loginAttempts.set(ip, attempts);
  next();
});

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/export', exportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mahotsav API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Mahotsav Check-in and Allocation System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      check: 'POST /api/participants/check',
      create: 'POST /api/participants/create',
      payment: 'PUT /api/participants/payment',
      allocate: 'POST /api/participants/allocate'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Display appropriate URL based on environment
  if (process.env.NODE_ENV === 'production') {
    console.log(`📡 API available at https://mahoaccom.onrender.com`);
  } else {
    console.log(`📡 API available at http://localhost:${PORT}`);
  }
});

module.exports = app;
