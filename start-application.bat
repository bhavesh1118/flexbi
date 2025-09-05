@echo off
title FlexBI Analytics Platform - Startup
color 0A

echo.
echo ========================================
echo    FlexBI Analytics Platform
echo ========================================
echo.
echo Starting backend server...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Starting backend server on port 3001...
echo.
echo IMPORTANT: Keep this window open while using the application!
echo.
echo The backend server will be available at: http://localhost:3001
echo.
echo To start the frontend:
echo 1. Open a NEW terminal/command prompt
echo 2. Navigate to this folder: cd %CD%
echo 3. Run: npm run dev
echo 4. Open your browser to the URL shown (usually http://localhost:5173)
echo.
echo ========================================
echo.

REM Start the backend server
node server.js

echo.
echo Backend server stopped.
pause
