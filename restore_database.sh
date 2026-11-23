#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "   KHOI PHUC DU LIEU DATABASE 100% HOAN CHINH - UTH LIBRARY"
echo "=========================================================="
echo ""

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR/backend"

if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
fi

echo "[1/2] Dang chay migrate..."
python manage.py migrate

echo ""
echo "[2/2] Dang nap toan bo database UTHie AI & Thu vien UTH (1429 doi tuong)..."
python manage.py restore_ai_database

echo ""
echo "[HOAN TAT] He thong da dong bo du lieu giong 100%!"
