@echo off
REM Change directory to the script location (project root)
cd /d "%~dp0"

REM Start the Vite dev server in a new cmd window
start "Vite Dev" cmd /k "npm run dev"

REM Wait briefly for the dev server to start (adjust seconds if needed)
timeout /t 2 /nobreak >nul

REM Open the default browser to the Vite dev URL
start "" "http://localhost:5173"

exit /b 0
