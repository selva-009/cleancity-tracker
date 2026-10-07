#!/usr/bin/env bash
# CleanCity Tracker — one-command start (macOS / Linux)
set -e
cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
  echo "Creating virtual environment…"
  python3 -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate
echo "Installing dependencies…"
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

echo ""
echo "CleanCity Tracker is starting at  http://127.0.0.1:8000"
echo "Demo accounts (password: demo1234):"
echo "  citizen  selva@cleancity.app"
echo "  officer  officer@cleancity.app"
echo "  worker   worker@cleancity.app"
echo "  admin    admin@cleancity.app"
echo ""
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
