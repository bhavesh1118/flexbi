# Backend Server Setup Guide

## Issue: Connection Refused Error

If you're seeing this error in your browser console:
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
:3001/api/alerts:1 Failed to load resource: net::ERR_CONNECTION_REFUSED
```

This means your backend server is not running. Here's how to fix it:

## Solution 1: Start the Server (Recommended)

### Option A: Using the Batch File (Windows)
1. Double-click `start-server.bat` in the project folder
2. The server will start and show: "Backend running on http://localhost:3001"
3. Keep this window open while using the application

### Option B: Using PowerShell
1. Right-click `start-server.ps1` and select "Run with PowerShell"
2. The server will start and show: "Backend running on http://localhost:3001"
3. Keep this window open while using the application

### Option C: Manual Command
1. Open Command Prompt or PowerShell
2. Navigate to the project folder: `cd C:\Users\user\Downloads\codeofy-linktree\project`
3. Run: `node server.js`
4. You should see: "Backend running on http://localhost:3001"

## Solution 2: Check for Port Conflicts

If you get an error about port 3001 being in use:

1. Run: `node test-port.js`
2. If port is busy, find what's using it:
   - Windows: `netstat -ano | findstr :3001`
   - Then kill the process: `taskkill /PID <PID> /F`

## Solution 3: Install Dependencies

If you get module not found errors:

1. Run: `npm install`
2. This will install Express, CORS, and other required packages

## What the Backend Provides

The server provides these API endpoints:
- `POST /api/alerts` - Save alert configurations
- `GET /api/alerts` - Retrieve saved alerts
- `POST /api/save-dashboard` - Save dashboard views
- `GET /api/load-dashboard` - Load saved dashboard views
- `POST /api/analyze` - Data analysis queries
- `POST /api/forecast` - Time series forecasting

## Troubleshooting

### Server won't start?
- Check if Node.js is installed: `node --version`
- Make sure you're in the correct directory
- Check for syntax errors: `node -c server.js`

### Still getting connection refused?
- Make sure the server is actually running
- Check if your firewall is blocking port 3001
- Try a different port by editing `server.js` line 135

### Browser extension errors?
- The `content-all.js` errors are from browser extensions, not your app
- These can be ignored or disabled in your browser

## Quick Start Checklist

- [ ] Navigate to project folder
- [ ] Run `node server.js`
- [ ] See "Backend running on http://localhost:3001"
- [ ] Refresh your browser
- [ ] Check browser console for "✅ Backend connected successfully"

## Need Help?

If you're still having issues:
1. Check the terminal/command prompt for error messages
2. Make sure no other application is using port 3001
3. Try restarting your computer
4. Check if Node.js is properly installed
