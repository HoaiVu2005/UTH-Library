@echo off
chcp 65001 >nul
title UTH Library - Khoi dong he thong
echo ==========================================================
echo    KHOI DONG HE THONG THU VIEN SO UTH (UTH LIBRARY)
echo ==========================================================
echo.

cd /d "%~dp0backend"

echo [1/2] Dang kiem tra va khoi dong Backend & Database...
start "UTH Backend (Django)" cmd /k ".\.venv\Scripts\activate.bat && python manage.py runserver 8000"

cd /d "%~dp0frontend"
echo [2/2] Dang khoi dong Frontend (Vite)...
start "UTH Frontend (Vite)" cmd /k "pnpm dev || npm run dev"

timeout /t 3 >nul
echo.
echo ==========================================================
echo  He thong da khoi dong thanh cong!
echo  - Frontend Web: http://localhost:5173
echo  - Backend API:  http://localhost:8000
echo ==========================================================
echo.
start http://localhost:5173
