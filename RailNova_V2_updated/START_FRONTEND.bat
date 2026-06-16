@echo off
title RailNova Frontend
echo ========================================
echo   RailNova Frontend Starting...
echo ========================================
cd /d "%~dp0frontend"
echo Installing npm packages (first time takes 2-3 min)...
npm install
echo.
echo Starting React app...
npm start
pause
