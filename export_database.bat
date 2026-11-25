@echo off
chcp 65001 >nul
title UTH Library - Xuat du lieu Database & UTHie AI
echo ==========================================================
echo    XUAT DU LIEU DATABASE 100%% HOAN CHINH - UTH LIBRARY
echo ==========================================================
echo.
cd /d "%~dp0backend"
call .\.venv\Scripts\activate.bat
echo Dang xuat toan bo du lieu ra backend/fixtures/backup_data.json ...
python manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission --indent 2 -o fixtures/backup_data.json
echo.
echo [HOAN TAT] Du lieu da duoc xuat thanh cong vao backend/fixtures/backup_data.json!
pause
