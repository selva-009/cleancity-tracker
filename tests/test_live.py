"""Boot the real server in-process and verify it serves both API and UI, then screenshot."""
import os, sys, time, threading, subprocess
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uvicorn, httpx
from app.main import app
from app import db as dbmod
dbmod.init_db()

config = uvicorn.Config(app, host="127.0.0.1", port=8000, log_level="error")
server = uvicorn.Server(config)
th = threading.Thread(target=server.run, daemon=True)
th.start()

for _ in range(50):
    try:
        if httpx.get("http://127.0.0.1:8000/api/health", timeout=1).status_code == 200:
            break
    except Exception:
        time.sleep(0.2)

B = "http://127.0.0.1:8000"
print("health:", httpx.get(B + "/api/health").json())

# UI is served at root
r = httpx.get(B + "/")
print("index served:", r.status_code == 200 and "CleanCity Tracker" in r.text, "len", len(r.text))
# static asset
r = httpx.get(B + "/static/js0_api.js")
print("static asset:", r.status_code == 200)

# login + authenticated flow over real HTTP
r = httpx.post(B + "/api/auth/login", json={"email": "officer@cleancity.app", "password": "demo1234"})
tok = r.json()["token"]
H = {"Authorization": "Bearer " + tok}
print("officer reports:", httpx.get(B + "/api/reports", headers=H).status_code)
print("officer stats:", httpx.get(B + "/api/stats/officer", headers=H).json())
print("city stats:", {k: httpx.get(B + "/api/stats/city").json()[k] for k in ("reports_received", "resolution_rate", "cleanliness_score")})

# screenshots of the live UI
CH = ["google-chrome","--headless","--disable-gpu","--no-sandbox","--hide-scrollbars","--virtual-time-budget=3000"]
os.makedirs("/scratch/work/shots", exist_ok=True)
for name, url in [("live_home", B+"/#/home"), ("live_dash", B+"/#/dashboard"), ("live_signin", B+"/#/signin")]:
    subprocess.run(CH + [f"--window-size=1440,2200", f"--screenshot=/scratch/work/shots/{name}.png", url],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
print("screenshots done")

server.should_exit = True
print("OK")
