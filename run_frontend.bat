@echo off
title FADE Frontend React App
echo Starting FADE Frontend on http://localhost:5173 ...
cd /d "%~dp0"
call npm.cmd run dev
pause

