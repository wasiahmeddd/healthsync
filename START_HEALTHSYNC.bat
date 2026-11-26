@echo off
setlocal
title HealthSync - Connected Healthcare Platform
color 0B
cls

echo ===============================================================================
echo                HEALTHSYNC - CONNECTED HEALTHCARE PLATFORM
echo          Full Stack Development Project - Presentation One-Click Runner
echo ===============================================================================
echo.

:: Ensure current working directory is the project directory (handles spaces like '3rd sem')
cd /d "%~dp0"

echo  [*] Current Folder: "%~dp0"
echo.

:: 1. Check Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not found in your system PATH!
    echo Please install Python 3.10 or higher.
    echo.
    pause
    exit /b 1
)

:: 2. Check Node / npm
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js / npm is not found in your system PATH!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo  [+] Python and Node.js detected.
echo.

:: 3. Clear ports 8000 and 5173 if currently occupied
echo  [*] Checking and clearing ports 8000 and 5173...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: 4. Start Python FastAPI Backend on Port 8000
echo  [1/2] Starting HealthSync Python Backend on http://127.0.0.1:8000 ...
start "HealthSync-Backend" cmd /k "title HealthSync-Backend && cd /d ""%~dp0"" && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

:: 5. Brief pause for backend database initialization
ping 127.0.0.1 -n 3 >nul

:: 6. Start React Frontend on Port 5173
echo  [2/2] Starting HealthSync React Frontend on http://localhost:5173 ...
start "HealthSync-Frontend" cmd /k "title HealthSync-Frontend && cd /d ""%~dp0"" && npm run dev"

:: 7. Brief pause then open default browser
ping 127.0.0.1 -n 3 >nul
echo.
echo  [+] Launching HealthSync in your default browser...
start http://localhost:5173

cls
echo ===============================================================================
echo                HEALTHSYNC IS RUNNING SUCCESSFULLY!
echo ===============================================================================
echo.
echo   - React Frontend:     http://localhost:5173
echo   - FastAPI Backend:    http://127.0.0.1:8000
echo   - Swagger API Docs:   http://127.0.0.1:8000/docs
echo   - Database PDF Spec:  healthsync_database_queries.pdf
echo.
echo ===============================================================================
echo                     PRESENTATION DEMO CHEAT SHEET
echo ===============================================================================
echo   All Accounts Password: password123
echo.
echo   [1] HOSPITAL ADMIN:   reception@bmsce.edu
echo       Features: Admissions Desk, Register Patient (QR Code), Appointments
echo.
echo   [2] DOCTOR PORTAL:    dr.priya@healthsync.com  (Cardiologist)
echo                         dr.sneha@healthsync.com  (Pulmonologist)
echo                         dr.arjun@healthsync.com  (Second Opinion Surgeon)
echo       Features: Queue, Rx Builder, Simulated OCR Scanner, Auto Pharmacy Dispatch
echo.
echo   [3] PATIENT PORTAL:   rahul@gmail.com          (Rahul Verma, ID: ML-PAT-1001)
echo                         ananya.rao@gmail.com     (Ananya Rao, ID: ML-PAT-1002)
echo       Features: Privacy Center (Approve/Deny/Revoke), Dynamic Charts, Reminders
echo.
echo   [4] PHARMACIST:       pharmacy.apollo@healthsync.com
echo       Features: Live Rx Queue, Mark Ready (Token #), Dispense, Stock Toggles
echo ===============================================================================
echo.
echo  Press [1] to Re-open Frontend in Browser
echo  Press [2] to Open Swagger API Documentation
echo  Press [3] to Open Database SQL Specification PDF
echo  Press [Q] to Stop All Servers and Exit
echo.

:MENU
choice /C 123Q /N /M "Choose an option [1, 2, 3, Q]: "
if errorlevel 4 goto QUIT
if errorlevel 3 goto OPEN_PDF
if errorlevel 2 goto OPEN_DOCS
if errorlevel 1 goto OPEN_FE
goto MENU

:OPEN_FE
start http://localhost:5173
goto MENU

:OPEN_DOCS
start http://127.0.0.1:8000/docs
goto MENU

:OPEN_PDF
start "" "healthsync_database_queries.pdf"
goto MENU

:QUIT
echo.
echo Stopping servers...
taskkill /FI "WINDOWTITLE eq HealthSync-Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq HealthSync-Frontend*" /T /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :8000 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :5173 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
echo.
echo All HealthSync servers stopped. Good luck with your presentation!
ping 127.0.0.1 -n 3 >nul
exit /b 0
