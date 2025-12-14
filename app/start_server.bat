@echo off
REM Simple launcher - works just like Flask
cd /d "%~dp0"
echo Starting AlphaDent Backend Server...
echo.
if not exist "venv\Scripts\python.exe" (
    echo Error: Virtual environment not found!
    echo Please run: python -m venv venv
    pause
    exit /b 1
)
venv\Scripts\python.exe main.py

