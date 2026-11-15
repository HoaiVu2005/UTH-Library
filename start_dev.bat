@echo off
chcp 65001 >nul
title UTH Library - Khoi dong he thong
echo ==========================================================
echo    KHOI DONG HE THONG THU VIEN SO UTH (UTH LIBRARY)
echo ==========================================================
echo.

echo [1/3] Dang khoi dong Database PostgreSQL (neu chua bat)...
"C:\Program Files\Odoo 17.0.20260622\PostgreSQL\bin\pg_ctl.exe" -D "%~dp0.pgdata" -o "-p 5433" -s -W start >nul 2>&1

cd /d "%~dp0backend"
echo [2/3] Dang khoi dong Backend Django (cong 8000)...
start "UTH Backend (Django)" cmd /k ".\.venv\Scripts\activate.bat && python manage.py runserver 8000"

cd /d "%~dp0frontend"
echo [3/3] Dang khoi dong Frontend Vite (cong 5173)...
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

