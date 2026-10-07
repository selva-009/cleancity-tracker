@echo off
REM CleanCity Tracker — one-command start (Windows)
cd /d "%~dp0"

if not exist ".venv" (
  echo Creating virtual environment...
  python -m venv .venv
)
call .venv\Scripts\activate.bat
echo Installing dependencies...
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

echo.
echo CleanCity Tracker is starting at  http://127.0.0.1:8000
echo Demo accounts (password: demo1234): citizen / officer / worker / admin @cleancity.app
echo.
uvicorn app.main:app --host 0.0.0.0 --port 8000
