@echo off
title FADE Backend API Server
echo Starting FADE Machine Learning Backend on http://localhost:8000 ...
cd /d "%~dp0backend"
".\venv\Scripts\python.exe" run.py
pause

