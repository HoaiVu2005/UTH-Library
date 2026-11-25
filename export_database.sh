#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "   XUAT DU LIEU DATABASE 100% HOAN CHINH - UTH LIBRARY"
echo "=========================================================="
echo ""

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR/backend"

if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
elif [ -f "../.venv/bin/activate" ]; then
    source ../.venv/bin/activate
fi

echo "Dang xuat toan bo du lieu ra backend/fixtures/backup_data.json ..."
python manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission --indent 2 -o fixtures/backup_data.json

echo ""
echo "[HOAN TAT] Du lieu da duoc xuat thanh cong vao backend/fixtures/backup_data.json!"
