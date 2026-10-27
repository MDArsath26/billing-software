@echo off
echo ==========================================
echo      Starting Billing Software...
echo ==========================================

:: 1. Start Backend in a new window
echo Starting Backend Server...
cd backend
start "Billing Backend" cmd /k "python manage.py runserver"
cd ..

:: 2. Start Frontend in a new window
echo Starting Frontend Server...
cd frontend
start "Billing Frontend" cmd /k "npm run dev"

:: 3. Open Browser (give it a few seconds to start)
timeout /t 5
start http://localhost:5173

echo.
echo Application is running!
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
echo Close the popup command windows to stop the servers.
pause
