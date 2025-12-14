# AlphaDent Backend Server - PowerShell Launcher
# Just run: .\start.ps1

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Starting AlphaDent Backend Server..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if venv exists
if (-not (Test-Path "venv\Scripts\python.exe")) {
    Write-Host "ERROR: Virtual environment not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run these commands first:" -ForegroundColor Yellow
    Write-Host "  1. python -m venv venv"
    Write-Host "  2. .\venv\Scripts\Activate.ps1"
    Write-Host "  3. pip install -r requirements.txt"
    Write-Host ""
    pause
    exit 1
}

# Start the server
Write-Host "Starting server..." -ForegroundColor Green
Write-Host ""

.\venv\Scripts\python.exe main.py
