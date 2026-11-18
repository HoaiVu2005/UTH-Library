@echo off
chcp 65001 >nul
title UTH Library - Khoi dong he thong
echo ==========================================================
echo    KHOI DONG HE THONG THU VIEN SO UTH (UTH LIBRARY)
echo ==========================================================
echo.

set "PG_BIN=C:\Program Files\Odoo 17.0.20260622\PostgreSQL\bin"
set "PG_DATA=%~dp0.pgdata"

echo [1/3] Dang kiem tra Database PostgreSQL (cong 5433)...

:: 1. Kiem tra xem PostgreSQL da dang chay tren cong 5433 chua
"%PG_BIN%\pg_isready.exe" -h 127.0.0.1 -p 5433 -U postgres >nul 2>&1
if not errorlevel 1 (
    echo [OK] Database PostgreSQL da san sang!
    goto start_services
)

:: 2. Neu chua chay, khoi dong PostgreSQL
echo [..] Dang khoi dong Database PostgreSQL (cong 5433)...
"%PG_BIN%\pg_ctl.exe" -D "%PG_DATA%" -o "-p 5433" start >nul 2>&1

:: 3. Cho Database san sang
echo [..] Cho Database san sang chap nhan ket noi:
set /a retry=0
:wait_pg
"%PG_BIN%\pg_isready.exe" -h 127.0.0.1 -p 5433 -U postgres >nul 2>&1
if not errorlevel 1 (
    echo.
    echo [OK] Database da san sang!
    goto start_services
)

set /a retry+=1
<nul set /p=.
if %retry% geq 35 (
    echo.
    echo [CANH BAO] Database mat nhieu thoi gian hon du kien. Tiep tuc khoi dong he thong...
    goto start_services
)
timeout /t 1 /nobreak >nul
goto wait_pg

:start_services
echo.
cd /d "%~dp0backend"
echo [2/3] Dang cap nhat migration va khoi dong Backend Django (cong 8000)...
start "UTH Backend (Django)" cmd /k ".\.venv\Scripts\activate.bat && python manage.py migrate && python manage.py runserver 8000"

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
