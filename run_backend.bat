@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "PG_BIN=C:\Program Files\Odoo 17.0.20260622\PostgreSQL\bin"
set "PG_DATA=%~dp0.pgdata"

echo ==========================================================
echo    KHOI DONG BACKEND UTH LIBRARY (DJANGO + POSTGRESQL)
echo ==========================================================

:: 1. Kiem tra xem PostgreSQL da dang chay tren cong 5433 chua
"%PG_BIN%\pg_isready.exe" -h 127.0.0.1 -p 5433 -U postgres >nul 2>&1
if not errorlevel 1 (
    echo [OK] Database PostgreSQL dang hoat dong san sang tren cong 5433!
    goto start_django
)

:: 2. Neu chua chay, bat dau khoi dong PostgreSQL
echo [..] Dang khoi dong Database PostgreSQL (cong 5433)...
"%PG_BIN%\pg_ctl.exe" -D "%PG_DATA%" -o "-p 5433" start >nul 2>&1

:: 3. Cho Database hoan tat khoi dong va chap nhan ket noi
echo [..] Dang cho Database san sang chap nhan ket noi:
set /a retry=0
:wait_pg
"%PG_BIN%\pg_isready.exe" -h 127.0.0.1 -p 5433 -U postgres >nul 2>&1
if not errorlevel 1 (
    echo.
    echo [OK] Database da san sang chap nhan ket noi!
    goto start_django
)

set /a retry+=1
<nul set /p=.
if %retry% geq 35 (
    echo.
    echo [CANH BAO] Database mat nhieu thoi gian hon du kien. Tiep tuc thu bat backend...
    goto start_django
)
timeout /t 1 /nobreak >nul
goto wait_pg

:start_django
echo.
cd /d "%~dp0backend"
echo [..] Dang cap nhat co so du lieu (migrate)...
call .\.venv\Scripts\activate.bat
python manage.py migrate
echo.
echo ==========================================================
echo  [OK] Khoi dong Backend Django tren cong 8000...
echo  API Documentation: http://localhost:8000/api/docs
echo ==========================================================
python manage.py runserver 8000
