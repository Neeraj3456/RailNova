@echo off
title RailNova Backend
echo ========================================
echo   RailNova Backend Starting...
echo ========================================
cd /d "%~dp0backend"
echo Installing requirements...
pip install flask flask-cors
echo.
echo Starting backend server...
echo Admin Login: admin@railnova.com / admin123
echo.
python app.py
pause
