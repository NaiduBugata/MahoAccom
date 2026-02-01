#!/bin/bash

# Production Start Script for Mahotsav Check-in System

echo "🚀 Starting Mahotsav Check-in System..."

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "❌ Error: backend/.env file not found!"
    echo "📝 Please copy backend/.env.example to backend/.env and configure it."
    exit 1
fi

# Start backend
echo "📡 Starting backend server..."
cd backend
npm install --production
node server.js &
BACKEND_PID=$!

cd ..

echo "✅ Backend started (PID: $BACKEND_PID)"
echo "📡 Backend running on http://localhost:5000"
echo ""
echo "ℹ️  To stop the server, run: kill $BACKEND_PID"
