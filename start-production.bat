@echo off
REM Production Start Script for Mahotsav Check-in System (Windows)

echo.
echo ========================================
echo   Mahotsav Check-in System - Production
echo ========================================
echo.

REM Check if .env exists
if not exist "backend\.env" (
    echo [ERROR] backend\.env file not found!
    echo Please copy backend\.env.example to backend\.env and configure it.
    pause
    exit /b 1
)

echo [1/2] Starting backend server...
cd backend
start "Mahotsav Backend" cmd /k "npm install --production && node server.js"
cd ..

echo.
echo ========================================
echo   Backend running on http://localhost:5000
echo ========================================
echo.
echo Press any key to exit (backend will keep running)...
pause > nul
