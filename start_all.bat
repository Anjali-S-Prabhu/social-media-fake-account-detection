@echo off
title Launch FADE Platform
echo ========================================================
echo Launching FADE Machine Learning Backend and Frontend UI
echo ========================================================
echo.
start "FADE Backend (Port 8000)" cmd /k "cd /d %~dp0backend && .\venv\Scripts\python.exe run.py"
timeout /t 2 /nobreak >nul
start "FADE Frontend (Port 5173)" cmd /k "cd /d %~dp0 && npm.cmd run dev"
echo.
echo Both servers launched in separate windows!
echo - Web App: http://localhost:5173 or http://localhost:8000
echo - API Docs: http://localhost:8000/docs
echo.
pause

