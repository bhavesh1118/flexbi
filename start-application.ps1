Write-Host "========================================" -ForegroundColor Green
Write-Host "    FlexBI Analytics Platform" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Starting backend server..." -ForegroundColor Yellow
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ERROR: Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "Starting backend server on port 3001..." -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Keep this window open while using the application!" -ForegroundColor Yellow
Write-Host ""
Write-Host "The backend server will be available at: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the frontend:" -ForegroundColor White
Write-Host "1. Open a NEW terminal/command prompt" -ForegroundColor White
Write-Host "2. Navigate to this folder: cd $PWD" -ForegroundColor White
Write-Host "3. Run: npm run dev" -ForegroundColor White
Write-Host "4. Open your browser to the URL shown (usually http://localhost:5173)" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Start the backend server
node server.js

Write-Host ""
Write-Host "Backend server stopped." -ForegroundColor Yellow
Read-Host "Press Enter to exit"
