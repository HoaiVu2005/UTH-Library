@echo off
chcp 65001 >nul
title UTH Library - Khoi phuc du lieu Database & UTHie AI
echo ==========================================================
echo    KHOI PHUC DU LIEU DATABASE 100%% HOAN CHINH - UTH LIBRARY
echo ==========================================================
echo.
cd /d "%~dp0backend"
call .\.venv\Scripts\activate.bat
echo [1/2] Dang chay migrate...
python manage.py migrate
echo.
echo [2/2] Dang nap toan bo database UTHie AI & Thu vien UTH (1429 doi tuong)...
python manage.py restore_ai_database
echo.
echo [HOAN TAT] He thong da dong bo du lieu giong 100%%!
pause
