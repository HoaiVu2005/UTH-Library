@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Dang kiem tra Database PostgreSQL...
"C:\Program Files\Odoo 17.0.20260622\PostgreSQL\bin\pg_ctl.exe" -D "%~dp0.pgdata" -o "-p 5433" -s -W start >nul 2>&1
cd backend
echo Khoi dong Backend Django (cong 8000)...
.\.venv\Scripts\activate.bat && python manage.py runserver 8000
